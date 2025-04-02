import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 🔹 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZZlnBJ8Fuvt-o6IGYslESjHo2O6KKPVI",
    authDomain: "helphour-67342.firebaseapp.com",
    projectId: "helphour-67342",
    storageBucket: "helphour-67342.appspot.com",
    messagingSenderId: "67494683968",
    appId: "1:67494683968:web:d917341deb2fefb05906a5",
    measurementId: "G-W1EWD6YD6M"
  };

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Function to determine user type (Customer or Provider)
async function getUserType(userId) {
    const customerRef = doc(db, "customers", userId);
    const providerRef = doc(db, "providers", userId);

    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) return { type: "customers", data: customerSnap.data() };

    const providerSnap = await getDoc(providerRef);
    if (providerSnap.exists()) return { type: "providers", data: providerSnap.data() };

    return null;
}

// 🔹 Fetch and display user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User ID:", user.uid);
        const userTypeData = await getUserType(user.uid);

        if (userTypeData) {
            const { type, data } = userTypeData;
            console.log("User Data:", data);

            document.getElementById("profile-name").innerText = data.name || "No Name";
            document.getElementById("profile-phone").innerText = data.phone || "Not set";
            document.getElementById("profile-email").innerText = user.email || "Not set"; // From Firebase Auth
            document.getElementById("profile-address").innerText = data.address || "Not set";

            // Only show experience if user is a provider
            if (type === "providers") {
                document.getElementById("profile-experience").innerText = data.experience || "Not set";
                document.getElementById("edit-experience").value = data.experience || "";
            } else {
                document.getElementById("profile-experience").style.display = "none";
                document.getElementById("edit-experience").style.display = "none";
            }

            // Prefill edit fields
            document.getElementById("edit-name").value = data.name || "";
            document.getElementById("edit-phone").value = data.phone || "";
            document.getElementById("edit-email").value = user.email; // Read-only
            document.getElementById("edit-address").value = data.address || "";
        } else {
            console.log("User document not found!");
        }
    } else {
        console.log("No user logged in!");
        window.location.href = "../login.html"; // Redirect to login if not logged in
    }
});

// 🔹 Save Profile Updates
window.saveProfile = async function (event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userTypeData = await getUserType(user.uid);
    if (!userTypeData) return alert("User data not found!");

    const { type } = userTypeData;
    const userRef = doc(db, type, user.uid);

    await updateDoc(userRef, {
        name: document.getElementById("edit-name").value,
        phone: document.getElementById("edit-phone").value,
        address: document.getElementById("edit-address").value,
        ...(type === "providers" && { experience: document.getElementById("edit-experience").value })
    });

    alert("Profile Updated Successfully!");
    location.reload();
};
