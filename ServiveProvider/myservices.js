import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    addDoc, 
    getDocs, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

let currentUser;

// ✅ Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loadServices();
    } else {
        console.log("User not logged in.");
        window.location.href = "../login.html"; // Redirect to login if not logged in
    }
});

// ✅ Function to add a new service (Stored under "services" collection)
window.addService = async function(event) {
    event.preventDefault();
    
    if (!currentUser) return alert("Please log in first!");

    const serviceName = document.getElementById("service-name").value.trim();
    const serviceDescription = document.getElementById("service-description").value.trim();

    if (serviceName === "" || serviceDescription === "") {
        return alert("Please fill in all fields.");
    }

    // Fetch provider details
    const providerRef = doc(db, "providers", currentUser.uid);
    const providerSnap = await getDoc(providerRef);

    if (!providerSnap.exists()) {
        return alert("Provider data not found!");
    }

    const providerData = providerSnap.data();

    // ✅ Store new service under "services" collection
    await addDoc(collection(db, "services"), {
        providerId: currentUser.uid,
        serviceName: serviceName,
        serviceDescription: serviceDescription,
        providerName: providerData.name || "No Name",
        providerPhone: providerData.phone || "Not set",
        providerEmail: providerData.email || "Not set",
        providerAddress: providerData.address || "Not set",
        createdAt: new Date()
    });

    alert("Service added successfully!");
    document.getElementById("serviceForm").reset();
    hideServiceForm();
    loadServices();
};

// ✅ Function to load and display services from the "services" collection
async function loadServices() {
    if (!currentUser) return;

    const servicesList = document.getElementById("servicesList");
    servicesList.innerHTML = "<p>Loading services...</p>";

    const querySnapshot = await getDocs(collection(db, "services"));
    servicesList.innerHTML = ""; 

    querySnapshot.forEach((doc) => {
        const service = doc.data();
        if (service.providerId === currentUser.uid) {
            servicesList.innerHTML += `
                <div class="service-card">
                    <h3>${service.serviceName}</h3>
                    <p>${service.serviceDescription}</p>
                    <p><b>Provider:</b> ${service.providerName}</p>
                    <button class="btn btn-remove" onclick="deleteService('${doc.id}')">Remove</button>
                </div>
            `;
        }
    });
}

// ✅ Function to delete a service from "services" collection
window.deleteService = async function(serviceId) {
    if (confirm("Are you sure you want to remove this service?")) {
        await deleteDoc(doc(db, "services", serviceId));
        alert("Service removed!");
        loadServices();
    }
};
