# Jaden Minnick Portfolio V13 | Cinematic Intro Prototype

A complete static GitHub Pages portfolio. No npm, build process, or external JS libraries are needed.

## What changed

The V11 terminal startup is replaced by a short, text-free cinematic introduction, beginning with fission and a chain reaction, pulling back into a stylized fission reactor, moving to a fusion reaction and tokamak, then a molten salt reactor loop and a dive into animated ions. The introduction fades into the interactive molecular-motion hero. The **only visible intro text is Skip intro**.

The intro is artistically inspired by nuclear science, not a physically faithful model of any actual reactor or fuel system. The live ions and transient proximity lines are a stylized representation, not measured uranium chloride coordination or molecular dynamics data.

## How to try it

1. Extract all contents from the ZIP.
2. Double-click `index.html` inside the extracted folder, leaving `assets/` and `images/` alongside it.
3. The intro runs on the first visit in a browser tab session. Click **Replay intro** in the homepage animation controls to view it again.
4. The **Skip intro** button and Escape key skip immediately. Visitors who prefer reduced motion will not see the intro.
5. Keep the existing GitHub repository `CNAME` and `files/` folder, including the CV, when uploading.

## File layout

- `index.html` is the homepage.
- `assets/js/cinematic.js` controls the cinematic sequence.
- `assets/js/site.js` controls the interactive molecular scene and temperature slider.
- `assets/css/site.css` contains site styling and cinematic overlay styles.
- All other HTML pages and the curated photos are retained from V11.

## Publishing

Upload the **contents** of the extracted folder to your `website-redesign` branch in the root of the GitHub Pages repository. Preserve existing `CNAME` and `files/` entries. Test locally and on phone before merging into main.


## V13 visual refinements

The cinematic now takes about 15.5 seconds rather than 10.4 seconds. Its original scene order is preserved, with additional visual detail in the fission fragments, reactor internals, fusion reaction, tokamak field coils, salt circulation loop, and microscopic ion coordination field. The intro is a stylized scientific illustration, not a numerical model. The Replay and Skip Intro controls still work, and reduced-motion preferences are respected.

## V14 updates

- Intro duration set to precisely 12,000 ms (not counting the short exit fade).
- Replaced the three undergraduate project-card photos with the user-supplied MOLLER apparatus, tokamak CFD, and distillation-column images.
- Used `object-fit: contain` and responsive image boxes so the whole diagram, numerical plot, and portrait remain visible, without clipping.
- These cards appear on `undergraduate.html`, even though the request referred to the Graduate section. The graduate research page does not contain those project cards.


## Photo alignment refinement
The three undergraduate project images use an edge-to-edge white image area with centered `object-fit: contain`, removing the gray padded frames while retaining each entire image.

## Knoxville photo fix
The “A new chapter in Knoxville” photo on About now uses `object-fit: contain` with a centered white background, preserving the entire portrait without cropping. Other photo framing and the cinematic intro are unchanged.

## About gallery layout update
Both personal photos now have equal-height centered media areas on desktop, aligned captions, and full uncropped images. On narrow mobile screens images return to their natural aspect ratio.


V15: Cinematic visual upgrade with layered optical depth, shaded nuclei, illustrated vessel material, plasma-torus depth, reflective heat-transfer loop and unchanged 12-second timing. All imagery is scientifically inspired, not validated simulation data.


## V16: Approved cutaway reactor introduction

The home page uses the approved V6 stand-alone 12-second scientific cinematic with the open-front tokamak and the recognizable PWR and MSR systems. The original interactive molten-salt hero remains live under the intro. Use the Skip intro button, or Replay intro on the homepage. Returning visitors do not see the intro again during the same browser session. Reduced-motion users skip the intro.

Keep your existing `CNAME` and `files/` folder when publishing.
