import firebase from '@react-native-firebase/app';
import { collection,getFirestore } from '@react-native-firebase/firestore';
// Your web app's Firebase configuration (use the same details as you have)
const firebaseConfig = {
  apiKey: "AIzaSyCOFFtTGvD-B7rhBva5pX13slbLv3HnZXA",
  authDomain: "nihaar-d5d2f.firebaseapp.com",
  projectId: "nihaar-d5d2f",
  storageBucket: "nihaar-d5d2f.appspot.com",
  messagingSenderId: "532552721085",
  appId: "1:532552721085:web:9ba14efd088d3329d8cdd4",
  measurementId: "G-FFBKMYK2VD"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = getFirestore(app)
export const datacollection = collection(db,"datacol")
export default firebase;