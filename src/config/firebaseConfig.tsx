// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import {getMessaging} from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyD4dHHjOVadAQgKxJjyZiTgZNDOKesLSp4",
  authDomain: "chanda-home-essentials.firebaseapp.com",
  projectId: "chanda-home-essentials",
  storageBucket: "chanda-home-essentials.firebasestorage.app",
  messagingSenderId: "252729417304",
  appId: "1:252729417304:web:464a826ff50c8840ae342d",
  measurementId: "G-9WVJG5KDJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");
export const messaging = getMessaging(app);

setPersistence(auth, browserLocalPersistence);