import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAg_txH-UmG4WBlYRcEti3yvWnpnT0tPGc",
  authDomain: "hotel-satyam.firebaseapp.com",
  databaseURL: "https://hotel-satyam-default-rtdb.firebaseio.com",
  projectId: "hotel-satyam",
  storageBucket: "hotel-satyam.firebasestorage.app",
  messagingSenderId: "1055875558521",
  appId: "1:1055875558521:web:afd8661ee1bbe2b93fb8a8",
  measurementId: "G-4TLC52X22T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, ref, set, onValue, remove, auth };
