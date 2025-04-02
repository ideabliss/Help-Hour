// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZZlnBJ8Fuvt-o6IGYslESjHo2O6KKPVI",
    authDomain: "helphour-67342.firebaseapp.com",
    projectId: "helphour-67342",
    storageBucket: "helphour-67342.appspot.com",
    messagingSenderId: "67494683968",
    appId: "1:67494683968:web:d917341deb2fefb05906a5",
    measurementId: "G-W1EWD6YD6M"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let selectedRole = "customer"; // Default role

// ✅ Function to select role
window.selectRole = function (role) {
    document.getElementById("customer-btn").classList.remove("active");
    document.getElementById("provider-btn").classList.remove("active");
    document.getElementById(`${role}-btn`).classList.add("active");
    selectedRole = role; // Store selected role
};

// ✅ Function to login
window.login = async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in both email and password.");
        return;
    }

    try {
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Determine Firestore collection based on selected role
        const collectionName = selectedRole === "customer" ? "customers" : "providers";

        // Fetch user role from the correct Firestore collection
        const userDocRef = doc(db, collectionName, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role; // Get role from Firestore

            // ✅ Check if the selected role matches the database role
            if (userRole !== selectedRole) {
                alert(`Incorrect role selected. You are registered as ${userRole}.`);
                return;
            }

            alert(`Login successful! Redirecting as ${userRole}...`);

            // Redirect based on role
            if (userRole === "customer") {
                window.location.href = "User/userhome.html"; // ✅ Redirect to customer page
            } else if (userRole === "provider") {
                window.location.href = "ServiveProvider/dashboard.html"; // ✅ Redirect to provider page
            } else {
                alert("Unknown role. Please contact support.");
            }
        } else {
            alert("User data not found. Please contact support.");
        }
    } catch (error) {
        alert("Login failed: " + error.message);
    }
};

// ✅ Function to reset password
window.forgotPassword = async function () {
    const email = document.getElementById("email").value.trim();
    if (!email) {
        alert("Please enter your email to reset the password.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent! Check your email.");
    } catch (error) {
        alert("Error: " + error.message);
    }
};
