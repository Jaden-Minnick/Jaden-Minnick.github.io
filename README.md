# Jaden Minnick | Portfolio V7

Static personal website for GitHub Pages, with consistent layout and four top-level pages.

## Pages

- `index.html`: Nuclear-themed homepage with Marie Curie quotation and three featured portfolio chapters.
- `graduate.html`: UT Knoxville checkerboard header, uranium chloride molten-salt research, faculty links, and the proposed chemical inventory system.
- `undergraduate.html`: Virginia Tech page with Hokie Stone header and a short link to the preserved original undergraduate archive.
- `undergraduate-archive.html`: Original full Virginia Tech website and projects.
- `about.html`: Personal history, interests, service, and CV link.

## Changes in V7

- Removed Career from the top-level navigation and omitted `career.html` from this release.
- Made the square portrait fully visible at desktop and mobile widths with `object-fit: contain`.
- Removed headshot captions.
- Linked Dr. Alex Ivanov and Dr. Ilja Popovs to their UTK faculty pages.
- Replaced the molten salt workshop card with the proposed automated chemical inventory system. It is clearly labeled as a proposal, not a completed project. The research proposal PDF itself is **not published**.
- Changed graduate moments to `TBD!`.
- Simplified the undergraduate archive introduction.
- Removed drafting notes about the CV. The site links to `files/Jaden_Minnick_CV.pdf` in your existing GitHub `files` folder.
- Removed em dashes in site prose.

## Upload to GitHub

1. Back up the existing repository using **Code > Download ZIP**.
2. Extract this ZIP. Upload the **contents**, not the enclosing folder, to your redesign branch in the repository root.
3. Preserve the existing `CNAME` and `files` folder. They are intentionally **not** included here.
4. If you previously uploaded `career.html`, delete it from your GitHub branch to match this release. Remove any links to it you may have added outside this package.
5. Confirm the CV link in `about.html` matches the actual case-sensitive filename in your GitHub `files` directory. The site expects `files/Jaden_Minnick_CV.pdf`.
6. Test the homepage and each navigation page, then merge the branch to `main` when ready.

## Customize

- Colors, background images, responsive portrait: `assets/css/site.css`
- Shared scripts: `assets/js/site.js`
- Images: `images/`
- Existing VT archive: `undergraduate-archive.html`

No framework or build step required.

## Contact information

The About page and shared footers include a direct email link (`minnick@vols.utk.edu`) and LinkedIn link (`https://www.linkedin.com/in/jaden-minnick/`).
