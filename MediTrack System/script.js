// Dynamic shadows based on mouse movement
document.addEventListener('mousemove', (e) => {
  const { clientX, clientY } = e;
  document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);
});

// Randomize particle positions and animations on page load
document.querySelectorAll('.particle').forEach(particle => {
  let size = Math.random() * 15 + 5;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  let x = Math.random() * window.innerWidth;
  let y = Math.random() * window.innerHeight;
  let dx = (Math.random() - 0.5) * 3;
  let dy = (Math.random() - 0.5) * 3;

  function animate() {
    x += dx;
    y += dy;
    if (x < 0 || x > window.innerWidth) dx *= -1;
    if (y < 0 || y > window.innerHeight) dy *= -1;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    requestAnimationFrame(animate);
  }

  animate();
});


// Login Form Submission
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  // Get input values
  const username = document.getElementById('username').value.toLowerCase();
  const password = document.getElementById('password').value;

  // Check credentials
  if (username === 'pharmasist' && password === '') {
    alert('Login successful! Redirecting to modify page...');
    window.location.href = 'modify.html';
  } 
  else if (username === 'admin' && password === '') {
    alert('Admin login successful! Redirecting to management...');
    window.location.href = 'invmanage.html';
  }
  else if (username === 'vendor' && password === '') {
    alert('Admin login successful! Redirecting to management...');
    window.location.href = 'vendor.html';
  }
  else {
    alert('Invalid credentials. Please try again.');
    // Clear password field
    document.getElementById('password').value = '';
  }
});
