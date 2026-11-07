# Jaden Minnick — GitHub Pages Portfolio (Version 5)

**Ready for a static GitHub Pages repository.** No npm, build tooling, or server required.

## Directory layout
```text
Jaden-Minnick.github.io/
├── index.html                # New homepage
├── graduate.html             # UTK graduate research (UCl3 is the main feature)
├── undergraduate.html        # Preserves your Virginia Tech HTML portfolio
├── career.html               # Experience, leadership, aspirations
├── about.html                # Story, hobbies, contact
├── assets/
│   ├── css/site.css
│   └── js/site.js
├── images/                   # Merge with your EXISTING images folder
├── files/                    # Preserve EXISTING PDFs and add updated CV
├── CNAME                     # KEEP YOUR EXISTING CNAME; not included here
└── README.md
```

## Upload to your existing GitHub repository

1. In `Jaden-Minnick/Jaden-Minnick.github.io`, make a **new branch** (for example `redesign-v5`) or download a backup of `main`.
2. Extract this ZIP and upload the **contents** directly into the root of that branch. Do **not** nest them under a folder named `jaden-portfolio-github-ready-v5`.
3. Replace `index.html` and `README.md`; add `graduate.html`, `undergraduate.html`, `career.html`, `about.html`, and `assets/`.
4. **Do not delete or overwrite your existing `images/`, `files/`, or `CNAME`.** The ZIP has only `images/README.txt` and `files/README.txt` as instructions. You can skip uploading those placeholders entirely.
5. Before changing your live branch, preview the site locally by opening `index.html` or use a local server (`python -m http.server 8000`).
6. Once satisfied, merge your branch into `main`. Under GitHub **Settings → Pages**, verify deployment from the intended branch's root (`/`). Your custom domain continues using the preexisting `CNAME`.

## Before public launch

- **Images**: Existing Virginia Tech images should remain in `images/`. New empty image placeholders display until you add photos with the matching filenames. See `data-photo` attributes in each HTML page. Start with `home-portrait.jpg`, `ucl-research.jpg`, and `utk-hero.jpg`.
- **CV**: Replace/update `files/Jaden_Minnick_CV.pdf` with the latest version if you want the link to work.
- **Contact**: Fill in the placeholders in `about.html` for your preferred public email and LinkedIn URL.
- **Dates**: Review legacy undergraduate 'Present' labels and any listings of faculty roles or affiliations before publishing.
- **Lab information**: Keep unpublished experiments, exact data, original slides, group photos, and proprietary material out of the public portfolio until you have permission.
- **Attribution**: Technical background draws on advisor Alex Ivanov's May 2026 presentation, but this package does not reproduce its figures; research-group work is not represented as Jaden's completed work.

## Editing the scientific description

- `index.html`: the featured uranium chloride section and current research cards.
- `graduate.html`: section `id="ucl"` contains the primary project description, followed by methods and complementary interests. Technical expansions are native HTML `<details>` and need no special JavaScript.
- `assets/css/site.css`: common styling, with Tennessee accents applied through the `.theme-ut` class.
- `assets/js/site.js`: loads personal photo paths from `images/`.

## Privacy and professional presentation

This is an independent personal website, not an official representation of UT Knoxville, Virginia Tech, or a national laboratory. Aspirations toward nuclear advocacy and public policy are described as goals, not current appointments. Only publish third-party photos or research graphics with appropriate permission.
