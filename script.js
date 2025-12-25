// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://euesehkwdmoghulxtbqb.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZXNlaGt3ZG1vZ2h1bHh0YnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODU0MDUsImV4cCI6MjA4MjI2MTQwNX0.qaktQnej49v2g2RBYyggWYrb8KGyM3YNC7yWl1yr4yo';

// Safe initialization of Supabase
const supabase = (typeof window.supabase !== 'undefined' && window.supabase.createClient) 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) 
    : null;

if (!supabase) console.log("Supabase SDK not loaded or config missing. Running in simulation mode.");

const USERNAME = "CICRMEETIN";
const PASSWORD = "CICRMEET25";
const SYSTEM_OWNER_EMAIL = "cicrofficial@gmail.com";
let GLOBAL_SECURITY_PIN = localStorage.getItem("cicr_security_pin") || "1407"; 
let ALL_GROUPS = ["4th Year", "3rd Year", "2nd Year", "1st Year", "Software", "Robotics", "Core"];
const DEFAULT_STUDENTS = [
	"4th Year: Archit Jain (Core) [992100]", "3rd Year: Yasharth (Core) [992101]", "3rd Year: Dhruvi Gupta (Software) [992102]", "3rd Year: Aryan Varshney (Core) [992103]", "2nd Year: Aradhaya (Robotics) [992104]", "2nd Year: Aman (Core) [992105]",
    "1st Year: Divyam Jain (Software) [992106]", "1st Year: Bhuwan Dhanwani (Robotics) [992107]", "1st Year: Kartik Virmani (Software) [992108]", "1st Year: Kshitika Barnwal (Core) [992109]", "1st Year: Kumar Shaurya (Software) [992110]", "1st Year: Vishal Tomar (Robotics) [992111]"
];
let h4_students = [];
let attendanceState = {};

// VALIDATION HELPERS
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
const validatePhone = (phone) => {
    return String(phone).match(/^\d{10}$/);
};
const validateURL = (url) => {
    try { 
        const u = new URL(url); 
        return u.protocol === "http:" || u.protocol === "https:"; 
    } catch (_) { return false; }
};

const highlightError = (el) => {
    el.classList.add('input-invalid');
    setTimeout(() => el.classList.remove('input-invalid'), 3000);
};

// AUDIO ENGINE
const AUDIO = {
    click: new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3"),
    success: new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3"),
    transition: new Audio("https://www.soundjay.com/misc/sounds/heartbeat-01a.mp3"),
    play: function(key) { if(this[key]) { this[key].volume = 0.3; this[key].currentTime = 0; this[key].play().catch(()=>{}); } }
};

// DOM ELEMENTS
const splashScreen = document.getElementById("splash-screen");
const attendanceList = document.getElementById("attendance-list");
const subjectSelector = document.getElementById("attendance-subject");
const totalPresent = document.getElementById("total-present");
const totalAbsent = document.getElementById("total-absent");
const presentPercentage = document.getElementById("present-percentage");
const absentListElement = document.getElementById("absent-list");
const historyListElement = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const exportExcelBtn = document.getElementById("export-excel-btn");
const attendanceTakerSelect = document.getElementById("attendance-taker-select");
const customTopicInput = document.getElementById("custom-topic-input");
const yearSelect = document.getElementById("year-select");
const attendanceDomainFilter = document.getElementById("attendance-domain-filter");
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
const allMembersDatalist = document.getElementById("all-members-datalist");

// ADMIN ONBOARDING ELEMENTS
const newMemberNameInput = document.getElementById("new-member-name");
const newMemberEmailInput = document.getElementById("new-member-email");
const newMemberPhoneInput = document.getElementById("new-member-phone");
const newMemberYearSelect = document.getElementById("new-member-year-select");
const newMemberBatchInput = document.getElementById("new-member-batch");
const newMemberEnrollmentInput = document.getElementById("new-member-enrollment");
const newMemberGroupSelect = document.getElementById("new-member-group");
const customGroupInput = document.getElementById("custom-group-input");
const addMemberBtn = document.getElementById("add-member-btn");
const removeMemberSelect = document.getElementById("remove-member-select");
const removeMemberBtn = document.getElementById("remove-member-btn");
const removePermanentGroupSelect = document.getElementById("remove-permanent-group-select");
const removePermanentGroupBtn = document.getElementById("remove-permanent-group-btn");

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
const projectMembersSelect = document.getElementById("project-members-select"); 
const projectLinksInput = document.getElementById("project-links");
const projectStartInput = document.getElementById("project-start");
const projectEndInput = document.getElementById("project-end");
const projectPurposeInput = document.getElementById("project-purpose");
const projectTechInput = document.getElementById("project-tech");
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
const profileEnrollmentInput = document.getElementById('profile-enrollment');
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
const securityMessage = document.getElementById('security-message');

// PIN CHANGE ELEMENTS
const verifyPinInput = document.getElementById('current-security-pin-verify');
const newPinInput = document.getElementById('new-security-pin');
const updatePinBtn = document.getElementById('update-pin-btn');

// --- AUTH & PROFILE LOGIC ---
const USERS_KEY = "cicr_auth_users";
let isRegistering = false;
let currentUser = null;
let generatedOTP = null;
let isVerified = false;
let isAdminUnlocked = false; 

function getStoredUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
function saveStoredUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function toggleAuthMode() {
    isRegistering = !isRegistering;
    AUDIO.play('click');
    const forgotLink = document.getElementById('forgot-password-link');
    if (isRegistering) {
        authTitle.textContent = "NEW USER REGISTRATION";
        loginBtn.textContent = "REGISTER & LOGIN";
        toggleAuthBtn.textContent = "Back to Login";
        registrationFields.style.display = 'block';
        loginError.style.display = 'none';
        if(forgotLink) forgotLink.style.display = 'none'; 
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
        if(forgotLink) forgotLink.style.display = 'block';
    }
}

if(togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const showIcon = togglePasswordBtn.querySelector('.eye-show');
        const hideIcon = togglePasswordBtn.querySelector('.eye-hide');
        if(type === 'password') { showIcon.style.display = 'block'; hideIcon.style.display = 'none'; }
        else { showIcon.style.display = 'none'; hideIcon.style.display = 'block'; }
    });
}

sendOtpBtn.addEventListener('click', () => {
    const contact = usernameInput.value;
    if(!contact) { highlightError(usernameInput); alert("Enter Email/Phone first"); return; }
    
    if(!validateEmail(contact) && !validatePhone(contact)) {
        highlightError(usernameInput);
        alert("Please enter a valid Email Address or a 10-digit Mobile Number.");
        return;
    }

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
    } else { alert("Incorrect OTP"); }
});

function loadUserProfile() {
    if (!currentUser) return;
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
    profileIdInput.value = currentUser.id;
    profileNameInput.value = currentUser.name;
    profileYearSelect.value = currentUser.year || "1st Year";
    profileEnrollmentInput.value = currentUser.enrollment || "";
}

function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            profilePreview.style.backgroundImage = `url(${base64Image})`;
            currentUser.tempAvatar = base64Image; 
        };
        reader.readAsDataURL(file);
    }
}

function operateGate(callback) {
    AUDIO.play('transition');
    techGate.classList.add('active');
    setTimeout(() => {
        if(callback) callback();
        setTimeout(() => { techGate.classList.remove('active'); }, 1000);
    }, 1200);
}

function updateProfile() {
    operateGate(() => {
        if (!currentUser) return;
        const users = getStoredUsers();
        currentUser.name = profileNameInput.value.trim();
        currentUser.year = profileYearSelect.value;
        currentUser.enrollment = profileEnrollmentInput.value.trim();
        if (currentUser.tempAvatar) { currentUser.avatar = currentUser.tempAvatar; delete currentUser.tempAvatar; }
        if (users[currentUser.id]) {
            users[currentUser.id].name = currentUser.name;
            users[currentUser.id].year = currentUser.year;
            users[currentUser.id].enrollment = currentUser.enrollment;
            if(currentUser.avatar) users[currentUser.id].avatar = currentUser.avatar;
            saveStoredUsers(users);
            showSuccessAnimation();
            loadUserProfile(); 
        }
    });
}

updatePinBtn.addEventListener('click', () => {
    const currentVerify = verifyPinInput.value.trim();
    const newPin = newPinInput.value.trim();

    if(currentVerify !== GLOBAL_SECURITY_PIN) return alert("Verification Failed: Current Master PIN is incorrect.");
    if(newPin.length !== 4 || isNaN(newPin)) return alert("PIN must be exactly 4 digits.");
    
    GLOBAL_SECURITY_PIN = newPin;
    localStorage.setItem("cicr_security_pin", newPin);
    
    const sub = encodeURIComponent("SECURITY ALERT: System PIN Updated");
    const body = encodeURIComponent(`The CICR Portal Security PIN has been updated.\nNew Master PIN: ${newPin}\nUpdated By Admin: ${currentUser ? currentUser.name : 'Unknown User'}\n\nThis is a system generated log.`);
    window.location.href = `mailto:${SYSTEM_OWNER_EMAIL}?subject=${sub}&body=${body}`;
    
    verifyPinInput.value = "";
    newPinInput.value = "";
    showSuccessAnimation();
    alert("System Master PIN Authorized and Updated. Alerts sent.");
});

function logout() {
    operateGate(() => {
        currentUser = null;
        isAdminUnlocked = false; 
        userAvatarDisplay.style.display = 'none';
        appContent.style.display = 'none';
        loginScreen.style.display = 'block';
        usernameInput.value = ''; passwordInput.value = '';
        if(isRegistering) toggleAuthMode();
    });
}

function showSuccessAnimation() {
    AUDIO.play('success');
    const overlay = document.getElementById('action-success-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => { overlay.style.display = 'none'; }, 2000); 
}

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
            if (dist < 150) { ctx.strokeStyle = `rgba(69, 162, 158, ${1 - dist/150})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
        }
    }
    requestAnimationFrame(animateParticles);
}
initParticles(); animateParticles();

// --- TAB LOGIC ---
let pendingTabId = null; 
let pendingAction = null; 

function switchTab(targetTabId) {
    AUDIO.play('click');
    if ((targetTabId === 'admin' || targetTabId === 'history' || targetTabId === 'directory') && !isAdminUnlocked) {
        pendingTabId = targetTabId;
        securityMessage.textContent = "This section requires High-Level Security Clearance.";
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
        else if (targetTabId === 'admin') { populateGroupSelects(); }
        else if (targetTabId === 'account') { loadUserProfile(); }
        else if (targetTabId === 'equipment') { renderEquipmentLogs(); }
        else if (targetTabId === 'directory') renderMemberDirectory();
        else if (targetTabId === 'scheduling') populateSchedulingDropdowns();
    }
}

function verifySecurityPin() {
    if(securityPinInput.value === GLOBAL_SECURITY_PIN) { 
        isAdminUnlocked = true; 
        securityOverlay.style.display = 'none'; 
        
        if(pendingTabId) { 
            switchTab(pendingTabId); 
            pendingTabId = null; 
        } 
        
        if(pendingAction) {
            pendingAction();
            pendingAction = null;
        }
    } 
    else { 
        alert("ACCESS DENIED: INCORRECT PIN"); 
        securityPinInput.value = ''; 
        securityPinInput.focus(); 
    }
}
unlockBtn.addEventListener('click', verifySecurityPin);
securityCancel.addEventListener('click', () => { securityOverlay.style.display = 'none'; pendingTabId = null; pendingAction = null; });
securityPinInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') verifySecurityPin(); });

function loadProjects() { return JSON.parse(localStorage.getItem("cicrProjects") || "[]"); }
function saveProject() {
    const name = projectNameInput.value.trim();
    const type = projectTypeSelect.value;
    const selectedMembers = Array.from(projectMembersSelect.selectedOptions).map(o => o.value);
    const members = selectedMembers.join(", ");
    const rawLinks = projectLinksInput.value.trim(); 
    const start = projectStartInput.value;
    const end = projectEndInput.value;
    const purpose = projectPurposeInput.value.trim();
    const tech = projectTechInput.value.trim();

    if (!name || !members || !purpose) { alert("Error: Title, Members, and Purpose are required."); return; }
    
    if (rawLinks) {
        const linkArr = rawLinks.split(',').map(l => l.trim());
        for (let l of linkArr) {
            if (!validateURL(l)) {
                highlightError(projectLinksInput);
                alert(`Invalid URL detected: "${l}". All resources must be valid links starting with http:// or https://`);
                return;
            }
        }
    }

    operateGate(() => {
        const newProject = { id: Date.now(), name, type, members, links: rawLinks, start, end, purpose, tech };
        const projects = loadProjects(); projects.push(newProject);
        localStorage.setItem("cicrProjects", JSON.stringify(projects));
        showSuccessAnimation();
        projectNameInput.value = ""; projectLinksInput.value = ""; 
        projectStartInput.value = ""; projectEndInput.value = ""; projectPurposeInput.value = "";
        projectTechInput.value = "";
        renderProjects();
    });
}
function renderProjects() {
    const projects = loadProjects(); liveProjectsList.innerHTML = "";
    if (projects.length === 0) { liveProjectsList.innerHTML = '<p style="opacity:0.6; font-size:13px;">Shelf is empty. Add a project above.</p>'; return; }
    projects.sort((a, b) => (a.type === 'live' ? -1 : 1));
    projects.forEach(p => {
        let techTags = p.tech ? p.tech.split(',').map(t => `<span class="project-tech-tag">${t.trim()}</span>`).join('') : 'Not Specified';
        let linksHtml = '';
        if (p.links) {
            const linkArr = p.links.split(',').filter(l => l.trim().length > 0);
            linksHtml = linkArr.map((url, i) => `<a href="${url.trim()}" target="_blank" class="project-btn-link">🔗 Resource ${i+1}</a>`).join('');
        }
        liveProjectsList.innerHTML += `
        <div class="project-card">
            <h4>${p.name} <span style="font-size:10px; color:${p.type === 'live' ? 'var(--color-success)' : '#888'}; border:1px solid currentColor; padding:2px 5px; border-radius:2px; vertical-align:middle;">${p.type === 'live' ? 'LIVE' : 'ARCHIVED'}</span></h4>
            <div class="project-info"><strong>Participants:</strong> ${p.members}</div>
            <div class="project-info" style="font-style:italic; color:#aaa; margin-bottom:10px;">"${p.purpose}"</div>
            <div class="project-info"><strong>Tech Stack:</strong><br>${techTags}</div>
            <div class="project-info" style="margin-top:10px;"><strong>Timeline:</strong> ${p.start} ${p.end ? 'to ' + p.end : '(Ongoing)'}</div>
            <div class="project-actions">${linksHtml}</div>
            <button class="btn-delete-project" onclick="deleteProject(${p.id})">DELETE</button>
        </div>`;
    });
}
window.deleteProject = function(id) { if(!confirm("Delete this project from the shelf?")) return; let projects = loadProjects(); projects = projects.filter(p => p.id !== id); localStorage.setItem("cicrProjects", JSON.stringify(projects)); renderProjects(); };

function saveEquipment() {
    const name = eqNameInput.value.trim(); const member = eqMemberSelect.value; const group = eqGroupInput.value.trim(); const issue = eqIssueDate.value; const ret = eqReturnDate.value;
    if (!name || !member || !issue) { alert("Please fill Equipment Name, Member, and Issue Date."); return; }
    operateGate(() => {
        const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
        logs.unshift({ id: Date.now(), name, member: member.split(": ")[1] || member, group, issue, return: ret, status: "ISSUED" });
        localStorage.setItem("cicrEquipment", JSON.stringify(logs));
        showSuccessAnimation(); eqNameInput.value = ""; eqGroupInput.value = ""; eqMemberSelect.value = ""; renderEquipmentLogs();
    });
}

window.sendEquipmentReminder = function(id) {
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    const log = logs.find(l => l.id === id);
    if (!log || !log.return) return alert("Error: No due date found for this item.");
    const users = getStoredUsers();
    const memberObj = Object.values(users).find(u => u.name === log.member);
    const email = memberObj ? memberObj.id : "";
    const sub = encodeURIComponent(`URGENT: CICR Equipment Return Reminder - ${log.name}`);
    const body = encodeURIComponent(`Hello ${log.member},\n\nThis is a reminder regarding the hardware issued to you:\nEQUIPMENT: ${log.name}\nDUE DATE: ${log.return}\nPROJECT: ${log.group}\n\nPlease ensure the equipment is returned by tomorrow.\n\nRegards,\nCICR Inventory Management`);
    window.location.href = `mailto:${email}?subject=${sub}&body=${body}`;
};

function renderEquipmentLogs() {
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]"); 
    eqLogBody.innerHTML = "";
    if (logs.length === 0) { eqLogBody.innerHTML = '<tr><td colspan="5" style="text-align:center; opacity:0.5;">No active equipment logs.</td></tr>'; return; }
    logs.forEach(log => {
        const isSubmitted = log.status === "SUBMITTED";
        const isDueSoon = !isSubmitted && log.return && (new Date(log.return) - new Date() < 172800000); 
        eqLogBody.innerHTML += `<tr><td style="${isSubmitted ? 'opacity:0.5; text-decoration:line-through;' : 'color:var(--color-accent);'}">${log.name}${isDueSoon ? '<br><small style="color:var(--color-danger); font-weight:bold;">! DUE SOON</small>' : ''}</td><td>${log.member}<br><small style="color:#666">${log.group}</small></td><td style="font-size:11px;">Out: ${log.issue}<br>Due: ${log.return || 'N/A'}</td><td><span style="color: ${isSubmitted ? 'var(--color-success)' : 'var(--color-tinker)'}; font-weight:bold; font-size:10px;">${log.status}</span></td><td><div style="display:flex; gap:5px;">${!isSubmitted ? `<button onclick="handleEqReturn(${log.id})" class="status-button" style="padding:4px 8px !important; border:1px solid var(--color-success)!important; color:var(--color-success)!important;">Return</button><button onclick="sendEquipmentReminder(${log.id})" class="status-button" title="Send 1-Day Reminder" style="padding:4px 8px !important; border:1px solid var(--color-accent)!important; color:var(--color-accent)!important;">🔔</button>` : `<button onclick="deleteEqLog(${log.id})" class="status-button" style="padding:4px 8px !important; border:1px solid var(--color-danger)!important; color:var(--color-danger)!important;">Del</button>`}</div></td></tr>`;
    });
}

window.handleEqReturn = function(id) {
    securityMessage.textContent = "Authorized Sign-off Required for Hardware Return.";
    securityOverlay.style.display = 'flex';
    securityPinInput.value = '';
    securityPinInput.focus();
    pendingAction = () => {
        let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]"); 
        const log = logs.find(l => l.id === id); 
        if(log) { log.status = "SUBMITTED"; localStorage.setItem("cicrEquipment", JSON.stringify(logs)); renderEquipmentLogs(); showSuccessAnimation(); }
    };
};
window.deleteEqLog = function(id) { if(!confirm("Delete log permanently?")) return; let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]"); logs = logs.filter(l => l.id !== id); localStorage.setItem("cicrEquipment", JSON.stringify(logs)); renderEquipmentLogs(); };

function loadChat() {
    const chat = JSON.parse(localStorage.getItem("cicrChat") || "[]"); chatDisplay.innerHTML = chat.length ? "" : `<div class="chat-message msg-other"><span class="msg-meta">SYSTEM | NOW</span>Welcome to the Secure Channel.</div>`;
    chat.forEach(msg => { const div = document.createElement("div"); div.className = `chat-message ${msg.sender === (currentUser ? currentUser.name : 'ME') ? 'msg-self' : 'msg-other'}`; div.innerHTML = `<span class="msg-meta">${msg.sender} | ${msg.time}</span>${msg.text}`; chatDisplay.appendChild(div); });
}
function postMessage() {
    const text = chatInput.value.trim(); if(!text) return;
    const chat = JSON.parse(localStorage.getItem("cicrChat") || "[]");
    chat.push({ sender: currentUser ? currentUser.name : "ME", text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    if(chat.length > 50) chat.shift(); localStorage.setItem("cicrChat", JSON.stringify(chat)); chatInput.value = ""; loadChat(); scrollChat();
}
function scrollChat() { chatDisplay.scrollTop = chatDisplay.scrollHeight; }

function loadGroups() { ALL_GROUPS = JSON.parse(localStorage.getItem("cicrGroups")) || ["4th Year", "3rd Year", "2nd Year", "1st Year", "Software", "Robotics", "Core"]; populateGroupSelects(); }
function saveGroups() { localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS)); }
function addPermanentGroup(groupName) { 
    const trimmed = groupName.trim(); 
    if (!trimmed) return alert("Enter group name.");
    if (ALL_GROUPS.map(g => g.toLowerCase()).includes(trimmed.toLowerCase())) { return alert("Group already exists."); }
    ALL_GROUPS.push(trimmed); saveGroups(); populateGroupSelects(); showSuccessAnimation(); return true; 
}
function removePermanentGroup() {
    const group = removePermanentGroupSelect.value;
    if(!group) return alert("Select a group to remove.");
    if(confirm(`Permanently remove group "${group}"? This will not delete members, only the tag.`)) {
        ALL_GROUPS = ALL_GROUPS.filter(g => g !== group); saveGroups(); populateGroupSelects(); showSuccessAnimation();
    }
}

function loadStudents() { h4_students = JSON.parse(localStorage.getItem("cicrMembers")) || DEFAULT_STUDENTS; refreshAllDropdowns(); }
function refreshAllDropdowns() { populateAllMembersDatalist(); populateSchedulingDropdowns(); populateProjectMembersDropdown(); }
function saveStudents() { localStorage.setItem("cicrMembers", JSON.stringify(h4_students)); refreshAllDropdowns(); }
function updateClock() { const now = new Date(); digitalClock.textContent = `${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })} | ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`; }

function populateGroupSelects() {
    if (!ALL_GROUPS || !yearSelect) return;
    const selected = Array.from(yearSelect.selectedOptions).map(o => o.value); yearSelect.innerHTML = "";
    ALL_GROUPS.forEach(g => { if(g.includes("Year")) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; if (selected.includes(g)) opt.selected = true; yearSelect.appendChild(opt); } });
    if(!yearSelect.selectedOptions.length && yearSelect.options.length) { const def = Array.from(yearSelect.options).find(o => o.value === "1st Year") || yearSelect.options[0]; def.selected = true; }
    attendanceDomainFilter.innerHTML = '<option value="ALL">All Domains</option>';
    ALL_GROUPS.forEach(g => { if(!g.includes("Year")) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; attendanceDomainFilter.appendChild(opt); } });
    newMemberGroupSelect.innerHTML = ''; 
    ALL_GROUPS.forEach(g => { if(!g.includes("Year")) { const opt = document.createElement('option'); opt.value = g; opt.textContent = g.toUpperCase(); newMemberGroupSelect.appendChild(opt); } });
    const cust = document.createElement('option'); cust.value = "Custom"; cust.textContent = "Custom Unit..."; newMemberGroupSelect.appendChild(cust);
    removePermanentGroupSelect.innerHTML = '<option value="" disabled selected>-- Select Group to Delete --</option>';
    ALL_GROUPS.forEach(g => { if(g !== "4th Year" && g !== "3rd Year" && g !== "2nd Year" && g !== "1st Year") { const opt = document.createElement('option'); opt.value = g; opt.textContent = g; removePermanentGroupSelect.appendChild(opt); } });
}

function populateAllMembersDatalist() {
    allMembersDatalist.innerHTML = '';
    h4_students.forEach(s => { const opt = document.createElement("option"); opt.value = s.includes(": ") ? s.split(": ")[1] : s; allMembersDatalist.appendChild(opt); });
}
function populateSchedulingDropdowns() { 
    if (!h4_students || !scheduleRecipientSelect) return;
    scheduleRecipientSelect.innerHTML = ''; 
    h4_students.forEach(s => { const n = s.includes(": ") ? s.split(": ")[1] : s; const rO = document.createElement("option"); rO.value = n; rO.textContent = n; scheduleRecipientSelect.appendChild(rO); }); 
}
function populateProjectMembersDropdown() {
    if(!h4_students || !projectMembersSelect) return;
    projectMembersSelect.innerHTML = '';
    h4_students.forEach(s => { const n = s.includes(": ") ? s.split(": ")[1] : s; const opt = document.createElement("option"); opt.value = n; opt.textContent = n; projectMembersSelect.appendChild(opt); });
}

function getMeetingTopic() { return subjectSelector.value === "Other" && customTopicInput.value.trim() !== "" ? customTopicInput.value.trim() : subjectSelector.options[subjectSelector.selectedIndex].textContent; }
function updateSubjectDisplay() { document.getElementById("current-subject-display").textContent = getMeetingTopic(); }
function handleTopicChange() { customTopicInput.style.display = subjectSelector.value === "Other" ? "block" : "none"; if(subjectSelector.value === "Other") customTopicInput.focus(); updateSubjectDisplay(); }
function handleGroupChange() { document.getElementById("custom-group-input-wrapper").style.display = newMemberGroupSelect.value === "Custom" ? "block" : "none"; if(newMemberGroupSelect.value === "Custom") customGroupInput.focus(); }

function addMember() {
    const name = newMemberNameInput.value.trim();
    const email = newMemberEmailInput.value.trim();
    const phone = newMemberPhoneInput.value.trim();
    const year = newMemberYearSelect.value;
    const batch = newMemberBatchInput.value.trim();
    const enrollment = newMemberEnrollmentInput.value.trim();
    let domain = newMemberGroupSelect.value;
    
    if (!name || !email || !batch || !phone) return alert("Error: Name, Email, Phone, and Batch are mandatory.");
    if (!validateEmail(email)) { highlightError(newMemberEmailInput); alert("Invalid Email Address provided."); return; }
    if (!validatePhone(phone)) { highlightError(newMemberPhoneInput); alert("Invalid Phone Number. Must be a 10-digit numeric value."); return; }
    if (domain === "Custom") { domain = customGroupInput.value.trim(); if (!domain) return alert("Error: Enter custom unit name."); }
    if (!ALL_GROUPS.includes(domain)) addPermanentGroup(domain);
    
    const memberKey = `${year}: ${name} (${domain})${enrollment ? ' ['+enrollment+']' : ''}`;
    if (h4_students.some(s => s.toLowerCase() === memberKey.toLowerCase())) return alert(`Error: User exists.`);
    
    operateGate(() => {
        h4_students.push(memberKey); h4_students.sort(); saveStudents();
        const sub = encodeURIComponent("INVITATION: Register for CICR Official Web Portal");
        const body = encodeURIComponent(`Hello ${name},\n\nWelcome to CICR! \nDomain: ${domain}\nYear: ${year}\nBatch: ${batch}\nEnrollment No: ${enrollment}\n\n1. PORTAL REGISTRATION:\nPlease proceed to create your official account using your provided email/phone:\nhttps://www.cicr.in/\n\n2. WHATSAPP COMMUNITY:\nJoin our official communication channel here:\nhttps://chat.whatsapp.com/K86rBBwgB6jBsP3am3Oatx\n\nRegards,\nCICR Management`);
        window.location.href = `mailto:${email}?subject=${sub}&body=${body}`;
        newMemberNameInput.value = ""; newMemberEmailInput.value = ""; newMemberPhoneInput.value = ""; newMemberBatchInput.value = ""; newMemberEnrollmentInput.value=""; customGroupInput.value = "";
        showSuccessAnimation(); renderStudents();
    });
}

function removeMember() { 
    const m = removeMemberSelect.value; if (!m || !confirm(`Remove "${m}"?`)) return; 
    const fullStr = h4_students.find(s => s.includes(m));
    if(fullStr) { const i = h4_students.indexOf(fullStr); if (i > -1) { h4_students.splice(i, 1); saveStudents(); alert("User removed."); } renderStudents(); } else { alert("User not found in database."); }
}

function renderStudents() {
    attendanceList.innerHTML = ""; attendanceState = {}; 
    const selYears = Array.from(yearSelect.selectedOptions).map(o => o.value);
    const selDomain = attendanceDomainFilter.value;
    const filtered = h4_students.filter(s => { const [yearPart, rest] = s.split(": "); const domainMatch = selDomain === "ALL" || s.includes(`(${selDomain})`); return selYears.includes(yearPart) && domainMatch; }).sort();
    if (!filtered.length) { attendanceList.innerHTML = `<li style="padding: 15px; opacity: 0.7; color: #fff;">${selYears.length ? 'No users found matching filters.' : 'Select a Group to load.'}</li>`; updateSummary(); return; }
    filtered.forEach(s => {
        const [r, n] = s.split(": "); attendanceState[s] = "MARK"; const id = s.replace(/[^a-zA-Z0-9]/g, "_");
        const li = document.createElement("li"); li.className = "student-item unmarked"; li.id = id;
        li.innerHTML = `<div class="student-info"><div class="student-name">${n}</div><div class="student-id">${r}</div></div><div class="status-controls"><button class="status-button btn-present" data-key="${s}" style="opacity: 0.4;">Present</button><button class="status-button btn-absent" data-key="${s}" style="opacity: 0.4;">Absent</button><button class="status-button btn-unmarked" data-key="${s}" style="opacity: 1.0;">Unmarked</button></div>`;
        attendanceList.appendChild(li);
    });
    attendanceList.querySelectorAll(".status-button").forEach(b => b.addEventListener("click", e => {
        const k = e.target.getAttribute("data-key"); const st = e.target.textContent.toUpperCase(); attendanceState[k] = st === "UNMARKED" ? "MARK" : st;
        const li = document.getElementById(k.replace(/[^a-zA-Z0-9]/g, "_")); li.querySelector(".status-controls").querySelectorAll(".status-button").forEach(btn => btn.style.opacity = '0.4');
        li.classList.remove("present", "absent", "unmarked"); if (st === "PRESENT") li.classList.add("present"); else if (st === "ABSENT") li.classList.add("absent"); else li.classList.add("unmarked");
        e.target.style.opacity = '1.0'; updateSummary();
    }));
    updateSummary();
}

function updateSummary() {
    let p = 0, a = 0, an = []; for (const k in attendanceState) { if (attendanceState[k] === "PRESENT") p++; else if (attendanceState[k] === "ABSENT") { a++; an.push(k.split(": ")[1]); } }
    const t = Object.keys(attendanceState).length; const pct = t > 0 ? ((p / t) * 100).toFixed(1) : "0.0";
    totalPresent.textContent = p; totalAbsent.textContent = a; presentPercentage.textContent = `${pct}%`;
    absentListElement.textContent = an.length ? an.join(", ") : "None";
}

function saveData() {
    const sel = Array.from(yearSelect.selectedOptions).map(o => o.value); if (!Object.keys(attendanceState).length || !sel.length || !attendanceDate.value || attendanceTakerSelect.value === "") return alert("Error: Incomplete data.");
    if (Object.values(attendanceState).filter(s => s === "MARK").length > 0 && !confirm("Commmit with unmarked users?")) return;
    operateGate(() => {
        const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
        h.unshift({ id: Date.now(), date: attendanceDate.value, topic: getMeetingTopic(), group: sel.join(', '), taker: attendanceTakerSelect.value, summary: meetingSummaryInput.value.trim() || "No summary.", attendance: Object.keys(attendanceState).map(k => { return { name: k.split(": ")[1], group: k.split(": ")[0], status: attendanceState[k] }; }) });
        localStorage.setItem("attendanceHistory", JSON.stringify(h)); showSuccessAnimation(); renderStudents();
    });
}

function renderHistory() {
    const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]"); historyListElement.innerHTML = h.length ? "" : '<li style="padding: 15px; opacity: 0.6;">No logs.</li>';
    removeSelectedBtn.style.display = h.length ? 'block' : 'none'; clearHistoryBtn.style.display = h.length ? 'block' : 'none';
    h.forEach(r => {
        const p = r.attendance.filter(a => a.status === "PRESENT").length; const t = r.attendance.filter(a => a.status !== "MARK").length;
        const li = document.createElement("li"); li.className = "history-item";
        li.innerHTML = `
            <div class="history-header-wrapper">
                <input type="checkbox" class="history-checkbox" data-id="${r.id}" style="width: auto; margin-right: 10px;">
                <button class="history-header-btn" onclick="this.parentElement.nextElementSibling.style.display = this.parentElement.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                    <span>[${r.date}] ${r.topic}</span>
                    <span style="font-weight: 700; color: var(--color-accent);">${p}/${t} (${t > 0 ? ((p/t)*100).toFixed(0) : 0}%)</span>
                </button>
            </div>
            <div class="history-details" style="display:none;">
                <p><strong>Recorder:</strong> ${r.taker}</p>
                <p><strong>Summary:</strong> ${r.summary}</p>
                <button onclick="exportSingleLog(${r.id})" class="btn-utility btn-export-excel" style="padding: 6px 12px; font-size: 10px; margin-bottom: 10px;">EXPORT ONLY THIS LOG</button>
                <ul>${r.attendance.map(a => `<li style="color:${a.status === 'PRESENT' ? 'var(--color-success)' : 'var(--color-danger)'}">${a.name} [${a.status}]</li>`).join("")}</ul>
            </div>`;
        historyListElement.appendChild(li);
    });
}

window.exportSingleLog = function(id) {
    const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const r = h.find(item => item.id === id);
    if (!r) return;
    let csv = "data:text/csv;charset=utf-8,Date,Topic,Group,Recorder,Summary,Student Name,Student Group,Status\n";
    r.attendance.forEach(a => { csv += `${r.date},${r.topic.replace(/,/g, " ")},${r.group.replace(/,/g, " ")},${r.taker.replace(/,/g, " ")},${r.summary.replace(/,/g, " ")},${a.name},${a.group},${a.status}\n`; });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", `Log_${r.topic.replace(/\s+/g, '_')}_${r.date}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

function clearHistory() { if (confirm("Clear ALL?")) { localStorage.removeItem("attendanceHistory"); renderHistory(); } }
function removeSelectedRecords() { const cb = document.querySelectorAll('.history-checkbox:checked'); if (!cb.length || !confirm("Delete selected?")) return; let h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]"); const ids = Array.from(cb).map(c => parseInt(c.getAttribute('data-id'))); h = h.filter(r => !ids.includes(r.id)); localStorage.setItem("attendanceHistory", JSON.stringify(h)); renderHistory(); }

function exportToCSV() { 
    const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]"); 
    if (!h.length) return alert("No logs available to export.");
    const selectedCheckboxes = document.querySelectorAll('.history-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
    const dataToExport = selectedIds.length > 0 ? h.filter(record => selectedIds.includes(record.id)) : h;
    let csv = "data:text/csv;charset=utf-8,Date,Topic,Group,Recorder,Summary,Student Name,Student Group,Status\n"; 
    dataToExport.forEach(r => r.attendance.forEach(a => csv += `${r.date},${r.topic.replace(/,/g, " ")},${r.group.replace(/,/g, " ")},${r.taker.replace(/,/g, " ")},${r.summary.replace(/,/g, " ")},${a.name},${a.group},${a.status}\n`)); 
    const fileName = selectedIds.length > 0 ? "CICR_Selected_Logs.csv" : "CICR_All_Logs.csv";
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", fileName); document.body.appendChild(link); link.click(); document.body.removeChild(link); 
}

function calculatePersonalReport() {
    const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]"); const rd = {}; h4_students.forEach(m => rd[m] = { total: 0, attended: 0, group: m.split(": ")[0], name: m.split(": ")[1] });
    h.forEach(r => r.attendance.forEach(a => { const k = `${a.group}: ${a.name}`; if (rd[k] && a.status !== "MARK") { rd[k].total++; if (a.status === "PRESENT") rd[k].attended++; } }));
    const generateRow = (d) => {
        const pct = d.total > 0 ? ((d.attended / d.total) * 100).toFixed(1) : 0;
        let c = d.total > 0 ? (pct >= 75 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-tinker)' : 'var(--color-danger)') : '#ccc';
        return `<tr><td>${d.name}</td><td>${d.group}</td><td style="text-align:left;"><span style="display:inline-block; width:45px; font-weight:bold; color:${c};">${d.total > 0 ? pct + "%" : "N/A"}</span><div class="analytics-progress-wrapper"><div class="analytics-progress-fill" style="width:${d.total > 0 ? pct : 0}%; background-color:${c};"></div></div></td></tr>`;
    };
    ['1', '2', '3', '4'].forEach(yr => { const tbody = document.getElementById(`analytics-body-${yr}`); tbody.innerHTML = ""; Object.keys(rd).filter(k => rd[k].group.includes(yr)).sort().forEach(k => { tbody.innerHTML += generateRow(rd[k]); }); if(tbody.innerHTML === "") tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.5;">No data for ${yr}st/nd/rd/th Year</td></tr>`; });
}

function renderMemberDirectory() {
    const grid = document.getElementById('member-directory-grid');
    const badge = document.getElementById('member-count-badge');
    const users = getStoredUsers();
    grid.innerHTML = "";
    const userArray = Object.values(users);
    badge.textContent = userArray.length;
    if (userArray.length === 0) { grid.innerHTML = `<p style="grid-column: span 3; opacity: 0.5; text-align: center;">No registered accounts found.</p>`; return; }
    userArray.forEach(user => {
        const photoStyle = user.avatar ? `style="background-image: url(${user.avatar})"` : "";
        const initial = user.name ? user.name.charAt(0) : "?";
        const card = document.createElement('div'); card.className = "member-card";
        card.innerHTML = `<div class="member-card-photo" ${photoStyle}>${!user.avatar ? `<span style="font-size:30px; color:var(--color-accent);">${initial}</span>` : ''}</div><div class="member-card-name">${user.name}</div><div class="member-card-detail">📧 ${user.id}</div><div class="member-card-detail">🎓 ${user.year} | Enroll: ${user.enrollment || 'N/A'}</div><div class="member-card-detail" style="color:var(--color-accent); font-weight:bold; margin-top:10px;">${user.domain || 'Verified Member'}</div><button class="btn-revoke-access" onclick="deleteUserAccount('${user.id}')">Revoke Access</button>`;
        grid.appendChild(card);
    });
}

window.deleteUserAccount = function(userId) {
    if(!confirm(`SYSTEM ALERT: You are about to permanently delete account [${userId}]. This will revoke all portal access. Proceed?`)) return;
    operateGate(() => { const users = getStoredUsers(); if(users[userId]) { delete users[userId]; saveStoredUsers(users); showSuccessAnimation(); renderMemberDirectory(); alert("Account Permanently Deleted."); } });
};

function exportDirectoryCSV() {
    const users = Object.values(getStoredUsers());
    if (users.length === 0) return alert("No registered members to export.");
    let csv = "data:text/csv;charset=utf-8,Full Name,User ID (Email/Phone),Year,Enrollment,Domain\n";
    users.forEach(user => { csv += `"${user.name}","${user.id}","${user.year}","${user.enrollment || 'N/A'}","${user.domain || 'CORE'}"\n`; });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", "CICR_Member_Contacts.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function initializeListeners() {
	setInterval(updateClock, 1000); updateClock();
    splashScreen.addEventListener('click', () => { 
        AUDIO.play('click');
        splashScreen.style.opacity = '0'; 
        setTimeout(() => { splashScreen.style.display = 'none'; operateGate(() => { loginScreen.style.display = 'block'; }); }, 500); 
    });
	toggleAuthBtn.addEventListener("click", toggleAuthMode);
    loginForm.addEventListener("submit", (e) => {
		e.preventDefault(); const user = usernameInput.value.trim(); const pass = passwordInput.value.trim(); if (!user || !pass) return;
        const u = getStoredUsers();
        if (isRegistering) {
            if(!isVerified) return alert("Verify OTP first."); const n = regNameInput.value.trim(); const b = regBatchInput.value.trim(); if (!n || !b) return;
            if (!validateEmail(user) && !validatePhone(user)) { highlightError(usernameInput); return alert("Invalid Email/Phone format."); }
            if (u[user]) return alert("User exists.");
            operateGate(() => { u[user] = { id: user, password: pass, name: n, year: regYearSelect.value, batch: b }; saveStoredUsers(u); alert("Account Created."); toggleAuthMode(); });
        } else {
            operateGate(() => {
                if (user === USERNAME && pass === PASSWORD) { currentUser = { id: "ADMIN", name: "Administrator" }; loginSuccess(); } 
                else if (u[user] && u[user].password === pass) { currentUser = u[user]; loginSuccess(); } 
                else { alert("Invalid Credentials."); }
            });
        }
	});
    function loginSuccess() {
        AUDIO.play('success');
        loginScreen.style.display = 'none'; document.getElementById('success-screen').style.display = 'flex'; loadUserProfile();
        setTimeout(() => { document.getElementById('success-screen').style.display = 'none'; appContent.style.display = 'block'; loadGroups(); loadStudents(); switchTab('attendance'); }, 2000);
    }
    tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
	yearSelect.addEventListener("change", renderStudents);
    attendanceDomainFilter.addEventListener("change", renderStudents);
	saveBtn.addEventListener("click", saveData);
    exportExcelBtn.addEventListener("click", exportToCSV);
    clearHistoryBtn.addEventListener("click", clearHistory);
    removeSelectedBtn.addEventListener("click", removeSelectedRecords);
    addPermanentGroupBtn.addEventListener("click", () => { if(addPermanentGroup(newPermanentGroupInput.value)) { newPermanentGroupInput.value=""; } });
    removePermanentGroupBtn.addEventListener("click", removePermanentGroup);
	newMemberGroupSelect.addEventListener("change", handleGroupChange);
	addMemberBtn.addEventListener("click", addMember);
	removeMemberBtn.addEventListener("click", removeMember);
    addProjectBtn.addEventListener("click", saveProject);
    addEqBtn.addEventListener('click', saveEquipment);
    chatSendBtn.addEventListener("click", postMessage);
    updateProfileBtn.addEventListener("click", updateProfile);
    logoutBtn.addEventListener("click", logout);
    userAvatarDisplay.addEventListener("click", () => switchTab('account'));
    profilePicInput.addEventListener('change', handleProfilePicUpload);
    document.getElementById('directory-search').addEventListener('input', (e) => { const term = e.target.value.toLowerCase(); document.querySelectorAll('.member-card').forEach(card => { card.style.display = card.innerText.toLowerCase().includes(term) ? "block" : "none"; }); });
    document.getElementById('export-directory-btn').addEventListener('click', exportDirectoryCSV);
    document.getElementById('open-calendar-btn').addEventListener('click', () => attendanceDate.showPicker());
    document.getElementById('open-calendar-start-btn').addEventListener('click', () => document.getElementById('project-start').showPicker());
    document.getElementById('open-calendar-end-btn').addEventListener('click', () => document.getElementById('project-end').showPicker());
    document.getElementById('open-calendar-scheduler-btn').addEventListener('click', () => scheduleDateInput.showPicker());
    document.addEventListener('change', (e) => { if (e.target.classList.contains('history-checkbox')) { const exportBtn = document.getElementById("export-excel-btn"); const selectedCount = document.querySelectorAll('.history-checkbox:checked').length; exportBtn.textContent = selectedCount > 0 ? `Export Selected (${selectedCount})` : "Export All CSV"; } });
    scheduleRecipientSelect.addEventListener('change', () => {
        const selectedOptions = Array.from(scheduleRecipientSelect.selectedOptions);
        const emails = selectedOptions.map(opt => { const users = getStoredUsers(); const name = opt.value; const foundUser = Object.values(users).find(u => u.name === name); return foundUser ? foundUser.id : `${name.toLowerCase().replace(/\s/g, '.')}@jiit.ac.in`; });
        recipientEmailInput.value = emails.join(', ');
    });
    scheduleMeetingBtn.addEventListener('click', () => {
        const recipients = recipientEmailInput.value; const subject = encodeURIComponent(scheduleSubjectInput.value);
        if(!recipients || !subject) return alert("Fill Subject and Recipients.");
        const body = encodeURIComponent(`Hello,\n\nThis is an official meeting invitation from CICR.\n\nTopic: ${scheduleSubjectInput.value}\nDate: ${scheduleDateInput.value}\nTime: ${scheduleTimeInput.value}\nLocation: ${scheduleLocationTypeSelect.value} (${scheduleLocationDetailsInput.value})\n\nRegards,\n${scheduleInitiatorSelect.value}\nCICR Management`);
        window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`; showSuccessAnimation();
    });

    // --- FORGOT PASSWORD LOGIC ---
    const forgotTrigger = document.getElementById('forgot-password-trigger');
    const forgotSection = document.getElementById('forgot-password-section');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const sendResetBtn = document.getElementById('send-reset-btn');
    const resetEmailInput = document.getElementById('reset-email');
    const resetStatus = document.getElementById('reset-status');

    if(forgotTrigger) {
        forgotTrigger.addEventListener('click', () => {
            document.getElementById('login-form').style.display = 'none';
            forgotSection.style.display = 'block';
            authTitle.textContent = "ACCOUNT RECOVERY";
        });
    }

    if(backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            forgotSection.style.display = 'none';
            document.getElementById('login-form').style.display = 'flex';
            authTitle.textContent = "CICR MEMBER ACCESS";
            resetStatus.textContent = "";
        });
    }

    if(sendResetBtn) {
        sendResetBtn.addEventListener('click', async () => {
            const email = resetEmailInput.value.trim();
            if(!validateEmail(email)) return alert("Please enter a valid email.");
            
            sendResetBtn.textContent = "SENDING...";
            sendResetBtn.disabled = true;

            if (supabase) {
                const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
                if (error) { resetStatus.textContent = "Error: " + error.message; resetStatus.style.color = "var(--color-danger)"; } 
                else { resetStatus.textContent = "Reset link sent! Check your email."; resetStatus.style.color = "var(--color-success)"; }
            } else {
                setTimeout(() => { resetStatus.textContent = "[SIMULATION] Reset link sent to " + email; resetStatus.style.color = "var(--color-accent)"; }, 1000);
            }
            sendResetBtn.textContent = "SEND RESET LINK"; sendResetBtn.disabled = false;
        });
    }

    loadGroups(); loadStudents();
}
initializeListeners();