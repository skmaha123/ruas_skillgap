# RUAS Skill Gap & Training Intelligence Dashboard

A web dashboard for the Directorate of Training and Placement at Ramaiah University of Applied Sciences. It compares student CVs with a job description (JD), shows skill gaps, and recommends training for each student and for the whole batch.

**Privacy:** everything runs in the browser. CVs and JDs are never uploaded anywhere.

## Features
- Upload a JD as PDF, DOCX, TXT or an image, or paste the JD text
- Upload many student CVs at once (PDF, DOCX, TXT, image)
- **JD intelligence:** domain, market demand, indicative salary range, required skills and how often each is mentioned
- **Per-student match %**, weighted by how strongly the JD emphasises each skill, with a readiness band: Ready (≥70%), Near ready (50–69%) or Needs training (<50%)
- **Batch skill gap chart:** the share of students missing each required skill
- **Batch training plan:** modules ranked by priority, with hours, plus UG/PG tracks and a strategy
- **Personal training plan** for each student (click a row), which can be printed
- **Export to Excel** with three sheets: Students, Batch Skill Gap and Summary
- **B.Tech CV template**, downloadable as a Word file
- **Outlook 2026–27** demand chart and a domain guide

## Publish on GitHub Pages
1. Create a new **public** repository, for example `ruas-skillgap`.
2. Upload **all** files in this folder. There are no subfolders.
3. Optional: add the official RUAS logo as `logo.png`. It appears in the header automatically.
4. Go to **Settings → Pages** and set *Deploy from a branch* → `main` → `/ (root)` → **Save**.
5. Open `https://<username>.github.io/ruas-skillgap/`.

## Customise (edit `config.js` on GitHub)
- **skills:** the skill library. Each row is `["Skill", ["aliases"], "Training module", hours]`. Add rows to teach the dashboard new skills. The dashboard also lists JD keywords it didn't recognise, to help you decide what to add.
- **domains:** demand, salary ranges, UG/PG tracks and strategy for each domain. The values are indicative, so update them each season.
- **outlook:** the 2026–27 demand index.
- **readyAt / nearReadyAt:** the readiness thresholds.

## Notes
- Scanned PDFs have no readable text. Upload them as images instead, or use text-based PDFs.
- Reading images (OCR) loads an extra library from the internet the first time it's used.
- Matching is based on keywords from the skill library. Treat the scores as guidance for training decisions, not as a hiring verdict.
