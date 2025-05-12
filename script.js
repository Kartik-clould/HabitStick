document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const habitInput = document.getElementById('habit-input');
    const frequencySelect = document.getElementById('frequency-select');
    const addBtn = document.getElementById('add-btn');
    const resetBtn = document.getElementById('reset-btn');
    const habitsList = document.getElementById('habits-list');
    const totalHabitsEl = document.getElementById('total-habits');
    const completedTodayEl = document.getElementById('completed-today');
    const bestStreakEl = document.getElementById('best-streak');

    // Initialize habits array from localStorage or empty array
    let habits = JSON.parse(localStorage.getItem('habits')) || [];

    // Render all habits
    function renderHabits() {
        habitsList.innerHTML = '';
        
        if (habits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <h3>No habits yet</h3>
                    <p>Add your first habit to get started!</p>
                </div>
            `;
            totalHabitsEl.textContent = '0';
            completedTodayEl.textContent = '0';
            bestStreakEl.textContent = '0';
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        let completedCount = 0;
        let maxStreak = 0;

        habits.forEach((habit, index) => {
            // Create habit item element
            const habitEl = document.createElement('div');
            habitEl.className = `habit-item ${habit.lastCompleted === today ? 'completed' : ''}`;
            
            // Calculate streak
            const streak = calculateStreak(habit);
            if (streak > maxStreak) maxStreak = streak;
            
            // Update completed count
            if (habit.lastCompleted === today) completedCount++;

            // Habit info
            habitEl.innerHTML = `
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-frequency">${habit.frequency} • Streak: ${streak}</div>
                </div>
                <div class="habit-actions">
                    <button class="action-btn complete-btn" data-id="${index}">
                        ${habit.lastCompleted === today ? '✓' : 'Complete'}
                    </button>
                    <button class="action-btn delete-btn" data-id="${index}">Delete</button>
                </div>
            `;
            
            habitsList.appendChild(habitEl);
        });

        // Update stats
        totalHabitsEl.textContent = habits.length;
        completedTodayEl.textContent = completedCount;
        bestStreakEl.textContent = maxStreak;
    }

    // Calculate streak for a habit
    function calculateStreak(habit) {
        if (!habit.lastCompleted) return 0;
        
        const lastDate = new Date(habit.lastCompleted);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Format dates for comparison
        const lastCompletedStr = lastDate.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        
        if (habit.frequency === 'daily') {
            if (lastCompletedStr === todayStr) {
                return habit.streak || 1;
            } else if (lastCompletedStr === yesterdayStr) {
                return (habit.streak || 1) + 1;
            } else {
                return 0;
            }
        }
        
        // For weekly habits, just return the stored streak
        return habit.streak || 0;
    }

    // Add new habit
    function addHabit() {
        const name = habitInput.value.trim();
        const frequency = frequencySelect.value;
        
        if (name) {
            habits.push({
                name,
                frequency,
                lastCompleted: null,
                streak: 0
            });
            
            saveHabits();
            habitInput.value = '';
            renderHabits();
        } else {
            alert('Please enter a habit name');
        }
    }

    // Toggle habit completion
    function toggleComplete(index) {
        const today = new Date().toISOString().split('T')[0];
        const habit = habits[index];
        
        if (habit.lastCompleted === today) {
            // Already completed today - undo completion
            habit.lastCompleted = null;
            habit.streak = Math.max(0, (habit.streak || 0) - 1);
        } else {
            // Mark as completed
            habit.lastCompleted = today;
            
            // Update streak
            if (habit.frequency === 'daily') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (habit.lastCompleted === yesterdayStr) {
                    habit.streak = (habit.streak || 0) + 1;
                } else {
                    habit.streak = 1;
                }
            } else {
                // For weekly habits, just increment
                habit.streak = (habit.streak || 0) + 1;
            }
        }
        
        saveHabits();
        renderHabits();
    }

    // Delete habit
    function deleteHabit(index) {
        if (confirm('Are you sure you want to delete this habit?')) {
            habits.splice(index, 1);
            saveHabits();
            renderHabits();
        }
    }

    // Reset all habits
    function resetAll() {
        if (confirm('Are you sure you want to reset all habits? This cannot be undone.')) {
            habits = [];
            saveHabits();
            renderHabits();
        }
    }

    // Save habits to localStorage
    function saveHabits() {
        try {
            localStorage.setItem('habits', JSON.stringify(habits));
        } catch (e) {
            console.error('Failed to save habits:', e);
            alert('Failed to save habits. Your browser may be in private mode.');
        }
    }

    // Event Listeners
    addBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addHabit();
    });
    
    resetBtn.addEventListener('click', resetAll);
    
    habitsList.addEventListener('click', function(e) {
        if (e.target.classList.contains('complete-btn')) {
            toggleComplete(parseInt(e.target.getAttribute('data-id')));
        } else if (e.target.classList.contains('delete-btn')) {
            deleteHabit(parseInt(e.target.getAttribute('data-id')));
        }
    });

    // Initial render
    renderHabits();
});