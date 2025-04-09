// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD2PF-a07j3bWdP6I0tVM9lxLo2jzF0UTw",
    authDomain: "maps-1e1db.firebaseapp.com",
    projectId: "maps-1e1db",
    storageBucket: "maps-1e1db.appspot.com",
    messagingSenderId: "540203341221",
    appId: "1:540203341221:web:20d1544e3f665320c4844c",
    measurementId: "G-460YHD98Z7"
  };

// Initialize Firebase
/*const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);*/
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };