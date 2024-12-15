// main colors

#222831
#393E46
#00ADB5
#EEEEEE
///////////////////////////////////////////////

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyBNI-Vm0Fr5A2jzHAGOYczmh7xVx9m9S-Q",
authDomain: "chatio-601bc.firebaseapp.com",
projectId: "chatio-601bc",
storageBucket: "chatio-601bc.firebasestorage.app",
messagingSenderId: "665112128475",
appId: "1:665112128475:web:40d65dc606d6705fcc55fe",
measurementId: "G-GHVC888PDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
