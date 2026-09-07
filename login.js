import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./firebase.js";


const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.getElementById("forgotPassword");


/* =========================
   SHOW / HIDE PASSWORD
========================= */

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (loginPassword.type === "password") {

            loginPassword.type = "text";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            loginPassword.type = "password";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}

/* =========================
   LOGIN MESSAGE
========================= */

function showLoginMessage(message, type = "error") {

    loginMessage.textContent = message;

    if (type === "success") {
        loginMessage.style.color = "#16803c";
    } else {
        loginMessage.style.color = "#d93025";
    }

}


/* =========================
   LOGIN
========================= */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {

            showLoginMessage(
                "Please enter your email and password."
            );

            return;
        }


        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";
        loginMessage.textContent = "";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            /* Save basic login state */

            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("firebaseUser", user.uid);


            if (user.email) {
                localStorage.setItem(
                    "userEmail",
                    user.email
                );
            }


            showLoginMessage(
                "Login successful. Redirecting...",
                "success"
            );


            /* Go to dashboard */

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 500);


        } catch (error) {

            console.error("Login error:", error);


            let message =
                "Unable to log in. Please try again.";


            switch (error.code) {

                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/user-not-found":
                    message = "No account was found with this email.";
                    break;

                case "auth/wrong-password":
                    message = "Incorrect password.";
                    break;

                case "auth/invalid-credential":
                    message = "Incorrect email or password.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many login attempts. Please try again later.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection.";
                    break;

            }


            showLoginMessage(message);

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

        }

    });

}


/* =========================
   FORGOT PASSWORD
========================= */

if (forgotPassword) {

    forgotPassword.addEventListener("click", async (event) => {

        event.preventDefault();

        const email = loginEmail.value.trim();

        if (!email) {

            showLoginMessage(
                "Enter your email address first."
            );

            loginEmail.focus();

            return;
        }


        forgotPassword.style.pointerEvents = "none";
        forgotPassword.textContent = "Sending...";


        try {

            await sendPasswordResetEmail(auth, email);

            showLoginMessage(
                "Password reset email sent. Please check your inbox.",
                "success"
            );


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            let message =
                "Unable to send password reset email.";


            switch (error.code) {

                case "auth/invalid-email":
                    message =
                        "Please enter a valid email address.";
                    break;

                case "auth/user-not-found":
                    message =
                        "No account was found with this email.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many requests. Please try again later.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection.";
                    break;

            }


            showLoginMessage(message);

        } finally {

            forgotPassword.style.pointerEvents = "";
            forgotPassword.textContent = "Forgot Password?";

        }

    });

}


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Authenticated user:",
            user.uid
        );

    }

});