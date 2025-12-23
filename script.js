// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://qjpmsepigcjqkptfptnt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcG1zZXBpZ2NqcWtwdGZwdG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjA1NTIsImV4cCI6MjA4MTYzNjU1Mn0.VsVa4ZwYDz9YTWiVjpf96LECjRbm0Jshs4AEys_eHRQ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GLOBAL VARIABLES ---
const SYSTEM_OWNER_EMAIL = "cicrofficial@gmail.com";
let GLOBAL_PIN = "1407"; // Fallback, will be overwritten by fetchAdminPin()
let currentUser = null;
let isRegistering = false;
let isVerified = false;
let isAdminUnlocked = false;
let generatedOTP = null;

// Data Stores
let allMembers = []; // Objects from DB: {id, full_name, year, batch...}
let h4_students = []; // Strings for legacy compatibility: "Group: Name"
let ALL_GROUPS = []; // Loaded from DB
let selectedSyncMembers = []; // For Sync Tab
let currentSyncGroup = null; // Active Sync Session
let pendingTabId = null; // For Security Redirects
let pendingAction = null; // For Secure Actions (like Equipment Return)

// --- AUDIO ENGINE (RESTORED) ---
const AUDIO = {
    click: new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3"),
    success: new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3"),
    transition: new Audio("https://www.soundjay.com/misc/sounds/heartbeat-01a.mp3"),
    play: function(key) { 
        if(this[key]) { 
            this[key].volume = 0.3; 
            this[key].currentTime = 0; 
            this[key].play().catch(()=>{}); 
        } 
    }
};

// --- DOM ELEMENTS ---
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

// CHAT & PROFILE ELEMENTS
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


// --- INITIALIZATION & LOADERS ---

function initializeListeners() {
    setInterval(updateClock, 1000); updateClock();
    
    splashScreen.addEventListener('click', () => { 
        AUDIO.play('click');
        splashScreen.style.opacity = '0'; 
        setTimeout(() => { 
            splashScreen.style.display = 'none'; 
            operateGate(() => {
                loginScreen.style.display = 'block'; 
            });
        }, 500); 
    });
    
    toggleAuthBtn.addEventListener("click", toggleAuthMode);
    
    // CONSOLIDATED LOGIN HANDLER
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            loginError.textContent = "Please fill in email and password.";
            loginError.style.display = 'block';
            return;
        }

        loginBtn.textContent = "PROCESSING...";
        loginBtn.disabled = true;

        if (isRegistering) {
            // REGISTRATION FLOW
            const name = regNameInput.value.trim();
            const year = regYearSelect.value;
            const batch = regBatchInput.value.trim();

            if (!name || !batch) {
                alert("Name and Batch are required.");
                loginBtn.disabled = false; return;
            }

            if (isVerified) {
                // Verified OTP Update
                const { data, error } = await supabaseClient.auth.updateUser({
                    password: password,
                    data: { full_name: name, year: year, batch: batch }
                });
                if (error) alert("Profile Save Failed: " + error.message);
                else { alert("Registration Complete!"); handleLoginSuccess(data.user); }
            } else {
                // New Sign Up
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: { data: { full_name: name, year: year, batch: batch } }
                });
                if (error) alert("Registration Failed: " + error.message);
                else { alert("Registration Successful! Check Email/Login."); if(data.user) handleLoginSuccess(data.user); }
            }
        } else { 
            // LOGIN FLOW
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                loginError.textContent = "Login Failed: " + error.message;
                loginError.style.display = 'block';
                loginBtn.textContent = "LOGIN";
                loginBtn.disabled = false;
            } else {
                handleLoginSuccess(data.user);
            }
        }
    });

    // NAVIGATION
    tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
    
    // UI ELEMENTS
    attendanceTakerSelect.addEventListener("change", () => attendanceTakenBy.textContent = `Attendance Recorded By: ${attendanceTakerSelect.value}`);
    yearSelect.addEventListener("change", renderStudents);
    customTopicInput.addEventListener("input", updateSubjectDisplay);
    subjectSelector.addEventListener("change", handleTopicChange);
    saveBtn.addEventListener("click", saveData);
    createGMeetBtn.addEventListener("click", () => window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(getMeetingTopic())}`, '_blank'));
    
    // HISTORY ACTIONS
    clearHistoryBtn.addEventListener("click", clearHistory);
    removeSelectedBtn.addEventListener("click", removeSelectedRecords);
    exportExcelBtn.addEventListener("click", exportToCSV);
    
    // SCHEDULING
    scheduleMeetingBtn.addEventListener("click", handleScheduleMeeting);

    // ADMIN ACTIONS
    addPermanentGroupBtn.addEventListener("click", () => { if(addPermanentGroup(newPermanentGroupInput.value)) { alert("Group Added"); newPermanentGroupInput.value=""; } });
    newMemberGroupSelect.addEventListener("change", handleGroupChange);
    addMemberBtn.addEventListener("click", addMember);
    removeMemberBtn.addEventListener("click", removeMember);
    document.getElementById('update-pin-btn').addEventListener('click', updateAdminPin);

    // PROJECT & EQUIPMENT
    addProjectBtn.addEventListener("click", saveProject);
    addEqBtn.addEventListener('click', saveEquipment);
    
    // CHAT
    chatSendBtn.addEventListener("click", postMessage);
    chatInput.addEventListener("keypress", (e) => { if(e.key === 'Enter') postMessage(); });
    
    // PROFILE
    updateProfileBtn.addEventListener("click", updateProfile);
    logoutBtn.addEventListener("click", logout);
    userAvatarDisplay.addEventListener("click", () => switchTab('account'));
    profilePicInput.addEventListener('change', handleProfilePicUpload);

    // DIRECTORY & SYNC
    document.getElementById('export-directory-btn').addEventListener('click', exportDirectoryCSV);
    populateSyncMemberDropdown();

    // SECURITY OVERLAY
    unlockBtn.addEventListener('click', verifySecurityPin); 
    securityCancel.addEventListener('click', () => { 
        securityOverlay.style.display = 'none'; 
        pendingTabId = null; 
        pendingAction = null; 
    });
    securityPinInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') verifySecurityPin(); });

    // DATES
    const todayISO = new Date().toISOString().split('T')[0];
    attendanceDate.value = todayISO; scheduleDateInput.value = todayISO; projectStartInput.value = todayISO;
    eqIssueDate.value = todayISO;

    // FETCH DATA
    fetchAdminPin();
    loadGroups(); 
    loadStudents();
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
    digitalClock.textContent = `${dateString} | ${timeString}`;
}

// --- GATE & ANIMATION ---
function operateGate(callback) {
    AUDIO.play('transition');
    techGate.classList.add('active');
    setTimeout(() => {
        if(callback) callback();
        setTimeout(() => { techGate.classList.remove('active'); }, 1000);
    }, 1200);
}

function showSuccessAnimation() {
    AUDIO.play('success');
    const overlay = document.getElementById('action-success-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => { overlay.style.display = 'none'; }, 2000); 
}

// --- SECURITY LOGIC (CONSOLIDATED) ---
async function fetchAdminPin() {
    const { data } = await supabaseClient.from('app_settings').select('data_value').eq('category', 'admin_pin').single();
    if(data && data.data_value) GLOBAL_PIN = data.data_value.replace(/"/g, ''); 
}

function verifySecurityPin() {
    const input = document.getElementById('security-pin-input');
    if(input.value === GLOBAL_PIN) {
        isAdminUnlocked = true;
        document.getElementById('security-overlay').style.display = 'none';
        
        // Resume Pending Actions
        if(pendingTabId) { switchTab(pendingTabId); pendingTabId = null; }
        if(pendingAction) { pendingAction(); pendingAction = null; }
        
    } else {
        alert("ACCESS DENIED: INCORRECT PIN");
        input.value = "";
    }
}

async function updateAdminPin() {
    const current = document.getElementById('current-security-pin-verify').value;
    const newPin = document.getElementById('new-security-pin').value;
    
    if(current !== GLOBAL_PIN) return alert("Current PIN is incorrect.");
    if(newPin.length !== 4) return alert("New PIN must be 4 digits.");

    const { error } = await supabaseClient.from('app_settings').upsert({ category: 'admin_pin', data_value: newPin });

    if(!error) {
        GLOBAL_PIN = newPin;
        alert("Security PIN Updated.");
        
        // RESTORED: Email Alert
        const sub = encodeURIComponent("SECURITY ALERT: System PIN Updated");
        const body = encodeURIComponent(`The CICR Portal Security PIN has been updated.\nNew Master PIN: ${newPin}\nUser: ${currentUser.name}`);
        window.location.href = `mailto:${SYSTEM_OWNER_EMAIL}?subject=${sub}&body=${body}`;
        
        showSuccessAnimation();
    }
}


// --- TAB NAVIGATION ---
function switchTab(targetTabId) {
    AUDIO.play('click');
    
    // SECURITY CHECKS
    if ((targetTabId === 'admin' || targetTabId === 'history' || targetTabId === 'equipment') && !isAdminUnlocked) {
        pendingTabId = targetTabId;
        securityOverlay.style.display = 'flex';
        securityPinInput.value = ''; securityPinInput.focus();
        return; 
    }

    tabLinks.forEach(link => { link.classList.remove('active'); link.setAttribute('aria-selected', 'false'); });
    tabContents.forEach(content => { content.classList.remove('active'); content.style.display = 'none'; });
    
    const activeLink = document.querySelector(`.tab-link[data-tab="${targetTabId}"]`);
    const activeContent = document.getElementById(`${targetTabId}-content`);
    
    if (activeLink && activeContent) {
        activeLink.classList.add('active'); 
        activeContent.classList.add('active'); activeContent.style.display = 'block';
        
        // Tab Specific Loads
        if (targetTabId === 'history') renderHistory();
        else if (targetTabId === 'reports') calculatePersonalReport();
        else if (targetTabId === 'projects') renderProjects();
        else if (targetTabId === 'chat') { loadChat(); scrollChat(); }
        else if (targetTabId === 'admin') { populateGroupSelects(); populateRemoveMemberDropdown(); }
        else if (targetTabId === 'account') { loadUserProfile(); }
        else if (targetTabId === 'equipment') { populateEqMemberDropdown(); renderEquipmentLogs(); }
        else if (targetTabId === 'directory') { renderMemberDirectory(); }
    }
}

// --- DATA & SYNC LOADING ---
async function loadGroups() {
    const { data } = await supabaseClient.from('groups').select('group_name').order('group_name', { ascending: true });
    if (data) {
        ALL_GROUPS = data.map(g => g.group_name);
        populateGroupSelects(); 
    }
}

async function loadStudents() {
    const { data, error } = await supabaseClient.from('members').select('*').order('full_name', { ascending: true });
    if (data) {
        allMembers = data;
        // Sync h4_students for legacy compatibility
        h4_students = data.map(m => `${m.year}: ${m.full_name}`);
        refreshAllDropdowns();
    }
}

function refreshAllDropdowns() {
    populateAttendanceTakerDropdown(); 
    populateRemoveMemberDropdown(); 
    populateSchedulingDropdowns(); 
    populateEqMemberDropdown(); 
    populateSyncMemberDropdown();
    renderStudents();
}


// --- ATTENDANCE LOGIC ---
function renderStudents() {
    const list = document.getElementById('attendance-list');
    list.innerHTML = "";
    attendanceState = {}; 

    const selectedGroups = Array.from(yearSelect.selectedOptions).map(o => o.value);
    if (selectedGroups.length === 0) {
        list.innerHTML = `<li style="padding: 15px; opacity: 0.7;">Select a Group/Year to load members.</li>`;
        return;
    }

    const filteredMembers = allMembers.filter(m => selectedGroups.includes(m.year));
    if (filteredMembers.length === 0) {
        list.innerHTML = `<li style="padding: 15px; color: var(--color-danger);">No members found.</li>`;
        return;
    }

    filteredMembers.forEach(member => {
        const studentKey = `${member.year}: ${member.full_name}`;
        attendanceState[studentKey] = "MARK"; 

        const li = document.createElement("li");
        li.className = "student-item unmarked";
        li.innerHTML = `
            <div class="student-info">
                <div class="student-name">${member.full_name}</div>
                <div class="student-id">${member.year} ${member.batch ? '| ' + member.batch : ''}</div>
            </div>
            <div class="status-controls">
                <button class="status-button btn-present" data-key="${studentKey}">Present</button>
                <button class="status-button btn-absent" data-key="${studentKey}">Absent</button>
                <button class="status-button btn-unmarked" data-key="${studentKey}" style="opacity: 1.0;">Unmarked</button>
            </div>
        `;
        list.appendChild(li);
    });

    list.querySelectorAll(".status-button").forEach(btn => btn.addEventListener("click", handleStatusClick));
    updateSummary();
}

function handleStatusClick(e) {
    AUDIO.play('click');
    const key = e.target.getAttribute("data-key");
    const status = e.target.textContent.toUpperCase();
    attendanceState[key] = (status === "UNMARKED") ? "MARK" : status;

    const listItem = e.target.closest('li');
    listItem.classList.remove("present", "absent", "unmarked");
    listItem.querySelectorAll(".status-button").forEach(b => b.style.opacity = '0.4');
    
    if (status === "PRESENT") listItem.classList.add("present");
    else if (status === "ABSENT") listItem.classList.add("absent");
    else listItem.classList.add("unmarked");
    
    e.target.style.opacity = '1.0';
    updateSummary();
}

function updateSummary() {
    let p = 0, a = 0, an = [];
    for (const key in attendanceState) { 
        if (attendanceState[key] === "PRESENT") p++; 
        else if (attendanceState[key] === "ABSENT") { a++; an.push(key.split(": ")[1]); } 
    }
    const t = Object.keys(attendanceState).length;
    const pct = t > 0 ? ((p / t) * 100).toFixed(1) : "0.0";
    totalPresent.textContent = p; totalAbsent.textContent = a; presentPercentage.textContent = `${pct}%`;
    absentListElement.textContent = an.length > 0 ? an.join(", ") : "None";
}

async function saveData() {
    const selectedGroups = Array.from(yearSelect.selectedOptions).map(o => o.value);
    if (Object.keys(attendanceState).length === 0 || selectedGroups.length === 0) return alert("Error: Select group and mark users.");
    
    const attendanceJson = Object.entries(attendanceState).map(([key, status]) => {
        const [group, name] = key.split(": ");
        return { group, name, status };
    });

    operateGate(async () => {
        const { error } = await supabaseClient.from('attendance_logs').insert({
            date: attendanceDate.value,
            topic: getMeetingTopic(),
            group_filter: selectedGroups.join(", "),
            taker_name: attendanceTakerSelect.value.split("(")[0].trim(),
            summary: meetingSummaryInput.value.trim() || "No summary.",
            attendance_data: attendanceJson
        });
        if (error) alert("Error: " + error.message);
        else { showSuccessAnimation(); renderHistory(); }
    });
}


// --- HISTORY & LOGS ---
async function renderHistory() {
    historyListElement.innerHTML = "<li>Loading logs from cloud...</li>";
    const { data: history, error } = await supabaseClient.from('attendance_logs').select('*').order('date', { ascending: false });

    if (error) { historyListElement.innerHTML = `<li style="color:red">Error: ${error.message}</li>`; return; }
    
    historyListElement.innerHTML = history.length === 0 ? '<li style="padding: 15px; opacity: 0.6;">No logs available.</li>' : "";
    document.getElementById("remove-selected-btn").style.display = history.length ? 'block' : 'none';
    document.getElementById("clear-history-btn").style.display = history.length ? 'block' : 'none';

    history.forEach(r => {
        const attData = r.attendance_data || [];
        const p = attData.filter(a => a.status === "PRESENT").length;
        const t = attData.filter(a => a.status !== "MARK").length;
        const pct = t > 0 ? ((p / t) * 100).toFixed(0) : 0;
        
        const li = document.createElement("li"); li.className = "history-item";
        li.innerHTML = `
            <div class="history-header-wrapper">
                <input type="checkbox" class="history-checkbox" data-id="${r.id}" style="margin-right: 10px;">
                <button class="history-header-btn" onclick="this.parentElement.nextElementSibling.style.display = this.parentElement.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                    <span>[${r.date}] ${r.topic}</span>
                    <span style="font-weight: 700; color: var(--color-accent);">${p}/${t} (${pct}%)</span>
                </button>
            </div>
            <div class="history-details" style="display:none;">
                <p><strong>Recorder:</strong> ${r.taker_name}</p>
                <p><strong>Summary:</strong> ${r.summary}</p>
                <ul>${attData.map(a => `<li style="color:${a.status === 'PRESENT' ? 'var(--color-success)' : 'var(--color-danger)'}">${a.name} [${a.status}]</li>`).join("")}</ul>
            </div>`;
        historyListElement.appendChild(li);
    });
}

async function clearHistory() {
    if(!confirm("DANGER: This will delete ALL logs from the database. Are you sure?")) return;
    
    // Require PIN again for destructive action
    const pin = prompt("Enter Master PIN to Confirm Deletion:");
    if(pin !== GLOBAL_PIN) return alert("Incorrect PIN. Action Cancelled.");

    // Supabase Delete All 
    const { error } = await supabaseClient.from('attendance_logs').delete().neq('id', 0); 
    if(error) alert("Error: " + error.message);
    else { alert("All logs cleared."); renderHistory(); }
}

async function removeSelectedRecords() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    if (!checkboxes.length) return alert("Select records.");
    const ids = Array.from(checkboxes).map(c => parseInt(c.getAttribute('data-id')));
    
    const { error } = await supabaseClient.from('attendance_logs').delete().in('id', ids);
    if(error) alert("Error: " + error.message);
    else renderHistory();
}

// --- PROJECT SHELF FUNCTIONS ---
async function renderProjects() {
    liveProjectsList.innerHTML = "<p>Loading projects...</p>";
    const { data: projects, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });

    if (error) { liveProjectsList.innerHTML = `<p style="color:red">Error: ${error.message}</p>`; return; }
    
    liveProjectsList.innerHTML = "";
    if (!projects || projects.length === 0) {
        liveProjectsList.innerHTML = '<p style="opacity:0.6; font-size:13px;">Shelf is empty.</p>';
        return;
    }

    // Sort: Live projects first
    projects.sort((a, b) => (a.type === 'live' ? -1 : 1));

    projects.forEach(p => {
        let techTags = p.tech_stack ? p.tech_stack.split(',').map(t => `<span class="project-tech-tag">${t.trim()}</span>`).join('') : '';
        const timeline = `${p.date_start || 'N/A'} ${p.date_end ? 'to ' + p.date_end : '(Ongoing)'}`;

        liveProjectsList.innerHTML += `
        <div class="project-card">
            <h4>${p.title} <span style="font-size:10px; color:${p.type === 'live' ? 'var(--color-success)' : '#888'}; border:1px solid currentColor; padding:2px 5px; border-radius:2px; vertical-align:middle;">${p.type === 'live' ? 'LIVE' : 'ARCHIVED'}</span></h4>
            <div class="project-info"><strong>Lead:</strong> ${p.members}</div>
            <div class="project-info" style="font-style:italic; color:#aaa; margin-bottom:10px;">"${p.purpose}"</div>
            <div class="project-info"><strong>Stack:</strong><br>${techTags || 'N/A'}</div>
            <div class="project-info" style="margin-top:10px;"><strong>Timeline:</strong> ${timeline}</div>
            <div class="project-actions">
                ${p.link_code ? `<a href="${p.link_code}" target="_blank" class="project-btn-link">🔗 Code</a>` : ''}
                ${p.link_tinkercad ? `<a href="${p.link_tinkercad}" target="_blank" class="project-btn-link btn-tinkercad">⚡ Tinkercad</a>` : ''}
            </div>
            <button class="btn-delete-project" onclick="deleteProject(${p.id})">DELETE</button>
        </div>`;
    });
}

window.deleteProject = async function(id) {
    if(!confirm("Delete this project?")) return;
    const { error } = await supabaseClient.from('projects').delete().eq('id', id);
    if(error) alert("Error: " + error.message); else renderProjects();
};


// --- EQUIPMENT TRACKER ---
async function saveEquipment() {
    const name = eqNameInput.value.trim();
    const member = eqMemberSelect.value;
    const group = eqGroupInput.value.trim();
    const issue = eqIssueDate.value;
    const ret = eqReturnDate.value;

    if (!name || !member || !issue) { alert("Please fill Equipment Name, Member, and Issue Date."); return; }
    
    // Extract Name only
    const memberName = member.includes("(") ? member.split(" (")[0] : member;

    operateGate(async () => {
        const { error } = await supabaseClient.from('equipment').insert({
            item_name: name,
            issued_to: memberName,
            group_unit: group,
            date_issue: issue,
            date_return: ret || null,
            status: "ISSUED"
        });
        if (error) alert("Error: " + error.message);
        else { showSuccessAnimation(); eqNameInput.value = ""; eqGroupInput.value = ""; renderEquipmentLogs(); }
    });
}

async function renderEquipmentLogs() {
    eqLogBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading cloud data...</td></tr>';
    const { data: logs, error } = await supabaseClient.from('equipment').select('*').order('created_at', { ascending: false });

    if (error) return;
    eqLogBody.innerHTML = "";
    
    logs.forEach(log => {
        const isSubmitted = log.status === "SUBMITTED";
        const isDueSoon = !isSubmitted && log.date_return && (new Date(log.date_return) - new Date() < 172800000);
        
        eqLogBody.innerHTML += `
            <tr>
                <td style="${isSubmitted ? 'opacity:0.5; text-decoration:line-through;' : 'color:var(--color-accent);'}">
                    ${log.item_name} ${isDueSoon ? '<br><small style="color:var(--color-danger)">! DUE SOON</small>' : ''}
                </td>
                <td>${log.issued_to}<br><small>${log.group_unit}</small></td>
                <td style="font-size:11px;">Out: ${log.date_issue}<br>Due: ${log.date_return || 'N/A'}</td>
                <td><span style="color: ${isSubmitted ? 'var(--color-success)' : 'var(--color-tinker)'};">${log.status}</span></td>
                <td>
                    <div style="display:flex; gap:5px;">
                        ${!isSubmitted ? `
                            <button onclick="handleEqReturn(${log.id})" class="status-button" style="border:1px solid var(--color-success)!important;">Return</button>
                            <button onclick="sendEquipmentReminder('${log.issued_to}', '${log.item_name}')" class="status-button" title="Send Reminder">🔔</button>
                        ` : `
                            <button onclick="deleteEqLog(${log.id})" class="status-button" style="border:1px solid var(--color-danger)!important;">Del</button>
                        `}
                    </div>
                </td>
            </tr>`;
    });
}

// RESTORED: RETURN WITH SECURITY PIN
window.handleEqReturn = function(id) {
    securityOverlay.style.display = 'flex';
    securityPinInput.value = ''; securityPinInput.focus();
    
    // Set Pending Action
    pendingAction = async () => {
        const { error } = await supabaseClient.from('equipment').update({ status: 'SUBMITTED' }).eq('id', id);
        if(error) alert("Error: " + error.message);
        else { showSuccessAnimation(); renderEquipmentLogs(); }
    };
};

window.deleteEqLog = async function(id) {
    if(!confirm("Permanently Delete Log?")) return;
    const { error } = await supabaseClient.from('equipment').delete().eq('id', id);
    if(error) alert(error.message); else renderEquipmentLogs();
};

// RESTORED: EMAIL REMINDER
window.sendEquipmentReminder = function(memberName, itemName) {
    // Attempt to find user email
    const memberObj = allMembers.find(m => m.full_name === memberName);
    const email = memberObj ? memberObj.email : ""; 
    
    const sub = encodeURIComponent(`URGENT: Return Reminder - ${itemName}`);
    const body = encodeURIComponent(`Hello ${memberName},\n\nPlease return the equipment: ${itemName}.\n\nRegards,\nCICR Inventory`);
    window.location.href = `mailto:${email}?subject=${sub}&body=${body}`;
};


// --- CHAT FUNCTIONS ---
async function loadChat() {
    chatDisplay.innerHTML = '<div style="text-align:center; opacity:0.6; padding:20px;">Loading Secure Channel...</div>';
    const { data: chat, error } = await supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(50);

    if (error) { chatDisplay.innerHTML = `<div style="color:red">Connection Error</div>`; return; }

    chatDisplay.innerHTML = "";
    if (!chat || chat.length === 0) {
        chatDisplay.innerHTML = `<div class="chat-message msg-other"><span class="msg-meta">SYSTEM</span>Channel Initialized.</div>`;
        return;
    }

    const myName = currentUser ? currentUser.name : "ME";
    chat.forEach(msg => {
        const dateObj = new Date(msg.created_at);
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const isSelf = msg.sender_name === myName;
        
        const div = document.createElement("div");
        div.className = `chat-message ${isSelf ? 'msg-self' : 'msg-other'}`;
        div.innerHTML = `<span class="msg-meta">${msg.sender_name} | ${timeStr}</span>${msg.message_text}`;
        chatDisplay.appendChild(div);
    });
    scrollChat();
}

async function postMessage() {
    const text = chatInput.value.trim();
    if(!text) return;
    
    chatInput.disabled = true;
    const { error } = await supabaseClient.from('chat_messages').insert({
        sender_name: currentUser ? currentUser.name : "Unknown",
        message_text: text
    });
    chatInput.disabled = false;
    
    if (error) alert("Send Failed: " + error.message);
    else { chatInput.value = ""; loadChat(); }
}

function scrollChat() { chatDisplay.scrollTop = chatDisplay.scrollHeight; }


// --- ADMIN MEMBER MANAGEMENT ---
async function addMember() {
    const name = newMemberNameInput.value.trim();
    const email = document.getElementById('new-member-email').value.trim();
    const phone = document.getElementById('new-member-phone').value.trim();
    const year = document.getElementById('new-member-year-select').value;
    const batch = document.getElementById('new-member-batch').value.trim();
    let group = newMemberGroupSelect.value;

    if(group === "Custom") group = customGroupInput.value.trim();

    if(!name || !email || !batch) return alert("Name, Email, and Batch are required.");

    // 1. Insert into DB (members table)
    const { error } = await supabaseClient.from('members').insert([{ full_name: name, year: year, batch: batch }]);
    
    if(error) {
        alert("Database Error: " + error.message);
    } else {
        // 2. Send Invitation Email (Mailto)
        const subject = encodeURIComponent("CICR Portal Invitation");
        const body = encodeURIComponent(`Hello ${name},\n\nWelcome to CICR!\nDomain: ${group}\nBatch: ${batch}\n\nPlease register here: https://cicr.in\nUse Email: ${email}\n\nRegards,\nCICR Admin`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        
        alert(`Success: ${name} added. Invitation drafted.`);
        newMemberNameInput.value = "";
        document.getElementById('new-member-email').value = "";
        loadStudents(); // Refresh lists
    }
}

async function removeMember() {
    const name = removeMemberSelect.value;
    if(!name) return alert("Select a user.");
    if(!confirm(`Delete "${name}" from database?`)) return;

    // Extract real name from "Name (Year)" format
    const realName = name.split(" (")[0];

    const { error } = await supabaseClient.from('members').delete().eq('full_name', realName);
    if(error) alert("Error: " + error.message);
    else { alert("User deleted."); loadStudents(); }
}


// --- SCHEDULING ---
function handleScheduleMeeting() {
    const initiator = scheduleInitiatorSelect.value;
    const recipient = scheduleRecipientSelect.value;
    const sEmail = senderEmailInput.value;
    const rEmail = recipientEmailInput.value;
    const subject = scheduleSubjectInput.value;
    const date = scheduleDateInput.value;
    const time = scheduleTimeInput.value;
    
    if(!rEmail || !subject) return alert("Recipient Email and Subject required.");

    const body = `Meeting Invite\n\nTopic: ${subject}\nDate: ${date} at ${time}\nLocation: ${scheduleLocationTypeSelect.value} ${scheduleLocationDetailsInput.value}\n\nHost: ${initiator}\nGuest: ${recipient}`;
    window.location.href = `mailto:${rEmail}?cc=${sEmail}&subject=${encodeURIComponent("INVITE: " + subject)}&body=${encodeURIComponent(body)}`;
}


// --- MEMBER DIRECTORY ---
async function renderMemberDirectory() {
    const grid = document.getElementById('member-directory-grid');
    const badge = document.getElementById('member-count-badge');
    grid.innerHTML = '<p style="color:#888;">Loading...</p>';

    const { data: users, error } = await supabaseClient.from('profiles').select('*').order('full_name', { ascending: true });
    if (error) { grid.innerHTML = "Error loading directory."; return; }

    grid.innerHTML = "";
    badge.textContent = users.length;

    users.forEach(user => {
        const initial = user.full_name ? user.full_name.charAt(0) : "?";
        const bgStyle = user.avatar_url ? `style="background-image: url('${user.avatar_url}')"` : "";
        
        grid.innerHTML += `
        <div class="member-card">
            <div class="member-card-photo" ${bgStyle}>
                ${!user.avatar_url ? `<span style="font-size:30px; color:var(--color-accent);">${initial}</span>` : ''}
            </div>
            <div class="member-card-name">${user.full_name}</div>
            <div class="member-card-detail">🎓 ${user.year || 'N/A'} | ${user.batch || 'N/A'}</div>
            <div class="member-card-detail" style="color:var(--color-accent); margin-top:5px;">${user.domain || 'Member'}</div>
            ${isAdminUnlocked ? `<button class="btn-revoke-access" onclick="deleteUserAccount('${user.id}')">REVOKE ACCESS</button>` : ''}
        </div>`;
    });
}

window.deleteUserAccount = async function(id) {
    if(!confirm("PERMANENTLY DELETE USER PROFILE?")) return;
    const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
    if(error) alert(error.message); else { alert("User deleted."); renderMemberDirectory(); }
};

async function exportDirectoryCSV() {
    const { data } = await supabaseClient.from('profiles').select('*');
    if(!data || !data.length) return alert("No members.");
    
    let csv = "Name,Email,Phone,Year,Batch,Domain\n";
    data.forEach(u => csv += `"${u.full_name}","${u.email||''}","${u.phone||''}","${u.year}","${u.batch}","${u.domain}"\n`);
    
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = "CICR_Directory.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- ACCOUNT PROFILE ---
async function updateProfile() {
    operateGate(async () => {
        const name = profileNameInput.value.trim();
        const year = profileYearSelect.value;
        const batch = profileBatchInput.value.trim();
        let avatarUrl = currentUser.avatar;

        // Upload Photo if selected
        if (selectedAvatarFile) {
            const fileName = `${currentUser.id}_${Date.now()}.png`;
            const { error: upErr } = await supabaseClient.storage.from('avatars').upload(fileName, selectedAvatarFile, { upsert: true });
            if (upErr) return alert("Photo Upload Failed: " + upErr.message);
            
            const { data } = supabaseClient.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
        }

        const { error } = await supabaseClient.from('profiles').upsert({
            id: currentUser.id,
            full_name: name, year: year, batch: batch, avatar_url: avatarUrl,
            email: currentUser.email // Ensure email is synced
        });

        if (error) alert("Update Failed: " + error.message);
        else {
            currentUser.name = name; currentUser.year = year; currentUser.batch = batch; currentUser.avatar = avatarUrl;
            showSuccessAnimation(); loadUserProfile(); selectedAvatarFile = null;
        }
    });
}

// --- CSV EXPORT (FIXED) ---
async function exportToCSV() {
    const btn = document.getElementById('export-excel-btn');
    btn.textContent = "Processing...";

    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(c => parseInt(c.getAttribute('data-id')));
    
    const { data: history, error } = await supabaseClient.from('attendance_logs').select('*').order('date', { ascending: false });

    if (error || !history) { alert("Export Error: " + error.message); btn.textContent = "Export CSV"; return; }

    const recordsToExport = selectedIds.length > 0 ? history.filter(r => selectedIds.includes(r.id)) : history;

    if (recordsToExport.length === 0) { alert("No records."); btn.textContent = "Export CSV"; return; }

    let csv = "Date,Topic,Group,Recorder,Summary,Student Name,Student Group,Status\n";
    recordsToExport.forEach(record => {
        const attData = record.attendance_data || [];
        attData.forEach(att => {
            csv += `${record.date},${(record.topic||"").replace(/,/g," ")},${(record.group_filter||"").replace(/,/g," ")},${record.taker_name},${(record.summary||"").replace(/,/g," ")},${att.name},${att.group},${att.status}\n`;
        });
    });
    
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = `CICR_Report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    btn.textContent = "Export CSV";
}

// --- ANALYTICS ---
async function calculatePersonalReport() {
    personalReportBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Analyzing Cloud Data...</td></tr>';
    
    const { data: history } = await supabaseClient.from('attendance_logs').select('attendance_data');
    if (!history) { personalReportBody.innerHTML = '<tr><td colspan="3" style="color:red;">Analysis Failed.</td></tr>'; return; }

    const reportData = {};
    h4_students.forEach(m => {
        const [grp, name] = m.split(": ");
        reportData[m] = { total: 0, attended: 0, group: grp, name: name };
    });

    history.forEach(r => {
        (r.attendance_data || []).forEach(a => {
            const key = `${a.group}: ${a.name}`;
            if (reportData[key] && a.status !== "MARK" && a.status !== "UNMARKED") { 
                reportData[key].total++; 
                if (a.status === "PRESENT") reportData[key].attended++; 
            }
        });
    });
    
    personalReportBody.innerHTML = "";
    Object.keys(reportData).sort().forEach(key => {
        const d = reportData[key];
        const pct = d.total > 0 ? ((d.attended / d.total) * 100).toFixed(1) : 0;
        const color = d.total > 0 ? (pct >= 75 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-tinker)' : 'var(--color-danger)') : '#ccc';
        
        personalReportBody.innerHTML += `
        <tr><td>${d.name}</td><td>${d.group}</td>
            <td style="text-align:left;">
                <span style="display:inline-block; width:45px; font-weight:bold; color:${color};">${d.total > 0 ? pct + "%" : "N/A"}</span>
                <div class="analytics-progress-wrapper"><div class="analytics-progress-fill" style="width:${d.total > 0 ? pct : 0}%; background-color:${color};"></div></div>
            </td>
        </tr>`;
    });
}


// --- HELPERS ---
function createMemberOption(member) {
    const option = document.createElement("option");
    option.value = member.full_name; 
    option.textContent = `${member.full_name} (${member.year})`;
    return option;
}

function populateAttendanceTakerDropdown() {
    attendanceTakerSelect.innerHTML = '<option value="" disabled selected>-- Select Member --</option>';
    allMembers.forEach(m => attendanceTakerSelect.appendChild(createMemberOption(m)));
}

function populateRemoveMemberDropdown() {
    removeMemberSelect.innerHTML = '<option value="" disabled selected>-- Select User --</option>';
    allMembers.forEach(m => removeMemberSelect.appendChild(createMemberOption(m)));
}

function populateEqMemberDropdown() {
    eqMemberSelect.innerHTML = '<option value="" disabled selected>-- Select Member --</option>';
    allMembers.forEach(m => eqMemberSelect.appendChild(createMemberOption(m)));
}

function populateSyncMemberDropdown() {
    const s = document.getElementById('sync-member-select'); if(!s) return;
    s.innerHTML = '<option value="" disabled selected>-- Select Member --</option>';
    allMembers.forEach(m => s.appendChild(createMemberOption(m)));
}

function populateGroupSelects() {
    const cur = Array.from(yearSelect.selectedOptions).map(o => o.value);
    yearSelect.innerHTML = "";
    ALL_GROUPS.forEach(g => {
        const o = document.createElement("option"); o.value = g; o.textContent = g;
        if (cur.includes(g)) o.selected = true; yearSelect.appendChild(o);
    });
    if(!yearSelect.selectedOptions.length && yearSelect.options.length) yearSelect.options[0].selected = true;

    newMemberGroupSelect.innerHTML = '';
    ALL_GROUPS.forEach(g => {
        const o = document.createElement('option'); o.value = g; o.textContent = g; newMemberGroupSelect.appendChild(o);
    });
    const c = document.createElement('option'); c.value = "Custom"; c.textContent = "Custom Unit..."; newMemberGroupSelect.appendChild(c);
}

function populateSchedulingDropdowns() {
    scheduleInitiatorSelect.innerHTML = '<option value="" disabled selected>-- Sender --</option>';
    scheduleRecipientSelect.innerHTML = '<option value="" disabled selected>-- Recipient --</option>';
    allMembers.forEach(m => {
        scheduleInitiatorSelect.appendChild(createMemberOption(m));
        scheduleRecipientSelect.appendChild(createMemberOption(m));
    });
}

function toggleAuthMode() { 
    isRegistering = !isRegistering; 
    loginForm.reset(); loginError.style.display='none';
    authTitle.textContent = isRegistering ? "REGISTER NEW ACCOUNT" : "MEMBER ACCESS";
    loginBtn.textContent = isRegistering ? "REGISTER" : "LOGIN";
    toggleAuthBtn.textContent = isRegistering ? "Back to Login" : "Create New Account";
    registrationFields.style.display = isRegistering ? 'block' : 'none';
    document.getElementById('otp-section').style.display = isRegistering ? 'block' : 'none';
}

function handleLoginSuccess(user) {
    if(!user) return;
    currentUser = {
        id: user.id, email: user.email,
        name: user.user_metadata.full_name || "Member",
        year: user.user_metadata.year || "N/A",
        batch: user.user_metadata.batch || "N/A",
        avatar: user.user_metadata.avatar_url || null
    };
    loginScreen.style.display = 'none';
    const s = document.getElementById('success-screen');
    s.style.display = 'flex';
    loadUserProfile();
    setTimeout(() => { s.style.display = 'none'; appContent.style.display = 'block'; switchTab('attendance'); }, 2000);
}

function loadUserProfile() {
    if (!currentUser) return;
    if (currentUser.avatar) userAvatarDisplay.style.backgroundImage = `url(${currentUser.avatar})`;
    else userAvatarDisplay.textContent = currentUser.name.charAt(0);
    userAvatarDisplay.style.display = 'flex';
    profileIdInput.value = currentUser.email;
    profileNameInput.value = currentUser.name;
}

function getMeetingTopic() { return subjectSelector.value === "Other" && customTopicInput.value ? customTopicInput.value : subjectSelector.value; }
function handleTopicChange() { customTopicInput.style.display = subjectSelector.value === "Other" ? "block" : "none"; }
function handleGroupChange() { document.getElementById("custom-group-input-wrapper").style.display = newMemberGroupSelect.value === "Custom" ? "block" : "none"; }

async function saveProject() {
    operateGate(async () => {
        const { error } = await supabaseClient.from('projects').insert({
            title: projectNameInput.value,
            type: projectTypeSelect.value,
            members: projectMembersInput.value,
            link_code: projectLinkInput.value,
            link_tinkercad: projectTinkercadInput.value,
            purpose: projectPurposeInput.value,
            tech_stack: projectTechInput.value,
            date_start: projectStartInput.value,
            date_end: projectEndInput.value || null
        });
        if (error) alert(error.message); else { showSuccessAnimation(); renderProjects(); }
    });
}

async function addPermanentGroup(groupName) {
    if (!groupName) return false;
    if (!ALL_GROUPS.includes(groupName)) {
        ALL_GROUPS.push(groupName);
        const { error } = await supabaseClient.from('app_settings').upsert({ category: 'groups_list', data_value: ALL_GROUPS }, { onConflict: 'category' });
        if (error) { alert(error.message); return false; }
        populateGroupSelects(); return true;
    }
    return false;
}

let selectedAvatarFile = null;
function handleProfilePicUpload(e) { 
    selectedAvatarFile = e.target.files[0]; 
    if(selectedAvatarFile) {
        const reader = new FileReader();
        reader.onload = (ev) => profilePreview.style.backgroundImage = `url(${ev.target.result})`;
        reader.readAsDataURL(selectedAvatarFile);
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

// TOGGLE PASSWORD
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const showIcon = togglePasswordBtn.querySelector('.eye-show');
    const hideIcon = togglePasswordBtn.querySelector('.eye-hide');
    if(type === 'password') { showIcon.style.display = 'block'; hideIcon.style.display = 'none'; }
    else { showIcon.style.display = 'none'; hideIcon.style.display = 'block'; }
});

// OTP SEND
sendOtpBtn.addEventListener('click', async () => {
    const email = usernameInput.value.trim();
    if(!email || !email.includes('@')) { alert("Valid Email Required."); return; }
    sendOtpBtn.textContent = "SENDING..."; sendOtpBtn.disabled = true;

    const { error } = await supabaseClient.auth.signInWithOtp({ email: email });
    if (error) { alert(error.message); sendOtpBtn.textContent = "SEND OTP"; sendOtpBtn.disabled = false; }
    else { sendOtpBtn.style.display = 'none'; otpInputWrapper.style.display = 'block'; otpStatus.textContent = "Code Sent."; }
});

// OTP VERIFY
verifyOtpBtn.addEventListener('click', async () => {
    const email = usernameInput.value.trim();
    const token = otpInput.value.trim();
    if(!token) return alert("Enter Code");
    verifyOtpBtn.textContent = "VERIFYING...";

    const { data, error } = await supabaseClient.auth.verifyOtp({ email: email, token: token, type: 'email' });
    if (error) { alert(error.message); verifyOtpBtn.textContent = "VERIFY CODE"; }
    else { isVerified = true; otpStatus.textContent = "VERIFIED ✓"; otpStatus.style.color = "var(--color-success)"; otpInputWrapper.style.display = 'none'; }
});


// --- EXECUTE ---
initializeListeners();

// --- BACKGROUND PARTICLES ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
class Particle {
    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5); this.vy = (Math.random() - 0.5); this.size = Math.random() * 2 + 1; }
    update() { this.x += this.vx; this.y += this.vy; if(this.x<0 || this.x>canvas.width) this.vx*=-1; if(this.y<0 || this.y>canvas.height) this.vy*=-1; }
    draw() { ctx.fillStyle = '#66fcf1'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); }
}
function loop() { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); }
for(let i=0;i<50;i++) particles.push(new Particle()); loop();