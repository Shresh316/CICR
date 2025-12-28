// --- CORE VARIABLES ---
const currentUser = { id: "ADMIN", name: "Administrator", year: "4th Year", enrollment: "000000" };
let GLOBAL_SECURITY_PIN = localStorage.getItem("cicr_security_pin") || "1407"; 
let ALL_GROUPS = JSON.parse(localStorage.getItem("cicrGroups")) || ["4th Year", "3rd Year", "2nd Year", "1st Year", "Software", "Robotics", "Core"];
const DEFAULT_STUDENTS = [
	"4th Year: Archit Jain (Core) [992100]", "3rd Year: Yasharth (Core) [992101]", "3rd Year: Dhruvi Gupta (Software) [992102]", "3rd Year: Aryan Varshney (Core) [992103]", "2nd Year: Aradhaya (Robotics) [992104]", "2nd Year: Aman (Core) [992105]",
    "1st Year: Divyam Jain (Software) [992106]", "1st Year: Bhuwan Dhanwani (Robotics) [992107]", "1st Year: Kartik Virmani (Software) [992108]", "1st Year: Kshitika Barnwal (Core) [992109]", "1st Year: Kumar Shaurya (Software) [992110]", "1st Year: Vishal Tomar (Robotics) [992111]"
];
let h4_students = JSON.parse(localStorage.getItem("cicrMembers")) || DEFAULT_STUDENTS;
let attendanceState = {};

// --- NEW DATA STRUCTURES ---
// Stores extra details like DOB, Email keyed by "Name" to keep drop-downs simple
let memberDetails = JSON.parse(localStorage.getItem("cicrMemberDetails") || "{}");
let notifications = JSON.parse(localStorage.getItem("cicrNotifications") || "[]");

// --- TEAM DATA STORAGE ---
// Stores who is the head of a domain: { "Robotics": "Name of Student", "Software": "Name..." }
let domainHeads = JSON.parse(localStorage.getItem("cicrDomainHeads") || "{}");
// Stores profile photos: { "Student Name": "URL_OR_BASE64" }
let memberPhotos = JSON.parse(localStorage.getItem("cicrMemberPhotos") || "{}");

// --- SOCIAL FEED VARIABLES ---
const socialFeedKey = "cicrFeed";

// AUDIO ENGINE
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

// --- UTILITY ---
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

// --- NOTIFICATION SYSTEM LOGIC ---
function renderNotifications() {
    const list = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    list.innerHTML = "";
    
    // Sort by newest
    notifications.sort((a,b) => b.id - a.id);
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
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
        li.className = `notif-item ${!n.read ? 'unread' : ''}`;
        
        let icon = "🔔";
        let actionButton = "";

        if(n.type === "birthday") {
            icon = "🎂";
            if(n.metadata && n.metadata.name) {
                const email = n.metadata.email || ""; 
                actionButton = `<button onclick="sendBirthdayWish('${n.metadata.name.replace(/'/g, "\\'")}', '${email}')" style="margin-top:5px; background:var(--color-accent-dim); color:white; border:none; border-radius:4px; padding:4px 8px; font-size:10px; cursor:pointer;">✉️ Send Wish</button>`;
            }
        }
        if(n.type === "equipment") icon = "⚠️";
        if(n.type === "social") icon = "💬";

        li.innerHTML = `
            <div><span class="notif-type-icon">${icon}</span> ${n.text}</div>
            ${actionButton}
            <span class="notif-time">${new Date(n.id).toLocaleDateString()} ${new Date(n.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        list.appendChild(li);
    });
}

function addNotification(text, type = "general", metadata = {}) {
    // Avoid duplicates for things like birthdays today
    const todayStr = new Date().toDateString();
    const isDuplicate = notifications.some(n => n.text === text && new Date(n.id).toDateString() === todayStr);
    
    if(!isDuplicate) {
        notifications.unshift({ id: Date.now(), text, type, read: false, metadata: metadata });
        localStorage.setItem("cicrNotifications", JSON.stringify(notifications));
        renderNotifications();
        AUDIO.play('success'); // Play sound on notification
    }
}

window.clearNotifications = () => {
    notifications = [];
    localStorage.setItem("cicrNotifications", JSON.stringify(notifications));
    renderNotifications();
};

// Toggle Panel
document.getElementById("notif-btn").addEventListener("click", () => {
    const panel = document.getElementById("notif-panel");
    panel.classList.toggle("active");
    
    // Mark all as read when opened
    if(panel.classList.contains("active")) {
        notifications.forEach(n => n.read = true);
        localStorage.setItem("cicrNotifications", JSON.stringify(notifications));
        document.getElementById("notif-badge").style.display = "none";
    }
});

// --- AUTOMATIC CHECKS (Birthday & Equipment) ---
function runSystemChecks() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMatch = `${mm}-${dd}`;
    
    // 1. Birthday Check
    // Iterate through memberDetails object
    for (const [name, details] of Object.entries(memberDetails)) {
        if(details.dob) {
            const dobParts = details.dob.split("-"); // YYYY-MM-DD
            const dobMatch = `${dobParts[1]}-${dobParts[2]}`;
            if(dobMatch === todayMatch) {
                 // Pass Name and Email to Notification
                addNotification(`Happy Birthday to ${name}! 🎂 Send them a wish!`, "birthday", { name: name, email: details.email });
            }
        }
    }

    // 2. Equipment Return Check
    const eqLogs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    eqLogs.forEach(log => {
        const returnDate = new Date(log.returnDate);
        const diffTime = returnDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if(diffDays <= 0) {
            addNotification(`OVERDUE: ${log.name} (Issued to ${log.issuedTo}) was due on ${log.returnDate}.`, "equipment");
        } else if (diffDays <= 2) {
            addNotification(`Reminder: ${log.name} (Issued to ${log.issuedTo}) due in ${diffDays} days.`, "equipment");
        }
    });
}

// --- BIRTHDAY EMAIL FUNCTION ---
window.sendBirthdayWish = (name, email) => {
    const subject = `Happy Birthday ${name}! 🎂`;
    
    const body = `🎉 Happy Birthday ${name}! 🎉

On behalf of the entire CICR family, we extend our warmest birthday wishes to you. Your enthusiasm, dedication, and innovative spirit truly reflect the core values of our club.

May this year bring you exciting projects, successful experiments, endless learning, and of course—fewer bugs and more breakthroughs 😉🤖

Thank you for being an amazing part of CICR. We’re lucky to have you on the team, and we look forward to building, creating, and innovating together in the year ahead.

Wishing you good health, success, and a year full of growth and fun!

Warm regards,
Team CICR 🚀`;

    // Encode the strings for the URL
    const mailtoLink = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
};

// --- TAB & SECURITY LOGIC ---
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
        if (targetTabId === 'history') renderHistory();
        else if (targetTabId === 'reports') {
            try { calculatePersonalReport(); } catch(e) { console.error("Analytics Error", e); }
        }
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

// --- ATTENDANCE HISTORY LOGIC ---
function renderHistory() {
    const list = document.getElementById("history-list");
    const logs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    list.innerHTML = "";
    if (logs.length === 0) { list.innerHTML = '<li style="padding:20px; text-align:center; opacity:0.6;">No attendance records found.</li>'; return; }
    
    logs.forEach(log => {
        const li = document.createElement("li");
        li.className = "history-item";
        const presentCount = log.attendance.filter(s => s.status === "PRESENT").length;
        const totalCount = log.attendance.length;
        const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        
        li.innerHTML = `
            <div class="history-header-wrapper">
                <div style="display:flex; align-items:center;">
                    <input type="checkbox" class="history-checkbox" value="${log.id}">
                    <div class="history-info" onclick="toggleHistoryDetail(${log.id})" style="cursor:pointer;">
                        <span class="history-title">${log.topic}</span>
                        <span class="history-date">${log.date}</span>
                        <span class="history-meta">${presentCount}/${totalCount} Present (${percent}%)</span>
                    </div>
                </div>
                <button class="btn-utility" style="padding:5px 10px; font-size:10px;" onclick="toggleHistoryDetail(${log.id})">EXPAND</button>
            </div>
            <div id="history-detail-${log.id}" class="history-details">
                <h4 style="color:#fff; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">Attendance Sheet</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:5px;">
                    ${log.attendance.map(s => `<div style="font-size:11px; color:${s.status==='PRESENT'?'var(--color-success)':'var(--color-danger)'}">${s.name}</div>`).join('')}
                </div>
            </div>
        `;
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
document.getElementById('export-excel-btn').addEventListener('click', () => {
    const logs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    exportLogsToCSV(logs, 'cicr_all_attendance.csv');
});
document.getElementById('export-selected-btn').addEventListener('click', () => {
    const selectedIds = Array.from(document.querySelectorAll('.history-checkbox:checked')).map(cb => parseInt(cb.value));
    if(!selectedIds.length) return alert("Please select logs to export first.");
    
    const allLogs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const filteredLogs = allLogs.filter(l => selectedIds.includes(l.id));
    exportLogsToCSV(filteredLogs, 'cicr_selected_attendance.csv');
});

function exportLogsToCSV(logs, filename) {
    if(!logs.length) return alert("No data to export.");
    let csv = "Date,Topic,Name,Status\n";
    logs.forEach(l => {
        l.attendance.forEach(s => { csv += `${l.date},"${l.topic}","${s.name}",${s.status}\n`; });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
}

// --- ANALYTICS LOGIC ---
function calculatePersonalReport() {
    const logs = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const stats = {};
    
    // Initialize stats for all known students
    h4_students.forEach(s => {
        const [yearGroup, namePart] = s.split(": ");
        const name = namePart; // Full string after year
        stats[name] = { year: yearGroup, present: 0, total: 0 };
    });

    // Process logs
    if (logs && Array.isArray(logs)) {
        logs.forEach(log => {
            if(log.attendance) {
                log.attendance.forEach(entry => {
                    // Find key by name pattern match as logs store simple names sometimes
                    let key = Object.keys(stats).find(k => k.includes(entry.name));
                    if(!key) {
                         // If student removed or legacy data, create temp entry
                         key = entry.name;
                         if(!stats[key]) stats[key] = { year: "Unknown", present: 0, total: 0 };
                    }
                    stats[key].total++;
                    if(entry.status === "PRESENT") stats[key].present++;
                });
            }
        });
    }

    // Render Tables
    [1, 2, 3, 4].forEach(y => {
        const tbody = document.getElementById(`analytics-body-${y}`);
        if (!tbody) return;
        tbody.innerHTML = "";
        const yearKey = `${y}${y===1?'st':(y===2?'nd':(y===3?'rd':'th'))} Year`;
        
        const yearStudents = Object.entries(stats).filter(([k, v]) => v.year === yearKey);
        
        if(yearStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.5;">No data available.</td></tr>`;
        } else {
            // Sort by percentage descending
            yearStudents.sort((a,b) => {
                const pa = a[1].total ? (a[1].present/a[1].total) : 0;
                const pb = b[1].total ? (b[1].present/b[1].total) : 0;
                return pb - pa;
            });

            yearStudents.forEach(([name, data]) => {
                const pct = data.total === 0 ? 0 : Math.round((data.present / data.total) * 100);
                let color = '#e74c3c';
                if(pct >= 75) color = '#2ecc71';
                else if(pct >= 50) color = '#f1c40f';

                // Extract unit if possible
                let unit = "General";
                if(name.includes("(Software)")) unit = "Software";
                else if(name.includes("(Robotics)")) unit = "Robotics";
                else if(name.includes("(Core)")) unit = "Core";

                const cleanName = name.split(" [")[0];

                const row = `<tr>
                    <td>${cleanName}</td>
                    <td><span class="tech-badge">${unit.toUpperCase()}</span></td>
                    <td>
                        <div style="display:flex; align-items:center;">
                            <span style="width:35px; font-weight:bold; color:${color};">${pct}%</span>
                            <div class="analytics-progress-wrapper"><div class="analytics-progress-fill" style="width:${pct}%; background:${color};"></div></div>
                        </div>
                    </td>
                </tr>`;
                tbody.innerHTML += row;
            });
        }
    });
}

// --- EQUIPMENT LOGIC ---
function renderEquipmentLogs() {
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    const tbody = document.getElementById("equipment-log-body");
    tbody.innerHTML = "";
    if(logs.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; opacity:0.5;">No hardware issued.</td></tr>'; return; }
    
    logs.forEach(item => {
        const row = `<tr>
            <td style="color:var(--color-accent); font-weight:bold;">${item.name}</td>
            <td>${item.issuedTo}<br><span style="font-size:10px; color:#888;">${item.group}</span></td>
            <td>Issued: ${item.issueDate}<br><span style="font-size:10px; color:#e74c3c;">Return: ${item.returnDate}</span></td>
            <td><span class="tech-badge" style="background: rgba(231, 76, 60, 0.1); color: var(--color-danger);">ISSUED</span></td>
            <td style="display:flex; gap:5px;">
                <button class="btn-utility btn-equipment-return" onclick="returnEquipment(${item.id})">RETURN</button>
                <button class="btn-utility" title="Send Reminder Email" style="padding:5px 10px; font-size:16px; border-color:var(--color-tinker); color:var(--color-tinker);" onclick="sendEqReminder('${item.name.replace(/'/g, "\\'")}', '${item.returnDate}')">🔔</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Add new reminder function
window.sendEqReminder = (name, date) => {
    const subject = `Equipment Return Reminder: ${name}`;
    const body = `Hello,\n\nThis is a reminder to return the equipment: ${name}.\nExpected Return Date: ${date}\n\nPlease return it to the lab as soon as possible.\n\nRegards,\nCICR Team`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

document.getElementById("add-equipment-btn").addEventListener("click", () => {
    const name = document.getElementById("eq-name").value;
    const to = document.getElementById("eq-member-select").value;
    const idate = document.getElementById("eq-issue-date").value;
    const rdate = document.getElementById("eq-return-date").value;
    const grp = document.getElementById("eq-group").value;

    if(!name || !to || !idate || !rdate) return alert("All fields are required.");
    
    const logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    logs.unshift({ id: Date.now(), name, issuedTo: to, group: grp, issueDate: idate, returnDate: rdate });
    localStorage.setItem("cicrEquipment", JSON.stringify(logs));
    
    document.getElementById("eq-name").value = "";
    document.getElementById("eq-group").value = "";
    showSuccessAnimation();
    renderEquipmentLogs();
});

window.returnEquipment = (id) => {
    // SECURITY LOCK: Admin PIN required to return
    if(!isAdminUnlocked) {
        securityMessage.textContent = "Admin PIN required to Mark as Returned.";
        securityOverlay.style.display = 'flex';
        securityPinInput.value = ''; 
        securityPinInput.focus();
        pendingAction = () => { window.returnEquipment(id); };
        return;
    }

    if(!confirm("Mark this item as returned?")) return;
    let logs = JSON.parse(localStorage.getItem("cicrEquipment") || "[]");
    logs = logs.filter(x => x.id !== id);
    localStorage.setItem("cicrEquipment", JSON.stringify(logs));
    renderEquipmentLogs();
    showSuccessAnimation();
};

// --- DIRECTORY LOGIC ---
function renderMemberDirectory() {
    const grid = document.getElementById("member-directory-grid");
    const search = document.getElementById("directory-search").value.toLowerCase();
    grid.innerHTML = "";
    
    const filtered = h4_students.filter(s => s.toLowerCase().includes(search));
    document.getElementById("member-count-badge").textContent = filtered.length;
    
    filtered.forEach(s => {
        const [year, rest] = s.split(": ");
        const name = rest.split(" [")[0];
        // Guess domain
        let domain = "Member";
        if(rest.includes("Software")) domain = "Software Unit";
        if(rest.includes("Robotics")) domain = "Robotics Unit";
        if(rest.includes("Core")) domain = "Core Team";
        
        const card = document.createElement("div");
        card.className = "member-card";
        const initial = name.charAt(0);
        
        card.innerHTML = `
            <div class="member-card-photo">${initial}</div>
            <div class="member-card-name">${name}</div>
            <div class="member-card-detail" style="color:var(--color-accent);">${year}</div>
            <div class="member-card-detail">${domain}</div>
            ${isAdminUnlocked ? `<button class="btn-revoke-access" onclick="removeMemberDirectly('${s.replace(/'/g, "\\'")}')">REMOVE USER</button>` : ''}
        `;
        grid.appendChild(card);
    });
}
document.getElementById("directory-search").addEventListener("input", renderMemberDirectory);
window.removeMemberDirectly = (str) => {
    if(confirm(`Permanently remove ${str}?`)) {
        h4_students = h4_students.filter(x => x !== str);
        saveStudents();
        renderMemberDirectory();
    }
};
document.getElementById("export-directory-btn").addEventListener("click", () => {
    let csv = "Year,Name,Raw String\n";
    h4_students.forEach(s => { const [y, n] = s.split(": "); csv += `${y},"${n}","${s}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cicr_member_directory.csv'; a.click();
});


// --- SOCIAL FEED LOGIC ---
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
        const newPost = {
            id: Date.now(),
            author: author.split(":")[1] || author, 
            text,
            image: imgData,
            link,
            likes: 0,
            comments: [],
            pinned: false,
            timestamp: new Date().toISOString()
        };
        posts.unshift(newPost);
        localStorage.setItem(socialFeedKey, JSON.stringify(posts));
        
        // TRIGGER NOTIFICATION
        addNotification(`New Social Post by ${newPost.author}: "${text.substring(0, 20)}..."`, "social");

        document.getElementById('social-text').value = "";
        document.getElementById('social-img-url').value = "";
        document.getElementById('social-img-file').value = "";
        document.getElementById('social-link').value = "";
        showSuccessAnimation();
        renderFeed();
    };

    if (imgType === 'file') {
        const fileInput = document.getElementById('social-img-file');
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if(file.size > 500000) return alert("File too large! Max 500KB. Use Image URL instead.");
            const reader = new FileReader();
            reader.onload = (e) => createPostObj(e.target.result);
            reader.readAsDataURL(file);
        } else {
            createPostObj(null);
        }
    } else {
        const url = document.getElementById('social-img-url').value.trim();
        createPostObj(url || null);
    }
}

function renderFeed() {
    const stream = document.getElementById('feed-stream');
    const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
    stream.innerHTML = "";
    
    // Sort: Pinned first, then by ID (newest)
    posts.sort((a,b) => (b.pinned === a.pinned) ? b.id - a.id : b.pinned - a.pinned);

    if(posts.length === 0) {
        stream.innerHTML = `<div style="text-align:center; opacity:0.5; padding:40px;">No posts yet. Be the first to buzz!</div>`;
        return;
    }

    posts.forEach(post => {
        const date = new Date(post.timestamp).toLocaleString();
        const initial = post.author.charAt(0).toUpperCase();
        
        let commentsHtml = "";
        post.comments.forEach(c => {
            commentsHtml += `<li class="comment-item"><strong>${c.user}</strong>: ${c.text}</li>`;
        });

        const html = `
        <div class="feed-card" id="post-${post.id}">
            ${post.pinned ? `<div class="feed-pin-icon" title="Pinned Post">📌</div>` : ''}
            <div class="feed-admin-controls">
                 <button class="btn-feed-admin btn-feed-pin" onclick="togglePin(${post.id})">${post.pinned ? 'Unpin' : 'Pin'}</button>
                 <button class="btn-feed-admin" onclick="deletePost(${post.id})">✖</button>
            </div>
            <div class="feed-header">
                <div class="feed-avatar">${initial}</div>
                <div class="feed-meta"><h5>${post.author}</h5><span>${date}</span></div>
            </div>
            <div class="feed-content">${post.text}</div>
            ${post.image ? `<img src="${post.image}" class="feed-media" alt="Post Image">` : ''}
            ${post.link ? `<a href="${post.link}" target="_blank" class="feed-link-preview">🔗 ${post.link}</a>` : ''}
            <div class="feed-actions">
                <button class="action-btn" onclick="likePost(${post.id})">❤ ${post.likes} Likes</button>
                <button class="action-btn" onclick="document.getElementById('comments-${post.id}').classList.toggle('active')">💬 ${post.comments.length} Comments</button>
            </div>
            <div class="comment-section" id="comments-${post.id}">
                <ul class="comment-list">${commentsHtml}</ul>
                <div class="comment-input-wrapper">
                    <input type="text" placeholder="Add a comment..." id="input-comment-${post.id}">
                    <button class="btn-utility" style="padding:5px 10px; font-size:10px;" onclick="addComment(${post.id})">POST</button>
                </div>
            </div>
        </div>`;
        stream.innerHTML += html;
    });
}

window.likePost = function(id) {
    const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
    const p = posts.find(x => x.id === id);
    if(p) { p.likes++; localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); }
};

window.addComment = function(id) {
    const input = document.getElementById(`input-comment-${id}`);
    const text = input.value.trim();
    if(!text) return;
    const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
    const p = posts.find(x => x.id === id);
    if(p) {
        p.comments.push({ user: "Member", text }); 
        localStorage.setItem(socialFeedKey, JSON.stringify(posts));
        renderFeed();
    }
};

window.togglePin = function(id) {
    if(!isAdminUnlocked) { 
        securityMessage.textContent = "Admin PIN required to Pin/Unpin posts.";
        securityOverlay.style.display = 'flex'; securityPinInput.value=''; securityPinInput.focus();
        pendingAction = () => { window.togglePin(id); };
        return;
    }
    const posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
    const p = posts.find(x => x.id === id);
    if(p) { p.pinned = !p.pinned; localStorage.setItem(socialFeedKey, JSON.stringify(posts)); renderFeed(); }
};

window.deletePost = function(id) {
    if(!isAdminUnlocked) {
         securityMessage.textContent = "Admin PIN required to Delete posts.";
         securityOverlay.style.display = 'flex'; securityPinInput.value=''; securityPinInput.focus();
         pendingAction = () => { window.deletePost(id); };
         return;
    }
    if(!confirm("Delete this post permanently?")) return;
    let posts = JSON.parse(localStorage.getItem(socialFeedKey) || "[]");
    posts = posts.filter(x => x.id !== id);
    localStorage.setItem(socialFeedKey, JSON.stringify(posts));
    renderFeed();
};
document.getElementById('social-post-btn').addEventListener('click', publishPost);

// --- TEAMS / DOMAINS LOGIC ---

function renderTeams() {
    const grid = document.getElementById("team-display-grid");
    const domainSelect = document.getElementById("team-domain-select");
    const selectedDomain = domainSelect.value || "Software"; // Default
    
    grid.innerHTML = "";
    
    // Filter students by selected domain
    // Logic: Checks if the string contains the domain name. 
    // If domain is "All", shows everyone (but that might be too many), so better to stick to units.
    
    const teamMembers = h4_students.filter(s => {
        if(selectedDomain === "ALL") return true;
        // Check strict domain match or infer from string
        return s.toLowerCase().includes(selectedDomain.toLowerCase());
    });

    if(teamMembers.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No members found in ${selectedDomain} domain.</div>`;
        return;
    }

    // Sort: Head first, then alphabetical
    teamMembers.sort((a, b) => {
        const nameA = a.split(": ")[1].split(" [")[0];
        const nameB = b.split(": ")[1].split(" [")[0];
        const isHeadA = domainHeads[selectedDomain] === nameA;
        const isHeadB = domainHeads[selectedDomain] === nameB;
        if (isHeadA) return -1;
        if (isHeadB) return 1;
        return nameA.localeCompare(nameB);
    });

    teamMembers.forEach(memberStr => {
        // Parse String: "Year: Name (Domain) [ID]"
        // Example: "3rd Year: Dhruvi Gupta (Software) [992102]"
        const parts = memberStr.split(": ");
        const year = parts[0];
        const rest = parts[1];
        
        const name = rest.split(" (")[0].trim(); // "Dhruvi Gupta"
        // Extract ID inside []
        const idMatch = rest.match(/\[(.*?)\]/);
        const enrollment = idMatch ? idMatch[1] : "N/A";
        
        // Check Data
        const isHead = domainHeads[selectedDomain] === name;
        const photoUrl = memberPhotos[name] || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; // Default Placeholder
        
        // Mock Email (Since not in DB, we generate one or leave generic)
        const mockEmail = `${name.split(' ')[0].toLowerCase()}.${enrollment}@jiit.ac.in`;

        // Create Card HTML
        const card = document.createElement("div");
        card.className = `team-card ${isHead ? 'is-head' : ''}`;
        
        card.innerHTML = `
            ${isHead ? `<div class="head-badge">👑 ${selectedDomain} HEAD</div>` : ''}
            
            <a href="mailto:${mockEmail}" class="mail-corner-link" title="Send Email">
                ✉
            </a>

            <div class="team-img-wrapper" onclick="updateMemberPhoto('${name.replace(/'/g, "\\'")}')">
                <img src="${photoUrl}" class="team-img" alt="${name}">
                <div class="img-upload-overlay">📷</div>
            </div>

            <h3 class="team-name">${name}</h3>
            <div class="team-role">${year} • ${enrollment}</div>

            <div class="team-details-box">
                <div class="team-detail-item">
                    <strong>BATCH</strong>
                    <span>2021-25</span>
                </div>
                <div class="team-detail-item">
                    <strong>STATUS</strong>
                    <span style="color:var(--color-success)">ACTIVE</span>
                </div>
            </div>

            ${isAdminUnlocked ? `
            <div class="team-admin-actions" style="display:block">
                <button class="btn-make-head" onclick="toggleDomainHead('${selectedDomain}', '${name.replace(/'/g, "\\'")}')">
                    ${isHead ? 'REMOVE HEAD' : 'MAKE HEAD'}
                </button>
            </div>` : ''}
        `;
        grid.appendChild(card);
    });
}

// Function to populate the dropdown
function populateTeamDropdown() {
    const sel = document.getElementById("team-domain-select");
    sel.innerHTML = "";
    
    // Filter out "Year" groups, keep only actual domains like Software, Robotics, Core
    const domains = ALL_GROUPS.filter(g => !g.includes("Year"));
    
    domains.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d.toUpperCase();
        sel.appendChild(opt);
    });
    
    // Add event listener for change
    sel.onchange = renderTeams;
}

// Action: Toggle Head
window.toggleDomainHead = (domain, name) => {
    if(!isAdminUnlocked) return alert("Security Restriction: Unlock Admin Mode first.");
    
    if (domainHeads[domain] === name) {
        // Remove
        delete domainHeads[domain];
    } else {
        // Set new head (overwrites previous)
        if(confirm(`Promote ${name} to HEAD of ${domain}?`)) {
            domainHeads[domain] = name;
        }
    }
    localStorage.setItem("cicrDomainHeads", JSON.stringify(domainHeads));
    renderTeams();
    showSuccessAnimation();
};

// Action: Update Photo
window.updateMemberPhoto = (name) => {
    // SECURITY LOCK ADDED HERE
    if(!isAdminUnlocked) { 
        securityMessage.textContent = "Admin PIN required to Change Photos.";
        securityOverlay.style.display = 'flex'; 
        securityPinInput.value=''; 
        securityPinInput.focus();
        pendingAction = () => { window.updateMemberPhoto(name); };
        return;
    }

    const url = prompt(`Enter Image URL for ${name}:\n(Or leave empty to reset)`);
    if (url === null) return; // Cancelled
    
    if (url.trim() === "") {
        delete memberPhotos[name];
    } else {
        memberPhotos[name] = url.trim();
    }
    localStorage.setItem("cicrMemberPhotos", JSON.stringify(memberPhotos));
    renderTeams();
};


// --- GENERAL & INIT ---
function updateClock() { const now = new Date(); digitalClock.textContent = `${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })} | ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`; }
function saveStudents() { localStorage.setItem("cicrMembers", JSON.stringify(h4_students)); refreshAllDropdowns(); }
function refreshAllDropdowns() { 
    populateAllMembersDatalist(); 
    populateSchedulingDropdowns(); 
    populateProjectMembersDropdown(); 
    populateGroupSelects(); 
    populateChatSenderSelect();
}

function populateGroupSelects() {
    // Selects to populate with Years
    const yearSelectFilter = document.getElementById("year-select");
    const yearSelectUser = document.getElementById("new-member-year-select");
    const adminYearRemove = document.getElementById("admin-remove-year-select");

    // Selects to populate with Domains
    const domFilter = document.getElementById("attendance-domain-filter"); 
    const newMemGrp = document.getElementById("new-member-group");
    const adminDomRemove = document.getElementById("admin-remove-domain-select");

    // Clear existing
    if(yearSelectFilter) yearSelectFilter.innerHTML = "";
    if(yearSelectUser) yearSelectUser.innerHTML = "";
    if(adminYearRemove) adminYearRemove.innerHTML = '<option value="" disabled selected>-- Select --</option>';

    const currentDomFilterVal = domFilter.value;
    domFilter.innerHTML = '<option value="ALL">All Domains</option>';
    newMemGrp.innerHTML = '';
    adminDomRemove.innerHTML = '<option value="" disabled selected>-- Select --</option>';

    // Sort to keep it tidy
    ALL_GROUPS.sort();

    ALL_GROUPS.forEach(g => {
        if(g.includes("Year")) {
            // It's a year
            if(yearSelectFilter) {
                const opt = document.createElement("option"); opt.value = g; opt.textContent = g; 
                yearSelectFilter.appendChild(opt);
            }
            if(yearSelectUser) {
                const opt = document.createElement("option"); opt.value = g; opt.textContent = g;
                yearSelectUser.appendChild(opt);
            }
            if(adminYearRemove) {
                const opt = document.createElement("option"); opt.value = g; opt.textContent = g;
                adminYearRemove.appendChild(opt);
            }
        } else {
            // It's a domain/group
             const opt1 = document.createElement("option"); opt1.value = g; opt1.textContent = g; domFilter.appendChild(opt1);
             const opt2 = document.createElement("option"); opt2.value = g; opt2.textContent = g.toUpperCase(); newMemGrp.appendChild(opt2);
             const opt3 = document.createElement("option"); opt3.value = g; opt3.textContent = g; adminDomRemove.appendChild(opt3);
        }
    });

    // Restore Filter Selection
    domFilter.value = currentDomFilterVal;

    // Add Custom Option to New Member Group
    const cust = document.createElement('option'); cust.value = "Custom"; cust.textContent = "Custom Unit... (Type New)"; newMemGrp.appendChild(cust);
}

// Toggle Custom Input
window.toggleCustomGroupInput = function(select) {
    const wrapper = document.getElementById("custom-group-input-wrapper");
    if(select.value === "Custom") {
        wrapper.style.display = "block";
        document.getElementById("custom-group-input").focus();
    } else {
        wrapper.style.display = "none";
    }
};

// --- ADMIN YEAR MANAGEMENT ---
document.getElementById("admin-add-year-btn").addEventListener("click", () => {
    let val = document.getElementById("admin-add-year-input").value.trim();
    if(!val) return alert("Enter year name.");
    // Auto-append 'Year' if missing for consistency
    if(!val.toLowerCase().includes("year")) val += " Year";
    
    if(ALL_GROUPS.includes(val)) return alert("Year already exists.");
    ALL_GROUPS.push(val);
    localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS));
    populateGroupSelects();
    document.getElementById("admin-add-year-input").value = "";
    showSuccessAnimation();
});
document.getElementById("admin-remove-year-btn").addEventListener("click", () => {
    const val = document.getElementById("admin-remove-year-select").value;
    if(!val) return;
    if(!confirm(`Remove "${val}"? Members assigned to this year will remain but filtering may break.`)) return;
    ALL_GROUPS = ALL_GROUPS.filter(g => g !== val);
    localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS));
    populateGroupSelects();
});

// --- ADMIN DOMAIN MANAGEMENT ---
document.getElementById("admin-add-domain-btn").addEventListener("click", () => {
    const val = document.getElementById("admin-add-domain-input").value.trim();
    if(!val) return alert("Enter domain name.");
    if(val.toLowerCase().includes("year")) return alert("Domain name cannot contain 'Year'. Use the Year manager.");
    
    if(ALL_GROUPS.includes(val)) return alert("Domain already exists.");
    ALL_GROUPS.push(val);
    localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS));
    populateGroupSelects();
    document.getElementById("admin-add-domain-input").value = "";
    showSuccessAnimation();
});
document.getElementById("admin-remove-domain-btn").addEventListener("click", () => {
    const val = document.getElementById("admin-remove-domain-select").value;
    if(!val) return;
    if(!confirm(`Remove Domain "${val}"?`)) return;
    ALL_GROUPS = ALL_GROUPS.filter(g => g !== val);
    localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS));
    populateGroupSelects();
});

function populateAllMembersDatalist() {
    allMembersDatalist.innerHTML = ''; h4_students.forEach(s => { const opt = document.createElement("option"); opt.value = s.includes(": ") ? s.split(": ")[1] : s; allMembersDatalist.appendChild(opt); });
    
    // Also populate remove select
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
    h4_students.forEach(s => { 
        const n = s.includes(": ") ? s.split(": ")[1] : s;
        const simpleName = n.split(" [")[0];
        const opt = document.createElement("option"); 
        opt.value = simpleName; 
        opt.textContent = simpleName; 
        sel.appendChild(opt); 
    });
}

function handleTopicChange() { const s = document.getElementById("attendance-subject"); document.getElementById("custom-topic-input").style.display = s.value === "Other" ? "block" : "none"; document.getElementById("current-subject-display").textContent = s.value === "Other" && document.getElementById("custom-topic-input").value ? document.getElementById("custom-topic-input").value : s.options[s.selectedIndex].textContent; }

// --- UPDATED ADD MEMBER FUNCTION WITH WHATSAPP LINK ---
function addMember() {
    const name = document.getElementById("new-member-name").value.trim(); 
    const email = document.getElementById("new-member-email").value.trim(); 
    const phone = document.getElementById("new-member-phone").value.trim();
    const batch = document.getElementById("new-member-batch").value.trim();
    const enroll = document.getElementById("new-member-enrollment").value.trim();
    const dob = document.getElementById("new-member-dob").value;

    if (!name || !email || !phone || !batch || !enroll) return alert("All text fields are mandatory.");
    
    if (!validateEmail(email)) return alert("Invalid Email Address format.");
    if (!/^\d{10}$/.test(phone)) return alert("Mobile Number must be exactly 10 digits.");

    let domain = document.getElementById("new-member-group").value; 
    if (domain === "Custom") domain = document.getElementById("custom-group-input").value.trim();
    
    if (!domain) return alert("Please specify a Domain/Unit.");

    if (!ALL_GROUPS.includes(domain)) { 
        ALL_GROUPS.push(domain); 
        localStorage.setItem("cicrGroups", JSON.stringify(ALL_GROUPS)); 
        populateGroupSelects(); 
    }
    
    const memberKey = `${document.getElementById("new-member-year-select").value}: ${name} (${domain})`;
    if (h4_students.some(s => s.toLowerCase() === memberKey.toLowerCase())) return alert(`User exists.`);
    
    operateGate(() => { 
        // Save Basic Info to List
        h4_students.push(memberKey); 
        h4_students.sort(); 
        saveStudents(); 

        // Save Extended Info (DOB/Email) to Object
        memberDetails[name] = { dob: dob, email: email, phone: phone };
        localStorage.setItem("cicrMemberDetails", JSON.stringify(memberDetails));

        showSuccessAnimation(); 
        
        // --- TRIGGER WELCOME EMAIL WITH WHATSAPP LINK ---
        const subject = "Welcome to CICR Team";
        
        // Updated body with the WhatsApp link
        const body = `Hello ${name},\n\nWelcome to the Centre for Innovation & Creativity in Robotics (CICR)!\n\nPlease join our official WhatsApp Group here:\nhttps://chat.whatsapp.com/K86rBBwgB6jBsP3am3Oatx\n\nRegards,\nCICR Admin`;
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

function removeMember() { const m = document.getElementById("remove-member-select").value; if(!m) return; const f = h4_students.find(s => s.includes(m)); if(f) { h4_students = h4_students.filter(s => s!==f); saveStudents(); alert("Removed."); } }

function renderStudents() {
    const list = document.getElementById("attendance-list"); list.innerHTML = ""; attendanceState = {};
    const ys = Array.from(document.getElementById("year-select").selectedOptions).map(o => o.value);
    const df = document.getElementById("attendance-domain-filter").value;
    
    // Default to show all if nothing selected
    const yearsToRender = ys.length ? ys : ["4th Year", "3rd Year", "2nd Year", "1st Year"];
    
    const filtered = h4_students.filter(s => { const [y, r] = s.split(": "); return yearsToRender.includes(y) && (df === "ALL" || s.includes(`(${df})`)); }).sort();
    
    if (!filtered.length) { list.innerHTML = `<li style="padding:15px; opacity:0.7;">No users found.</li>`; return; }
    
    filtered.forEach(s => {
        const [r, n] = s.split(": "); 
        // Initial state is unmarked (not in attendanceState)
        const id = s.replace(/[^a-zA-Z0-9]/g, "_");
        const li = document.createElement("li"); li.className = "student-item unmarked"; li.id = id;
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

            if(isUnmark) {
                delete attendanceState[k]; // Remove from tracking
                li.className = "student-item unmarked";
            } else {
                attendanceState[k] = isPresent ? "PRESENT" : "ABSENT";
                li.className = `student-item ${isPresent ? 'present' : 'absent'}`;
            }
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
function saveData() {
    // LOCK: Admin PIN required to save
    if(!isAdminUnlocked) {
        securityMessage.textContent = "Admin PIN required to SAVE Attendance Log.";
        securityOverlay.style.display = 'flex';
        securityPinInput.value = ''; 
        securityPinInput.focus();
        pendingAction = () => { saveData(); }; // Retry after unlock
        return;
    }

    if(!document.getElementById("attendance-date").value) return alert("Select Date.");
    if(Object.keys(attendanceState).length === 0) {
        if(!confirm("No students marked Present or Absent. Save empty log?")) return;
    }
    
    operateGate(() => {
        const h = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
        h.unshift({ id: Date.now(), date: document.getElementById("attendance-date").value, topic: document.getElementById("attendance-subject").value, attendance: Object.keys(attendanceState).map(k=>({name:k.split(": ")[1], group:k.split(": ")[0], status:attendanceState[k]})) });
        localStorage.setItem("attendanceHistory", JSON.stringify(h)); showSuccessAnimation();
    });
}

// --- SHELF LOGIC ---
function loadProjects() { return JSON.parse(localStorage.getItem("cicrProjects") || "[]"); }
function renderProjects() {
    const p = loadProjects(); const l = document.getElementById("live-projects-list"); l.innerHTML = "";
    if(!p.length) { l.innerHTML = '<p style="opacity:0.6;">Empty.</p>'; return; }
    p.forEach(x => { 
        l.innerHTML += `<div class="project-card"><h4>${x.name}</h4><p class="project-info">${x.purpose}</p><span class="project-tech-tag">${x.type}</span><button class="btn-delete-project" onclick="deleteProject(${x.id})">DEL</button></div>`; 
    });
}
window.deleteProject = (id) => { 
    if(!confirm("Delete Project?")) return;
    const p = loadProjects().filter(x=>x.id!==id); localStorage.setItem("cicrProjects", JSON.stringify(p)); renderProjects(); 
};
document.getElementById("add-project-btn").addEventListener("click", () => {
    const n = document.getElementById("project-name").value; 
    const start = document.getElementById("project-start").value;
    if(!n) return alert("Title required.");
    if(!start) return alert("Start Date required.");
    const p = loadProjects(); p.push({ id: Date.now(), name: n, purpose: document.getElementById("project-purpose").value, type: document.getElementById("project-type").value });
    localStorage.setItem("cicrProjects", JSON.stringify(p)); showSuccessAnimation(); renderProjects();
});

// --- CHAT LOGIC ---
function loadChat() { const c = JSON.parse(localStorage.getItem("cicrChat") || "[]"); const d = document.getElementById("chat-display"); d.innerHTML = c.map(m=>`<div class="chat-message ${m.sender==='ME'?'msg-self':'msg-other'}"><span class="msg-meta">${m.sender}</span>${m.text}</div>`).join(""); }
function scrollChat() { const d = document.getElementById("chat-display"); d.scrollTop = d.scrollHeight; }
function postMessage() {
    const t = document.getElementById("chat-input").value; if(!t) return;
    const sender = document.getElementById("chat-sender-select").value || "ME";
    const c = JSON.parse(localStorage.getItem("cicrChat") || "[]"); c.push({sender: sender, text:t}); localStorage.setItem("cicrChat", JSON.stringify(c)); document.getElementById("chat-input").value=""; loadChat(); scrollChat();
}
document.getElementById("chat-send-btn").addEventListener("click", postMessage);

// --- SCHEDULING LOGIC ---
document.getElementById("schedule-meeting-btn").addEventListener("click", () => {
    const senderEmail = document.getElementById("sender-email").value;
    const manualRecipient = document.getElementById("recipient-email").value;
    const subject = document.getElementById("schedule-subject").value;
    const date = document.getElementById("schedule-date").value;
    const time = document.getElementById("schedule-time").value;
    const location = document.getElementById("schedule-location-type").value;
    const details = document.getElementById("schedule-location-details").value;
    
    // Get multiple selected recipients
    const select = document.getElementById("schedule-recipient-select");
    const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);
    
    if(!subject || !date) return alert("Subject and Date are required.");
    
    // Construct body with list of selected members since we can't auto-fill emails
    let body = `Meeting Invitation\n\nSubject: ${subject}\nWhen: ${date} at ${time}\nWhere: ${location} - ${details}\n\n`;
    
    if (selectedOptions.length > 0) {
        body += `Invited Members:\n${selectedOptions.join('\n')}\n\n`;
    }
    
    // Use manual recipient for the 'to' field, others in body
    const toField = manualRecipient ? manualRecipient : "";
    
    window.location.href = `mailto:${toField}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});


// Update PIN Securely
document.getElementById("update-pin-btn").addEventListener("click", () => {
    const currentInput = document.getElementById('current-security-pin-verify').value;
    const newPin = document.getElementById('new-security-pin').value;
    
    if(currentInput !== GLOBAL_SECURITY_PIN) return alert("ERROR: Current PIN is incorrect. Cannot update.");
    if(newPin.length !== 4) return alert("New PIN must be 4 digits.");
    
    GLOBAL_SECURITY_PIN = newPin;
    localStorage.setItem("cicr_security_pin", newPin);
    alert("Security PIN Updated Successfully.");
    document.getElementById('current-security-pin-verify').value = '';
    document.getElementById('new-security-pin').value = '';
});

// --- STARTUP SEQUENCE ---
setInterval(updateClock, 1000); updateClock();
splashScreen.addEventListener('click', () => { 
    AUDIO.play('click'); 
    splashScreen.style.opacity = '0'; 
    setTimeout(() => { 
        splashScreen.style.display = 'none'; 
        operateGate(() => { 
            appContent.style.display = 'block'; 
            refreshAllDropdowns(); 
            // Select year default to show initial list
            const ySelect = document.getElementById("year-select");
            if(ySelect.options.length > 0) ySelect.options[0].selected = true;
            renderStudents();
            
            // Notification System Checks
            runSystemChecks();
            renderNotifications();

            const savedTab = sessionStorage.getItem("cicr_active_tab"); 
            if(savedTab) switchTab(savedTab, false);
            else switchTab('attendance'); 
        }); 
    }, 500); 
    
    // Play music on init
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Audio play failed:", e));
});

// Music Toggle Logic
let isMusicPlaying = true;
musicToggle.addEventListener('click', () => {
    if(isMusicPlaying) {
        bgMusic.pause();
        musicToggle.textContent = "🔇";
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        musicToggle.textContent = "🔊";
        isMusicPlaying = true;
    }
});

tabLinks.forEach(link => link.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'))));
document.getElementById("year-select").addEventListener("change", renderStudents);
document.getElementById("attendance-domain-filter").addEventListener("change", renderStudents);
document.getElementById("save-data-btn").addEventListener("click", saveData);
document.getElementById("add-member-btn").addEventListener("click", addMember);
document.getElementById("remove-member-btn").addEventListener("click", removeMember);

// Fix Calendar Buttons with reliable fallback
const calMap = {
    'open-calendar-btn': 'attendance-date',
    'open-calendar-scheduler-btn': 'schedule-date',
    'open-calendar-start-btn': 'project-start',
    'open-calendar-end-btn': 'project-end'
};
Object.keys(calMap).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => openDatePicker(calMap[btnId]));
});

document.getElementById('create-gmeet-btn').addEventListener('click', () => { window.open(`https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(document.getElementById("attendance-subject").value)}&details=${encodeURIComponent(document.getElementById("meeting-summary").value)}`, '_blank'); });

// Initial Load check
refreshAllDropdowns();