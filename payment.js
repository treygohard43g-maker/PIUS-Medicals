import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase.js";


/* ================================
   FLUTTERWAVE PUBLIC KEY
================================ */

const FLW_PUBLIC_KEY =
    "FLWPUBK_TEST-b742ed7d80a130e85e6e71b837739698-X";


/* ================================
   ELEMENTS
================================ */

const orderIdElement =
    document.getElementById("orderId");

const orderStatusElement =
    document.getElementById("orderStatus");

const paymentSubtotal =
    document.getElementById("paymentSubtotal");

const paymentDelivery =
    document.getElementById("paymentDelivery");

const paymentTotal =
    document.getElementById("paymentTotal");

const paymentMessage =
    document.getElementById("paymentMessage");

const confirmPaymentBtn =
    document.getElementById("confirmPaymentBtn");


/* ================================
   GET ORDER ID
================================ */

const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("order");


/* ================================
   USD FORMAT
================================ */

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


/* ================================
   SHOW MESSAGE
================================ */

function showMessage(message) {

    paymentMessage.textContent = message;

    paymentMessage.classList.add("show");

}


/* ================================
   CHECK LOGIN
================================ */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }


    if (!orderId) {

        showMessage(
            "No order was found. Please return to checkout."
        );

        confirmPaymentBtn.disabled = true;

        return;

    }


    await loadOrder(user);

});


/* ================================
   LOAD ORDER
================================ */

async function loadOrder(user) {

    try {

        const orderRef =
            doc(db, "orders", orderId);

        const orderSnapshot =
            await getDoc(orderRef);


        if (!orderSnapshot.exists()) {

            showMessage(
                "This order could not be found."
            );

            confirmPaymentBtn.disabled = true;

            return;

        }


        const order =
            orderSnapshot.data();


        /* SECURITY CHECK */

        if (order.userId !== user.uid) {

            showMessage(
                "You are not authorized to view this order."
            );

            confirmPaymentBtn.disabled = true;

            return;

        }


        /* DISPLAY ORDER */

        orderIdElement.textContent =
            orderId;


        orderStatusElement.textContent =
            order.status || "Pending";


        paymentSubtotal.textContent =
            formatMoney(order.subtotal);


        paymentDelivery.textContent =
            formatMoney(order.deliveryFee);


        paymentTotal.textContent =
            formatMoney(order.total);


        /* PAYMENT BUTTON */

        confirmPaymentBtn.disabled = false;


        confirmPaymentBtn.onclick = () => {

            startFlutterwavePayment(
                order,
                user
            );

        };


    } catch (error) {

        console.error(
            "Error loading payment order:",
            error
        );

        showMessage(
            "Unable to load your order. Please try again."
        );

        confirmPaymentBtn.disabled = true;

    }

}


/* ================================
   START FLUTTERWAVE PAYMENT
================================ */

function startFlutterwavePayment(
    order,
    user
) {

    if (
        typeof FlutterwaveCheckout !==
        "function"
    ) {

        showMessage(
            "Payment system could not be loaded. Please refresh the page."
        );

        return;

    }


    const amount =
        Number(order.total || 0);


    if (!amount || amount <= 0) {

        showMessage(
            "Invalid order amount."
        );

        return;

    }


    /* CREATE UNIQUE TRANSACTION REFERENCE */

    const txRef =
        `PIUS-${orderId}-${Date.now()}`;


    confirmPaymentBtn.disabled = true;


    confirmPaymentBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Opening Payment...</span>
    `;


    FlutterwaveCheckout({

        public_key:
            FLW_PUBLIC_KEY,

        tx_ref:
            txRef,

        amount:
            amount,

        currency:
            "USD",

        payment_options:
            "card, account",

        customer: {

            email:
                user.email || "",

            name:
                user.displayName ||
                "Pius Medical Accessories Customer"

        },

        meta: {

            order_id:
                orderId,

            user_id:
                user.uid

        },

        customizations: {

            title:
                "Pius Medical Accessories",

            description:
                `Payment for Order ${orderId}`

        },

        callback: function (payment) {

            console.log(
                "Flutterwave callback:",
                payment
            );

            showMessage(
                "Payment response received. We are verifying your payment..."
            );

            /*
             * IMPORTANT:
             * Payment verification should happen
             * on the server/backend.
             *
             * Do NOT mark the order as paid
             * from this frontend callback alone.
             */

            confirmPaymentBtn.disabled = false;

            confirmPaymentBtn.innerHTML = `
                <i class="fa-solid fa-lock"></i>
                <span>Continue to Payment</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;

        },

        onclose: function () {

            console.log(
                "Flutterwave checkout closed."
            );

            confirmPaymentBtn.disabled = false;

            confirmPaymentBtn.innerHTML = `
                <i class="fa-solid fa-lock"></i>
                <span>Continue to Payment</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;

        }

    });

}