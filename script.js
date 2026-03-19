// Typing Animation
const texts = [
    "Full-Stack Developer", 
    "C# & .NET Expert", 
    "Angular Specialist", 
    "Azure Cloud Architect"
];
let count = 0;
let index = 0;
let currentText = '';
let letter = '';
let isDeleting = false;

(function type() {
    if (count === texts.length) {
        count = 0;
    }
    currentText = texts[count];

    if (isDeleting) {
        letter = currentText.slice(0, --index);
    } else {
        letter = currentText.slice(0, ++index);
    }

    document.querySelector('.typewriter-text').textContent = letter;

    let typeSpeed = 100;

    if (isDeleting) {
        typeSpeed /= 2;
    }

    if (!isDeleting && letter.length === currentText.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
    } else if (isDeleting && letter.length === 0) {
        isDeleting = false;
        count++;
        typeSpeed = 500; // Pause before new word
    }

    setTimeout(type, typeSpeed);
}());

// Scroll Reveal Animation
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);
reveal(); // Trigger on load

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-times');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// --- Theme Toggle Logic ---
const themeBtn = document.getElementById('theme-btn');
const themeIcon = themeBtn.querySelector('i');

// 1. Check for saved theme preference in local storage
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

// 2. Toggle Theme on Click
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    
    if (document.body.classList.contains('light-theme')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('portfolio-theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('portfolio-theme', 'dark');
    }
});

// Phone Obfuscation
function revealPhone(e) {
    if (e.currentTarget.href.includes('tel:')) return;
    
    e.preventDefault();
    const phoneBtn = e.currentTarget;
    const phoneText = document.getElementById('phone-text');
    // Simple obfuscation dynamically building the number
    const parts = ['+91', '881', '754', '8281'];
    const formatted = parts.join('-');
    const link = 'tel:' + parts.join('');
    
    phoneBtn.href = link;
    phoneText.textContent = formatted;
}

// Dummy Form Submission
function submitForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        btn.textContent = 'Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        e.target.reset();
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '';
        }, 3000);
    }, 1500);
}
