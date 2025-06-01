import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAg_txH-UmG4WBlYRcEti3yvWnpnT0tPGc",
  authDomain: "hotel-satyam.firebaseapp.com",
  databaseURL: "https://hotel-satyam-default-rtdb.firebaseio.com",
  projectId: "hotel-satyam",
  storageBucket: "hotel-satyam.appspot.com",
  messagingSenderId: "1055875558521",
  appId: "1:1055875558521:web:afd8661ee1bbe2b93fb8a8",
  measurementId: "G-4TLC52X22T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export { ref, set, onValue, remove };
