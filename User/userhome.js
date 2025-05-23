import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, updateDoc, collection, getDocs, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


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

// Handle Authentication & Fetch Customer Data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const customerRef = doc(db, "customers", user.uid);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
            const data = customerSnap.data();

            // Update Profile Dropdown
            document.getElementById("profile-name").innerText = data.name;
            document.getElementById("dropdown-name").innerText = data.name;
            document.getElementById("dropdown-email").innerText = data.email;
            document.getElementById("dropdown-address").innerText = data.address;
            document.getElementById("dropdown-phone").innerText = data.phone || "Not Set";
        } else {
            alert("Customer data not found!");
        }
    } else {
        alert("No user is logged in.");
    }
});

// Handle Profile Dropdown Toggle
const profileBtn = document.getElementById("profileDropdown");
const profileDropdownMenu = document.getElementById("profileDropdownMenu");
const profileDropdown = document.querySelector(".profile-dropdown");

profileDropdown.addEventListener("mouseenter", function () {
    profileDropdownMenu.style.display = "block";
});

profileDropdown.addEventListener("mouseleave", function () {
    profileDropdownMenu.style.display = "none";
});

profileBtn.addEventListener("click", function (event) {
    event.preventDefault();
    profileDropdown.classList.toggle("active");

    if (profileDropdown.classList.contains("active")) {
        profileDropdownMenu.style.display = "block";
    } else {
        profileDropdownMenu.style.display = "none";
    }
});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!profileDropdown.contains(event.target)) {
        profileDropdownMenu.style.display = "none";
        profileDropdown.classList.remove("active");
    }
});

// Show Edit Profile Modal
// Show Edit Profile Modal with current data
function showEditProfile() {
    // Fetch the current user's data from Firebase
    const user = auth.currentUser;
    if (!user) return; // If no user, exit

    const customerRef = doc(db, "customers", user.uid);
    getDoc(customerRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            
            // Populate the modal with current user data
            document.getElementById("edit-name").value = data.name || "";
            document.getElementById("edit-email").value = data.email || "";
            document.getElementById("edit-address").value = data.address || "";
            document.getElementById("edit-phone").value = data.phone || "";

            // Show the modal
            document.getElementById("editProfileModal").style.display = "block";
        } else {
            alert("No customer data found!");
        }
    }).catch((error) => {
        console.error("Error loading customer data:", error);
        alert("Failed to load profile data. Try again.");
    });
}


// Close Edit Profile Modal
function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

// Update Customer Profile in Firebase
// Update Customer Profile in Firebase
async function updateProfile(event) {
    event.preventDefault(); // Prevent form submission

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to update your profile.");
        return;
    }

    // Get values from the modal form
    const updatedName = document.getElementById("edit-name").value;
    const updatedEmail = document.getElementById("edit-email").value;
    const updatedAddress = document.getElementById("edit-address").value;
    const updatedPhone = document.getElementById("edit-phone").value;

    // Update Firebase Firestore document with new data
    const customerRef = doc(db, "customers", user.uid);
    try {
        await updateDoc(customerRef, {
            name: updatedName,
            email: updatedEmail,
            address: updatedAddress,
            phone: updatedPhone
        });

        alert("Profile Updated Successfully!");

        // Reflect the updated values in the profile dropdown immediately
        document.getElementById("profile-name").innerText = updatedName;
        document.getElementById("dropdown-name").innerText = updatedName;
        document.getElementById("dropdown-email").innerText = updatedEmail;
        document.getElementById("dropdown-address").innerText = updatedAddress;
        document.getElementById("dropdown-phone").innerText = updatedPhone;

        // Close the modal
        closeEditProfile();
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Profile update failed. Try again.");
    }
}

// Load Service Providers
async function loadServiceProviders() {
    const providersList = document.getElementById("providersList");
    providersList.innerHTML = "<p>Loading service providers...</p>";

    const querySnapshot = await getDocs(collection(db, "services"));
    providersList.innerHTML = "";

    let count = 0; // Limit to 6 cards
    querySnapshot.forEach((docSnap) => {
        if (count >= 6) return;

        const service = docSnap.data();
        const encodedParams = new URLSearchParams({
            service: service.serviceName,
            provider: service.providerName,
            phone: service.providerPhone,
            email: service.providerEmail,
            rating: service.rating || "No Rating"
        }).toString();

        const providerCard = `
            <div class="provider-card">
                <img src="../assets/images/${service.serviceName.toLowerCase()}.jpg" 
                    alt="${service.serviceName}" 
                    class="provider-img"
                    onerror="this.onerror=null;this.src='../assets/images/default.jpg';">
                <h4>${service.serviceName}</h4>
                <p><b>Provider:</b> ${service.providerName}</p>
                <p><b>Phone:</b> ${service.providerPhone}</p>
                <p><b>Email:</b> ${service.providerEmail}</p>
                <div class="button-group">
                    <a href="booknow.html?${encodedParams}">
                        <button class="btn btn-warning">Book Slot</button>
                    </a>
                    <button class="btn btn-success book-now-btn"
                        data-service="${service.serviceName}"
                        data-provider="${service.providerName}"
                        data-phone="${service.providerPhone}"
                        data-email="${service.providerEmail}">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        providersList.innerHTML += providerCard;
        count++;
    });

    if (count === 0) {
        providersList.innerHTML = "<p>No service providers available.</p>";
    }

    // Ensure buttons are added after rendering
    setTimeout(() => {
        document.querySelectorAll(".book-now-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const serviceName = event.target.dataset.service;
                const providerName = event.target.dataset.provider;
                const providerPhone = event.target.dataset.phone;
                const providerEmail = event.target.dataset.email;
                bookNow(serviceName, providerName, providerPhone, providerEmail);
            });
        });
    }, 500);
}

loadServiceProviders();

// Book Now Function
async function bookNow(serviceName, providerName, providerPhone, providerEmail) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to book a service.");
        return;
    }

    const customerRef = doc(db, "customers", user.uid);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
        alert("Customer data not found!");
        return;
    }

    const customerData = customerSnap.data();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toLocaleTimeString();

    try {
        await addDoc(collection(db, "bookings"), {
            customerId: user.uid,
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone || "Not Provided",
            customerAddress: customerData.address || "Not Provided",
            provider: providerName,
            providerEmail: providerEmail,
            providerPhone: providerPhone,
            service: serviceName,
            selectedDate: formattedDate,
            selectedTime: formattedTime,
            status: "Pending",
            createdAt: serverTimestamp()
        });
        alert("Service booked successfully!");
    } catch (error) {
        console.error("Error booking service:", error);
        alert("Booking failed. Please try again.");
    }
}
