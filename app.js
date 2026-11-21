/* RUAS Skill Gap & Training Intelligence Dashboard — runs fully in the browser. */
"use strict";

const CFG = window.SG_CONFIG;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = { jdFile: null, cvFiles: [], result: null, sort: { key: "score", dir: -1 } };

/* ==================== SKILL LIBRARY ==================== */
const SKILLS = [];
for (const [domain, rows] of Object.entries(CFG.skills)) {
  for (const [name, aliases, training, hours] of rows) {
    const uniq = [...new Set([name, ...aliases].map(x => x.toLowerCase().trim()))];
    SKILLS.push({ name, domain, training, hours, aliases: uniq, patterns: uniq.map(makePattern) });
  }
}
function makePattern(alias) {
  const a = alias.toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![a-z0-9+#])${a}(?![a-z0-9+#])`, "g");
}
function normalise(text) {
  return " " + String(text).toLowerCase().replace(/[‐-―]/g, "-").replace(/\s+/g, " ") + " ";
}
/* returns Map(skillName -> count of mentions) */
function findSkills(text) {
  const t = normalise(text);
  const found = new Map();
  for (const s of SKILLS) {
    // collect every hit, then count non-overlapping mentions ("data visualization" ≠ 2 mentions)
    const spans = [];
    for (const p of s.patterns) { p.lastIndex = 0; let m; while ((m = p.exec(t))) spans.push([m.index, m.index + m[0].length]); }
    if (!spans.length) continue;
    spans.sort((x, y) => x[0] - y[0] || y[1] - x[1]);
    let n = 0, end = -1;
    for (const [st, en] of spans) if (st >= end) { n++; end = en; }
    found.set(s.name, n);
  }
  return found;
}
const skillByName = new Map(SKILLS.map(s => [s.name, s]));

const STOP = new Set(("a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours " +
  "job role candidate candidates company work working ability able experience years year required requirements requirement responsibilities responsibility skills skill knowledge good strong excellent preferred must plus etc using use including include across within team new well also understanding apply hiring opportunity location salary package eligibility description key looking join develop developing per various related relevant based least minimum degree b.tech btech engineering graduate graduates students fresher freshers proficiency proficient familiarity familiar exposure hands-on").split(/\s+/));

function otherKeywords(text, known) {
  const counts = new Map();
  for (const w of normalise(text).match(/[a-z][a-z0-9+#.-]{2,}/g) || []) {
    const word = w.replace(/[.-]+$/, "");
    if (STOP.has(word) || word.length < 3) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const knownWords = new Set(SKILLS.flatMap(s => s.aliases.flatMap(x => [x, ...x.split(/[^a-z0-9+#]+/)])));
  return [...counts].filter(([w]) => !knownWords.has(w)).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w]) => w);
}

/* ==================== FILE READING ==================== */
async function readFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return file.text();
  if (name.endsWith(".docx")) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const xml = await zip.file("word/document.xml").async("string");
    return xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, " ").replace(/<w:br\/>/g, "\n")
      .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }
  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const c = await (await pdf.getPage(i)).getTextContent();
      text += c.items.map(it => it.str + (it.hasEOL ? "\n" : " ")).join("") + "\n";
    }
    return text;
  }
  if (/\.(png|jpe?g)$/.test(name)) return ocr(file);
  throw new Error("Unsupported file type");
}

let tesseractLoading = null;
async function ocr(file) {
  if (!window.Tesseract) {
    tesseractLoading ||= new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.onload = res; s.onerror = () => rej(new Error("Image reading (OCR) needs an internet connection"));
      document.head.appendChild(s);
    });
    await tesseractLoading;
  }
  const r = await Tesseract.recognize(file, "eng");
  return r.data.text;
}

/* ==================== ANALYSIS ==================== */
function band(score) {
  if (score >= CFG.readyAt) return { key: "ready", label: "Placement ready" };
  if (score >= CFG.nearReadyAt) return { key: "near", label: "Near ready" };
  return { key: "need", label: "Needs training" };
}

function analyse(jdText, cvs) {
  const jd = findSkills(jdText);
  // weight: mentioned more often in the JD → more important (1 to 2)
  const req = [...jd].map(([name, n]) => ({ ...skillByName.get(name), weight: 1 + Math.min(n - 1, 2) * 0.5, mentions: n }))
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));
  const total = req.reduce((s, r) => s + r.weight, 0);

  // domain = where the JD's weighted technical skills concentrate
  const dScore = {};
  for (const r of req) if (r.domain !== "General / Professional") dScore[r.domain] = (dScore[r.domain] || 0) + r.weight;
  const domain = Object.entries(dScore).sort((a, b) => b[1] - a[1])[0]?.[0] || "General / Professional";

  const students = cvs.map(cv => {
    const has = findSkills(cv.text);
    const matched = req.filter(r => has.has(r.name));
    const missing = req.filter(r => !has.has(r.name));
    const score = total ? matched.reduce((s, r) => s + r.weight, 0) / total * 100 : 0;
    const extra = [...has.keys()].filter(n => !jd.has(n));
    return { name: cv.name, score, band: band(score), matched, missing, extra, words: cv.text.split(/\s+/).filter(Boolean).length };
  });
  students.sort((a, b) => b.score - a.score);
  students.forEach((s, i) => (s.rank = i + 1));

  const gap = req.map(r => {
    const missingBy = students.filter(s => s.missing.some(m => m.name === r.name));
    const pct = students.length ? missingBy.length / students.length * 100 : 0;
    return { ...r, missingCount: missingBy.length, pct, priority: pct >= 50 ? "High" : pct >= 25 ? "Medium" : "Low", who: missingBy.map(s => s.name) };
  }).sort((a, b) => b.pct - a.pct || b.weight - a.weight);

  const avg = students.length ? students.reduce((s, x) => s + x.score, 0) / students.length : 0;
  const ready = students.filter(s => s.band.key === "ready").length;
  return { domain, req, students, gap, avg, ready, readiness: students.length ? ready / students.length * 100 : 0, other: otherKeywords(jdText, jd.keys()) };
}

/* ==================== RENDER ==================== */
const fmt = n => (Math.round(n * 10) / 10).toFixed(1);

function render() {
  const r = state.result;
  $("results").hidden = false;
  const top = r.students[0];
  const d = CFG.domains[r.domain] || CFG.domains["General / Professional"];

  $("kpis").innerHTML = `
    <div class="kpi"><span>Students analysed</span><b>${r.students.length}</b><small>${r.req.length} skills required by the JD</small></div>
    <div class="kpi"><span>Average match</span><b>${fmt(r.avg)}%</b><small>weighted by JD emphasis</small></div>
    <div class="kpi"><span>Placement readiness</span><b>${fmt(r.readiness)}%</b><small>${r.ready} of ${r.students.length} at ≥ ${CFG.readyAt}% match</small></div>
    <div class="kpi"><span>Top candidate</span><b>${top ? fmt(top.score) + "%" : "—"}</b><small title="${esc(top?.name)}">${esc(top?.name || "")}</small></div>`;

  $("jdInfo").innerHTML = `
    <div><b>Domain</b>${esc(r.domain)}</div>
    <div><b>Market demand</b>${esc(d.demand)}</div>
    <div><b>Indicative salary</b>${esc(d.salary)}</div>
    <div><b>Strategy</b>${esc(d.strategy)}</div>`;
  $("jdSkills").innerHTML = r.req.length
    ? r.req.map(s => `<span class="chip" title="${esc(s.domain)} · mentioned ${s.mentions}×">${esc(s.name)}${s.mentions > 1 ? ` <small>×${s.mentions}</small>` : ""}</span>`).join("")
    : `<span class="status err">No known skills were found in the JD. Check that the file has readable text, or add the skills to config.js.</span>`;
  $("jdOther").innerHTML = r.other.length
    ? `Other JD keywords not in the skill library: <i>${r.other.map(esc).join(", ")}</i> — add any real skills among them to <code>config.js</code>.` : "";

  // match chart
  const statusColor = { ready: "#2e8b47", near: "#c98a12", need: "#c4372b" };
  $("readyLegend").innerHTML = `
    <span><i style="background:${statusColor.ready}"></i>✓ Ready (≥ ${CFG.readyAt}%)</span>
    <span><i style="background:${statusColor.near}"></i>◐ Near ready (${CFG.nearReadyAt}–${CFG.readyAt - 1}%)</span>
    <span><i style="background:${statusColor.need}"></i>✗ Needs training (&lt; ${CFG.nearReadyAt}%)</span>`;
  $("chartMatch").innerHTML = r.students.map((s, i) => `
    <div class="bar-row clickable" data-stu="${i}" data-tip="${esc(s.name)}: ${fmt(s.score)}% — ${esc(s.band.label)}. Click for training plan.">
      <span class="lbl">${esc(s.name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${s.score}%;background:${statusColor[s.band.key]}"></div>
        <span class="thr" style="left:${CFG.readyAt}%"></span></div>
      <span class="val">${fmt(s.score)}%</span>
    </div>`).join("") || `<p class="sub">No students.</p>`;

  // gap chart
  $("chartGap").innerHTML = r.gap.map(g => `
    <div class="bar-row" data-tip="${esc(g.name)}: ${g.missingCount} of ${r.students.length} students missing (${fmt(g.pct)}%)">
      <span class="lbl">${esc(g.name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${g.pct}%"></div></div>
      <span class="val">${Math.round(g.pct)}%</span>
    </div>`).join("") || `<p class="sub">No required skills detected.</p>`;

  renderStudents();

  $("tblTraining").querySelector("tbody").innerHTML = r.gap.filter(g => g.missingCount).map(g => `
    <tr><td><span class="pill ${g.priority === "High" ? "high" : g.priority === "Medium" ? "med" : "low"}">${g.priority}</span></td>
      <td>${esc(g.name)}<div class="small-list">${esc(g.domain)}</div></td>
      <td>${g.missingCount} of ${r.students.length} (${Math.round(g.pct)}%)</td>
      <td>${esc(g.training)}</td><td>${g.hours} h</td></tr>`).join("")
    || `<tr><td colspan="5">🎉 No gaps — every student covers every required skill.</td></tr>`;

  $("tracks").innerHTML = `
    <div><b>UG training track — ${esc(r.domain)}</b>${d.UG.map(esc).join(" · ")}</div>
    <div><b>PG training track — ${esc(r.domain)}</b>${d.PG.map(esc).join(" · ")}</div>
    <div><b>Strategy</b>${esc(d.strategy)}</div>`;

  $("btnExport").disabled = $("btnPrint").disabled = false;
}

function renderStudents() {
  const r = state.result, { key, dir } = state.sort;
  const order = { ready: 0, near: 1, need: 2 };
  const list = [...r.students].sort((a, b) => {
    const v = key === "name" ? a.name.localeCompare(b.name) : key === "band" ? order[a.band.key] - order[b.band.key] : key === "rank" ? a.rank - b.rank : a.score - b.score;
    return v * (key === "score" ? dir : -dir);
  });
  const chipList = (arr, cls, max = 8) => arr.slice(0, max).map(x => `<span class="chip ${cls}">${esc(x.name)}</span>`).join(" ") + (arr.length > max ? ` <span class="small-list">+${arr.length - max} more</span>` : "");
  $("tblStudents").querySelector("tbody").innerHTML = list.map(s => `
    <tr data-stu="${r.students.indexOf(s)}">
      <td>${s.rank}</td><td>${esc(s.name)}${s.words < 30 ? `<div class="small-list">⚠ very little text read — scanned file?</div>` : ""}</td>
      <td><b>${fmt(s.score)}%</b></td>
      <td><span class="pill ${s.band.key}">${s.band.key === "ready" ? "✓" : s.band.key === "near" ? "◐" : "✗"} ${esc(s.band.label)}</span></td>
      <td>${chipList(s.matched, "ok") || "—"}</td><td>${chipList(s.missing, "miss") || "—"}</td>
    </tr>`).join("");
}

function studentPlanHtml(s) {
  const hours = s.missing.reduce((h, m) => h + m.hours, 0);
  return `
    <p><b>Match: ${fmt(s.score)}%</b> &nbsp;<span class="pill ${s.band.key}">${esc(s.band.label)}</span></p>
    <h3>✓ Skills matched (${s.matched.length})</h3>
    <div class="chips">${s.matched.map(m => `<span class="chip ok">${esc(m.name)}</span>`).join("") || "—"}</div>
    <h3>✗ Skills to develop (${s.missing.length})</h3>
    <div class="chips">${s.missing.map(m => `<span class="chip miss">${esc(m.name)}</span>`).join("") || "None 🎉"}</div>
    ${s.missing.length ? `
    <h3>🎯 Recommended training (${hours} hours)</h3>
    <table><thead><tr><th>#</th><th>Training module</th><th>Skill</th><th>Hours</th></tr></thead><tbody>
      ${s.missing.slice().sort((a, b) => b.weight - a.weight).map((m, i) => `<tr><td>${i + 1}</td><td>${esc(m.training)}</td><td>${esc(m.name)}</td><td>${m.hours}</td></tr>`).join("")}
    </tbody></table>` : ""}
    ${s.extra.length ? `<h3>Other strengths in the CV</h3><div class="chips">${s.extra.map(n => `<span class="chip">${esc(n)}</span>`).join("")}</div>` : ""}`;
}

function openStudent(i) {
  const s = state.result.students[i];
  $("stuName").textContent = s.name;
  $("stuBody").innerHTML = studentPlanHtml(s);
  $("dlgStudent").showModal();
}

function renderOutlook() {
  $("chartOutlook").innerHTML = CFG.outlook.map(([n, v]) => `
    <div class="bar-row" data-tip="${esc(n)}: demand index ${v}">
      <span class="lbl">${esc(n)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${v}%"></div></div>
      <span class="val">${v}</span>
    </div>`).join("");
  $("outlookNote").textContent = "📈 " + CFG.outlookNote;
  $("tblDomains").querySelector("tbody").innerHTML = Object.entries(CFG.domains).map(([n, d]) =>
    `<tr><td><b>${esc(n)}</b></td><td>${esc(d.demand)}</td><td>${esc(d.salary)}</td><td>${d.UG.map(esc).join(", ")}</td><td>${d.PG.map(esc).join(", ")}</td></tr>`).join("");
}

/* ==================== EXPORT (real .xlsx) ==================== */
function colName(i) { let s = ""; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
function xmlEsc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""); }
function sheetXml(rows) {
  const body = rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => {
    const ref = colName(c) + (r + 1);
    const style = r === 0 ? ' s="1"' : "";
    return typeof v === "number" ? `<c r="${ref}"${style}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
  }).join("")}</row>`).join("");
  const widths = rows[0].map((_, c) => Math.min(60, Math.max(10, ...rows.map(r => String(r[c] ?? "").length + 2))));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${body}</sheetData></worksheet>`;
}
async function buildXlsx(sheets) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file("xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4B2A7B"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs></styleSheet>`);
  sheets.forEach((s, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows)));
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

async function exportExcel() {
  const r = state.result;
  const round = n => Math.round(n * 10) / 10;
  const sheets = [
    { name: "Students", rows: [["Rank", "Student (file)", "Match %", "Readiness", "Matched skills", "Missing skills", "Recommended training", "Training hours"],
      ...r.students.map(s => [s.rank, s.name, round(s.score), s.band.label, s.matched.map(m => m.name).join(", "), s.missing.map(m => m.name).join(", "),
        s.missing.map(m => m.training).join("; "), s.missing.reduce((h, m) => h + m.hours, 0)])] },
    { name: "Batch Skill Gap", rows: [["Priority", "Skill", "Domain", "Students missing", "% missing", "Training module", "Hours", "Students"],
      ...r.gap.map(g => [g.priority, g.name, g.domain, g.missingCount, round(g.pct), g.training, g.hours, g.who.join(", ")])] },
    { name: "Summary", rows: [["Item", "Value"], ["Domain", r.domain], ["Students analysed", r.students.length], ["Average match %", round(r.avg)],
      ["Placement readiness %", round(r.readiness)], ["Top candidate", r.students[0]?.name || ""], ["Required skills", r.req.map(s => s.name).join(", ")],
      ["JD file", state.jdFile ? state.jdFile.name : "Pasted text"], ["Generated", new Date().toLocaleString("en-IN")]] },
  ];
  download(await buildXlsx(sheets), `RUAS_SkillGap_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ==================== UI WIRING ==================== */
function setStatus(msg, err) { $("status").textContent = msg; $("status").className = "status" + (err ? " err" : ""); }

function setupDrop(dropId, inputId, onFiles) {
  const drop = $(dropId), input = $(inputId);
  ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", ev => onFiles([...ev.dataTransfer.files]));
  input.addEventListener("change", () => { onFiles([...input.files]); input.value = ""; });
}

const okType = f => /\.(pdf|docx|txt|png|jpe?g)$/i.test(f.name);

async function runAnalysis() {
  const pasted = $("jdText").value.trim();
  if (!state.jdFile && !pasted) return setStatus("Upload or paste a job description first.", true);
  if (!state.cvFiles.length) return setStatus("Upload at least one student CV.", true);
  const btn = $("btnAnalyze"); btn.disabled = true;
  try {
    setStatus("Reading job description…");
    const jdText = state.jdFile ? await readFile(state.jdFile) : pasted;
    const cvs = [], failed = [];
    for (let i = 0; i < state.cvFiles.length; i++) {
      const f = state.cvFiles[i];
      setStatus(`Reading CV ${i + 1} of ${state.cvFiles.length}: ${f.name}`);
      try { cvs.push({ name: f.name.replace(/\.[^.]+$/, ""), text: await readFile(f) }); }
      catch (e) { failed.push(`${f.name} (${e.message})`); }
    }
    state.result = analyse(jdText, cvs);
    render();
    setStatus(`Analysed ${cvs.length} CV(s).` + (failed.length ? ` Could not read: ${failed.join(", ")}` : ""), failed.length > 0);
    $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    console.error(e); setStatus("Error: " + e.message, true);
  } finally { btn.disabled = false; }
}

function clearAll() {
  state.jdFile = null; state.cvFiles = []; state.result = null;
  $("jdName").hidden = true; $("jdText").value = ""; $("cvList").innerHTML = "";
  $("results").hidden = true; $("btnExport").disabled = $("btnPrint").disabled = true;
  setStatus("");
}

function downloadCvTemplate() {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>CV</title>
    <style>body{font-family:Calibri,Arial;font-size:11pt}h3{font-size:18pt;margin:0}h4{color:#4b2a7b;text-transform:uppercase;font-size:10pt;border-bottom:1px solid #ccc;margin:12pt 0 3pt}p,ul{margin:3pt 0}</style></head>
    <body>${$("cvSheet").innerHTML}</body></html>`;
  download(new Blob(["﻿" + html], { type: "application/msword" }), "RUAS_BTech_CV_Template.doc");
}

function init() {
  $("uniName").textContent = CFG.university;
  $("deptName").textContent = CFG.department;
  $("pageTitle").textContent = CFG.title;
  $("footText").textContent = `${CFG.department} · ${CFG.university}`;
  document.title = `RUAS ${CFG.title}`;
  if (CFG.logo) {
    const img = $("logoImg");
    img.onload = () => { img.hidden = false; $("logoBadge").hidden = true; };
    img.src = CFG.logo;
  }
  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === t));
    document.querySelectorAll(".tabpane").forEach(p => (p.hidden = p.id !== "tab-" + t.dataset.tab));
  }));

  setupDrop("jdDrop", "jdFile", files => {
    const f = files.find(okType); if (!f) return;
    state.jdFile = f; $("jdName").hidden = false; $("jdName").textContent = "📄 " + f.name;
  });
  setupDrop("cvDrop", "cvFiles", files => {
    const add = files.filter(okType).filter(f => !state.cvFiles.some(x => x.name === f.name && x.size === f.size));
    state.cvFiles.push(...add);
    $("cvList").innerHTML = state.cvFiles.map(f => `<li>${esc(f.name)}</li>`).join("");
    setStatus(`${state.cvFiles.length} CV(s) ready.`);
  });

  $("btnAnalyze").addEventListener("click", runAnalysis);
  $("btnExport").addEventListener("click", exportExcel);
  $("btnPrint").addEventListener("click", () => window.print());
  $("btnClear").addEventListener("click", clearAll);
  $("btnCvDownload").addEventListener("click", downloadCvTemplate);
  $("btnCloseStu").addEventListener("click", () => $("dlgStudent").close());
  $("btnPrintStu").addEventListener("click", () => {
    document.body.classList.add("print-student"); window.print(); document.body.classList.remove("print-student");
  });

  document.addEventListener("click", e => {
    const row = e.target.closest("[data-stu]"); if (row && state.result) openStudent(+row.dataset.stu);
    const th = e.target.closest("th[data-sort]");
    if (th && state.result) {
      const k = th.dataset.sort;
      state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : -1 };
      renderStudents();
    }
  });

  // hover tooltip for chart bars
  const tip = $("tip");
  document.addEventListener("mousemove", e => {
    const el = e.target.closest("[data-tip]");
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.dataset.tip; tip.hidden = false;
    tip.style.left = Math.min(e.clientX + 14, innerWidth - 300) + "px"; tip.style.top = e.clientY + 14 + "px";
  });

  renderOutlook();
}

document.addEventListener("DOMContentLoaded", init);
