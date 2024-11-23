// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBwfXJP6m6CRTXAtX_CrrK8wiqWtL_RS0",
  authDomain: "desarrollo-web-5da60.firebaseapp.com",
  projectId: "desarrollo-web-5da60",
  storageBucket: "desarrollo-web-5da60.appspot.com",
  messagingSenderId: "831087627514",
  appId: "1:831087627514:web:190677d942f51a41220d43",
  measurementId: "G-WP7X7WDHC2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
