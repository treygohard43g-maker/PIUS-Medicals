/* =========================================
   PIUS MEDICAL ACCESSORIES
   DASHBOARD
========================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");

const logoutBtn =
    document.getElementById("logoutBtn");

const userName =
    document.getElementById("userName");

const productSearch =
    document.getElementById("productSearch");

const productGrid =
    document.getElementById("productGrid");

const cartCount =
    document.getElementById("cartCount");

const menuCartCount =
    document.getElementById("menuCartCount");

const cartBtn =
    document.getElementById("cartBtn");

const healthHubBtn =
    document.getElementById("healthHubBtn");


/* =========================================
   USD CURRENCY FORMATTER
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
   PRODUCT DATA
========================================= */

const products = [

    {
        id: "patient-monitor",
        name: "Patient Monitor",
        category: "Hospital Equipment",
        price: 340,
        icon: "fa-heart-pulse"
    },

    {
        id: "hospital-bed",
        name: "Hospital Bed",
        category: "Hospital Equipment",
        price: 490,
        icon: "fa-bed"
    },

    {
        id: "digital-bp-monitor",
        name: "Digital Blood Pressure Monitor",
        category: "Diagnostic Equipment",
        price: 65,
        icon: "fa-heart-pulse"
    },

    {
        id: "pulse-oximeter",
        name: "Pulse Oximeter",
        category: "Diagnostic Equipment",
        price: 20,
        icon: "fa-lungs"
    },

    {
        id: "digital-thermometer",
        name: "Digital Thermometer",
        category: "Medical Supplies",
        price: 10,
        icon: "fa-temperature-half"
    },

    {
        id: "wheelchair",
        name: "Medical Wheelchair",
        category: "Mobility & Care",
        price: 135,
        icon: "fa-wheelchair"
    },

    {
        id: "examination-lamp",
        name: "Examination Lamp",
        category: "Hospital Equipment",
        price: 70,
        icon: "fa-lightbulb"
    },

    {
        id: "stethoscope",
        name: "Professional Stethoscope",
        category: "Diagnostic Equipment",
        price: 35,
        icon: "fa-stethoscope"
    }

];


/* =========================================
   CART
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
   UPDATE CART COUNT
========================================= */

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
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
   ADD TO CART
========================================= */

function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) return;


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity += 1;

    }

    else {

        cart.push({

            id: product.id,

            name: product.name,

            category: product.category,

            price: product.price,

            quantity: 1

        });

    }


    saveCart();

    updateCartCount();


    showCartMessage(
        `${product.name} added to cart.`
    );

}


/* =========================================
   CART MESSAGE
========================================= */

function showCartMessage(message) {

    const oldMessage =
        document.querySelector(
            ".dashboard-cart-message"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const messageBox =
        document.createElement("div");


    messageBox.className =
        "dashboard-cart-message";


    messageBox.textContent =
        message;


    document.body.appendChild(
        messageBox
    );


    setTimeout(() => {

        messageBox.classList.add(
            "show"
        );

    }, 10);


    setTimeout(() => {

        messageBox.classList.remove(
            "show"
        );


        setTimeout(() => {

            messageBox.remove();

        }, 300);

    }, 2500);

}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(list) {

    if (!productGrid) return;


    productGrid.innerHTML = "";


    if (!list.length) {

        productGrid.innerHTML = `

            <div class="no-products">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>No products found</h3>

                <p>
                    Try another product name or category.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement("article");


        card.className =
            "dashboard-product-card";


        card.innerHTML = `

            <button
                class="product-favorite"
                type="button"
                data-favorite="${product.id}"
                aria-label="Save product"
            >

                <i class="fa-regular fa-heart"></i>

            </button>


            <div class="product-image-placeholder">

                <i class="fa-solid ${product.icon}"></i>

            </div>


            <div class="product-card-content">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <strong class="product-price">
                    ${formatPrice(product.price)}
                </strong>


                <button
                    class="add-to-cart-btn"
                    type="button"
                    data-product="${product.id}"
                >

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

            </div>

        `;


        productGrid.appendChild(card);

    });


    attachProductButtons();

}


/* =========================================
   PRODUCT BUTTONS
========================================= */

function attachProductButtons() {

    document
        .querySelectorAll(".add-to-cart-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        button.dataset.product
                    );

                }
            );

        });


    document
        .querySelectorAll(".product-favorite")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    button.classList.toggle(
                        "saved"
                    );


                    const icon =
                        button.querySelector("i");


                    if (
                        button.classList.contains(
                            "saved"
                        )
                    ) {

                        icon.className =
                            "fa-solid fa-heart";

                    }

                    else {

                        icon.className =
                            "fa-regular fa-heart";

                    }

                }
            );

        });

}


/* =========================================
   SEARCH
========================================= */

if (productSearch) {

    productSearch.addEventListener(
        "input",
        () => {

            const search =
                productSearch.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                displayProducts(
                    products
                );

                return;

            }


            const filtered =
                products.filter(
                    product =>

                        product.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.category
                            .toLowerCase()
                            .includes(search)
                );


            displayProducts(
                filtered
            );

        }
    );

}


/* =========================================
   MENU
========================================= */

function openMenu() {

    sideMenu?.classList.add("open");

    menuOverlay?.classList.add("show");

    document.body.classList.add(
        "menu-open"
    );

}


function closeMenu() {

    sideMenu?.classList.remove("open");

    menuOverlay?.classList.remove("show");

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
   HEALTH HUB
========================================= */

healthHubBtn?.addEventListener(
    "click",
    () => {

        window.location.href =
            "health.html";

    }
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
   FIREBASE USER
========================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        let name =
            user.displayName;


        if (!name) {

            try {

                const userDoc =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (userDoc.exists()) {

                    name =
                        userDoc.data().name;

                }

            }

            catch (error) {

                console.error(
                    "Profile loading error:",
                    error
                );

            }

        }


        if (userName) {

            userName.textContent =
                name || "Customer";

        }


        localStorage.setItem(
            "firebaseUser",
            user.uid
        );

    }
);


/* =========================================
   INITIALIZE
========================================= */

displayProducts(
    products
);

updateCartCount();
