// --- CORE VARIABLES ---
// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://bmlzcoflkatuudfshhtj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbHpjb2Zsa2F0dXVkZnNoaHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDE5MTMsImV4cCI6MjA4MjUxNzkxM30.fZZ7MnHcXSeTL40WmXl72U-SFqFJ2PZebJivHZVTSgQ";

// Use 'supabaseClient' to avoid conflict with global library variable
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const currentUser = { id: "ADMIN", name: "Administrator", year: "4th Year", enrollment: "000000" };
let GLOBAL_SECURITY_PIN = localStorage.getItem("cicr_security_pin") || "1407"; 

// Dynamic Data Containers (Populated from Supabase)
let h4_students = []; 
let memberDetails = {}; 
let ALL_GROUPS = []; // Derived from DB data

// Legacy LocalStorage (Preserved for non-member features)
let attendanceState = {};
let notifications = JSON.parse(localStorage.getItem("cicrNotifications") || "[]");
let domainHeads = JSON.parse(localStorage.getItem("cicrDomainHeads") || "{}");
let memberPhotos = JSON.parse(localStorage.getItem("cicrMemberPhotos") || "{}");
const socialFeedKey = "cicrFeed";

// --- AUDIO ENGINE ---
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

// --- BACKGROUND PARTICLES ---
const canvas = document.getElementById('particles-canvas'); const ctx = canvas.getContext('2d'); let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } window.addEventListener('resize', resizeCanvas); resizeCanvas();
class Particle { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; this.size = Math.random() * 2 + 1; this.color = '#66fcf1'; } update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvas.width) this.vx *= -1; if (this.y < 0 || this.y > canvas.height) this.vy *= -1; } draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
function initParticles() { particles = []; const count = Math.floor(window.innerWidth / 15); for (let i = 0; i < count; i++) particles.push(new Particle()); }
function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); for (let j = i; j < particles.length; j++) { const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y; const dist = Math.sqrt(dx * dx + dy * dy); if (dist < 150) { ctx.strokeStyle = `rgba(69, 162, 158, ${1 - dist/150})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); } } } requestAnimationFrame(animateParticles); }
initParticles(); animateParticles();

// --- SUPABASE MEMBER LOGIC (SINGLE SOURCE OF TRUTH) ---

async function fetchMembers() {
    // 1. Fetch active members
    const { data, error } = await supabaseClient
        .from('members')
        .select('*')
        .order('year', { ascending: false });

    if (error) {
        console.error("Error fetching members:", error);
        return;
    }

    // 2. Reset containers
    h4_students = [];
    memberDetails = {};
    const groupsSet = new Set(); // Temp set to collect unique years/domains

    // 3. Process Data
    data.forEach(member => {
        if (member.active) {
            // Reconstruct the specific string format used by UI: "Year: Name (Domain) [Enrollment]"
            const memberString = `${member.year}: ${member.name} (${member.domain}) [${member.enrollment}]`;
            h4_students.push(memberString);

            // Populate details object
            memberDetails[member.name] = {
                dob: null, 
                email: member.email,
                phone: member.phone
            };

            // Collect Groups (Years & Domains) dynamically
            if(member.year) groupsSet.add(member.year);
            if(member.domain) groupsSet.add(member.domain);
        }
    });

    // 4. Update Global Groups List
    ALL_GROUPS = Array.from(groupsSet).sort();
    // Ensure basic groups exist even if DB is empty to prevent UI breaking
    const defaultGroups = ["4th Year", "3rd Year", "2nd Year", "1st Year", "Software", "Robotics", "Core"];
    defaultGroups.forEach(g => { if(!ALL_GROUPS.includes(g)) ALL_GROUPS.push(g); });

    console.log("Supabase Sync: Members & Groups Updated.");
    
    // 5. Update UI Components
    refreshAllDropdowns();
    renderStudents();
    renderMemberDirectory();
    renderTeams();
}

async function addMember() {
    const name = document.getElementById("new-member-name").value.trim(); 
    const email = document.getElementById("new-member-email").value.trim(); 
    const phone = document.getElementById("new-member-phone").value.trim();
    const batch = document.getElementById("new-member-batch").value.trim();
    const enroll = document.getElementById("new-member-enrollment").value.trim();
    const year = document.getElementById("new-member-year-select").value;

    if (!name || !email || !phone || !batch || !enroll) return alert("All text fields are mandatory.");
    if (!validateEmail(email)) return alert("Invalid Email Address format.");
    if (!/^\d{10}$/.test(phone)) return alert("Mobile Number must be exactly 10 digits.");

    let domain = document.getElementById("new-member-group").value; 
    if (domain === "Custom") domain = document.getElementById("custom-group-input").value.trim();
    if (!domain) return alert("Please specify a Domain/Unit.");

    operateGate(async () => { 
        // Insert into Supabase
        const { error } = await supabaseClient
            .from('members')
            .insert([{ 
                name, email, phone, year, batch, 
                enrollment: enroll, domain, active: true 
            }]);

        if (error) {
            alert("Error adding member: " + error.message);
            return;
        }

        // Refresh Data
        await fetchMembers(); 
        showSuccessAnimation(); 
        
        // Send Email
        const subject = "Welcome to CICR Team";
        const body = `Hello ${name},\n\nWelcome to CICR!\n\nPlease join our official WhatsApp Group here:\nhttps://chat.whatsapp.com/K86rBBwgB6jBsP3am3Oatx\n\nRegards,\nCICR Admin`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

// Replaces legacy remove logic
async function removeMember() {
    // Used in Admin Tab dropdown
    const val = document.getElementById("remove-member-select").value; 
    if(!val) return;
    
    // Parse Name from "Year: Name (Domain)..."
    const namePart = val.split(": ")[1].split(" (")[0].trim();

    if(confirm(`Permanently remove ${namePart}?`)) {
        const { error } = await supabaseClient
            .from('members')
            .update({ active: false })
            .eq('name', namePart);

        if (error) {
            alert("Error removing: " + error.message);
        } else {
            await fetchMembers();
            alert("Member removed.");
        }
    }
}

// Used in Directory Card buttons
window.removeMemberDirectly = async (str) => {
    const namePart = str.split(": ")[1].split(" (")[0].trim();
    if(confirm(`Permanently remove ${namePart}?`)) {
        const { error } = await supabaseClient
            .from('members')
            .update({ active: false })
            .eq('name', namePart);

        if (error) {
            alert("Error removing: " + error.message);
        } else {
            await fetchMembers();
            alert("Member removed.");
        }
    }
};

// --- DIRECTORY LOGIC (UPDATED) ---
function renderMemberDirectory() {
    const grid = document.getElementById("member-directory-grid");
    const searchInput = document.getElementById("directory-search");
    if (!grid || !searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    grid.innerHTML = "";
    
    const filtered = h4_students.filter(s => s.toLowerCase().includes(searchTerm));
    const badge = document.getElementById("member-count-badge");
    if(badge) badge.textContent = filtered.length;
    
    if(filtered.length === 0) {
        grid.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center;">No members found matching "${searchTerm}"</p>`;
        return;
    }

    filtered.forEach(memberStr => {
        const parts = memberStr.split(": ");
        const year = parts[0];
        const rest = parts[1] || "";
        const name = rest.split(" (")[0];
        const domainMatch = rest.match(/\((.*?)\)/);
        const domain = domainMatch ? domainMatch[1] : "Member";

        const card = document.createElement("div");
        card.className = "member-card";
        const initial = name.charAt(0).toUpperCase();
        
        const removeBtn = isAdminUnlocked 
            ? `<button class="btn-revoke-access" onclick="removeMemberDirectly('${memberStr.replace(/'/g, "\\'")}')">REMOVE USER</button>` 
            : '';

        card.innerHTML = `
            <div class="member-card-photo">${initial}</div>
            <div class="member-card-name">${name}</div>
            <div class="member-card-detail" style="color:var(--color-accent);">${year}</div>
            <div class="member-card-detail">${domain} Unit</div>
            ${removeBtn}
        `;
        grid.appendChild(card);
    });
}

// Hook up CSV Export
if(document.getElementById("export-directory-btn")) {
    const oldBtn = document.getElementById("export-directory-btn");
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.addEventListener("click", async () => {
        if(!confirm("Download full member database as CSV?")) return;
        const { data, error } = await supabaseClient
            .from('members')
            .select('name, enrollment, email, phone, year, batch, domain, role, active')
            .order('year', { ascending: false });

        if (error) { alert("Export failed: " + error.message); return; }

        const headers = ["Name", "Enrollment", "Email", "Phone", "Year", "Batch", "Domain", "Role", "Active"];
        let csvContent = headers.join(",") + "\n";
        data.forEach(row => {
            const rowData = [
                `"${row.name}"`, `"${row.enrollment}"`, `"${row.email}"`, `"${row.phone || ''}"`,
                `"${row.year}"`, `"${row.batch}"`, `"${row.domain}"`, `"${row.role}"`, row.active ? "Yes" : "No"
            ];
            csvContent += rowData.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `CICR_Database_Export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    });
}
if(document.getElementById("directory-search")) {
    document.getElementById("directory-search").addEventListener("input", renderMemberDirectory);
}


// --- DROPDOWN & UI POPULATION (DEPENDS ON FETCHED DATA) ---
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
    const adminYearRemove = document.getElementById("admin-remove-year-select");
    const domFilter = document.getElementById("attendance-domain-filter"); 
    const newMemGrp = document.getElementById("new-member-group");
    const adminDomRemove = document.getElementById("admin-remove-domain-select");

    // Reset Options
    if(yearSelectFilter) yearSelectFilter.innerHTML = "";
    if(yearSelectUser) yearSelectUser.innerHTML = "";
    if(adminYearRemove) adminYearRemove.innerHTML = '<option value="" disabled selected>-- Select --</option>';
    
    // Save current filter value
    const currentDomFilterVal = domFilter ? domFilter.value : "ALL";
    if(domFilter) domFilter.innerHTML = '<option value="ALL">All Domains</option>';
    if(newMemGrp) newMemGrp.innerHTML = '';
    if(adminDomRemove) adminDomRemove.innerHTML = '<option value="" disabled selected>-- Select --</option>';

    ALL_GROUPS.sort();

    ALL_GROUPS.forEach(g => {
        if(g.includes("Year")) {
            if(yearSelectFilter) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; yearSelectFilter.appendChild(opt); }
            if(yearSelectUser) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; yearSelectUser.appendChild(opt); }
            if(adminYearRemove) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; adminYearRemove.appendChild(opt); }
        } else {
             if(domFilter) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; domFilter.appendChild(opt); }
             if(newMemGrp) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g.toUpperCase(); newMemGrp.appendChild(opt); }
             if(adminDomRemove) { const opt = document.createElement("option"); opt.value = g; opt.textContent = g; adminDomRemove.appendChild(opt); }
        }
    });

    if(domFilter) domFilter.value = currentDomFilterVal;
    if(newMemGrp) { const cust = document.createElement('option'); cust.value = "Custom"; cust.textContent = "Custom Unit... (Type New)"; newMemGrp.appendChild(cust); }
}

function populateAllMembersDatalist() {
    allMembersDatalist.innerHTML = ''; 
    h4_students.forEach(s => { const opt = document.createElement("option"); opt.value = s.includes(": ") ? s.split(": ")[1] : s; allMembersDatalist.appendChild(opt); });
    const remSel = document.getElementById("remove-member-select");
    if(remSel) { remSel.innerHTML = ""; h4_students.forEach(s => { const opt = document.createElement("option"); opt.value = s; remSel.appendChild(opt); }); }
}
function populateSchedulingDropdowns() { 
    const sel = document.getElementById("schedule-recipient-select"); if(!sel) return; sel.innerHTML = ''; h4_students.forEach(s => { const n = s.includes(": ") ? s.split(": ")[1] : s; const rO = document.createElement("option"); rO.value = n; rO.textContent = n; sel.appendChild(rO); });
}
function populateProjectMembersDropdown() {
    const sel = document.getElementById("project-members-select"); if(!sel) return; sel.innerHTML = ''; h4_students.forEach(s => { const n = s.includes(": ") ? s.split(": ")[1] : s; const opt = document.createElement("option"); opt.value = n; opt.textContent = n; sel.appendChild(opt); });
}
function populateChatSenderSelect() {
    const sel = document.getElementById("chat-sender-select"); 
    if(!sel) return; 
    sel.innerHTML = '<option value="ME">ME (Anonymous)</option>';
    h4_students.forEach(s => { const n = s.includes(": ") ? s.split(": ")[1] : s; const simpleName = n.split(" [")[0]; const opt = document.createElement("option"); opt.value = simpleName; opt.textContent = simpleName; sel.appendChild(opt); });
}

// --- NOTIFICATION & SYSTEMS ---
function renderNotifications() {
    const list = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    list.innerHTML = "";
    notifications.sort((a,b) => b.id - a.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    if(unreadCount > 0) { badge.style.display = "flex"; badge.textContent = unreadCount > 9 ? "9+" : unreadCount; } else { badge.style.display = "none"; }

    if(notifications.length === 0) { list.innerHTML = '<li style="padding:15px; text-align:center; color:#666;">No new alerts.</li>'; return; }

    notifications.forEach(n => {
        const li = document.createElement("li");
        li.className = `notif-item ${!n.read ? 'unread' : ''}`;
        let icon = "🔔"; let actionButton = "";
        if(n.type === "birthday") {
            icon = "🎂";
            if(n.metadata && n.metadata.name) {
                const email = n.metadata.email || ""; 
                actionButton = `<button onclick="sendBirthdayWish('${n.metadata.name.replace(/'/g, "\\'")}', '${email}')" style="margin-top:5px; background:var(--color-accent-dim); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:10px; cursor:pointer;">✉️ Send Wish</button>`;
            }
        }
        if(n.type === "equipment") icon = "⚠️";
        if(n.type === "social") icon = "💬";

        li.innerHTML = `<div><span class="notif-type-icon">${icon}</span> ${n.text}</div>${actionButton}<span class="notif-time">${new Date(n.id).toLocaleDateString()} ${new Date(n.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
        list.appendChild(li);
    });
}
function addNotification(text, type = "general", metadata = {}) {
    const todayStr = new Date().toDateString();
    const isDuplicate = notifications.some(n => n.text === text && new Date(n.id).toDateString() === todayStr);
    if(!isDuplicate) {
        notifications.unshift({ id: Date.now(), text, type, read: false, metadata: metadata });
        localStorage.setItem("cicrNotifications", JSON.stringify(notifications));
        renderNotifications();
        AUDIO.play('success');
    }
}
window.clearNotifications = () => { notifications = []; localStorage.setItem("cicrNotifications", JSON.stringify(notifications)); renderNotifications(); };
document.getElementById("notif-btn").addEventListener("click", () => {
    const panel = document.getElementById("notif-panel");
    panel.classList.toggle("active");
    if(panel.classList.contains("active")) {
        notifications.forEach(n => n.read = true);
        localStorage.setItem("cicrNotifications", JSON.stringify(notifications));
        document.getElementById("notif-badge").style.display = "none";
    }
});
function runSystemChecks() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMatch = `${mm}-${dd}`;
    
    // Birthday Check (Uses memberDetails populated from DB)
    for (const [name, details] of Object.entries(memberDetails)) {
        if(details.dob) {
            const dobParts = details.dob.split("-");
            const dobMatch = `${dobParts[1]}-${dobParts[2]}`;
            if(dobMatch === todayMatch) {
                addNotification(`Happy Birthday to ${name}! 🎂 Send them a wish!`, "birthday", { name: name, email: details.email });
            }
        }
    }
    // Equipment Check
    const eqLogs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    eqLogs.forEach(log => {
        const returnDate = new Date(log.returnDate);
        const diffTime = returnDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if(diffDays <= 0) addNotification(`OVERDUE: ${log.name} (Issued to ${log.issuedTo}) was due on ${log.returnDate}.`, "equipment");
        else if (diffDays <= 2) addNotification(`Reminder: ${log.name} (Issued to ${log.issuedTo}) due in ${diffDays} days.`, "equipment");
    });
}
window.sendBirthdayWish = (name, email) => {
    const subject = `Happy Birthday ${name}! 🎂`;
    const body = `🎉 Happy Birthday ${name}! 🎉\n\nOn behalf of the entire CICR family, we extend our warmest birthday wishes to you. Your enthusiasm, dedication, and innovative spirit truly reflect the core values of our club.\n\nWarm regards,\nTeam CICR 🚀`;
    window.location.href = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// --- SECURITY & TABS ---
let pendingTabId = null; let pendingAction = null; let isAdminUnlocked = false;
function switchTab(targetTabId, saveToStorage = true) {
    AUDIO.play('click');
    if ((targetTabId === 'admin' || targetTabId === 'history' || targetTabId === 'directory') && !isAdminUnlocked) {
        pendingTabId = targetTabId; securityMessage.textContent = "This section requires High-Level Security Clearance."; securityOverlay.style.display = 'flex'; securityPinInput.value = ''; securityPinInput.focus(); return;
    }
    tabLinks.forEach(link => { link.classList.remove('active'); link.setAttribute('aria-selected', 'false'); });
    tabContents.forEach(content => { content.classList.remove('active'); content.style.display = 'none'; });
    const activeLink = document.querySelector(`.tab-link[data-tab="${targetTabId}"]`); const activeContent = document.getElementById(`${targetTabId}-content`);
    if (activeLink && activeContent) {
        activeLink.classList.add('active'); activeLink.setAttribute('aria-selected', 'true'); activeContent.classList.add('active'); activeContent.style.display = 'block';
        if (saveToStorage) sessionStorage.setItem("cicr_active_tab", targetTabId);
        
        // Render specific tab content
        if (targetTabId === 'history') renderHistory();
        else if (targetTabId === 'reports') { try { calculatePersonalReport(); } catch(e) { console.error("Analytics Error", e); } }
        else if (targetTabId === 'projects') renderProjects();
        else if (targetTabId === 'chat') { loadChat(); scrollChat(); }
        else if (targetTabId === 'admin') { populateGroupSelects(); }
        else if (targetTabId === 'equipment') { renderEquipmentLogs(); }
        else if (targetTabId === 'directory') renderMemberDirectory();
        else if (targetTabId === 'scheduling') populateSchedulingDropdowns();
        else if (targetTabId === 'social') renderFeed();
        else if (targetTabId === 'teams') { populateTeamDropdown(); renderTeams(); }
    }
}
function verifySecurityPin() {
    if(securityPinInput.value === GLOBAL_SECURITY_PIN) { isAdminUnlocked = true; securityOverlay.style.display = 'none'; if(pendingTabId) { switchTab(pendingTabId); pendingTabId = null; } if(pendingAction) { pendingAction(); pendingAction = null; } } 
    else { alert("ACCESS DENIED: INCORRECT PIN"); securityPinInput.value = ''; securityPinInput.focus(); }
}
unlockBtn.addEventListener('click', verifySecurityPin); securityCancel.addEventListener('click', () => { securityOverlay.style.display = 'none'; pendingTabId = null; pendingAction = null; });
securityPinInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') verifySecurityPin(); });

// --- ATTENDANCE & HISTORY (LOCAL STORAGE FOR NOW) ---
// --- NEW renderHistory (Supabase) ---
async function renderHistory() {
    const list = document.getElementById("history-list");
    // Show loading state
    list.innerHTML = '<li style="padding:20px; text-align:center; opacity:0.6;">Loading records...</li>';
    
    // Fetch from Supabase
    const { data: logs, error } = await supabaseClient
        .from('attendance_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error loading history:", error);
        list.innerHTML = '<li style="padding:20px; text-align:center; color:var(--color-danger);">Error loading data.</li>';
        return;
    }

    list.innerHTML = "";
    if (!logs || logs.length === 0) { 
        list.innerHTML = '<li style="padding:20px; text-align:center; opacity:0.6;">No attendance records found.</li>'; 
        return; 
    }
    
    logs.forEach(log => {
        // Map DB JSONB 'attendance_data' to the UI's expected 'attendance' list
        const attendanceList = log.attendance_data; 
        
        const presentCount = attendanceList.filter(s => s.status === "PRESENT").length;
        const totalCount = attendanceList.length;
        const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        
        const li = document.createElement("li"); 
        li.className = "history-item";
        
        // Note: passing ID as string '${log.id}' for UUID compatibility
        li.innerHTML = `
            <div class="history-header-wrapper">
                <div style="display:flex; align-items:center;">
                    <input type="checkbox" class="history-checkbox" value="${log.id}">
                    <div class="history-info" onclick="toggleHistoryDetail('${log.id}')" style="cursor:pointer;">
                        <span class="history-title">${log.topic}</span>
                        <span class="history-date">${log.date}</span>
                        <span class="history-meta">${presentCount}/${totalCount} Present (${percent}%)</span>
                    </div>
                </div>
                <button class="btn-utility" style="padding:5px 10px; font-size:10px;" onclick="toggleHistoryDetail('${log.id}')">EXPAND</button>
            </div>
            <div id="history-detail-${log.id}" class="history-details">
                <h4 style="color:#fff; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">Attendance Sheet</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:5px;">
                    ${attendanceList.map(s => `<div style="font-size:11px; color:${s.status==='PRESENT'?'var(--color-success)':'var(--color-danger)'}">${s.name}</div>`).join('')}
                </div>
            </div>`;
        list.appendChild(li);
    });
}
window.toggleHistoryDetail = (id) => { const el = document.getElementById(`history-detail-${id}`); if(el) el.style.display = el.style.display === "block" ? "none" : "block"; };
document.getElementById('clear-history-btn').addEventListener('click', () => { if(confirm("Clear ALL attendance logs permanently?")) { localStorage.removeItem("attendanceHistory"); renderHistory(); }});
document.getElementById('remove-selected-btn').addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.history-checkbox:checked')).map(cb => parseInt(cb.value));
    if(!selected.length) return alert("No logs selected.");
    if(confirm(`Delete ${selected.length} logs?`)) {
        let logs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
        logs = logs.filter(l => !selected.includes(l.id));
        localStorage.setItem("attendanceHistory", JSON.stringify(logs)); renderHistory();
    }
});
// --- NEW Export Logic (Supabase) ---

// 1. Export All
document.getElementById('export-excel-btn').addEventListener('click', async () => {
    const { data: logs, error } = await supabaseClient
        .from('attendance_logs')
        .select('*')
        .order('date', { ascending: false });
        
    if(error) return alert("Export failed: " + error.message);
    
    // Map DB structure to Export function structure
    const formattedLogs = logs.map(l => ({
        date: l.date,
        topic: l.topic,
        attendance: l.attendance_data
    }));
    
    exportLogsToCSV(formattedLogs, 'cicr_all_attendance.csv');
});

// 2. Export Selected
document.getElementById('export-selected-btn').addEventListener('click', async () => {
    // Get selected UUIDs
    const selectedIds = Array.from(document.querySelectorAll('.history-checkbox:checked')).map(cb => cb.value);
    if(!selectedIds.length) return alert("Please select logs to export first.");
    
    const { data: logs, error } = await supabaseClient
        .from('attendance_logs')
        .select('*')
        .in('id', selectedIds) // Filter by IDs
        .order('date', { ascending: false });

    if(error) return alert("Export failed: " + error.message);

    const formattedLogs = logs.map(l => ({
        date: l.date,
        topic: l.topic,
        attendance: l.attendance_data
    }));
    
    exportLogsToCSV(formattedLogs, 'cicr_selected_attendance.csv');
});
function exportLogsToCSV(logs, filename) {
    if(!logs.length) return alert("No data to export.");
    let csv = "Date,Topic,Name,Status\n";
    logs.forEach(l => { l.attendance.forEach(s => { csv += `${l.date},"${l.topic}","${s.name}",${s.status}\n`; }); });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
}

function renderStudents() {
    const list = document.getElementById("attendance-list"); list.innerHTML = ""; attendanceState = {};
    const ys = Array.from(document.getElementById("year-select").selectedOptions).map(o => o.value);
    const df = document.getElementById("attendance-domain-filter").value;
    const yearsToRender = ys.length ? ys : ["4th Year", "3rd Year", "2nd Year", "1st Year"];
    const filtered = h4_students.filter(s => { const [y, r] = s.split(": "); return yearsToRender.includes(y) && (df === "ALL" || s.includes(`(${df})`)); }).sort();
    if (!filtered.length) { list.innerHTML = `<li style="padding:15px; opacity:0.7;">No users found.</li>`; return; }
    filtered.forEach(s => {
        const [r, n] = s.split(": "); 
        const id = s.replace(/[^a-zA-Z0-9]/g, "_");
        const li = document.createElement("li"); li.className = "student-item unmarked"; li.id = id;
        li.innerHTML = `<div class="student-info"><div class="student-name">${n}</div><div class="student-id">${r}</div></div><div class="status-controls"><button class="status-button btn-present" data-key="${s}" style="opacity:0.4;">P</button><button class="status-button btn-absent" data-key="${s}" style="opacity:0.4;">A</button><button class="status-button btn-unmarked" data-key="${s}" style="opacity:1.0;">?</button></div>`;
        list.appendChild(li);
        li.querySelectorAll("button").forEach(b => b.addEventListener("click", e => {
            const k = e.target.getAttribute("data-key"); 
            const isUnmark = e.target.classList.contains("btn-unmarked");
            const isPresent = e.target.classList.contains("btn-present");
            li.querySelectorAll("button").forEach(btn=>btn.style.opacity=0.4); 
            e.target.style.opacity=1;
            if(isUnmark) { delete attendanceState[k]; li.className = "student-item unmarked"; } 
            else { attendanceState[k] = isPresent ? "PRESENT" : "ABSENT"; li.className = `student-item ${isPresent ? 'present' : 'absent'}`; }
            updateSummary();
        }));
    });
}
function updateSummary() {
    let p = 0, a = 0; for(let k in attendanceState) { if(attendanceState[k]==="PRESENT") p++; else if(attendanceState[k]==="ABSENT") a++; }
    document.getElementById("total-present").textContent=p; document.getElementById("total-absent").textContent=a;
    const total = p + a;
    document.getElementById("present-percentage").textContent = total > 0 ? ((p/total)*100).toFixed(1) + "%" : "0.0%";
}
// --- NEW CODE (Supabase Write) ---
// --- NEW CODE (Supabase Write) ---
async function saveData() {
    // 1. Security Check (Unchanged)
    if(!isAdminUnlocked) {
        securityMessage.textContent = "Admin PIN required to SAVE Attendance Log.";
        securityOverlay.style.display = 'flex';
        securityPinInput.value = ''; 
        securityPinInput.focus();
        pendingAction = () => { saveData(); }; 
        return;
    }

    // 2. Validation (Unchanged)
    const dateVal = document.getElementById("attendance-date").value;
    const topicVal = document.getElementById("attendance-subject").value;

    if(!dateVal) return alert("Select Date.");
    if(Object.keys(attendanceState).length === 0) {
        if(!confirm("No students marked Present or Absent. Save empty log?")) return;
    }
    
    // 3. Prepare the Data Object (Same structure as before)
    const attendanceArray = Object.keys(attendanceState).map(k => ({
        name: k.split(": ")[1], 
        group: k.split(": ")[0], 
        status: attendanceState[k]
    }));

    operateGate(async () => {
        // 4. Send to Supabase
        const { error } = await supabaseClient
            .from('attendance_logs')
            .insert([
                { 
                    date: dateVal, 
                    topic: topicVal, 
                    attendance_data: attendanceArray // Storing the full array as JSON
                }
            ]);

        if (error) {
            console.error("Supabase Error:", error);
            alert("Failed to save attendance: " + error.message);
            return;
        }

        // 5. Success
        showSuccessAnimation();
        // Note: The History tab will NOT update yet (we fix this in Step 5)
    });
}
function handleTopicChange() { const s = document.getElementById("attendance-subject"); document.getElementById("custom-topic-input").style.display = s.value === "Other" ? "block" : "none"; document.getElementById("current-subject-display").textContent = s.value === "Other" && document.getElementById("custom-topic-input").value ? document.getElementById("custom-topic-input").value : s.options[s.selectedIndex].textContent; }

// --- ANALYTICS ---
function calculatePersonalReport() {
    const logs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const stats = {};
    h4_students.forEach(s => { const [yearGroup, namePart] = s.split(": "); const name = namePart; stats[name] = { year: yearGroup, present: 0, total: 0 }; });
    if (logs && Array.isArray(logs)) {
        logs.forEach(log => { if(log.attendance) { log.attendance.forEach(entry => { let key = Object.keys(stats).find(k => k.includes(entry.name)); if(!key) { key = entry.name; if(!stats[key]) stats[key] = { year: "Unknown", present: 0, total: 0 }; } stats[key].total++; if(entry.status === "PRESENT") stats[key].present++; }); } });
    }
    [1, 2, 3, 4].forEach(y => {
        const tbody = document.getElementById(`analytics-body-${y}`); if (!tbody) return; tbody.innerHTML = "";
        const yearKey = `${y}${y===1?'st':(y===2?'nd':(y===3?'rd':'th'))} Year`;
        const yearStudents = Object.entries(stats).filter(([k, v]) => v.year === yearKey);
        if(yearStudents.length === 0) { tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.5;">No data available.</td></tr>`; } else {
            yearStudents.sort((a,b) => { const pa = a[1].total ? (a[1].present/a[1].total) : 0; const pb = b[1].total ? (b[1].present/b[1].total) : 0; return pb - pa; });
            yearStudents.forEach(([name, data]) => {
                const pct = data.total === 0 ? 0 : Math.round((data.present / data.total) * 100);
                let color = '#e74c3c'; if(pct >= 75) color = '#2ecc71'; else if(pct >= 50) color = '#f1c40f';
                let unit = "General"; if(name.includes("(Software)")) unit = "Software"; else if(name.includes("(Robotics)")) unit = "Robotics"; else if(name.includes("(Core)")) unit = "Core";
                tbody.innerHTML += `<tr><td>${name.split(" [")[0]}</td><td><span class="tech-badge">${unit.toUpperCase()}</span></td><td><div style="display:flex; align-items:center;"><span style="width:35px; font-weight:bold; color:${color};">${pct}%</span><div class="analytics-progress-wrapper"><div class="analytics-progress-fill" style="width:${pct}%; background:${color};"></div></div></div></td></tr>`;
            });
        }
    });
}

// --- EQUIPMENT ---
function renderEquipmentLogs() {
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    const tbody = document.getElementById("equipment-log-body"); tbody.innerHTML = "";
    if(logs.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; opacity:0.5;">No hardware issued.</td></tr>'; return; }
    logs.forEach(item => {
        tbody.innerHTML += `<tr><td style="color:var(--color-accent); font-weight:bold;">${item.name}</td><td>${item.issuedTo}<br><span style="font-size:10px; color:#888;">${item.group}</span></td><td>Issued: ${item.issueDate}<br><span style="font-size:10px; color:#e74c3c;">Return: ${item.returnDate}</span></td><td><span class="tech-badge" style="background: rgba(231, 76, 60, 0.1); color: var(--color-danger);">ISSUED</span></td><td style="display:flex; gap:5px;"><button class="btn-utility btn-equipment-return" onclick="returnEquipment(${item.id})">RETURN</button><button class="btn-utility" title="Send Reminder Email" style="padding:5px 10px; font-size:16px; border-color:var(--color-tinker); color:var(--color-tinker);" onclick="sendEqReminder('${item.name.replace(/'/g, "\\'")}', '${item.returnDate}')">🔔</button></td></tr>`;
    });
}
window.sendEqReminder = (name, date) => { window.location.href = `mailto:?subject=${encodeURIComponent("Equipment Return: " + name)}&body=${encodeURIComponent("Please return by " + date)}`; };
document.getElementById("add-equipment-btn").addEventListener("click", () => {
    const name = document.getElementById("eq-name").value; const to = document.getElementById("eq-member-select").value; const idate = document.getElementById("eq-issue-date").value; const rdate = document.getElementById("eq-return-date").value; const grp = document.getElementById("eq-group").value;
    if(!name || !to || !idate || !rdate) return alert("All fields are required.");
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]"); logs.unshift({ id: Date.now(), name, issuedTo: to, group: grp, issueDate: idate, returnDate: rdate });
    localStorage.setItem("cicrEquipment", JSON.stringify(logs)); showSuccessAnimation(); renderEquipmentLogs();
});
window.returnEquipment = (id) => {
    if(!isAdminUnlocked) { securityMessage.textContent = "Admin PIN required to Mark as Returned."; securityOverlay.style.display = 'flex'; securityPinInput.value = ''; securityPinInput.focus(); pendingAction = () => { window.returnEquipment(id); }; return; }
    if(!confirm("Mark this item as returned?")) return;
    let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]"); logs = logs.filter(x => x.id !== id); localStorage.setItem("cicrEquipment", JSON.stringify(logs)); renderEquipmentLogs(); showSuccessAnimation();
};

// --- PROJECTS ---
function loadProjects() { return JSON.parse(localStorage.getItem("cicrProjects") || "[]"); }
function renderProjects() {
    const p = loadProjects(); const l = document.getElementById("live-projects-list"); l.innerHTML = "";
    if(!p.length) { l.innerHTML = '<p style="opacity:0.6;">Empty.</p>'; return; }
    p.forEach(x => { l.innerHTML += `<div class="project-card"><h4>${x.name}</h4><p class="project-info">${x.purpose}</p><span class="project-tech-tag">${x.type}</span><button class="btn-delete-project" onclick="deleteProject(${x.id})">DEL</button></div>`; });
}
window.deleteProject = (id) => { if(!confirm("Delete Project?")) return; const p = loadProjects().filter(x=>x.id!==id); localStorage.setItem("cicrProjects", JSON.stringify(p)); renderProjects(); };
document.getElementById("add-project-btn").addEventListener("click", () => {
    const n = document.getElementById("project-name").value; const start = document.getElementById("project-start").value;
    if(!n || !start) return alert("Title and Start Date required.");
    const p = loadProjects(); p.push({ id: Date.now(), name: n, purpose: document.getElementById("project-purpose").value, type: document.getElementById("project-type").value });
    localStorage.setItem("cicrProjects", JSON.stringify(p)); showSuccessAnimation(); renderProjects();
});

// --- CHAT ---
function loadChat() { const c = JSON.parse(localStorage.getItem("cicrChat") || "[]"); const d = document.getElementById("chat-display"); d.innerHTML = c.map(m=>`<div class="chat-message ${m.sender==='ME'?'msg-self':'msg-other'}"><span class="msg-meta">${m.sender}</span>${m.text}</div>`).join(""); }
function scrollChat() { const d = document.getElementById("chat-display"); d.scrollTop = d.scrollHeight; }
function postMessage() {
    const t = document.getElementById("chat-input").value; if(!t) return;
    const sender = document.getElementById("chat-sender-select").value || "ME";
    const c = JSON.parse(localStorage.getItem("cicrChat") || "[]"); c.push({sender: sender, text:t}); localStorage.setItem("cicrChat", JSON.stringify(c)); document.getElementById("chat-input").value=""; loadChat(); scrollChat();
}
document.getElementById("chat-send-btn").addEventListener("click", postMessage);

// --- SOCIAL FEED ---
function toggleImgInput() {
    const type = document.getElementById('social-img-type').value;
    document.getElementById('social-url-wrapper').style.display = type === 'url' ? 'block' : 'none';
    document.getElementById('social-file-wrapper').style.display = type === 'file' ? 'block' : 'none';
}
function publishPost() {
    const author = document.getElementById('social-author').value.trim();
    const text = document.getElementById('social-text').value.trim();
    const imgType = document.getElementById('social-img-type').value;
    const link = document.getElementById('social-link').value.trim();
    if(!author || !text) return alert("Please include an Author and Caption.");

    const createPostObj = (imgData) => {
        const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
        const newPost = { id: Date.now(), author: author.split(":")[1] || author, text, image: imgData, link, likes: 0, comments: [], pinned: false, timestamp: new Date().toISOString() };
        posts.unshift(newPost);
        localStorage.setItem(socialFeedKey, JSON.stringify(posts));
        addNotification(`New Social Post by ${newPost.author}: "${text.substring(0, 20)}..."`, "social");
        document.getElementById('social-text').value = ""; document.getElementById('social-img-url').value = ""; document.getElementById('social-img-file').value = ""; document.getElementById('social-link').value = "";
        showSuccessAnimation(); renderFeed();
    };
    if (imgType === 'file') {
        const fileInput = document.getElementById('social-img-file');
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0]; if(file.size > 500000) return alert("File too large! Max 500KB.");
            const reader = new FileReader(); reader.onload = (e) => createPostObj(e.target.result); reader.readAsDataURL(file);
        } else { createPostObj(null); }
    } else { createPostObj(document.getElementById('social-img-url').value.trim() || null); }
}
function renderFeed() {
    const stream = document.getElementById('feed-stream'); const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]"); stream.innerHTML = "";
    posts.sort((a,b) => (b.pinned === a.pinned) ? b.id - a.id : b.pinned - a.pinned);
    if(posts.length === 0) { stream.innerHTML = `<div style="text-align:center; opacity:0.5; padding:40px;">No posts yet.</div>`; return; }
    posts.forEach(post => {
        const date = new Date(post.timestamp).toLocaleString(); const initial = post.author.charAt(0).toUpperCase();
        let commentsHtml = ""; post.comments.forEach(c => { commentsHtml += `<li class="comment-item"><strong>${c.user}</strong>: ${c.text}</li>`; });
        stream.innerHTML += `<div class="feed-card" id="post-${post.id}">${post.pinned ? `<div class="feed-pin-icon" title="Pinned Post">📌</div>` : ''}<div class="feed-admin-controls"><button class="btn-feed-admin btn-feed-pin" onclick="togglePin(${post.id})">${post.pinned ? 'Unpin' : 'Pin'}</button><button class="btn-feed-admin" onclick="deletePost(${post.id})">✖</button></div><div class="feed-header"><div class="feed-avatar">${initial}</div><div class="feed-meta"><h5>${post.author}</h5><span>${date}</span></div></div><div class="feed-content">${post.text}</div>${post.image ? `<img src="${post.image}" class="feed-media" alt="Post Image">` : ''}${post.link ? `<a href="${post.link}" target="_blank" class="feed-link-preview">🔗 ${post.link}</a>` : ''}<div class="feed-actions"><button class="action-btn" onclick="likePost(${post.id})">❤ ${post.likes} Likes</button><button class="action-btn" onclick="document.getElementById('comments-${post.id}').classList.toggle('active')">💬 ${post.comments.length} Comments</button></div><div class="comment-section" id="comments-${post.id}"><ul class="comment-list">${commentsHtml}</ul><div class="comment-input-wrapper"><input type="text" placeholder="Add a comment..." id="input-comment-${post.id}"><button class="btn-utility" style="padding:5px 10px; font-size:10px;" onclick="addComment(${post.id})">POST</button></div></div></div>`;
    });
}
window.likePost = function(id) { const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]"); const p = posts.find(x => x.id === id); if(p) { p.likes++; localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); } };
window.addComment = function(id) {
    const input = document.getElementById(`input-comment-${id}`); const text = input.value.trim(); if(!text) return;
    const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]"); const p = posts.find(x => x.id === id);
    if(p) { p.comments.push({ user: "Member", text }); localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); }
};
window.togglePin = function(id) { if(!isAdminUnlocked) { securityMessage.textContent = "Admin PIN required."; securityOverlay.style.display = 'flex'; securityPinInput.value=''; securityPinInput.focus(); pendingAction = () => { window.togglePin(id); }; return; } const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]"); const p = posts.find(x => x.id === id); if(p) { p.pinned = !p.pinned; localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); } };
window.deletePost = function(id) { if(!isAdminUnlocked) { securityMessage.textContent = "Admin PIN required."; securityOverlay.style.display = 'flex'; securityPinInput.value=''; securityPinInput.focus(); pendingAction = () => { window.deletePost(id); }; return; } if(!confirm("Delete?")) return; let posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]"); posts = posts.filter(x => x.id !== id); localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); };
document.getElementById('social-post-btn').addEventListener('click', publishPost);

// --- TEAMS (READ-ONLY) ---
function renderTeams() {
    const grid = document.getElementById("team-display-grid"); const domainSelect = document.getElementById("team-domain-select"); const selectedDomain = domainSelect.value || "Software";
    grid.innerHTML = "";
    const teamMembers = h4_students.filter(s => selectedDomain === "ALL" || s.toLowerCase().includes(selectedDomain.toLowerCase()));
    if(teamMembers.length === 0) { grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No members found in ${selectedDomain} domain.</div>`; return; }
    teamMembers.sort((a, b) => {
        const nameA = a.split(": ")[1].split(" [")[0]; const nameB = b.split(": ")[1].split(" [")[0];
        const isHeadA = domainHeads[selectedDomain] === nameA; const isHeadB = domainHeads[selectedDomain] === nameB;
        if (isHeadA) return -1; if (isHeadB) return 1; return nameA.localeCompare(nameB);
    });
    teamMembers.forEach(memberStr => {
        const parts = memberStr.split(": "); const year = parts[0]; const rest = parts[1];
        const name = rest.split(" (")[0].trim(); const enrollment = rest.match(/\[(.*?)\]/)[1];
        const isHead = domainHeads[selectedDomain] === name;
        const photoUrl = memberPhotos[name] || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
        const mockEmail = `${name.split(' ')[0].toLowerCase()}.${enrollment}@jiit.ac.in`;
        grid.innerHTML += `<div class="team-card ${isHead ? 'is-head' : ''}">${isHead ? `<div class="head-badge">👑 ${selectedDomain} HEAD</div>` : ''}<a href="mailto:${mockEmail}" class="mail-corner-link" title="Send Email">✉</a><div class="team-img-wrapper" onclick="updateMemberPhoto('${name.replace(/'/g, "\\'")}')"><img src="${photoUrl}" class="team-img" alt="${name}"><div class="img-upload-overlay">📷</div></div><h3 class="team-name">${name}</h3><div class="team-role">${year} • ${enrollment}</div><div class="team-details-box"><div class="team-detail-item"><strong>BATCH</strong><span>2021-25</span></div><div class="team-detail-item"><strong>STATUS</strong><span style="color:var(--color-success)">ACTIVE</span></div></div>${isAdminUnlocked ? `<div class="team-admin-actions" style="display:block"><button class="btn-make-head" onclick="toggleDomainHead('${selectedDomain}', '${name.replace(/'/g, "\\'")}')">${isHead ? 'REMOVE HEAD' : 'MAKE HEAD'}</button></div>` : ''}</div>`;
    });
}
function populateTeamDropdown() {
    const sel = document.getElementById("team-domain-select"); sel.innerHTML = "";
    const domains = ALL_GROUPS.filter(g => !g.includes("Year"));
    domains.forEach(d => { const opt = document.createElement("option"); opt.value = d; opt.textContent = d.toUpperCase(); sel.appendChild(opt); });
    sel.onchange = renderTeams;
}
window.toggleDomainHead = (domain, name) => {
    if(!isAdminUnlocked) return alert("Security Restriction: Unlock Admin Mode first.");
    if (domainHeads[domain] === name) delete domainHeads[domain]; else if(confirm(`Promote ${name} to HEAD of ${domain}?`)) domainHeads[domain] = name;
    localStorage.setItem("cicrDomainHeads", JSON.stringify(domainHeads)); renderTeams(); showSuccessAnimation();
};
window.updateMemberPhoto = (name) => {
    if(!isAdminUnlocked) { securityMessage.textContent = "Admin PIN required."; securityOverlay.style.display = 'flex'; securityPinInput.value=''; securityPinInput.focus(); pendingAction = () => { window.updateMemberPhoto(name); }; return; }
    const url = prompt(`Enter Image URL for ${name}:`); if (url === null) return;
    if (url.trim() === "") delete memberPhotos[name]; else memberPhotos[name] = url.trim();
    localStorage.setItem("cicrMemberPhotos", JSON.stringify(memberPhotos)); renderTeams();
};

// --- SCHEDULING ---
document.getElementById("schedule-meeting-btn").addEventListener("click", () => {
    const recipient = document.getElementById("recipient-email").value; const subject = document.getElementById("schedule-subject").value; const date = document.getElementById("schedule-date").value; const time = document.getElementById("schedule-time").value; const loc = document.getElementById("schedule-location-type").value; const det = document.getElementById("schedule-location-details").value;
    const select = document.getElementById("schedule-recipient-select"); const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);
    if(!subject || !date) return alert("Subject and Date are required.");
    let body = `Meeting Invitation\n\nSubject: ${subject}\nWhen: ${date} at ${time}\nWhere: ${loc} - ${det}\n\n`;
    if (selectedOptions.length > 0) body += `Invited Members:\n${selectedOptions.join('\n')}\n\n`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// --- ADMIN ---
document.getElementById("update-pin-btn").addEventListener("click", () => {
    const currentInput = document.getElementById('current-security-pin-verify').value; const newPin = document.getElementById('new-security-pin').value;
    if(currentInput !== GLOBAL_SECURITY_PIN) return alert("Incorrect PIN.");
    if(newPin.length !== 4) return alert("New PIN must be 4 digits.");
    GLOBAL_SECURITY_PIN = newPin; localStorage.setItem("cicr_security_pin", newPin); alert("PIN Updated.");
    document.getElementById('current-security-pin-verify').value = ''; document.getElementById('new-security-pin').value = '';
});

// Admin add/remove group placeholders (Visual only since groups are DB derived)
document.getElementById("admin-add-year-btn").addEventListener("click", () => alert("Years are now managed automatically based on member profiles."));
document.getElementById("admin-remove-year-btn").addEventListener("click", () => alert("Years are managed automatically. Remove members from a year to hide it."));
document.getElementById("admin-add-domain-btn").addEventListener("click", () => alert("Domains are now managed automatically."));
document.getElementById("admin-remove-domain-btn").addEventListener("click", () => alert("Domains are managed automatically."));

// --- INIT ---
setInterval(updateClock, 1000); updateClock();
splashScreen.addEventListener('click', () => { 
    AUDIO.play('click'); splashScreen.style.opacity = '0'; 
    setTimeout(() => { 
        splashScreen.style.display = 'none'; 
        operateGate(() => { 
            appContent.style.display = 'block'; 
            fetchMembers().then(() => {
                const ySelect = document.getElementById("year-select"); if(ySelect.options.length > 0) ySelect.options[0].selected = true;
                renderStudents();
            });
            runSystemChecks(); renderNotifications();
            const savedTab = sessionStorage.getItem("cicr_active_tab"); 
            if(savedTab) switchTab(savedTab, false); else switchTab('attendance'); 
        }); 
    }, 500); 
    bgMusic.volume = 0.5; bgMusic.play().catch(()=>{});
});
let isMusicPlaying = true;
musicToggle.addEventListener('click', () => { if(isMusicPlaying) { bgMusic.pause(); musicToggle.textContent = "🔇"; isMusicPlaying = false; } else { bgMusic.play(); musicToggle.textContent = "🔊"; isMusicPlaying = true; } });
tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
document.getElementById("year-select").addEventListener("change", renderStudents);
document.getElementById("attendance-domain-filter").addEventListener("change", renderStudents);
document.getElementById("save-data-btn").addEventListener("click", saveData);
document.getElementById("add-member-btn").addEventListener("click", addMember);
document.getElementById("remove-member-btn").addEventListener("click", removeMember);
const calMap = { 'open-calendar-btn': 'attendance-date', 'open-calendar-scheduler-btn': 'schedule-date', 'open-calendar-start-btn': 'project-start', 'open-calendar-end-btn': 'project-end' };
Object.keys(calMap).forEach(btnId => { document.getElementById(btnId).addEventListener('click', () => openDatePicker(calMap[btnId])); });
document.getElementById('create-gmeet-btn').addEventListener('click', () => { window.open(`https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(document.getElementById("attendance-subject").value)}&details=${encodeURIComponent(document.getElementById("meeting-summary").value)}`, '_blank'); });

// Initial render to prevent blank dropdowns before fetch
refreshAllDropdowns();