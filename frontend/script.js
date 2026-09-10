// ============================================================
// OpenScheduler
// Authentication + User-Specific Dashboard
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = "https://openscheduler-2.onrender.com";

const TOKEN_KEY =
    "openscheduler_access_token";


// ============================================================
// API ROUTES
// ============================================================

// IMPORTANT:
// These match the routes currently deployed on the Render backend.

const API_ROUTES = {

    register: "/auth/register",

    login: "/auth/login",

    me: "/auth/me",

    jobs: "/jobs/",

    workers: "/workers/",

    queues: "/queues/"

};


// ============================================================
// AUTH PAGE ELEMENTS
// ============================================================

const authPage =
    document.getElementById("authPage");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");


// ------------------------------------------------------------
// Login
// ------------------------------------------------------------

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");


// ------------------------------------------------------------
// Register
// ------------------------------------------------------------

const registerUsername =
    document.getElementById("registerUsername");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const registerConfirmPassword =
    document.getElementById("registerConfirmPassword");

const registerBtn =
    document.getElementById("registerBtn");

const registerMessage =
    document.getElementById("registerMessage");


// ------------------------------------------------------------
// Switch buttons
// ------------------------------------------------------------

const showRegisterBtn =
    document.getElementById("showRegisterBtn");

const showLoginBtn =
    document.getElementById("showLoginBtn");


// ============================================================
// DASHBOARD ELEMENTS
// ============================================================

const dashboardPage =
    document.getElementById("dashboardPage");

const logoutBtn =
    document.getElementById("logoutBtn");


// ------------------------------------------------------------
// User information
// ------------------------------------------------------------

const currentUsername =
    document.getElementById("currentUsername");

const currentEmail =
    document.getElementById("currentEmail");


// ------------------------------------------------------------
// Statistics
// ------------------------------------------------------------

const totalJobs =
    document.getElementById("totalJobs");

const queuedJobs =
    document.getElementById("queuedJobs");

const runningJobs =
    document.getElementById("runningJobs");

const completedJobs =
    document.getElementById("completedJobs");


// ------------------------------------------------------------
// Jobs
// ------------------------------------------------------------

const jobsList =
    document.getElementById("jobsList");

const jobSearch =
    document.getElementById("jobSearch");


// ------------------------------------------------------------
// Workers
// ------------------------------------------------------------

const workerCount =
    document.getElementById("workerCount");

const workersList =
    document.getElementById("workersList");


// ------------------------------------------------------------
// System
// ------------------------------------------------------------

const systemInfo =
    document.getElementById("systemInfo");


// ============================================================
// MODALS
// ============================================================

const createJobBtn =
    document.getElementById("createJobBtn");

const addWorkerBtn =
    document.getElementById("addWorkerBtn");


const jobModal =
    document.getElementById("jobModal");

const workerModal =
    document.getElementById("workerModal");


const closeJobModal =
    document.getElementById("closeJobModal");

const closeWorkerModal =
    document.getElementById("closeWorkerModal");


const submitJobBtn =
    document.getElementById("submitJobBtn");

const submitWorkerBtn =
    document.getElementById("submitWorkerBtn");


const jobType =
    document.getElementById("jobType");

const jobMessage =
    document.getElementById("jobMessage");

const workerName =
    document.getElementById("workerName");


// ============================================================
// DATA
// ============================================================

let allJobs = [];

let allWorkers = [];

let allQueues = [];

let currentUser = null;


// ============================================================
// TOKEN FUNCTIONS
// ============================================================

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function saveToken(token) {

    localStorage.setItem(
        TOKEN_KEY,
        token
    );

}


function removeToken() {

    localStorage.removeItem(
        TOKEN_KEY
    );

}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLoginPage() {

    if (authPage) {

        authPage.classList.remove(
            "hidden"
        );

    }


    if (loginForm) {

        loginForm.classList.remove(
            "hidden"
        );

    }


    if (registerForm) {

        registerForm.classList.add(
            "hidden"
        );

    }


    if (dashboardPage) {

        dashboardPage.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// SHOW REGISTER
// ============================================================

function showRegisterPage() {

    if (authPage) {

        authPage.classList.remove(
            "hidden"
        );

    }


    if (loginForm) {

        loginForm.classList.add(
            "hidden"
        );

    }


    if (registerForm) {

        registerForm.classList.remove(
            "hidden"
        );

    }


    if (dashboardPage) {

        dashboardPage.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// SHOW DASHBOARD
// ============================================================

function showDashboard() {

    if (authPage) {

        authPage.classList.add(
            "hidden"
        );

    }


    if (dashboardPage) {

        dashboardPage.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// LOGIN MESSAGE
// ============================================================

function showLoginMessage(
    message,
    success = false
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.style.color =
        success
            ? "#16a34a"
            : "#dc2626";

}


// ============================================================
// REGISTER MESSAGE
// ============================================================

function showRegisterMessage(
    message,
    success = false
) {

    if (!registerMessage) {

        return;

    }


    registerMessage.textContent =
        message;


    registerMessage.style.color =
        success
            ? "#16a34a"
            : "#dc2626";

}


// ============================================================
// API REQUEST
// ============================================================

async function apiRequest(
    url,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    // --------------------------------------------------------
    // Add JWT token
    // --------------------------------------------------------

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }


    let response;


    try {

        response =
            await fetch(

                API_BASE + url,

                {

                    ...options,

                    headers:
                        headers

                }

            );

    }

    catch (error) {

        console.error(
            "Network error:",
            error
        );

        throw new Error(
            "Unable to connect to the OpenScheduler API."
        );

    }


    const text =
        await response.text();


    let data = {};


    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    }

    catch {

        data = {

            message:
                text

        };

    }


    // --------------------------------------------------------
    // Unauthorized
    // --------------------------------------------------------

    if (
        response.status === 401
    ) {

        removeToken();

        currentUser = null;

        showLoginPage();

        throw new Error(

            data.detail ||

            data.message ||

            "Login session expired."

        );

    }


    // --------------------------------------------------------
    // Other API errors
    // --------------------------------------------------------

    if (!response.ok) {

        console.error(
            "API ERROR:",
            response.status,
            data
        );


        throw new Error(

            data.detail ||

            data.message ||

            `Request failed (${response.status})`

        );

    }


    return data;

}


// ============================================================
// SWITCH TO REGISTER
// ============================================================

if (showRegisterBtn) {

    showRegisterBtn.addEventListener(

        "click",

        () => {

            showRegisterMessage("");

            showRegisterPage();

        }

    );

}


// ============================================================
// SWITCH TO LOGIN
// ============================================================

if (showLoginBtn) {

    showLoginBtn.addEventListener(

        "click",

        () => {

            showLoginMessage("");

            showLoginPage();

        }

    );

}


// ============================================================
// REGISTER
// ============================================================

async function register() {

    const username =
        registerUsername
            .value
            .trim();


    const email =
        registerEmail
            .value
            .trim();


    const password =
        registerPassword
            .value;


    const confirmPassword =
        registerConfirmPassword
            .value;


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!username) {

        showRegisterMessage(
            "Please enter a username."
        );

        return;

    }


    if (!email) {

        showRegisterMessage(
            "Please enter your email."
        );

        return;

    }


    if (!password) {

        showRegisterMessage(
            "Please enter a password."
        );

        return;

    }


    if (password.length < 6) {

        showRegisterMessage(
            "Password must be at least 6 characters."
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        showRegisterMessage(
            "Passwords do not match."
        );

        return;

    }


    registerBtn.disabled =
        true;


    registerBtn.textContent =
        "Creating Account...";


    try {

        console.log(
            "Registering user..."
        );


        const result =
            await apiRequest(

                API_ROUTES.register,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            username:
                                username,

                            email:
                                email,

                            password:
                                password

                        })

                }

            );


        console.log(
            "Registration successful:",
            result
        );


        showRegisterMessage(

            "Account created successfully! You can now login.",

            true

        );


        // ----------------------------------------------------
        // Clear form
        // ----------------------------------------------------

        registerUsername.value =
            "";

        registerEmail.value =
            "";

        registerPassword.value =
            "";

        registerConfirmPassword.value =
            "";


        // ----------------------------------------------------
        // Switch to login
        // ----------------------------------------------------

        setTimeout(

            () => {

                loginEmail.value =
                    email;

                showLoginPage();

                showLoginMessage(

                    "Account created successfully. Please login.",

                    true

                );

            },

            800

        );

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showRegisterMessage(
            error.message
        );

    }

    finally {

        registerBtn.disabled =
            false;

        registerBtn.textContent =
            "Create Account";

    }

}


// ============================================================
// REGISTER BUTTON
// ============================================================

if (registerBtn) {

    registerBtn.addEventListener(

        "click",

        register

    );

}


// ============================================================
// ENTER KEY REGISTER
// ============================================================

if (registerConfirmPassword) {

    registerConfirmPassword.addEventListener(

        "keydown",

        event => {

            if (
                event.key ===
                "Enter"
            ) {

                register();

            }

        }

    );

}


// ============================================================
// LOGIN
// ============================================================

async function login() {

    const email =
        loginEmail
            .value
            .trim();


    const password =
        loginPassword
            .value;


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!email) {

        showLoginMessage(
            "Please enter your email."
        );

        return;

    }


    if (!password) {

        showLoginMessage(
            "Please enter your password."
        );

        return;

    }


    loginBtn.disabled =
        true;


    loginBtn.textContent =
        "Logging in...";


    try {

        console.log(
            "Logging in..."
        );


        const result =
            await apiRequest(

                API_ROUTES.login,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                }

            );


        console.log(
            "Login response:",
            result
        );


        // ----------------------------------------------------
        // Save JWT
        // ----------------------------------------------------

        if (!result.access_token) {

            throw new Error(
                "Login succeeded but no access token was returned."
            );

        }


        saveToken(
            result.access_token
        );


        // ----------------------------------------------------
        // Save current user
        // ----------------------------------------------------

        currentUser =
            result.user ||
            null;


        showLoginMessage(

            "Login successful!",

            true

        );


        // ----------------------------------------------------
        // Show dashboard
        // ----------------------------------------------------

        showDashboard();


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        showLoginMessage(
            error.message
        );

    }

    finally {

        loginBtn.disabled =
            false;

        loginBtn.textContent =
            "Login";

    }

}


// ============================================================
// LOGIN BUTTON
// ============================================================

if (loginBtn) {

    loginBtn.addEventListener(

        "click",

        login

    );

}


// ============================================================
// ENTER KEY LOGIN
// ============================================================

if (loginPassword) {

    loginPassword.addEventListener(

        "keydown",

        event => {

            if (
                event.key ===
                "Enter"
            ) {

                login();

            }

        }

    );

}


// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        () => {

            removeToken();

            currentUser =
                null;

            allJobs =
                [];

            allWorkers =
                [];

            allQueues =
                [];


            if (loginEmail) {

                loginEmail.value =
                    "";

            }


            if (loginPassword) {

                loginPassword.value =
                    "";

            }


            showLoginMessage("");

            showLoginPage();

        }

    );

}


// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser() {

    const token =
        getToken();


    if (!token) {

        showLoginPage();

        return false;

    }


    try {

        currentUser =
            await apiRequest(
                API_ROUTES.me
            );


        showDashboard();

        return true;

    }

    catch (error) {

        console.error(
            "Could not verify user:",
            error
        );


        removeToken();

        currentUser =
            null;

        showLoginPage();

        return false;

    }

}


// ============================================================
// DISPLAY CURRENT USER
// ============================================================

function displayCurrentUser() {

    if (!currentUser) {

        return;

    }


    if (currentUsername) {

        currentUsername.textContent =

            currentUser.username ||

            currentUser.name ||

            "User";

    }


    if (currentEmail) {

        currentEmail.textContent =

            currentUser.email ||

            "";

    }

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        displayCurrentUser();


        // ----------------------------------------------------
        // Load queues
        // ----------------------------------------------------

        await loadQueues();


        // ----------------------------------------------------
        // Create default queue if needed
        // ----------------------------------------------------

        if (
            allQueues.length ===
            0
        ) {

            await createDefaultQueue();

            await loadQueues();

        }


        // ----------------------------------------------------
        // Load jobs and workers
        // ----------------------------------------------------

        await Promise.all([

            loadJobs(),

            loadWorkers()

        ]);


        updateSystemInfo(true);

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        updateSystemInfo(false);

    }

}


// ============================================================
// LOAD QUEUES
// ============================================================

async function loadQueues() {

    const queues =
        await apiRequest(
            API_ROUTES.queues
        );


    allQueues =

        Array.isArray(queues)

            ? queues

            : [];

}


// ============================================================
// CREATE DEFAULT QUEUE
// ============================================================

async function createDefaultQueue() {

    try {

        await apiRequest(

            API_ROUTES.queues,

            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        name:
                            "Default Queue",

                        description:
                            "Default job queue"

                    })

            }

        );

    }

    catch (error) {

        console.error(

            "Could not create default queue:",

            error

        );

    }

}


// ============================================================
// GET QUEUE NAME
// ============================================================

function getQueueName(job) {

    const queueId =

        job.queue_id ||

        job.queueId;


    if (!queueId) {

        return "Default Queue";

    }


    const queue =

        allQueues.find(

            q =>

                String(q.id) ===
                String(queueId)

        );


    if (queue) {

        return queue.name;

    }


    return "Job Queue";

}


// ============================================================
// LOAD JOBS
// ============================================================

async function loadJobs() {

    try {

        const jobs =
            await apiRequest(
                API_ROUTES.jobs
            );


        allJobs =

            Array.isArray(jobs)

                ? jobs

                : [];


        renderJobs(
            allJobs
        );


        updateJobStatistics(
            allJobs
        );

    }

    catch (error) {

        console.error(
            "Could not load jobs:",
            error
        );


        if (jobsList) {

            jobsList.innerHTML = `

                <div class="empty-state">

                    Unable to load jobs

                </div>

            `;

        }


        throw error;

    }

}


// ============================================================
// JOB STATISTICS
// ============================================================

function updateJobStatistics(
    jobs
) {

    let queued = 0;

    let running = 0;

    let completed = 0;


    jobs.forEach(

        job => {

            const status =

                String(
                    job.status || ""
                ).toUpperCase();


            if (
                status ===
                "QUEUED"
            ) {

                queued++;

            }


            if (
                status ===
                "RUNNING"
            ) {

                running++;

            }


            if (
                status ===
                "COMPLETED"
            ) {

                completed++;

            }

        }

    );


    if (totalJobs) {

        totalJobs.textContent =
            jobs.length;

    }


    if (queuedJobs) {

        queuedJobs.textContent =
            queued;

    }


    if (runningJobs) {

        runningJobs.textContent =
            running;

    }


    if (completedJobs) {

        completedJobs.textContent =
            completed;

    }

}


// ============================================================
// JOB SEARCH
// ============================================================

if (jobSearch) {

    jobSearch.addEventListener(

        "input",

        () => {

            const text =

                jobSearch
                    .value
                    .toLowerCase()
                    .trim();


            const filtered =

                allJobs.filter(

                    job => {

                        const content = `

                            ${formatJobName(job)}

                            ${getJobDescription(job)}

                            ${getQueueName(job)}

                            ${job.status || ""}

                        `.toLowerCase();


                        return content.includes(
                            text
                        );

                    }

                );


            renderJobs(
                filtered
            );

        }

    );

}


// ============================================================
// RENDER JOBS
// ============================================================

function renderJobs(jobs) {

    if (!jobsList) {

        return;

    }


    if (
        !jobs ||
        jobs.length === 0
    ) {

        jobsList.innerHTML = `

            <div class="empty-state">

                No jobs found

            </div>

        `;

        return;

    }


    jobsList.innerHTML =
        "";


    jobs.forEach(

        job => {

            const status =

                String(

                    job.status ||

                    "UNKNOWN"

                ).toUpperCase();


            const statusClass =

                status
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9_-]/g,
                        ""
                    );


            const card =

                document.createElement(
                    "div"
                );


            card.className =
                "job-card";


            card.innerHTML = `

                <div class="job-info">

                    <h3>

                        ${getJobIcon(job)}

                        ${escapeHTML(
                            formatJobName(job)
                        )}

                    </h3>


                    <p class="job-description">

                        ${escapeHTML(
                            getJobDescription(job)
                        )}

                    </p>


                    <p class="job-queue">

                        <strong>
                            Queue:
                        </strong>

                        ${escapeHTML(
                            getQueueName(job)
                        )}

                    </p>

                </div>


                <div class="job-actions">

                    <div
                        class="job-status ${statusClass}"
                    >

                        ${escapeHTML(
                            status
                        )}

                    </div>


                    <button
                        class="delete-job-btn"
                        data-job-id="${escapeHTML(
                            job.id
                        )}"
                        title="Delete Job"
                    >

                        🗑️

                    </button>

                </div>

            `;


            jobsList.appendChild(
                card
            );

        }

    );


    // --------------------------------------------------------
    // Delete buttons
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".delete-job-btn"
        )
        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    async () => {

                        const jobId =
                            button.dataset.jobId;


                        if (!jobId) {

                            return;

                        }


                        if (

                            !confirm(

                                "Are you sure you want to delete this job?"

                            )

                        ) {

                            return;

                        }


                        try {

                            button.disabled =
                                true;

                            button.textContent =
                                "⏳";


                            await apiRequest(

                                `${API_ROUTES.jobs}${jobId}`,

                                {

                                    method:
                                        "DELETE"

                                }

                            );


                            await loadDashboard();

                        }

                        catch (error) {

                            console.error(

                                "Delete job error:",

                                error

                            );


                            alert(
                                error.message
                            );


                            button.disabled =
                                false;

                            button.textContent =
                                "🗑️";

                        }

                    }

                );

            }

        );

}


// ============================================================
// JOB NAME
// ============================================================

function formatJobName(job) {

    let type =

        job.job_type ||

        job.type ||

        "";


    const payload =
        job.payload;


    if (

        payload &&

        typeof payload ===
            "object"

    ) {

        if (payload.type) {

            type =
                payload.type;

        }

        else if (
            payload.job_type
        ) {

            type =
                payload.job_type;

        }

    }


    if (!type) {

        type =
            "Background Job";

    }


    return String(type)

        .replace(
            /_/g,
            " "
        )

        .replace(
            /-/g,
            " "
        )

        .split(" ")

        .map(

            word =>

                word.charAt(0).toUpperCase() +

                word.slice(1).toLowerCase()

        )

        .join(" ");

}


// ============================================================
// JOB DESCRIPTION
// ============================================================

function getJobDescription(job) {

    const payload =
        job.payload;


    if (

        payload &&

        typeof payload ===
            "object"

    ) {

        return String(

            payload.message ||

            payload.description ||

            payload.task ||

            payload.text ||

            payload.data ||

            "Background task"

        );

    }


    if (payload) {

        return String(
            payload
        );

    }


    return "Background task";

}


// ============================================================
// JOB ICON
// ============================================================

function getJobIcon(job) {

    const type =

        String(

            job.job_type ||

            job.type ||

            job.payload?.type ||

            ""

        ).toLowerCase();


    if (
        type.includes("email")
    ) {

        return "📧";

    }


    if (
        type.includes("invoice")
    ) {

        return "🧾";

    }


    if (
        type.includes("image")
    ) {

        return "🖼️";

    }


    if (
        type.includes("notification")
    ) {

        return "🔔";

    }


    if (
        type.includes("report")
    ) {

        return "📊";

    }


    return "⚡";

}


// ============================================================
// LOAD WORKERS
// ============================================================

async function loadWorkers() {

    try {

        const workers =
            await apiRequest(
                API_ROUTES.workers
            );


        allWorkers =

            Array.isArray(workers)

                ? workers

                : [];


        renderWorkers(
            allWorkers
        );

    }

    catch (error) {

        console.error(

            "Could not load workers:",

            error

        );


        if (workersList) {

            workersList.innerHTML = `

                <div class="empty-state">

                    Unable to load workers

                </div>

            `;

        }


        if (workerCount) {

            workerCount.textContent =
                "0 workers";

        }


        throw error;

    }

}


// ============================================================
// RENDER WORKERS
// ============================================================

function renderWorkers(workers) {

    if (!workersList) {

        return;

    }


    if (
        !workers ||
        workers.length === 0
    ) {

        if (workerCount) {

            workerCount.textContent =
                "0 workers";

        }


        workersList.innerHTML = `

            <div class="empty-state">

                No workers registered

            </div>

        `;

        return;

    }


    if (workerCount) {

        workerCount.textContent =

            `${workers.length} worker${
                workers.length === 1
                    ? ""
                    : "s"
            }`;

    }


    workersList.innerHTML =
        "";


    workers.forEach(

        worker => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "worker-card";


            const name =

                worker.name ||

                "Worker";


            const status =

                String(

                    worker.status ||

                    "IDLE"

                ).toUpperCase();


            card.innerHTML = `

                <div
                    class="worker-info-section"
                >

                    <div class="worker-name">

                        👷

                        ${escapeHTML(
                            name
                        )}

                    </div>


                    <div class="worker-description">

                        Ready to process jobs

                    </div>


                    <div class="worker-status online">

                        ●

                        ${escapeHTML(
                            status
                        )}

                    </div>

                </div>


                <button
                    class="delete-worker-btn"
                    data-worker-id="${escapeHTML(
                        worker.id
                    )}"
                    title="Delete Worker"
                >

                    🗑️

                </button>

            `;


            workersList.appendChild(
                card
            );

        }

    );


    // --------------------------------------------------------
    // Delete worker buttons
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".delete-worker-btn"
        )
        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    async () => {

                        const workerId =
                            button.dataset.workerId;


                        if (!workerId) {

                            return;

                        }


                        if (

                            !confirm(

                                "Are you sure you want to delete this worker?"

                            )

                        ) {

                            return;

                        }


                        try {

                            button.disabled =
                                true;

                            button.textContent =
                                "⏳";


                            await apiRequest(

                                `${API_ROUTES.workers}${workerId}`,

                                {

                                    method:
                                        "DELETE"

                                }

                            );


                            await loadWorkers();

                        }

                        catch (error) {

                            console.error(

                                "Delete worker error:",

                                error

                            );


                            alert(
                                error.message
                            );


                            button.disabled =
                                false;

                            button.textContent =
                                "🗑️";

                        }

                    }

                );

            }

        );

}


// ============================================================
// OPEN JOB MODAL
// ============================================================

if (createJobBtn) {

    createJobBtn.addEventListener(

        "click",

        () => {

            if (jobModal) {

                jobModal.classList.remove(
                    "hidden"
                );

            }

        }

    );

}


// ============================================================
// CLOSE JOB MODAL
// ============================================================

if (closeJobModal) {

    closeJobModal.addEventListener(

        "click",

        () => {

            if (jobModal) {

                jobModal.classList.add(
                    "hidden"
                );

            }

        }

    );

}


// ============================================================
// OPEN WORKER MODAL
// ============================================================

if (addWorkerBtn) {

    addWorkerBtn.addEventListener(

        "click",

        () => {

            if (workerModal) {

                workerModal.classList.remove(
                    "hidden"
                );

            }


            if (workerName) {

                workerName.focus();

            }

        }

    );

}


// ============================================================
// CLOSE WORKER MODAL
// ============================================================

if (closeWorkerModal) {

    closeWorkerModal.addEventListener(

        "click",

        () => {

            if (workerModal) {

                workerModal.classList.add(
                    "hidden"
                );

            }

        }

    );

}


// ============================================================
// CLOSE MODALS OUTSIDE
// ============================================================

if (jobModal) {

    jobModal.addEventListener(

        "click",

        event => {

            if (
                event.target ===
                jobModal
            ) {

                jobModal.classList.add(
                    "hidden"
                );

            }

        }

    );

}


if (workerModal) {

    workerModal.addEventListener(

        "click",

        event => {

            if (
                event.target ===
                workerModal
            ) {

                workerModal.classList.add(
                    "hidden"
                );

            }

        }

    );

}


// ============================================================
// ADD WORKER
// ============================================================

if (submitWorkerBtn) {

    submitWorkerBtn.addEventListener(

        "click",

        async () => {

            const name =

                workerName
                    .value
                    .trim();


            if (!name) {

                alert(
                    "Please enter a worker name."
                );

                return;

            }


            submitWorkerBtn.disabled =
                true;

            submitWorkerBtn.textContent =
                "Adding...";


            try {

                await apiRequest(

                    API_ROUTES.workers,

                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify({

                                name:
                                    name

                            })

                    }

                );


                workerName.value =
                    "";


                workerModal.classList.add(
                    "hidden"
                );


                await loadWorkers();

            }

            catch (error) {

                console.error(

                    "Add worker error:",

                    error

                );


                alert(
                    error.message
                );

            }

            finally {

                submitWorkerBtn.disabled =
                    false;

                submitWorkerBtn.textContent =
                    "Add Worker";

            }

        }

    );

}


// ============================================================
// CREATE JOB
// ============================================================

if (submitJobBtn) {

    submitJobBtn.addEventListener(

        "click",

        async () => {

            const type =
                jobType.value;


            const message =
                jobMessage
                    .value
                    .trim();


            if (!message) {

                alert(
                    "Please enter a job description."
                );

                return;

            }


            submitJobBtn.disabled =
                true;

            submitJobBtn.textContent =
                "Creating...";


            try {

                // ------------------------------------------------
                // Load queues
                // ------------------------------------------------

                await loadQueues();


                if (
                    allQueues.length ===
                    0
                ) {

                    await createDefaultQueue();

                    await loadQueues();

                }


                if (
                    allQueues.length ===
                    0
                ) {

                    throw new Error(

                        "No queue is available for your account."

                    );

                }


                const queue =
                    allQueues[0];


                // ------------------------------------------------
                // Create job
                // ------------------------------------------------

                const jobData = {

                    queue_id:
                        queue.id,

                    payload: {

                        type:
                            type,

                        message:
                            message

                    },

                    priority:
                        0

                };


                console.log(
                    "Creating job:",
                    jobData
                );


                await apiRequest(

                    API_ROUTES.jobs,

                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify(
                                jobData
                            )

                    }

                );


                jobMessage.value =
                    "";


                jobModal.classList.add(
                    "hidden"
                );


                await loadDashboard();

            }

            catch (error) {

                console.error(

                    "Create job error:",

                    error

                );


                alert(

                    "Could not create job.\n\n" +

                    error.message

                );

            }

            finally {

                submitJobBtn.disabled =
                    false;

                submitJobBtn.textContent =
                    "Create Job";

            }

        }

    );

}


// ============================================================
// SYSTEM STATUS
// ============================================================

function updateSystemInfo(
    online
) {

    if (!systemInfo) {

        return;

    }


    if (!online) {

        systemInfo.innerHTML = `

            <strong>
                System Status:
            </strong>

            <span style="color:#dc2626;">

                ● API Offline

            </span>

        `;

        return;

    }


    systemInfo.innerHTML = `

        <strong>
            System Status:
        </strong>

        <span style="color:#16a34a;">

            ● API Online

        </span>

        &nbsp;&nbsp; | &nbsp;&nbsp;

        Last updated:

        ${new Date().toLocaleTimeString()}

    `;

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// START APPLICATION
// ============================================================

async function startApplication() {

    const loggedIn =
        await loadCurrentUser();


    if (loggedIn) {

        await loadDashboard();

    }

}


startApplication();


// ============================================================
// AUTO REFRESH
// ============================================================

setInterval(

    async () => {

        if (!getToken()) {

            return;

        }


        if (

            dashboardPage &&

            dashboardPage.classList.contains(
                "hidden"
            )

        ) {

            return;

        }


        try {

            await loadDashboard();

        }

        catch (error) {

            console.error(

                "Auto refresh error:",

                error

            );

        }

    },

    5000

);