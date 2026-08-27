import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0171363442",
  appId: "1:1081350816182:web:2ed1db02ccf92569014117",
  apiKey: "AIzaSyAO9onDeWf_wlzjUCBBkUQ83DYJbYY9p0M",
  authDomain: "gen-lang-client-0171363442.firebaseapp.com",
  storageBucket: "gen-lang-client-0171363442.firebasestorage.app",
  messagingSenderId: "1081350816182"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
