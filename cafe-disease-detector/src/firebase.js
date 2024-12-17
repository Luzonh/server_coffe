// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAZN4PIvNEwMZQDZWjSVVFzn10rAsx80BE",

    authDomain: "ia-coffee.firebaseapp.com",
  
    projectId: "ia-coffee",
  
    storageBucket: "ia-coffee.appspot.com",
  
    messagingSenderId: "175392642189",
  
    appId: "1:175392642189:web:65b57bd5422386104d3ec4",
  
    measurementId: "G-G0B3TCWP5Y"
  
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa los servicios de Firebase
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
export { storage, firestore };

