# Take-Home: Todo List (Vanilla JS)

**Goal**: Build a todo app with **1-level nested drag & drop**, filters, and persistence — **no frameworks, no libraries**.

---

# 📝 Todo App

A responsive, single-page **Nested Todo App** built with vanilla JavaScript, featuring **1-level nesting**, **drag & drop**, **filters**, and **persistent storage**.

---

## 🎯 Overview

This project allows users to manage tasks and subtasks in an intuitive interface.  
You can add todos, nest subtasks, reorder items with drag-and-drop, and filter by completion status.  
All data is saved in **localStorage** for persistence between sessions.

---

### 🧰 Tech Stack

- HTML
- CSS
- JavaScript (Vanilla)

## 🚀 Core Requirements (Must-Have)

### 1. Add Todos

- Add **top-level todos** by typing into an input and pressing **Enter**.
- Each todo has a button or icon to **add a sub-task** beneath it.
- Sub-tasks are displayed visually indented below their parent.
  Example

```
-   Buy groceries
    -   Buy milk
    -   Buy eggs
-   Read a book
    -   Chapter 1: Introduction
```

---

### 2. Drag & Drop (1-Level Nested)

Uses the **HTML5 Drag API** (`draggable`, `dragstart`, `dragover`, `drop`) to reorder tasks.

- **Drag parent task:** Moves along with all its sub-tasks.
- **Drag sub-task:** Can be dropped under a different parent or promoted to top-level.
- **Visual indent:** Sub-tasks appear slightly indented for clarity.

---

### 3. Mark Complete / Delete

- Each todo has a **checkbox** to mark completion.
- Completed tasks are shown with a **strikethrough**.
- A **delete icon** removes a task (and its sub-tasks, if any).

---

### 4. Filter Tabs

Toggle between task views:

- **All**
- **Active**
- **Completed**

When filters are selected, the **URL hash** updates automatically:

- `#all` → Show all tasks
- `#active` → Show uncompleted tasks
- `#completed` → Show completed tasks

---

### 5. Persistence (Local Storage)

- Todos are **saved to localStorage** on every change.
- On refresh, data is automatically reloaded.

---

### 6. Responsive Design

- Works on both **desktop and mobile**.
- Touch drag-and-drop is optional but considered a bonus.

---

## 📦 Deliverables

- **Live Demo:** Hosted on [Vercel](https://vercel.com) / [Netlify](https://www.netlify.com) / [Github Pages](https://github.com)
- **GitHub Repository:** With clean, descriptive commit messages and organized code.

---

## 🧗 Challenges Faced

- **Drag & drop with nesting** — Handling both parent tasks (with their subtasks) and subtasks in the same list required clear state (`dragged`, `dropTarget`) and logic to distinguish “drop as top-level” vs “drop under this parent.” Deciding insert index when dropping on a parent vs a sibling needed careful handling.
- **Filter + parent/child visibility** — Showing the right items per filter (All / Active / Completed) while keeping parent–child relationship and indentation correct was tricky. A parent can be “active” while some subtasks are completed, so the filtered list is built by iterating parents and their subtasks and pushing each item with an `isSub` and `parent` reference for rendering.
- **URL hash and re-render** — Keeping the filter in sync with `#all`, `#active`, `#completed` and re-rendering on `hashchange` (and on load) required a single source of truth (hash) and updating filter button states without duplicating logic.
- **LocalStorage robustness** — Parsing saved data can fail (corrupt or old format). The app uses a try/catch and falls back to an empty array so the UI never breaks on load.
- **Moving a parent with subtasks** — On drop, the full parent object (including its `subtasks` array) is moved so that nested data stays intact when reordering top-level items.

---

## 💡 Suggestions for Improvements

- **Touch-friendly drag & drop** — Add touch event handling (e.g. long-press to start drag) or use a small library so reordering works on mobile.
- **Inline editing** — Allow clicking the task text to edit in place instead of only adding; improves UX and avoids deleting/re-adding.
- **Inline add subtask** — Replace `prompt()` with an inline input or “Add subtask” row under a parent for a smoother flow.
- **Clear completed / bulk actions** — A “Clear completed” button and optional “Mark all complete” to manage many tasks at once.
- **Keyboard accessibility** — Improve focus management (e.g. after add/delete), and add shortcuts (e.g. Escape to cancel, Enter to confirm).
- **Due dates or priorities** — Optional fields for sorting and filtering by date or priority.
- **Undo / redo** — Keep a short history of actions and allow undoing the last add/delete/move/toggle.
- **Export / import** — Export todos to JSON (or CSV) and import from file for backup or migration.
- **Empty state per filter** — Different messages for “No active tasks” vs “No completed tasks” when a filter is active.
- **Tests** — Add unit tests (e.g. with Jest or Vitest) for data helpers (`loadFromStorage`, `getFilteredItems`, `moveDraggedTo`) to guard against regressions.
