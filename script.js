// --- Habit Tracker JavaScript --- //

let habits = [];
let bestStreak = 0;

// Get today's date string (YYYY-MM-DD)
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

// Load habits from localStorage
function loadHabits() {
    const stored = localStorage.getItem('habits');
    if (stored) {
        habits = JSON.parse(stored);
        // Update best streak from stored habits
        bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    } else {
        habits = [];
        bestStreak = 0;
    }
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Render habits list on page
function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';

    if (habits.length === 0) {
        list.innerHTML = '<p>No habits added yet. Add one above!</p>';
        updateStats();
        renderCalendar();
        return;
    }

    habits.forEach((habit, index) => {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-item';

        // Checkbox for completion toggle
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = habit.completedToday || false;
        checkbox.setAttribute('aria-label', `Mark habit "${habit.name}" completed`);
        checkbox.addEventListener('change', () => {
            habit.completedToday = checkbox.checked;
            if (checkbox.checked) {
                habit.streak = (habit.streak || 0) + 1;
                if (habit.streak > bestStreak) bestStreak = habit.streak;
            } else {
                habit.streak = 0;
            }
            saveHabits();
            updateStats();
            renderCalendar();
        });

        // Habit name + frequency text
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${habit.name} (${habit.frequency})`;
        nameSpan.className = 'habit-name';

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '🗑️';
        delBtn.title = `Delete habit "${habit.name}"`;
        delBtn.addEventListener('click', () => {
            habits.splice(index, 1);
            saveHabits();
            renderHabits();
            updateStats();
            renderCalendar();
        });

        habitDiv.appendChild(checkbox);
        habitDiv.appendChild(nameSpan);
        habitDiv.appendChild(delBtn);

        list.appendChild(habitDiv);
    });

    updateStats();
    renderCalendar();
}

// Update stats panel
function updateStats() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedToday).length;
    const totalCompleted = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

    document.getElementById('total-habits').textContent = totalHabits;
    document.getElementById('completed-today').textContent = completedToday;
    document.getElementById('best-streak').textContent = bestStreak;
    document.getElementById('total-completed').textContent = totalCompleted;
}

// Reset all habits completions and streaks
function resetHabits() {
    habits.forEach(habit => {
        habit.completedToday = false;
        habit.streak = 0;
    });
    bestStreak = 0;
    saveHabits();
    renderHabits();
}

// Add a new habit from form input
function addHabit() {
    const input = document.getElementById('habit-input');
    const freqSelect = document.getElementById('frequency-select');
    const habitName = input.value.trim();
    const frequency = freqSelect.value;

    if (!habitName) {
        alert('Please enter a habit name!');
        return;
    }

    // Prevent duplicates (case-insensitive)
    if (habits.some(h => h.name.toLowerCase() === habitName.toLowerCase())) {
        alert('Habit already exists!');
        return;
    }

    habits.push({
        name: habitName,
        frequency,
        completedToday: false,
        streak: 0
    });

    saveHabits();
    renderHabits();

    input.value = '';
}

// Render a simple calendar grid (current month, days marked as "completed" weekends)
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        // Mark weekends as completed for demo
        const date = new Date(year, month, day);
        if (date.getDay() === 0 || date.getDay() === 6) {
            dayDiv.classList.add('completed-day');
            dayDiv.title = 'Completed habit day';
        }

        calendarGrid.appendChild(dayDiv);
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    renderHabits();

    document.getElementById('add-btn').addEventListener('click', addHabit);
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Reset all habits? This clears completions and streaks!')) {
            resetHabits();
        }
    });
});
