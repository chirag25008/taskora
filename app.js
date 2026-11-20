const STORAGE_KEY = "daybook-tasks-v1";

const sampleTasks = [
  { id: "sample-1", title: "Read chapter 6 and make lecture notes", course: "Biology 204", due: "", priority: "normal", completed: false, created: 1 },
  { id: "sample-2", title: "Submit the first draft of research paper", course: "English 110", due: "", priority: "high", completed: false, created: 2 },
  { id: "sample-3", title: "Review calculus problem set", course: "Math 131", due: "", priority: "low", completed: true, created: 3 },
];

let tasks = loadTasks();
let activeFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const sortSelect = document.querySelector("#sort-select");

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [...sampleTasks];
  } catch {
    return [...sampleTasks];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function isToday(dateString) {
  return dateString === new Date().toLocaleDateString("en-CA");
}

function visibleTasks() {
  const filtered = tasks.filter((task) => {
    if (activeFilter === "today") return !task.completed && isToday(task.due);
    if (activeFilter === "upcoming") return !task.completed && task.due && task.due > new Date().toLocaleDateString("en-CA");
    if (activeFilter === "completed") return task.completed;
    return !task.completed;
  });

  const priorityOrder = { high: 0, normal: 1, low: 2 };
  return filtered.sort((first, second) => {
    if (sortSelect.value === "priority") return priorityOrder[first.priority] - priorityOrder[second.priority];
    if (sortSelect.value === "created") return second.created - first.created;
    return (first.due || "9999-12-31").localeCompare(second.due || "9999-12-31");
  });
}

function makeTaskRow(task) {
  const row = document.createElement("article");
  row.className = `task-row${task.completed ? " is-complete" : ""}`;

  const checkButton = document.createElement("button");
  checkButton.className = "task-check";
  checkButton.type = "button";
  checkButton.setAttribute("aria-label", task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`);
  checkButton.setAttribute("aria-pressed", String(task.completed));
  const checkGlyph = document.createElement("span");
  checkGlyph.className = "check-glyph";
  checkGlyph.textContent = "✓";
  checkButton.append(checkGlyph);
  checkButton.addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    render();
  });

  const main = document.createElement("div");
  main.className = "task-main";
  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;
  main.append(title);

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
      due.className = `due-label${!task.completed && task.due < new Date().toLocaleDateString("en-CA") ? " is-overdue" : ""}`;
      due.textContent = `${task.due < new Date().toLocaleDateString("en-CA") && !task.completed ? "Overdue · " : "Due "}${formatDate(task.due)}`;
      meta.append(due);
    }
    main.append(meta);
  }

  const priority = document.createElement("span");
  priority.className = `task-priority priority-${task.priority}`;
  const dot = document.createElement("span");
  dot.className = "priority-dot";
  priority.append(dot, document.createTextNode(task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Normal"));

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-task";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
  });

  row.append(checkButton, main, priority, deleteButton);
  return row;
}

function render() {
  const filteredTasks = visibleTasks();
  taskList.replaceChildren();

  if (filteredTasks.length) {
    taskList.append(...filteredTasks.map(makeTaskRow));
  } else {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const symbol = document.createElement("span");
    symbol.textContent = activeFilter === "completed" ? "✓" : "✳";
    const message = document.createElement("p");
    message.textContent = activeFilter === "completed" ? "Nothing completed just yet." : "All clear here. Add a task whenever you’re ready.";
    empty.append(symbol, message);
    taskList.append(empty);
  }

  const activeCount = tasks.filter((task) => !task.completed).length;
  const todayCount = tasks.filter((task) => !task.completed && isToday(task.due)).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  document.querySelector("#all-count").textContent = activeCount;
  document.querySelector("#today-count").textContent = todayCount;
  document.querySelector("#task-total").textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;
  document.querySelector("#progress-label").textContent = `${completedCount} / ${tasks.length}`;
  document.querySelector("#progress-fill").style.width = `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`;
  document.querySelector("#progress-caption").textContent = tasks.length && completedCount === tasks.length ? "Everything on your list is done." : completedCount ? "Nice work. Keep the momentum going." : "Start with one small thing.";
  document.querySelector("#list-title").textContent = ({ all: "Your tasks", today: "Due today", upcoming: "Coming up", completed: "Completed" })[activeFilter];
  document.querySelector("#view-name").textContent = ({ all: "ALL TASKS", today: "DUE TODAY", upcoming: "UPCOMING", completed: "COMPLETED" })[activeFilter];
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = String(formData.get("title")).trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    course: String(formData.get("course")).trim(),
    due: String(formData.get("due")),
    priority: String(formData.get("priority")),
    completed: false,
    created: Date.now(),
  });
  saveTasks();
  taskForm.reset();
  activeFilter = "all";
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "all"));
  render();
  taskInput.focus();
});

sortSelect.addEventListener("change", render);

const now = new Date();
document.querySelector("#today-date").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(now);
document.querySelector("#friendly-date").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now).toUpperCase();
render();