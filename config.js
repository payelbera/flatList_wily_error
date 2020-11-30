import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyAUK15J3YDbZlNerEUyNme73M80x90TG4Y",
  authDomain: "wily-app-81eff.firebaseapp.com",
  databaseURL: "https://wily-app-81eff.firebaseio.com",
  projectId: "wily-app-81eff",
  storageBucket: "wily-app-81eff.appspot.com",
  messagingSenderId: "100598404970",
  appId: "1:100598404970:web:8fae6d172fa7073dd33713"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();
