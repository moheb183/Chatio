
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBNI-Vm0Fr5A2jzHAGOYczmh7xVx9m9S-Q",
    authDomain: "chatio-601bc.firebaseapp.com",
    projectId: "chatio-601bc",
    storageBucket: "chatio-601bc.appspot.com",
    messagingSenderId: "665112128475",
    appId: "1:665112128475:web:40d65dc606d6705fcc55fe",
    measurementId: "G-GHVC888PDQ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);



