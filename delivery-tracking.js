/* =========================================================
   PIUS MEDICAL ACCESSORIES
   DELIVERY TRACKING
   delivery-tracking.js
========================================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

const trackingContent =
    document.getElementById("trackingContent");

const backBtn =
    document.getElementById("backBtn");


/* =========================================================
   ORDER ID
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    params.get("id");


/* =========================================================
   MAP
========================================================= */

let trackingMap = null;

let trackingMarker = null;


/* =========================================================
   TRACKING LISTENERS
========================================================= */

let stopOrderListener = null;

let stopHistoryListener = null;


/* =========================================================
   BACK BUTTON
========================================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            if (history.length > 1) {

                history.back();

            } else {

                window.location.href =
                    "orders.html";

            }

        }
    );

}


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        if (!orderId) {

            showError(
                "Missing Order",
                "No order was selected for tracking."
            );

            return;

        }


        await startTracking(
            user,
            orderId
        );

    }
);


/* =========================================================
   START REAL-TIME TRACKING
========================================================= */

async function startTracking(
    user,
    id
) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                id
            );


        /* -----------------------------------------------------
           INITIAL SECURITY / EXISTENCE CHECK
        ----------------------------------------------------- */

        const initialSnapshot =
            await getDoc(
                orderRef
            );


        if (!initialSnapshot.exists()) {

            showError(
                "Order Not Found",
                "We could not find this order."
            );

            return;

        }


        const initialData =
            initialSnapshot.data();


        /* -----------------------------------------------------
           MAKE SURE THE ORDER BELONGS TO THE USER
        ----------------------------------------------------- */

        if (
            initialData.userId !==
            user.uid
        ) {

            showError(
                "Access Denied",
                "You do not have permission to view this order."
            );

            return;

        }


        /* -----------------------------------------------------
           RENDER INITIAL DATA
        ----------------------------------------------------- */

        renderTracking(
            id,
            initialData
        );


        /* -----------------------------------------------------
           REAL-TIME ORDER LISTENER
           
           Any admin update to the order document
           will automatically update the customer page.
        ----------------------------------------------------- */

        if (stopOrderListener) {

            stopOrderListener();

        }


        stopOrderListener =
            onSnapshot(
                orderRef,
                (snapshot) => {

                    if (!snapshot.exists()) {

                        showError(
                            "Order Removed",
                            "This order is no longer available."
                        );

                        return;

                    }


                    const data =
                        snapshot.data();


                    /* -----------------------------------------
                       SECURITY CHECK
                    ----------------------------------------- */

                    if (
                        data.userId !==
                        user.uid
                    ) {

                        showError(
                            "Access Denied",
                            "You do not have permission to view this order."
                        );

                        return;

                    }


                    /* -----------------------------------------
                       UPDATE PAGE
                    ----------------------------------------- */

                    renderTracking(
                        id,
                        data
                    );


                    /* -----------------------------------------
                       UPDATE TRACKING HISTORY
                    ----------------------------------------- */

                    startTrackingHistoryListener(
                        id
                    );

                },
                (error) => {

                    console.error(
                        "Tracking listener error:",
                        error
                    );


                    showError(
                        "Tracking Unavailable",
                        "We could not keep the delivery information updated."
                    );

                }
            );


        /* -----------------------------------------------------
           START HISTORY LISTENER
        ----------------------------------------------------- */

        startTrackingHistoryListener(
            id
        );


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        showError(
            "Unable to Load Tracking",
            "Please try again later."
        );

    }

}


/* =========================================================
   RENDER TRACKING
========================================================= */

function renderTracking(
    id,
    order
) {

    const rawStatus =
        String(
            order.status ||
            "Pending"
        );


    const status =
        normalizeStatus(
            rawStatus
        );


    const trackingNumber =
        order.trackingNumber ||
        order.trackingId ||
        order.tracking ||
        "Not assigned yet";


    const carrier =
        order.carrier ||
        order.deliveryCompany ||
        order.shippingCarrier ||
        "Not assigned yet";


    const location =
        order.currentLocation ||
        order.location ||
        order.lastLocation ||
        "Location not available yet";


    const estimatedDelivery =
        order.estimatedDelivery ||
        order.estimatedDeliveryDate ||
        order.deliveryDate ||
        null;


    const deliveryNote =
        order.deliveryNote ||
        order.trackingMessage ||
        order.deliveryMessage ||
        getDefaultMessage(
            status
        );


    const lastUpdated =
        order.lastUpdated ||
        order.updatedAt ||
        order.trackingUpdatedAt ||
        null;


    const latitude =
        getNumber(
            order.latitude ??
            order.lat
        );


    const longitude =
        getNumber(
            order.longitude ??
            order.lng ??
            order.lon
        );


    trackingContent.innerHTML = `

        <!-- =================================================
             LIVE BAR
        ================================================== -->

        <div class="live-bar">

            <div class="live-status">

                <span class="live-dot"></span>

                <span>
                    LIVE • Updating automatically
                </span>

            </div>


            <div class="last-updated">

                Last updated:
                ${formatDateTime(lastUpdated)}

            </div>

        </div>


        <!-- =================================================
             ORDER SUMMARY
        ================================================== -->

        <section class="order-summary">

            <div class="summary-top">

                <div>

                    <div class="summary-label">
                        Order Number
                    </div>

                    <div class="order-number">
                        #${escapeHTML(id)}
                    </div>

                </div>


                <div
                    class="status-badge status-${escapeHTML(status)}"
                >

                    ${escapeHTML(
                        formatStatus(rawStatus)
                    )}

                </div>

            </div>


            <div class="summary-grid">


                <div class="summary-item">

                    <i class="fa-solid fa-barcode"></i>

                    <span>
                        Tracking Number
                    </span>

                    <strong>
                        ${escapeHTML(
                            trackingNumber
                        )}
                    </strong>

                </div>


                <div class="summary-item">

                    <i class="fa-solid fa-truck"></i>

                    <span>
                        Carrier
                    </span>

                    <strong>
                        ${escapeHTML(
                            carrier
                        )}
                    </strong>

                </div>


                <div class="summary-item">

                    <i class="fa-solid fa-calendar-check"></i>

                    <span>
                        Estimated Delivery
                    </span>

                    <strong>
                        ${formatDeliveryDate(
                            estimatedDelivery
                        )}
                    </strong>

                </div>


            </div>

        </section>


        <!-- =================================================
             CURRENT DELIVERY UPDATE
        ================================================== -->

        <section class="tracking-message">

            <div class="message-header">

                <div class="message-icon">

                    <i class="fa-solid fa-location-crosshairs"></i>

                </div>


                <h3>
                    Current Delivery Update
                </h3>

            </div>


            <p>
                ${escapeHTML(
                    deliveryNote
                )}
            </p>

        </section>


        <!-- =================================================
             MAP
        ================================================== -->

        <section class="map-card">

            <div class="section-title">

                <i class="fa-solid fa-map-location-dot"></i>

                <h2>
                    Live Location
                </h2>

            </div>


            <div class="map-wrapper">

                <div
                    id="trackingMap"
                ></div>


                <div
                    id="mapPlaceholder"
                    class="map-placeholder"
                >

                    <i class="fa-solid fa-location-dot"></i>

                    <h3>
                        Live location unavailable
                    </h3>

                    <p>
                        The delivery location will appear
                        here when live location coordinates
                        are provided by your delivery system.
                    </p>

                </div>

            </div>


            <div class="location-info">

                <i class="fa-solid fa-location-dot"></i>

                <div>

                    <span>
                        Current Location
                    </span>

                    <strong>
                        ${escapeHTML(
                            location
                        )}
                    </strong>

                </div>

            </div>

        </section>


        <!-- =================================================
             DELIVERY PROGRESS
        ================================================== -->

        <section class="progress-card">

            <div class="section-title">

                <i class="fa-solid fa-route"></i>

                <h2>
                    Delivery Progress
                </h2>

            </div>


            <div
                class="timeline"
                id="timeline"
            >

                ${createTimeline(
                    status,
                    order
                )}

            </div>

        </section>


        <!-- =================================================
             ESTIMATED DELIVERY
        ================================================== -->

        <section class="delivery-card">

            <div class="section-title">

                <i class="fa-solid fa-clock"></i>

                <h2>
                    Estimated Delivery
                </h2>

            </div>


            <div class="delivery-box">

                <div class="delivery-icon">

                    <i class="fa-solid fa-truck-fast"></i>

                </div>


                <div>

                    <span>
                        Expected arrival
                    </span>

                    <strong>
                        ${formatDeliveryDate(
                            estimatedDelivery
                        )}
                    </strong>

                </div>

            </div>

        </section>


        <!-- =================================================
             TRACKING HISTORY
        ================================================== -->

        <section
            class="progress-card"
            id="trackingHistoryCard"
            style="display:none;"
        >

            <div class="section-title">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <h2>
                    Tracking History
                </h2>

            </div>


            <div
                class="timeline"
                id="trackingHistory"
            ></div>

        </section>

    `;


    /* -----------------------------------------------------
       UPDATE MAP AFTER HTML EXISTS
    ----------------------------------------------------- */

    updateMap(
        latitude,
        longitude,
        location
    );

}


/* =========================================================
   DELIVERY TIMELINE
========================================================= */

function createTimeline(
    status,
    order
) {

    const steps = [

        {
            key: "pending",
            title: "Order Placed",
            icon: "fa-clipboard-check",
            text:
                "Your order has been received."
        },

        {
            key: "processing",
            title: "Processing",
            icon: "fa-box-open",
            text:
                "Your order is being prepared."
        },

        {
            key: "shipped",
            title: "Shipped",
            icon: "fa-box",
            text:
                "Your order has left the facility."
        },

        {
            key: "in-transit",
            title: "In Transit",
            icon: "fa-truck",
            text:
                "Your package is on its way."
        },

        {
            key: "out-for-delivery",
            title: "Out for Delivery",
            icon: "fa-truck-fast",
            text:
                "Your package is with the delivery driver."
        },

        {
            key: "delivered",
            title: "Delivered",
            icon: "fa-house-circle-check",
            text:
                "Your package has been delivered."
        }

    ];


    const statusIndex =
        getStatusIndex(
            status
        );


    /* -----------------------------------------------------
       CANCELLED
    ----------------------------------------------------- */

    if (
        status === "cancelled"
    ) {

        return `

            <div class="timeline-step current">

                <div class="timeline-icon">

                    <i class="fa-solid fa-xmark"></i>

                </div>


                <div class="timeline-content">

                    <h3>
                        Order Cancelled
                    </h3>

                    <p>
                        This order has been cancelled.
                    </p>

                </div>

            </div>

        `;

    }


    return steps.map(
        (step, index) => {

            let className = "";


            if (
                index <
                statusIndex
            ) {

                className =
                    "completed";

            } else if (
                index ===
                statusIndex
            ) {

                className =
                    "completed current";

            }


            return `

                <div
                    class="timeline-step ${className}"
                >

                    <div class="timeline-icon">

                        <i
                            class="fa-solid ${step.icon}"
                        ></i>

                    </div>


                    <div class="timeline-content">

                        <h3>
                            ${step.title}
                        </h3>

                        <p>
                            ${step.text}
                        </p>

                    </div>

                </div>

            `;

        }
    ).join("");

}


/* =========================================================
   REAL-TIME TRACKING HISTORY
========================================================= */

function startTrackingHistoryListener(
    id
) {

    try {

        const updatesRef =
            collection(
                db,
                "orders",
                id,
                "trackingUpdates"
            );


        /*
         * We use a client-side-safe listener.
         *
         * No composite index is required.
         */

        if (stopHistoryListener) {

            stopHistoryListener();

            stopHistoryListener = null;

        }


        stopHistoryListener =
            onSnapshot(
                updatesRef,
                (snapshot) => {

                    const updates = [];


                    snapshot.forEach(
                        (item) => {

                            updates.push({

                                id:
                                    item.id,

                                ...item.data()

                            });

                        }
                    );


                    /*
                     * Sort newest first on the client.
                     */

                    updates.sort(
                        (a, b) => {

                            return (
                                getTime(
                                    b.timestamp ||
                                    b.createdAt ||
                                    b.updatedAt
                                ) -
                                getTime(
                                    a.timestamp ||
                                    a.createdAt ||
                                    a.updatedAt
                                )
                            );

                        }
                    );


                    renderTrackingHistory(
                        updates
                    );

                },
                (error) => {

                    console.log(
                        "Tracking history unavailable:",
                        error
                    );

                }
            );


    } catch (error) {

        console.log(
            "Tracking history listener error:",
            error
        );

    }

}


/* =========================================================
   RENDER TRACKING HISTORY
========================================================= */

function renderTrackingHistory(
    updates
) {

    const historyCard =
        document.getElementById(
            "trackingHistoryCard"
        );


    const history =
        document.getElementById(
            "trackingHistory"
        );


    if (
        !historyCard ||
        !history
    ) {

        return;

    }


    if (
        !updates ||
        updates.length === 0
    ) {

        historyCard.style.display =
            "none";

        return;

    }


    history.innerHTML =
        updates.map(
            (update) => {

                const updateStatus =
                    update.status ||
                    "Update";


                const updateLocation =
                    update.location ||
                    update.currentLocation ||
                    "";


                const updateMessage =
                    update.message ||
                    update.note ||
                    update.description ||
                    "Delivery status updated.";


                return `

                    <div class="timeline-step completed">

                        <div class="timeline-icon">

                            <i class="fa-solid fa-check"></i>

                        </div>


                        <div class="timeline-content">

                            <h3>
                                ${escapeHTML(
                                    formatStatus(
                                        updateStatus
                                    )
                                )}
                            </h3>


                            <p>

                                ${escapeHTML(
                                    updateMessage
                                )}

                                ${
                                    updateLocation
                                    ?
                                    `
                                    <br>

                                    <strong>
                                        ${escapeHTML(
                                            updateLocation
                                        )}
                                    </strong>
                                    `
                                    :
                                    ""
                                }

                                <br>

                                ${formatDateTime(
                                    update.timestamp ||
                                    update.createdAt ||
                                    update.updatedAt
                                )}

                            </p>

                        </div>

                    </div>

                `;

            }
        ).join("");


    historyCard.style.display =
        "block";

}


/* =========================================================
   MAP
========================================================= */

function updateMap(
    latitude,
    longitude,
    locationText
) {

    const mapElement =
        document.getElementById(
            "trackingMap"
        );


    const placeholder =
        document.getElementById(
            "mapPlaceholder"
        );


    if (
        !mapElement ||
        !placeholder
    ) {

        return;

    }


    /*
     * Never show fake GPS coordinates.
     */

    if (
        latitude === null ||
        longitude === null ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {

        mapElement.style.display =
            "none";

        placeholder.style.display =
            "flex";

        return;

    }


    mapElement.style.display =
        "block";

    placeholder.style.display =
        "none";


    /*
     * Create map only once.
     */

    if (!trackingMap) {

        trackingMap =
            L.map(
                "trackingMap"
            ).setView(
                [
                    latitude,
                    longitude
                ],
                14
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"

            }
        ).addTo(
            trackingMap
        );


        trackingMarker =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            )
            .addTo(
                trackingMap
            )
            .bindPopup(
                locationText ||
                "Current delivery location"
            )
            .openPopup();


    } else {

        trackingMap.setView(
            [
                latitude,
                longitude
            ],
            14
        );


        if (
            trackingMarker
        ) {

            trackingMarker.setLatLng(
                [
                    latitude,
                    longitude
                ]
            );


            trackingMarker.bindPopup(
                locationText ||
                "Current delivery location"
            );

        }

    }


    /*
     * Leaflet sometimes needs to recalculate
     * the visible map size.
     */

    setTimeout(
        () => {

            if (
                trackingMap
            ) {

                trackingMap.invalidateSize();

            }

        },
        100
    );

}


/* =========================================================
   STATUS NORMALIZATION
========================================================= */

function normalizeStatus(
    value
) {

    const text =
        String(
            value ||
            "pending"
        )
        .toLowerCase()
        .trim()
        .replace(
            /_/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
        );


    if (
        text === "placed" ||
        text === "order-placed" ||
        text === "new"
    ) {

        return "pending";

    }


    if (
        text === "ready" ||
        text === "preparing"
    ) {

        return "processing";

    }


    if (
        text === "dispatched"
    ) {

        return "shipped";

    }


    if (
        text === "transit"
    ) {

        return "in-transit";

    }


    if (
        text === "outfordelivery"
    ) {

        return "out-for-delivery";

    }


    return text;

}


/* =========================================================
   STATUS INDEX
========================================================= */

function getStatusIndex(
    status
) {

    const indexes = {

        pending: 0,

        processing: 1,

        shipped: 2,

        "in-transit": 3,

        "out-for-delivery": 4,

        delivered: 5

    };


    if (
        indexes[status] !==
        undefined
    ) {

        return indexes[status];

    }


    return 0;

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(
    value
) {

    return String(
        value ||
        "Pending"
    )
    .replace(
        /[-_]+/g,
        " "
    )
    .replace(
        /\b\w/g,
        letter =>
            letter.toUpperCase()
    );

}


/* =========================================================
   DEFAULT DELIVERY MESSAGE
========================================================= */

function getDefaultMessage(
    status
) {

    const messages = {

        pending:
            "Your order has been received and is awaiting processing.",

        processing:
            "Your order is currently being prepared for shipment.",

        shipped:
            "Your order has been shipped and is leaving the fulfillment facility.",

        "in-transit":
            "Your package is currently in transit to its destination.",

        "out-for-delivery":
            "Your package is out for delivery and should arrive soon.",

        delivered:
            "Your package has been delivered successfully.",

        cancelled:
            "This order has been cancelled."

    };


    return (
        messages[status] ||
        "Your delivery information will appear here as it becomes available."
    );

}


/* =========================================================
   GET TIME
========================================================= */

function getTime(
    timestamp
) {

    if (!timestamp) {

        return 0;

    }


    try {

        /*
         * Firestore Timestamp
         */

        if (
            typeof timestamp.toMillis ===
            "function"
        ) {

            return timestamp.toMillis();

        }


        /*
         * Firestore Timestamp-like object
         */

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .getTime();

        }


        /*
         * Firestore serialized timestamp
         */

        if (
            timestamp.seconds !==
            undefined
        ) {

            return (
                Number(
                    timestamp.seconds
                ) * 1000
            );

        }


        /*
         * Date / string
         */

        const parsed =
            new Date(
                timestamp
            ).getTime();


        return Number.isNaN(
            parsed
        )
            ? 0
            : parsed;


    } catch {

        return 0;

    }

}


/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(
    timestamp
) {

    const time =
        getTime(
            timestamp
        );


    if (!time) {

        return "Not available";

    }


    return new Date(
        time
    ).toLocaleString(
        "en-NG",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   FORMAT DELIVERY DATE
========================================================= */

function formatDeliveryDate(
    value
) {

    if (!value) {

        return "Not available yet";

    }


    const time =
        getTime(
            value
        );


    if (!time) {

        /*
         * It may already be a formatted string,
         * for example:
         *
         * September 15, 2026
         */

        return escapeHTML(
            String(value)
        );

    }


    return new Date(
        time
    ).toLocaleDateString(
        "en-NG",
        {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =========================================================
   NUMBER
========================================================= */

function getNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    if (
        !Number.isFinite(
            number
        )
    ) {

        return null;

    }


    return number;

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    title,
    message
) {

    if (!trackingContent) {

        return;

    }


    trackingContent.innerHTML = `

        <div class="error-box">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <a
                href="orders.html"
                class="back-orders-btn"
            >

                <i class="fa-solid fa-arrow-left"></i>

                Back to My Orders

            </a>

        </div>

    `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}
