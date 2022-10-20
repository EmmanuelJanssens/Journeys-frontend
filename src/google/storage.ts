// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";

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
const fbapp = initializeApp(firebaseConfig);
const storage = getStorage(fbapp, "gs://journeys-v2");
export const storageRef = ref(storage, "images/");
