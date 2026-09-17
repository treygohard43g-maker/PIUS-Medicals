import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase.js";


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


/* GET ORDER ID FROM URL */

const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("order");


/* USD FORMAT */

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


/* SHOW MESSAGE */

function showMessage(message) {

    paymentMessage.textContent = message;

    paymentMessage.classList.add("show");

}


/* CHECK LOGIN */

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


    await loadOrder(user.uid);

});


/* LOAD ORDER */

async function loadOrder(userId) {

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

        if (order.userId !== userId) {

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


/* PAYMENT BUTTON */

confirmPaymentBtn.addEventListener(
    "click",
    () => {

        showMessage(
            "Payment processing will be connected here next."
        );

    }
);