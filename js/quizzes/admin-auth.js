// js/quizzes/admin-auth.js
// Shared admin login for admin-generator.html and admin-delete.html.
// Firestore rules only allow writes from the admin UID, so both pages
// must sign in before touching quizQuestions.

import "../config/firebase.js"; // makes sure the Firebase app is initialised first
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();

export async function ensureAdmin() {
  if (auth.currentUser) return;

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  if (!email || !password) {
    throw new Error("Enter your admin email and password.");
  }

  await signInWithEmailAndPassword(auth, email, password);
}