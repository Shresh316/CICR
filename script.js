// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://qjpmsepigcjqkptfptnt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcG1zZXBpZ2NqcWtwdGZwdG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjA1NTIsImV4cCI6MjA4MTYzNjU1Mn0.VsVa4ZwYDz9YTWiVjpf96LECjRbm0Jshs4AEys_eHRQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- OLD CONFIG (KEEPING FOR NOW) ---
const USERNAME = "CICRMEETIN";
const PASSWORD = "CICRMEET25";
const SECURITY_PIN = "1407"; 
let ALL_GROUPS = ["4th Year", "3rd Year", "2nd Year", "1st Year"];
// ... rest of 
const DEFAULT_STUDENTS = [
	"4th Year: Archit Jain", "3rd Year: Yasharth", "3rd Year: Dhruvi Gupta", "3rd Year: Aryan Varshney", "2nd Year: Aradhaya", "2nd Year: Aman",
    "1st Year: Divyam Jain", "1st Year: Bhuwan Dhanwani", "1st Year: Kartik Virmani", "1st Year: Kshitika Barnwal", "1st Year: Kumar Shaurya", "1st Year: Vishal Tomar",
    "1st Year: ABHINAV KUMAR SINHA", "1st Year: Yashna Mehta", "1st Year: Agamjot Singh", "1st Year: Labhansh Vashisht", "1st Year: Mohd Nauman Ali", "1st Year: Palash Mittal",
    "1st Year: Priyanshi Saini", "1st Year: Sanjana Kumari", "1st Year: Vardaan Saxena", "1st Year: Pulkit Sukhija", "1st Year: Sanskar Singhal", "1st Year: Paarth Sachdeva",
    "1st Year: Abhisheak Dutt Chandra", "1st Year: Arohan Arora", "1st Year: Rohan Verma", "1st Year: Akshita Gupta", "1st Year: Sarthak Chaurasia", "1st Year: Raghav Seth",
    "1st Year: Istuti Arora", "1st Year: Neeshal", "1st Year: Pakhi Srivastava", "1st Year: Priyanka suman", "1st Year: Shreya Bhatt", "1st Year: Tushar Goyal",
    "1st Year: Parivisha Midha", "1st Year: Parth Mediratta", "1st Year: Tanisha Mehndiratta", "1st Year: Kushagra garg", "1st Year: Navya Chawla", "1st Year: Akansha Nagar",
    "1st Year: Alok Sinha", "1st Year: Gourav Mandal"
];
let h4_students = [];
let attendanceState = {};

// DOM ELEMENTS
const splashScreen = document.getElementById("splash-screen");
const attendanceList = document.getElementById("attendance-list");
const subjectSelector = document.getElementById("attendance-subject");
const totalPresent = document.getElementById("total-present");
const totalAbsent = document.getElementById("total-absent");
const presentPercentage = document.getElementById("present-percentage");
const absentListElement = document.getElementById("absent-list");
const attendanceTakenBy = document.getElementById("attendance-taken-by");
const historyListElement = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const exportExcelBtn = document.getElementById("export-excel-btn");
const attendanceTakerSelect = document.getElementById("attendance-taker-select");
const customTopicInput = document.getElementById("custom-topic-input");
const yearSelect = document.getElementById("year-select");
const saveBtn = document.getElementById("save-data-btn");
const attendanceDate = document.getElementById("attendance-date");
const loginForm = document.getElementById("login-form");
const loginScreen = document.getElementById("login-screen");
const appContent = document.getElementById("app-content");
const loginError = document.getElementById("login-error");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const createGMeetBtn = document.getElementById("create-gmeet-btn");
const meetingSummaryInput = document.getElementById("meeting-summary");
const removeSelectedBtn = document.getElementById("remove-selected-btn");
const digitalClock = document.getElementById("digital-clock");
const personalReportBody = document.getElementById("personal-report-body");
const newMemberNameInput = document.getElementById("new-member-name");
const newMemberGroupSelect = document.getElementById("new-member-group");
const customGroupInput = document.getElementById("custom-group-input");
const addMemberBtn = document.getElementById("add-member-btn");
const removeMemberSelect = document.getElementById("remove-member-select");
const removeMemberBtn = document.getElementById("remove-member-btn");
const scheduleInitiatorSelect = document.getElementById("schedule-initiator-select");
const scheduleRecipientSelect = document.getElementById("schedule-recipient-select");
const senderEmailInput = document.getElementById("sender-email");
const recipientEmailInput = document.getElementById("recipient-email");
const scheduleSubjectInput = document.getElementById("schedule-subject");
const scheduleDateInput = document.getElementById("schedule-date");
const scheduleTimeInput = document.getElementById("schedule-time");
const scheduleLocationTypeSelect = document.getElementById("schedule-location-type");
const scheduleLocationDetailsInput = document.getElementById("schedule-location-details");
const scheduleMeetingBtn = document.getElementById("schedule-meeting-btn");
const newPermanentGroupInput = document.getElementById("new-permanent-group"); 
const addPermanentGroupBtn = document.getElementById("add-permanent-group-btn"); 
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

// PROJECT ELEMENTS
const projectNameInput = document.getElementById("project-name");
const projectTypeSelect = document.getElementById("project-type");
const projectMembersInput = document.getElementById("project-members");
const projectLinkInput = document.getElementById("project-link");
const projectStartInput = document.getElementById("project-start");
const projectEndInput = document.getElementById("project-end");
const projectPurposeInput = document.getElementById("project-purpose");
const projectTechInput = document.getElementById("project-tech");
const projectTinkercadInput = document.getElementById("project-tinkercad");
const addProjectBtn = document.getElementById("add-project-btn");
const liveProjectsList = document.getElementById("live-projects-list");

// EQUIPMENT ELEMENTS
const eqNameInput = document.getElementById('eq-name');
const eqMemberSelect = document.getElementById('eq-member-select');
const eqGroupInput = document.getElementById('eq-group');
const eqIssueDate = document.getElementById('eq-issue-date');
const eqReturnDate = document.getElementById('eq-return-date');
const addEqBtn = document.getElementById('add-equipment-btn');
const eqLogBody = document.getElementById('equipment-log-body');

const chatDisplay = document.getElementById('chat-display');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const loginBtn = document.getElementById('login-btn');
const authTitle = document.getElementById('auth-title');
const registrationFields = document.getElementById('registration-fields');
const regNameInput = document.getElementById('reg-name');
const regYearSelect = document.getElementById('reg-year');
const regBatchInput = document.getElementById('reg-batch');
const userAvatarDisplay = document.getElementById('user-avatar-display');
// Profile Elements
const profileIdInput = document.getElementById('profile-id');
const profileNameInput = document.getElementById('profile-name');
const profileYearSelect = document.getElementById('profile-year');
const profileBatchInput = document.getElementById('profile-batch');
const updateProfileBtn = document.getElementById('update-profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const profilePicInput = document.getElementById('profile-pic-input');
const profilePreview = document.getElementById('profile-preview');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpInputWrapper = document.getElementById('otp-input-wrapper');
const otpInput = document.getElementById('otp-input');
const otpStatus = document.getElementById('otp-status');
const togglePasswordBtn = document.getElementById('toggle-password');
const techGate = document.getElementById('tech-gate');

// SECURITY ELEMENTS
const securityOverlay = document.getElementById('security-overlay');
const securityPinInput = document.getElementById('security-pin-input');
const unlockBtn = document.getElementById('unlock-btn');
const securityCancel = document.getElementById('security-cancel');

// --- AUTH & PROFILE LOGIC ---
const USERS_KEY = "cicr_auth_users";
let isRegistering = false;
let currentUser = null;
let generatedOTP = null;
let isVerified = false;
let isAdminUnlocked = false; 

function getStoredUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}

function saveStoredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toggleAuthMode() {
    isRegistering = !isRegistering;
    if (isRegistering) {
        authTitle.textContent = "NEW USER REGISTRATION";
        loginBtn.textContent = "REGISTER & LOGIN";
        toggleAuthBtn.textContent = "Back to Login";
        registrationFields.style.display = 'block';
        loginError.style.display = 'none';
        // OTP Section
        document.getElementById('otp-section').style.display = 'block';
        otpInputWrapper.style.display = 'none';
        sendOtpBtn.style.display = 'block';
        isVerified = false;
        otpStatus.textContent = "";
    } else {
        authTitle.textContent = "CICR MEMBER ACCESS";
        loginBtn.textContent = "LOGIN";
        toggleAuthBtn.textContent = "Create New Account";
        registrationFields.style.display = 'none';
        loginError.style.display = 'none';
    }
}

// TOGGLE PASSWORD VISIBILITY
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle SVG Icons
    const showIcon = togglePasswordBtn.querySelector('.eye-show');
    const hideIcon = togglePasswordBtn.querySelector('.eye-hide');
    
    if(type === 'password') {
        showIcon.style.display = 'block';
        hideIcon.style.display = 'none';
    } else {
        showIcon.style.display = 'none';
        hideIcon.style.display = 'block';
    }
});

// OTP LOGIC
sendOtpBtn.addEventListener('click', () => {
    const contact = usernameInput.value;
    if(!contact) { alert("Enter Email/Phone first"); return; }
    
    // Simulate OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    alert(`[SIMULATION] Your OTP code is: ${generatedOTP}`);
    
    sendOtpBtn.style.display = 'none';
    otpInputWrapper.style.display = 'block';
    otpStatus.textContent = "OTP Sent. Check your device.";
});

verifyOtpBtn.addEventListener('click', () => {
    if(otpInput.value == generatedOTP) {
        isVerified = true;
        otpStatus.textContent = "VERIFIED ✓";
        otpStatus.style.color = "var(--color-success)";
        otpInputWrapper.style.display = 'none';
    } else {
        alert("Incorrect OTP");
    }
});

function loadUserProfile() {
    if (!currentUser) return;
    
    // Set Avatar (Photo or First Letter)
    if (currentUser.avatar) {
        userAvatarDisplay.style.backgroundImage = `url(${currentUser.avatar})`;
        userAvatarDisplay.textContent = "";
        profilePreview.style.backgroundImage = `url(${currentUser.avatar})`;
    } else {
        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';
        userAvatarDisplay.style.backgroundImage = "none";
        userAvatarDisplay.textContent = initial;
        profilePreview.style.backgroundImage = "none";
        profilePreview.textContent = ""; 
    }
    
    userAvatarDisplay.style.display = 'flex';

    // Populate Account Tab
    profileIdInput.value = currentUser.id;
    profileNameInput.value = currentUser.name;
    profileYearSelect.value = currentUser.year || "1st Year";
    profileBatchInput.value = currentUser.batch || "";
}

function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            // Update Preview
            profilePreview.style.backgroundImage = `url(${base64Image})`;
            currentUser.tempAvatar = base64Image; 
        };
        reader.readAsDataURL(file);
    }
}

// GATE ANIMATION TRIGGER
function operateGate(callback) {
    // Close Gate
    techGate.classList.add('active');
    
    // Wait for transition (0.8s) + delay
    setTimeout(() => {
        // Execute Action
        if(callback) callback();
        
        // Open Gate after short delay
        setTimeout(() => {
             techGate.classList.remove('active');
        }, 1000);
    }, 1200);
}

function updateProfile() {
    operateGate(() => {
        if (!currentUser) return;
        const users = getStoredUsers();
        
        currentUser.name = profileNameInput.value.trim();
        currentUser.year = profileYearSelect.value;
        currentUser.batch = profileBatchInput.value.trim();
        
        if (currentUser.tempAvatar) {
            currentUser.avatar = currentUser.tempAvatar;
            delete currentUser.tempAvatar;
        }
        
        if (users[currentUser.id]) {
            users[currentUser.id].name = currentUser.name;
            users[currentUser.id].year = currentUser.year;
            users[currentUser.id].batch = currentUser.batch;
            if(currentUser.avatar) users[currentUser.id].avatar = currentUser.avatar;
            saveStoredUsers(users);
            showSuccessAnimation();
            loadUserProfile(); 
        }
    });
}

function logout() {
    operateGate(() => {
        currentUser = null;
        isAdminUnlocked = false; 
        userAvatarDisplay.style.display = 'none';
        appContent.style.display = 'none';
        loginScreen.style.display = 'block';
        usernameInput.value = '';
        passwordInput.value = '';
        if(isRegistering) toggleAuthMode();
    });
}

// --- SUCCESS ANIMATION FUNCTION ---
function showSuccessAnimation() {
    const overlay = document.getElementById('action-success-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 2000); 
}

// --- BACKGROUND PARTICLES ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 2 + 1; this.color = '#66fcf1';
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}
function initParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 15);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.strokeStyle = `rgba(69, 162, 158, ${1 - dist/150})`;
                ctx.lineWidth = 1; ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
initParticles(); animateParticles();

// --- TAB LOGIC WITH SECURITY CHECK ---
let pendingTabId = null; 

function switchTab(targetTabId) {
    // SECURITY CHECK FOR ADMIN, LOGS, AND EQUIPMENT
    if ((targetTabId === 'admin' || targetTabId === 'history' || targetTabId === 'equipment') && !isAdminUnlocked) {
        pendingTabId = targetTabId;
        securityOverlay.style.display = 'flex';
        securityPinInput.value = '';
        securityPinInput.focus();
        return; 
    }

    tabLinks.forEach(link => { link.classList.remove('active'); link.setAttribute('aria-selected', 'false'); });
    tabContents.forEach(content => { content.classList.remove('active'); content.style.display = 'none'; });
    const activeLink = document.querySelector(`.tab-link[data-tab="${targetTabId}"]`);
    const activeContent = document.getElementById(`${targetTabId}-content`);
    if (activeLink && activeContent) {
        activeLink.classList.add('active'); activeLink.setAttribute('aria-selected', 'true');
        activeContent.classList.add('active'); activeContent.style.display = 'block';
        if (targetTabId === 'history') renderHistory();
        else if (targetTabId === 'reports') calculatePersonalReport();
        else if (targetTabId === 'projects') renderProjects();
        else if (targetTabId === 'chat') { loadChat(); scrollChat(); }
        else if (targetTabId === 'admin') { populateGroupSelects(); populateRemoveMemberDropdown(); }
        else if (targetTabId === 'account') { loadUserProfile(); }
        else if (targetTabId === 'equipment') { populateEqMemberDropdown(); renderEquipmentLogs(); }
    }
}

// SECURITY UNLOCK LOGIC
function verifySecurityPin() {
    if(securityPinInput.value === SECURITY_PIN) {
        isAdminUnlocked = true;
        securityOverlay.style.display = 'none';
        if(pendingTabId) {
            switchTab(pendingTabId);
            pendingTabId = null;
        }
    } else {
        alert("ACCESS DENIED: INCORRECT PIN");
        securityPinInput.value = '';
        securityPinInput.focus();
    }
}
unlockBtn.addEventListener('click', verifySecurityPin);
securityCancel.addEventListener('click', () => {
    securityOverlay.style.display = 'none';
    pendingTabId = null;
});
securityPinInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') verifySecurityPin();
});

// --- CICR SHELF (PROJECTS) FUNCTIONS ---
function loadProjects() { return JSON.parse(localStorage.getItem("cicrProjects") || "[]"); }
function saveProject() {
    const name = projectNameInput.value.trim();
    const type = projectTypeSelect.value;
    const members = projectMembersInput.value.trim();
    const link = projectLinkInput.value.trim();
    const start = projectStartInput.value;
    const end = projectEndInput.value;
    const purpose = projectPurposeInput.value.trim();
    const tech = projectTechInput.value.trim();
    const tinkercad = projectTinkercadInput.value.trim();

    if (!name || !members || !purpose) { alert("Error: Title, Member Name, and Purpose are required."); return; }

    operateGate(() => {
        const newProject = { 
            id: Date.now(), 
            name, 
            type, 
            members, 
            link, 
            start, 
            end,
            purpose,
            tech,
            tinkercad
        };
        const projects = loadProjects();
        projects.push(newProject);
        localStorage.setItem("cicrProjects", JSON.stringify(projects));
        
        showSuccessAnimation();
        
        projectNameInput.value = ""; projectMembersInput.value = ""; projectLinkInput.value = ""; 
        projectStartInput.value = ""; projectEndInput.value = ""; projectPurposeInput.value = "";
        projectTechInput.value = ""; projectTinkercadInput.value = "";
        renderProjects();
    });
}
function renderProjects() {
    const projects = loadProjects();
    liveProjectsList.innerHTML = "";

    if (projects.length === 0) {
        liveProjectsList.innerHTML = '<p style="opacity:0.6; font-size:13px;">Shelf is empty. Add a project above.</p>';
        return;
    }

    projects.sort((a, b) => (a.type === 'live' ? -1 : 1));

    projects.forEach(p => {
        let techTags = "";
        if(p.tech) {
            techTags = p.tech.split(',').map(t => `<span class="project-tech-tag">${t.trim()}</span>`).join('');
        }

        const html = `
        <div class="project-card">
            <h4>${p.name} <span style="font-size:10px; color:${p.type === 'live' ? 'var(--color-success)' : '#888'}; border:1px solid currentColor; padding:2px 5px; border-radius:2px; vertical-align:middle;">${p.type === 'live' ? 'LIVE' : 'ARCHIVED'}</span></h4>
            
            <div class="project-info">
                <strong>Lead/Member:</strong> ${p.members}
            </div>
            
            <div class="project-info" style="font-style:italic; color:#aaa; margin-bottom:10px;">
                "${p.purpose}"
            </div>

            <div class="project-info">
                <strong>Tech Stack:</strong><br>
                ${techTags || 'Not Specified'}
            </div>

            <div class="project-info" style="margin-top:10px;">
                <strong>Timeline:</strong> ${p.start} ${p.end ? 'to ' + p.end : '(Ongoing)'}
            </div>

            <div class="project-actions">
                ${p.link ? `<a href="${p.link}" target="_blank" class="project-btn-link">🔗 Code / Github</a>` : ''}
                ${p.tinkercad ? `<a href="${p.tinkercad}" target="_blank" class="project-btn-link btn-tinkercad">⚡ View on Tinkercad</a>` : ''}
            </div>

            <button class="btn-delete-project" onclick="deleteProject(${p.id})">DELETE</button>
        </div>
        `;
        liveProjectsList.innerHTML += html;
    });
}
window.deleteProject = function(id) {
    if(!confirm("Delete this project from the shelf?")) return;
    let projects = loadProjects();
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem("cicrProjects", JSON.stringify(projects));
    renderProjects();
};

// --- EQUIPMENT TRACKER FUNCTIONS ---
function populateEqMemberDropdown() {
    eqMemberSelect.innerHTML = '<option value="" disabled selected>-- Select Member --</option>';
    h4_students.forEach(student => {
        const option = document.createElement("option");
        option.value = student;
        option.textContent = student.includes(": ") ? student.split(": ")[1] : student;
        eqMemberSelect.appendChild(option);
    });
}

function saveEquipment() {
    const name = eqNameInput.value.trim();
    const member = eqMemberSelect.value;
    const group = eqGroupInput.value.trim();
    const issue = eqIssueDate.value;
    const ret = eqReturnDate.value;

    if (!name || !member || !issue) {
        alert("Please fill Equipment Name, Member, and Issue Date.");
        return;
    }

    operateGate(() => {
        const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
        const newLog = {
            id: Date.now(),
            name,
            member: member.split(": ")[1],
            group,
            issue,
            return: ret,
            status: "ISSUED"
        };
        logs.unshift(newLog);
        localStorage.setItem("cicrEquipment", JSON.stringify(logs));
        
        showSuccessAnimation();
        eqNameInput.value = ""; eqGroupInput.value = "";
        renderEquipmentLogs();
    });
}

function renderEquipmentLogs() {
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    eqLogBody.innerHTML = "";

    if (logs.length === 0) {
        eqLogBody.innerHTML = '<tr><td colspan="5" style="text-align:center; opacity:0.5;">No active equipment logs.</td></tr>';
        return;
    }

    logs.forEach(log => {
        const isSubmitted = log.status === "SUBMITTED";
        eqLogBody.innerHTML += `
            <tr>
                <td style="${isSubmitted ? 'opacity:0.5; text-decoration:line-through;' : 'color:var(--color-accent);'}">${log.name}</td>
                <td>${log.member}<br><small style="color:#666">${log.group}</small></td>
                <td style="font-size:11px;">Out: ${log.issue}<br>Due: ${log.return || 'N/A'}</td>
                <td>
                    <span style="color: ${isSubmitted ? 'var(--color-success)' : 'var(--color-tinker)'}; font-weight:bold; font-size:10px;">
                        ${log.status}
                    </span>
                </td>
                <td>
                    ${!isSubmitted ? `<button onclick="toggleEqStatus(${log.id})" class="status-button" style="padding:4px 8px !important; border:1px solid var(--color-success) !important; color:var(--color-success) !important;">Return</button>` : 
                    `<button onclick="deleteEqLog(${log.id})" class="status-button" style="padding:4px 8px !important; border:1px solid var(--color-danger) !important; color:var(--color-danger) !important;">Del</button>`}
                </td>
            </tr>
        `;
    });
}

window.toggleEqStatus = function(id) {
    let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    const log = logs.find(l => l.id === id);
    if(log) {
        log.status = "SUBMITTED";
        localStorage.setItem("cicrEquipment", JSON.stringify(logs));
        renderEquipmentLogs();
    }
};

window.deleteEqLog = function(id) {
    if(!confirm("Delete this log permanently?")) return;
    let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem("cicrEquipment", JSON.stringify(logs));
    renderEquipmentLogs();
};

// --- CHAT LOGIC ---
function loadChat() {
    const chat = JSON.parse(localStorage.getItem("cicrChat") || "[]");
    chatDisplay.innerHTML = "";
    if(chat.length === 0) {
        chatDisplay.innerHTML = `<div class="chat-message msg-other"><span class="msg-meta">SYSTEM | NOW</span>Welcome to the Secure Channel. Start communicating.</div>`;
    }
    chat.forEach(msg => {
        const div = document.createElement("div");
        div.className = `chat-message ${msg.sender === (currentUser ? currentUser.name : 'ME') ? 'msg-self' : 'msg-other'}`;
        div.innerHTML = `<span class="msg-meta">${msg.sender} | ${msg.time}</span>${msg.text}`;
        chatDisplay.appendChild(div);
    });
}
function postMessage() {
    const text = chatInput.value.trim();
    if(!text) return;
    
    const chat = JSON.parse(localStorage.getItem("cicrChat") || "[]");
    const senderName = currentUser ? currentUser.name : "ME";
    
    const msg = {
        sender: senderName,
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    chat.push(msg);
    if(chat.length > 50) chat.shift(); 
    localStorage.setItem("cicrChat", JSON.stringify(chat));
    
    chatInput.value = "";
    loadChat();
    scrollChat();
}
function scrollChat() {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// --- DATA FUNCTIONS ---
function loadGroups() {
    const storedGroups = localStorage.getItem("cicrGroups");
    if (storedGroups) ALL_GROUPS = JSON.parse(storedGroups);
    else { ALL_GROUPS = ["4th Year", "3rd Year", "2nd Year", "1st Year"]; saveGroups(); }
}
function saveGroups() { localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS)); populateGroupSelects(); renderStudents(); }
function addPermanentGroup(groupName) {
    const trimmedName = groupName.trim();
    if (trimmedName === "" || ALL_GROUPS.map(g => g.toLowerCase()).includes(trimmedName.toLowerCase())) return false;
    ALL_GROUPS.push(trimmedName); saveGroups(); return true;
}
function loadStudents() {
	const storedStudents = localStorage.getItem("cicrMembers");
	if (storedStudents) {
        h4_students = JSON.parse(storedStudents);
        populateAttendanceTakerDropdown();
        populateRemoveMemberDropdown();
        populateSchedulingDropdowns();
        populateEqMemberDropdown();
    } else { 
        h4_students = DEFAULT_STUDENTS; 
        saveStudents(); 
    }
}
function saveStudents() { localStorage.setItem("cicrMembers", JSON.stringify(h4_students)); populateAttendanceTakerDropdown(); populateRemoveMemberDropdown(); populateSchedulingDropdowns(); populateEqMemberDropdown(); }

// --- UI FUNCTIONS ---
function updateClock() {
	const now = new Date();
	const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
	const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
	digitalClock.textContent = `${dateString} | ${timeString}`;
}
function populateGroupSelects() {
    const currentSelectedGroups = Array.from(yearSelect.selectedOptions).map(o => o.value);
    yearSelect.innerHTML = "";
    ALL_GROUPS.forEach(group => {
        const option = document.createElement("option"); option.value = group; option.textContent = group;
        if (currentSelectedGroups.includes(group)) option.selected = true; yearSelect.appendChild(option);
    });
    if(yearSelect.selectedOptions.length === 0 && yearSelect.options.length > 0) {
        const defaultOpt = Array.from(yearSelect.options).find(o => o.value === "1st Year") || yearSelect.options[0];
        if(defaultOpt) defaultOpt.selected = true;
    }

    const currentNewMemberGroup = newMemberGroupSelect.value;
    newMemberGroupSelect.innerHTML = '';
    ALL_GROUPS.forEach(group => {
        const option = document.createElement('option'); option.value = group; option.textContent = group.toUpperCase(); newMemberGroupSelect.appendChild(option);
    });
    const customOption = document.createElement('option'); customOption.value = "Custom"; customOption.textContent = "Custom Unit..."; newMemberGroupSelect.appendChild(customOption);
    if (newMemberGroupSelect.querySelector(`option[value="${currentNewMemberGroup}"]`)) newMemberGroupSelect.value = currentNewMemberGroup;
    else newMemberGroupSelect.value = ALL_GROUPS[0] || "Custom";
}
function populateAttendanceTakerDropdown() {
	attendanceTakerSelect.innerHTML = '<option value="" disabled selected>-- Select Member --</option>';
	h4_students.forEach(student => { 
        const option = document.createElement("option"); 
        option.value = student; 
        option.textContent = student.includes(": ") ? student.split(": ")[1] : student; 
        attendanceTakerSelect.appendChild(option); 
    });
}
function populateRemoveMemberDropdown() {
	removeMemberSelect.innerHTML = '<option value="" disabled selected>-- Select User to Remove --</option>';
	h4_students.forEach(student => { const option = document.createElement("option"); option.value = student; option.textContent = student; removeMemberSelect.appendChild(option); });
}
function populateSchedulingDropdowns() {
	scheduleInitiatorSelect.innerHTML = '<option value="" disabled selected>-- Select Sender --</option>';
	scheduleRecipientSelect.innerHTML = '<option value="" disabled selected>-- Select Recipient --</option>';
	h4_students.forEach(studentData => {
		const name = studentData.includes(": ") ? studentData.split(": ")[1] : studentData;
		const initiatorOption = document.createElement("option"); initiatorOption.value = name; initiatorOption.textContent = name; scheduleInitiatorSelect.appendChild(initiatorOption);
		const recipientOption = document.createElement("option"); recipientOption.value = name; recipientOption.textContent = name; scheduleRecipientSelect.appendChild(recipientOption);
	});
}
function getMeetingTopic() { return subjectSelector.value === "Other" && customTopicInput.value.trim() !== "" ? customTopicInput.value.trim() : subjectSelector.options[subjectSelector.selectedIndex].textContent; }
function updateSubjectDisplay() { document.getElementById("current-subject-display").textContent = getMeetingTopic(); }
function handleTopicChange() {
	if (subjectSelector.value === "Other") { customTopicInput.style.display = "block"; customTopicInput.focus(); } else { customTopicInput.style.display = "none"; customTopicInput.value = ""; } updateSubjectDisplay();
}
function handleGroupChange() {
	const customInputWrapper = document.getElementById("custom-group-input-wrapper");
	if (newMemberGroupSelect.value === "Custom") { customInputWrapper.style.display = "block"; customGroupInput.focus(); } else { customInputWrapper.style.display = "none"; customGroupInput.value = ""; }
}

// --- CORE LOGIC ---
function addMember() {
	const name = newMemberNameInput.value.trim();
	let group = newMemberGroupSelect.value;
	if (!name) return alert("Error: Enter new user name.");
	if (group === "Custom") { group = customGroupInput.value.trim(); if (!group) return alert("Error: Enter custom unit name."); }
    if (!ALL_GROUPS.includes(group)) { if (confirm(`Warning: Group "${group}" is not registered. Add it?`)) addPermanentGroup(group); }
	const newMemberString = `${group}: ${name}`;
	if (h4_students.some(s => s.toLowerCase() === newMemberString.toLowerCase())) return alert(`Error: User already exists.`);
	h4_students.push(newMemberString); h4_students.sort(); saveStudents(); alert(`Success: User ${name} added.`);
	newMemberNameInput.value = ""; populateGroupSelects(); renderStudents();
}
function removeMember() {
	const memberToRemove = removeMemberSelect.value;
	if (!memberToRemove) return alert("Error: Select a user.");
	if (!confirm(`Confirm remove "${memberToRemove}"?`)) return;
	const index = h4_students.indexOf(memberToRemove);
	if (index > -1) { h4_students.splice(index, 1); saveStudents(); alert(`Success: User removed.`); } renderStudents();
}
function getSelectedGroups() { return Array.from(yearSelect.selectedOptions).map(o => o.value); }

function renderStudents() {
	attendanceList.innerHTML = ""; attendanceState = {};
	const selectedGroups = getSelectedGroups();
	const filteredStudents = h4_students.filter(student => selectedGroups.includes(student.split(": ")[0]));
	if (filteredStudents.length === 0) {
        attendanceList.innerHTML = selectedGroups.length === 0 ? `<li style="padding: 15px; opacity: 0.7; color: #fff;">Select at least one Group/Unit to load members.</li>` : `<li style="padding: 15px; color: var(--color-danger);">No users found matching selected units.</li>`;
		updateSummary(); return;
	}
	filteredStudents.sort((a, b) => a.localeCompare(b));
	filteredStudents.forEach((studentData, index) => {
		const [role, name] = studentData.split(": ");
		const studentKey = studentData;
		attendanceState[studentKey] = "MARK";
		const listItem = document.createElement("li"); listItem.className = "student-item unmarked"; listItem.id = studentKey.replace(/[^a-zA-Z0-9]/g, "_");
		
        listItem.innerHTML = `
            <div class="student-info">
                <div class="student-name">${name}</div>
                <div class="student-id">${role}</div>
            </div>
            <div class="status-controls">
                <button class="status-button btn-present" data-key="${studentKey}" style="opacity: 0.4;">Present</button>
                <button class="status-button btn-absent" data-key="${studentKey}" style="opacity: 0.4;">Absent</button>
                <button class="status-button btn-unmarked" data-key="${studentKey}" style="opacity: 1.0;">Unmarked</button>
            </div>
        `;
		attendanceList.appendChild(listItem);
	});
	attendanceList.querySelectorAll(".status-button").forEach(button => {
		button.addEventListener("click", e => {
			const key = e.target.getAttribute("data-key");
			const status = e.target.textContent.toUpperCase();
			attendanceState[key] = (status === "UNMARKED") ? "MARK" : status;
			const listItem = document.getElementById(key.replace(/[^a-zA-Z0-9]/g, "_"));
			const controls = listItem.querySelector(".status-controls");
			controls.querySelectorAll(".status-button").forEach(btn => btn.style.opacity = '0.4');
			listItem.classList.remove("present", "absent", "unmarked");
			if (status === "PRESENT") listItem.classList.add("present"); else if (status === "ABSENT") listItem.classList.add("absent"); else listItem.classList.add("unmarked");
			e.target.style.opacity = '1.0'; updateSummary();
		});
	});
	updateSummary();
}

function updateSummary() {
	let presentCount = 0, absentCount = 0, absentNames = [];
	for (const key in attendanceState) { if (attendanceState[key] === "PRESENT") presentCount++; else if (attendanceState[key] === "ABSENT") { absentCount++; absentNames.push(key.split(": ")[1]); } }
	const total = Object.keys(attendanceState).length;
	const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0.0";
	totalPresent.textContent = presentCount; totalAbsent.textContent = absentCount; presentPercentage.textContent = `${percentage}%`;
	presentPercentage.classList.toggle("poor", parseFloat(percentage) < 70);
	absentListElement.textContent = absentNames.length > 0 ? absentNames.join(", ") : "None";
}
function saveData() {
	const selectedGroups = getSelectedGroups();
	if (Object.keys(attendanceState).length === 0 || selectedGroups.length === 0) return alert("Error: Select group and mark users.");
	if (!attendanceDate.value) return alert("Error: Select date.");
	if (attendanceTakerSelect.value === "") return alert("Error: Select recorder.");
    const unmarkedCount = Object.values(attendanceState).filter(s => s === "MARK").length;
	if (unmarkedCount > 0 && !confirm(`Warning: ${unmarkedCount} users unmarked. Commit?`)) return;
	
    operateGate(() => {
        const history = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
        const attendanceRecords = Object.keys(attendanceState).map(key => { const [group, name] = key.split(": "); return { name, group, status: attendanceState[key] }; });
        const newRecord = { id: Date.now(), date: attendanceDate.value, topic: getMeetingTopic(), group: selectedGroups.join(', '), taker: attendanceTakerSelect.options[attendanceTakerSelect.selectedIndex].textContent, summary: meetingSummaryInput.value.trim() || "No summary.", attendance: attendanceRecords };
        history.unshift(newRecord); localStorage.setItem("attendanceHistory", JSON.stringify(history)); 
        
        showSuccessAnimation();
        
        Array.from(yearSelect.options).forEach(o => o.selected = false); attendanceState = {}; attendanceTakenBy.textContent = "Attendance Recorded By: [None Selected]"; renderStudents();
    });
}
function renderHistory() {
	const history = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
	historyListElement.innerHTML = history.length === 0 ? '<li style="padding: 15px; opacity: 0.6;">No logs available.</li>' : "";
    document.getElementById("remove-selected-btn").style.display = history.length ? 'block' : 'none';
	document.getElementById("clear-history-btn").style.display = history.length ? 'block' : 'none';
	history.forEach(record => {
		const listItem = document.createElement("li"); listItem.className = "history-item";
		const presentCount = record.attendance.filter(a => a.status === "PRESENT").length;
		const totalCount = record.attendance.filter(a => a.status !== "MARK").length;
        const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;
		listItem.innerHTML = `<div class="history-header-wrapper"><input type="checkbox" class="history-checkbox" data-id="${record.id}" style="width: auto; margin-right: 10px;"><button class="history-header-btn" onclick="this.parentElement.nextElementSibling.style.display = this.parentElement.nextElementSibling.style.display === 'none' ? 'block' : 'none'"><span>[${record.date}] ${record.topic}</span><span style="font-weight: 700; color: var(--color-accent);">${presentCount}/${totalCount} (${percentage}%)</span></button></div><div class="history-details" style="display:none;"><p><strong>Recorder:</strong> ${record.taker}</p><p><strong>Summary:</strong> ${record.summary}</p><p><strong>Full Record:</strong></p><ul class="full-record-list">${record.attendance.map(a => `<li style="color:${a.status === 'PRESENT' ? 'var(--color-success)' : 'var(--color-danger)'}">${a.name} [${a.status}]</li>`).join("")}</ul></div>`;
		historyListElement.appendChild(listItem);
	});
}
function clearHistory() { if (confirm("Delete ALL logs?")) { localStorage.removeItem("attendanceHistory"); renderHistory(); } }
function removeSelectedRecords() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    if (!checkboxes.length) return alert("Select records.");
    if (!confirm("Delete selected?")) return;
    let history = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const ids = Array.from(checkboxes).map(c => parseInt(c.getAttribute('data-id')));
    history = history.filter(r => !ids.includes(r.id)); localStorage.setItem("attendanceHistory", JSON.stringify(history)); renderHistory();
}

function exportToCSV() {
    const history = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    if (history.length === 0) { alert("No logs to export."); return; }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Topic,Group,Recorder,Summary,Student Name,Student Group,Status\n";

    history.forEach(record => {
        const date = record.date;
        const topic = record.topic.replace(/,/g, " "); 
        const group = record.group.replace(/,/g, " ");
        const recorder = record.taker.replace(/,/g, " ");
        const summary = record.summary.replace(/,/g, " ");

        record.attendance.forEach(att => {
            const row = `${date},${topic},${group},${recorder},${summary},${att.name},${att.group},${att.status}`;
            csvContent += row + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CICR_Attendance_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleScheduleMeeting() {
    const initiator = scheduleInitiatorSelect.value;
    const recipient = scheduleRecipientSelect.value;
    const senderEmail = senderEmailInput.value.trim();
    const recipientEmail = recipientEmailInput.value.trim();
    const subject = scheduleSubjectInput.value.trim();
    const date = scheduleDateInput.value;
    const time = scheduleTimeInput.value;
    const locType = scheduleLocationTypeSelect.value;
    const locDetails = scheduleLocationDetailsInput.value.trim();

    if (!recipientEmail || !subject || !date || !time) {
        alert("Error: Please fill in the required fields.");
        return;
    }

    const body = `Meeting Invitation\n\n` +
                 `Topic: ${subject}\n` +
                 `Date: ${date}\n` +
                 `Time: ${time}\n` +
                 `Location: ${locType} ${locDetails ? `(${locDetails})` : ''}\n\n` +
                 `Attendees: ${initiator} (Host), ${recipient}\n\n` +
                 `Please confirm your availability.\n\n` +
                 `Regards,\n${initiator || 'CICR Admin'}`;

    const mailtoLink = `mailto:${recipientEmail}?cc=${senderEmail}&subject=${encodeURIComponent("INVITE: " + subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

function calculatePersonalReport() {
    const history = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const reportData = {};
    h4_students.forEach(m => reportData[m] = { total: 0, attended: 0, group: m.split(": ")[0], name: m.split(": ")[1] });
    history.forEach(r => r.attendance.forEach(a => { const key = `${a.group}: ${a.name}`; if (reportData[key] && a.status !== "MARK") { reportData[key].total++; if (a.status === "PRESENT") reportData[key].attended++; } }));
    
    personalReportBody.innerHTML = "";
    Object.keys(reportData).sort().forEach(key => {
        const d = reportData[key];
        const pct = d.total > 0 ? ((d.attended / d.total) * 100).toFixed(1) : 0;
        const pctDisplay = d.total > 0 ? pct + "%" : "N/A";
        
        let color = '#ccc';
        if(d.total > 0) {
            if(pct >= 75) color = 'var(--color-success)';
            else if(pct >= 50) color = 'var(--color-tinker)';
            else color = 'var(--color-danger)';
        }

        personalReportBody.innerHTML += `
        <tr>
            <td>${d.name}</td>
            <td>${d.group}</td>
            <td style="text-align:left;">
                <span style="display:inline-block; width:45px; font-weight:bold; color:${color};">${pctDisplay}</span>
                <div class="analytics-progress-wrapper">
                    <div class="analytics-progress-fill" style="width:${d.total > 0 ? pct : 0}%; background-color:${color};"></div>
                </div>
            </td>
        </tr>`;
    });
}

// --- INIT ---
function initializeListeners() {
	setInterval(updateClock, 1000); updateClock();
    
    splashScreen.addEventListener('click', () => { 
        splashScreen.style.opacity = '0'; 
        setTimeout(() => { 
            splashScreen.style.display = 'none'; 
            operateGate(() => {
                loginScreen.style.display = 'block'; 
            });
        }, 500); 
    });
	
    toggleAuthBtn.addEventListener("click", toggleAuthMode);
    
    loginForm.addEventListener("submit", (e) => {
		e.preventDefault();
        const enteredUser = usernameInput.value.trim();
        const enteredPass = passwordInput.value.trim();

        if (!enteredUser || !enteredPass) {
            loginError.textContent = "Please fill in all fields.";
            loginError.style.display = 'block';
            return;
        }

        const users = getStoredUsers();

        if (isRegistering) {
            if(!isVerified) {
                alert("Please verify your phone/email via OTP first.");
                return;
            }

            const name = regNameInput.value.trim();
            const year = regYearSelect.value;
            const batch = regBatchInput.value.trim();

            if (!name || !batch) {
                loginError.textContent = "Name and Batch are required.";
                loginError.style.display = 'block';
                return;
            }

            if (users[enteredUser]) {
                loginError.textContent = "User already exists. Please login.";
                loginError.style.display = 'block';
            } else {
                operateGate(() => {
                    users[enteredUser] = {
                        id: enteredUser,
                        password: enteredPass,
                        name: name,
                        year: year,
                        batch: batch
                    };
                    saveStoredUsers(users);
                    alert("Account Created! You can now login.");
                    toggleAuthMode(); 
                });
            }
        } else {
            operateGate(() => {
                if (enteredUser === USERNAME && enteredPass === PASSWORD) {
                    currentUser = { id: "ADMIN", name: "Administrator", year: "Staff", batch: "N/A" };
                    loginSuccess();
                } 
                else if (users[enteredUser] && users[enteredUser].password === enteredPass) {
                    currentUser = users[enteredUser];
                    loginSuccess();
                } 
                else if (users[enteredUser] === enteredPass) {
                     currentUser = { id: enteredUser, name: "Member", year: "N/A", batch: "N/A" };
                     loginSuccess();
                }
                else { 
                    setTimeout(() => { techGate.classList.remove('active'); }, 500);
                    loginError.textContent = "Access Denied. Invalid Credentials.";
                    loginError.style.display = 'block'; 
                    passwordInput.value = ''; 
                }
            });
        }
	});

    function loginSuccess() {
        loginScreen.style.display = 'none';
        const successScreen = document.getElementById('success-screen');
        successScreen.style.display = 'flex';
        
        loadUserProfile();

        setTimeout(() => {
            successScreen.style.display = 'none';
            appContent.style.display = 'block';
            loadGroups(); loadStudents(); populateGroupSelects(); switchTab('attendance');
        }, 2000);
    }

    tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
	attendanceTakerSelect.addEventListener("change", () => attendanceTakenBy.textContent = `Attendance Recorded By: ${attendanceTakerSelect.value.split(": ")[1]}`);
	yearSelect.addEventListener("change", renderStudents);
	customTopicInput.addEventListener("input", updateSubjectDisplay);
	subjectSelector.addEventListener("change", handleTopicChange);
	saveBtn.addEventListener("click", saveData);
	createGMeetBtn.addEventListener("click", () => window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(getMeetingTopic())}`, '_blank'));
	clearHistoryBtn.addEventListener("click", clearHistory);
    removeSelectedBtn.addEventListener("click", removeSelectedRecords);
	exportExcelBtn.addEventListener("click", exportToCSV);
    
    scheduleMeetingBtn.addEventListener("click", handleScheduleMeeting);

    addPermanentGroupBtn.addEventListener("click", () => { if(addPermanentGroup(newPermanentGroupInput.value)) { alert("Group Added"); newPermanentGroupInput.value=""; } else alert("Error"); });
	newMemberGroupSelect.addEventListener("change", handleGroupChange);
	addMemberBtn.addEventListener("click", addMember);
	removeMemberBtn.addEventListener("click", removeMember);
    addProjectBtn.addEventListener("click", saveProject);
    addEqBtn.addEventListener('click', saveEquipment); // Equipment Listener
    chatSendBtn.addEventListener("click", postMessage);
    chatInput.addEventListener("keypress", (e) => { if(e.key === 'Enter') postMessage(); });
    updateProfileBtn.addEventListener("click", updateProfile);
    logoutBtn.addEventListener("click", logout);
    userAvatarDisplay.addEventListener("click", () => switchTab('account'));
    
    profilePicInput.addEventListener('change', handleProfilePicUpload);

    const todayISO = new Date().toISOString().split('T')[0];
    attendanceDate.value = todayISO; scheduleDateInput.value = todayISO; projectStartInput.value = todayISO;
    eqIssueDate.value = todayISO; // Equipment Date Default
    document.getElementById('open-calendar-btn').addEventListener('click', () => attendanceDate.showPicker());
    document.getElementById('open-calendar-scheduler-btn').addEventListener('click', () => scheduleDateInput.showPicker());
    document.getElementById('open-calendar-start-btn').addEventListener('click', () => projectStartInput.showPicker());
    document.getElementById('open-calendar-end-btn').addEventListener('click', () => projectEndInput.showPicker());
    loadGroups(); loadStudents();
}
initializeListeners();