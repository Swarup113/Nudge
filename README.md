# Nudge – Desktop Health Companion

### *A lightweight desktop health companion built with pure HTML, CSS, and JavaScript*

Stay healthy while you work. Nudge helps you track water intake, manage medication reminders, follow the Pomodoro technique, practice eye care, maintain good posture, and reduce stress – all from your browser. Your data persists locally, and notifications work even when the tab is closed.

---

## Live Demo

[**https://swarup113.github.io/Nudge/**](https://swarup113.github.io/Nudge/)

---

## Overview

| Aspect | Description |
|--------|-------------|
| Purpose | Desktop health companion to counter the negative effects of prolonged screen use. |
| Core Features | Hydration tracking, medication reminders, Pomodoro timer, eye care (20‑20‑20 rule), posture checks, movement alerts, quick alarm, and box breathing. |
| Technology | Pure HTML5, CSS3, Vanilla JavaScript – no frameworks or external dependencies. |
| Data Persistence | Local storage – your settings and history survive browser restarts. |
| Notifications | Uses Chrome Alarms API (or browser notification API) to remind you even when the tab is inactive. |

---

## Features

| Feature | Description |
|---------|-------------|
| Daily Dashboard | Visual progress ring showing water + focus session completion. Quick action buttons for logging water or starting a focus session. |
| Pomodoro Timer | 25‑minute focus sessions. Runs in background via Chrome Alarms API – notifies you even if popup is closed. Tracks daily completed sessions. |
| Hydration Tracker | Log water intake with +/- buttons (goal: 8 glasses/day). Set custom reminder intervals (30m, 1h, 1.5h, 2h). Daily history logs each glass timestamp. |
| Medicine Reminder | Create recurring schedules (daily, twice daily, weekly). Time‑based notifications at exact times you set. |
| Eye Care (Strain Prevention) | 20‑20‑20 Rule reminder every 20 minutes to look 20 feet away for 20 seconds. Blink reminder every 10 minutes (combats 66% blink reduction from screen use). |
| Posture & Movement | Posture check reminders (default 15m). Stand up alert (default 30m). Desk stretches suggestions. |
| Quick Alarm | One‑off timers with custom labels (e.g., “Check oven in 10 mins”). |
| Box Breathing | Interactive visual guide for 4‑4‑4‑4 breathing technique. Animated circle expands/contracts to guide inhale, hold, and exhale phases. |

---

## How to Use

| Step | Action |
|------|--------|
| 1 | Open Nudge in your browser. Allow notification permissions when prompted. |
| 2 | Use the dashboard to log water or start a Pomodoro session. |
| 3 | Set up medicine reminders with your preferred schedule. |
| 4 | Adjust reminder intervals for hydration, posture, stand‑up, and eye care. |
| 5 | Follow the 20‑20‑20 rule and blink reminders to reduce eye strain. |
| 6 | Use the quick alarm for one‑off tasks. |
| 7 | Practice box breathing whenever you feel stressed. |

> All data is saved locally. Notifications work even if you close the Nudge tab (Chrome background service).

---

## Tech Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure, forms, modals, and semantic markup. |
| CSS3 | Flexbox, Grid, custom properties, animations, responsive design. |
| JavaScript (ES6) | Core logic, local storage management, timer handling, notification API. |
| Chrome Alarms API | Background timers for Pomodoro and reminders (works when tab is closed). |
| Browser Notifications API | Desktop alerts for all reminders and timers. |

---

## License

MIT License.
