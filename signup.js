// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// Function to select role
window.selectRole = function (role) {
    document.getElementById("customer-btn").classList.remove("active");
    document.getElementById("provider-btn").classList.remove("active");

    document.getElementById(role + "-btn").classList.add("active"); // ✅ Fixed button selection issue
    selectedRole = role;
};

// Function to sign up
window.signUp = async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validate inputs
    if (!name || !address || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        // Create user with email & password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Determine collection based on role
        const collectionName = selectedRole === "customer" ? "customers" : "providers";

        // Store user details in Firestore within the correct collection
        await setDoc(doc(db, collectionName, user.uid), {
            name: name,
            address: address,
            email: email,
            role: selectedRole, // Store selected role
            uid: user.uid
        });

        alert("Signup successful! A verification email has been sent.");

        // Redirect user based on role
        if (selectedRole === "customer") {
            window.location.href = "login.html"; // Redirect to customer dashboard
        } else {
            window.location.href = "login.html"; // Redirect to provider dashboard
        }

    } catch (error) {
        alert("Error: " + error.message);
    }
};
