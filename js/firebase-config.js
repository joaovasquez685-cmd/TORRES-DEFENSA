import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCixSAdSyEHO8abY6BIgSmDi-79YqyGOXc",
  authDomain: "tower-defense-patrones.firebaseapp.com",
  projectId: "tower-defense-patrones",
  storageBucket: "tower-defense-patrones.firebasestorage.app",
  messagingSenderId: "768649003765",
  appId: "1:768649003765:web:b8a4e0316a6f3e56fc7bbc"
};

export const db = getFirestore(initializeApp(firebaseConfig));
