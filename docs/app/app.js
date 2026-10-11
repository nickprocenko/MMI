"use strict";

/* MMI Members — installable web app (PWA).
 * All data lives in this browser's localStorage. Everything goes through `store`,
 * so it can later be swapped for a shared online database. */

// ── Built-in data ─────────────────────────────────────────────────────────

const PETER = "peter";
const VALEITA = "valeita";
const NICK = "nick";
const TECHS = [PETER, NICK];

const SEED_MEMBERS = [
  { id: PETER, name: "Peter", roles: ["Owner", "Technician"], title: "Owner / Technician", color: "#1e88e5" },
  { id: VALEITA, name: "Valeita", roles: ["Owner", "Admin"], title: "Owner / Admin", color: "#8e24aa" },
  { id: NICK, name: "Nick", roles: ["Owner", "Technician"], title: "Owner / Technician", color: "#ef6c00" },
].map((m) => ({ email: "", phone: "", bio: "", certifications: [], ...m }));

const STATUSES = { NOT_STARTED: "Not started", IN_PROGRESS: "In progress", COMPLETE: "Complete" };
const CATEGORIES = {
  MEASUREMENT_CANADA: "Measurement Canada",
  TSSA: "TSSA",
  EQUIPMENT: "Equipment",
  ADMIN: "Admin",
  BUSINESS: "Business",
  OTHER: "Other",
};
const REPORT_TYPES = { FIELD: "Field work", INSPECTION: "Inspection", TRAINING: "Training", ADMIN: "Admin", OTHER: "Other" };

function steps(prefix, items) {
  return items.map(([text, done], i) => ({ id: `${prefix}-${i}`, text, done: !!done }));
}

// Starter goals from the fuels certification roadmap (MMI_Roadmap/ in this repo).
const SEED_GOALS = [
  {
    id: "mc-practical",
    title: "MC Practical Evaluation — Bulk & Retail Petroleum",
    description: "Field practical with Measurement Canada (Stoney Creek). Required before MMI can inspect and certify retail dispensers and bulk plant meters.",
    category: "MEASUREMENT_CANADA", ownerIds: TECHS, status: "IN_PROGRESS", targetDate: "2027-04",
    checklist: steps("mc-practical", [
      ["Theoretical evaluation passed (File ID 26535-M20)", true],
      ["Request practical evaluation scheduling with the regional office"],
      ["Secure a booking date in April 2027"],
      ["Complete field practical evaluation"],
      ["Receive confirmation of successful practical"],
    ]),
  },
  {
    id: "tssa-pmh",
    title: "Petroleum Mechanic Helper (PMH)",
    description: "TSSA, online and self-paced. Mandatory gate to PM.1 / PM.2 / PM.3. $507.37 incl. HST.",
    category: "TSSA", ownerIds: TECHS, targetDate: "2026-12",
    checklist: steps("tssa-pmh", [["Enroll in PMH course"], ["Complete course modules"], ["Pass exam"], ["TSSA certificate number received"]]),
  },
  {
    id: "tssa-lfhc",
    title: "Liquid Fuels Handling Code 2017",
    description: "TSSA. Requires an existing TSSA cert number to enroll (PMH qualifies). ~$198 incl. HST.",
    category: "TSSA", ownerIds: TECHS, targetDate: "2027-01",
    checklist: steps("tssa-lfhc", [["PMH certificate in hand"], ["Enroll"], ["Pass exam"]]),
  },
  {
    id: "tssa-site-operator",
    title: "Site Operator — Retail",
    description: "TSSA. Operate retail fuel dispensing sites. ~$372 incl. HST.",
    category: "TSSA", ownerIds: TECHS, targetDate: "2027-03", checklist: [],
  },
  {
    id: "tssa-pm1",
    title: "Petroleum Equipment Mechanic PM.1",
    description: "Service and maintain dispensers and submersible pumps. Requires PMH and 1,000 field hours.",
    category: "TSSA", ownerIds: TECHS, targetDate: "2027-06",
    checklist: steps("tssa-pm1", [
      ["PMH certificate in hand"], ["Arrange field hours with a local contractor"], ["Log 1,000 field hours"], ["Pass PM.1 exam"],
    ]),
  },
  {
    id: "equipment-20l",
    title: "Recognized 20 L test measure",
    description: "Purchase an MC-recognized 20 L measure and have it designated as a local standard.",
    category: "EQUIPMENT", ownerIds: [], targetDate: "2027-03",
    checklist: steps("equipment-20l", [
      ["Confirm with MC which local standards MMI must own"], ["Purchase recognized 20 L measure"], ["Verification and local-standard designation"],
    ]),
  },
  {
    id: "admin-schedule-a",
    title: "MC registration & Schedule A records",
    description: "Keep MMI's Measurement Canada registration active and Schedule A records filed.",
    category: "ADMIN", ownerIds: [VALEITA], status: "IN_PROGRESS", targetDate: "2027-05",
    checklist: steps("admin-schedule-a", [
      ["Confirm registration status is active with Measurement Canada"],
      ["File theoretical evaluation letter and record"],
      ["File practical evaluation confirmation letter"],
      ["Obtain and file updated Schedule A"],
    ]),
  },
  {
    id: "business-first-client",
    title: "First client inspection under MMI's Schedule A",
    description: "Land the first inspection, then recurring bi-annual inspection contracts.",
    category: "BUSINESS", ownerIds: [], targetDate: "2027-06",
    checklist: steps("business-first-client", [
      ["Authorized to inspect retail fuel dispensers"],
      ["Authorized to inspect bulk plant meters"],
      ["First client inspection completed"],
      ["Recurring bi-annual contracts established"],
    ]),
  },
].map((g) => ({ status: "NOT_STARTED", ...g }));

// ── Store ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mmi-members-data-v1";

const store = {
  data: null,

  load() {
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      data = null;
    }
    if (!data || !Array.isArray(data.members)) {
      data = { schemaVersion: 1, activeMemberId: null, members: SEED_MEMBERS, goals: SEED_GOALS, reports: [], tests: [] };
    }
    // Make sure every built-in member exists, e.g. after an update adds one.
    for (const seed of SEED_MEMBERS) {
      if (!data.members.some((m) => m.id === seed.id)) data.members.push(seed);
    }
    data.goals ||= [];
    data.reports ||= [];
    data.tests = (data.tests || []).map(normalizeTest);
    this.data = data;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      toast("Couldn't save — storage is full or blocked.");
    }
  },

  update(fn) {
    fn(this.data);
    this.save();
  },

  member(id) { return this.data.members.find((m) => m.id === id); },
  goal(id) { return this.data.goals.find((g) => g.id === id); },
  report(id) { return this.data.reports.find((r) => r.id === id); },
  test(id) { return this.data.tests.find((t) => t.id === id); },
  me() { return this.member(this.data.activeMemberId); },
};

// ── Helpers ───────────────────────────────────────────────────────────────

const app = document.getElementById("app");
const tabs = document.getElementById("tabs");
const dialogRoot = document.getElementById("dialog-root");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value.slice(0, 7));
}

function formatHours(h) {
  return Number.isInteger(h) ? String(h) : String(Math.round(h * 100) / 100);
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

function isTeamGoal(goal) { return goal.ownerIds.length === 0; }
function isAssignedTo(goal, memberId) { return isTeamGoal(goal) || goal.ownerIds.includes(memberId); }

function progress(goal) {
  if (goal.status === "COMPLETE") return 1;
  if (goal.checklist.length) return goal.checklist.filter((c) => c.done).length / goal.checklist.length;
  return 0;
}

/** Keeps status in step with the checklist: any progress starts it, all done completes it. */
function syncStatus(goal) {
  const done = goal.checklist.filter((c) => c.done).length;
  if (goal.checklist.length && done === goal.checklist.length) goal.status = "COMPLETE";
  else if (done > 0) goal.status = "IN_PROGRESS";
  else if (goal.status === "COMPLETE") goal.status = "IN_PROGRESS";
}

function byTarget(a, b) {
  const aDone = a.status === "COMPLETE", bDone = b.status === "COMPLETE";
  if (aDone !== bDone) return aDone ? 1 : -1;
  if (!a.targetDate !== !b.targetDate) return a.targetDate ? -1 : 1;
  return a.targetDate.localeCompare(b.targetDate);
}

let toastTimer;
function toast(message) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

function confirmDialog(title, text, confirmLabel, onConfirm) {
  dialogRoot.innerHTML = `
    <div class="scrim" data-action="close-dialog">
      <div class="dialog" role="dialog" aria-modal="true">
        <h3>${esc(title)}</h3>
        <p class="muted">${esc(text)}</p>
        <div class="actions">
          <button class="btn text" data-action="close-dialog">Cancel</button>
          <button class="btn danger" id="confirm-btn">${esc(confirmLabel)}</button>
        </div>
      </div>
    </div>`;
  dialogRoot.querySelector(".dialog").addEventListener("click", (e) => {
    if (!e.target.closest("[data-action='close-dialog']")) e.stopPropagation();
  });
  dialogRoot.querySelector("#confirm-btn").addEventListener("click", () => {
    dialogRoot.innerHTML = "";
    onConfirm();
  });
}

// ── Icons (Material Design paths) ─────────────────────────────────────────

const ICONS = {
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  flag: "M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z",
  report: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  team: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  swap: "M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z",
  chevron: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  verified: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  upload: "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z",
  gauge: "M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z",
  book: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z",
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

// ── Shared pieces ─────────────────────────────────────────────────────────

function avatar(member, size = 40) {
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px;background:${esc(member.color)}">${esc(initials(member.name))}</span>`;
}

function mainBar(title) {
  const me = store.me();
  return `<header class="topbar">
    <h1>${esc(title)}</h1>
    <a class="icon-btn" href="#/profile/${esc(me.id)}" aria-label="My profile">${avatar(me, 32)}</a>
  </header>`;
}

function detailBar(title, actions = "") {
  return `<header class="topbar with-back">
    <button class="icon-btn" data-action="back" aria-label="Back">${icon("back")}</button>
    <h1>${esc(title)}</h1>
    ${actions}
  </header>`;
}

function statusBadge(status) {
  return `<span class="status ${esc(status)}">${esc(STATUSES[status])}</span>`;
}

function progressBar(value) {
  return `<div class="progress" role="progressbar" aria-valuenow="${Math.round(value * 100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${(value * 100).toFixed(1)}%"></span></div>`;
}

function owners(goal) {
  if (isTeamGoal(goal)) return `<span class="tag">Team</span>`;
  return `<span class="row" style="gap:4px">${goal.ownerIds.map((id) => store.member(id)).filter(Boolean).map((m) => avatar(m, 24)).join("")}</span>`;
}

function goalCard(goal) {
  return `<a class="card" href="#/goal/${esc(goal.id)}">
    <div class="row"><span class="tag">${esc(CATEGORIES[goal.category] || goal.category)}</span><span class="grow"></span>${statusBadge(goal.status)}</div>
    <div class="card-title" style="margin:8px 0 10px">${esc(goal.title)}</div>
    ${progressBar(progress(goal))}
    <div class="row" style="margin-top:10px">${owners(goal)}<span class="grow"></span>${goal.targetDate ? `<span class="small muted">Target ${esc(goal.targetDate)}</span>` : ""}</div>
  </a>`;
}

function reportCard(report) {
  const author = store.member(report.authorId);
  const meta = [REPORT_TYPES[report.type], report.date, report.hours != null ? `${formatHours(report.hours)} h` : null].filter(Boolean).join(" · ");
  return `<a class="card row" style="gap:12px" href="#/report/${esc(report.id)}">
    ${author ? avatar(author, 36) : ""}
    <span class="grow"><span class="card-title" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(report.title)}</span>
    <span class="small muted">${esc(meta)}</span></span>
  </a>`;
}

function chip(label, pressed, attrs = "") {
  return `<button type="button" class="chip" aria-pressed="${pressed}" ${attrs}>${esc(label)}</button>`;
}

function empty(text) { return `<p class="empty">${esc(text)}</p>`; }

// ── Screens ───────────────────────────────────────────────────────────────

function pickerScreen() {
  const cards = store.data.members.map((m) => `
    <button class="card row" style="gap:16px" data-action="sign-in" data-id="${esc(m.id)}">
      ${avatar(m, 56)}
      <span class="grow">
        <span class="card-title" style="display:block;font-size:1.2rem">${esc(m.name)}</span>
        <span class="row wrap" style="gap:6px;margin-top:4px">${m.roles.map((r) => `<span class="tag">${esc(r)}</span>`).join("")}</span>
      </span>
      ${icon("chevron")}
    </button>`).join("");
  return `<div class="picker">
    <div class="brand">MMI Computers Inc.</div>
    <h1>Who's using MMI?</h1>
    <p class="muted">Choose your profile to see your goals and reports.</p>
    <div class="stack" style="margin-top:24px">${cards}</div>
  </div>`;
}

function greeting() {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? "Good morning" : h < 17 && h >= 12 ? "Good afternoon" : "Good evening";
}

function homeScreen() {
  const me = store.me();
  const { goals, reports } = store.data;
  const mine = goals.filter((g) => isAssignedTo(g, me.id));
  const open = mine.filter((g) => g.status !== "COMPLETE");
  const month = today().slice(0, 7);
  const myMonthReports = reports.filter((r) => r.authorId === me.id && r.date.startsWith(month)).length;
  const team = goals.length ? goals.reduce((s, g) => s + progress(g), 0) / goals.length : 0;
  const upcoming = [...open].sort(byTarget).slice(0, 3);
  const recent = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

  return `<header class="topbar">
      <h1>MMI</h1>
      <button class="icon-btn" data-action="sign-out" aria-label="Switch profile">${icon("swap")}</button>
      <a class="icon-btn" href="#/profile/${esc(me.id)}" aria-label="My profile">${avatar(me, 32)}</a>
    </header>
    <main class="page">
      <h2 style="margin:4px 0 0;font-size:1.5rem">${greeting()}, ${esc(me.name)}</h2>
      <div class="muted">${esc(me.title)}</div>
      ${standalone ? "" : `<div class="install-tip" style="margin-top:14px"><b>Tip:</b> add this app to your home screen — in Chrome tap ⋮ → <i>Add to Home screen</i>; on iPhone tap Share → <i>Add to Home Screen</i>.</div>`}
      <div class="stats" style="margin-top:16px">
        <div class="stat"><b>${open.length}</b><span>Open goals</span></div>
        <div class="stat"><b>${mine.length - open.length}</b><span>Completed</span></div>
        <div class="stat"><b>${myMonthReports}</b><span>Reports this month</span></div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="row"><b class="grow">Team roadmap progress</b><b>${Math.round(team * 100)}%</b></div>
        <div style="margin-top:8px">${progressBar(team)}</div>
      </div>
      <div class="row" style="margin-top:12px;gap:12px">
        <a class="btn tonal grow" href="#/report/new/edit">${icon("add")} New report</a>
        <a class="btn tonal grow" href="#/goal/new/edit">${icon("flag")} New goal</a>
      </div>
      <div class="row section-row"><h2 class="section grow">My next targets</h2><a class="btn text" href="#/goals">All goals</a></div>
      <div class="stack">${upcoming.map(goalCard).join("") || empty("Nothing open — nice work.")}</div>
      <div class="row section-row"><h2 class="section grow">Recent reports</h2><a class="btn text" href="#/reports">All reports</a></div>
      <div class="stack">${recent.map(reportCard).join("") || empty("No reports yet. Log field work, inspections or training.")}</div>
    </main>`;
}

const ui = { goalScope: "MINE", showCompleted: true, reportAuthor: null, testScope: "MINE", draftPhase: "AS_FOUND", draftFlow: "FAST" };

function goalsScreen() {
  const me = store.me();
  const goals = store.data.goals
    .filter((g) => ui.goalScope === "ALL" || (ui.goalScope === "TEAM" ? isTeamGoal(g) : isAssignedTo(g, me.id)))
    .filter((g) => ui.showCompleted || g.status !== "COMPLETE")
    .sort(byTarget);
  const scopes = { MINE: "Mine", TEAM: "Team", ALL: "All" };
  return `${mainBar("Goals")}
    <main class="page">
      <div class="chips">
        ${Object.entries(scopes).map(([k, v]) => chip(v, ui.goalScope === k, `data-action="goal-scope" data-value="${k}"`)).join("")}
        ${chip("Show completed", ui.showCompleted, `data-action="toggle-completed"`)}
      </div>
      <div class="stack" style="margin-top:14px">${goals.map(goalCard).join("") || empty("No goals here yet.")}</div>
    </main>
    <a class="fab" href="#/goal/new/edit">${icon("add")} New goal</a>`;
}

function goalScreen(id) {
  const goal = store.goal(id);
  if (!goal) return `${detailBar("Goal")}<main class="page no-tabs">${empty("This goal no longer exists.")}</main>`;
  const done = goal.checklist.filter((c) => c.done).length;
  return `${detailBar("Goal", `
      <a class="icon-btn" href="#/goal/${esc(goal.id)}/edit" aria-label="Edit">${icon("edit")}</a>
      <button class="icon-btn" data-action="delete-goal" data-id="${esc(goal.id)}" aria-label="Delete">${icon("delete")}</button>`)}
    <main class="page no-tabs">
      <div class="row"><span class="tag">${esc(CATEGORIES[goal.category] || goal.category)}</span><span class="grow"></span>${statusBadge(goal.status)}</div>
      <h2 style="margin:10px 0 6px;font-size:1.4rem">${esc(goal.title)}</h2>
      ${goal.description ? `<p style="margin:0;white-space:pre-wrap">${esc(goal.description)}</p>` : ""}
      <div class="row" style="margin:14px 0 12px">${owners(goal)}<span class="grow"></span>${goal.targetDate ? `<span class="small muted">Target ${esc(goal.targetDate)}</span>` : ""}</div>
      ${progressBar(progress(goal))}
      <h2 class="section">Status</h2>
      <div class="chips">${Object.entries(STATUSES).map(([k, v]) => chip(v, goal.status === k, `data-action="goal-status" data-id="${esc(goal.id)}" data-value="${k}"`)).join("")}</div>
      <h2 class="section">Checklist (${done}/${goal.checklist.length})</h2>
      <div>${goal.checklist.map((item) => `
        <div class="check-item ${item.done ? "done" : ""}">
          <label><input type="checkbox" ${item.done ? "checked" : ""} data-action="toggle-step" data-goal="${esc(goal.id)}" data-id="${esc(item.id)}"><span>${esc(item.text)}</span></label>
          <button class="icon-btn" data-action="remove-step" data-goal="${esc(goal.id)}" data-id="${esc(item.id)}" aria-label="Remove step">${icon("close")}</button>
        </div>`).join("")}
      </div>
      <form class="row" style="margin-top:8px" data-form="add-step" data-goal="${esc(goal.id)}">
        <label class="field grow" style="margin:0"><input name="text" placeholder="Add a step" autocomplete="off" aria-label="New step"></label>
        <button class="icon-btn" type="submit" aria-label="Add step">${icon("add")}</button>
      </form>
    </main>`;
}

function goalEditScreen(id) {
  const me = store.me();
  const existing = store.goal(id);
  const goal = existing || { title: "", description: "", targetDate: "", category: "OTHER", ownerIds: [me.id] };
  return `${detailBar(existing ? "Edit goal" : "New goal", `<button class="icon-btn" form="goal-form" type="submit" aria-label="Save">${icon("check")}</button>`)}
    <main class="page no-tabs">
      <form id="goal-form" data-form="goal" data-id="${esc(existing ? existing.id : "")}">
        <label class="field"><span>Title</span><input name="title" required value="${esc(goal.title)}"></label>
        <label class="field"><span>Description</span><textarea name="description">${esc(goal.description)}</textarea></label>
        <label class="field"><span>Target date</span><input name="targetDate" placeholder="e.g. 2027-04" value="${esc(goal.targetDate)}"></label>
        <div class="field"><span>Category</span>
          <div class="chips" data-single="category">${Object.entries(CATEGORIES).map(([k, v]) => chip(v, goal.category === k, `data-value="${k}"`)).join("")}</div>
        </div>
        <div class="field"><span>Assigned to</span>
          <div class="chips" data-owners>
            ${chip("Whole team", goal.ownerIds.length === 0, `data-value=""`)}
            ${store.data.members.map((m) => chip(m.name, goal.ownerIds.includes(m.id), `data-value="${esc(m.id)}"`)).join("")}
          </div>
        </div>
        ${existing ? "" : `<p class="small muted">Add checklist steps from the goal page after saving.</p>`}
        <button class="btn" type="submit" style="width:100%;margin-top:8px">Save goal</button>
      </form>
    </main>`;
}

function reportsScreen() {
  const reports = store.data.reports
    .filter((r) => !ui.reportAuthor || r.authorId === ui.reportAuthor)
    .sort((a, b) => b.date.localeCompare(a.date));
  const hours = reports.reduce((s, r) => s + (r.hours || 0), 0);
  return `${mainBar("Reports")}
    <main class="page">
      <div class="chips">
        ${chip("Everyone", !ui.reportAuthor, `data-action="report-author" data-value=""`)}
        ${store.data.members.map((m) => chip(m.name, ui.reportAuthor === m.id, `data-action="report-author" data-value="${esc(m.id)}"`)).join("")}
      </div>
      <p class="small muted" style="margin:10px 0">${reports.length} reports · ${formatHours(hours)} hours logged</p>
      <div class="stack">${reports.map(reportCard).join("") || empty("No reports yet. Tap New report to log field work, inspections or training.")}</div>
    </main>
    <a class="fab" href="#/report/new/edit">${icon("add")} New report</a>`;
}

function reportScreen(id) {
  const report = store.report(id);
  if (!report) return `${detailBar("Report")}<main class="page no-tabs">${empty("This report no longer exists.")}</main>`;
  const author = store.member(report.authorId);
  return `${detailBar("Report", `
      <a class="icon-btn" href="#/report/${esc(report.id)}/edit" aria-label="Edit">${icon("edit")}</a>
      <button class="icon-btn" data-action="delete-report" data-id="${esc(report.id)}" aria-label="Delete">${icon("delete")}</button>`)}
    <main class="page no-tabs">
      <div class="row"><span class="tag">${esc(REPORT_TYPES[report.type])}</span>${report.hours != null ? `<span class="tag">${formatHours(report.hours)} h</span>` : ""}</div>
      <h2 style="margin:10px 0 8px;font-size:1.4rem">${esc(report.title)}</h2>
      <div class="row muted">${author ? avatar(author, 28) : ""}<span>${esc([author?.name, report.date].filter(Boolean).join(" · "))}</span></div>
      <hr style="border:0;border-top:1px solid var(--border);margin:16px 0">
      <p style="margin:0;white-space:pre-wrap;font-size:1.05rem">${esc(report.body || "No details.")}</p>
    </main>`;
}

function reportEditScreen(id) {
  const existing = store.report(id);
  const r = existing || { title: "", type: "FIELD", date: today(), hours: null, body: "" };
  return `${detailBar(existing ? "Edit report" : "New report", `<button class="icon-btn" form="report-form" type="submit" aria-label="Save">${icon("check")}</button>`)}
    <main class="page no-tabs">
      <form id="report-form" data-form="report" data-id="${esc(existing ? existing.id : "")}" novalidate>
        <div class="field"><span>Type</span>
          <div class="chips" data-single="type">${Object.entries(REPORT_TYPES).map(([k, v]) => chip(v, r.type === k, `data-value="${k}"`)).join("")}</div>
        </div>
        <label class="field"><span>Title</span><input name="title" value="${esc(r.title)}"></label>
        <div class="field-row">
          <label class="field"><span>Date</span><input name="date" type="date" value="${esc(r.date)}"></label>
          <label class="field"><span>Hours</span><input name="hours" inputmode="decimal" value="${r.hours != null ? esc(formatHours(r.hours)) : ""}"></label>
        </div>
        <label class="field"><span>Details</span><textarea name="body" rows="8" placeholder="What was done, where, equipment used, follow-ups…">${esc(r.body)}</textarea></label>
        <button class="btn" type="submit" style="width:100%">Save report</button>
      </form>
    </main>`;
}

function teamScreen() {
  const me = store.me();
  const { goals, reports, members } = store.data;
  return `${mainBar("Team")}
    <main class="page"><div class="stack">
      ${members.map((m) => {
        const open = goals.filter((g) => isAssignedTo(g, m.id) && g.status !== "COMPLETE").length;
        const count = reports.filter((r) => r.authorId === m.id).length;
        const tests = store.data.tests.filter((t) => t.technicianId === m.id).length;
        return `<a class="card row" style="gap:16px" href="#/profile/${esc(m.id)}">
          ${avatar(m, 52)}
          <span class="grow">
            <span class="row"><span class="card-title">${esc(m.name)}</span>${m.id === me.id ? `<span class="tag">You</span>` : ""}</span>
            <span style="display:block">${esc(m.title)}</span>
            <span class="small muted">${open} open goals · ${count} reports · ${tests} tests</span>
          </span>
        </a>`;
      }).join("")}
    </div></main>`;
}

function infoRow(name, text) {
  return `<div class="row" style="gap:12px;padding:4px 0"><span style="color:var(--primary)">${icon(name)}</span><span>${esc(text)}</span></div>`;
}

function profileScreen(id) {
  const me = store.me();
  const m = store.member(id);
  if (!m) return `${detailBar("Profile")}<main class="page no-tabs">${empty("Member not found.")}</main>`;
  const goals = store.data.goals.filter((g) => g.ownerIds.includes(m.id) && g.status !== "COMPLETE").sort(byTarget);
  const reports = store.data.reports.filter((r) => r.authorId === m.id).sort((a, b) => b.date.localeCompare(a.date));
  return `${detailBar("Profile", `<a class="icon-btn" href="#/profile/${esc(m.id)}/edit" aria-label="Edit profile">${icon("edit")}</a>`)}
    <main class="page no-tabs">
      <div class="center">
        ${avatar(m, 96)}
        <h2 style="margin:12px 0 0;font-size:1.5rem">${esc(m.name)}</h2>
        ${m.title ? `<div class="muted">${esc(m.title)}</div>` : ""}
        <div class="row wrap" style="justify-content:center;margin-top:8px">${m.roles.map((r) => `<span class="tag">${esc(r)}</span>`).join("")}</div>
        ${m.id === me.id ? `<button class="btn outline" style="margin-top:14px" data-action="sign-out">${icon("swap")} Switch profile</button>` : ""}
      </div>
      <h2 class="section">Contact</h2>
      ${!m.email && !m.phone ? `<div class="muted">No contact details yet.</div>` : ""}
      ${m.email ? infoRow("mail", m.email) : ""}
      ${m.phone ? infoRow("phone", m.phone) : ""}
      ${m.bio ? `<h2 class="section">About</h2><p style="margin:0;white-space:pre-wrap">${esc(m.bio)}</p>` : ""}
      <h2 class="section">Certifications</h2>
      ${m.certifications.length ? m.certifications.map((c) => infoRow("verified", c)).join("") : `<div class="muted">None added yet.</div>`}
      <h2 class="section">Assigned goals (${goals.length} open)</h2>
      <div class="stack">${goals.map(goalCard).join("") || `<div class="muted">No individually assigned open goals.</div>`}</div>
      <h2 class="section">Reports (${reports.length})</h2>
      <div class="stack">${reports.slice(0, 5).map(reportCard).join("") || `<div class="muted">No reports yet.</div>`}</div>
      ${m.id === me.id ? `
        <h2 class="section">Backup</h2>
        <p class="small muted" style="margin-top:0">Data is saved on this device only. Download a backup now and then, and use it to move to a new phone.</p>
        <div class="row wrap">
          <button class="btn outline" data-action="export">${icon("download")} Download backup</button>
          <label class="btn outline">${icon("upload")} Restore backup<input type="file" accept="application/json,.json" data-action="import" hidden></label>
        </div>` : ""}
    </main>`;
}

function profileEditScreen(id) {
  const m = store.member(id);
  if (!m) return `${detailBar("Edit profile")}<main class="page no-tabs">${empty("Member not found.")}</main>`;
  const field = (label, name, value, type = "text") =>
    `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}"></label>`;
  return `${detailBar("Edit profile", `<button class="icon-btn" form="profile-form" type="submit" aria-label="Save">${icon("check")}</button>`)}
    <main class="page no-tabs">
      <div class="center" style="margin-bottom:16px">${avatar(m, 72)}</div>
      <form id="profile-form" data-form="profile" data-id="${esc(m.id)}">
        ${field("Name", "name", m.name)}
        ${field("Title", "title", m.title)}
        ${field("Roles (comma separated)", "roles", m.roles.join(", "))}
        ${field("Email", "email", m.email, "email")}
        ${field("Phone", "phone", m.phone, "tel")}
        <label class="field"><span>About</span><textarea name="bio">${esc(m.bio)}</textarea></label>
        <label class="field"><span>Certifications (one per line)</span><textarea name="certifications" placeholder="e.g. NTTP Theoretical — Bulk & Retail Petroleum">${esc(m.certifications.join("\n"))}</textarea></label>
        <button class="btn" type="submit" style="width:100%">Save profile</button>
      </form>
    </main>`;
}

// ── Calibration tests ─────────────────────────────────────────────────────
// Dispenser inspections following Measurement Canada's Field Inspection Manual (FIM),
// Volumetric, Part 2 Section 1 (Types 50/51) and the STPs it calls. Copies of every source are
// in MMI_Roadmap/Technicians/NTTP_Courses/Bulk_and_Retail_Petroleum/Study_Materials/Course_Binder.

const PRODUCTS = { GASOLINE_730: "Gasoline (730 kg/m³)", DIESEL_840: "Diesel (840 kg/m³)", OTHER: "Other product" };
const FLOWS = { FAST: "Fast flow", SLOW: "Slow flow" };
const PHASES = { AS_FOUND: "As found", AS_LEFT: "As left" };
const INSPECTION_TYPES = {
  IN_SERVICE: "In-service (field)",
  INITIAL_FIELD: "Initial — in the field",
  INITIAL_FACTORY: "Initial — factory / dealer",
};
const VERDICTS = { PASS: "Pass", FAIL: "Fail", INCOMPLETE: "Incomplete" };

/** Limits of error in mL by known test quantity: [acceptance, in-service]. Regs s.265; STP-12 confirms ±100 mL / 20 L. */
const LOE_ML = { 5: [30, 60], 10: [40, 80], 20: [50, 100], 50: [100, 200] };
/** Regs s.263 / STP-7: repeatability limit is 2/5 of the in-service limit of error. */
const REPEATABILITY_FRACTION = 0.4;
/** V-17 / STP-23: cubical coefficient of thermal expansion of 304 stainless steel, per °C. */
const CCE_304 = 0.0000518;
/** STP-22 drain times (seconds) unless the prover's certificate says otherwise. */
const DRAIN_SECONDS = { 5: 10, 10: 20, 20: 20, 50: 60 };
/** STP-18: ATC test volume ≥ 2000 × minimum increment (0.01 L on dispensers, SVM.1-20). */
const ATC_MIN_VOLUME = 20;

const CHECKS = [
  ["NOA", "Approved device, matches its Notice of Approval", "Act s.8, R.17"],
  ["MARKINGS", "Markings incl. “volume corrected to 15 °C”", "R.18, R.21"],
  ["SEALS", "Calibration, register and ATC seals intact", "R.235, SVM.1-8, SVM.2-10"],
  ["INSTALL", "Installation, piping and hoses — no leaks", "R.273–R.286"],
  ["ZERO", "Return to zero", "STP-1"],
  ["INTERLOCK", "Interlock (no delivery until reset to zero)", "STP-2"],
  ["SEGMENT", "Display segment test", "STP-3"],
  ["ANTIDRAIN", "Check / anti-drain valve holds", "STP-11"],
  ["ROLLUP", "No roll-up — display stays at zero ≥ 10 s", "STP-11"],
  ["CREEP", "No creep — display stable 30 s after fast run", "STP-11"],
  ["HOSE", "Hose expansion (hoses over 5 m)", "STP-12"],
  ["BACKLASH", "Backlash — 5 quick stop/starts within limits", "STP-14"],
  ["AGREEMENT", "Agreement between displays, console and receipt", "STP-9"],
  ["PRICE", "Computed price correct to the cent", "STP-10"],
  ["CROSSOVER", "Delivery cross-over (shared pumps)", "STP-15"],
  ["BLEND", "Product blend (blending dispensers)", "STP-16"],
  ["PREPAY", "Prepay stops within 50 mL (initial/complaint)", "STP-17"],
  ["SENSOR", "ATC sensor failure stops flow (with service tech)", "STP-19"],
  ["EMI", "EM/RF interference", "STP-20"],
];
const CHECK_STATES = { PASS: "Pass", FAIL: "Fail", NA: "N/A" };

/** Upgrades records saved by the first version of the tests section. */
function normalizeTest(t) {
  t.inspectionType ||= t.conditions === "CONTROLLED" ? "INITIAL_FACTORY" : "IN_SERVICE";
  delete t.conditions;
  t.measureCce ??= CCE_304;
  t.drafts = (t.drafts || []).map((d) => ({ ...d, flow: d.flow === "NORMAL" ? "FAST" : d.flow }));
  t.atcRuns ||= [];
  t.checks ||= {};
  return t;
}

function lookupVcf(product, temp) {
  const table = VCF_TABLES[product];
  if (!table || !Number.isFinite(temp)) return null;
  const v = table.values[Math.round(temp * 10) - table.min];
  return v ? v / 10000 : null;
}

function inServiceLimit(test) { return (LOE_ML[test.measureVolume] || LOE_ML[20])[1]; }
function limitMl(test) {
  const row = LOE_ML[test.measureVolume] || LOE_ML[20];
  return test.inspectionType === "INITIAL_FACTORY" ? row[0] : row[1];
}
function repeatLimitMl(test) { return inServiceLimit(test) * REPEATABILITY_FRACTION; }

/** Gross-mode accuracy draft. Error = register − measure volume corrected for shell temperature (STP-5, STP-23). */
function computeDraft(test, d) {
  if (!Number.isFinite(d.temp)) return { shellMl: null, errorMl: null, pass: null };
  const shell = Number(test.measureVolume) * Number(test.measureCce || CCE_304) * (d.temp - 15);
  const delivered = d.measure + shell;
  const errorMl = Math.round((d.indicated - delivered) * 10000) / 10;
  return { shellMl: Math.round(shell * 10000) / 10, delivered, errorMl, pass: Math.abs(errorMl) <= limitMl(test) + 1e-9 };
}

function draftsFor(test, phase, flow) {
  return test.drafts.filter((d) => d.phase === phase && (!flow || d.flow === flow));
}

/** STP-7: when repeatability is required and whether it passed. */
function repeatability(test, phase) {
  const fast = draftsFor(test, phase, "FAST").map((d) => computeDraft(test, d)).filter((r) => r.errorMl !== null);
  const slow = draftsFor(test, phase, "SLOW").map((d) => computeDraft(test, d)).filter((r) => r.errorMl !== null);
  const limit = repeatLimitMl(test);
  const reasons = [];
  if (test.inspectionType !== "IN_SERVICE") reasons.push("initial inspection");
  const fastRate = draftsFor(test, phase, "FAST").map((d) => d.rate).find((r) => Number.isFinite(r));
  if (fastRate && Number(test.maxFlow) > 0 && fastRate < 0.4 * Number(test.maxFlow)) reasons.push("fast flow under 40 % of max");
  if (fast.length && slow.length && Math.abs(fast[0].errorMl - slow[0].errorMl) > limit + 1e-9) reasons.push("fast vs slow differ by more than 2/5 of the limit");
  const errs = fast.map((r) => r.errorMl);
  let spread = null;
  let status = reasons.length ? "NEEDED" : null;
  if (errs.length >= 2 && Math.abs(errs[1] - errs[0]) > limit + 1e-9) {
    spread = Math.abs(errs[1] - errs[0]);
    status = "FAIL";
  } else if (errs.length >= 3) {
    const last = errs.slice(-3);
    spread = Math.max(...last) - Math.min(...last);
    status = spread <= limit + 1e-9 ? "PASS" : "FAIL";
  }
  return { reasons, status, spread, limit, count: errs.length };
}

/** STP-18: actual VCF (net ÷ gross) must lie within the table VCFs for mean temperature ± 1 °C. */
function computeAtc(test, run) {
  const temps = run.temps.filter((x) => Number.isFinite(x));
  if (!temps.length || !(run.gross > 0) || !(run.net > 0)) return { pass: null };
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const stable = Math.max(...temps) - Math.min(...temps) <= 1.0 + 1e-9;
  const actual = run.net / run.gross;
  const expected = lookupVcf(test.product, mean);
  const low = lookupVcf(test.product, mean + 1);
  const high = lookupVcf(test.product, mean - 1);
  if (!expected || !low || !high) return { mean, stable, actual, pass: null };
  const pass = actual >= low - 1e-9 && actual <= high + 1e-9;
  return { mean, stable, actual, expected, low, high, pass, enoughVolume: run.gross >= ATC_MIN_VOLUME };
}

function phaseVerdict(test, phase) {
  const drafts = draftsFor(test, phase);
  const runs = test.atcRuns.filter((r) => r.phase === phase);
  if (!drafts.length && !runs.length) return null;
  const results = drafts.map((d) => computeDraft(test, d));
  const rep = repeatability(test, phase);
  const atc = runs.length ? computeAtc(test, runs[runs.length - 1]) : null;
  if (results.some((r) => r.pass === false) || rep.status === "FAIL" || atc?.pass === false) return "FAIL";
  if (results.some((r) => r.pass === null) || !draftsFor(test, phase, "FAST").length || !draftsFor(test, phase, "SLOW").length) return "INCOMPLETE";
  if (rep.status === "NEEDED") return "INCOMPLETE";
  if (test.atc && (!atc || atc.pass === null)) return "INCOMPLETE";
  return "PASS";
}

/** Final result: the as-left result when the dispenser was adjusted, otherwise as-found; any failed check fails it. */
function testVerdict(test) {
  if (Object.values(test.checks).includes("FAIL")) return "FAIL";
  return phaseVerdict(test, "AS_LEFT") || phaseVerdict(test, "AS_FOUND") || "INCOMPLETE";
}

function equipmentWarnings(test) {
  const out = [];
  const day = 86400000;
  if (test.icePointDate && isIsoDate(test.icePointDate)) {
    const age = (new Date(`${test.date}T00:00:00`) - new Date(`${test.icePointDate}T00:00:00`)) / day;
    if (age > 30) out.push(`Thermometer ice-point check is ${Math.round(age)} days old — V-24 requires one within 30 days of use (TE-LP-001).`);
  } else {
    out.push("No thermometer ice-point check date recorded — V-24 requires one within the 30 days before use.");
  }
  if (test.measureDue && isIsoDate(test.measureDue) && test.measureDue < test.date) {
    out.push(`Test measure certification expired ${test.measureDue} — 20 L measures are re-certified yearly, provers every 4 years (FIM P2 §1).`);
  }
  if (test.atc && !VCF_TABLES[test.product]) out.push("The ATC test needs gasoline 730 or diesel 840 VCF tables — other products aren't covered.");
  return out;
}

function verdictBadge(v) {
  return `<span class="verdict ${esc(v)}">${esc(VERDICTS[v])}</span>`;
}

function fmtErr(ml) {
  if (ml === null || ml === undefined) return "—";
  return `${ml > 0 ? "+" : ""}${Number.isInteger(ml) ? ml : ml.toFixed(1)} mL`;
}

function testCard(t) {
  const tech = store.member(t.technicianId);
  const title = [t.site || "Unnamed site", t.nozzle ? `Pump ${t.nozzle}` : null].filter(Boolean).join(" · ");
  const meta = [t.date, PRODUCTS[t.product], `${t.drafts.length} drafts`].filter(Boolean).join(" · ");
  return `<a class="card row" style="gap:12px" href="#/test/${esc(t.id)}">
    ${tech ? avatar(tech, 36) : ""}
    <span class="grow" style="min-width:0">
      <span class="card-title" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(title)}</span>
      <span class="small muted">${esc(meta)}</span>
    </span>
    ${verdictBadge(testVerdict(t))}
  </a>`;
}

function testsScreen() {
  const me = store.me();
  const tests = store.data.tests
    .filter((t) => ui.testScope === "ALL" || t.technicianId === me.id)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  return `${mainBar("Calibration tests")}
    <main class="page">
      <a class="card row" style="gap:12px" href="#/procedure">
        <span style="color:var(--primary)">${icon("book")}</span>
        <span class="grow"><span class="card-title" style="display:block">Test procedure &amp; limits</span>
        <span class="small muted">FIM Part 2 §1 steps, STPs, limits of error, VCF lookup</span></span>
        ${icon("chevron")}
      </a>
      <div class="row wrap" style="margin-top:14px">
        <div class="chips grow">
          ${chip("Mine", ui.testScope !== "ALL", `data-action="test-scope" data-value="MINE"`)}
          ${chip("Everyone", ui.testScope === "ALL", `data-action="test-scope" data-value="ALL"`)}
        </div>
        ${store.data.tests.length ? `<button class="btn text" data-action="export-tests">${icon("download")} CSV</button>` : ""}
      </div>
      <div class="stack" style="margin-top:14px">${tests.map(testCard).join("") || empty("No tests yet. Tap New test to record a dispenser inspection.")}</div>
    </main>
    <a class="fab" href="#/test/new/edit">${icon("add")} New test</a>`;
}

function testEditScreen(id) {
  const existing = store.test(id);
  const t = existing || normalizeTest({
    date: today(), site: "", address: "", client: "", nozzle: "", dispenserId: "", makeModel: "", approvalNo: "",
    product: "GASOLINE_730", atc: true, maxFlow: "", minFlow: "", measureVolume: 20, measureId: "", measureCce: CCE_304,
    measureDue: "", thermometerId: "", icePointDate: "", inspectionType: "IN_SERVICE", sealsRemoved: "", sealsApplied: "", notes: "",
  });
  // Pre-fill equipment and site from this technician's last test to save typing in the field.
  if (!existing) {
    const last = store.data.tests.filter((x) => x.technicianId === store.data.activeMemberId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
    if (last) {
      for (const k of ["measureId", "measureVolume", "measureCce", "measureDue", "thermometerId", "icePointDate", "client", "site", "address"]) t[k] = last[k];
    }
  }
  const input = (label, name, value, extra = "") =>
    `<label class="field"><span>${label}</span><input name="${name}" value="${esc(value ?? "")}" ${extra}></label>`;
  return `${detailBar(existing ? "Edit test" : "New test", `<button class="icon-btn" form="test-form" type="submit" aria-label="Save">${icon("check")}</button>`)}
    <main class="page no-tabs">
      <form id="test-form" data-form="test" data-id="${esc(existing ? existing.id : "")}" novalidate>
        <h2 class="section" style="margin-top:4px">Site</h2>
        <div class="field-row">
          ${input("Date", "date", t.date, 'type="date"')}
          ${input("Client", "client", t.client)}
        </div>
        ${input("Site name", "site", t.site, 'placeholder="e.g. Esso — Main St"')}
        ${input("Address", "address", t.address)}
        <div class="field"><span>Inspection type</span>
          <div class="chips" data-single="inspectionType">${Object.entries(INSPECTION_TYPES).map(([k, v]) => chip(v, t.inspectionType === k, `data-value="${k}"`)).join("")}</div>
          <span class="small muted">Field inspections use in-service limits; acceptance limits apply only to factory/dealer initial inspections (V-23).</span>
        </div>

        <h2 class="section">Dispenser</h2>
        <div class="field-row">
          ${input("Pump / nozzle", "nozzle", t.nozzle, 'placeholder="e.g. 3 — Regular"')}
          ${input("Serial / unit ID", "dispenserId", t.dispenserId)}
        </div>
        <div class="field-row">
          ${input("Make / model", "makeModel", t.makeModel)}
          ${input("Approval no.", "approvalNo", t.approvalNo, 'placeholder="e.g. AV-2372"')}
        </div>
        <div class="field"><span>Product</span>
          <div class="chips" data-single="product">${Object.entries(PRODUCTS).map(([k, v]) => chip(v, t.product === k, `data-value="${k}"`)).join("")}</div>
          <span class="small muted">Multi-grade meters: test the highest and lowest viscosity grades.</span>
        </div>
        <div class="field"><span>Automatic temperature compensation (ATC)?</span>
          <div class="chips" data-single="atc">${chip("Yes", !!t.atc, 'data-value="yes"')}${chip("No", !t.atc, 'data-value="no"')}</div>
        </div>
        <div class="field-row">
          ${input("Min approved flow (L/min)", "minFlow", t.minFlow, 'inputmode="decimal"')}
          ${input("Max approved flow (L/min)", "maxFlow", t.maxFlow, 'inputmode="decimal"')}
        </div>

        <h2 class="section">Test equipment</h2>
        <div class="field"><span>Test measure / prover size</span>
          <div class="chips" data-single="measureVolume">${[5, 20, 50].map((v) => chip(`${v} L`, Number(t.measureVolume) === v, `data-value="${v}"`)).join("")}</div>
          <span class="small muted">Dispensers up to 90 L/min: 20 L measure or prover. Gasoline needs a recognized vapour-loss measure (V-24).</span>
        </div>
        <div class="field-row">
          ${input("Measure ID / serial", "measureId", t.measureId)}
          ${input("Certification due", "measureDue", t.measureDue, 'type="date"')}
        </div>
        ${input("Shell expansion coefficient (CCE, /°C)", "measureCce", t.measureCce, 'inputmode="decimal" placeholder="0.0000518"')}
        <p class="small muted" style="margin:-8px 0 14px">From the prover nameplate. 304 stainless = 0.0000518 (V-17).</p>
        <div class="field-row">
          ${input("Thermometer ID", "thermometerId", t.thermometerId)}
          ${input("Last ice-point check", "icePointDate", t.icePointDate, 'type="date"')}
        </div>

        <h2 class="section">Seals &amp; notes</h2>
        <div class="field-row">
          ${input("Seals removed", "sealsRemoved", t.sealsRemoved)}
          ${input("Seals applied", "sealsApplied", t.sealsApplied)}
        </div>
        <label class="field"><span>Notes</span><textarea name="notes" placeholder="Condition of nozzle, hose, display, labels, adjustments made…">${esc(t.notes)}</textarea></label>
        <button class="btn" type="submit" style="width:100%">${existing ? "Save test" : "Save and start testing"}</button>
      </form>
    </main>`;
}

function draftRow(test, d, n) {
  const r = computeDraft(test, d);
  const state = r.pass === null ? "INCOMPLETE" : r.pass ? "PASS" : "FAIL";
  const detail = [
    `Gross ${d.indicated.toFixed(3)} L`,
    `measure ${d.measure.toFixed(3)} L`,
    Number.isFinite(d.temp) ? `${d.temp.toFixed(1)} °C (shell ${fmtErr(r.shellMl)})` : "no temp",
    Number.isFinite(d.rate) ? `${formatHours(d.rate)} L/min` : null,
  ].filter(Boolean).join(" · ");
  return `<div class="draft">
    <span class="draft-n">${n}</span>
    <span class="grow" style="min-width:0">
      <span class="small"><b>${esc(PHASES[d.phase])}</b> · ${esc(FLOWS[d.flow])}</span>
      <span class="small muted" style="display:block">${esc(detail)}</span>
    </span>
    <span class="err ${state}">${esc(fmtErr(r.errorMl))}</span>
    <button class="icon-btn" data-action="delete-draft" data-test="${esc(test.id)}" data-id="${esc(d.id)}" aria-label="Delete draft ${n}">${icon("close")}</button>
  </div>`;
}

function summaryTable(test) {
  const limit = limitMl(test);
  const rows = [];
  for (const phase of Object.keys(PHASES)) {
    for (const flow of Object.keys(FLOWS)) {
      const results = draftsFor(test, phase, flow).map((d) => computeDraft(test, d));
      if (!results.length) continue;
      const errs = results.map((r) => r.errorMl).filter((e) => e !== null);
      const worst = errs.length ? errs.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a)) : null;
      const ok = results.every((r) => r.pass);
      rows.push(`<tr><td>${esc(PHASES[phase])}<br><span class="muted">${esc(FLOWS[flow])}</span></td>
        <td>${results.length}</td><td>${esc(fmtErr(worst))}</td><td>${ok ? "✓" : results.some((r) => r.pass === false) ? "✗" : "—"}</td></tr>`);
    }
  }
  if (!rows.length) return "";
  return `<div class="table-wrap"><table class="summary">
    <thead><tr><th>Test</th><th>Drafts</th><th>Largest error</th><th>≤ ±${limit} mL</th></tr></thead>
    <tbody>${rows.join("")}</tbody></table></div>`;
}

function repeatabilityNote(test, phase) {
  const rep = repeatability(test, phase);
  if (!draftsFor(test, phase).length) return "";
  const label = `<b>${esc(PHASES[phase])}:</b> `;
  if (!rep.reasons.length && rep.status === null) return `<li>${label}not required (STP-7 — PD meter in service, fast/slow agree within ${rep.limit} mL).</li>`;
  const why = rep.reasons.length ? ` Required: ${esc(rep.reasons.join("; "))}.` : "";
  if (rep.status === "PASS") return `<li>${label}spread ${rep.spread.toFixed(1)} mL ≤ ${rep.limit} mL ✓${why}</li>`;
  if (rep.status === "FAIL") return `<li>${label}spread ${rep.spread.toFixed(1)} mL > ${rep.limit} mL ✗${why}</li>`;
  return `<li>${label}run ${3 - rep.count > 0 ? 3 - rep.count : 0} more consecutive fast-flow draft(s).${why}</li>`;
}

function atcSection(test) {
  if (!test.atc) return "";
  const rows = test.atcRuns.map((run, i) => {
    const r = computeAtc(test, run);
    const state = r.pass === null ? "INCOMPLETE" : r.pass ? "PASS" : "FAIL";
    const detail = r.mean === undefined ? "Incomplete readings" : [
      `${esc(PHASES[run.phase])} · gross ${run.gross} L · net ${run.net} L`,
      `mean ${r.mean.toFixed(1)} °C${r.stable ? "" : " — unstable (> 1 °C range), circulate product and repeat"}`,
      r.expected ? `actual VCF ${r.actual.toFixed(4)} · allowed ${r.low.toFixed(4)}–${r.high.toFixed(4)}` : "outside VCF tables",
      r.enoughVolume === false ? `volume under ${ATC_MIN_VOLUME} L` : null,
    ].filter(Boolean).join("<br>");
    return `<div class="draft">
      <span class="draft-n">${i + 1}</span>
      <span class="grow small" style="min-width:0">${detail}</span>
      <span class="err ${state}">${state === "INCOMPLETE" ? "—" : state === "PASS" ? "✓" : "✗"}</span>
      <button class="icon-btn" data-action="delete-atc" data-test="${esc(test.id)}" data-id="${esc(run.id)}" aria-label="Delete ATC run ${i + 1}">${icon("close")}</button>
    </div>`;
  }).join("");
  return `<h2 class="section">ATC test (STP-18)</h2>
    <p class="small muted" style="margin-top:0">Thermometer in the dispenser's test well. Put the register in ATC inspection mode, run at least ${ATC_MIN_VOLUME} L, and read the temperature at 25, 50, 75 and 95 % of the run. Then read the gross and net totals. Pass if net ÷ gross is within the table VCFs for the mean temperature ±1 °C. If you re-run, the latest run counts.</p>
    <div>${rows}</div>
    <form class="card" style="margin-top:8px" data-form="atc" data-test="${esc(test.id)}" novalidate>
      <div class="chips" data-single="phase" style="margin-bottom:12px">${Object.entries(PHASES).map(([k, v]) => chip(v, ui.draftPhase === k, `data-value="${k}"`)).join("")}</div>
      <div class="field-row">
        <label class="field"><span>Gross (L)</span><input name="gross" inputmode="decimal"></label>
        <label class="field"><span>Net (L)</span><input name="net" inputmode="decimal"></label>
      </div>
      <div class="field-row four">
        ${[25, 50, 75, 95].map((p) => `<label class="field"><span>${p} % (°C)</span><input name="t${p}" inputmode="decimal"></label>`).join("")}
      </div>
      <button class="btn tonal" type="submit" style="width:100%">${icon("add")} Record ATC run</button>
    </form>`;
}

function checklistSection(test) {
  const done = CHECKS.filter(([k]) => test.checks[k]).length;
  return `<h2 class="section">Inspection checklist (${done}/${CHECKS.length})</h2>
    <p class="small muted" style="margin-top:0">FIM Part 2 §1 visual examinations and functional tests. Any “Fail” fails the inspection.</p>
    <div>${CHECKS.map(([key, label, ref]) => `
      <div class="check-row">
        <span class="grow small" style="min-width:0">${esc(label)} <span class="muted">· ${esc(ref)}</span></span>
        <span class="seg">${Object.entries(CHECK_STATES).map(([s, sl]) =>
          `<button type="button" class="seg-btn ${s}" aria-pressed="${test.checks[key] === s}" data-action="set-check" data-test="${esc(test.id)}" data-id="${key}" data-value="${s}">${sl}</button>`).join("")}</span>
      </div>`).join("")}
    </div>`;
}

function testScreen(id) {
  const t = store.test(id);
  if (!t) return `${detailBar("Test")}<main class="page no-tabs">${empty("This test no longer exists.")}</main>`;
  const tech = store.member(t.technicianId);
  const limit = limitMl(t);
  const verdict = testVerdict(t);
  const found = phaseVerdict(t, "AS_FOUND");
  const left = phaseVerdict(t, "AS_LEFT");
  const nominal = Number(t.measureVolume).toFixed(3);
  const slowRate = Number(t.minFlow) > 0 ? ` (target ≈ ${formatHours(Number(t.minFlow) + 5)} L/min)` : "";
  const warnings = equipmentWarnings(t);
  const info = [
    ["Date", t.date], ["Inspection", INSPECTION_TYPES[t.inspectionType]], ["Client", t.client], ["Address", t.address],
    ["Serial / unit", t.dispenserId], ["Make / model", t.makeModel], ["Approval", t.approvalNo],
    ["Product", PRODUCTS[t.product]], ["ATC", t.atc ? "Yes" : "No"],
    ["Flow (L/min)", [t.minFlow && `min ${t.minFlow}`, t.maxFlow && `max ${t.maxFlow}`].filter(Boolean).join(" · ")],
    ["Measure", [`${t.measureVolume} L`, t.measureId, t.measureDue && `due ${t.measureDue}`].filter(Boolean).join(" · ")],
    ["Thermometer", [t.thermometerId, t.icePointDate && `ice point ${t.icePointDate}`].filter(Boolean).join(" · ")],
    ["Seals removed", t.sealsRemoved], ["Seals applied", t.sealsApplied],
  ].filter(([, v]) => v);
  return `${detailBar("Test", `
      <a class="icon-btn" href="#/test/${esc(t.id)}/edit" aria-label="Edit">${icon("edit")}</a>
      <button class="icon-btn" data-action="delete-test" data-id="${esc(t.id)}" aria-label="Delete">${icon("delete")}</button>`)}
    <main class="page no-tabs">
      <div class="row">${verdictBadge(verdict)}${found && left ? `<span class="small muted">As found: ${esc(VERDICTS[found])} → as left: ${esc(VERDICTS[left])}</span>` : ""}</div>
      <h2 style="margin:10px 0 4px;font-size:1.35rem">${esc(t.site || "Unnamed site")}${t.nozzle ? ` · Pump ${esc(t.nozzle)}` : ""}</h2>
      <div class="row muted small">${tech ? avatar(tech, 24) : ""}<span>${esc(tech?.name || "")}</span></div>
      ${warnings.length ? `<div class="install-tip" style="margin-top:12px">${warnings.map((w) => `<div>⚠ ${esc(w)}</div>`).join("")}</div>` : ""}
      <dl class="info">${info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      ${t.notes ? `<p class="small" style="white-space:pre-wrap">${esc(t.notes)}</p>` : ""}

      <h2 class="section">Accuracy summary</h2>
      <p class="small muted" style="margin-top:0">Limit ±${limit} mL on ${t.measureVolume} L (${t.inspectionType === "INITIAL_FACTORY" ? "acceptance" : "in-service"}). Error = gross register − measure corrected for shell temperature; + means the customer gets less than shown.</p>
      ${summaryTable(t) || empty("No drafts yet.")}
      <ul class="small" style="padding-left:18px;margin:8px 0 0">${Object.keys(PHASES).map((p) => repeatabilityNote(t, p)).join("")}</ul>

      <h2 class="section">Drafts (${t.drafts.length})</h2>
      <div>${t.drafts.map((d, i) => draftRow(t, d, i + 1)).join("")}</div>

      <form class="card" style="margin-top:12px" data-form="draft" data-test="${esc(t.id)}" novalidate>
        <div class="card-title" style="margin-bottom:6px">Add draft</div>
        <p class="small muted" style="margin:0 0 10px">${t.atc ? "Put the register in ATC inspection (gross) mode. " : ""}Wet the measure first and drain ${DRAIN_SECONDS[t.measureVolume] || 20} s after the stream turns to drips (STP-22). Stabilize product temperature within ±0.5 °C.</p>
        <div class="chips" data-single="phase" style="margin-bottom:8px">${Object.entries(PHASES).map(([k, v]) => chip(v, ui.draftPhase === k, `data-value="${k}"`)).join("")}</div>
        <div class="chips" data-single="flow" style="margin-bottom:8px">${Object.entries(FLOWS).map(([k, v]) => chip(v, ui.draftFlow === k, `data-value="${k}"`)).join("")}</div>
        <p class="small muted" style="margin:0 0 12px">Fast: nozzle fully open, within the max rating (STP-5). Slow: minimum approved flow + 5 L/min${slowRate} (STP-4).</p>
        <div class="field-row">
          <label class="field"><span>Gross register (L)</span><input name="indicated" inputmode="decimal" value="${nominal}"></label>
          <label class="field"><span>Measure reads (L)</span><input name="measure" inputmode="decimal" placeholder="${nominal}"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>Temp in measure (°C)</span><input name="temp" inputmode="decimal" placeholder="e.g. 12.4"></label>
          <label class="field"><span>Flow rate (L/min, optional)</span><input name="rate" inputmode="decimal" placeholder="STP-21"></label>
        </div>
        <p class="small" id="draft-preview" style="margin:0 0 12px;min-height:1.2em"></p>
        <button class="btn" type="submit" style="width:100%">${icon("add")} Record draft</button>
      </form>

      ${atcSection(t)}
      ${checklistSection(t)}
    </main>`;
}

const BINDER = "https://github.com/nickprocenko/MMI/blob/claude/fuels-safety-courses-gaouwc/MMI_Roadmap/Technicians/NTTP_Courses/Bulk_and_Retail_Petroleum/Study_Materials/Course_Binder/";
function binderLink(path, label) {
  return `<a href="${esc(encodeURI(BINDER + path))}">${esc(label)}</a>`;
}

function procedureScreen() {
  const loeRows = Object.entries(LOE_ML).map(([q, [a, s]]) => `<tr><td>${q} L</td><td>±${a} mL</td><td>±${s} mL</td><td>±${(s * REPEATABILITY_FRACTION).toFixed(0)} mL</td><td>${DRAIN_SECONDS[q]} s</td></tr>`).join("");
  const step = (title, body) => `<li><b>${title}</b><br>${body}</li>`;
  const ipo = "11_Module_09_Inspection_Procedures/Field Inspection Manual VMD_Part2Section1.pdf";
  const stp = (n) => `12_Module_10_Standard_Test_Procedures/STP-${n}.${[4, 7, 8, 11, 21, 23, 37].includes(n) ? "pdf" : "md"}`;
  return `${detailBar("Test procedure")}
    <main class="page no-tabs procedure">
      <div class="install-tip"><b>Field summary.</b> Follows MC's ${binderLink(ipo, "Field Inspection Manual Part 2 §1")} (Types 50/51 dispensers) and the STPs it calls, from MMI's NTTP course binder. The official text governs; MC published rev. 3 of Part 2 §1 on 2025-10-10, so check it for changes.</div>

      <h2 class="section">1 · Before you start</h2>
      <ul>
        <li>Read the device's <b>Notice of Approval</b> — model, flow ratings, sealing, ATC inspection mode (Module 4).</li>
        <li>Test measure designated as a local standard, seals intact, no dents or cracked sight glass. Re-certified yearly (20 L measure) or every 4 years (provers) (FIM P2 §1, V-24).</li>
        <li>Gasoline needs a recognized vapour-loss measure. Diesel may use an ordinary measure (V-24 §6.1).</li>
        <li>Certified thermometer (0.1 °C), with an ice-point check in the last 30 days (V-24, ${binderLink("10_Module_08_Temperature/TE-LP-001 - Preparation and use of an ice point bath as reference temperature.pdf", "TE-LP-001")}).</li>
        <li>Fix any leaks before testing (FIM P2 §1).</li>
      </ul>

      <h2 class="section">2 · Visual examination</h2>
      <p>Approval and suitability, markings (incl. "volume corrected to 15 °C"), seals, installation and piping, printers and tickets. The app's checklist covers each item and the regulation it comes from.</p>

      <h2 class="section">3 · Performance tests (in order)</h2>
      <ol>
        ${step("Wet the measure", `Fill to nominal, empty, and drain ${DRAIN_SECONDS[20]} s (20 L) or ${DRAIN_SECONDS[5]} s (5 L) after the stream breaks to drips, unless the certificate says otherwise (${binderLink(stp(22), "STP-22")}).`)}
        ${step("Stabilize temperature", "Circulate product until the temperature holds within ±0.5 °C of its mean (FIM P2 §1).")}
        ${step("Return to zero, interlock, segment", `${binderLink(stp(1), "STP-1")}, ${binderLink(stp(2), "STP-2")}, ${binderLink(stp(3), "STP-3")}.`)}
        ${step("Slow flow", `Minimum approved flow + 5 L/min, steady, as few stops as possible (${binderLink(stp(4), "STP-4")}). Time the flow to confirm the rate (${binderLink(stp(21), "STP-21")}).`)}
        ${step("Fast flow", `Nozzle fully open, register in <b>gross</b> mode. The rate must not exceed the approved maximum (${binderLink(stp(5), "STP-5")}).`)}
        ${step("Error", `Error = register − measure, after correcting the measure for shell temperature: V<sub>ref</sub> × CCE × (T − 15 °C). This is mandatory for all provers since 2020-04-01 (${binderLink(stp(23), "STP-23")}, ${binderLink("09_Module_07_Bulletins/Bulletin V-17.pdf", "V-17")}).`)}
        ${step("Repeatability", `Three consecutive fast runs with spread ≤ 2/5 of the in-service limit (stop after two if they already differ by more). Required on initial inspections. In service, on PD meters, only if fast flow &lt; 40 % of max or fast and slow differ by more than 2/5 of the limit (${binderLink(stp(7), "STP-7")}).`)}
        ${step("Valves, roll-up, creep, hose, backlash", `${binderLink(stp(11), "STP-11")}, ${binderLink(stp(12), "STP-12")}, ${binderLink(stp(14), "STP-14")}.`)}
        ${step("Agreement, price, prepay, cross-over, blend", `${binderLink(stp(9), "STP-9")}, ${binderLink(stp(10), "STP-10")}, ${binderLink(stp(17), "STP-17")}, ${binderLink(stp(15), "STP-15")}, ${binderLink(stp(16), "STP-16")}.`)}
        ${step("ATC", `Separate from the accuracy runs. Net ÷ gross must be within VCF(mean − 1 °C) to VCF(mean + 1 °C) at 730 / 840 kg/m³ (${binderLink(stp(18), "STP-18")}, ${binderLink("09_Module_07_Bulletins/Bulletin V-18.pdf", "V-18")}). Example: at 22 °C, gasoline must be within 0.9900–0.9925.`)}
        ${step("Seal and report", "Reseal, return the register to service mode, record seal numbers. Submit results in MC's Online Reporting Application (ORA). Report serious non-compliances within 2 business days, even if fixed (Module 11 enforcement policy).")}
      </ol>
      <p class="small muted">Multi-grade meters: test the highest and lowest viscosity grades (FIM P2 §1).</p>

      <h2 class="section">4 · Limits of error</h2>
      <div class="table-wrap"><table class="summary">
        <thead><tr><th>Test quantity</th><th>Acceptance</th><th>In-service</th><th>Repeatability</th><th>Drain</th></tr></thead>
        <tbody>${loeRows}</tbody>
      </table></div>
      <p class="small muted">Field inspections always use in-service limits. Acceptance limits apply to factory/dealer initial inspections and approvals (${binderLink("09_Module_07_Bulletins/Bulletin V-23.pdf", "V-23")}, ${binderLink("09_Module_07_Bulletins/Bulletin V-03.pdf", "V-03")}).</p>

      <h2 class="section">5 · VCF lookup</h2>
      <p class="small">From MMI's codebook tables, gasoline 730 and diesel 840 kg/m³, −30.9 to 30.9 °C.</p>
      <form class="row wrap" data-form="vcf-lookup" style="align-items:flex-end">
        <label class="field" style="margin:0;flex:1;min-width:120px"><span>Temperature (°C)</span><input name="temp" inputmode="decimal" placeholder="e.g. 8.6"></label>
        <button class="btn tonal" type="submit">Look up</button>
      </form>
      <p id="vcf-result" class="small" style="min-height:1.2em"></p>

      <h2 class="section">Sources</h2>
      <ul class="small">
        <li>${binderLink(ipo, "FIM Volumetric Part 2 §1 — Types 50/51 dispensers")}</li>
        <li><a href="${esc(encodeURI(BINDER.replace("Course_Binder/", "README.md")))}">NTTP Bulk &amp; Retail course binder — index and analysis</a></li>
        <li><a href="https://ised-isde.canada.ca/site/measurement-canada/en/laws-and-requirements/field-inspection-manual-volumetric-measuring-devices/part-2-section-1">Current FIM Part 2 §1 on Measurement Canada's site</a></li>
      </ul>
    </main>`;
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportTestsCsv() {
  const header = ["Date", "Technician", "Inspection", "Client", "Site", "Address", "Pump/nozzle", "Serial", "Make/model", "Approval", "Product", "ATC",
    "Measure (L)", "Measure ID", "CCE", "Thermometer ID", "Ice point", "Limit (mL)", "Record", "Phase", "Flow", "#",
    "Gross (L)", "Measure (L)", "Temp (C)", "Rate (L/min)", "Shell corr (mL)", "Error (mL)", "Net (L)", "Mean temp (C)", "Actual VCF", "Allowed VCF",
    "Within limit", "Test result", "Failed checks", "Seals removed", "Seals applied", "Notes"];
  const rows = [header];
  for (const t of [...store.data.tests].sort((a, b) => a.date.localeCompare(b.date))) {
    const base = [t.date, store.member(t.technicianId)?.name, INSPECTION_TYPES[t.inspectionType], t.client, t.site, t.address, t.nozzle, t.dispenserId,
      t.makeModel, t.approvalNo, PRODUCTS[t.product], t.atc ? "Yes" : "No", t.measureVolume, t.measureId, t.measureCce, t.thermometerId, t.icePointDate, limitMl(t)];
    const failed = CHECKS.filter(([k]) => t.checks[k] === "FAIL").map(([, l]) => l).join("; ");
    const tail = [VERDICTS[testVerdict(t)], failed, t.sealsRemoved, t.sealsApplied, t.notes];
    t.drafts.forEach((d, i) => {
      const r = computeDraft(t, d);
      rows.push([...base, "Draft", PHASES[d.phase], FLOWS[d.flow], i + 1, d.indicated, d.measure, d.temp ?? "", d.rate ?? "",
        r.shellMl ?? "", r.errorMl ?? "", "", "", "", "", r.pass === null ? "" : r.pass ? "Yes" : "No", ...tail]);
    });
    t.atcRuns.forEach((run, i) => {
      const r = computeAtc(t, run);
      rows.push([...base, "ATC", PHASES[run.phase], "", i + 1, run.gross, "", "", "", "", "", run.net, r.mean?.toFixed(2) ?? "",
        r.actual?.toFixed(5) ?? "", r.low ? `${r.low.toFixed(4)}-${r.high.toFixed(4)}` : "", r.pass === null ? "" : r.pass ? "Yes" : "No", ...tail]);
    });
    if (!t.drafts.length && !t.atcRuns.length) rows.push([...base, ...Array(16).fill(""), ...tail]);
  }
  download(`mmi-tests-${today()}.csv`, rows.map((r) => r.map(csvCell).join(",")).join("\r\n"), "text/csv");
}

function parseNum(text) {
  const s = String(text ?? "").trim().replace(",", ".");
  return s === "" ? null : Number(s);
}

function draftFromForm(form) {
  const f = Object.fromEntries(new FormData(form).entries());
  return {
    phase: chipValue(form, "phase") || "AS_FOUND",
    flow: chipValue(form, "flow") || "FAST",
    indicated: parseNum(f.indicated),
    measure: parseNum(f.measure),
    temp: parseNum(f.temp),
    rate: parseNum(f.rate),
  };
}

function updateDraftPreview(form) {
  const out = document.getElementById("draft-preview");
  const t = store.test(form.dataset.test);
  if (!out || !t) return;
  const d = draftFromForm(form);
  if (!Number.isFinite(d.indicated) || !Number.isFinite(d.measure)) { out.textContent = ""; return; }
  if (!Number.isFinite(d.temp)) { out.textContent = "Enter the product temperature in the measure (needed for the shell correction)."; return; }
  const r = computeDraft(t, d);
  const rateNote = Number.isFinite(d.rate) && Number(t.maxFlow) > 0 && d.rate > Number(t.maxFlow) ? " · ⚠ above max approved flow" : "";
  out.innerHTML = `Error <b>${esc(fmtErr(r.errorMl))}</b> ${r.pass ? "✓ within" : "✗ outside"} ±${limitMl(t)} mL · shell ${esc(fmtErr(r.shellMl))}${rateNote}`;
}

// ── Router ────────────────────────────────────────────────────────────────

const TABS = [
  ["home", "Home", "home"],
  ["goals", "Goals", "flag"],
  ["tests", "Tests", "gauge"],
  ["reports", "Reports", "report"],
  ["team", "Team", "team"],
];

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [section = "home", id, sub] = parts;
  return { section, id, sub };
}

function render() {
  dialogRoot.innerHTML = "";
  if (!store.me()) {
    tabs.hidden = true;
    app.innerHTML = pickerScreen();
    return;
  }
  const { section, id, sub } = route();
  const screens = {
    home: () => homeScreen(),
    goals: () => goalsScreen(),
    goal: () => (sub === "edit" ? goalEditScreen(id) : goalScreen(id)),
    reports: () => reportsScreen(),
    report: () => (sub === "edit" ? reportEditScreen(id) : reportScreen(id)),
    team: () => teamScreen(),
    tests: () => testsScreen(),
    test: () => (sub === "edit" ? testEditScreen(id) : testScreen(id)),
    procedure: () => procedureScreen(),
    profile: () => (sub === "edit" ? profileEditScreen(id) : profileScreen(id)),
  };
  const screen = screens[section] || screens.home;
  const topLevel = !id && TABS.some(([key]) => key === section);
  app.innerHTML = screen();

  tabs.hidden = !(topLevel || !screens[section]);
  const active = screens[section] ? section : "home";
  tabs.innerHTML = TABS.map(([key, label, ic]) =>
    `<a href="#/${key}" class="${key === active ? "active" : ""}"><span class="pill">${icon(ic)}</span>${label}</a>`).join("");
}

/** Re-render without losing the scroll position (for in-place changes like ticking a step). */
function refresh() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

// Counts in-app navigations, so Back never leaves the app when it was opened on a deep link.
let navCount = 0;

function goBack() {
  if (navCount > 0) {
    history.back();
    return;
  }
  const { section, id, sub } = route();
  const parent = { goal: "goals", report: "reports", profile: "team", test: "tests", procedure: "tests" }[section] || "home";
  location.hash = sub && id !== "new" ? `#/${section}/${id}` : `#/${parent}`;
}

window.addEventListener("hashchange", () => {
  navCount += 1;
  render();
  window.scrollTo(0, 0);
});

// ── Actions ───────────────────────────────────────────────────────────────

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) {
    // Chips inside edit forms toggle locally without re-rendering the form.
    const c = event.target.closest(".chip");
    if (c) toggleFormChip(c);
    return;
  }
  const { action, id, value, goal } = el.dataset;

  switch (action) {
    case "sign-in":
      store.update((d) => { d.activeMemberId = id; });
      location.hash = "#/home";
      render();
      break;
    case "sign-out":
      store.update((d) => { d.activeMemberId = null; });
      history.replaceState(null, "", location.pathname + location.search);
      render();
      break;
    case "back":
      goBack();
      break;
    case "close-dialog":
      dialogRoot.innerHTML = "";
      break;
    case "goal-scope":
      ui.goalScope = value;
      refresh();
      break;
    case "toggle-completed":
      ui.showCompleted = !ui.showCompleted;
      refresh();
      break;
    case "report-author":
      ui.reportAuthor = value || null;
      refresh();
      break;
    case "goal-status":
      store.update(() => { store.goal(id).status = value; });
      refresh();
      break;
    case "toggle-step":
      store.update(() => {
        const g = store.goal(goal);
        const item = g.checklist.find((c) => c.id === id);
        item.done = !item.done;
        syncStatus(g);
      });
      refresh();
      break;
    case "remove-step":
      store.update(() => {
        const g = store.goal(goal);
        g.checklist = g.checklist.filter((c) => c.id !== id);
        syncStatus(g);
      });
      refresh();
      break;
    case "delete-goal": {
      const g = store.goal(id);
      confirmDialog("Delete goal?", `"${g.title}" and its checklist will be removed.`, "Delete", () => {
        store.update((d) => { d.goals = d.goals.filter((x) => x.id !== id); });
        location.replace("#/goals");
      });
      break;
    }
    case "delete-report": {
      const r = store.report(id);
      confirmDialog("Delete report?", `"${r.title}" will be removed.`, "Delete", () => {
        store.update((d) => { d.reports = d.reports.filter((x) => x.id !== id); });
        location.replace("#/reports");
      });
      break;
    }
    case "export":
      exportBackup();
      break;
    case "export-tests":
      exportTestsCsv();
      break;
    case "test-scope":
      ui.testScope = value;
      refresh();
      break;
    case "delete-test": {
      const t = store.test(id);
      confirmDialog("Delete test?", `The test at "${t.site || "this site"}" and its ${t.drafts.length} drafts will be removed.`, "Delete", () => {
        store.update((d) => { d.tests = d.tests.filter((x) => x.id !== id); });
        location.replace("#/tests");
      });
      break;
    }
    case "delete-atc":
      store.update(() => {
        const t = store.test(el.dataset.test);
        t.atcRuns = t.atcRuns.filter((r) => r.id !== id);
      });
      refresh();
      break;
    case "set-check":
      store.update(() => {
        const t = store.test(el.dataset.test);
        if (t.checks[id] === value) delete t.checks[id];
        else t.checks[id] = value;
      });
      refresh();
      break;
    case "delete-draft":
      store.update(() => {
        const t = store.test(el.dataset.test);
        t.drafts = t.drafts.filter((d) => d.id !== id);
      });
      refresh();
      break;
    default:
      break;
  }
});

function toggleFormChip(c) {
  const group = c.parentElement;
  if (group.dataset.single) {
    group.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
  } else if ("owners" in group.dataset) {
    const team = group.querySelector('[data-value=""]');
    if (c === team) {
      group.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === team)));
    } else {
      c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true"));
      const anyMember = [...group.querySelectorAll(".chip")].some((x) => x !== team && x.getAttribute("aria-pressed") === "true");
      team.setAttribute("aria-pressed", String(!anyMember));
    }
  }
}

function chipValue(form, name) {
  return form.querySelector(`[data-single="${name}"] [aria-pressed="true"]`)?.dataset.value;
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  const kind = form.dataset.form;
  if (!kind) return;
  event.preventDefault();
  const f = Object.fromEntries(new FormData(form).entries());

  if (kind === "add-step") {
    const text = (f.text || "").trim();
    if (!text) return;
    store.update(() => {
      const g = store.goal(form.dataset.goal);
      g.checklist.push({ id: newId(), text, done: false });
      syncStatus(g);
    });
    refresh();
    app.querySelector('[data-form="add-step"] input')?.focus();
    return;
  }

  if (kind === "goal") {
    const title = f.title.trim();
    if (!title) return toast("Give the goal a title.");
    const ownerIds = [...form.querySelectorAll("[data-owners] [aria-pressed='true']")].map((x) => x.dataset.value).filter(Boolean);
    const fields = { title, description: f.description.trim(), targetDate: f.targetDate.trim(), category: chipValue(form, "category") || "OTHER", ownerIds };
    let id = form.dataset.id;
    store.update((d) => {
      if (id) Object.assign(store.goal(id), fields);
      else {
        id = newId();
        d.goals.push({ id, status: "NOT_STARTED", checklist: [], ...fields });
      }
    });
    location.replace(`#/goal/${id}`);
    return;
  }

  if (kind === "report") {
    const title = f.title.trim();
    const date = f.date.trim();
    const hoursText = f.hours.trim();
    const hours = hoursText === "" ? null : Number(hoursText.replace(",", "."));
    if (!title) return toast("Give the report a title.");
    if (!isIsoDate(date)) return toast("Enter a valid date.");
    if (hours !== null && (!Number.isFinite(hours) || hours < 0)) return toast("Hours must be a number.");
    const fields = { title, date, hours, type: chipValue(form, "type") || "FIELD", body: f.body.trim() };
    let id = form.dataset.id;
    store.update((d) => {
      if (id) Object.assign(store.report(id), fields);
      else {
        id = newId();
        d.reports.push({ id, authorId: d.activeMemberId, ...fields });
      }
    });
    location.replace(`#/report/${id}`);
    return;
  }

  if (kind === "test") {
    const date = f.date.trim();
    if (!isIsoDate(date)) return toast("Enter a valid date.");
    if (!f.site.trim()) return toast("Enter the site name.");
    const cce = parseNum(f.measureCce);
    if (cce !== null && !(cce > 0 && cce < 0.001)) return toast("CCE looks wrong — e.g. 0.0000518 for 304 stainless.");
    const fields = {
      date,
      site: f.site.trim(), address: f.address.trim(), client: f.client.trim(),
      nozzle: f.nozzle.trim(), dispenserId: f.dispenserId.trim(), makeModel: f.makeModel.trim(), approvalNo: f.approvalNo.trim(),
      product: chipValue(form, "product") || "GASOLINE_730",
      atc: chipValue(form, "atc") !== "no",
      inspectionType: chipValue(form, "inspectionType") || "IN_SERVICE",
      maxFlow: f.maxFlow.trim(), minFlow: f.minFlow.trim(),
      measureVolume: Number(chipValue(form, "measureVolume") || 20),
      measureId: f.measureId.trim(), measureDue: f.measureDue.trim(), measureCce: cce ?? CCE_304,
      thermometerId: f.thermometerId.trim(), icePointDate: f.icePointDate.trim(),
      sealsRemoved: f.sealsRemoved.trim(), sealsApplied: f.sealsApplied.trim(), notes: f.notes.trim(),
    };
    let id = form.dataset.id;
    store.update((d) => {
      if (id) Object.assign(store.test(id), fields);
      else {
        id = newId();
        d.tests.push(normalizeTest({ id, technicianId: d.activeMemberId, createdAt: Date.now(), drafts: [], ...fields }));
      }
    });
    location.replace(`#/test/${id}`);
    return;
  }

  if (kind === "draft") {
    const t = store.test(form.dataset.test);
    const d = draftFromForm(form);
    if (!Number.isFinite(d.indicated) || d.indicated <= 0) return toast("Enter the gross register reading.");
    if (!Number.isFinite(d.measure) || d.measure <= 0) return toast("Enter the measure reading.");
    if (!Number.isFinite(d.temp)) return toast("Enter the product temperature in the measure.");
    if (d.rate !== null && !(d.rate > 0)) return toast("Flow rate must be a positive number.");
    ui.draftPhase = d.phase;
    ui.draftFlow = d.flow;
    store.update(() => { t.drafts.push({ id: newId(), ...d, rate: Number.isFinite(d.rate) ? d.rate : null }); });
    refresh();
    app.querySelector('[data-form="draft"] [name="measure"]')?.focus();
    return;
  }

  if (kind === "atc") {
    const t = store.test(form.dataset.test);
    const gross = parseNum(f.gross), net = parseNum(f.net);
    const temps = [f.t25, f.t50, f.t75, f.t95].map(parseNum).filter((x) => x !== null);
    if (!(gross > 0) || !(net > 0)) return toast("Enter the gross and net readings.");
    if (!temps.length || temps.some((x) => !Number.isFinite(x))) return toast("Enter the test-well temperatures.");
    const phase = chipValue(form, "phase") || "AS_FOUND";
    ui.draftPhase = phase;
    store.update(() => { t.atcRuns.push({ id: newId(), phase, gross, net, temps }); });
    refresh();
    return;
  }

  if (kind === "vcf-lookup") {
    const temp = parseNum(f.temp);
    const out = document.getElementById("vcf-result");
    if (!Number.isFinite(temp)) { out.textContent = "Enter a temperature."; return; }
    const g = lookupVcf("GASOLINE_730", temp), d = lookupVcf("DIESEL_840", temp);
    out.innerHTML = g ? `At ${temp.toFixed(1)} °C — gasoline 730: <b>${g.toFixed(4)}</b> · diesel 840: <b>${d.toFixed(4)}</b>` : "Outside the tables (−30.9 to 30.9 °C).";
    return;
  }

  if (kind === "profile") {
    const name = f.name.trim();
    if (!name) return toast("Name can't be empty.");
    const list = (text, sep) => text.split(sep).map((s) => s.trim()).filter(Boolean);
    store.update(() => {
      Object.assign(store.member(form.dataset.id), {
        name,
        title: f.title.trim(),
        roles: list(f.roles, ","),
        email: f.email.trim(),
        phone: f.phone.trim(),
        bio: f.bio.trim(),
        certifications: list(f.certifications, /\r?\n/),
      });
    });
    location.replace(`#/profile/${form.dataset.id}`);
  }
});

// ── Backup ────────────────────────────────────────────────────────────────

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function exportBackup() {
  download(`mmi-backup-${today()}.json`, JSON.stringify(store.data, null, 2), "application/json");
}

document.addEventListener("input", (event) => {
  const form = event.target.closest('[data-form="draft"]');
  if (form) updateDraftPreview(form);
});

document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.dataset.action !== "import" || !input.files?.length) return;
  input.files[0].text().then((text) => {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
    if (!data || !Array.isArray(data.members) || !Array.isArray(data.goals) || !Array.isArray(data.reports)) {
      toast("That file isn't an MMI backup.");
      return;
    }
    confirmDialog("Restore backup?", "This replaces all goals, reports and profiles on this device.", "Restore", () => {
      const active = store.data.activeMemberId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, tests: Array.isArray(data.tests) ? data.tests : [], activeMemberId: active }));
      store.load();
      refresh();
      toast("Backup restored.");
    });
  });
  input.value = "";
});

// ── Start ─────────────────────────────────────────────────────────────────

store.load();
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
// Ask the browser not to clear our data under storage pressure.
navigator.storage?.persist?.().catch(() => {});
