// authCheck.js
function checkAuth() {
    // Get current page
    const currentPage = window.location.pathname;
    const isCustomerPage = currentPage.includes('customer.html');
    const isAdminPage = currentPage.includes('admin.html');
    
    // Get stored auth
    const userAuth = sessionStorage.getItem('currentUser');
    
    // If on protected pages and no auth, redirect
    if ((isCustomerPage || isAdminPage) && !userAuth) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Run check immediately
if (!checkAuth()) {
    alert('Please login first!');
}

// Run check on any navigation
window.addEventListener('load', () => {
    if (!checkAuth()) {
        alert('Please login first!');
    }
});

// Block back button after logout
window.addEventListener('popstate', () => {
    if (!checkAuth()) {
        alert('Please login first!');
    }
});

export { checkAuth };