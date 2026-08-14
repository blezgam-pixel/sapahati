import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const firebaseConfig = {
  apiKey: "AIzaSyAHKJbF6-S76TFYCZTMZkd0GMa0JJeReeY",
  authDomain: isLocalhost ? "sapahati-app.firebaseapp.com" : "sapahati.vercel.app",
  projectId: "sapahati-app",
  storageBucket: "sapahati-app.firebasestorage.app",
  messagingSenderId: "113416393039",
  appId: "1:113416393039:web:534b661a8a3f1ed473f53a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
