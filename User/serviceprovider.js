import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
function showEditProfile() {
    document.getElementById("editProfileModal").style.display = "block";
}

// Close Edit Profile Modal
function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

// Update Customer Profile in Firebase
async function updateProfile(event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const customerRef = doc(db, "customers", user.uid);
    await updateDoc(customerRef, {
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        address: document.getElementById("edit-address").value,
        phone: document.getElementById("edit-phone").value
    });

    alert("Profile Updated Successfully!");
    location.reload();
}    
    async function loadServiceProviders() {
    const providersList = document.getElementById("providersList");
    providersList.innerHTML = "<p>Loading service providers...</p>";

    const querySnapshot = await getDocs(collection(db, "services"));
    providersList.innerHTML = ""; // Clear loading text

    querySnapshot.forEach((doc) => {
        const service = doc.data();
        const encodedParams = new URLSearchParams({
            service: service.serviceName,
            provider: service.providerName,
            phone: service.providerPhone,
            email: service.providerEmail,
            rating: service.rating || "No Rating" // Handle missing rating
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
                <a href="booknow.html?${encodedParams}">
                    <button class="btn btn-warning">Book Slot</button>
                </a>
            </div>
        `;
        providersList.innerHTML += providerCard;
    });

    if (querySnapshot.empty) {
        providersList.innerHTML = "<p>No service providers available.</p>";
    }
}

loadServiceProviders();
