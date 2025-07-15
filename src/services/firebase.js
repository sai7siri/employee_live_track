// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  projectId: import.meta.env.VITE_PROJECTID,
  authDomain: "livelocation-1124c.firebaseapp.com",
  storageBucket: "livelocation-1124c.firebasestorage.app",
  messagingSenderId: "580784170474",
  appId: "1:580784170474:web:96fe6fcc2373f97b2ffe93",
  measurementId: "G-ZCECECV5NC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);