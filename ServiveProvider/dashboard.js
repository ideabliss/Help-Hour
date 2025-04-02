import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc 
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

// Fetch provider details
async function fetchProviderData(user) {
    try {
        const providerDocRef = doc(db, "providers", user.uid);
        const providerDoc = await getDoc(providerDocRef);

        if (providerDoc.exists()) {
            const providerData = providerDoc.data();
            document.querySelector(".dashboard-header p").textContent = `Welcome, ${providerData.name}`;
        } else {
            document.querySelector(".dashboard-header p").textContent = "Welcome, Provider";
        }
    } catch (error) {
        console.error("Error fetching provider data:", error);
    }
}

// Fetch service requests
async function fetchServiceRequests(providerEmail) {
    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("providerEmail", "==", providerEmail));
        const querySnapshot = await getDocs(q);
        const tableBody = document.querySelector("tbody");
        tableBody.innerHTML = "";

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.customerName}</td>
                <td>${data.service}</td>
                <td>${data.customerAddress}</td>
                <td>${data.customerPhone || "Not Provided"}</td>
                <td>${data.selectedDate} ${data.selectedTime}</td>
                <td id="status-${docSnapshot.id}">${data.status}</td>
                <td>
                    <button class="btn btn-accept">Accept</button>
                    <button class="btn btn-decline">Decline</button>
                    <button class="btn btn-complete">Complete</button>
                </td>
            `;

            // Attach event listeners to buttons
            const acceptBtn = row.querySelector(".btn-accept");
            const declineBtn = row.querySelector(".btn-decline");
            const completeBtn = row.querySelector(".btn-complete");

            // Disable buttons based on status
            if (data.status === "Rejected" || data.status === "Completed") {
                acceptBtn.disabled = true;
                declineBtn.disabled = true;
                completeBtn.disabled = true;
            } else if (data.status === "In Progress") {
                acceptBtn.disabled = true;
                declineBtn.disabled = true;
                completeBtn.disabled = false;
            }

            // Add event listeners with validation
            acceptBtn.addEventListener("click", () => updateBookingStatus(docSnapshot.id, "In Progress", acceptBtn, declineBtn, completeBtn));
            declineBtn.addEventListener("click", () => updateBookingStatus(docSnapshot.id, "Rejected", acceptBtn, declineBtn, completeBtn));
            completeBtn.addEventListener("click", () => {
                if (data.status === "Pending") {
                    alert("Only 'In Progress' bookings can be marked as completed.");
                } else {
                    updateBookingStatus(docSnapshot.id, "Completed", acceptBtn, declineBtn, completeBtn);
                }
            });

            // Show alert if user clicks disabled buttons
            [acceptBtn, declineBtn, completeBtn].forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    if (btn.disabled) {
                        event.preventDefault();
                        alert("You cannot change the status after rejection or completion.");
                    }
                });
            });

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching service requests:", error);
    }
}
// Function to update booking status
window.updateBookingStatus = async function (bookingId, newStatus, acceptBtn, declineBtn, completeBtn) {
    try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) {
            alert("Booking not found.");
            return;
        }

        const currentStatus = bookingSnap.data().status;

        // Prevent invalid status changes
        if (currentStatus === "Rejected" || currentStatus === "Completed") {
            alert("You cannot change the status after it has been rejected or completed.");
            return;
        }
        if (newStatus === "Completed" && currentStatus !== "In Progress") {
            alert("Only 'In Progress' bookings can be marked as completed.");
            return;
        }

        await updateDoc(bookingRef, { status: newStatus });

        // Update status in UI dynamically
        document.getElementById(`status-${bookingId}`).textContent = newStatus;

        // Disable buttons based on new status and reduce opacity
        if (newStatus === "Rejected" || newStatus === "Completed") {
            acceptBtn.disabled = true;
            declineBtn.disabled = true;
            completeBtn.disabled = true;
            acceptBtn.style.opacity = "0.5";
            declineBtn.style.opacity = "0.5";
            completeBtn.style.opacity = "0.5";
        } else if (newStatus === "In Progress") {
            acceptBtn.disabled = true;
            declineBtn.disabled = true;
            completeBtn.disabled = false;
            acceptBtn.style.opacity = "0.5";
            declineBtn.style.opacity = "0.5";
            completeBtn.style.opacity = "1";
        }

        alert(`Booking status updated to: ${newStatus}`);
    } catch (error) {
        console.error("Error updating booking status:", error);
    }
};


// Fetch service statistics
async function fetchServiceStats(providerEmail) {
    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("providerEmail", "==", providerEmail));
        const querySnapshot = await getDocs(q);

        let totalRequests = 0, completedServices = 0, pendingServices = 0;

        querySnapshot.forEach((docSnapshot) => {
            totalRequests++;
            const data = docSnapshot.data();
            if (data.status === "Completed") {
                completedServices++;
            } else if (data.status === "In Progress") {
                pendingServices++;
            }
        });

        // Update the dashboard cards
        document.getElementById("total-requests").textContent = totalRequests;
        document.getElementById("completed-services").textContent = completedServices;
        document.getElementById("pending-services").textContent = pendingServices;

    } catch (error) {
        console.error("Error fetching service statistics:", error);
    }
}

// Check if a provider is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchProviderData(user);
        fetchServiceRequests(user.email);
        fetchServiceStats(user.email);
    } else {
        window.location.href = "../login.html";
    }
});
