// Simple data storage using localStorage
let currentUser = null;
let users = [];
let tasks = [];
let courses = [];
let attendance = [];
let schedule = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizAnswers = {};
let quizTimer = null;
let timeRemaining = 120;
let communityPosts = [];
let currentTaskFilter = 'all';

// Initialize app on page load
window.onload = function() {
    loadData();
    checkLogin();
};

// Load data from localStorage
function loadData() {
    const savedUsers = localStorage.getItem('studentos_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('studentos_users', JSON.stringify(users));
}

// Check if user is already logged in
function checkLogin() {
    const savedSession = localStorage.getItem('studentos_session');
    if (savedSession) {
        const session = JSON.parse(savedSession);
        currentUser = users.find(u => u.email === session.email);
        if (currentUser) {
            showMainApp();
        }
    }
}

// Show signup page
function showSignup() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'block';
}

// Show login page
function showLogin() {
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
}

// Signup function
function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const errorMsg = document.getElementById('signupErrorMsg');
    
    // Check if fields are empty
    if (!name || !email || !password) {
        errorMsg.textContent = 'Please fill all fields';
        errorMsg.classList.add('show');
        return;
    }
    
    // Check if passwords match
    if (password !== confirm) {
        errorMsg.textContent = 'Passwords do not match';
        errorMsg.classList.add('show');
        return;
    }
    
    // Check if password is long enough
    if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        errorMsg.classList.add('show');
        return;
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        errorMsg.textContent = 'Email already registered';
        errorMsg.classList.add('show');
        return;
    }
    
    // Create new user
    const newUser = {
        name: name,
        email: email,
        password: password,
        institute: '',
        tasks: [],
        courses: getDefaultCourses(),
        attendance: []
    };
    
    users.push(newUser);
    saveData();
    
    // Auto login after signup
    currentUser = newUser;
    localStorage.setItem('studentos_session', JSON.stringify({ email: email }));
    showMainApp();
}

// Login function
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('errorMsg');
    
    // Check if fields are empty
    if (!email || !password) {
        errorMsg.textContent = 'Please enter email and password';
        errorMsg.classList.add('show');
        return;
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        errorMsg.textContent = 'Invalid email or password';
        errorMsg.classList.add('show');
        return;
    }
    
    // Login successful
    currentUser = user;
    localStorage.setItem('studentos_session', JSON.stringify({ email: email }));
    showMainApp();
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('studentos_session');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    
    // Clear input fields
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Show main app after login
function showMainApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';

    // Update user name
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];

    // Load user data
    tasks = currentUser.tasks || [];
    courses = currentUser.courses || getDefaultCourses();
    attendance = currentUser.attendance || [];
    communityPosts = currentUser.communityPosts || getDefaultCommunityPosts();
    schedule = currentUser.schedule || [];

    // Sync avatar across all avatar elements
    const avatarSrc = currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=random';
    ['headerAvatar','settingsAvatar','communityUserAvatar','profileMenuAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = avatarSrc;
    });

    // Sync profile dropdown info
    const pmName = document.getElementById('profileMenuName');
    const pmEmail = document.getElementById('profileMenuEmail');
    const pmInstitute = document.getElementById('profileMenuInstitute');
    if (pmName) pmName.textContent = currentUser.name;
    if (pmEmail) pmEmail.textContent = currentUser.email;
    if (pmInstitute) pmInstitute.textContent = currentUser.institute || '';

    // Show dashboard
    showPage('dashboard');
    loadCourses();
    loadTasks();
    loadAttendance();
    loadCommunityFeed();
    updateDashboardStats();
}

// Get default courses
function getDefaultCourses() {
    return [
        {
            id: 1,
            title: 'React Mastery',
            instructor: 'CodeWithHarry',
            progress: 0,
            totalLessons: 12,
            embedUrl: 'https://www.youtube.com/embed/-mJFZp84TIY',
            notes: '',
            quiz: {
                title: 'React Basics Quiz',
                questions: [
                    { q: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JSON Extension'], answer: 'JavaScript XML' },
                    { q: 'What is a component?', options: ['Reusable UI piece', 'A function', 'A class'], answer: 'Reusable UI piece' },
                    { q: 'What hook manages state?', options: ['useState', 'useEffect', 'useRef'], answer: 'useState' }
                ]
            }
        },
        {
            id: 2,
            title: 'DSA Fundamentals',
            instructor: 'Apna College',
            progress: 0,
            totalLessons: 20,
            embedUrl: 'https://www.youtube.com/embed/VbMtiEicv_I',
            notes: '',
            quiz: {
                title: 'Arrays & Complexity',
                questions: [
                    { q: 'Time complexity of linear search?', options: ['O(n)', 'O(log n)', 'O(1)'], answer: 'O(n)' },
                    { q: 'Best sorting algorithm?', options: ['Quick Sort', 'Bubble Sort', 'Selection Sort'], answer: 'Quick Sort' },
                    { q: 'Stack follows?', options: ['LIFO', 'FIFO', 'Random'], answer: 'LIFO' }
                ]
            }
        },
        {
            id: 3,
            title: 'Web Development',
            instructor: 'CodeWithHarry',
            progress: 0,
            totalLessons: 15,
            embedUrl: 'https://www.youtube.com/embed/tVzUXW6csiO',
            notes: '',
            quiz: {
                title: 'HTML & CSS Basics',
                questions: [
                    { q: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System'], answer: 'Cascading Style Sheets' },
                    { q: 'Which tag for links?', options: ['<a>', '<link>', '<href>'], answer: '<a>' },
                    { q: 'Flexbox container property?', options: ['display: flex', 'flex: 1', 'flexbox: true'], answer: 'display: flex' }
                ]
            }
        }
    ];
}

// Show different pages
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => page.style.display = 'none');
    
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Show selected page
    document.getElementById('page-' + pageName).style.display = 'block';
    
    // Add active class to selected menu item
    const menuItem = document.getElementById('menu-' + pageName);
    if(menuItem) menuItem.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'courses': 'My Courses',
        'todo': 'To-Do List',
        'scheduler': '📅 Scheduler',
        'quiz': 'Quiz',
        'attendance': 'Attendance',
        'settings': 'Settings',
        'learning-hub': 'Learning Hub',
        'community': 'Community'
    };
    if (titles[pageName]) document.getElementById('pageTitle').textContent = titles[pageName];
    
    // Load page specific data
    if (pageName === 'settings') loadSettings();
    if (pageName === 'scheduler') loadScheduler();
}

// Load courses
function loadCourses() {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        courseCard.innerHTML = `
            <div class="course-header">
                <h4 style="color: white;">${course.title}</h4>
            </div>
            <div class="course-body">
                <h4>${course.title}</h4>
                <p>by ${course.instructor}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <p style="font-size: 12px; margin-bottom: 10px;">${course.progress}% Complete</p>
                <button class="course-btn" onclick="updateProgress(${course.id})">Continue Learning</button>
            </div>
        `;
        
        coursesList.appendChild(courseCard);
    });
    
    // Load quiz courses
    loadQuizCourses();
}

// Update course progress
function updateProgress(courseId) {
    const course = courses.find(c => c.id === courseId);
    
    // Open Learning Hub
    showPage('learning-hub');
    
    // Set active course context
    document.getElementById('hubCourseTitle').textContent = course.title;
    
    // Set iframe src
    const iframe = document.getElementById('hubVideoEmbed');
    if (course.embedUrl) {
        iframe.src = course.embedUrl;
    } else {
        // Fallback to Apna College DSA
        iframe.src = 'https://www.youtube.com/embed/VbMtiEicv_I';
    }
    
    // Load notes
    document.getElementById('hubNotes').value = course.notes || '';
    document.getElementById('hubNotes').dataset.courseId = courseId;
    
    // Update progress
    if (course.progress < 100) {
        course.progress += 10;
        if (course.progress > 100) course.progress = 100;
        currentUser.courses = courses;
        updateUserData();
        loadCourses();
    }
}

// Load tasks (with filter and priority badge support)
function loadTasks(filter) {
    if (filter !== undefined) currentTaskFilter = filter;
    const taskList = document.getElementById('taskList');

    // Update filter tabs UI
    document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById('filter-' + currentTaskFilter);
    if (activeTab) activeTab.classList.add('active');

    let filtered = tasks;
    if (currentTaskFilter === 'active')    filtered = tasks.filter(t => !t.done);
    if (currentTaskFilter === 'completed') filtered = tasks.filter(t => t.done);

    if (filtered.length === 0) {
        taskList.innerHTML = '<p class="empty-msg">No tasks here! 🎉</p>';
        updateDashboardStats();
        return;
    }

    taskList.innerHTML = '';
    const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

    filtered.forEach(task => {
        const realIndex = tasks.indexOf(task);
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item' + (task.done ? ' completed' : '');
        const pc = priorityColors[task.priority || 'medium'];
        const dueStr = task.dueDate ? `<span class="task-due">📅 ${task.dueDate}</span>` : '';
        taskItem.innerHTML = `
            <span class="priority-dot" style="background:${pc}" title="${task.priority || 'medium'} priority"></span>
            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${realIndex})">
            <div class="task-text-wrap">
                <label>${task.text}</label>
                ${dueStr}
            </div>
            <button class="task-delete" onclick="deleteTask(${realIndex})">✕</button>
        `;
        taskList.appendChild(taskItem);
    });
    updateDashboardStats();
}

// Add new task
function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    const priorityEl = document.getElementById('taskPriority');
    const dueDateEl  = document.getElementById('taskDueDate');
    const priority = priorityEl ? priorityEl.value : 'medium';
    const dueDate  = dueDateEl  ? dueDateEl.value  : '';

    if (!text) {
        showToast('Please enter a task 📝', 'error');
        return;
    }

    tasks.push({ text, done: false, priority, dueDate, createdAt: new Date().toISOString() });
    input.value = '';
    if (dueDateEl) dueDateEl.value = '';
    if (priorityEl) priorityEl.value = 'medium';

    currentUser.tasks = tasks;
    updateUserData();
    loadTasks();
    showToast('Task added! ✅');
}

// Toggle task completion
function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    
    currentUser.tasks = tasks;
    updateUserData();
    loadTasks();
}

// Delete task
function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(index, 1);
        
        currentUser.tasks = tasks;
        updateUserData();
        loadTasks();
    }
}

// Load quiz courses
function loadQuizCourses() {
    const quizCourseList = document.getElementById('quizCourseList');
    quizCourseList.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'quiz-course-card';
        
        courseCard.innerHTML = `
            <h4>${course.title}</h4>
            <p>${course.quiz.questions.length} questions</p>
            <button class="btn-primary" onclick="startQuiz(${course.id})">Start Quiz</button>
        `;
        
        quizCourseList.appendChild(courseCard);
    });
}

// Start quiz
function startQuiz(courseId) {
    const course = courses.find(c => c.id === courseId);
    currentQuiz = course.quiz;
    currentQuestionIndex = 0;
    quizAnswers = {};
    timeRemaining = 120; // 2 minutes
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizActive').style.display = 'block';
    
    loadQuestion();
    startTimer();
}

// Load question
function loadQuestion() {
    const questions = currentQuiz.questions;
    const question = questions[currentQuestionIndex];
    
    document.getElementById('questionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('questionText').textContent = question.q;
    
    const optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = '';
    
    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        
        if (quizAnswers[currentQuestionIndex] === option) {
            btn.classList.add('selected');
        }
        
        btn.onclick = function() {
            selectOption(option);
        };
        
        optionsList.appendChild(btn);
    });
    
    // Show/hide navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'block';
    } else {
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

// Select option
function selectOption(option) {
    quizAnswers[currentQuestionIndex] = option;
    loadQuestion();
}

// Previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

// Start timer
function startTimer() {
    quizTimer = setInterval(function() {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        document.getElementById('timer').textContent = 
            minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

// Submit quiz
function submitQuiz() {
    clearInterval(quizTimer);
    
    let score = 0;
    const questions = currentQuiz.questions;
    
    questions.forEach((q, index) => {
        if (quizAnswers[index] === q.answer) {
            score++;
        }
    });
    
    const percentage = Math.round((score / questions.length) * 100);
    
    document.getElementById('quizActive').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    
    document.getElementById('scorePercent').textContent = percentage + '%';
    document.getElementById('scoreText').textContent = 
        `You scored ${score} out of ${questions.length}`;
}

// Reset quiz
function resetQuiz() {
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
    
    currentQuiz = null;
    currentQuestionIndex = 0;
    quizAnswers = {};
}

// Mark attendance
function markAttendance() {
    const subject = document.getElementById('attendanceSubject').value;
    const status = document.getElementById('attendanceStatus').value;
    
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    const record = {
        subject: subject,
        status: status,
        date: new Date().toLocaleDateString()
    };
    
    attendance.push(record);

    currentUser.attendance = attendance;
    updateUserData();
    loadAttendance();
    showToast('Attendance marked successfully! 📝');
}

// Load attendance
function loadAttendance() {
    const attendanceList = document.getElementById('attendanceList');
    
    if (attendance.length === 0) {
        attendanceList.innerHTML = '<p class="empty-msg">No records yet</p>';
        document.getElementById('totalClasses').textContent = '0';
        document.getElementById('presentClasses').textContent = '0';
        document.getElementById('attendancePercent').textContent = '0%';
        return;
    }
    
    attendanceList.innerHTML = '';
    
    // Show recent 10 records
    const recentRecords = attendance.slice(-10).reverse();
    
    recentRecords.forEach(record => {
        const item = document.createElement('div');
        item.className = 'attendance-item';
        
        const badgeClass = record.status === 'present' ? 'badge-present' : 'badge-absent';
        
        item.innerHTML = `
            <div>
                <strong>${record.subject}</strong>
                <p style="font-size: 12px; color: #999;">${record.date}</p>
            </div>
            <span class="attendance-badge ${badgeClass}">${record.status.toUpperCase()}</span>
        `;
        
        attendanceList.appendChild(item);
    });
    
    // Update stats
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'present').length;
    const percent = Math.round((presentClasses / totalClasses) * 100);
    
    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('presentClasses').textContent = presentClasses;
    document.getElementById('attendancePercent').textContent = percent + '%';
}

// Load settings
function loadSettings() {
    document.getElementById('settingsName').value = currentUser.name;
    document.getElementById('settingsEmail').value = currentUser.email;
    document.getElementById('settingsInstitute').value = currentUser.institute || '';
}

// Save settings
function saveSettings() {
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const institute = document.getElementById('settingsInstitute').value;
    
    if (!name || !email) {
        alert('Name and Email are required');
        return;
    }
    
    currentUser.name = name;
    currentUser.email = email;
    currentUser.institute = institute;

    updateUserData();

    // Update display
    document.getElementById('userName').textContent = name;
    document.getElementById('welcomeName').textContent = name.split(' ')[0];

    // Keep profile dropdown in sync
    const pmName = document.getElementById('profileMenuName');
    const pmEmail = document.getElementById('profileMenuEmail');
    const pmInstitute = document.getElementById('profileMenuInstitute');
    if (pmName) pmName.textContent = name;
    if (pmEmail) pmEmail.textContent = email;
    if (pmInstitute) pmInstitute.textContent = institute;

    showToast('Profile saved successfully! ✅');
}

// Update user data in storage
function updateUserData() {
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        saveData();
    }
}

// ============================================
// NEW FEATURES: LEARNING HUB & COURSES
// ============================================

function openAddCourseModal() {
    document.getElementById('addCourseModal').style.display = 'flex';
}

function closeAddCourseModal() {
    document.getElementById('addCourseModal').style.display = 'none';
    document.getElementById('newCourseTitle').value = '';
    document.getElementById('newCourseInstructor').value = '';
    document.getElementById('newCourseLink').value = '';
}

function addNewCourse() {
    const title = document.getElementById('newCourseTitle').value;
    const instructor = document.getElementById('newCourseInstructor').value || 'Self Study';
    const link = document.getElementById('newCourseLink').value;
    
    if(!title) {
        showToast('Course title is required!', 'error');
        return;
    }
    
    // Extract embed from youtube link if necessary
    let embedUrl = link;
    if(link.includes('youtube.com/watch?v=')) {
        embedUrl = link.replace('watch?v=', 'embed/');
    } else if (link.includes('youtu.be/')) {
        embedUrl = link.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    
    const newCourse = {
        id: Date.now(),
        title: title,
        instructor: instructor,
        progress: 0,
        totalLessons: 10,
        embedUrl: embedUrl || 'https://www.youtube.com/embed/VbMtiEicv_I',
        notes: '',
        quiz: { title: 'Basic Quiz', questions: [] }
    };
    
    courses.push(newCourse);
    currentUser.courses = courses;
    updateUserData();
    loadCourses();
    closeAddCourseModal();
}

function saveCourseNotes() {
    const notesBox = document.getElementById('hubNotes');
    const courseId = parseInt(notesBox.dataset.courseId);
    const course = courses.find(c => c.id === courseId);
    if(course) {
        course.notes = notesBox.value;
        currentUser.courses = courses;
        updateUserData();
        showToast('Notes saved! 📝');
    }
}

function searchResearch() {
    const query = document.getElementById('hubSearchInput').value;
    if(query) {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
    }
}

// ============================================
// NEW FEATURES: NOTIFICATIONS & SETTINGS
// ============================================

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    document.getElementById('notifBadge').style.display = 'none'; // hide badge after viewing
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    // Notification dropdown
    const notifContainer = document.querySelector('.notification-container');
    const notifDropdown  = document.getElementById('notifDropdown');
    if (notifContainer && notifDropdown && !notifContainer.contains(event.target)) {
        notifDropdown.style.display = 'none';
    }
    // Profile dropdown
    const profileTrigger = document.getElementById('profileTrigger');
    if (profileTrigger && !profileTrigger.contains(event.target)) {
        closeProfileMenu();
    }
});

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const src = e.target.result;
            ['settingsAvatar','headerAvatar','communityUserAvatar'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.src = src;
            });
            currentUser.avatar = src;
            updateUserData();
            showToast('Avatar updated! 😊');
        }
        reader.readAsDataURL(file);
    }
}

function selectAvatar(src) {
    ['settingsAvatar','headerAvatar','communityUserAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    });
    currentUser.avatar = src;
    updateUserData();
    showToast('Avatar updated! 😊');
}

function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    if (current === currentUser.password) {
        if(newPass.length >= 6) {
            currentUser.password = newPass;
            updateUserData();
            showToast('Password updated successfully! 🔒');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
        } else {
            showToast('New password must be at least 6 characters.', 'error');
        }
    } else {
        showToast('Incorrect current password.', 'error');
    }
}

function savePreferences() {
    showToast('Preferences saved! ⚙️');
}

function toggleDarkMode() {
    const isDark = document.getElementById('prefDark').checked;
    if(isDark) {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#e5e7eb';
        document.querySelectorAll('.stat-card, .section, .course-card, .welcome-box').forEach(el => {
            el.style.backgroundColor = '#2d3748';
            el.style.color = '#e5e7eb';
        });
        document.querySelectorAll('h1, h2, h3, h4, label, p').forEach(el => el.style.color = '#e5e7eb');
    } else {
        document.body.style.backgroundColor = '#f5f5f5';
        document.body.style.color = '#333';
        document.querySelectorAll('.stat-card, .section, .course-card, .welcome-box').forEach(el => {
            el.style.backgroundColor = 'white';
            el.style.color = '#333';
        });
        document.querySelectorAll('h1, h2, h3, h4, label').forEach(el => el.style.color = '#333');
    }
}

// To-Do Clear function
function clearCompletedTasks() {
    const count = tasks.filter(t => t.done).length;
    if (count === 0) { showToast('No completed tasks to clear', 'info'); return; }
    tasks = tasks.filter(t => !t.done);
    currentUser.tasks = tasks;
    updateUserData();
    loadTasks();
    showToast(count + ' completed task(s) cleared 🗏️');
}

// ============================================
// NEW FEATURES: COMMUNITY
// ============================================

function getDefaultCommunityPosts() {
    return [
        {
            id: 1,
            author: 'System',
            text: 'Welcome to the StudentOS Community! 🎉 Feel free to share your thoughts here.',
            likes: 5, likedByMe: false, comments: [],
            category: 'general', createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
            id: 2,
            author: 'Jane Smith',
            text: 'Does anyone have good resources for learning React Hooks?',
            likes: 12, likedByMe: true,
            category: 'question', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            comments: [{
                id: 201, author: 'Alex',
                text: 'Check out CodeWithHarry\'s latest playlist! Really helpful 👍',
                likes: 3, likedByMe: false,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }]
        }
    ];
}

function loadCommunityFeed() {
    const feed = document.getElementById('communityFeed');
    if (!feed) return;
    feed.innerHTML = '';

    const categoryMeta = {
        general: { label: '💬 General', color: '#6366F1' },
        question: { label: '❓ Question', color: '#F59E0B' },
        resource: { label: '📚 Resource', color: '#10B981' },
        achievement: { label: '🏆 Achievement', color: '#EF4444' }
    };

    const sorted = [...communityPosts].reverse();

    sorted.forEach(post => {
        const cat = categoryMeta[post.category] || categoryMeta.general;
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        const commentCount = (post.comments || []).length;

        let commentsHTML = (post.comments || []).map(c => `
            <div class="comment-item">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&background=random&size=32" alt="">
                <div class="comment-box">
                    <div class="comment-meta">
                        <h5>${c.author}</h5>
                        <small>${timeAgo(c.createdAt)}</small>
                    </div>
                    <p>${c.text}</p>
                    <button class="action-btn ${c.likedByMe ? 'liked' : ''}" onclick="toggleLike(${post.id}, ${c.id})">
                        ${c.likedByMe ? '❤️' : '🤍'} ${c.likes}
                    </button>
                </div>
            </div>`).join('');

        postCard.innerHTML = `
            <div class="post-header">
                <div class="post-avatar-wrap">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random&size=40" alt="">
                </div>
                <div class="post-author-info">
                    <h4>${post.author}</h4>
                    <small>${timeAgo(post.createdAt)}</small>
                </div>
                <span class="category-pill" style="background:${cat.color}20; color:${cat.color}; border:1px solid ${cat.color}40">${cat.label}</span>
            </div>
            <div class="post-content">${post.text}</div>
            <div class="post-actions">
                <button class="action-btn like-btn ${post.likedByMe ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    ${post.likedByMe ? '❤️' : '🤍'} <span>${post.likes}</span> Like
                </button>
                <button class="action-btn" onclick="toggleComments(${post.id})">
                    💬 ${commentCount} Comment${commentCount !== 1 ? 's' : ''}
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display:none;">
                <div class="comments-list">${commentsHTML}</div>
                <div class="comment-input-row">
                    <input type="text" id="commentInput_${post.id}" placeholder="Write a comment..." class="input-field comment-input"
                        onkeypress="if(event.key==='Enter') addComment(${post.id})">
                    <button onclick="addComment(${post.id})" class="btn-primary comment-submit">→</button>
                </div>
            </div>`;

        feed.appendChild(postCard);
    });
}

function toggleComments(postId) {
    const section = document.getElementById('comments-' + postId);
    if (!section) return;
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function addPost() {
    const textInput = document.getElementById('newPostText');
    const text = textInput.value.trim();
    const categoryEl = document.getElementById('postCategory');
    const category = categoryEl ? categoryEl.value : 'general';
    if (!text) { showToast('Please write something first ✏️', 'error'); return; }

    const newPost = {
        id: Date.now(), author: currentUser.name, text, likes: 0,
        likedByMe: false, comments: [], category,
        createdAt: new Date().toISOString()
    };

    communityPosts.push(newPost);
    currentUser.communityPosts = communityPosts;
    updateUserData();
    textInput.value = '';
    loadCommunityFeed();
    showToast('Post shared! 🚀');
}

function addComment(postId) {
    const input = document.getElementById('commentInput_' + postId);
    const text = input.value.trim();
    if (!text) return;

    const post = communityPosts.find(p => p.id === postId);
    if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push({
            id: Date.now(),
            author: currentUser.name,
            text: text,
            likes: 0,
            likedByMe: false,
            createdAt: new Date().toISOString()
        });
        currentUser.communityPosts = communityPosts;
        updateUserData();
        loadCommunityFeed();
        // Keep comment section visible after reload
        const section = document.getElementById('comments-' + postId);
        if (section) section.style.display = 'block';
    }
}


function toggleLike(postId, commentId = null) {
    const post = communityPosts.find(p => p.id === postId);
    if(post) {
        if(commentId) {
            const comment = post.comments.find(c => c.id === commentId);
            if(comment) {
                if(comment.likedByMe) {
                    comment.likes--;
                    comment.likedByMe = false;
                } else {
                    comment.likes++;
                    comment.likedByMe = true;
                }
            }
        } else {
            if(post.likedByMe) {
                post.likes--;
                post.likedByMe = false;
            } else {
                post.likes++;
                post.likedByMe = true;
            }
        }
        currentUser.communityPosts = communityPosts;
        updateUserData();
        loadCommunityFeed();
    }
}

// To-Do Enter key support
document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
});

// ============================================
// PROFILE DROPDOWN
// ============================================
function toggleProfileMenu() {
    const trigger  = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileMenu');
    if (!trigger || !dropdown) return;
    const isOpen = dropdown.classList.contains('visible');
    if (isOpen) {
        closeProfileMenu();
    } else {
        dropdown.classList.add('visible');
        trigger.classList.add('open');
    }
}

function closeProfileMenu() {
    const trigger  = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileMenu');
    if (dropdown) dropdown.classList.remove('visible');
    if (trigger)  trigger.classList.remove('open');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// DASHBOARD STATS (live)
// ============================================
function updateDashboardStats() {
    const pending = tasks.filter(t => !t.done).length;
    const el1 = document.getElementById('dashPendingTasks');
    if (el1) el1.textContent = pending;

    const el2 = document.getElementById('dashCourses');
    if (el2) el2.textContent = courses.length;

    const present = attendance.filter(a => a.status === 'present').length;
    const total   = attendance.length;
    const pct     = total > 0 ? Math.round((present / total) * 100) : 85;
    const el3 = document.getElementById('dashAttendance');
    if (el3) el3.textContent = pct + '%';
}

// ============================================
// TIME AGO HELPER
// ============================================
function timeAgo(isoDate) {
    if (!isoDate) return 'Just now';
    const diff = (Date.now() - new Date(isoDate)) / 1000;
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

// ============================================
// SCHEDULER
// ============================================
function loadScheduler() {
    schedule = currentUser.schedule || [];
    renderWeekGrid();
}

function renderWeekGrid() {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const grid = document.getElementById('weekGrid');
    if (!grid) return;
    grid.innerHTML = '';

    days.forEach(day => {
        const dayEvents = schedule.filter(e => e.day === day);
        const col = document.createElement('div');
        col.className = 'day-col';

        const eventsHTML = dayEvents.length
            ? dayEvents.map(evt => `
                <div class="event-chip" style="background:${evt.color}18; border-left:3px solid ${evt.color};">
                    <div class="event-chip-title">${evt.title}</div>
                    <div class="event-chip-time">${evt.start} – ${evt.end}</div>
                    <button class="event-delete" onclick="deleteScheduleEvent(${evt.id})">✕</button>
                </div>`).join('')
            : '<p class="no-event">Free</p>';

        col.innerHTML = `
            <div class="day-header">${day.substring(0, 3)}<span class="day-full">${day}</span></div>
            <div class="day-events">${eventsHTML}</div>`;
        grid.appendChild(col);
    });
}

function addScheduleEvent() {
    const title = document.getElementById('schedTitle').value.trim();
    const day   = document.getElementById('schedDay').value;
    const start = document.getElementById('schedStart').value;
    const end   = document.getElementById('schedEnd').value;
    const color = document.getElementById('schedColor').value;

    if (!title || !day || !start || !end) {
        showToast('Please fill all event fields 📅', 'error');
        return;
    }

    schedule.push({ id: Date.now(), title, day, start, end, color });
    currentUser.schedule = schedule;
    updateUserData();

    document.getElementById('schedTitle').value = '';
    document.getElementById('schedStart').value = '';
    document.getElementById('schedEnd').value   = '';

    renderWeekGrid();
    showToast('Event added to schedule! 📅');
}

function deleteScheduleEvent(id) {
    schedule = schedule.filter(e => e.id !== id);
    currentUser.schedule = schedule;
    updateUserData();
    renderWeekGrid();
    showToast('Event removed');
}