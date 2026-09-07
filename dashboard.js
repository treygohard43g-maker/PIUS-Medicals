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


/* =========================================
   OPEN MENU
========================================= */

function openMenu() {

    sideMenu.classList.add("open");

    menuOverlay.classList.add("show");

    document.body.classList.add("menu-open");

}


/* =========================================
   CLOSE MENU
========================================= */

function closeMenu() {

    sideMenu.classList.remove("open");

    menuOverlay.classList.remove("show");

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

}


/* =========================================
   FIREBASE AUTHENTICATION
========================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            /*
             * Nobody is logged in.
             * Send them back to login.
             */

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Logged-in user:",
            user.uid
        );


        /* =====================================
           DISPLAY USER NAME
        ===================================== */

        let name =
            user.displayName;


        /*
         * If Firebase Auth doesn't have
         * the name, get it from Firestore.
         */

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

                    const userData =
                        userDoc.data();

                    name =
                        userData.name;

                }

            }

            catch (error) {

                console.error(
                    "Unable to load user profile:",
                    error
                );

            }

        }


        if (userName) {

            userName.textContent =
                name || "Customer";

        }

    }
);


/* =========================================
   SEARCH
========================================= */

if (productSearch) {

    productSearch.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                const search =
                    productSearch.value.trim();


                if (!search) {

                    return;

                }


                window.location.href =
                    "products.html?search=" +
                    encodeURIComponent(search);

            }

        }
    );

}
