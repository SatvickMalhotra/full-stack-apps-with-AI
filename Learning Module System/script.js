// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "-",
    authDomain: "-..com",
    databaseURL: "https://---rtdb..com",
    projectId: "-",
    storageBucket: "..app",
    messagingSenderId: "",
    appId: "1::web:"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing auth on login page
    if (window.location.pathname.includes('index.html')) {
        sessionStorage.removeItem('currentUser');
    }
    
    const customerLoginForm = document.getElementById('customerLoginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');

    // Customer login
    customerLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'users/customers'));
            const customers = snapshot.val();
            
            let isValidCustomer = false;
            Object.values(customers).forEach(customer => {
                if (customer.email === email && customer.password === password) {
                    isValidCustomer = true;
                }
            });

            if (isValidCustomer) {
                const safeEmail = email.replace(/[.#$[\]]/g, '_');
                sessionStorage.setItem('currentUser', safeEmail);
                window.location.href = 'customer.html';
                alert(`Login successful ${safeEmail}`);
            } else {
                alert('Invalid customer credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });

    // Admin login with multiple admins
    adminLoginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'users/admins')); // Changed from admin to admins
            const admins = snapshot.val();

            // Check if the provided credentials match any admin
            let isValidAdmin = false;
            Object.values(admins).forEach(admin => {
                if (admin.email === email && admin.password === password) {
                    isValidAdmin = true;
                }
            });

            if (isValidAdmin) {
                const safeEmail = email.replace(/[.#$[\]]/g, '_');
                sessionStorage.setItem('currentUser', safeEmail);
                sessionStorage.setItem('userRole', 'admin');
                window.location.href = 'admin.html';
                alert('Logged in as admin');
            } else {
                alert('Invalid admin credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton?.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        window.location.href = 'index.html';
    });
});
