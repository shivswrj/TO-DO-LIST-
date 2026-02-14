// -------------------------------------------------
//  Todo List – Vanilla JS (1-level nested, drag & drop, filters, persistence)
// -------------------------------------------------

const STORAGE_KEY = "todo-app-data";
const listEl = document.getElementById("todo-list");
const inputEl = document.getElementById("new-todo");
const filterButtons = document.querySelectorAll(".filters [data-filter]");

let todos = loadFromStorage();

// --- Data helpers ---
function uid() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- Flatten for rendering (preserve parent/sub relationship) ---
function getFilteredItems() {
  const hash = (window.location.hash || "#all").slice(1).toLowerCase();
  const filter = hash === "active" || hash === "completed" ? hash : "all";

  const out = [];
  for (const todo of todos) {
    const showParent =
      filter === "all" ||
      (filter === "active" && !todo.completed) ||
      (filter === "completed" && todo.completed);
    if (showParent) {
      out.push({ item: todo, isSub: false });
      for (const sub of todo.subtasks || []) {
        const showSub =
          filter === "all" ||
          (filter === "active" && !sub.completed) ||
          (filter === "completed" && sub.completed);
        if (showSub) out.push({ item: sub, isSub: true, parent: todo });
      }
    }
  }
  return out;
}

// --- Sync URL hash with filter ---
function setFilter(filter) {
  const f = (filter || "all").toLowerCase();
  window.location.hash = f === "all" ? "#all" : "#" + f;
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === f);
  });
}

function initFiltersFromHash() {
  const hash = (window.location.hash || "#all").slice(1).toLowerCase();
  const f = hash === "active" || hash === "completed" ? hash : "all";
  setFilter(f);
}

window.addEventListener("hashchange", () => {
  initFiltersFromHash();
  render();
});

// --- Add todo (top-level) ---
function addTodo(text) {
  const t = (text || "").trim();
  if (!t) return;
  todos.push({
    id: uid(),
    text: t,
    completed: false,
    subtasks: [],
  });
  saveToStorage();
  render();
}

// --- Add subtask under a parent ---
function addSubtask(parentId, text) {
  const t = (text || "").trim();
  if (!t) return;
  const parent = todos.find((x) => x.id === parentId);
  if (!parent) return;
  if (!parent.subtasks) parent.subtasks = [];
  parent.subtasks.push({
    id: uid(),
    text: t,
    completed: false,
  });
  saveToStorage();
  render();
}

// --- Toggle completion ---
function toggleComplete(id, isSub, parentId) {
  if (isSub && parentId) {
    const parent = todos.find((x) => x.id === parentId);
    const sub = parent?.subtasks?.find((x) => x.id === id);
    if (sub) sub.completed = !sub.completed;
  } else {
    const todo = todos.find((x) => x.id === id);
    if (todo) todo.completed = !todo.completed;
  }
  saveToStorage();
  render();
}

// --- Delete (task + subtasks) ---
function deleteTodo(id, isSub, parentId) {
  if (isSub && parentId) {
    const parent = todos.find((x) => x.id === parentId);
    if (parent?.subtasks) parent.subtasks = parent.subtasks.filter((s) => s.id !== id);
  } else {
    todos = todos.filter((x) => x.id !== id);
  }
  saveToStorage();
  render();
}

// --- Drag & drop state ---
let dragged = null; // { id, isSub, parentId }
let dropTarget = null; // element

function getTodoById(id, isSub, parentId) {
  if (isSub && parentId) {
    const parent = todos.find((x) => x.id === parentId);
    return parent?.subtasks?.find((s) => s.id === id) || null;
  }
  return todos.find((x) => x.id === id) || null;
}

function getParentById(parentId) {
  return todos.find((x) => x.id === parentId) || null;
}

function moveDraggedTo(newParentId, insertIndex) {
  // newParentId: null = top-level, else parent id
  if (!dragged) return;
  const { id, isSub, parentId: oldParentId } = dragged;

  let item;
  if (isSub && oldParentId) {
    const oldParent = todos.find((x) => x.id === oldParentId);
    const idx = oldParent?.subtasks?.findIndex((s) => s.id === id);
    if (idx == null || idx < 0) return;
    item = oldParent.subtasks.splice(idx, 1)[0];
  } else {
    const idx = todos.findIndex((x) => x.id === id);
    if (idx < 0) return;
    item = todos.splice(idx, 1)[0];
    // item might have subtasks – we move the whole object
  }

  if (newParentId === null) {
    // Top-level: ensure item has subtasks array
    if (!item.subtasks) item.subtasks = [];
    todos.splice(insertIndex, 0, item);
  } else {
    const newParent = todos.find((x) => x.id === newParentId);
    if (!newParent) return;
    if (!newParent.subtasks) newParent.subtasks = [];
    newParent.subtasks.splice(insertIndex, 0, item);
  }
  saveToStorage();
  render();
}

function onDragStart(e, id, isSub, parentId) {
  dragged = { id, isSub, parentId };
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", id);
  e.target.classList.add("dragging");
}

function onDragEnd(e) {
  e.target.classList.remove("dragging");
  if (dropTarget) dropTarget.classList.remove("drop-target");
  dropTarget = null;
  dragged = null;
}

function onDragOver(e, targetId, targetIsSub, targetParentId) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (!dragged) return;
  if (dragged.id === targetId && dragged.isSub === targetIsSub) return;
  if (dropTarget) dropTarget.classList.remove("drop-target");
  dropTarget = e.currentTarget;
  e.currentTarget.classList.add("drop-target");
}

function onDragLeave(e) {
  if (e.currentTarget === dropTarget) {
    e.currentTarget.classList.remove("drop-target");
    dropTarget = null;
  }
}

function onDrop(e, targetId, targetIsSub, targetParentId) {
  e.preventDefault();
  if (e.currentTarget === dropTarget) e.currentTarget.classList.remove("drop-target");
  dropTarget = null;
  if (!dragged) return;

  const targetParentIdResolved = targetIsSub ? targetParentId : null;
  const targetIsTopLevel = !targetIsSub;

  let newParentId = null;
  let insertIndex = 0;

  if (targetIsTopLevel) {
    const idx = todos.findIndex((x) => x.id === targetId);
    insertIndex = idx >= 0 ? idx : todos.length;
    newParentId = null;
  } else {
    const parent = getParentById(targetParentId);
    if (!parent) return;
    const idx = (parent.subtasks || []).findIndex((s) => s.id === targetId);
    insertIndex = idx >= 0 ? idx : (parent.subtasks || []).length;
    newParentId = targetParentId;
  }

  moveDraggedTo(newParentId, insertIndex);
}

// --- Render ---
function render() {
  const items = getFilteredItems();
  listEl.innerHTML = "";

  items.forEach(({ item, isSub, parent }) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (isSub ? " subtask" : "");
    li.setAttribute("data-id", item.id);
    li.setAttribute("data-is-sub", isSub ? "1" : "0");
    if (parent) li.setAttribute("data-parent-id", parent.id);

    li.draggable = true;
    li.addEventListener("dragstart", (e) => onDragStart(e, item.id, isSub, parent?.id));
    li.addEventListener("dragend", onDragEnd);
    li.addEventListener("dragover", (e) => onDragOver(e, item.id, isSub, parent?.id));
    li.addEventListener("dragleave", onDragLeave);
    li.addEventListener("drop", (e) => onDrop(e, item.id, isSub, parent?.id));

    const label = document.createElement("label");
    label.className = "todo-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!item.completed;
    checkbox.addEventListener("change", () => toggleComplete(item.id, isSub, parent?.id));

    const span = document.createElement("span");
    span.className = "text" + (item.completed ? " completed" : "");
    span.textContent = item.text;

    const actions = document.createElement("span");
    actions.className = "actions";

    if (!isSub) {
      const addSubBtn = document.createElement("button");
      addSubBtn.type = "button";
      addSubBtn.className = "btn-add-sub";
      addSubBtn.title = "Add sub-task";
      addSubBtn.setAttribute("aria-label", "Add sub-task");
      addSubBtn.innerHTML = "+";
      addSubBtn.addEventListener("click", () => {
        const text = prompt("New sub-task:");
        if (text != null) addSubtask(item.id, text);
      });
      actions.appendChild(addSubBtn);
    }

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-delete";
    delBtn.title = "Delete";
    delBtn.setAttribute("aria-label", "Delete");
    delBtn.innerHTML = "×";
    delBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteTodo(item.id, isSub, parent?.id);
    });

    actions.appendChild(delBtn);
    label.append(checkbox, span, actions);
    li.appendChild(label);
    listEl.appendChild(li);
  });
}

// --- Input: add todo on Enter ---
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo(inputEl.value);
    inputEl.value = "";
  }
});

// --- Filter buttons ---
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.getAttribute("data-filter")));
});

// --- Boot ---
initFiltersFromHash();
render();
