import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCwzCvYAcbRM0e7u6kgYy_21YAGvXUA6es",
  authDomain: "utilizationpage.firebaseapp.com",
  projectId: "utilizationpage",
  storageBucket: "utilizationpage.firebasestorage.app",
  messagingSenderId: "92425443246",
  appId: "1:92425443246:web:cb3255454e583ce67b1a3f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
