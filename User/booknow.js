import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBNtC71ZHCJffBT9A7-BYgCBjgPkJjBsD4",
    authDomain: "helphour-5eb6b.firebaseapp.com",
    projectId: "helphour-5eb6b",
    storageBucket: "helphour-5eb6b.appspot.com",
    messagingSenderId: "249632237594",
    appId: "1:249632237594:web:ca0daad37e69958f2509a3",
    measurementId: "G-2P4YER9QCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let selectedTime = "";

// Fetch service provider details from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service') || "Unknown Service";
const provider = urlParams.get('provider') || "Unknown Provider";
const phone = urlParams.get('phone') || "Not Available";
const email = urlParams.get('email') || "Not Available";

// Handle time slot selection
document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function () {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        selectedTime = this.textContent;
    });
});

// Handle booking confirmation and store in Firestore
document.getElementById('confirmBooking').addEventListener('click', async function () {
    const selectedDate = document.getElementById('date').value;
    
    if (!selectedDate || !selectedTime) {
        alert("Please select a date and time slot before booking.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to book a service.");
        return;
    }

    try {
        // Fetch customer details from Firestore
        const customerRef = doc(db, "customers", user.uid);
        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) {
            alert("Customer details not found. Please update your profile.");
            return;
        }

        const customerData = customerSnap.data();

        // Store booking details in Firestore
        await addDoc(collection(db, "bookings"), {
            customerId: user.uid,
            customerName: customerData.name || "Unknown",
            customerEmail: customerData.email || user.email,
            customerPhone: customerData.phone || "Not Provided",
            customerAddress: customerData.address || "Not Provided",
            service: service,
            provider: provider,
            providerPhone: phone,
            providerEmail: email,
            selectedDate: selectedDate,
            selectedTime: selectedTime,
            status: "Pending",
            createdAt: serverTimestamp()
        });

        // Show confirmation modal
        var myModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        myModal.show();
    } catch (error) {
        console.error("Error booking service: ", error);
        alert("Booking failed. Please try again.");
    }
});

// Ensure user is authenticated before booking
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("No user logged in.");
    } else {
        console.log("User logged in:", user.uid);
    }
});
