document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const views = {
        login: document.getElementById('login-view'),
        signup: document.getElementById('signup-view'),
        dashboard: document.getElementById('dashboard-view'),
    };
    const dashboardViews = {
        incidents: document.getElementById('incidents-view'),
        report: document.getElementById('report-view'),
        emergency: document.getElementById('emergency-view'),
        rewards: document.getElementById('rewards-view'),
    };
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const showSignupLink = document.getElementById('show-signup-link');
    const showLoginLink = document.getElementById('show-login-link');
    const usernameDisplay = document.getElementById('username-display');
    const navLinks = document.querySelectorAll('.nav-link');
    const logoutButton = document.getElementById('logout-button');
    const incidentForm = document.getElementById('incident-form');
    const reportError = document.getElementById('report-error');
    const incidentsContainer = document.getElementById('incidents-container');
    const emergencyGrid = document.getElementById('emergency-grid');
    const refreshIncidentsBtn = document.getElementById('refresh-incidents-btn');

    // --- CORE LOGIC ---
    const showView = (viewName) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        if (views[viewName]) views[viewName].classList.remove('hidden');
    };
    const showDashboardView = (viewName) => {
        Object.values(dashboardViews).forEach(v => v.classList.add('hidden'));
        if (dashboardViews[viewName]) dashboardViews[viewName].classList.remove('hidden');
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
    };
    const closeMobileMenu = () => {
        if (mainNav.classList.contains('nav-open')) {
            mobileMenuBtn.classList.remove('is-active');
            mainNav.classList.remove('nav-open');
        }
    };
    const getUsers = () => JSON.parse(localStorage.getItem('crimecontrol_users')) || [];
    const saveUsers = (users) => localStorage.setItem('crimecontrol_users', JSON.stringify(users));
    const getIncidents = () => JSON.parse(localStorage.getItem('crimecontrol_incidents')) || [];
    const saveIncidents = (incidents) => localStorage.setItem('crimecontrol_incidents', JSON.stringify(incidents));
    
    // --- FIX: Added the missing email validation function ---
    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };
    // --- END FIX ---

    // --- RENDER FUNCTIONS ---
    const renderIncidents = () => {
        incidentsContainer.innerHTML = '';
        const incidents = getIncidents();
        if (incidents.length === 0) { incidentsContainer.innerHTML = '<p>No incidents have been reported yet.</p>'; return; }
        incidents.slice().reverse().forEach(inc => {
            const el = document.createElement('div');
            el.className = 'incident-item';
            el.innerHTML = `<h4>${inc.title}</h4><p>${inc.description}</p><small>Location: ${inc.location} | Type: ${inc.incidentType}</small>`;
            incidentsContainer.appendChild(el);
        });
    };
    const populateEmergencyContacts = () => {
        const contacts = [{ name: 'Police', desc: 'For immediate police assistance', num: '100' }, { name: 'Ambulance', desc: 'For medical emergencies', num: '108' }, { name: 'Fire Department', desc: 'In case of fire', num: '101' }, { name: 'Women Helpline', desc: 'For women in distress', num: '1091' }, { name: 'Child Helpline', desc: 'For children in need of help', num: '1098' }, { name: 'Road Accident Emergency', desc: 'Road accident services', num: '1073' }];
        emergencyGrid.innerHTML = contacts.map(c => `<div class="contact-card"><h3>${c.name}</h3><p>${c.desc}</p><div class="dial-number">Dial ${c.num}</div></div>`).join('');
    };

    // --- EVENT LISTENERS ---
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('is-active');
        mainNav.classList.toggle('nav-open');
    });
    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showView('signup'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
    refreshIncidentsBtn.addEventListener('click', renderIncidents);

    navLinks.forEach(link => {
        // This listener is for VIEW SWITCHING links only.
        if (link.id !== 'logout-button') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = e.target.dataset.view;
                if (viewName) showDashboardView(viewName);
                closeMobileMenu();
            });
        }
    });

    // Dedicated listener for the Logout button
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('crimecontrol_session');
        loginForm.reset();
        showView('login');
        closeMobileMenu();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const email = loginForm.querySelector('#login-email').value;
        const password = loginForm.querySelector('#login-password').value;
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('crimecontrol_session', JSON.stringify(user));
            initDashboard();
        } else {
            loginError.textContent = 'Invalid email or password.';
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signupError.textContent = '';
        const username = signupForm.querySelector('#signup-username').value;
        const email = signupForm.querySelector('#signup-email').value;
        const password = signupForm.querySelector('#signup-password').value;
        if (!username || !email || !password) { signupError.textContent = 'All fields are required.'; return; }
        if (username.length < 3) { signupError.textContent = 'Username must be at least 3 characters.'; return; }
        if (!validateEmail(email)) { signupError.textContent = 'Please enter a valid email address.'; return; } // This line now works
        if (password.length < 6) { signupError.textContent = 'Password must be at least 6 characters.'; return; }
        const users = getUsers();
        if (users.find(user => user.email === email)) {
            signupError.textContent = 'This email is already registered.'; return;
        }
        users.push({ username, email, password });
        saveUsers(users);
        alert('Account created successfully! Please sign in.');
        signupForm.reset();
        showView('login');
    });

    incidentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        reportError.textContent = '';
        const title = incidentForm.querySelector('#incident-title').value;
        const description = incidentForm.querySelector('#incident-description').value;
        const location = incidentForm.querySelector('#incident-location').value;
        const incidentType = incidentForm.querySelector('#incident-type').value;
        if (!title || !description || !location || !incidentType) {
            reportError.textContent = 'All fields are required.'; return;
        }
        const incidents = getIncidents();
        incidents.push({ title, description, location, incidentType });
        saveIncidents(incidents);
        alert('Incident reported successfully!');
        e.target.reset();
        renderIncidents();
        showDashboardView('incidents');
    });

    // --- INITIALIZATION ---
    function initDashboard() {
        const session = JSON.parse(localStorage.getItem('crimecontrol_session'));
        if (session && session.username) {
            usernameDisplay.textContent = session.username;
            populateEmergencyContacts();
            renderIncidents();
            showDashboardView('incidents');
            showView('dashboard');
        } else {
            showView('login');
        }
    }
    
    // Seed data if necessary on first load
    if (!localStorage.getItem('crimecontrol_incidents')) {
        const defaultIncidents = [
            { title: 'Vandalism at City Park', description: 'Graffiti was found on the new park benches and walls this morning.', location: 'NTR Park, Tirupati', incidentType: 'Vandalism' },
            { title: 'Streetlight Malfunction', description: 'The main streetlight at the junction of MG Road is out, causing poor visibility.', location: 'MG Road Junction, Tirupati', incidentType: 'Other' },
            { title: 'Public Nuisance Complaint', description: 'Loud music and shouting reported from a residence after 11 PM.', location: 'Balaji Colony, Tirupati', incidentType: 'Misbehavior' },
            { title: 'Suspicious Vehicle Reported', description: 'A black sedan with tinted windows has been parked on the corner for several hours.', location: 'Srinivasa Nagar, Tirupati', incidentType: 'Suspicious Activity' },
            { title: 'Attempted Theft at ATM', description: 'Witnesses reported two individuals tampering with the ATM near the bus stand.', location: 'RTC Bus Stand, Tirupati', incidentType: 'Theft' }
        ];
        saveIncidents(defaultIncidents);
    }
    
    initDashboard();
});