import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

const bookingList = document.getElementById('bookingList');
let selectedBookingId = "";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const q = query(collection(db, "bookings"), where("customerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        bookingList.innerHTML = "";
        if (querySnapshot.empty) {
            bookingList.innerHTML = "<p class='text-center'>No bookings found.</p>";
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const bookingCard = `
                <div class="card mb-3 p-3">
                    <h5>${data.service}</h5>
                    <p>Provider: ${data.provider}</p>
                    <p>Date: ${data.selectedDate}, Time: ${data.selectedTime}</p>
                    <p>Status: <span class="badge bg-${data.status === 'Completed' ? 'success' : 'warning'}">${data.status}</span></p>
                    ${data.status === 'Completed' && !data.review ? `<button class="btn btn-review" data-id="${doc.id}" data-bs-toggle="modal" data-bs-target="#reviewModal">Leave a Review</button>` : "<p>Review Submitted</p>"}
                </div>
            `;
            bookingList.innerHTML += bookingCard;
        });

        document.querySelectorAll('.btn-review').forEach(button => {
            button.addEventListener('click', function () {
                selectedBookingId = this.getAttribute('data-id');
            });
        });
    } else {
        bookingList.innerHTML = "<p class='text-center'>Please log in to view your bookings.</p>";
    }
});

// Handle review submission
const submitReviewBtn = document.getElementById('submitReview');
submitReviewBtn.addEventListener('click', async () => {
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;

    if (!rating || !review) {
        alert("Please provide both rating and review.");
        return;
    }

    try {
        await updateDoc(doc(db, "bookings", selectedBookingId), {
            rating: parseInt(rating),
            review: review
        });
        alert("Review submitted successfully!");
        location.reload();
    } catch (error) {
        console.error("Error submitting review: ", error);
        alert("Failed to submit review. Please try again.");
    }
});
