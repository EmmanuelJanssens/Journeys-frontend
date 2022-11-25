// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import {
    browserLocalPersistence,
    browserSessionPersistence,
    getAuth,
    initializeAuth,
    setPersistence
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "my-journeys-361916.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_BUCKET
};

const fbapp = initializeApp(firebaseConfig);
const storage = getStorage(fbapp, import.meta.env.VITE_FIREBASE_BUCKET);

const auth = getAuth(fbapp);

export const storageRef = ref(storage, "images/");
export const authApp = auth;
export const firebaseApp = fbapp;
