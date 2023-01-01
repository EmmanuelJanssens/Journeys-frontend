// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJgfsYVyKqz9zgsa8hVZmYeVx6xJpYpGY",
    authDomain: "my-journeys-361916.firebaseapp.com",
    projectId: "my-journeys-361916",
    storageBucket: "my-journeys-361916.appspot.com",
    messagingSenderId: "188333725607",
    appId: "1:188333725607:web:c7fc338e84e76ebf554882",
    measurementId: "G-SXM7DZNGG6"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: "my-journeys-361916.firebaseapp.com",
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID,
//     measurementId: import.meta.env.VITE_FIREBASE_BUCKET
// };

const fbapp = initializeApp(firebaseConfig);
const storage = getStorage(fbapp, import.meta.env.VITE_FIREBASE_BUCKET);

const auth = getAuth(fbapp);

export const storageRef = ref(storage, "images/");
export const authApp = auth;
export const firebaseApp = fbapp;
