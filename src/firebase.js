import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDtGnrXCxPyQjQ8VWSfNKRclyjfoRYrdik",
    authDomain: "pranjal-pathshala-255de.firebaseapp.com",
    projectId: "pranjal-pathshala-255de",
    storageBucket: "pranjal-pathshala-255de.firebasestorage.app",
    messagingSenderId: "277261080997",
    appId: "1:277261080997:web:5dc559d3495bbb73b7704c"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
