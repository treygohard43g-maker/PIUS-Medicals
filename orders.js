import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// ORDERS PAGE
// ===============================

const ordersList = document.getElementById("ordersList");


// ===============================
// AUTH CHECK
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await loadOrders(user.uid);

});


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders(userId) {

    try {

        ordersList.innerHTML = `
            <div class="loading">
                Loading your orders...
            </div>
        `;

        const ordersRef = collection(db, "orders");

        const ordersQuery = query(
            ordersRef,
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(ordersQuery);

        const orders = [];

        snapshot.forEach((doc) => {

            orders.push({
                id: doc.id,
                ...doc.data()
            });

        });


        // Newest orders first
        orders.sort((a, b) => {

            return (
                getTime(b.createdAt) -
                getTime(a.createdAt)
            );

        });


        if (!orders.length) {

            ordersList.innerHTML = `
                <div class="empty-orders">

                    <i class="fa-solid fa-box-open"></i>

                    <h2>No orders yet</h2>

                    <p>
                        You haven't placed any orders yet.
                    </p>

                    <a href="products.html" class="shop-btn">
                        Start Shopping
                    </a>

                </div>
            `;

            return;
        }


        renderOrders(orders);

    } catch (error) {

        console.error("Error loading orders:", error);

        ordersList.innerHTML = `
            <div class="empty-orders">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>Unable to load orders</h2>

                <p>
                    Something went wrong while loading your orders.
                </p>

                <button onclick="location.reload()">
                    Try Again
                </button>

            </div>
        `;

    }

}


// ===============================
// RENDER ORDERS
// ===============================

function renderOrders(orders) {

    ordersList.innerHTML = orders.map(order => {

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const firstItem = items[0] || {};

        const itemName =
            firstItem.name ||
            firstItem.productName ||
            "Product";

        const itemImage =
            firstItem.image ||
            firstItem.imageUrl ||
            "";

        const itemQuantity = items.reduce(
            (total, item) =>
                total + (Number(item.quantity) || 0),
            0
        );


        const status =
            order.status || "pending";


        const total =
            order.total ??
            order.totalAmount ??
            0;


        const date =
            formatDate(order.createdAt);


        return `

            <div class="order-card">

                <div class="order-card-header">

                    <div>

                        <span class="order-label">
                            Order ID
                        </span>

                        <strong>
                            #${escapeHTML(order.id)}
                        </strong>

                    </div>


                    <span class="order-status ${escapeHTML(status)}">
                        ${capitalize(status)}
                    </span>

                </div>


                <div class="order-card-body">

                    <div class="order-product">

                        ${
                            itemImage
                                ? `
                                    <img
                                        src="${escapeHTML(itemImage)}"
                                        alt="${escapeHTML(itemName)}"
                                    >
                                  `
                                : `
                                    <div class="order-product-placeholder">
                                        <i class="fa-solid fa-box"></i>
                                    </div>
                                  `
                        }

                        <div>

                            <h3>
                                ${escapeHTML(itemName)}
                            </h3>

                            ${
                                items.length > 1
                                    ? `
                                        <p>
                                            +${items.length - 1}
                                            more item(s)
                                        </p>
                                      `
                                    : `
                                        <p>
                                            ${itemQuantity}
                                            item(s)
                                        </p>
                                      `
                            }

                        </div>

                    </div>


                    <div class="order-info">

                        <span>Order Date</span>

                        <strong>
                            ${date}
                        </strong>

                    </div>


                    <div class="order-info">

                        <span>Total</span>

                        <strong>
                            ${formatMoney(total)}
                        </strong>

                    </div>


                </div>


                <div class="order-card-footer">

                    <a
                        href="order-details.html?id=${encodeURIComponent(order.id)}"
                        class="view-order-btn"
                    >
                        View Details
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>

                </div>

            </div>

        `;

    }).join("");

}


// ===============================
// GET FIRESTORE TIMESTAMP
// ===============================

function getTime(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (typeof timestamp.toMillis === "function") {
        return timestamp.toMillis();
    }

    if (timestamp.seconds) {
        return timestamp.seconds * 1000;
    }

    if (timestamp instanceof Date) {
        return timestamp.getTime();
    }

    return 0;

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(timestamp) {

    const time = getTime(timestamp);

    if (!time) {
        return "Date unavailable";
    }

    return new Date(time).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ===============================
// FORMAT USD
// ===============================

function formatMoney(amount) {

    return Number(amount || 0).toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ===============================
// CAPITALIZE STATUS
// ===============================

function capitalize(value) {

    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() +
           value.slice(1);

}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================
// BACK BUTTON
// ===============================

const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {

    window.history.back();

});