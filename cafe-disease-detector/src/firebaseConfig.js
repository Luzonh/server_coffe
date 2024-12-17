// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Asegúrate de importar Firestore
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAZN4PIvNEwMZQDZWjSVVFzn10rAsx80BE",
    authDomain: "ia-coffee.firebaseapp.com",
    projectId: "ia-coffee",
    storageBucket: "ia-coffee.appspot.com",
    messagingSenderId: "175392642189",
    appId: "1:175392642189:web:65b57bd5422386104d3ec4",
    measurementId: "G-G0B3TCWP5Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa Firestore
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }; 
