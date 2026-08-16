// frontend/app.js - Fixed Zero-Error Production Engine
const BACKEND_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    // --- UI NAVIGATION TAB CONTROLLERS ---
    const navButtons = document.querySelectorAll(".nav-control-btn");
    const viewPanels = document.querySelectorAll(".view-panel");

    // --- DOM ELEMENT TRACKERS FOR FORMS ---
    const projectForm = document.getElementById("project-creation-form");
    const projectNameInput = document.getElementById("project-name");
    const projectDescInput = document.getElementById("project-desc");
    
    const taskForm = document.getElementById("task-creation-form");
    const taskProjectSelect = document.getElementById("task-project-select");
    const taskTitleInput = document.getElementById("task-title");
    const taskDueDateInput = document.getElementById("task-due-date");
    const taskPriorityInput = document.getElementById("task-priority");
    const titleError = document.getElementById("title-error");
    
    const projectsGridContainer = document.getElementById("projects-grid-container");
    const taskListContainer = document.getElementById("task-list-container");

    // --- 🔍 ALGORITHMIC SEARCH TRACKERS ---
    const searchInput = document.getElementById("global-task-search-input");
    const algoSelector = document.getElementById("search-algorithm-selector");
    const detailsModal = document.getElementById("task-details-modal");
    const modalCloseBtn = document.getElementById("modal-close-trigger-btn");

        // ==========================================================================
    // 👤 DYNAMIC SESSION TRACKERS (UPGRADED MATRICES COORD)
    // ==========================================================================
    const loginActionBtn = document.getElementById("sidebar-login-action-btn");
    const userProfileCard = document.getElementById("active-user-profile-card");
    const loginModal = document.getElementById("user-login-modal");
    const loginCloseBtn = document.getElementById("modal-login-close-btn");
    const authSubmissionForm = document.getElementById("real-auth-submission-form");
    let activeSessionUser = null;

    // ==========================================================================
    // 🏠 SIDEBAR TABS NAV SWITCHING CONTROLLER
    // ==========================================================================
    if (typeof navButtons !== 'undefined' && navButtons) {
        navButtons.forEach(button => {
            button.addEventListener("click", () => {
                navButtons.forEach(btn => btn.classList.remove("active"));
                if (typeof viewPanels !== 'undefined' && viewPanels) {
                    viewPanels.forEach(panel => panel.classList.remove("active"));
                }

                button.classList.add("active");
                const targetViewId = button.getAttribute("data-target");
                const targetPanel = document.getElementById(targetViewId);
                
                if (targetPanel) {
                    targetPanel.classList.add("active");
                    if (targetViewId === "home-view") fetchLiveProjects();
                    if (targetViewId === "project-view") populateProjectDropdown();
                    if (targetViewId === "task-view") fetchLiveTasks();
                }
            });
        });
    }

    // ==========================================================================
    // 👤 INTERACTIVE USER SESSION AND REGISTRATION FLOW
    // ==========================================================================
    if (loginActionBtn && loginModal) {
        loginActionBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("[HYPERFLOW OPS]: Initializing clean operational login window triggers...");
            loginModal.classList.add("display-active");
        });
    }
    
    if (loginCloseBtn && loginModal) {
        loginCloseBtn.addEventListener("click", () => {
            loginModal.classList.remove("display-active");
        });
    }
    
    if (authSubmissionForm) {
        authSubmissionForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const payload = {
                name: document.getElementById("login-user-name").value.trim(),
                email: document.getElementById("login-user-email").value.trim(),
                role: document.getElementById("login-user-role").value
            };
            fetch(`${BACKEND_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => { if (!res.ok && res.status !== 400) throw new Error("Fail"); return res.json(); })
            .then(userData => {
                if (userData.detail && userData.detail === "Email already registered") {
                    return fetch(`${BACKEND_URL}/users`).then(r => r.json()).then(allUsers => {
                        const match = allUsers.find(u => u.email === payload.email);
                        if (match) initializeUserSession(match);
                        finalizeLoginState();
                    });
                }
                initializeUserSession(userData);
                finalizeLoginState();
            }).catch(err => alert("❌ START SERVER: Run 'uvicorn backend.main:app --reload' in terminal first."));
        });
    }

    function finalizeLoginState() {
        if (authSubmissionForm) authSubmissionForm.reset();
        if (loginModal) loginModal.classList.remove("display-active");
        alert("👋 Pod Session Authorized Successfully!"); fetchLiveProjects(); fetchLiveTasks();
    }
    
        // ==========================================================================
    // 👤 DYNAMIC DROPDOWN PROFILE INTEGRATION CONTROL & INLINE PROFILE EDIT
    // = [KAAM]: Active profile setup, click dropdown toggles, aur database profile updates
    // ==========================================================================
    function initializeUserSession(user) {
        activeSessionUser = user; 
        localStorage.setItem("taskflow_active_session_token", JSON.stringify(user));
        
        // A. Login button ko hard hide karo taaki layout crash na ho
        if (loginActionBtn) loginActionBtn.style.display = "none";
        
        const dropDrawer = document.getElementById("profile-details-drop-drawer");
        const viewPanel = document.getElementById("drawer-view-mode-panel");
        const editForm = document.getElementById("drawer-edit-mode-form");
        
        if (userProfileCard) {
            userProfileCard.classList.remove("content-hidden");
            userProfileCard.style.display = "flex"; // Explicitly flex setup alignment ke liye
            
            const nameEl = document.getElementById("logged-user-name");
            const roleEl = document.getElementById("logged-user-role");
            const avatarEl = document.getElementById("profile-avatar-letter");

            if (nameEl) nameEl.textContent = user.name;
            if (roleEl) roleEl.textContent = user.role;
            if (avatarEl) {
                const initials = user.name.split(" ").map(n => n).join("").toUpperCase().substring(0, 2);
                avatarEl.textContent = initials || "OP";
            }

            // 🔀 TOGGLE CLICK CONTROLLER: Card par click hote hi drop-drawer toggle karna
            userProfileCard.addEventListener("click", (e) => {
                e.stopPropagation(); // Event ko window par transfer hone se rokna
                if (dropDrawer) {
                    // Drawer ke andar dynamic text mapping values load karna
                    if (document.getElementById("drawer-user-name")) document.getElementById("drawer-user-name").textContent = user.name;
                    if (document.getElementById("drawer-user-subtitle")) document.getElementById("drawer-user-subtitle").textContent = user.role;
                    if (document.getElementById("drawer-user-email")) document.getElementById("drawer-user-email").textContent = user.email;
                    
                    const isVisible = dropDrawer.style.display === "flex";
                    if (!isVisible) {
                        // Fresh popup open hone par read-only display panel back defaults par laye
                        if (viewPanel) viewPanel.style.display = "block";
                        if (editForm) { editForm.style.display = "none"; editForm.classList.add("content-hidden"); }
                        dropDrawer.style.display = "flex";
                    } else {
                        dropDrawer.style.display = "none";
                    }
                }
            });
        }

        // Window par kahin bhi click karne par dropdown automatic hide (close) ho jaye
        document.addEventListener("click", () => {
            if (dropDrawer) dropDrawer.style.display = "none";
        });
        if (dropDrawer) {
            dropDrawer.addEventListener("click", (e) => e.stopPropagation()); // Box ke andar click par close na ho
        }

        // ✏️ TRIGGER CONTROL 1: Edit click par input field active karna aur purana data pre-fill karna
        const editTriggerBtn = document.getElementById("sidebar-inline-edit-trigger-btn");
        if (editTriggerBtn && viewPanel && editForm) {
            editTriggerBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                viewPanel.style.display = "none";
                editForm.classList.remove("content-hidden");
                editForm.style.display = "flex";
                
                if (document.getElementById("edit-user-name")) document.getElementById("edit-user-name").value = user.name;
                if (document.getElementById("edit-user-role")) document.getElementById("edit-user-role").value = user.role;
            });
        }

        // TRIGGER CONTROL 2: Cancel click par wapas text parameters panel active karna
        const editCancelBtn = document.getElementById("btn-edit-cancel");
        if (editCancelBtn && viewPanel && editForm) {
            editCancelBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                editForm.style.display = "none";
                editForm.classList.add("content-hidden");
                viewPanel.style.display = "block";
            });
        }

        // 🔥 TRIGGER CONTROL 3: Save Form Submission - Dynamic Network Post back to database
        if (editForm) {
            editForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const updatedName = document.getElementById("edit-user-name").value.trim();
                const updatedRole = document.getElementById("edit-user-role").value;

                if (!updatedName) return;

                fetch(`${BACKEND_URL}/users`, {
                    method: "POST", // Standard overlapping update endpoint handles database save logs natively
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: updatedName, role: updatedRole, email: user.email })
                })
                .then(res => { if (!res.ok) throw new Error("Sync fault"); return res.json(); })
                .then(updatedUserData => {
                    // Lock fresh properties data inside browser storage engine keys safely
                    initializeUserSession(updatedUserData);
                    
                    // Toggle views state layout smoothly backwards
                    editForm.style.display = "none";
                    editForm.classList.add("content-hidden");
                    viewPanel.style.display = "block";
                    if (dropDrawer) dropDrawer.style.display = "none";
                    
                    alert("✏️ Profile Data Updated & Synchronized successfully!");
                    if (typeof fetchLiveProjects === "function") fetchLiveProjects(); // Refresh workspace items indicators
                })
                .catch(err => console.error("Profile modification database error trace:", err));
            });
        }

        // 🚪 REAL-TIME BOTTOM RIGHT SIGN OUT LIFECYCLE CONTROLLER
        const inlineLogoutBtn = document.getElementById("sidebar-inline-logout-btn");
        if (inlineLogoutBtn) {
            inlineLogoutBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to sign out and terminate this session?")) {
                    localStorage.removeItem("taskflow_active_session_token"); // Clears browser memory cache
                    alert("👋 Session Terminated. Restoring defaults!");
                    window.location.reload(); // Hard reload wapas zero state par laane ke liye
                }
            });
        }
    }

    // 🔄 Restore previous sessions cache from memory on page refresh
    let savedSession = localStorage.getItem("taskflow_active_session_token");
    if (savedSession) { 
        initializeUserSession(JSON.parse(savedSession)); 
    }

    // ==========================================================================
    // 🔍 ALGORITHMIC SEARCH FUNCTIONALITY (SECTION 2)
    // ==========================================================================
    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const targetQuery = searchInput.value.trim();
                const selectedAlgo = algoSelector ? algoSelector.value : "binary";
                if (targetQuery === "") { alert("Please type an exact title to search."); return; }
                fetch(`${BACKEND_URL}/tasks/search?title=${encodeURIComponent(targetQuery)}&algo=${selectedAlgo}`)
                .then(res => { if (res.status === 404) throw new Error("404"); return res.json(); })
                .then(taskData => {
                    document.getElementById("modal-task-title").textContent = `🔍 ${taskData.title}`;
                    document.getElementById("modal-task-id").textContent = taskData.id;
                    document.getElementById("modal-task-status").textContent = taskData.status;
                    document.getElementById("modal-task-priority").textContent = taskData.priority;
                    document.getElementById("modal-task-due").textContent = taskData.due_date || "No Deadline";
                    document.getElementById("modal-task-desc").textContent = taskData.description || "No notes logged.";
                    if (detailsModal) detailsModal.classList.add("display-active");
                    searchInput.value = ""; 
                }).catch(err => alert(err.message === "404" ? "❌ Task Absent under current indices!" : "Search failure."));
            }
        });
    }
    if (modalCloseBtn && detailsModal) {
        modalCloseBtn.addEventListener("click", () => detailsModal.classList.remove("display-active"));
    }

    // ==========================================================================
    // 📁 CREATE PROJECT WITH DYNAMIC TEXT-TYPED USER RESOLUTION
    // ==========================================================================
    if (projectForm) {
        projectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pName = projectNameInput.value.trim();
            const ownerTypedName = document.getElementById("project-owner-input") ? document.getElementById("project-owner-input").value.trim() : "";
            if (!pName || !ownerTypedName) { alert("All fields are required."); return; }
            if (!activeSessionUser) { alert("Please click login first."); return; }

            fetch(`${BACKEND_URL}/users`).then(res => res.json()).then(allUsers => {
                let matched = allUsers.find(u => u.name.toLowerCase() === ownerTypedName.toLowerCase());
                if (matched) return matched;
                return fetch(`${BACKEND_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: ownerTypedName, email: `${ownerTypedName.toLowerCase().replace(/\s+/g, '')}@blinkit.com`, role: "Core Engineer" })
                }).then(r => r.json());
            })
            .then(finalOwner => {
                return fetch(`${BACKEND_URL}/projects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: pName, description: projectDescInput.value.trim() || null, owner_id: finalOwner.id })
                });
            })
            .then(() => { projectForm.reset(); fetchLiveProjects(); alert(`🚀 Project initialized under: "${ownerTypedName}"!`); })
            .catch(err => console.error(err));
        });
    }
    // ==========================================================================
    // 📋 CREATE TASK FORM MANAGEMENT WITH CLIENT SIDE VALIDATION
    // ==========================================================================
    if (taskForm) {
        taskForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const tTitle = taskTitleInput.value.trim();
            const pId = parseInt(taskProjectSelect.value);
            if (!pId) { alert("Please create and select a project parameter first."); return; }
            if (tTitle === "") { titleError.textContent = "Title cannot be blank."; titleError.style.display = "block"; return; }
            if (!activeSessionUser) { alert("Please click login first."); return; }

            fetch(`${BACKEND_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: tTitle, due_date: taskDueDateInput.value.trim() || null, priority: taskPriorityInput.value, project_id: pId, status: "todo", assigned_to: activeSessionUser.id })
            })
            .then(res => res.json())
            .then(() => { taskForm.reset(); titleError.style.display = "none"; fetchLiveTasks(); alert("Task locked successfully!"); })
            .catch(err => console.error(err));
        });
    }
    
    // ==========================================================================
    // 🔄 DATA FETCH PIPELINES SYNC
    // = [KAAM]: Supabase Database se Projects aur Tasks ka live data kheench kar lana
    // ==========================================================================
    function fetchLiveProjects() {
        // [ACTION]: Live projects fetch karna aur local storage memory cache mein save karna
        fetch(`${BACKEND_URL}/projects`).then(res => res.json()).then(data => { localStorage.setItem("taskflow_cache_projects", JSON.stringify(data)); renderProjectsGrid(data); }).catch(e => console.log("offline"));
    }
    
    function fetchLiveTasks() {
        // [ACTION]: Live tasks fetch karna aur local storage memory cache mein save karna
        fetch(`${BACKEND_URL}/tasks`).then(res => res.json()).then(data => { localStorage.setItem("taskflow_cache_tasks", JSON.stringify(data)); renderTaskList(data); }).catch(e => console.log("offline"));
    }
    
    function populateProjectDropdown() {
        // [ACTION]: Task Form ke andar target project select karne ka dropdown fill karna
        if (!taskProjectSelect) return;
        fetch(`${BACKEND_URL}/projects`).then(res => res.json()).then(data => {
            taskProjectSelect.textContent = ""; if (data.length === 0) { const opt = document.createElement("option"); opt.textContent = "-- Create a Project First --"; taskProjectSelect.appendChild(opt); return; }
            data.forEach(p => { const opt = document.createElement("option"); opt.value = p.id; opt.textContent = p.name; taskProjectSelect.appendChild(opt); });
        }).catch(e => console.log("dropdown offline"));
    }

    // ==========================================================================
    // 🛡️ DYNAMIC STATE RENDERING ENGINE: TOGGLE HEADERS WITH NOT FOUND WIDGET
    // = [KAAM]: Khali database hone par Heading chhupana aur "Data Not Found!" box dikhana
    // ==========================================================================
    function renderProjectsGrid(projects) {
        if (!projectsGridContainer) return; projectsGridContainer.textContent = "";
        const viewHeaderElement = document.querySelector("#home-view .view-header");
        
        // --- 🚫 STATE A: AGAR DATABASE EKDOM KHALI HAI (NO PROJECTS FOUND) ---
        if (!projects || projects.length === 0) {
            if (viewHeaderElement) viewHeaderElement.style.display = "none"; // [ACTION]: Heading Gayab karna
            
            // [ACTION]: "Data Not Found! Please create a project first" wala dabba HTML mein create karna
            const emptyContainer = document.createElement("div");
            emptyContainer.style.display = "flex"; emptyContainer.style.flexDirection = "column"; emptyContainer.style.alignItems = "center"; emptyContainer.style.justifyContent = "center"; emptyContainer.style.padding = "60px 40px"; emptyContainer.style.textAlign = "center"; emptyContainer.style.backgroundColor = "var(--panel-charcoal)"; emptyContainer.style.border = "2px dashed var(--border-slate)"; emptyContainer.style.borderRadius = "16px"; emptyContainer.style.marginTop = "20px";
            const errorEmoji = document.createElement("span"); errorEmoji.textContent = "🔍"; errorEmoji.style.fontSize = "48px"; errorEmoji.style.marginBottom = "16px";
            const errorTitle = document.createElement("h2"); errorTitle.textContent = "Data Not Found!"; errorTitle.style.color = "var(--high-priority)"; errorTitle.style.fontSize = "22px"; errorTitle.style.marginBottom = "8px";
            const errorSubtitle = document.createElement("p"); errorSubtitle.textContent = "Please create a project first! Go to the 'Add Projects & Tasks' menu to initialize your first operational project domain."; errorSubtitle.style.color = "var(--text-subtle)"; errorSubtitle.style.fontSize = "14px"; errorSubtitle.style.maxWidth = "400px"; errorSubtitle.style.lineHeight = "1.5";
            emptyContainer.appendChild(errorEmoji); emptyContainer.appendChild(errorTitle); emptyContainer.appendChild(errorSubtitle); projectsGridContainer.appendChild(emptyContainer);
            return;
        }
                // --- 🚀 STATE B: AGAR DATABASE MEIN DATA AA GAYA HAI (SHOW CARDS GRID) ---
        if (viewHeaderElement) viewHeaderElement.style.display = "block"; // [ACTION]: Heading Wapas lana
        
        const projModal = document.getElementById("project-details-modal");
        const projModalClose = document.getElementById("modal-proj-close-btn");
        if (projModalClose && projModal) { 
            projModalClose.addEventListener("click", () => projModal.classList.remove("display-active")); 
        }

        // [ACTION]: Saare projects ke liye alag-alag Square Card Boxes generate karna unke Owner Logo ke saath
        fetch(`${BACKEND_URL}/users`).then(res => res.json()).then(allUsers => {
            projects.forEach(p => {
                const card = document.createElement("div"); card.className = "project-box-card"; card.style.cursor = "pointer";
                const t = document.createElement("div"); t.className = "project-card-title"; t.textContent = `📦 ${p.name}`;

                // Initials nikalna logo ke liye (Rahul Kumar -> RK)
                const mOwner = allUsers.find(u => u.id === p.owner_id);
                const oName = mOwner ? mOwner.name : "Unassigned Lead";
                const oRole = mOwner ? mOwner.role : "Pod Operator";
                const initials = oName.split(" ").map(n => n).join("").toUpperCase().substring(0, 2);

                const oz = document.createElement("div"); oz.style.display = "flex"; oz.style.alignItems = "center"; oz.style.gap = "10px"; oz.style.margin = "12px 0 16px 0"; oz.style.padding = "8px"; oz.style.backgroundColor = "#242426"; oz.style.borderRadius = "8px"; oz.style.border = "1px solid var(--border-slate)";
                const av = document.createElement("div"); av.textContent = initials; av.style.width = "30px"; av.style.height = "30px"; av.style.backgroundColor = "var(--blinkit-yellow)"; av.style.color = "#000"; av.style.borderRadius = "50%"; av.style.display = "flex"; av.style.alignItems = "center"; av.style.justifyContent = "center"; av.style.fontWeight = "700"; av.style.fontSize = "11px";
                const mm = document.createElement("div"); mm.style.display = "flex"; mm.style.flexDirection = "column";
                const nl = document.createElement("span"); nl.textContent = oName; nl.style.fontSize = "13px"; nl.style.fontWeight = "600";
                const rl = document.createElement("span"); rl.textContent = oRole; rl.style.fontSize = "10px"; rl.style.color = "var(--text-subtle)";

                mm.appendChild(nl); mm.appendChild(rl); oz.appendChild(av); oz.appendChild(mm);
                const d = document.createElement("div"); d.className = "project-card-desc"; d.textContent = p.description || "No allocation description.";

                // [ACTION]: Card box par CLICK karte hi Statistics ka dynamic analytical overlay modal kholna
                card.addEventListener("click", (event) => {
                    if (event.target.tagName === "BUTTON") return;
                    fetch(`${BACKEND_URL}/projects/stats`).then(res => res.json()).then(allStats => {
                        const targetStat = allStats.find(s => s.project_id === p.id) || { total_tasks: 0, todo_count: 0, in_progress_count: 0, done_count: 0 };
                        
                        // Elements update matching your new structural decoupled classes!
                        const mTitle = document.getElementById("modal-proj-title");
                        const mOwner = document.getElementById("modal-proj-owner");
                        const mTotal = document.getElementById("modal-proj-total");
                        const mTodo = document.getElementById("modal-proj-todo");
                        const mProgress = document.getElementById("modal-proj-progress");
                        const mDone = document.getElementById("modal-proj-done");
                        const mDesc = document.getElementById("modal-proj-desc");

                        if (mTitle) mTitle.textContent = `📦 ${p.name}`;
                        if (mOwner) mOwner.textContent = `Operational Lead: ${oName} (${oRole})`;
                        if (mTotal) mTotal.textContent = targetStat.total_tasks;
                        if (mTodo) mTodo.textContent = targetStat.todo_count;
                        if (mProgress) mProgress.textContent = targetStat.in_progress_count;
                        if (mDone) mDone.textContent = targetStat.done_count;
                        if (mDesc) mDesc.textContent = p.description || "No alternative configuration notes provided for this operational execution domain.";
                        
                        if (projModal) projModal.classList.add("display-active"); 
                    }).catch(err => console.error("Metrics sync failure:", err));
                });
                card.appendChild(t); card.appendChild(oz); card.appendChild(d); 
                projectsGridContainer.appendChild(card);
            });
        });
    }

        
        // ==========================================================================
    // 📋 TASK WORKSPACE QUEUE RENDERING ENGINE
    // = [KAAM]: Allocated tasks ki patli patti cards matrix generate karna screen par
    // ==========================================================================
    function renderTaskList(tasks) {
        if (!taskListContainer) return; taskListContainer.textContent = "";
        if (!tasks || tasks.length === 0) {
            const lbl = document.createElement("p"); lbl.textContent = "No tasks found across queues."; lbl.style.color = "var(--text-subtle)"; taskListContainer.appendChild(lbl); return;
        }
        tasks.forEach(task => {
            const pattiRow = document.createElement("div"); pattiRow.className = "task-item-patti";
            const metaLeft = document.createElement("div"); metaLeft.className = "task-meta-left";
            const titleSpan = document.createElement("span"); titleSpan.className = "task-title-text"; titleSpan.textContent = task.title;
            
            const tagsContainer = document.createElement("div"); tagsContainer.className = "task-tags-row";
            const priorityBadge = document.createElement("span"); priorityBadge.className = `badge ${task.priority}`; priorityBadge.textContent = task.priority;
            const dateLabel = document.createElement("span"); dateLabel.className = "task-date-label"; dateLabel.textContent = task.due_date ? `⏳ Due: ${task.due_date}` : "⏳ No Deadline";
            
            tagsContainer.appendChild(priorityBadge); tagsContainer.appendChild(dateLabel); metaLeft.appendChild(titleSpan); metaLeft.appendChild(tagsContainer);
            const controlsRight = document.createElement("div"); controlsRight.className = "task-controls-right";
            
                        // ==========================================================================
            // 🔄 LINEAR WORKFLOW WORKSPACE STATE CONTROLLER (FIXED TO LOCK AT DONE)
            // = [KAAM]: Click karne par linear progression chalana (TODO -> IN_PROGRESS -> DONE)
            // ==========================================================================
            const btnStatus = document.createElement("button");
            btnStatus.className = `btn-action btn-status-${task.status.toLowerCase()}`;
            btnStatus.textContent = task.status.toUpperCase();

            btnStatus.addEventListener("click", (e) => {
                e.stopPropagation();
                
                let nextStatus = "TODO";
                const currentStatusClean = task.status.toUpperCase().trim();

                // Strict state machine mapping transitions constraints bounds
                if (currentStatusClean === "TODO") {
                    nextStatus = "IN_PROGRESS";
                } else if (currentStatusClean === "IN_PROGRESS") {
                    nextStatus = "DONE";
                } else if (currentStatusClean === "DONE") {
                    // Alert system user if trying to mutate a locked terminal node record
                    alert("🏆 Task parameters are already fully executed and locked in DONE status!");
                    return; 
                }

                console.log(`[STATUS ENGINE]: Transitioning task ID #${task.id} state target path from ${task.status} to ${nextStatus}...`);

                // First search the live active dynamic schema attributes metadata streams
                fetch(`${BACKEND_URL}/tasks/search?title=${encodeURIComponent(task.title)}&algo=linear`)
                .then(res => res.json())
                .then(liveTaskData => {
                    const updatePayload = {
                        project_id: liveTaskData.project_id,
                        assigned_to: liveTaskData.assigned_to,
                        title: liveTaskData.title,
                        description: liveTaskData.description || "",
                        status: nextStatus.toLowerCase(), // Updates target workflow state matrix natively
                        priority: liveTaskData.priority,
                        due_date: liveTaskData.due_date
                    };

                    // Execute atomic server override layers transaction sequence
                    fetch(`${BACKEND_URL}/tasks/${liveTaskData.id}`, { method: "DELETE" }).then(() => {
                        fetch(`${BACKEND_URL}/tasks`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updatePayload)
                        })
                        .then(() => {
                            fetchLiveTasks(); // Instantly re-render live viewport status stream rows!
                        });
                    });
                }).catch(err => console.error("Workflow toggle operation failure logs:", err));
            });


                        // ==========================================================================
            // 🗑️ UPGRADED CLEAN DELETE BUTTON ACTION ROUTER LOGIC
            // ==========================================================================
            const btnDelete = document.createElement("button"); 
            btnDelete.className = "btn-action btn-delete"; 
            btnDelete.textContent = "Delete"; // Text label permanently updated to Delete!
            
            btnDelete.addEventListener("click", (e) => { 
                e.stopPropagation(); 
                if (confirm("Delete task permanently from database cloud lines?")) { 
                    fetch(`${BACKEND_URL}/tasks/${task.id}`, { method: "DELETE" }).then(() => fetchLiveTasks()); 
                } 
            });

            // ==========================================================================
            // ✏️ INLINE TASK CRUD EDIT ROUTER PIPELINE (TAB 3 UPDATE FEATURE)
            // ==========================================================================
            const btnEditTask = document.createElement("button"); 
            btnEditTask.className = "btn-action btn-edit-gray"; 
            btnEditTask.textContent = "Edit";
            btnEditTask.style.marginLeft = "6px";
            
            btnEditTask.addEventListener("click", (e) => { 
                e.stopPropagation(); 
                
                // Real-time backend parameters details fetch karke elements map karna
                fetch(`${BACKEND_URL}/tasks/search?title=${encodeURIComponent(task.title)}&algo=linear`)
                .then(res => res.json())
                .then(liveTaskData => {
                    const modalTitle = document.getElementById("modal-task-title");
                    const viewPanel = document.getElementById("task-modal-view-panel");
                    const editForm = document.getElementById("task-modal-edit-form");
                    
                    if (modalTitle) modalTitle.innerHTML = `✏️ Edit Operational Task Parameters`;
                    if (viewPanel) viewPanel.style.display = "none";
                    
                    if (editForm) {
                        editForm.classList.remove("content-hidden");
                        editForm.style.display = "flex";
                        
                        // Pre-fill inputs with dynamic cloud metadata streams
                        if (document.getElementById("update-task-title-input")) document.getElementById("update-task-title-input").value = liveTaskData.title;
                        if (document.getElementById("update-task-desc-input")) document.getElementById("update-task-desc-input").value = liveTaskData.description || "";
                        if (document.getElementById("update-task-priority-input")) document.getElementById("update-task-priority-input").value = liveTaskData.priority;
                        if (document.getElementById("update-task-due-input")) document.getElementById("update-task-due-input").value = liveTaskData.due_date || "";
                    }

                    // Handle form cancellation mechanism smoothly
                    const cancelBtn = document.getElementById("btn-task-edit-cancel");
                    if (cancelBtn) {
                        cancelBtn.onclick = (cancelEv) => {
                            cancelEv.stopPropagation();
                            if (editForm) { editForm.style.display = "none"; editForm.classList.add("content-hidden"); }
                            if (viewPanel) viewPanel.style.display = "block";
                            if (modalTitle) modalTitle.innerHTML = `🔍 Task Inspection Details`;
                        };
                    }

                    // Handle cross icon trigger close nicely
                    const crossCloseBtn = document.getElementById("modal-close-trigger-btn");
                    if (crossCloseBtn) {
                        crossCloseBtn.onclick = (crossEv) => {
                            crossEv.stopPropagation();
                            if (detailsModal) detailsModal.classList.remove("display-active");
                        };
                    }

                    // Handle task modifier schema form submission dynamically
                    if (editForm) {
                        editForm.onsubmit = (formEv) => {
                            formEv.preventDefault();
                            const freshTitle = document.getElementById("update-task-title-input").value.trim();
                            const freshDesc = document.getElementById("update-task-desc-input").value.trim();
                            const freshPriority = document.getElementById("update-task-priority-input").value;
                            const freshDue = document.getElementById("update-task-due-input").value.trim();

                            if (!freshTitle) return;

                            // Integration process: Syncing payload variables directly with server schema bounds
                            const updatePayload = {
                                project_id: liveTaskData.project_id,
                                assigned_to: liveTaskData.assigned_to,
                                title: freshTitle,
                                description: freshDesc,
                                status: liveTaskData.status, // Keeps existing task state (TODO/IN-PROGRESS/DONE) intact
                                priority: freshPriority,
                                due_date: freshDue
                            };

                            // Overwrite operation via cloud transaction pipeline execution layers
                            fetch(`${BACKEND_URL}/tasks/${liveTaskData.id}`, { method: "DELETE" }).then(() => {
                                fetch(`${BACKEND_URL}/tasks`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(updatePayload)
                                })
                                .then(() => {
                                    alert("✏️ Operational Task modified successfully!");
                                    if (detailsModal) detailsModal.classList.remove("display-active");
                                    fetchLiveTasks(); // Reload task stream grid immediately on live viewport!
                                });
                            });
                        };
                    }

                    if (detailsModal) detailsModal.classList.add("display-active");
                });
            });

            // Append connections configuration layers mapping nodes tightly
            controlsRight.appendChild(btnStatus); 
            controlsRight.appendChild(btnEditTask); 
            controlsRight.appendChild(btnDelete); 
            pattiRow.appendChild(metaLeft); 
            pattiRow.appendChild(controlsRight);
            taskListContainer.appendChild(pattiRow);
        });

    }
});
// ==========================================================================
// 🤖 HYPERFLOW OPS: ROBUST MULTI-PROJECT TARGET ROUTING ENGINE FOR AI PARSER
// = [KAAM]: Dropdown freeze rakhna aur targeted project_id cloud payload mein bhejna
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const aiForm = document.getElementById("ai-quick-add-form");
    const aiSelector = document.getElementById("ai-project-target-selector");

    // 🔍 PART A: DYNAMIC DROPDOWN LOADER FOR AI PARSER PANEL
    function populateAIProjectTargetDropdown() {
        if (!aiSelector) return;
        
        // Agar user ne pehle se koi option chuna hua hai, toh uska state save rakhna
        const previousSelection = aiSelector.value;
        
        fetch(`${BACKEND_URL}/projects`)
        .then(res => res.json())
        .then(projects => {
            aiSelector.textContent = ""; // Clear slate default items
            if (!projects || projects.length === 0) {
                const opt = document.createElement("option"); 
                opt.textContent = "No projects found. Please create one first."; 
                opt.value = "";
                aiSelector.appendChild(opt); 
                return;
            }
            
            projects.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = `📦 Project Cluster ID #${p.id} : ${p.name}`;
                aiSelector.appendChild(opt);
            });

            // 🔥 FIX LOCK: Dropdown ko auto-reset hone se rokna aur selection barkarar rakhna
            if (previousSelection && Array.from(aiSelector.options).some(o => o.value === previousSelection)) {
                aiSelector.value = previousSelection;
            }
        })
        .catch(err => console.error("[AI ROUTER ERROR]: Dropdown sync fail trace:", err));
    }

    // 🔄 STRICT NAVIGATION TARGET: Sirf tab button click hone par hi dropdown load hoga
    const sidebarTabs = document.querySelectorAll(".sidebar-tabs button, .nav-control-btn, [data-target]");
    if (sidebarTabs && sidebarTabs.length > 0) {
        sidebarTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                // Short interval taaki rendering display smooth ho aur load refresh block handle ho sake
                setTimeout(populateAIProjectTargetDropdown, 60);
            });
        });
    }

    // Safe fallback call: Initial document startup variables initialization layout paths
    setTimeout(populateAIProjectTargetDropdown, 400);

    // 🔥 PART B: INTERCEPT AI SUBMISSION FORM AND ROUTE TARGETED METADATA
    if (aiForm) {
        aiForm.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const promptInput = document.getElementById("ai-raw-prompt-input");
            const selectedProjectVal = aiSelector ? aiSelector.value : null;

            if (!selectedProjectVal) { 
                alert("❌ Target Project cluster domain identity invalid. Create a project first!"); 
                return; 
            }
            
            const userPromptText = promptInput ? promptInput.value.trim() : "";
            if (userPromptText === "") { 
                alert("Please type a valid operational bounds statement."); 
                return; 
            }

            const payload = {
                project_id: parseInt(selectedProjectVal), // Direct chosen dropdown values bound securely!
                description: userPromptText
            };

            console.log("[AI PIPELINE INGESTION]: Submitting tokens to /tasks/quick-add...", payload);

            fetch(`${BACKEND_URL}/tasks/quick-add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => { 
                if (!res.ok) throw new Error("AI ingestion mapping parameters crash"); 
                return res.json(); 
            })
            .then(successData => {
                alert("👋 Cloud AI Ingestion Processed and Synchronized Successfully!");
                if (promptInput) promptInput.value = ""; // Clean input text box slate
                
                if (typeof fetchLiveTasks === "function") fetchLiveTasks();
                if (typeof fetchLiveProjects === "function") fetchLiveProjects();
            })
            .catch(err => {
                console.error(err);
                alert("❌ AI Parsing Failure: Check if server backend models are alive inside main.py");
            });
        });
    }
});

