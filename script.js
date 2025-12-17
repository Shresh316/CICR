// CONFIGURATION
const USERNAME = "CICRMEETIN";
const PASSWORD = "CICRMEET25";
const SECURITY_PIN = "1407";
let ALL_GROUPS = ["4th Year", "3rd Year", "2nd Year", "1st Year"];
let h4_students = [];
let attendanceState = {};
let currentUser = null;
let isAdminUnlocked = false;

// DOM Elements
const loginForm = document.getElementById("login-form");
const appContent = document.getElementById("app-content");
const techGate = document.getElementById("tech-gate");

// AUTH LOGIC
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    operateGate(() => {
        if (user === USERNAME && pass === PASSWORD) {
            currentUser = { name: "Admin" };
            document.getElementById("login-screen").style.display = "none";
            appContent.style.display = "block";
            loadData();
        } else {
            alert("Invalid Credentials");
        }
    });
});

function operateGate(callback) {
    techGate.classList.add('active');
    setTimeout(() => {
        if(callback) callback();
        setTimeout(() => techGate.classList.remove('active'), 1000);
    }, 1200);
}

// TAB SWITCHING
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const tab = e.target.getAttribute('data-tab');
        
        // Security Check
        if (['admin', 'history', 'equipment'].includes(tab) && !isAdminUnlocked) {
            document.getElementById('security-overlay').style.display = 'flex';
            return;
        }

        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        document.getElementById(`${tab}-content`).classList.add('active');
    });
});

// CLOCK
function updateClock() {
    const now = new Date();
    document.getElementById("digital-clock").textContent = now.toLocaleString();
}
setInterval(updateClock, 1000);

// DATA PERSISTENCE
function loadData() {
    const stored = localStorage.getItem("cicrMembers");
    h4_students = stored ? JSON.parse(stored) : ["1st Year: Sample User"];
    renderStudents();
}

function renderStudents() {
    const list = document.getElementById("attendance-list");
    list.innerHTML = "";
    h4_students.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        list.appendChild(li);
    });
}

// SECURITY PIN
document.getElementById("unlock-btn").addEventListener("click", () => {
    if(document.getElementById("security-pin-input").value === SECURITY_PIN) {
        isAdminUnlocked = true;
        document.getElementById('security-overlay').style.display = 'none';
    } else {
        alert("Wrong PIN");
    }
});