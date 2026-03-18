// ==================== DATA STORE ====================
const store = {
  // Progress
  waterCount: parseInt(localStorage.getItem('waterCount') || '0'),
  waterHistory: JSON.parse(localStorage.getItem('waterHistory') || '[]'),
  pomodoroSessions: parseInt(localStorage.getItem('pomodoroSessions') || '0'),
  totalFocusMinutes: parseInt(localStorage.getItem('totalFocusMinutes') || '0'),
  breathingCycles: parseInt(localStorage.getItem('breathingCycles') || '0'),
  medicinesTaken: parseInt(localStorage.getItem('medicinesTaken') || '0'),
  
  // Lists
  medicines: JSON.parse(localStorage.getItem('medicines') || '[]'),
  alarms: JSON.parse(localStorage.getItem('alarms') || '[]'),
  
  // Settings
  smartFocus: localStorage.getItem('smartFocus') === 'true',
  
  // Reminder states
  reminders: JSON.parse(localStorage.getItem('reminders') || JSON.stringify({
    blink: false,
    '20-20-20': false,
    posture: false,
    standUp: false,
    stretch: false,
    water: false
  }))
};

function saveStore() {
  localStorage.setItem('waterCount', store.waterCount.toString());
  localStorage.setItem('waterHistory', JSON.stringify(store.waterHistory));
  localStorage.setItem('pomodoroSessions', store.pomodoroSessions.toString());
  localStorage.setItem('totalFocusMinutes', store.totalFocusMinutes.toString());
  localStorage.setItem('breathingCycles', store.breathingCycles.toString());
  localStorage.setItem('medicinesTaken', store.medicinesTaken.toString());
  localStorage.setItem('medicines', JSON.stringify(store.medicines));
  localStorage.setItem('alarms', JSON.stringify(store.alarms));
  localStorage.setItem('smartFocus', store.smartFocus.toString());
  localStorage.setItem('reminders', JSON.stringify(store.reminders));
}

// ==================== UTILITY FUNCTIONS ====================
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notifications enabled!');
        updateNotificationIndicator();
      }
    });
  }
}

function sendNotification(title, body, icon) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="%232dd4bf"/></svg>'
    });
  }
}

function updateNotificationIndicator() {
  const indicator = document.getElementById('notificationIndicator');
  const hasActiveReminders = Object.values(store.reminders).some(v => v) || store.medicines.length > 0;
  if (hasActiveReminders || ('Notification' in window && Notification.permission === 'granted')) {
    indicator.classList.add('active');
  } else {
    indicator.classList.remove('active');
  }
}

// ==================== TAB NAVIGATION ====================
const navItems = document.querySelectorAll('.nav-item[data-tab], .dropdown-menu button[data-tab]');
const dropdownItems = document.querySelectorAll('.dropdown-menu button');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const tabId = item.dataset.tab;
    if (!tabId) return;
    
    // Update active states
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const mainNavItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (mainNavItem) mainNavItem.classList.add('active');
    
    // Show correct tab
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });

    // Close mobile menu after selection
    const mainNav = document.getElementById('mainNav');
    if (mainNav && window.innerWidth <= 900) {
      mainNav.classList.remove('active');
    }
  });
});

// ==================== MOBILE MENU ====================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');

if (mobileMenuToggle && mainNav) {
  mobileMenuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
  });
}

// ==================== NOTIFICATION PANEL ====================
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const closePanel = document.getElementById('closePanel');

notificationBtn.addEventListener('click', () => {
  notificationPanel.classList.add('open');
  updateNotificationPanel();
});

closePanel.addEventListener('click', () => {
  notificationPanel.classList.remove('open');
});

function updateNotificationPanel() {
  const upcomingList = document.getElementById('upcomingList');
  const activeList = document.getElementById('activeList');
  
  let upcomingHTML = '';
  let activeHTML = '';
  
  // Add medicines to upcoming
  store.medicines.forEach(med => {
    upcomingHTML += `
      <li class="reminder-item">
        <div class="reminder-icon health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>
          </svg>
        </div>
        <div class="reminder-content">
          <div class="reminder-title">${med.name} - ${med.dosage}</div>
          <div class="reminder-time">${med.time} (${med.frequency})</div>
        </div>
      </li>
    `;
  });
  
  // Add alarms to upcoming
  store.alarms.forEach(alarm => {
    if (!alarm.triggered) {
      upcomingHTML += `
        <li class="reminder-item">
          <div class="reminder-icon wellness">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="reminder-content">
            <div class="reminder-title">${alarm.label}</div>
            <div class="reminder-time">${alarm.time}</div>
          </div>
        </li>
      `;
    }
  });
  
  // Build active list
  if (store.reminders['20-20-20']) {
    activeHTML += '<li><span class="status-dot active"></span> Eye 20-20-20 Rule - Active</li>';
  }
  if (store.reminders.blink) {
    activeHTML += '<li><span class="status-dot active"></span> Blink Reminder - Every 10 min</li>';
  }
  if (store.reminders.posture) {
    activeHTML += '<li><span class="status-dot active"></span> Posture Check - Active</li>';
  }
  if (store.reminders.standUp) {
    activeHTML += '<li><span class="status-dot active"></span> Stand Up Reminder - Active</li>';
  }
  if (store.reminders.stretch) {
    activeHTML += '<li><span class="status-dot active"></span> Desk Stretches - Active</li>';
  }
  if (store.reminders.water) {
    activeHTML += '<li><span class="status-dot active"></span> Water Reminder - Active</li>';
  }
  if (pomodoroRunning) {
    activeHTML += '<li><span class="status-dot active"></span> Pomodoro - Running</li>';
  }
  
  upcomingList.innerHTML = upcomingHTML || '<li class="empty-state">No upcoming reminders</li>';
  activeList.innerHTML = activeHTML || '<li class="empty-state">No active reminders</li>';
}

// ==================== DASHBOARD ====================
function updateDashboard() {
  // Update progress ring
  let progress = 0;
  progress += (store.waterCount / 8) * 30;
  progress += Math.min(store.pomodoroSessions, 4) * 15;
  progress += (store.medicines.length > 0 ? store.medicinesTaken / store.medicines.length : 0) * 25;
  progress += (store.breathingCycles > 0 ? 30 : 0);
  progress = Math.min(progress, 100);
  
  const progressRing = document.getElementById('dailyProgressRing');
  const circumference = 534;
  progressRing.style.strokeDashoffset = circumference - (progress / 100) * circumference;
  document.getElementById('dailyProgressValue').textContent = Math.round(progress) + '%';
  
  // Update stats
  document.getElementById('statWater').textContent = `${store.waterCount}/8`;
  document.getElementById('statPomodoro').textContent = store.pomodoroSessions;
  document.getElementById('statMedicine').textContent = store.medicinesTaken;
  
  // Update quick cards
  document.getElementById('quickWaterCount').textContent = store.waterCount;
  document.getElementById('sessionsCompleted').textContent = store.pomodoroSessions;
  document.getElementById('totalFocusTime').textContent = store.totalFocusMinutes;
  
  // Update toggle states
  document.getElementById('toggleBlink').checked = store.reminders.blink;
  document.getElementById('togglePosture').checked = store.reminders.posture;
  document.getElementById('toggleStandUp').checked = store.reminders.standUp;
  document.getElementById('smartFocusToggle').checked = store.smartFocus;
  
  updateSmartFocusStatus();
  updateNotificationIndicator();
}

function updateSmartFocusStatus() {
  const status = document.getElementById('focusStatus');
  const dot = status.querySelector('.status-dot');
  const text = status.querySelector('.status-text');
  
  if (store.smartFocus && pomodoroRunning) {
    dot.classList.add('active');
    text.textContent = 'Active - Non-critical nudges paused during focus';
  } else if (store.smartFocus) {
    dot.classList.add('active');
    text.textContent = 'Ready - Will pause nudges during focus sessions';
  } else {
    dot.classList.remove('active');
    text.textContent = 'Inactive - All nudges active';
  }
}

// Smart Focus Toggle
document.getElementById('smartFocusToggle').addEventListener('change', (e) => {
  store.smartFocus = e.target.checked;
  saveStore();
  updateSmartFocusStatus();
  showToast(e.target.checked ? 'Smart Focus enabled' : 'Smart Focus disabled');
});

// ==================== WATER TRACKER ====================
function updateWaterDisplay() {
  document.getElementById('waterCountLarge').textContent = store.waterCount;
  document.getElementById('quickWaterCount').textContent = store.waterCount;
  
  const dropsContainer = document.getElementById('waterDrops');
  dropsContainer.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    const drop = document.createElement('div');
    drop.className = `water-drop ${i < store.waterCount ? 'filled' : ''}`;
    if (i < store.waterCount) {
      drop.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>';
    }
    drop.addEventListener('click', () => {
      store.waterCount = i + 1;
      const now = new Date();
      store.waterHistory.push(now.toLocaleTimeString());
      saveStore();
      updateWaterDisplay();
      updateDashboard();
    });
    dropsContainer.appendChild(drop);
  }
  
  const historyList = document.getElementById('waterHistoryList');
  if (store.waterHistory.length > 0) {
    historyList.innerHTML = store.waterHistory.slice(-5).reverse().map(t => 
      `<li>Water logged at ${t}</li>`
    ).join('');
  } else {
    historyList.innerHTML = '<li class="empty-state">No water logged yet</li>';
  }
}

document.getElementById('addWaterBtn').addEventListener('click', () => {
  if (store.waterCount < 8) {
    store.waterCount++;
    const now = new Date();
    store.waterHistory.push(now.toLocaleTimeString());
    saveStore();
    updateWaterDisplay();
    updateDashboard();
    showToast('Water logged!');
  } else {
    showToast('Daily goal reached!');
  }
});

document.getElementById('removeWaterBtn').addEventListener('click', () => {
  if (store.waterCount > 0) {
    store.waterCount--;
    saveStore();
    updateWaterDisplay();
    updateDashboard();
  }
});

document.getElementById('resetWaterBtn').addEventListener('click', () => {
  store.waterCount = 0;
  store.waterHistory = [];
  saveStore();
  updateWaterDisplay();
  updateDashboard();
  showToast('Water count reset');
});

// Water reminder
let waterReminderInterval = null;
document.getElementById('waterRemindBtn').addEventListener('click', function() {
  if (store.reminders.water) {
    clearInterval(waterReminderInterval);
    store.reminders.water = false;
    this.textContent = 'Start Reminders';
    showToast('Water reminders stopped');
  } else {
    const interval = parseInt(document.getElementById('waterInterval').value) * 60000;
    waterReminderInterval = setInterval(() => {
      sendNotification('Hydration Reminder', 'Time to drink a glass of water!');
    }, interval);
    store.reminders.water = true;
    this.textContent = 'Stop Reminders';
    showToast('Water reminders started');
  }
  saveStore();
  updateNotificationPanel();
});

// Quick water add
document.getElementById('quickAddWater').addEventListener('click', () => {
  document.getElementById('addWaterBtn').click();
});

// ==================== POMODORO TIMER ====================
let pomodoroTime = 25 * 60;
let pomodoroTotalTime = 25 * 60;
let pomodoroRunning = false;
let pomodoroInterval = null;

function updatePomodoroDisplay() {
  document.getElementById('pomodoroDisplay').textContent = formatTime(pomodoroTime);
  document.getElementById('quickTimerDisplay').textContent = formatTime(pomodoroTime);
  
  const ring = document.getElementById('pomodoroRing');
  const circumference = 691;
  const progress = (pomodoroTotalTime - pomodoroTime) / pomodoroTotalTime;
  ring.style.strokeDashoffset = progress * circumference;
}

// Duration buttons
document.querySelectorAll('.duration-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (pomodoroRunning) return;
    
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const duration = parseInt(this.dataset.duration);
    pomodoroTime = duration * 60;
    pomodoroTotalTime = duration * 60;
    
    document.getElementById('pomodoroLabel').textContent = duration === 5 ? 'Break Time' : 'Focus Time';
    updatePomodoroDisplay();
  });
});

document.getElementById('pomodoroStart').addEventListener('click', startPomodoro);
document.getElementById('quickStartPomodoro').addEventListener('click', startPomodoro);

function startPomodoro() {
  if (pomodoroRunning) return;
  
  pomodoroRunning = true;
  
  document.getElementById('pomodoroStart').textContent = 'Running...';
  document.getElementById('pomodoroStart').disabled = true;
  document.getElementById('pomodoroPause').disabled = false;
  document.getElementById('quickStartPomodoro').textContent = 'Running...';
  document.getElementById('quickStartPomodoro').disabled = true;
  
  updateSmartFocusStatus();
  updateNotificationPanel();
  
  pomodoroInterval = setInterval(() => {
    pomodoroTime--;
    updatePomodoroDisplay();
    
    if (pomodoroTime <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      
      store.pomodoroSessions++;
      store.totalFocusMinutes += Math.round(pomodoroTotalTime / 60);
      saveStore();
      
      sendNotification('Pomodoro Complete', 'Great work! Time for a break.');
      showToast('Session complete!');
      
      document.getElementById('pomodoroStart').textContent = 'Start';
      document.getElementById('pomodoroStart').disabled = false;
      document.getElementById('pomodoroPause').disabled = true;
      document.getElementById('quickStartPomodoro').textContent = 'Start Focus';
      document.getElementById('quickStartPomodoro').disabled = false;
      
      // Reset timer
      pomodoroTime = pomodoroTotalTime;
      updatePomodoroDisplay();
      updateDashboard();
      updateSmartFocusStatus();
      updateNotificationPanel();
    }
  }, 1000);
}

document.getElementById('pomodoroPause').addEventListener('click', () => {
  if (pomodoroRunning) {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    document.getElementById('pomodoroStart').textContent = 'Resume';
    document.getElementById('pomodoroStart').disabled = false;
    document.getElementById('pomodoroPause').disabled = true;
    document.getElementById('quickStartPomodoro').textContent = 'Resume';
    document.getElementById('quickStartPomodoro').disabled = false;
    updateSmartFocusStatus();
    updateNotificationPanel();
  }
});

document.getElementById('pomodoroReset').addEventListener('click', () => {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroTime = pomodoroTotalTime;
  updatePomodoroDisplay();
  document.getElementById('pomodoroStart').textContent = 'Start';
  document.getElementById('pomodoroStart').disabled = false;
  document.getElementById('pomodoroPause').disabled = true;
  document.getElementById('quickStartPomodoro').textContent = 'Start Focus';
  document.getElementById('quickStartPomodoro').disabled = false;
  updateSmartFocusStatus();
  updateNotificationPanel();
});

// ==================== QUICK ALARM ====================
document.getElementById('quickSetAlarm').addEventListener('click', () => {
  const minutes = parseInt(document.getElementById('quickAlarmMinutes').value);
  if (!minutes || minutes < 1) {
    showToast('Please enter valid minutes');
    return;
  }
  
  setQuickAlarm('Quick Alarm', minutes);
  document.getElementById('quickAlarmMinutes').value = '';
});

document.getElementById('setAlarmBtn').addEventListener('click', () => {
  const label = document.getElementById('alarmLabel').value || 'Reminder';
  const time = document.getElementById('alarmTime').value;
  const minutes = parseInt(document.getElementById('alarmMinutes').value);
  
  if (minutes && minutes > 0) {
    setQuickAlarm(label, minutes);
  } else if (time) {
    setTimeAlarm(label, time);
  } else {
    showToast('Please set a time or duration');
    return;
  }
  
  document.getElementById('alarmLabel').value = '';
  document.getElementById('alarmTime').value = '';
  document.getElementById('alarmMinutes').value = '';
});

function setQuickAlarm(label, minutes) {
  const triggerTime = new Date(Date.now() + minutes * 60000);
  const alarm = {
    id: Date.now(),
    label,
    time: triggerTime.toLocaleTimeString(),
    triggerAt: triggerTime.getTime(),
    triggered: false
  };
  
  store.alarms.push(alarm);
  saveStore();
  renderAlarms();
  showToast(`Alarm set for ${minutes} minutes`);
  updateNotificationPanel();
}

function setTimeAlarm(label, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const triggerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
  if (triggerTime <= now) {
    triggerTime.setDate(triggerTime.getDate() + 1);
  }
  
  const alarm = {
    id: Date.now(),
    label,
    time: triggerTime.toLocaleTimeString(),
    triggerAt: triggerTime.getTime(),
    triggered: false
  };
  
  store.alarms.push(alarm);
  saveStore();
  renderAlarms();
  showToast(`Alarm set for ${triggerTime.toLocaleTimeString()}`);
  updateNotificationPanel();
}

function renderAlarms() {
  const container = document.getElementById('alarmsList');
  const activeAlarms = store.alarms.filter(a => !a.triggered);
  
  if (activeAlarms.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = activeAlarms.map(alarm => `
    <div class="alarm-item">
      <div class="alarm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </div>
      <div class="alarm-details">
        <div class="alarm-label">${alarm.label}</div>
        <div class="alarm-time">${alarm.time}</div>
      </div>
      <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function deleteAlarm(id) {
  store.alarms = store.alarms.filter(a => a.id !== id);
  saveStore();
  renderAlarms();
  updateNotificationPanel();
  showToast('Alarm deleted');
}

// ==================== MEDICINE REMINDER ====================
document.getElementById('addMedicineBtn').addEventListener('click', () => {
  const name = document.getElementById('medName').value.trim();
  const dosage = document.getElementById('medDosage').value.trim();
  const time = document.getElementById('medTime').value;
  const frequency = document.getElementById('medFrequency').value;
  
  if (!name || !dosage || !time) {
    showToast('Please fill in all fields');
    return;
  }
  
  store.medicines.push({ id: Date.now(), name, dosage, time, frequency });
  saveStore();
  renderMedicines();
  updateDashboard();
  updateNotificationPanel();
  
  document.getElementById('medName').value = '';
  document.getElementById('medDosage').value = '';
  document.getElementById('medTime').value = '';
  
  showToast('Medicine reminder added');
});

function renderMedicines() {
  const container = document.getElementById('medicineList');
  
  if (store.medicines.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = store.medicines.map(med => `
    <div class="medicine-item">
      <div class="medicine-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>
        </svg>
      </div>
      <div class="medicine-details">
        <div class="medicine-name">${med.name}</div>
        <div class="medicine-meta">${med.dosage} - ${med.time} (${med.frequency})</div>
      </div>
      <button class="delete-btn" onclick="deleteMedicine(${med.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function deleteMedicine(id) {
  store.medicines = store.medicines.filter(m => m.id !== id);
  saveStore();
  renderMedicines();
  updateDashboard();
  updateNotificationPanel();
  showToast('Medicine removed');
}

document.getElementById('enableNotifBtn').addEventListener('click', requestNotificationPermission);

// ==================== BOX BREATHING ====================
let breathingRunning = false;
let breathingInterval = null;
let currentBreathingPhase = 0;

const breathingPhases = [
  { name: 'Inhale', className: 'inhale' },
  { name: 'Hold', className: 'hold' },
  { name: 'Exhale', className: 'exhale' },
  { name: 'Hold', className: '' }
];

function runBreathingPhase() {
  const phase = breathingPhases[currentBreathingPhase];
  const box = document.getElementById('breathingBox');
  const text = document.getElementById('breathingText');
  
  box.className = 'breathing-box ' + phase.className;
  text.textContent = phase.name;
  
  currentBreathingPhase++;
  if (currentBreathingPhase >= breathingPhases.length) {
    currentBreathingPhase = 0;
    store.breathingCycles++;
    saveStore();
    document.getElementById('breathingCycles').textContent = store.breathingCycles;
    updateDashboard();
  }
}

document.getElementById('startBreathing').addEventListener('click', () => {
  if (!breathingRunning) {
    breathingRunning = true;
    currentBreathingPhase = 0;
    runBreathingPhase();
    breathingInterval = setInterval(runBreathingPhase, 4000);
    document.getElementById('startBreathing').textContent = 'Running...';
    document.getElementById('startBreathing').disabled = true;
    document.getElementById('stopBreathing').disabled = false;
  }
});

document.getElementById('stopBreathing').addEventListener('click', () => {
  if (breathingRunning) {
    clearInterval(breathingInterval);
    breathingRunning = false;
    document.getElementById('breathingBox').className = 'breathing-box';
    document.getElementById('breathingText').textContent = 'Ready';
    document.getElementById('startBreathing').textContent = 'Start Session';
    document.getElementById('startBreathing').disabled = false;
    document.getElementById('stopBreathing').disabled = true;
    showToast('Breathing session ended');
  }
});

// ==================== WELLNESS REMINDERS ====================
const reminderIntervals = {
  '20-20-20': null,
  blink: null,
  posture: null,
  standUp: null,
  stretch: null
};

const stretchSuggestions = [
  'Roll your shoulders backwards 10 times',
  'Tilt your head gently left and right',
  'Stretch your arms above your head',
  'Rotate your wrists 10 times each direction',
  'Do 10 ankle circles',
  'Stretch your fingers wide, then make fists',
  'Do a gentle seated twist on each side',
  'Roll your neck slowly in circles'
];

function setupReminderToggle(toggleId, reminderKey, intervalMin, notificationFn) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;
  
  toggle.addEventListener('change', function() {
    const interval = parseInt(document.getElementById(`${reminderKey}Interval`)?.value || intervalMin) * 60000;
    
    if (this.checked) {
      store.reminders[reminderKey] = true;
      reminderIntervals[reminderKey] = setInterval(notificationFn, interval);
      showToast(`${reminderKey} reminder started`);
    } else {
      store.reminders[reminderKey] = false;
      clearInterval(reminderIntervals[reminderKey]);
      showToast(`${reminderKey} reminder stopped`);
    }
    saveStore();
    updateNotificationPanel();
  });
}

// Sync toggles between dashboard and page
function syncToggles() {
  const syncPairs = [
    ['toggleBlink', 'toggleBlinkPage'],
    ['togglePosture', 'togglePosturePage'],
    ['toggleStandUp', 'toggleStandUpPage']
  ];
  
  syncPairs.forEach(([id1, id2]) => {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    if (el1 && el2) {
      el1.addEventListener('change', () => { el2.checked = el1.checked; el2.dispatchEvent(new Event('change')); });
      el2.addEventListener('change', () => { el1.checked = el2.checked; });
    }
  });
}

// Setup reminder functions
function checkSmartFocus() {
  return store.smartFocus && pomodoroRunning;
}

// 20-20-20 Rule
document.getElementById('toggle2020')?.addEventListener('change', function() {
  if (this.checked) {
    store.reminders['20-20-20'] = true;
    reminderIntervals['20-20-20'] = setInterval(() => {
      if (!checkSmartFocus()) {
        sendNotification('20-20-20 Rule', 'Look at something 20 feet away for 20 seconds to rest your eyes.');
      }
    }, 20 * 60000);
    showToast('20-20-20 reminder started');
  } else {
    store.reminders['20-20-20'] = false;
    clearInterval(reminderIntervals['20-20-20']);
    showToast('20-20-20 reminder stopped');
  }
  saveStore();
  updateNotificationPanel();
});

// Blink Reminder
setupReminderToggle('toggleBlinkPage', 'blink', 10, () => {
  if (!checkSmartFocus()) {
    sendNotification('Blink Reminder', 'Consciously blink your eyes several times to keep them moist.');
  }
});

// Posture Reminder
setupReminderToggle('togglePosturePage', 'posture', 15, () => {
  if (!checkSmartFocus()) {
    sendNotification('Posture Check', 'Straighten your back, pull shoulders down, and ensure feet are flat on the floor.');
  }
});

// Stand Up Reminder
setupReminderToggle('toggleStandUpPage', 'standUp', 30, () => {
  if (!checkSmartFocus()) {
    sendNotification('Stand Up & Move', 'You\'ve been sitting for a while. Stand up and walk around for 2 minutes.');
  }
});

// Stretch Reminder
document.getElementById('toggleStretchPage')?.addEventListener('change', function() {
  const interval = parseInt(document.getElementById('stretchInterval').value) * 60000;
  
  if (this.checked) {
    store.reminders.stretch = true;
    reminderIntervals.stretch = setInterval(() => {
      if (!checkSmartFocus()) {
        const stretch = stretchSuggestions[Math.floor(Math.random() * stretchSuggestions.length)];
        sendNotification('Stretch Time', stretch);
      }
    }, interval);
    showToast('Stretch reminder started');
  } else {
    store.reminders.stretch = false;
    clearInterval(reminderIntervals.stretch);
    showToast('Stretch reminder stopped');
  }
  saveStore();
  updateNotificationPanel();
});

// ==================== MAIN CHECK LOOP ====================
function mainCheckLoop() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Check medicines
  store.medicines.forEach(med => {
    if (med.time === currentTime) {
      sendNotification('Medicine Reminder', `Time to take ${med.name} - ${med.dosage}`);
    }
  });
  
  // Check alarms
  const nowTime = now.getTime();
  store.alarms.forEach(alarm => {
    if (!alarm.triggered && nowTime >= alarm.triggerAt) {
      sendNotification('Alarm', alarm.label);
      alarm.triggered = true;
    }
  });
  
  // Clean triggered alarms
  store.alarms = store.alarms.filter(a => !a.triggered);
  saveStore();
}

// ==================== INITIALIZATION ====================
function init() {
  updateDashboard();
  updateWaterDisplay();
  updatePomodoroDisplay();
  renderMedicines();
  renderAlarms();
  syncToggles();
  document.getElementById('breathingCycles').textContent = store.breathingCycles;
  
  // Check every 30 seconds for time-based reminders
  setInterval(mainCheckLoop, 30000);
  
  // Request notification permission on first visit
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      requestNotificationPermission();
    }, 2000);
  }
  
  updateNotificationIndicator();
}

init();