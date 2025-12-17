document.addEventListener("DOMContentLoaded", () => {
  const newTaskBtn = document.querySelector(".new-task-btn");
  const modal = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const cancelTask = document.getElementById("cancelTask");
  const saveTask = document.getElementById("saveTask");
  const toast = document.getElementById("toast");
  const form = document.getElementById("taskForm");

  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const statusInput = document.getElementById("status");
  const priorityInput = document.getElementById("priority");
  const categoryInput = document.getElementById("category");
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");

  const startCal = document.getElementById("startCalendar");
  const endCal = document.getElementById("endCalendar");


  let editIndex = null;

  // drawer starts here
  const drawer = document.getElementById("drawer");

  
  const DRAWER_BREAKPOINT = 1024; 

  
  drawer.querySelector(".drawer-header").onclick = () => {
    if (window.innerWidth < DRAWER_BREAKPOINT) {
      drawer.classList.toggle("open");
    }
  };

  const drawerIcons = document.querySelectorAll(".icon-item");

  drawerIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      if (window.innerWidth < DRAWER_BREAKPOINT) {
       
        drawer.classList.add("open");
      }
    });
  });
 
 
  function applyDrawerState() {
    if (window.innerWidth >= DRAWER_BREAKPOINT) {
      drawer.classList.add("open");
    } else {
      drawer.classList.remove("open");
    }
  }

 
  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

 
  applyDrawerState();

  window.addEventListener("resize", debounce(() => {
    applyDrawerState();
  }, 120));

  // drawers ends hear
 
  function showToast(message) {
    toast.querySelector("span").textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  newTaskBtn.onclick = () => {
    modal.classList.add("show");
  };

  function closeAndReset() {
    modal.classList.remove("show");
    form.reset();

    startCal.style.display = "none";
    endCal.style.display = "none";

    editIndex = null;
    saveTask.textContent = "Create Task";
    console.log(
      "from closeAndReset or created and added task and after reseting the form"
    );
  }

  closeModal.onclick = closeAndReset;
  cancelTask.onclick = closeAndReset;

  /* SAVE TASK and update or edits starts ya-ssa */
  saveTask.onclick = (e) => {
    e.preventDefault();

    if (!titleInput.value.trim() || !startInput.value || !endInput.value || !categoryInput.value) {
      showToast("Please fill all required fields");
      return;
    }

    const task = {
      title: titleInput.value.trim(),
      description: descriptionInput.value,
      status: statusInput.value,
      priority: priorityInput.value,
      category: categoryInput.value,
      startDate: startInput.value,
      endDate: endInput.value,
      createdAt: new Date().toISOString(),
    };

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (editIndex !== null) {

      tasks[editIndex] = {
        ...tasks[editIndex],
        title: titleInput.value.trim(),
        description: descriptionInput.value,
        status: statusInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        startDate: startInput.value,
        endDate: endInput.value,
      };

      showToast("Task updated successfully");
    } else {
      // creating new task
      tasks.push(task);
      showToast("Task created successfully");
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));

    updateDashboardCounts();
    populateCategories();
    applyFilters();
    closeAndReset();
  };
  // saving and updating task ends here
  /* CALENDAR starts from hear*/
  function createCalendar(container, input) {
    let current = new Date();

    function render() {
      container.innerHTML = "";

      const year = current.getFullYear();
      const month = current.getMonth();

      const header = document.createElement("div");
      header.className = "calendar-header";
      header.innerHTML = `
        <button class="prev">&#10094;</button>
        <span>${current.toLocaleString("default", {
        month: "long",
      })} ${year}</span>
        <button class="next">&#10095;</button>
      `;
      container.appendChild(header);

      const weekdays = document.createElement("div");
      weekdays.className = "calendar-weekdays";
      weekdays.innerHTML = "SMTWTFS"
        .split("")
        .map((d) => `<div>${d}</div>`)
        .join("");
      container.appendChild(weekdays);

      const days = document.createElement("div");
      days.className = "calendar-days";

      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        days.innerHTML += "<div></div>";
      }

      for (let d = 1; d <= lastDate; d++) {
        const today = new Date();
        const isToday =
          d === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear();

        days.innerHTML += `<div class="${isToday ? "today" : ""}">${d}</div>`;
      }

      container.appendChild(days);

      header.querySelector(".prev").onclick = () => {
        current.setMonth(current.getMonth() - 1);
        render();
      };

      header.querySelector(".next").onclick = () => {
        current.setMonth(current.getMonth() + 1);
        render();
      };

      days.querySelectorAll("div").forEach((day) => {
        if (!day.textContent) return;
        day.onclick = () => {
          input.value = `${year}-${month + 1}-${day.textContent}`;
          container.style.display = "none";
        };
      });
    }

    render();
  }

  startInput.onclick = () => {
    startCal.style.display = "block";
    endCal.style.display = "none";
    createCalendar(startCal, startInput);
  };

  endInput.onclick = () => {
    endCal.style.display = "block";
    startCal.style.display = "none";
    createCalendar(endCal, endInput);
  };

  /* CALENDAR ends here */


  function updateDashboardCounts() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // TOTAL TASKS counts
    const totalTasksEl = document.getElementById("totalTasks");
    if (totalTasksEl) {
      animateCount(totalTasksEl, tasks.length);
    }

    // COMPLETED TASKS
    const completedCount = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const completedEl = document.getElementById("completedTasks");
    if (completedEl) {
      completedEl.textContent = completedCount;
    }

    // IN-PROGRESS TASKS
    const inProgressCount = tasks.filter(
      (task) => task.status === "In-Progress"
    ).length;

    const inProgressEl = document.getElementById("inProgressTasks");
    if (inProgressEl) {
      inProgressEl.textContent = inProgressCount;
    }

    // PENDING TASKS
    const pendingCount = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const pendingEl = document.getElementById("pendingTasks");
    if (pendingEl) {
      pendingEl.textContent = pendingCount;
    }
  }

  updateDashboardCounts();

  const taskList = document.getElementById("taskList");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const priorityFilter = document.getElementById("priorityFilter");

  function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }

  /* DYNAMIC CATEGORY DROPDOWN starts */
  function populateCategories() {
    const tasks = getTasks();
    const categories = [
      ...new Set(tasks.map((t) => t.category).filter(Boolean)),
    ];

    categoryFilter.innerHTML = `<option value="">All Categories</option>`;

    categories.forEach((cate) => {
      const option = document.createElement("option");
      option.value = cate;
      option.textContent = cate;
      categoryFilter.appendChild(option);
    });
  }


  function renderTasks(tasks) {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      taskList.innerHTML = `
    <div class="empty-state">
      <p>No tasks found</p>
    </div>
  `;
      return;
    }

    const allTasks = getTasks();

    tasks.forEach((task) => {
      const originalIndex = allTasks.findIndex(
        (t) => t.title === task.title && t.createdAt === task.createdAt
      );

      const card = document.createElement("div");
      card.className = "task-card";

      card.innerHTML = `
      <div class="task-card-header">
        <div class="task-title">${task.title}</div>
        <div class="task-actions">
          <i  style="cursor: pointer;
    color: #67ACFF;
    padding: 10px;
    background: #a0bbdb57;
    border-radius: 20px;" class="ri-pencil-line edit-btn" data-index="${originalIndex}"></i>
          <i   style="cursor: pointer;color: #FF6B6B;
    padding: 10px;
    background: #ff6b6b29;
    border-radius: 20px" class="ri-delete-bin-line delete-btn" data-index="${originalIndex}"></i>
        </div>
      </div>

      <div class="task-desc">
  <button class="desc-toggle">
    Description
    <i class="ri-arrow-down-s-line"></i>
  </button>

  <div class="desc-content">
    <p style="color:black">${task.description || "No description provided."}</p>
  </div>
</div>

    <div class="fix">
      <div class="badges">
        <span class="badge ${task.priority.toLowerCase()}"> ${task.priority} Priority</span>
        <span class="badge ${task.status.toLowerCase().replace(" ", "-")}"> Status ${task.status}</span>
        <span class="badge category">Task in ${task.category} Section</span>
      </div>

      <div class="task-dates">
        <span><i class="ri-timer-fill" style="color: #67ACFF";></i> Start date ${new Date(
        task.createdAt
      ).toDateString()}</span>
        <span><i class="ri-timer-line" style="color: #FF6B6B";></i> End date ${new Date(
        task.endDate
      ).toDateString()}</span>
      </div>
      </div>
      <div class="status-buttons">
        <button 
  data-status="Pending" 
  data-index="${originalIndex}" 
  class="pending"
>Pending</button>

<button 
  data-status="In-Progress" 
  data-index="${originalIndex}" 
  class="in-progress"
>In Progress</button>

<button 
  data-status="Completed" 
  data-index="${originalIndex}" 
  class="completed"
>Completed</button>

      </div>
      `;

      taskList.appendChild(card);
      const toggleBtn = card.querySelector(".desc-toggle");

      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          card.classList.toggle("open");
        });
      }

      const statusButtons = card.querySelectorAll(".status-buttons button");

      statusButtons.forEach((btn) => {
        if (btn.dataset.status === task.status) {
          btn.classList.add("active-status");
        }

        btn.addEventListener("click", () => {
          const taskIndex = parseInt(btn.dataset.index);

          
          card
            .querySelectorAll(".status-buttons button")
            .forEach((b) => b.classList.remove("active-status"));


          btn.classList.add("active-status");

          const newStatus = btn.dataset.status;
          updateTaskStatus(taskIndex, newStatus);
        });
      });

      card.querySelector(".delete-btn").addEventListener("click", (e) => {
        const taskIndex = parseInt(e.target.dataset.index);
        // show custom confirmation dialog before deleting
        showConfirm(taskIndex, `Delete "${task.title}"?`);
      });

      card.querySelector(".edit-btn").addEventListener("click", (e) => {
        const taskIndex = parseInt(e.target.dataset.index);
        openEditModal(taskIndex);
      });
    });
  }

  function deleteTask(taskIndex) {
    const tasks = getTasks();

    tasks.splice(taskIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    updateDashboardCounts();
    populateCategories();
    applyFilters();

    showToast("Task deleted");
  }

  function updateTaskStatus(taskIndex, newStatus) {
    const tasks = getTasks();

    tasks[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(tasks));

    updateDashboardCounts();
    applyFilters();
    showToast(`Status updated to ${newStatus}`);
  }

  function openEditModal(index) {
    const tasks = getTasks();
    const task = tasks[index];

    editIndex = index;


    titleInput.value = task.title;
    descriptionInput.value = task.description;
    statusInput.value = task.status;
    priorityInput.value = task.priority;
    categoryInput.value = task.category;
    startInput.value = task.startDate;
    endInput.value = task.endDate;


    saveTask.textContent = "Update Task";

    modal.classList.add("show");
  }

  // --- Custom delete confirmation wiring ---
  const confirmOverlay = document.getElementById("confirmOverlay");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");
  const confirmClose = document.getElementById("confirmClose");
  let pendingDeleteIndex = null;

  function showConfirm(index, title) {
    pendingDeleteIndex = index;
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    if (titleEl) titleEl.textContent = title || "Delete task?";
    if (msgEl) msgEl.textContent = "Are you sure you want to delete this task? This action cannot be undone.";
    confirmOverlay.classList.add("show");
    confirmOverlay.setAttribute("aria-hidden", "false");
  }

  function hideConfirm() {
    pendingDeleteIndex = null;
    confirmOverlay.classList.remove("show");
    confirmOverlay.setAttribute("aria-hidden", "true");
  }

  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      if (pendingDeleteIndex !== null) {
        deleteTask(pendingDeleteIndex);
      }
      hideConfirm();
    });
  }

  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      hideConfirm();
    });
  }

  if (confirmClose) {
    confirmClose.addEventListener("click", hideConfirm);
  }

  // Close when clicking outside the box
  if (confirmOverlay) {
    confirmOverlay.addEventListener("click", (e) => {
      if (e.target === confirmOverlay) hideConfirm();
    });
  }

  populateCategories();
  applyFilters();

  // filter logic starts
  function applyFilters() {
    let tasks = getTasks();

    const searchValue = searchInput.value.toLowerCase();
    const priorityValue = priorityFilter.value;
    const categoryValue = categoryFilter.value;

    if (searchValue) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchValue)
      );
    }

    if (priorityValue) {
      tasks = tasks.filter((task) => task.priority === priorityValue);
    }

    if (categoryValue) {
      tasks = tasks.filter((task) => task.category === categoryValue);
    }

    renderTasks(tasks);
  }

  searchInput.addEventListener("input", applyFilters);
  priorityFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);

  // filter logic ends
  // this the animation count ing function from ai part starts
  function animateCount(element, target) {
    let start = 0;
    const duration = 300;
    const stepTime = Math.max(Math.floor(duration / target), 20);

    const timer = setInterval(() => {
      start++;
      element.textContent = start;
      if (start >= target) clearInterval(timer);
    }, stepTime);
  }
  // this the animation count ing function from ai part ends
  //  this is use for clear filters inputs starts hear
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  clearFiltersBtn.addEventListener("click", () => {

    searchInput.value = "";
    priorityFilter.value = "";
    categoryFilter.value = "";


    applyFilters();

    showToast("Filters cleared");
  });
});
//  this is use for clear filters inputs ends hear
