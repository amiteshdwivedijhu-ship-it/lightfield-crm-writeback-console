/* Lightfield meeting -> CRM activity review (synthetic demo).
   Loads a captured meeting, shows cited activity drafts, enforces a
   never invent deal stage gate, then logs activity, holds stage, or
   escalates on an explicit human action. Data is pre-recorded and
   synthetic; nothing leaves the browser. */

"use strict";

const state = {
  cases: window.LIGHTFIELD_DATA || [],
  currentId: null,
  resolved: false
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function currentCase() {
  return state.cases.find((c) => c.id === state.currentId);
}

/* ---------- case grid ---------- */

const PATH_TAGS = {
  primary: { text: "Stage held · log activity", cls: "held" },
  advance: { text: "Evidence · advance stage", cls: "ready" },
  blocked: { text: "Closed Won invent · blocked", cls: "blocked" }
};

function renderCaseGrid() {
  const grid = document.getElementById("case-grid");
  grid.innerHTML = state.cases.map((c) => {
    const tag = PATH_TAGS[c.path];
    return (
      '<button type="button" class="case-tile" data-id="' + esc(c.id) + '" aria-pressed="false">' +
        '<span class="tile-title">' + esc(c.meeting.title) + "</span>" +
        '<span class="tile-line">' + esc(c.meeting.date + " · " + c.meeting.duration) + "</span>" +
        '<span class="tile-tags"><span class="tag-chip ' + tag.cls + '">' + esc(tag.text) + "</span></span>" +
      "</button>"
    );
  }).join("");
}

function setActiveTile(id) {
  document.querySelectorAll(".case-tile").forEach((tile) => {
    tile.setAttribute("aria-pressed", tile.dataset.id === id ? "true" : "false");
  });
}

/* ---------- selection ---------- */

function selectCase(caseId) {
  state.currentId = caseId;
  state.resolved = false;
  const c = currentCase();
  setActiveTile(caseId);
  renderMeeting(c);
  renderTranscript(c);
  renderActivity(c);
  renderGate(c);
  document.getElementById("impact-block").classList.add("hidden");
  document.getElementById("console").classList.remove("hidden");
  document.getElementById("console").scrollIntoView({ behavior: "smooth", block: "start" });
  announce("Loaded " + c.meeting.title + ". Review the activity draft and stage gate.");
}

function resetDemo() {
  state.currentId = null;
  setActiveTile("");
  document.getElementById("console").classList.add("hidden");
  document.getElementById("impact-block").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  announce("Demo reset.");
  showToast("Demo reset. Pick a meeting capture to review.");
}

/* ---------- meeting + opportunity ---------- */

function renderMeeting(c) {
  const m = c.meeting;
  const o = c.opportunity;
  const chips = m.attendees.map((a) => '<span class="chip">' + esc(a) + "</span>").join("");
  document.getElementById("meeting-card").innerHTML =
    '<section class="card" aria-labelledby="meeting-title">' +
      '<h2 id="meeting-title">' + esc(m.title) + "</h2>" +
      '<p class="datetime-line">' + esc(m.date + " · " + m.duration) + " · " + esc(m.source) + "</p>" +
      '<div class="meta-row">' + chips + "</div>" +
      '<div class="opp-card">' +
        '<h3 class="opp-title">' + esc(o.name) + '<span class="chip kv" style="margin-left:6px"><span class="k">id</span>' + esc(o.id) + "</span></h3>" +
        '<div class="opp-meta">' +
          '<span class="stage-pill"><span class="dot"></span>Stage: ' + esc(o.stage) + "</span>" +
          '<span class="chip kv"><span class="k">account</span>' + esc(o.account) + "</span>" +
          '<span class="chip kv"><span class="k">amount</span>' + esc(o.amount) + "</span>" +
          '<span class="chip kv"><span class="k">owner</span>' + esc(o.owner) + "</span>" +
        "</div>" +
        '<p class="stage-def"><b>Stage attribute definition:</b> ' + esc(o.stageDefinition) + "</p>" +
      "</div>" +
    "</section>";
}

/* ---------- transcript ---------- */

function citedTurns(c) {
  const s = new Set();
  const add = (refs) => refs.forEach((r) => s.add(r));
  ["summary", "nextStep", "owners"].forEach((k) => add(c.activity[k].refs));
  add(c.stageProposal.evidenceRefs);
  add(c.stageProposal.holdRefs);
  return s;
}

function renderTranscript(c) {
  const cited = citedTurns(c);
  const turns = c.transcript.map((t, i) => {
    const cls = cited.has(i) ? ' class="turn is-cited"' : ' class="turn"';
    return (
      '<div' + cls + ' data-turn="' + i + '">' +
        '<span class="no">' + (i + 1) + "</span>" +
        '<span class="who">' + esc(t[0] + ":") + "</span>" +
        '<p class="words">' + esc(t[1]) + "</p>" +
      "</div>"
    );
  }).join("");
  document.getElementById("transcript-block").innerHTML =
    '<section class="card transcript" aria-labelledby="transcript-title">' +
      '<div class="section-title"><h2 id="transcript-title">Transcript evidence</h2>' +
      '<span class="tag">' + esc(String(c.transcript.length) + " turns · captured") + "</span></div>" +
      turns +
    "</section>";
}

/* ---------- activity draft ---------- */

function citeChips(c, refs) {
  return '<span class="cite-row">' + refs.map((r) => {
    const speaker = c.transcript[r][0];
    return (
      '<button type="button" class="cite-btn" data-turn="' + r + '">' +
        '<span class="t">t' + (r + 1) + "</span>" + esc(speaker) +
      "</button>"
    );
  }).join("") + "</span>";
}

function renderActivity(c) {
  const a = c.activity;
  const draftBadge = '<span class="chip"><span class="dot"></span>Drafted by capture agent · not written</span>';

  function fieldRow(f) {
    const sub = f.due ? "Due " + esc(f.due) + (f.owner ? " · " + esc(f.owner) : "") : "";
    return (
      '<div class="field-row">' +
        '<div class="f-label"><span>' + esc(f.label) + "</span>" +
        '<span class="conf">confidence ' + esc(String(f.confidence)) + "</span></div>" +
        '<p class="f-value">' + esc(f.value) + "</p>" +
        (sub ? '<p class="f-sub">' + sub + "</p>" : "") +
        citeChips(c, f.refs) +
      "</div>"
    );
  }

  document.getElementById("activity-block").innerHTML =
    '<section class="card" aria-labelledby="activity-title">' +
      '<div class="section-title"><h2 id="activity-title">Proposed CRM activity</h2>' + draftBadge + "</div>" +
      fieldRow(a.summary) +
      fieldRow(a.nextStep) +
      fieldRow(a.owners) +
      '<p style="margin:0;font-size:12px;color:var(--gray)">Every field cites the transcript spans it came from. Tap a citation to jump to the span.</p>' +
    "</section>";
}

/* ---------- stage gate + human gate ---------- */

const GATE_STYLE = {
  held: { bannerCls: "held", chipCls: "held", chipText: "Stage held · no evidence" },
  ready: { bannerCls: "ready", chipCls: "ready", chipText: "Advance ready · evidence cited" },
  blocked: { bannerCls: "blocked", chipCls: "blocked", chipText: "Write blocked · cannot invent" }
};

function renderGate(c) {
  const g = c.stageProposal;
  const style = GATE_STYLE[g.state];
  const primaryLabel = g.state === "ready" ? "Log activity & advance stage" : "Log activity";
  const evidenceBlock =
    g.state === "held"
      ? '<div class="gate-evidence"><span class="ev-title">Why the gate holds stage (transcript shows no commitment):</span>' + citeChips(c, g.holdRefs) + "</div>"
      : g.state === "ready"
        ? '<div class="gate-evidence"><span class="ev-title">Evidence that allows the stage advance:</span>' + citeChips(c, g.evidenceRefs) + "</div>"
        : '<div class="gate-evidence"><span class="ev-title">What the transcript shows instead:</span>' + citeChips(c, g.holdRefs) + "</div>";

  document.getElementById("gate-block").innerHTML =
    '<section class="gate-card" aria-labelledby="gate-title">' +
      '<div class="gate-banner ' + style.bannerCls + '">' +
        '<span class="marker"></span>' +
        '<div style="flex:1 1 auto;min-width:0">' +
          '<h3 id="gate-title" class="g-title">' + esc(g.title) + "</h3>" +
          '<p class="g-body">' + esc(g.body) + "</p>" +
        "</div>" +
      "</div>" +
      '<p class="gate-move"><b>Proposed change:</b> ' + esc(g.from + " → " + g.to) +
        ' <span class="tag-chip ' + style.chipCls + '">' + esc(style.chipText) + "</span></p>" +
      '<div class="gate-rule"><span class="rule-label">stage attribute</span><span class="rule-text">"' + esc(g.rule) + '"</span></div>' +
      evidenceBlock +
      '<div class="gate-actions">' +
        '<p class="actions-title">Human gate · nothing writes until you choose</p>' +
        '<div class="btn-stack" id="gate-buttons">' +
          '<button type="button" class="button primary" id="btn-log">' + esc(primaryLabel) + "</button>" +
          '<button type="button" class="button ghost" id="btn-edit">Edit fields</button>' +
          '<button type="button" class="button ghost" id="btn-hold">Hold stage</button>' +
          '<button type="button" class="button danger" id="btn-escalate">Escalate to owner</button>' +
        "</div>" +
        '<div class="editor hidden" id="editor">' +
          '<div class="editor-row"><label for="edit-summary">Summary</label>' +
          '<textarea id="edit-summary">' + esc(c.activity.summary.value) + "</textarea></div>" +
          '<div class="editor-row"><label for="edit-next">Next step</label>' +
          '<input id="edit-next" type="text" value="' + esc(c.activity.nextStep.value) + '"></div>' +
          '<div class="editor-row"><label for="edit-due">Due</label>' +
          '<input id="edit-due" type="text" value="' + esc(c.activity.nextStep.due) + '"></div>' +
          '<div class="editor-actions">' +
            '<button type="button" class="button primary" id="btn-save-edit">Save &amp; log</button>' +
            '<button type="button" class="button quiet" id="btn-cancel-edit">Cancel</button>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</section>";
}

/* ---------- turn jump ---------- */

function jumpToTurn(i) {
  const turn = document.querySelector('#transcript-block .turn[data-turn="' + i + '"]');
  if (!turn) return;
  turn.scrollIntoView({ behavior: "smooth", block: "center" });
  turn.classList.remove("flash");
  void turn.offsetWidth; /* restart animation */
  turn.classList.add("flash");
  const c = currentCase();
  announce("Turn " + (i + 1) + ": " + c.transcript[i][0] + " said, " + c.transcript[i][1]);
}

/* ---------- actions ---------- */

function disableGateButtons() {
  ["btn-log", "btn-edit", "btn-hold", "btn-escalate"].forEach((id) => {
    const b = document.getElementById(id);
    if (b) b.disabled = true;
  });
}

function logActivity(overrides) {
  const c = currentCase();
  if (!c || state.resolved) return;
  state.resolved = true;
  const edited = overrides || {};
  const summary = edited.summary || c.activity.summary.value;
  const nextStep = edited.nextStep || c.activity.nextStep.value;
  const due = edited.due || c.activity.nextStep.due;
  const g = c.stageProposal;

  let stageRow;
  if (g.state === "ready") {
    stageRow = {
      head: "Stage advanced: " + esc(g.from + " → " + g.to),
      headCls: "green",
      text: "Advanced with cited commitment spans. History records how, when, and why: " +
        g.evidenceRefs.map((r) => "t" + (r + 1)).join(", ") + ".",
      mark: "\u2713"
    };
  } else if (g.state === "blocked") {
    stageRow = {
      head: "Stage unchanged: " + esc(g.to) + " blocked",
      headCls: "red",
      text: "The gate refused the Closed Won write because no executed contract exists. The attempt was recorded but never reached the CRM.",
      mark: "\u2713"
    };
  } else {
    stageRow = {
      head: "Stage unchanged: " + esc(g.from) + " held",
      headCls: "amber",
      text: "No stage evidence in the transcript, so " + esc(g.to) + " was not written. Holding line: t" + (g.holdRefs[0] + 1) + ".",
      mark: "\u2713"
    };
  }

  const rows = [
    { head: "Activity logged", headCls: "green", text: esc(summary), mark: "\u2713" },
    { head: "Next step written", headCls: "green", text: esc(nextStep) + " · due " + esc(due), mark: "\u2713" },
    stageRow,
    { head: "Capture history", headCls: "green", text: "Written to the context graph with citation links back to the transcript, per the capture rule.", mark: "\u2713" }
  ];
  renderImpact(c, rows, "Writeback complete · " + c.opportunity.id);
  disableGateButtons();
  showToast("Activity logged to " + c.opportunity.id + ". Stage: " + (g.state === "ready" ? "advanced with cited evidence." : "unchanged."));
  announce("Activity logged. " + stageRow.head + ". " + stageRow.text);
}

function holdStage() {
  const c = currentCase();
  if (!c || state.resolved) return;
  state.resolved = true;
  const g = c.stageProposal;
  const rows = [
    { head: "Activity logged", headCls: "green", text: esc(c.activity.summary.value), mark: "\u2713" },
    { head: "Stage held by reviewer", headCls: "amber", text: esc("Hold review comment added: do not advance " + g.to + " until the customer commits in writing. Held stage: " + g.from + "."), mark: "\u21bb" },
    { head: "Capture history", headCls: "green", text: "Activity and hold comment written with citation links. Stage field not modified.", mark: "\u2713" }
  ];
  renderImpact(c, rows, "Writeback complete · " + c.opportunity.id);
  disableGateButtons();
  showToast("Activity logged and stage held: " + c.opportunity.id);
  announce("Activity logged and stage held pending written commitment.");
}

function escalate() {
  const c = currentCase();
  if (!c || state.resolved) return;
  state.resolved = true;
  const g = c.stageProposal;
  const rows = [
    { head: "Escalated to " + esc(c.opportunity.owner), headCls: "green", text: "Escalation created with the full transcript and the proposed " + esc(g.to) + " change attached for human judgement.", mark: "\u2713" },
    { head: "No CRM fields written", headCls: "red", text: esc("Stage stays " + g.from + ". Activity draft is NOT logged automatically; the owner reviews first."), mark: "\u26a0" }
  ];
  renderImpact(c, rows, "Escalation record · " + c.opportunity.id);
  disableGateButtons();
  showToast("Escalated to " + c.opportunity.owner + ". Nothing written to the CRM.");
  announce("Escalated to " + c.opportunity.owner + ". No CRM fields were written.");
}

function editFields() {
  if (state.resolved) return;
  const editor = document.getElementById("editor");
  if (editor.classList.contains("hidden")) {
    editor.classList.remove("hidden");
    document.getElementById("edit-summary").focus();
    announce("Edit fields panel open. Change the draft, then save and log.");
  }
}

function saveEdits() {
  const summary = document.getElementById("edit-summary").value.trim();
  const nextStep = document.getElementById("edit-next").value.trim();
  const due = document.getElementById("edit-due").value.trim();
  logActivity({ summary: summary || "Untitled summary", nextStep: nextStep || "Follow up", due: due || "TBD" });
}

function cancelEdits() {
  document.getElementById("editor").classList.add("hidden");
}

/* ---------- impact ---------- */

function renderImpact(c, rows, title) {
  const block = document.getElementById("impact-block");
  block.classList.remove("hidden");
  block.innerHTML =
    '<section class="impact-card" aria-labelledby="impact-title">' +
      '<h2 id="impact-title">CRM impact · ' + esc(title) + "</h2>" +
      rows.map((r) =>
        '<div class="impact-row"><span class="mark' + (r.mark === "\u26a0" ? " red" : "") + '">' + r.mark + "</span>" +
        "<div style=\"flex:1 1 auto;min-width:0\"><span class=\"row-head " + r.headCls + "\">" + r.head +
        '</span><br><span style="font-size:12.5px;color:var(--ink-2)">' + r.text + "</span></div></div>"
      ).join("") +
      '<p class="impact-note">Synthetic writeback: this record exists only in the demo. The real pattern is the gate: agents draft, humans decide, and deal stage never moves without cited customer commitment.</p>' +
    "</section>";
  block.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------- toast & a11y ---------- */

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function announce(message) {
  document.getElementById("live-region").textContent = message;
}

/* ---------- init ---------- */

function init() {
  renderCaseGrid();
  document.getElementById("case-grid").addEventListener("click", (ev) => {
    const tile = ev.target.closest(".case-tile");
    if (tile) selectCase(tile.dataset.id);
  });
  document.addEventListener("click", (ev) => {
    const cite = ev.target.closest(".cite-btn");
    if (cite) {
      jumpToTurn(Number(cite.dataset.turn));
      return;
    }
    switch (ev.target.id) {
      case "btn-log": logActivity(); break;
      case "btn-edit": editFields(); break;
      case "btn-save-edit": saveEdits(); break;
      case "btn-cancel-edit": cancelEdits(); break;
      case "btn-hold": holdStage(); break;
      case "btn-escalate": escalate(); break;
    }
  });
  document.getElementById("reset").addEventListener("click", resetDemo);
}

init();