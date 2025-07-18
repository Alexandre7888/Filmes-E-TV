// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4THzGt-8NwPDmWuaqR4OTJR_6XbfbSvM",
  authDomain: "api7-5cde7.firebaseapp.com",
  databaseURL: "https://api7-5cde7-default-rtdb.firebaseio.com",
  projectId: "api7-5cde7",
  storageBucket: "api7-5cde7.appspot.com",
  messagingSenderId: "113015470459",
  appId: "1:113015470459:web:3ffd77031fb936d001a5de"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };