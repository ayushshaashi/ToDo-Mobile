// firebaseConfig.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAc6UMCF8yADlYh1IQy1mTmMQi25KEfdhQ",
  authDomain: "todoapp-99ef6.firebaseapp.com",
  databaseURL: "https://todoapp-99ef6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "todoapp-99ef6",
  storageBucket: "todoapp-99ef6.firebasestorage.app",
  messagingSenderId: "182136747651",
  appId: "1:182136747651:web:8b888190ef891d25928db6",
  measurementId: "G-YF2F1176K3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// NOTE: Auth will use memory persistence only
const auth = getAuth(app); 
const db = getFirestore(app);

export { auth, db };

