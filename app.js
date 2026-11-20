
const STORAGE_KEY = "daybook-tasks-v1";

const sampleTasks = [
  {
    id: "sample-1",
    title: "Read chapter 6 and make lecture notes",
    course: "Biology 204",
    due: "",
    priority: "normal",
    completed: false,
    created: 1
  },
  {
    id: "sample-2",
    title: "Submit the first draft of research paper",
    course: "English 110",
    due: "",
    priority: "high",
    completed: false,
    created: 2
  },
  {
    id: "sample-3",
    title: "Review calculus problem set",
    course: "Math 131",
    due: "",
    priority: "low",
    completed: true,
    created: 3
  }
];

let tasks = loadTasks();
let activeFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const sortSelect = document.querySelector("#sort-select");

// Get today's date in YYYY-MM-DD format
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Load tasks from Local Storage
function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return Array.isArray(stored) ? stored : [...sampleTasks];
  } catch {
    return [...sampleTasks];
  }
}

// Save tasks
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
}

// Check whether date is today
function isToday(dateString) {
  return dateString === getToday();
}

// Validate date
function isValidDate(dateString) {
  if (!dateString) return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Filter and sort tasks
function visibleTasks() {
  const today = getToday();

  const filtered = tasks.filter((task) => {
    if (activeFilter === "today") {
      return !task.completed && isToday(task.due);
    }

    if (activeFilter === "upcoming") {
      return (
        !task.completed &&
        task.due &&
        task.due > today
      );
    }

    if (activeFilter === "completed") {
      return task.completed;
    }

    return !task.completed;
  });

  const priorityOrder = {
    high: 0,
    normal: 1,
    low: 2
  };

  return filtered.sort((first, second) => {
    if (sortSelect.value === "priority") {
      return (
        (priorityOrder[first.priority] ?? 1) -
        (priorityOrder[second.priority] ?? 1)
      );
    }

    if (sortSelect.value === "created") {
      return second.created - first.created;
    }

    return (first.due || "9999-12-31").localeCompare(
      second.due || "9999-12-31"
    );
  });
}
// Task completion celebration
function showCelebration() {
  const celebration = document.createElement("div");

  celebration.className = "task-celebration";
  celebration.textContent = "🎉 Great Job! Task Completed!";

  document.body.append(celebration);

  setTimeout(() => {
    celebration.remove();
  }, 2200);
}function showCelebration() {
  const celebration = document.createElement("div");

  celebration.className = "task-celebration";
  celebration.textContent = "🎉 Great Job! Task Completed!";

  document.body.append(celebration);

  const colors = ["#a47cf5", "#55d6be", "#ffcc66", "#ff7b9c", "#ffffff"];

  for (let i = 0; i < 45; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;

    document.body.append(piece);

    setTimeout(() => piece.remove(), 3200);
  }

  setTimeout(() => celebration.remove(), 2200);
}
// Create task row
function makeTaskRow(task) {
  const row = document.createElement("article");

  row.className = `task-row${task.completed ? " is-complete" : ""}`;

  // Complete button
  const checkButton = document.createElement("button");

  checkButton.className = "task-check";
  checkButton.type = "button";

  checkButton.setAttribute(
    "aria-label",
    task.completed
      ? `Mark ${task.title} incomplete`
      : `Complete ${task.title}`
  );

  checkButton.setAttribute(
    "aria-pressed",
    String(task.completed)
  );

  const checkGlyph = document.createElement("span");

  checkGlyph.className = "check-glyph";
  checkGlyph.textContent = "✓";

  checkButton.append(checkGlyph);

 checkButton.addEventListener("click", () => {
    task.completed = !task.completed;
if (task.completed) {
  task.completedDate = new Date().toISOString().split("T")[0];
} else {
  task.completedDate = null;
}
    if (task.completed) {
      showCelebration();
      playTaskSound("complete");
    }

    saveTasks();
    render();
  });

  // Task details
  const main = document.createElement("div");

  main.className = "task-main";

  const title = document.createElement("div");

  title.className = "task-title";
  title.textContent = task.title;

  main.append(title);

  // Course and due date
  if (task.course || task.due) {
    const meta = document.createElement("div");

    meta.className = "task-meta";

    if (task.course) {
      const course = document.createElement("span");

      course.className = "course-tag";
      course.textContent = task.course;

      meta.append(course);
    }

    if (task.due) {
      const due = document.createElement("span");

      const overdue = !task.completed && task.due < getToday();

      due.className = `due-label${overdue ? " is-overdue" : ""}`;

      due.textContent = overdue
        ? `Overdue · ${formatDate(task.due)}`
        : `Due ${formatDate(task.due)}`;

      meta.append(due);
    }

    main.append(meta);
  }

  // Priority
  const priority = document.createElement("span");

  priority.className = `task-priority priority-${task.priority}`;

  const dot = document.createElement("span");

  dot.className = "priority-dot";

  const priorityText = document.createTextNode(
    task.priority === "high"
      ? "High"
      : task.priority === "low"
        ? "Low"
        : "Normal"
  );

  priority.append(dot, priorityText);

  // Edit button
  const editButton = document.createElement("button");

  editButton.className = "edit-task";
  editButton.type = "button";
  editButton.textContent = "Edit";

  editButton.setAttribute(
    "aria-label",
    `Edit ${task.title}`
  );

  editButton.addEventListener("click", () => {
    const newTitle = prompt("Task name:", task.title);

    if (newTitle === null || !newTitle.trim()) return;

    const newCourse = prompt("Course:", task.course || "");

    if (newCourse === null) return;

    const newDue = prompt(
      "Due date (YYYY-MM-DD). Leave blank if no date:",
      task.due || ""
    );

    if (newDue === null) return;

    const cleanDue = newDue.trim();

    if (!isValidDate(cleanDue)) {
      alert("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    const newPriority = prompt(
      "Priority (high / normal / low):",
      task.priority
    );

    if (newPriority === null) return;

    const cleanPriority = newPriority.trim().toLowerCase();

    if (!["high", "normal", "low"].includes(cleanPriority)) {
      alert("Please enter high, normal, or low.");
      return;
    }

    task.title = newTitle.trim();
    task.course = newCourse.trim();
    task.due = cleanDue;
    task.priority = cleanPriority;

    saveTasks();
    render();
  });

  // Delete button
  const deleteButton = document.createElement("button");

  deleteButton.className = "delete-task";
  deleteButton.type = "button";
  deleteButton.textContent = "×";

  deleteButton.setAttribute(
    "aria-label",
    `Delete ${task.title}`
  );

  deleteButton.addEventListener("click", () => {
    const confirmed = confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;
playTaskSound("delete");
    tasks = tasks.filter((item) => item.id !== task.id);

    saveTasks();
    render();
  });

  // Add all elements to row
  row.append(
    checkButton,
    main,
    priority,
    editButton,
    deleteButton
  );

  return row;
}

// Render tasks
function render() {
  const filteredTasks = visibleTasks();

  taskList.replaceChildren();

  if (filteredTasks.length) {
    taskList.append(
      ...filteredTasks.map(makeTaskRow)
    );
  } else {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    const symbol = document.createElement("span");

    symbol.textContent =
      activeFilter === "completed" ? "✓" : "✳";

    const message = document.createElement("p");

    message.textContent =
      activeFilter === "completed"
        ? "Nothing completed just yet."
        : "All clear here. Add a task whenever you’re ready.";

    empty.append(symbol, message);

    taskList.append(empty);
  }

  // Counts
  const activeCount = tasks.filter(
    (task) => !task.completed
  ).length;

  const todayCount = tasks.filter(
    (task) => !task.completed && isToday(task.due)
  ).length;

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  // Navigation counts
  document.querySelector("#all-count").textContent =
    activeCount;

  document.querySelector("#today-count").textContent =
    todayCount;

  // Task total
  document.querySelector("#task-total").textContent =
    `${filteredTasks.length} ${
      filteredTasks.length === 1 ? "task" : "tasks"
    }`;

  // Productivity Dashboard
  document.querySelector("#stat-total").textContent =
    tasks.length;

  document.querySelector("#stat-completed").textContent =
    completedCount;

  document.querySelector("#stat-pending").textContent =
    activeCount;

  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  document.querySelector("#stat-rate").textContent =
    `${completionRate}%`;
  // Daily Streak Calculation
  const completedDates = [
    ...new Set(
      tasks
        .filter(task => task.completed && task.completedDate)
        .map(task => task.completedDate)
    )
  ].sort().reverse();

  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toLocaleDateString("en-CA");

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayString = yesterday.toLocaleDateString("en-CA");

  if (
    completedDates.includes(todayString) ||
    completedDates.includes(yesterdayString)
  ) {
    const startDate = completedDates.includes(todayString)
      ? todayString
      : yesterdayString;

    const checkDate = new Date(`${startDate}T00:00:00`);

    while (
      completedDates.includes(checkDate.toLocaleDateString("en-CA"))
    ) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  document.querySelector("#stat-streak").textContent =
    `${streak} ${streak === 1 ? "Day" : "Days"}`;
  // Progress
  document.querySelector("#progress-label").textContent =
    `${completedCount} / ${tasks.length}`;

  const progress =
    tasks.length
      ? (completedCount / tasks.length) * 100
      : 0;

  document.querySelector("#progress-fill").style.width =
    `${progress}%`;

  document.querySelector("#progress-caption").textContent =
    tasks.length && completedCount === tasks.length
      ? "Everything on your list is done."
      : completedCount
        ? "Nice work. Keep the momentum going."
        : "Start with one small thing.";
renderCalendar();
  // Page headings
  document.querySelector("#list-title").textContent =
    ({
      all: "Your tasks",
      today: "Due today",
      upcoming: "Coming up",
      completed: "Completed"
    })[activeFilter];

  document.querySelector("#view-name").textContent =
    ({
      all: "ALL TASKS",
      today: "DUE TODAY",
      upcoming: "UPCOMING",
      completed: "COMPLETED"
    })[activeFilter];
}

// Navigation filters
document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle(
        "is-active",
        item === button
      );
    });

    render();
  });
});

// Add new task
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);

  const title = String(
    formData.get("title") || ""
  ).trim();

  if (!title) {
    alert("Please enter a task name.");
    return;
  }

  const due = String(
    formData.get("due") || ""
  );

  if (!isValidDate(due)) {
    alert("Please select a valid due date.");
    return;
  }

  const priority = String(
    formData.get("priority") || "normal"
  );

  if (!["high", "normal", "low"].includes(priority)) {
    alert("Please select a valid priority.");
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title,
    course: String(
      formData.get("course") || ""
    ).trim(),
    due,
    priority,
    completed: false,
    created: Date.now()
  };

  tasks.unshift(newTask);

  saveTasks();

  taskForm.reset();

  activeFilter = "all";

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle(
      "is-active",
      item.dataset.filter === "all"
    );
  });

  render();

  taskInput.focus();
});

// Sorting
sortSelect.addEventListener("change", render);

// Today's date
const now = new Date();

document.querySelector("#today-date").textContent =
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(now);

document.querySelector("#friendly-date").textContent =
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now).toUpperCase();
let calendarDate = new Date();
// Initial render
render();
// Taskora Sound Effects

// Taskora Sound Effects
async function playTaskSound(type) {
  if (!soundsEnabled) return;

  const audioContext = new (
    window.AudioContext || window.webkitAudioContext
  )();

  await audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  const now = audioContext.currentTime;

  if (type === "complete") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.setValueAtTime(659.25, now + 0.12);
    oscillator.frequency.setValueAtTime(783.99, now + 0.24);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    oscillator.start(now);
    oscillator.stop(now + 0.65);
  } else {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(650, now);
    oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    oscillator.start(now);
    oscillator.stop(now + 0.18);
  }

  oscillator.onended = () => audioContext.close();
}
// Taskora Productivity Calendar


function renderCalendar() {
  const grid = document.querySelector("#calendar-grid");
  const monthLabel = document.querySelector("#calendar-month");

  if (!grid || !monthLabel) return;

  grid.replaceChildren();

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  monthLabel.textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(calendarDate);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach(day => {
    const heading = document.createElement("div");
    heading.className = "calendar-weekday";
    heading.textContent = day;
    grid.append(heading);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const completedDates = new Set(
    tasks
      .filter(task => task.completed && task.completedDate)
      .map(task => task.completedDate)
  );

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "calendar-day empty";
    grid.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const dateKey = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0")
    ].join("-");

    cell.className = "calendar-day";
    cell.textContent = day;

    if (completedDates.has(dateKey)) {
      cell.classList.add("has-completion");
    }

    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add("is-today");
    }

    grid.append(cell);
  }
}

document.querySelector("#prev-month").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

document.querySelector("#next-month").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
// Music and Sound Controls
const music = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");
const soundToggle = document.getElementById("sound-toggle");
const musicVolume = document.getElementById("music-volume");

let musicEnabled = false;
let soundsEnabled = true;

music.volume = 0.3;

musicToggle.addEventListener("click", async () => {
  musicEnabled = !musicEnabled;

  if (musicEnabled) {
    try {
      await music.play();
      musicToggle.textContent = "🎵 Music: ON";
      musicToggle.classList.add("active");
    } catch (error) {
      musicEnabled = false;
      musicToggle.textContent = "🎵 Music: OFF";
      musicToggle.classList.remove("active");
      alert("Music play nahi ho paaya. Music file check karo.");
    }
  } else {
    music.pause();
    musicToggle.textContent = "🎵 Music: OFF";
    musicToggle.classList.remove("active");
  }
});

soundToggle.addEventListener("click", () => {
  soundsEnabled = !soundsEnabled;
  soundToggle.textContent = soundsEnabled
    ? "🔊 Sounds: ON"
    : "🔇 Sounds: OFF";

  soundToggle.classList.toggle("active", soundsEnabled);
});

musicVolume.addEventListener("input", () => {
  music.volume = Number(musicVolume.value);
});