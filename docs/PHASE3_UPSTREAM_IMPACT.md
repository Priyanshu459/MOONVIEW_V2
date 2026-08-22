# Phase 3 Upstream Impact Audit

This document tracks all files modified outside of the `src/components/moonview/` or `src/styles/moonview.scss` isolation directories during the Phase 3 Netflix-like UI/UX transformation.

Our core principle for Phase 3 was:
> REDESIGN THE EXPERIENCE. DO NOT REBUILD THE ENGINE.
> EXTEND / WRAP UPSTREAM WHERE POSSIBLE. PATCH CORE UPSTREAM ONLY WHEN NECESSARY.

By leveraging CSS targeting in `moonview.scss`, we were able to minimize our footprint in upstream files significantly.

## Modified Upstream Files

### 1. `src/index.jsx`
- **Impact:** LOW
- **Change:** Injected `import './styles/moonview.scss';` to globally load the Moonview design tokens and CSS overrides.

### 2. `src/scripts/libraryMenu.js`
- **Impact:** MEDIUM
- **Change:** 
  - Imported and instantiated `MoonviewNav`.
  - Injected logic inside `updateUserInHeader` to conditionally hide the default `mainDrawer` and default `headerTop` for non-administrator users, while leaving them visible for admins.

### 3. `src/controllers/hometab.js`
- **Impact:** LOW
- **Change:** 
  - Imported and instantiated `MoonviewHero`.
  - Added DOM injection to prepend the `MoonviewHero` before the upstream sections container during the `onResume` lifecycle hook.
  - Ensured the hero is destroyed during `destroyHomeSections()`.

## Files Avoided (CSS overrides used instead)

The following high-risk files were left completely unmodified by targeting their generated DOM structures directly through CSS in `moonview.scss`:

- `src/components/cardbuilder/cardBuilder.js` (Handled via `.card` and `.cardBox` CSS)
- `src/components/homesections/homesections.js` (Handled via `.itemsContainer.scrollSlider` CSS)
- `src/components/homesections/sections/recentlyAdded.ts`
- `src/components/homesections/sections/resume.ts`
- `src/controllers/movies/movies.js` (Handled via `.libraryPage .itemsContainer.vertical-wrap` CSS)
- `src/controllers/shows/shows.js`
- `src/controllers/itemDetails/index.html` (Handled via `.itemDetailPage` and `.itemBackdrop` cinematic CSS overrides)
- `src/controllers/itemDetails/index.js`

## Conclusion
The Phase 3 architecture strategy successfully decoupled the Moonview presentation layer from the Jellyfin data/action logic. The minimal touchpoints (only 3 core JS files patched) ensure that Moonview remains highly resilient to future upstream updates.
