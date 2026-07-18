import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDsYykcqXi9MwKoyndEGyPC-AXZy0OHC5c",
  authDomain: "xasilmedyaajan.firebaseapp.com",
  databaseURL: "https://xasilmedyaajan-default-rtdb.firebaseio.com",
  projectId: "xasilmedyaajan",
  storageBucket: "xasilmedyaajan.firebasestorage.app",
  messagingSenderId: "711223515957",
  appId: "1:711223515957:web:30cfd2793ec10377024a7c",
  measurementId: "G-4NX8FSCC8E"
};

export const isFirebaseEnabled = true;

let firebaseApp;
let firestoreDb: any = null;
let firebaseAuth: any = null;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  firestoreDb = getFirestore(firebaseApp);
  firebaseAuth = getAuth(firebaseApp);
  console.log("Firebase initialized successfully with live Xasil Yerli Ajan Medya parameters!");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

export { firestoreDb as db, firebaseAuth as auth };

