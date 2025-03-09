// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage for future use
import { Platform } from "react-native"; 

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_XrEpItN1MIf0kd9jUe69yhrSbPRpxHI",
  authDomain: "helperhive-92eb3.firebaseapp.com",
  projectId: "helperhive-92eb3",
  storageBucket: "helperhive-92eb3.appspot.com",
  messagingSenderId: "868280060458",
  appId: "1:868280060458:web:bbcb79e7dac825f1c69153",
  measurementId: "G-LPR8PZ56WQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Firebase Storage initialization

// Prevent Analytics crash on React Native
let analytics;
if (Platform.OS === "web") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

// Log to check if Firebase is properly initialized
console.log("Firebase Initialized:", app);
console.log("Firestore Instance:", db);

// Export modules
export { auth, db, storage, analytics };
