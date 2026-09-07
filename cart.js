/* =========================================
   PIUS MEDICAL ACCESSORIES
   CART
========================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    auth
} from "./firebase.js";


/* =========================================
   ELEMENTS
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const closeMenuBtn =
    document.getElementById("closeMenuBtn");

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");

const logoutBtn =
    document.getElementById("logoutBtn");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const cartDelivery =
    document.getElementById("cartDelivery");

const cartCount =
    document.getElementById("cartCount");

const menuCartCount =
    document.getElementById("menuCartCount");

const checkoutBtn =
    document.getElementById("checkoutBtn");


/* =========================================
   USD FORMAT
========================================= */

const usdFormatter =
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    });


function formatPrice(price) {

    return usdFormatter.format(price);

}


/* =========================================
   LOAD CART
========================================= */

let cart = JSON.parse(
    localStorage.getItem("piusCart") || "[]"
);


/* =========================================
   SAVE CART
========================================= */

function saveCart() {

    localStorage.setItem(
        "piusCart",
        JSON.stringify(cart)
    );

}


/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }


    if (menuCartCount) {

        menuCartCount.textContent =
            totalItems;

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
   DISPLAY CART
========================================= */

function displayCart() {

    updateCartCount();


    if (!cart.length) {

        cartItems.innerHTML = "";

        cartEmpty.style.display =
            "flex";

        cartSubtotal.textContent =
            "$0.00";

        cartTotal.textContent =
            "$0.00";

        cartDelivery.textContent =
            "Calculated at checkout";

        checkoutBtn.disabled =
            true;

        checkoutBtn.style.opacity =
            "0.5";

        checkoutBtn.style.cursor =
            "not-allowed";

        return;

    }


    cartEmpty.style.display =
        "none";

    checkoutBtn.disabled =
        false;

    checkoutBtn.style.opacity =
        "1";

    checkoutBtn.style.cursor =
        "pointer";


    cartItems.innerHTML = "";


    cart.forEach(item => {

        const quantity =
            Number(item.quantity) || 1;

        const price =
            Number(item.price) || 0;


        const itemTotal =
            price * quantity;


        const card =
            document.createElement("article");


        card.className =
            "cart-item";


        card.dataset.id =
            item.id;


        card.innerHTML = `

            <div class="cart-item-icon">

                <i class="fa-solid fa-kit-medical"></i>

            </div>


            <div class="cart-item-details">

                <span class="cart-item-category">
                    ${item.category || "Medical Equipment"}
                </span>

                <h3>
                    ${item.name}
                </h3>

                <strong class="cart-item-price">
                    ${formatPrice(price)}
                </strong>

            </div>


            <div class="cart-item-controls">

                <div class="quantity-control">

                    <button
                        type="button"
                        class="quantity-btn decrease-btn"
                        data-id="${item.id}"
                        aria-label="Decrease quantity"
                    >
                        <i class="fa-solid fa-minus"></i>
                    </button>


                    <span class="quantity-value">
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        class="quantity-btn increase-btn"
                        data-id="${item.id}"
                        aria-label="Increase quantity"
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>

                </div>


                <strong class="cart-item-total">
                    ${formatPrice(itemTotal)}
                </strong>


                <button
                    type="button"
                    class="remove-item-btn"
                    data-id="${item.id}"
                >

                    <i class="fa-solid fa-trash"></i>

                    Remove

                </button>

            </div>

        `;


        cartItems.appendChild(card);

    });


    updateSummary();

    attachCartButtons();

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const subtotal =
        calculateSubtotal();


    cartSubtotal.textContent =
        formatPrice(subtotal);


    /*
     * Delivery will be calculated
     * during checkout.
     */

    cartDelivery.textContent =
        "Calculated at checkout";


    /*
     * For now total equals subtotal.
     * Delivery will be added later.
     */

    cartTotal.textContent =
        formatPrice(subtotal);

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(id) {

    const item =
        cart.find(
            product => product.id === id
        );


    if (!item) return;


    item.quantity =
        Number(item.quantity || 0) + 1;


    saveCart();

    displayCart();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(id) {

    const item =
        cart.find(
            product => product.id === id
        );


    if (!item) return;


    item.quantity =
        Number(item.quantity || 0) - 1;


    /*
     * Automatically remove the product
     * when quantity reaches zero.
     */

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                product => product.id !== id
            );

    }


    saveCart();

    displayCart();

}


/* =========================================
   REMOVE ITEM
========================================= */

function removeItem(id) {

    const item =
        cart.find(
            product => product.id === id
        );


    if (!item) return;


    cart =
        cart.filter(
            product => product.id !== id
        );


    saveCart();

    displayCart();

}


/* =========================================
   CART BUTTONS
========================================= */

function attachCartButtons() {


    document
        .querySelectorAll(".increase-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    increaseQuantity(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".decrease-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    decreaseQuantity(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".remove-item-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeItem(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================
   CHECKOUT
========================================= */

checkoutBtn?.addEventListener(
    "click",
    () => {

        if (!cart.length) {

            return;

        }


        /*
         * Checkout page will be created next.
         */

        window.location.href =
            "checkout.html";

    }
);


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
   LOGOUT
========================================= */

logoutBtn?.addEventListener(
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

            localStorage.removeItem(
                "piusCart"
            );


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to log out. Please try again."
            );

        }

    }
);


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

    }
);


/* =========================================
   INITIALIZE
========================================= */

displayCart();
