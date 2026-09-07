/* =========================================
   PIUS MEDICAL ACCESSORIES
   FIREBASE CONFIGURATION
========================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyBunp-cnw5oILtJVD9ZnD2AIQz-hIT_jAs",

    authDomain:
        "pius-medical-accesories.firebaseapp.com",

    projectId:
        "pius-medical-accesories",

    storageBucket:
        "pius-medical-accesories.firebasestorage.app",

    messagingSenderId:
        "979113889667",

    appId:
        "1:979113889667:web:befdb30abc64b52ef230b6",

    measurementId:
        "G-48F414Y22K"
};


/* Initialize Firebase */

const app = initializeApp(firebaseConfig);


/* Firebase Authentication */

const auth = getAuth(app);


/* Firestore Database */

const db = getFirestore(app);


/* Make available to other files */

export {
    app,
    auth,
    db
};