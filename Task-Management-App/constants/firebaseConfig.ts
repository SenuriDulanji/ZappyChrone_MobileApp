import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAlRP1Nou48N15JNuBoFOOYxvawqmXu1d8",
    authDomain: "task-managemet-app-fbfe3.firebaseapp.com",
    projectId: "task-managemet-app-fbfe3",
    storageBucket: "task-managemet-app-fbfe3.firebasestorage.app",
    messagingSenderId: "385238826666",
    appId: "1:385238826666:web:5ceaaf0357cadd887e1ad3",
    measurementId: "G-KZ61HED4X8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);