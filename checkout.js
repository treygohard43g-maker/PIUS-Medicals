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
   DELIVERY FEES
========================================= */

const DELIVERY_FEES = {

    standard: 20,

    express: 40

};


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

        cartCount.textContent =
            count;

    }


    if (menuCartCount) {

        menuCartCount.textContent =
            count;

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

            return total +
                (price * quantity);

        },
        0
    );

}


/* =========================================
   GET DELIVERY METHOD
========================================= */

function getDeliveryMethod() {

    return document
        .querySelector(
            'input[name="deliveryMethod"]:checked'
        )
        ?.value || "standard";

}


/* =========================================
   GET DELIVERY FEE
========================================= */

function getDeliveryFee() {

    if (!cart.length) {

        return 0;

    }


    const deliveryMethod =
        getDeliveryMethod();


    return DELIVERY_FEES[
        deliveryMethod
    ] || DELIVERY_FEES.standard;

}


/* =========================================
   GET TOTAL
========================================= */

function calculateTotal() {

    const subtotal =
        calculateSubtotal();

    const deliveryFee =
        getDeliveryFee();


    return subtotal +
        deliveryFee;

}


/* =========================================
   DISPLAY ORDER
========================================= */

function displayOrder() {

    if (!checkoutOrderItems) {

        return;

    }


    if (!cart.length) {

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

            placeOrderBtn.disabled =
                true;

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


                    <strong
                        class="checkout-order-price"
                    >
                        ${formatPrice(itemTotal)}
                    </strong>

                </div>

            `;

        }).join("");


    if (placeOrderBtn) {

        placeOrderBtn.disabled =
            false;

    }


    updateSummary();

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const subtotal =
        calculateSubtotal();

    const deliveryFee =
        getDeliveryFee();

    const total =
        subtotal +
        deliveryFee;


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatPrice(subtotal);

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            cart.length
                ? formatPrice(deliveryFee)
                : "$0.00";

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatPrice(total);

    }


    updateDeliveryLabels();

}


/* =========================================
   UPDATE DELIVERY LABELS
========================================= */

function updateDeliveryLabels() {

    document
        .querySelectorAll(
            ".delivery-option"
        )
        .forEach(option => {

            const input =
                option.querySelector(
                    'input[name="deliveryMethod"]'
                );

            const priceLabel =
                option.querySelector(
                    ".delivery-price-label"
                );


            if (!input || !priceLabel) {

                return;

            }


            if (
                input.value === "standard"
            ) {

                priceLabel.textContent =
                    "$20.00";

            }


            if (
                input.value === "express"
            ) {

                priceLabel.textContent =
                    "$40.00";

            }

        });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    return String(value ?? "")
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


/* =========================================
   MENU
========================================= */

function openMenu() {

    sideMenu?.classList.add(
        "open"
    );

    menuOverlay?.classList.add(
        "show"
    );

    document.body.classList.add(
        "menu-open"
    );

}


function closeMenu() {

    sideMenu?.classList.remove(
        "open"
    );

    menuOverlay?.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "menu-open"
    );

}


menuBtn?.addEventListener(
    "click",
    openMenu
);


closeMenuBtn?.addEventListener(
    "click",
    closeMenu
);


menuOverlay?.addEventListener(
    "click",
    closeMenu
);


/* =========================================
   CART BUTTON
========================================= */

cartBtn?.addEventListener(
    "click",
    () => {

        window.location.href =
            "cart.html";

    }
);


/* =========================================
   PAYMENT UI
========================================= */

function setupPaymentUI() {

    const paymentOptions =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentOptions.forEach(input => {

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


                selected?.classList.add(
                    "active"
                );


                renderPaymentPanel(
                    input.value
                );

            }
        );

    });


    const initialPayment =
        document
            .querySelector(
                'input[name="paymentMethod"]:checked'
            )
            ?.value || "card";


    renderPaymentPanel(
        initialPayment
    );

}


/* =========================================
   PAYMENT PANEL CONTAINER
========================================= */

function getPaymentPanelContainer() {

    let container =
        document.getElementById(
            "dynamicPaymentPanel"
        );


    if (container) {

        return container;

    }


    const cardPreview =
        document.getElementById(
            "cardPreview"
        );


    if (!cardPreview) {

        return null;

    }


    container =
        document.createElement(
            "div"
        );


    container.id =
        "dynamicPaymentPanel";


    container.style.marginTop =
        "20px";


    cardPreview
        .insertAdjacentElement(
            "afterend",
            container
        );


    return container;

}


/* =========================================
   RENDER PAYMENT PANEL
========================================= */

function renderPaymentPanel(
    paymentMethod
) {

    const cardPreview =
        document.getElementById(
            "cardPreview"
        );


    const container =
        getPaymentPanelContainer();


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    /*
     * CARD
     */

    if (
        paymentMethod === "card"
    ) {

        if (cardPreview) {

            cardPreview.style.display =
                "block";

        }


        container.innerHTML = `

            <div class="modern-payment-panel">

                <div class="modern-payment-panel-header">

                    <div class="payment-panel-icon">

                        <i class="fa-regular fa-credit-card"></i>

                    </div>

                    <div>

                        <strong>
                            Card Payment
                        </strong>

                        <span>
                            Enter your billing details securely.
                        </span>

                    </div>

                </div>


                <div class="secure-payment-banner">

                    <i class="fa-solid fa-shield-halved"></i>

                    <span>
                        Your card details should be processed
                        by a secure payment provider.
                    </span>

                </div>


                <div class="payment-provider-note">

                    <i class="fa-solid fa-lock"></i>

                    <span>
                        Card information is not saved in
                        Pius Medical Accessories' Firestore database.
                    </span>

                </div>

            </div>

        `;


        return;

    }


    /*
     * BANK TRANSFER
     */

    if (
        paymentMethod === "bank"
    ) {

        if (cardPreview) {

            cardPreview.style.display =
                "none";

        }


        container.innerHTML = `

            <div class="modern-payment-panel">

                <div class="modern-payment-panel-header">

                    <div class="payment-panel-icon">

                        <i class="fa-solid fa-building-columns"></i>

                    </div>

                    <div>

                        <strong>
                            Bank Transfer
                        </strong>

                        <span>
                            Complete your payment using your bank.
                        </span>

                    </div>

                </div>


                <div class="bank-transfer-total">

                    <span>
                        Amount to transfer
                    </span>

                    <strong id="bankTransferAmount">
                        ${formatPrice(calculateTotal())}
                    </strong>

                </div>


                <div class="bank-transfer-instructions">

                    <div class="bank-transfer-row">

                        <span>
                            Bank
                        </span>

                        <strong>
                            Payment provider account
                        </strong>

                    </div>


                    <div class="bank-transfer-row">

                        <span>
                            Account Name
                        </span>

                        <strong>
                            Pius Medical Accessories
                        </strong>

                    </div>


                    <div class="bank-transfer-row">

                        <span>
                            Account Number
                        </span>

                        <strong>
                            Will be provided at payment
                        </strong>

                    </div>

                </div>


                <div class="secure-payment-banner">

                    <i class="fa-solid fa-circle-info"></i>

                    <span>
                        Your final transfer instructions will
                        be supplied by the payment provider.
                    </span>

                </div>

            </div>

        `;


        return;

    }


    /*
     * CASH APP
     */

    if (
        paymentMethod === "cashapp"
    ) {

        if (cardPreview) {

            cardPreview.style.display =
                "none";

        }


        container.innerHTML = `

            <div class="modern-payment-panel">

                <div class="modern-payment-panel-header">

                    <div class="payment-panel-icon cashapp-icon">
                        $
                    </div>

                    <div>

                        <strong>
                            Cash App
                        </strong>

                        <span>
                            Pay securely using Cash App.
                        </span>

                    </div>

                </div>


                <div class="alternative-payment-card">

                    <div class="alternative-payment-logo cashapp-logo">
                        $
                    </div>


                    <div>

                        <strong>
                            Cash App Payment
                        </strong>

                        <p>
                            You will continue to the secure
                            payment flow to complete your payment.
                        </p>

                    </div>

                </div>


                <div class="secure-payment-banner">

                    <i class="fa-solid fa-lock"></i>

                    <span>
                        Payment confirmation will be verified
                        before your order is marked as paid.
                    </span>

                </div>

            </div>

        `;


        return;

    }


    /*
     * PAYPAL
     */

    if (
        paymentMethod === "paypal"
    ) {

        if (cardPreview) {

            cardPreview.style.display =
                "none";

        }


        container.innerHTML = `

            <div class="modern-payment-panel">

                <div class="modern-payment-panel-header">

                    <div class="payment-panel-icon paypal-icon">
                        P
                    </div>

                    <div>

                        <strong>
                            PayPal
                        </strong>

                        <span>
                            Pay using your PayPal account.
                        </span>

                    </div>

                </div>


                <div class="alternative-payment-card">

                    <div class="alternative-payment-logo paypal-logo">
                        P
                    </div>


                    <div>

                        <strong>
                            PayPal Checkout
                        </strong>

                        <p>
                            You will continue to the secure
                            PayPal checkout to complete payment.
                        </p>

                    </div>

                </div>


                <div class="secure-payment-banner">

                    <i class="fa-solid fa-shield-halved"></i>

                    <span>
                        Your payment will be handled by PayPal.
                    </span>

                </div>

            </div>

        `;


        return;

    }

}


/* =========================================
   DELIVERY METHOD UI
========================================= */

function setupDeliveryUI() {

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


                    selected?.classList.add(
                        "active"
                    );


                    updateSummary();


                    const currentPayment =
                        document
                            .querySelector(
                                'input[name="paymentMethod"]:checked'
                            )
                            ?.value;


                    if (
                        currentPayment ===
                        "bank"
                    ) {

                        renderPaymentPanel(
                            "bank"
                        );

                    }

                }
            );

        });


    updateDeliveryLabels();

}


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
        "dashboard-cart-message show " +
        type;


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


    for (
        const field of requiredFields
    ) {

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


            element?.focus();


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
   CREATE ORDER
========================================= */

if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        "click",
        async () => {

            if (!cart.length) {

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
                getDeliveryMethod();


            const subtotal =
                calculateSubtotal();


            const deliveryFee =
                getDeliveryFee();


            const total =
                subtotal +
                deliveryFee;


            const fullName =
                document
                    .getElementById("fullName")
                    ?.value
                    .trim() || "";


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim() || "";


            const phone =
                document
                    .getElementById("phone")
                    ?.value
                    .trim() || "";


            const address =
                document
                    .getElementById("address")
                    ?.value
                    .trim() || "";


            const city =
                document
                    .getElementById("city")
                    ?.value
                    .trim() || "";


            const state =
                document
                    .getElementById("state")
                    ?.value
                    .trim() || "";


            const country =
                document
                    .getElementById("country")
                    ?.value
                    .trim() || "";


            const postalCode =
                document
                    .getElementById("postalCode")
                    ?.value
                    .trim() || "";


            const orderData = {

                userId: user.uid,


                customer: {

                    name:
                        fullName,

                    email:
                        email,

                    phone:
                        phone

                },


                deliveryAddress: {

                    address:
                        address,

                    city:
                        city,

                    state:
                        state,

                    country:
                        country,

                    postalCode:
                        postalCode

                },


                deliveryMethod:
                    deliveryMethod,


                paymentMethod:
                    paymentMethod,


                items:
                    cart.map(item => ({

                        id:
                            item.id,

                        name:
                            item.name,

                        category:
                            item.category || "",

                        price:
                            Number(item.price) || 0,

                        quantity:
                            Number(item.quantity) || 0

                    })),


                subtotal:
                    subtotal,


                deliveryFee:
                    deliveryFee,


                total:
                    total,


                currency:
                    "USD",


                status:
                    "pending",


                paymentStatus:
                    "pending",


                createdAt:
                    serverTimestamp()

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


                /*
                 * Do NOT clear the cart yet.
                 *
                 * The payment flow still needs
                 * to confirm payment.
                 */


                showMessage(
                    "Order prepared. Continue to secure payment.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        `payment.html?order=${encodeURIComponent(orderRef.id)}`;

                }, 800);


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

        setupDeliveryUI();

        setupPaymentUI();

    }
);
