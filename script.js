// --- CORE VARIABLES ---
// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://bmlzcoflkatuudfshhtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbHpjb2Zsa2F0dXVkZnNoaHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDE5MTMsImV4cCI6MjA4MjUxNzkxM30.fZZ7MnHcXSeTL40WmXl72U-SFqFJ2PZebJivHZVTSgQ";

// Use 'supabaseClient' to avoid conflict with global library variable
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data Containers (Single Source of Truth)
let h4_students = [];       // Strings: "Year: Name (Domain) [Enroll]"
let memberDetails = {};     // Object: { Name: { email, phone, dob } }
let memberPhotos = {};      // Object: { Name: URL }

// DYNAMIC LISTS (Strictly from DB - No Hardcoding)
let DB_YEARS = new Set();
let DB_DOMAINS = new Set();

// Local State
let attendanceState = {};
let cachedAttendanceLogs = []; 
let GLOBAL_SECURITY_PIN = "1407"; 
let notifications = []; 

// Audio Engine
const AUDIO = {
    click: new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3"),
    success: new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3"),
    transition: new Audio("https://www.soundjay.com/misc/sounds/heartbeat-01a.mp3"),
    play: function(key) { if(this[key]) { this[key].volume = 0.3; this[key].currentTime = 0; this[key].play().catch(()=>{}); } }
};

// --- DOM ELEMENTS ---
const techGate = document.getElementById('tech-gate');
const splashScreen = document.getElementById("splash-screen");
const appContent = document.getElementById("app-content");
const digitalClock = document.getElementById("digital-clock");
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const securityOverlay = document.getElementById('security-overlay');
const securityPinInput = document.getElementById('security-pin-input');
const unlockBtn = document.getElementById('unlock-btn');
const securityCancel = document.getElementById('security-cancel');
const securityMessage = document.getElementById('security-message');
const allMembersDatalist = document.getElementById("all-members-datalist");
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

// --- UTILITY FUNCTIONS ---
function operateGate(callback) { AUDIO.play('transition'); techGate.classList.add('active'); setTimeout(() => { if(callback) callback(); setTimeout(() => { techGate.classList.remove('active'); }, 1000); }, 1200); }
function showSuccessAnimation() { AUDIO.play('success'); const overlay = document.getElementById('action-success-overlay'); overlay.style.display = 'flex'; setTimeout(() => { overlay.style.display = 'none'; }, 2000); }
function openDatePicker(id) { const el = document.getElementById(id); if(el) { try{ el.showPicker(); } catch(e){ el.focus(); el.click(); } } }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function formatDateTime(isoString) { if(!isoString) return ''; return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

// --- BACKGROUND PARTICLES ---
const canvas = document.getElementById('particles-canvas'); const ctx = canvas.getContext('2d'); let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } window.addEventListener('resize', resizeCanvas); resizeCanvas();
class Particle { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; this.size = Math.random() * 2 + 1; this.color = '#66fcf1'; } update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvas.width) this.vx *= -1; if (this.y < 0 || this.y > canvas.height) this.vy *= -1; } draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
function initParticles() { particles = []; const count = Math.floor(window.innerWidth / 15); for (let i = 0; i < count; i++) particles.push(new Particle()); }
function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); for (let j = i; j < particles.length; j++) { const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y; const dist = Math.sqrt(dx * dx + dy * dy); if (dist < 150) { ctx.strokeStyle = `rgba(69, 162, 158, ${1 - dist/150})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); } } } requestAnimationFrame(animateParticles); }
initParticles(); animateParticles();

// --- DATA LOGIC: SINGLE SOURCE OF TRUTH ---

async function fetchMembers() {
    const { data, error } = await supabaseClient
        .from('members')
        .select('*')
        .order('year', { ascending: false });

    if (error) { console.error("Error fetching members:", error); return; }

    h4_students = [];
    memberDetails = {};
    memberPhotos = {}; 
    DB_YEARS.clear();
    DB_DOMAINS.clear();

    data.forEach(member => {
        const memberString = `${member.year}: ${member.name} (${member.domain}) [${member.enrollment}]`;
        h4_students.push(memberString);
        
        memberDetails[member.name] = { 
            dob: member.dob || null, 
            email: member.email, 
            phone: member.phone 
        };
        
        if(member.year) DB_YEARS.add(member.year);
        if(member.domain) DB_DOMAINS.add(member.domain);
        if(member.photo_url) memberPhotos[member.name] = member.photo_url;
    });

    refreshAllDropdowns();
    renderStudents(); 
    renderMemberDirectory(); 
    renderTeams(); 
}

async function fetchSettings() {
    const { data } = await supabaseClient
        .from('app_settings')
        .select('value')
        .eq('key', 'security_pin')
        .single();
    if(data) GLOBAL_SECURITY_PIN = data.value;
}

// --- ADMIN FUNCTIONS ---

async function addMember() {
    const name = document.getElementById("new-member-name").value.trim(); 
    const email = document.getElementById("new-member-email").value.trim(); 
    const phone = document.getElementById("new-member-phone").value.trim();
    const dob = document.getElementById("new-member-dob").value;
    const batch = document.getElementById("new-member-batch").value.trim();
    const enroll = document.getElementById("new-member-enrollment").value.trim();
    
    let year = document.getElementById("new-member-year-select").value;
    let domain = document.getElementById("new-member-group").value; 

    if (domain === "Custom") {
        domain = prompt("Enter New Domain/Group Name:");
        if (!domain) return alert("Domain is required.");
        domain = domain.trim();
    }
    
    if (year === "Custom") {
        year = prompt("Enter New Year Group (e.g., '5th Year'):");
        if (!year) return alert("Year is required.");
        year = year.trim();
    }

    if (!name || !email || !phone || !batch || !enroll || !domain || !year) return alert("All text fields are mandatory.");
    if (!validateEmail(email)) return alert("Invalid Email Address format.");

    operateGate(async () => { 
        const { error } = await supabaseClient
            .from('members')
            .insert([{ 
                name, email, phone, dob, year, batch, 
                enrollment: enroll, domain, role: 'Member' 
            }]);

        if (error) {
            alert("Error adding member: " + error.message);
            return;
        }

        await fetchMembers(); 
        showSuccessAnimation(); 
        
        document.getElementById("new-member-name").value = "";
        document.getElementById("new-member-email").value = "";
        document.getElementById("new-member-enrollment").value = "";
    });
}

async function removeMember() {
    const select = document.getElementById("remove-member-select");
    const selectedOptions = Array.from(select.selectedOptions); 

    if(selectedOptions.length === 0) return alert("Error: Select at least one user to remove.");

    const names = selectedOptions.map(opt => opt.value);
    if(!confirm(`Permanently DELETE ${selectedOptions.length} selected member(s)?`)) return;

    const enrollmentsToDelete = [];
    const namesToDelete = [];

    names.forEach(val => {
         const enrollMatch = val.match(/\[(.*?)\]/);
         if (enrollMatch && enrollMatch[1]) {
             enrollmentsToDelete.push(enrollMatch[1]);
         } else {
             const namePart = val.includes(": ") ? val.split(": ")[1].split(" (")[0].trim() : val;
             namesToDelete.push(namePart);
         }
    });

    operateGate(async () => {
        let errorOccurred = false;

        if (enrollmentsToDelete.length > 0) {
            const { error } = await supabaseClient.from('members').delete().in('enrollment', enrollmentsToDelete);
            if (error) { alert("Error deleting by ID: " + error.message); errorOccurred = true; }
        }

        if (namesToDelete.length > 0) {
            const { error } = await supabaseClient.from('members').delete().in('name', namesToDelete);
            if (error) { alert("Error deleting by Name: " + error.message); errorOccurred = true; }
        }

        if (!errorOccurred) {
            await fetchMembers(); 
            alert("Selected members deleted successfully.");
            select.value = ""; 
        }
    });
}

window.removeMemberDirectly = async (str) => {
    let deleteQuery = null;
    let confirmName = "";

    const enrollMatch = str.match(/\[(.*?)\]/);
    if (enrollMatch && enrollMatch[1]) {
        deleteQuery = supabaseClient.from('members').delete().eq('enrollment', enrollMatch[1]);
        confirmName = str.split(": ")[1].split(" (")[0]; 
    } else {
        const namePart = str.split(": ")[1].split(" (")[0].trim();
        deleteQuery = supabaseClient.from('members').delete().eq('name', namePart);
        confirmName = namePart;
    }

    if(confirm(`Permanently DELETE ${confirmName}?`)) {
        const { error } = await deleteQuery;
        if (error) { alert("Error removing: " + error.message); } 
        else { await fetchMembers(); alert("Member deleted."); }
    }
};


// --- UI POPULATION & DROPDOWNS ---

function refreshAllDropdowns() { 
    populateAllMembersDatalist(); 
    populateSchedulingDropdowns(); 
    populateProjectMembersDropdown(); 
    populateGroupSelects(); 
    populateChatSenderSelect();
}

function populateGroupSelects() {
    const yearSelectFilter = document.getElementById("year-select"); 
    const yearSelectUser = document.getElementById("new-member-year-select"); 
    const domFilter = document.getElementById("attendance-domain-filter"); 
    const newMemGrp = document.getElementById("new-member-group"); 
    const teamDomSelect = document.getElementById("team-domain-select"); 

    if(yearSelectFilter) yearSelectFilter.innerHTML = "";
    if(yearSelectUser) yearSelectUser.innerHTML = "";
    
    const currentDomFilter = domFilter ? domFilter.value : "ALL";
    if(domFilter) domFilter.innerHTML = '<option value="ALL">All Domains</option>';
    
    if(newMemGrp) newMemGrp.innerHTML = '';
    
    const currentTeamDom = teamDomSelect ? teamDomSelect.value : "";
    if(teamDomSelect) teamDomSelect.innerHTML = '<option value="ALL">ALL DOMAINS</option>';

    const sortedYears = Array.from(DB_YEARS).sort();
    sortedYears.forEach(y => {
        if(yearSelectFilter) { const opt = document.createElement("option"); opt.value = y; opt.textContent = y; yearSelectFilter.appendChild(opt); }
        if(yearSelectUser) { const opt = document.createElement("option"); opt.value = y; opt.textContent = y; yearSelectUser.appendChild(opt); }
    });
    
    const sortedDomains = Array.from(DB_DOMAINS).sort();
    sortedDomains.forEach(d => {
        if(domFilter) { const opt = document.createElement("option"); opt.value = d; opt.textContent = d; domFilter.appendChild(opt); }
        if(newMemGrp) { const opt = document.createElement("option"); opt.value = d; opt.textContent = d.toUpperCase(); newMemGrp.appendChild(opt); }
        if(teamDomSelect) { const opt = document.createElement("option"); opt.value = d; opt.textContent = d.toUpperCase(); teamDomSelect.appendChild(opt); }
    });

    if(domFilter) domFilter.value = currentDomFilter;
    if(teamDomSelect && currentTeamDom) teamDomSelect.value = currentTeamDom;

    if(newMemGrp) { 
        const cust = document.createElement('option'); 
        cust.value = "Custom"; 
        cust.textContent = "Add New Domain... (Type New)"; 
        newMemGrp.appendChild(cust); 
    }
    
    if(yearSelectUser) {
        const custY = document.createElement('option');
        custY.value = "Custom"; 
        custY.textContent = "Add New Year... (Type New)";
        yearSelectUser.appendChild(custY);
    }
}

window.toggleCustomGroupInput = function(selectEl) {};

function populateAllMembersDatalist() {
    allMembersDatalist.innerHTML = ''; 
    const remSel = document.getElementById("remove-member-select");
    
    if(remSel) remSel.innerHTML = ''; 

    h4_students.forEach(s => { 
        const opt = document.createElement("option"); 
        opt.value = s.includes(": ") ? s.split(": ")[1] : s; 
        allMembersDatalist.appendChild(opt);
        
        if(remSel) {
            const opt2 = document.createElement("option");
            opt2.value = s;
            opt2.textContent = s; 
            remSel.appendChild(opt2);
        }
    });
}

function populateSchedulingDropdowns() { 
    const selInit = document.getElementById("schedule-initiator-select"); 
    const selRecip = document.getElementById("schedule-recipient-select"); 
    
    if(selInit) selInit.innerHTML = '<option value="" disabled selected>Select Sender...</option>';
    if(selRecip) selRecip.innerHTML = ''; 

    h4_students.forEach(s => { 
        const n = s.includes(": ") ? s.split(": ")[1] : s; 
        
        if(selInit) {
            const optI = document.createElement("option"); optI.value = n; optI.textContent = n; 
            selInit.appendChild(optI);
        }
        
        if(selRecip) {
            const optR = document.createElement("option"); optR.value = n; optR.textContent = n; 
            selRecip.appendChild(optR); 
        }
    });
}

function populateProjectMembersDropdown() {
    const sel = document.getElementById("project-members-select"); 
    if(!sel) return; 
    sel.innerHTML = ''; 
    h4_students.forEach(s => { 
        const n = s.includes(": ") ? s.split(": ")[1] : s; 
        const opt = document.createElement("option"); opt.value = n; opt.textContent = n; 
        sel.appendChild(opt); 
    });
}

function populateChatSenderSelect() {
    const sel = document.getElementById("chat-sender-select"); 
    if(!sel) return; 
    sel.innerHTML = '<option value="ME">ME (Anonymous)</option>';
    h4_students.forEach(s => { 
        const n = s.includes(": ") ? s.split(": ")[1] : s; 
        const simpleName = n.split(" [")[0]; 
        const opt = document.createElement("option"); opt.value = simpleName; opt.textContent = simpleName; 
        sel.appendChild(opt); 
    });
}

// --- NOTIFICATIONS & SYSTEM CHECKS ---

async function fetchNotifications() {
    const { data } = await supabaseClient
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    if(data) { 
        notifications = data; 
        renderNotifications(); 
    }
}

function renderNotifications() {
    const list = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    list.innerHTML = "";
    
    notifications.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    
    const unreadCount = notifications.filter(n => !n.is_read).length; 
    if(unreadCount > 0) { 
        badge.style.display = "flex"; 
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount; 
    } else { 
        badge.style.display = "none"; 
    }

    if(notifications.length === 0) { 
        list.innerHTML = '<li style="padding:15px; text-align:center; color:#666;">No new alerts.</li>'; 
        return; 
    }

    notifications.forEach(n => {
        const li = document.createElement("li");
        li.className = `notif-item ${!n.is_read ? 'unread' : ''}`;
        
        let icon = "🔔"; 
        let actionButton = "";
        
        if(n.type === "birthday") {
            icon = "🎂";
            if(n.metadata && n.metadata.email) {
                 actionButton = `<button onclick="sendBirthdayWish('${n.metadata.name.replace(/'/g, "\\'")}', '${n.metadata.email}')" style="margin-top:5px; background:var(--color-accent-dim); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:10px; cursor:pointer;">✉️ Send Wish</button>`;
            }
        }
        if(n.type === "equipment") icon = "⚠️";
        if(n.type === "social") icon = "💬";

        li.innerHTML = `
            <div><span class="notif-type-icon">${icon}</span> ${n.text}</div>
            ${actionButton}
            <span class="notif-time">${formatDateTime(n.created_at)}</span>`;
        list.appendChild(li);
    });
}

async function addNotification(text, type = "general", metadata = {}) {
    const isDuplicate = notifications.some(n => n.text === text && new Date(n.created_at).toDateString() === new Date().toDateString());
    if (isDuplicate) return;

    const { error } = await supabaseClient
        .from('notifications')
        .insert([{ text, type, metadata, is_read: false }]);

    if (!error) {
        await fetchNotifications(); 
        AUDIO.play('success');
    }
}

window.clearNotifications = async () => {
    const { error } = await supabaseClient.from('notifications').update({ is_read: true }).neq('id', 0); 
    if(!error) await fetchNotifications();
};

document.getElementById("notif-btn").addEventListener("click", () => {
    const panel = document.getElementById("notif-panel");
    panel.classList.toggle("active");
});

// [FIX] ROBUST BIRTHDAY CHECKER
function runSystemChecks() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMatch = `${mm}-${dd}`;
    const todayDateString = today.toDateString();

    // 1. Optimization: Check LocalStorage first to avoid heavy loops every reload
    if(localStorage.getItem("last_birthday_check") === todayDateString) return;

    // 2. Scan Members
    for (const [name, details] of Object.entries(memberDetails)) {
        if (details.dob) {
            // details.dob format is YYYY-MM-DD
            const parts = details.dob.split("-");
            if (parts.length === 3) {
                const dobMatch = `${parts[1]}-${parts[2]}`; // MM-DD
                
                // 3. Match Today
                if (dobMatch === todayMatch) {
                    // 4. Duplicate Guard: Check if a notification for this user exists TODAY
                    const alreadyExists = notifications.some(n => 
                        n.type === 'birthday' && 
                        n.metadata?.name === name && 
                        new Date(n.created_at).toDateString() === todayDateString
                    );

                    if (!alreadyExists) {
                        addNotification(`Happy Birthday to ${name}! 🎂`, "birthday", { name: name, email: details.email });
                    }
                }
            }
        }
    }
    
    // Save check state
    localStorage.setItem("last_birthday_check", todayDateString);
}

window.sendBirthdayWish = (name, email) => {
    const subject = `Happy Birthday ${name}! 🎂`;
    const body = `🎉 Happy Birthday ${name}! 🎉\n\nOn behalf of CICR, we wish you a fantastic day!\n\nRegards,\nTeam CICR`;
    window.location.href = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// --- SECURITY & TABS ---
let pendingTabId = null; let pendingAction = null; let isAdminUnlocked = false;

function switchTab(targetTabId, saveToStorage = true) {
    AUDIO.play('click');
    if ((targetTabId === 'admin' || targetTabId === 'history' || targetTabId === 'directory') && !isAdminUnlocked) {
        pendingTabId = targetTabId; 
        securityMessage.textContent = "This section requires High-Level Security Clearance."; 
        securityOverlay.style.display = 'flex'; 
        securityPinInput.value = ''; securityPinInput.focus(); 
        return;
    }
    
    tabLinks.forEach(link => { link.classList.remove('active'); link.setAttribute('aria-selected', 'false'); });
    tabContents.forEach(content => { content.classList.remove('active'); content.style.display = 'none'; });
    
    const activeLink = document.querySelector(`.tab-link[data-tab="${targetTabId}"]`); 
    const activeContent = document.getElementById(`${targetTabId}-content`);
    
    if (activeLink && activeContent) {
        activeLink.classList.add('active'); activeLink.setAttribute('aria-selected', 'true'); 
        activeContent.classList.add('active'); activeContent.style.display = 'block';
        if (saveToStorage) sessionStorage.setItem("cicr_active_tab", targetTabId);
        
        if (targetTabId === 'history') renderHistory();
        else if (targetTabId === 'reports') { renderHistory().then(() => calculatePersonalReport()); }
        else if (targetTabId === 'projects') renderProjects();
        else if (targetTabId === 'chat') { loadChat(); scrollChat(); }
        else if (targetTabId === 'equipment') renderEquipmentLogs();
        else if (targetTabId === 'directory') renderMemberDirectory();
        else if (targetTabId === 'social') renderFeed();
        else if (targetTabId === 'teams') renderTeams();
    }
}

function verifySecurityPin() {
    if(securityPinInput.value === GLOBAL_SECURITY_PIN) { 
        isAdminUnlocked = true; 
        securityOverlay.style.display = 'none'; 
        if(pendingTabId) { switchTab(pendingTabId); pendingTabId = null; } 
        if(pendingAction) { pendingAction(); pendingAction = null; } 
    } else { 
        alert("ACCESS DENIED"); 
        securityPinInput.value = ''; securityPinInput.focus(); 
    }
}
unlockBtn.addEventListener('click', verifySecurityPin); 
securityCancel.addEventListener('click', () => { securityOverlay.style.display = 'none'; pendingTabId = null; pendingAction = null; });
securityPinInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') verifySecurityPin(); });

// --- ATTENDANCE LOGIC ---

function renderStudents() {
    const list = document.getElementById("attendance-list"); 
    list.innerHTML = ""; 
    attendanceState = {}; 
    
    const ys = Array.from(document.getElementById("year-select").selectedOptions).map(o => o.value);
    const df = document.getElementById("attendance-domain-filter").value;
    
    const yearsToRender = ys.length ? ys : Array.from(DB_YEARS);
    
    const filtered = h4_students.filter(s => { 
        const [y, r] = s.split(": "); 
        return yearsToRender.includes(y) && (df === "ALL" || s.includes(`(${df})`)); 
    }).sort();

    if (!filtered.length) { list.innerHTML = `<li style="padding:15px; opacity:0.7;">No users found for selected filters.</li>`; return; }

    filtered.forEach(s => {
        const [r, n] = s.split(": "); 
        const id = s.replace(/[^a-zA-Z0-9]/g, "_");
        const li = document.createElement("li"); 
        li.className = "student-item unmarked"; 
        li.id = id;
        
        li.innerHTML = `
            <div class="student-info"><div class="student-name">${n}</div><div class="student-id">${r}</div></div>
            <div class="status-controls">
                <button class="status-button btn-present" data-key="${s}" style="opacity:0.4;">P</button>
                <button class="status-button btn-absent" data-key="${s}" style="opacity:0.4;">A</button>
                <button class="status-button btn-unmarked" data-key="${s}" style="opacity:1.0;">?</button>
            </div>`;
            
        list.appendChild(li);
        
        li.querySelectorAll("button").forEach(b => b.addEventListener("click", e => {
            const k = e.target.getAttribute("data-key"); 
            const isUnmark = e.target.classList.contains("btn-unmarked");
            const isPresent = e.target.classList.contains("btn-present");
            
            li.querySelectorAll("button").forEach(btn=>btn.style.opacity=0.4); 
            e.target.style.opacity=1;
            
            if(isUnmark) { delete attendanceState[k]; li.className = "student-item unmarked"; } 
            else { 
                attendanceState[k] = isPresent ? "PRESENT" : "ABSENT"; 
                li.className = `student-item ${isPresent ? 'present' : 'absent'}`; 
            }
            updateSummary();
        }));
    });
}

function updateSummary() {
    let p = 0, a = 0; 
    for(let k in attendanceState) { if(attendanceState[k]==="PRESENT") p++; else if(attendanceState[k]==="ABSENT") a++; }
    document.getElementById("total-present").textContent=p; 
    document.getElementById("total-absent").textContent=a;
    const total = p + a;
    document.getElementById("present-percentage").textContent = total > 0 ? ((p/total)*100).toFixed(1) + "%" : "0.0%";
}

async function saveData() {
    if(!isAdminUnlocked) {
        securityMessage.textContent = "Admin PIN required to SAVE Log.";
        securityOverlay.style.display = 'flex';
        securityPinInput.value = ''; securityPinInput.focus();
        pendingAction = () => { saveData(); }; 
        return;
    }

    const dateVal = document.getElementById("attendance-date").value;
    const topicVal = document.getElementById("attendance-subject").value;
    if(!dateVal) return alert("Select Date.");
    if(Object.keys(attendanceState).length === 0 && !confirm("Save empty log?")) return;

    const attendanceArray = Object.keys(attendanceState).map(k => ({
        name: k.split(": ")[1], 
        group: k.split(": ")[0], 
        status: attendanceState[k]
    }));

    operateGate(async () => {
        const { error } = await supabaseClient
            .from('attendance_logs')
            .insert([{ date: dateVal, topic: topicVal, attendance_data: attendanceArray }]);
        
        if (error) alert("Failed: " + error.message);
        else showSuccessAnimation();
    });
}

function handleTopicChange() { 
    const s = document.getElementById("attendance-subject"); 
    const custom = document.getElementById("custom-topic-input");
    custom.style.display = s.value === "Other" ? "block" : "none"; 
    document.getElementById("current-subject-display").textContent = s.value === "Other" ? (custom.value || "Custom") : s.options[s.selectedIndex].textContent; 
}

// --- HISTORY & ANALYTICS ---

async function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = '<li style="padding:20px; text-align:center;">Loading records...</li>';
    
    const { data: logs, error } = await supabaseClient.from('attendance_logs').select('*').order('created_at', { ascending: false });
    
    if (error) { list.innerHTML = '<li style="color:red;">Error loading history.</li>'; return; }
    cachedAttendanceLogs = logs || [];

    list.innerHTML = "";
    if (!logs.length) { list.innerHTML = '<li style="padding:20px; opacity:0.6;">No attendance records found.</li>'; return; }
    
    logs.forEach(log => {
        const att = log.attendance_data || [];
        const present = att.filter(s => s.status === "PRESENT").length;
        const total = att.length;
        
        const li = document.createElement("li"); 
        li.className = "history-item";
        li.innerHTML = `
            <div class="history-header-wrapper">
                <div style="display:flex; align-items:center;">
                    <input type="checkbox" class="history-checkbox" value="${log.id}">
                    <div class="history-info" onclick="document.getElementById('hist-${log.id}').style.display = document.getElementById('hist-${log.id}').style.display==='block'?'none':'block'">
                        <span class="history-title">${log.topic}</span>
                        <span class="history-date">${log.date}</span>
                        <span class="history-meta">${present}/${total} Present</span>
                    </div>
                </div>
            </div>
            <div id="hist-${log.id}" class="history-details">
                ${att.map(s => `<div style="font-size:11px; color:${s.status==='PRESENT'?'var(--color-success)':'var(--color-danger)'}">${s.name}</div>`).join('')}
            </div>`;
        list.appendChild(li);
    });
}

document.getElementById('clear-history-btn').addEventListener('click', async () => {
    if(!isAdminUnlocked) return alert("Security Restriction.");
    if(confirm("DELETE ALL LOGS?")) {
        const { error } = await supabaseClient.from('attendance_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if(!error) renderHistory();
    }
});

function calculatePersonalReport() {
    const logs = cachedAttendanceLogs;
    const stats = {};
    h4_students.forEach(s => { const [yearGroup, namePart] = s.split(": "); stats[namePart] = { year: yearGroup, present: 0, total: 0 }; });
    
    if (logs) {
        logs.forEach(log => { 
            if(log.attendance_data) { 
                log.attendance_data.forEach(entry => { 
                    let key = Object.keys(stats).find(k => k.includes(entry.name));
                    if(!key) { key = entry.name; if(!stats[key]) stats[key] = { year: "Unknown", present: 0, total: 0 }; }
                    stats[key].total++; 
                    if(entry.status === "PRESENT") stats[key].present++; 
                }); 
            } 
        });
    }
    
    // Render tables 1-4
    [1, 2, 3, 4].forEach(y => {
        const tbody = document.getElementById(`analytics-body-${y}`); 
        if (!tbody) return; 
        tbody.innerHTML = "";
        
        const yearKey = `${y}${y===1?'st':(y===2?'nd':(y===3?'rd':'th'))} Year`;
        const students = Object.entries(stats).filter(([k, v]) => v.year === yearKey);
        
        if(!students.length) { tbody.innerHTML = `<tr><td colspan="3">No data for ${yearKey}</td></tr>`; } 
        else {
            students.sort((a,b) => (b[1].present/b[1].total || 0) - (a[1].present/a[1].total || 0));
            students.forEach(([name, data]) => {
                const pct = data.total === 0 ? 0 : Math.round((data.present / data.total) * 100);
                let color = pct >= 75 ? '#2ecc71' : (pct >= 50 ? '#f1c40f' : '#e74c3c');
                tbody.innerHTML += `<tr><td>${name.split(" [")[0]}</td><td>General</td><td><div style="display:flex; align-items:center;"><span style="width:35px; color:${color};">${pct}%</span><div class="analytics-progress-wrapper"><div class="analytics-progress-fill" style="width:${pct}%; background:${color};"></div></div></div></td></tr>`;
            });
        }
    });
}


// --- SOCIAL FEED ---

function toggleImgInput() {
    const type = document.getElementById('social-img-type').value;
    document.getElementById('social-url-wrapper').style.display = type === 'url' ? 'block' : 'none';
    document.getElementById('social-file-wrapper').style.display = type === 'file' ? 'block' : 'none';
}

async function publishPost() {
    const author = document.getElementById('social-author').value.trim();
    const text = document.getElementById('social-text').value.trim();
    const imgType = document.getElementById('social-img-type').value;
    const link = document.getElementById('social-link').value.trim();
    
    if(!author || !text) return alert("Author and Caption required.");

    const sendToDb = async (imgData) => {
        const cleanAuthor = author.includes(":") ? author.split(": ")[1].split(" (")[0] : author;
        const { error } = await supabaseClient
            .from('social_posts')
            .insert([{ author: cleanAuthor, content: text, image_data: imgData, external_link: link, comments_data: [] }]);

        if (error) alert("Post failed: " + error.message);
        else {
            document.getElementById('social-text').value = ""; 
            showSuccessAnimation(); renderFeed();
        }
    };

    if (imgType === 'file') {
        const fileInput = document.getElementById('social-img-file');
        if (fileInput.files[0]) {
            const reader = new FileReader(); 
            reader.onload = (e) => sendToDb(e.target.result); 
            reader.readAsDataURL(fileInput.files[0]);
        } else sendToDb(null);
    } else { 
        sendToDb(document.getElementById('social-img-url').value.trim() || null); 
    }
}

async function renderFeed() {
    const stream = document.getElementById('feed-stream'); 
    const { data: posts, error } = await supabaseClient.from('social_posts').select('*').order('created_at', { ascending: false });

    if(error || !posts) { stream.innerHTML = 'Error loading feed.'; return; }
    stream.innerHTML = "";

    posts.forEach(post => {
        const id = post.id;
        let imgHtml = '';
        if (post.image_data) {
            imgHtml = `<div class="feed-media-wrapper"><img src="${post.image_data}" class="feed-media" alt="Post Image" onerror="this.style.display='none'"></div>`;
        }

        const dateStr = formatDateTime(post.created_at);
        const comments = post.comments_data || [];
        const initial = post.author.charAt(0).toUpperCase();

        stream.innerHTML += `
        <div class="feed-card">
            <div class="feed-admin-controls">
                <button class="btn-feed-admin" onclick="deletePost('${id}')">✖</button>
            </div>
            <div class="feed-header">
                <div class="feed-avatar">${initial}</div>
                <div class="feed-meta"><h5>${post.author}</h5><span>${dateStr}</span></div>
            </div>
            <div class="feed-content">${post.content}</div>
            ${imgHtml}
            ${post.external_link ? `<div class="feed-link-wrapper"><a href="${post.external_link}" target="_blank" class="feed-link-preview">🔗 Link</a></div>` : ''}
            
            <div class="feed-actions">
                <button class="action-btn" onclick="likePost('${id}', ${post.likes||0})">❤ ${post.likes||0}</button>
                <button class="action-btn" onclick="document.getElementById('c-${id}').classList.toggle('active')">💬 ${comments.length}</button>
            </div>
            <div class="comment-section" id="c-${id}">
                <ul class="comment-list">${comments.map(c=>`<li class="comment-item"><strong>${c.user}</strong>: ${c.text}</li>`).join('')}</ul>
                <div class="comment-input-wrapper">
                    <input type="text" id="in-${id}" placeholder="Comment...">
                    <button class="btn-utility" style="padding:5px;" onclick="addComment('${id}')">POST</button>
                </div>
            </div>
        </div>`;
    });
}

window.likePost = async (id, current) => { 
    await supabaseClient.from('social_posts').update({ likes: current + 1 }).eq('id', id); renderFeed(); 
};
window.addComment = async (id) => {
    const txt = document.getElementById(`in-${id}`).value; if(!txt) return;
    const { data } = await supabaseClient.from('social_posts').select('comments_data').eq('id', id).single();
    const arr = data.comments_data || []; arr.push({ user: 'Member', text: txt });
    await supabaseClient.from('social_posts').update({ comments_data: arr }).eq('id', id); renderFeed();
};
window.deletePost = async (id) => {
    if(!isAdminUnlocked) return alert("Admin Only.");
    if(confirm("Delete post?")) { await supabaseClient.from('social_posts').delete().eq('id', id); renderFeed(); }
};

document.getElementById('social-post-btn').addEventListener('click', publishPost);


// --- DIRECTORY & TEAMS ---

function renderMemberDirectory() {
    const grid = document.getElementById("member-directory-grid");
    const term = document.getElementById("directory-search").value.toLowerCase();
    grid.innerHTML = "";
    
    const filtered = h4_students.filter(s => s.toLowerCase().includes(term));
    document.getElementById("member-count-badge").textContent = filtered.length;
    
    filtered.forEach(str => {
        const parts = str.split(": ");
        const name = parts[1].split(" (")[0];
        const domain = parts[1].match(/\((.*?)\)/)[1];
        
        const card = document.createElement("div");
        card.className = "member-card";
        const removeBtn = isAdminUnlocked ? `<button class="btn-revoke-access" onclick="removeMemberDirectly('${str.replace(/'/g, "\\'")}')">DELETE</button>` : '';

        card.innerHTML = `
            <div class="member-card-photo">${name.charAt(0)}</div>
            <div class="member-card-name">${name}</div>
            <div class="member-card-detail" style="color:var(--color-accent);">${parts[0]}</div>
            <div class="member-card-detail">${domain} Unit</div>
            ${removeBtn}
        `;
        grid.appendChild(card);
    });
}
document.getElementById("directory-search").addEventListener("input", renderMemberDirectory);

function renderTeams() {
    const grid = document.getElementById("team-display-grid");
    const domainSelect = document.getElementById("team-domain-select");
    const selectedDomain = domainSelect.value || "Software";
    
    grid.innerHTML = "";
    // Match based on string includes, but domain list is now strict from DB
    const members = h4_students.filter(s => selectedDomain === "ALL" || s.toLowerCase().includes(selectedDomain.toLowerCase()));
    
    if(members.length === 0) { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No members in ${selectedDomain}.</div>`; return; }

    members.forEach(str => {
        const parts = str.split(": ");
        const name = parts[1].split(" (")[0];
        const enrollment = parts[1].match(/\[(.*?)\]/)[1];
        const img = memberPhotos[name] || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

        grid.innerHTML += `
        <div class="team-card">
            <a href="mailto:${name.split(' ')[0]}@example.com" class="mail-corner-link">✉</a>
            <div class="team-img-wrapper" onclick="updateMemberPhoto('${name.replace(/'/g, "\\'")}')">
                <img src="${img}" class="team-img" alt="${name}">
                <div class="img-upload-overlay">📷</div>
            </div>
            <h3 class="team-name">${name}</h3>
            <div class="team-role">${parts[0]}</div>
            <div class="team-details-box">
                <div class="team-detail-item"><strong>ID</strong><span>${enrollment}</span></div>
            </div>
        </div>`;
    });
}
window.updateMemberPhoto = async (name) => {
    if(!isAdminUnlocked) return alert("Admin Only.");
    const url = prompt("Enter Image URL:");
    if(url) {
        await supabaseClient.from('members').update({ photo_url: url }).eq('name', name);
        await fetchMembers();
    }
};

document.getElementById("team-domain-select").addEventListener("change", renderTeams);

// --- EQUIPMENT & PROJECTS ---
async function renderEquipmentLogs() {
    const b = document.getElementById("equipment-log-body"); b.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    const { data } = await supabaseClient.from('equipment_logs').select('*').eq('is_returned', false);
    b.innerHTML = "";
    if(!data || !data.length) b.innerHTML = '<tr><td colspan="5" style="text-align:center;">No active issues.</td></tr>';
    else data.forEach(x => {
        b.innerHTML += `<tr><td>${x.equipment_name}</td><td>${x.issued_to}</td><td>${x.issue_date}</td><td>ACTIVE</td><td><button class="btn-utility btn-equipment-return" onclick="returnEquipment('${x.id}')">RETURN</button></td></tr>`;
    });
}
document.getElementById("add-equipment-btn").addEventListener("click", async () => {
    const name = document.getElementById("eq-name").value;
    const to = document.getElementById("eq-member-select").value;
    const idate = document.getElementById("eq-issue-date").value;
    const rdate = document.getElementById("eq-return-date").value;
    if(name && to && idate) {
        await supabaseClient.from('equipment_logs').insert([{ equipment_name: name, issued_to: to, issue_date: idate, return_date: rdate, is_returned: false }]);
        renderEquipmentLogs(); showSuccessAnimation();
    }
});
window.returnEquipment = async (id) => {
    if(isAdminUnlocked && confirm("Returned?")) {
        await supabaseClient.from('equipment_logs').update({ is_returned: true }).eq('id', id);
        renderEquipmentLogs();
    } else if (!isAdminUnlocked) alert("Admin PIN Required.");
};

async function renderProjects() {
    const d = document.getElementById("live-projects-list"); d.innerHTML = "Loading...";
    const { data } = await supabaseClient.from('projects').select('*');
    d.innerHTML = "";
    if(data) data.forEach(p => {
        d.innerHTML += `<div class="project-card"><h4>${p.title}</h4><p class="project-info">${p.description}</p><a href="${p.resources_link}" target="_blank" class="project-btn-link">View</a><button class="btn-delete-project" onclick="deleteProject('${p.id}')">DEL</button></div>`;
    });
}
document.getElementById("add-project-btn").addEventListener("click", async () => {
    const title = document.getElementById("project-name").value;
    const link = document.getElementById("project-links").value;
    if(title && link) {
        await supabaseClient.from('projects').insert([{ title, resources_link: link, status: 'live', start_date: new Date() }]);
        renderProjects();
    }
});
window.deleteProject = async (id) => { if(confirm("Delete?")) { await supabaseClient.from('projects').delete().eq('id', id); renderProjects(); }};


// --- CHAT ---
async function loadChat() {
    const d = document.getElementById("chat-display");
    const { data } = await supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: true });
    if(data) d.innerHTML = data.map(m => `<div class="chat-message ${m.sender==='ME'?'msg-self':'msg-other'}"><span class="msg-meta">${m.sender}</span>${m.message}</div>`).join("");
}
function scrollChat() { const d = document.getElementById("chat-display"); d.scrollTop = d.scrollHeight; }
document.getElementById("chat-send-btn").addEventListener("click", async () => {
    const txt = document.getElementById("chat-input").value;
    const sender = document.getElementById("chat-sender-select").value;
    if(txt) {
        await supabaseClient.from('chat_messages').insert([{ sender, message: txt }]);
        document.getElementById("chat-input").value = "";
        loadChat(); setTimeout(scrollChat, 500);
    }
});

// --- CLOCK & ADMIN PIN ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
    digitalClock.textContent = `${dateString} | ${timeString}`;
}
setInterval(updateClock, 1000); updateClock();

document.getElementById("update-pin-btn").addEventListener("click", async () => {
    const old = document.getElementById('current-security-pin-verify').value;
    const newP = document.getElementById('new-security-pin').value;
    if(old === GLOBAL_SECURITY_PIN && newP.length === 4) {
        await supabaseClient.from('app_settings').update({ value: newP }).eq('key', 'security_pin');
        GLOBAL_SECURITY_PIN = newP; alert("PIN Updated.");
    } else alert("Invalid PIN.");
});

// --- GOOGLE MEET LOGIC ---
function getMeetingTopic() {
    const s = document.getElementById("attendance-subject");
    const custom = document.getElementById("custom-topic-input");
    return s.value === "Other" && custom.value.trim() !== "" ? custom.value.trim() : s.options[s.selectedIndex].textContent;
}

document.getElementById("create-gmeet-btn")?.addEventListener("click", () => {
    const topic = getMeetingTopic();
    window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(topic)}`, '_blank');
});

// --- CSV EXPORT LOGIC ---
document.getElementById("export-excel-btn")?.addEventListener("click", () => {
    if (!cachedAttendanceLogs || cachedAttendanceLogs.length === 0) { alert("No logs to export."); return; }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Topic,Name,Group,Status\n";

    cachedAttendanceLogs.forEach(log => {
        const date = log.date || "";
        const topic = (log.topic || "").replace(/,/g, " ");
        const att = log.attendance_data || [];

        att.forEach(student => {
             const row = `${date},${topic},${student.name},${student.group || ''},${student.status}`;
             csvContent += row + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CICR_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- SCHEDULER LOGIC ---
document.getElementById("schedule-meeting-btn")?.addEventListener("click", () => {
    const recipientSelect = document.getElementById("schedule-recipient-select");
    const selectedRecipients = Array.from(recipientSelect.selectedOptions).map(o => o.value).join(", ");
    
    const senderEmail = document.getElementById("sender-email").value.trim();
    const recipientEmail = document.getElementById("recipient-email").value.trim();
    const subject = document.getElementById("schedule-subject").value.trim();
    const date = document.getElementById("schedule-date").value;
    const time = document.getElementById("schedule-time").value;
    const locType = document.getElementById("schedule-location-type").value;
    const locDetails = document.getElementById("schedule-location-details").value.trim();

    if (!recipientEmail || !subject || !date || !time) {
        alert("Please fill in required fields.");
        return;
    }

    const body = `Meeting Invitation\n\n` +
                 `Topic: ${subject}\n` +
                 `Date: ${date}\n` +
                 `Time: ${time}\n` +
                 `Location: ${locType} ${locDetails ? `(${locDetails})` : ''}\n\n` +
                 `Attendees: ${selectedRecipients}\n\n` +
                 `Regards,\nCICR Management`;

    const mailtoLink = `mailto:${recipientEmail}?cc=${senderEmail}&subject=${encodeURIComponent("INVITE: " + subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
});

// --- INITIALIZATION ---
splashScreen.addEventListener('click', () => { 
    AUDIO.play('click'); 
    splashScreen.style.opacity = '0'; 
    setTimeout(() => { 
        splashScreen.style.display = 'none'; 
        operateGate(() => { 
            appContent.style.display = 'block'; 
            
            // [CRITICAL] CHAINED INITIALIZATION TO PREVENT RACE CONDITIONS
            fetchMembers().then(async () => {
                await fetchSettings();
                await fetchNotifications(); // Wait for existing notifs before checking birthdays
                runSystemChecks();
            });

            const savedTab = sessionStorage.getItem("cicr_active_tab"); 
            if(savedTab) switchTab(savedTab, false); else switchTab('attendance'); 
        }); 
    }, 500); 
    bgMusic.volume = 0.5; bgMusic.play().catch(()=>{});
});

tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
document.getElementById("year-select").addEventListener("change", renderStudents);
document.getElementById("attendance-domain-filter").addEventListener("change", renderStudents);
document.getElementById("save-data-btn").addEventListener("click", saveData);
document.getElementById("add-member-btn").addEventListener("click", addMember);
document.getElementById("remove-member-btn").addEventListener("click", removeMember);

// EVENT LISTENERS
if(musicToggle) {
    musicToggle.addEventListener('click', () => {
        if(bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = "🔊";
            musicToggle.style.opacity = "1";
        } else {
            bgMusic.pause();
            musicToggle.textContent = "🔇";
            musicToggle.style.opacity = "0.5";
        }
    });
}

document.getElementById("open-calendar-btn")?.addEventListener("click", () => openDatePicker("attendance-date"));
document.getElementById("open-calendar-start-btn")?.addEventListener("click", () => openDatePicker("project-start"));
document.getElementById("open-calendar-end-btn")?.addEventListener("click", () => openDatePicker("project-end"));
document.getElementById("open-calendar-scheduler-btn")?.addEventListener("click", () => openDatePicker("schedule-date"));

document.getElementById("export-directory-btn")?.addEventListener("click", () => alert("Exporting directory... (Feature WIP)"));

refreshAllDropdowns();