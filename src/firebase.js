import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC_uYkmeTKfwvm5hYB2AK5lT1VYmgp3PbA",
  authDomain: "ml-library-73126.firebaseapp.com",
  projectId: "ml-library-73126",
  storageBucket: "ml-library-73126.firebasestorage.app",
  messagingSenderId: "1087006285776",
  appId: "1:1087006285776:web:7688180950cb9acaf9e3d5",
  measurementId: "G-LY4GVJ79GV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);