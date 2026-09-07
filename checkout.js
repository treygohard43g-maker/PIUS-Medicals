/* =========================================
   PIUS MEDICAL ACCESSORIES
   CHECKOUT PAGE
========================================= */

import {
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   ELEMENTS
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const closeMenuBtn =
    document.getElementById("closeMenuBtn");

const menuOverlay =
    document.getElementById("menuOverlay");

const sideMenu =
    document.getElementById("sideMenu");

const logoutBtn =
    document.getElementById("logoutBtn");

const cartBtn =
    document.getElementById("cartBtn");

const cartCount =
    document.getElementById("cartCount");

const menuCartCount =
    document.getElementById("menuCartCount");

const checkoutOrderItems =
    document.getElementById("checkoutOrderItems");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutDelivery =
    document.getElementById("checkoutDelivery");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderBtn =
    document.getElementById("placeOrderBtn");

const checkoutMessage =
    document.getElementById("checkoutMessage");


/* =========================================
   CART
========================================= */

let cart = JSON.parse(
    localStorage.getItem("piusCart") || "[]"
);


/* =========================================
   PRICE FORMAT
========================================= */

const usdFormatter =
    new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    );


function formatPrice(price) {

    return usdFormatter.format(
        Number(price) || 0
    );

}


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (menuCartCount) {
        menuCartCount.textContent = count;
    }

}


/* =========================================
   CALCULATE SUBTOTAL
========================================= */

function calculateSubtotal() {

    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;

            return total + (price * quantity);

        },
        0
    );

}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayOrder() {

    if (!checkoutOrderItems) {
        return;
    }


    if (cart.length === 0) {

        checkoutOrderItems.innerHTML = `
            <div class="checkout-empty">

                <i class="fa-solid fa-cart-shopping"></i>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some medical products before
                    continuing to checkout.
                </p>

                <a href="products.html">
                    Browse Products
                </a>

            </div>
        `;

        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
        }

        updateSummary();

        return;
    }


    checkoutOrderItems.innerHTML =
        cart.map(item => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;

            const itemTotal =
                price * quantity;


            return `
                <div class="checkout-order-item">

                    <div class="checkout-order-icon">
                        <i class="fa-solid fa-kit-medical"></i>
                    </div>

                    <div class="checkout-order-details">

                        <strong>
                            ${escapeHtml(item.name)}
                        </strong>

                        <span>
                            Qty: ${quantity}
                        </span>

                    </div>

                    <strong class="checkout-order-price">
                        ${formatPrice(itemTotal)}
                    </strong>

                </div>
            `;

        }).join("");


    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
    }


    updateSummary();

}


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

    const subtotal =
        calculateSubtotal();


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatPrice(subtotal);

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            cart.length > 0
                ? "Calculated"
                : "$0.00";

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatPrice(subtotal);

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   MENU
========================================= */

function openMenu() {

    if (sideMenu) {
        sideMenu.classList.add("open");
    }

    if (menuOverlay) {
        menuOverlay.classList.add("show");
    }

    document.body.classList.add("menu-open");

}


function closeMenu() {

    if (sideMenu) {
        sideMenu.classList.remove("open");
    }

    if (menuOverlay) {
        menuOverlay.classList.remove("show");
    }

    document.body.classList.remove("menu-open");

}


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        openMenu
    );

}


if (closeMenuBtn) {

    closeMenuBtn.addEventListener(
        "click",
        closeMenu
    );

}


if (menuOverlay) {

    menuOverlay.addEventListener(
        "click",
        closeMenu
    );

}


/* =========================================
   CART BUTTON
========================================= */

if (cartBtn) {

    cartBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "cart.html";

        }
    );

}


/* =========================================
   PAYMENT METHOD UI
========================================= */

document
    .querySelectorAll(
        'input[name="paymentMethod"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            () => {

                document
                    .querySelectorAll(
                        ".payment-option"
                    )
                    .forEach(option => {

                        option.classList.remove(
                            "active"
                        );

                    });


                const selected =
                    input.closest(
                        ".payment-option"
                    );


                if (selected) {

                    selected.classList.add(
                        "active"
                    );

                }

            }
        );

    });


/* =========================================
   DELIVERY METHOD UI
========================================= */

document
    .querySelectorAll(
        'input[name="deliveryMethod"]'
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            () => {

                document
                    .querySelectorAll(
                        ".delivery-option"
                    )
                    .forEach(option => {

                        option.classList.remove(
                            "active"
                        );

                    });


                const selected =
                    input.closest(
                        ".delivery-option"
                    );


                if (selected) {

                    selected.classList.add(
                        "active"
                    );

                }

            }
        );

    });


/* =========================================
   MESSAGE
========================================= */

function showMessage(
    message,
    type = "info"
) {

    if (!checkoutMessage) {
        return;
    }


    checkoutMessage.textContent =
        message;


    checkoutMessage.className =
        "dashboard-cart-message show " + type;


    setTimeout(() => {

        checkoutMessage.classList.remove(
            "show"
        );

    }, 4000);

}


/* =========================================
   VALIDATE CUSTOMER DETAILS
========================================= */

function validateCheckout() {

    const requiredFields = [

        {
            id: "fullName",
            name: "Full Name"
        },

        {
            id: "email",
            name: "Email Address"
        },

        {
            id: "phone",
            name: "Phone Number"
        },

        {
            id: "address",
            name: "Street Address"
        },

        {
            id: "city",
            name: "City"
        },

        {
            id: "state",
            name: "State"
        },

        {
            id: "country",
            name: "Country"
        }

    ];


    for (const field of requiredFields) {

        const element =
            document.getElementById(
                field.id
            );


        if (
            !element ||
            !element.value.trim()
        ) {

            showMessage(
                `Please enter your ${field.name}.`,
                "error"
            );

            if (element) {
                element.focus();
            }

            return false;

        }

    }


    const email =
        document
            .getElementById("email")
            ?.value
            .trim();


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        document
            .getElementById("email")
            ?.focus();

        return false;

    }


    return true;

}


/* =========================================
   CONTINUE TO PAYMENT
========================================= */

if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        "click",
        async () => {

            if (cart.length === 0) {

                showMessage(
                    "Your cart is empty.",
                    "error"
                );

                return;

            }


            if (!validateCheckout()) {
                return;
            }


            const user =
                auth.currentUser;


            if (!user) {

                showMessage(
                    "Please log in before checking out.",
                    "error"
                );

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);

                return;

            }


            const paymentMethod =
                document
                    .querySelector(
                        'input[name="paymentMethod"]:checked'
                    )
                    ?.value || "card";


            const deliveryMethod =
                document
                    .querySelector(
                        'input[name="deliveryMethod"]:checked'
                    )
                    ?.value || "standard";


            const subtotal =
                calculateSubtotal();


            const orderData = {

                userId: user.uid,

                customer: {

                    name:
                        document
                            .getElementById("fullName")
                            .value
                            .trim(),

                    email:
                        document
                            .getElementById("email")
                            .value
                            .trim(),

                    phone:
                        document
                            .getElementById("phone")
                            .value
                            .trim()

                },


                deliveryAddress: {

                    address:
                        document
                            .getElementById("address")
                            .value
                            .trim(),

                    city:
                        document
                            .getElementById("city")
                            .value
                            .trim(),

                    state:
                        document
                            .getElementById("state")
                            .value
                            .trim(),

                    country:
                        document
                            .getElementById("country")
                            .value
                            .trim(),

                    postalCode:
                        document
                            .getElementById("postalCode")
                            .value
                            .trim()

                },


                deliveryMethod,

                paymentMethod,

                items: cart.map(item => ({

                    id: item.id,

                    name: item.name,

                    category: item.category || "",

                    price: Number(item.price) || 0,

                    quantity:
                        Number(item.quantity) || 0

                })),

                subtotal,

                deliveryFee: 0,

                total: subtotal,

                currency: "USD",

                status: "pending",

                paymentStatus: "pending",

                createdAt: serverTimestamp()

            };


            try {

                placeOrderBtn.disabled =
                    true;


                placeOrderBtn.innerHTML = `
                    <span>
                        Preparing Secure Checkout...
                    </span>

                    <i class="fa-solid fa-spinner fa-spin"></i>
                `;


                /*
                    IMPORTANT:

                    This creates a PENDING order only.
                    It does NOT claim that payment
                    was successful.

                    A real payment provider will be
                    connected next.
                */

                const orderRef =
                    await addDoc(
                        collection(
                            db,
                            "orders"
                        ),
                        orderData
                    );


                localStorage.setItem(
                    "piusPendingOrderId",
                    orderRef.id
                );


                showMessage(
                    "Your order has been prepared. Secure payment integration is next.",
                    "success"
                );


                setTimeout(() => {

                    /*
                        Temporary destination.
                        We will replace this with
                        the real payment-provider
                        checkout page.
                    */

                    window.location.href =
                        `payment.html?order=${encodeURIComponent(orderRef.id)}`;

                }, 1000);


            } catch (error) {

                console.error(
                    "Checkout error:",
                    error
                );


                placeOrderBtn.disabled =
                    false;


                placeOrderBtn.innerHTML = `
                    <span>
                        Continue to Payment
                    </span>

                    <i class="fa-solid fa-arrow-right"></i>
                `;


                showMessage(
                    "We could not prepare your order. Please try again.",
                    "error"
                );

            }

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                localStorage.removeItem(
                    "loggedIn"
                );

                localStorage.removeItem(
                    "firebaseUser"
                );

                localStorage.removeItem(
                    "userEmail"
                );

                localStorage.removeItem(
                    "userName"
                );

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* =========================================
   AUTH PROTECTION
========================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        displayOrder();

        updateCartCount();

    }
);
