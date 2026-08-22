# Moonview Web Branding Audit

## Overview
This document catalogs the default branding elements present in a pristine Jellyfin Web `v10.11.11` build and outlines the required changes to rebrand it to **Moonview Web**.

## 1. Core HTML & Metadata (`src/index.html`)
- **Application Name:** `<meta name="application-name" content="Jellyfin">`
- **Page Title:** `<title>Jellyfin</title>`
- **Theme Color:** `<meta id="themeColor" name="theme-color" content="#202020">`
- **Tile Color:** `<meta name="msapplication-TileColor" content="#333333">`
- **Splash Screen Logo:** `<div class="splashLogo"></div>`

## 2. Progressive Web App Manifest (`src/manifest.json`)
- **Name:** `"name": "Jellyfin"`
- **Short Name:** `"short_name": "Jellyfin"`
- **Description:** `"description": "The Free Software Media System"`
- **Colors:**
  - `"theme_color": "#101010"`
  - `"background_color": "#101010"`

## 3. Favicons & Icons
- Favicons are linked in `src/index.html` from `../node_modules/@jellyfin/ux-web/favicons/`.
- PWA icons are defined in `src/manifest.json` referencing `favicons/touchicon*.png`.
- *Note:* For Moonview, these should be replaced with Moonview assets (using the `moonview-dev-mark.svg` as a temporary dev replacement where applicable).

## 4. Splash Screen (`src/styles/site.scss`)
- `.splashLogo` background image is injected via CSS. This must be updated to use the Moonview logo.

## 5. Webpack / Build Configuration
- `webpack.common.js` configures the Favicon injection and manifest parsing.
- Package name in `package.json` is `jellyfin-web`.

## Action Items for Foundational Rebranding
1.  **Identity Replacements:**
    - Update `src/index.html` (title, meta application-name).
    - Update `src/manifest.json` (name, short_name, description).
2.  **Visual Overrides:**
    - Inject Moonview design tokens into the core styles (e.g. `src/themes/defaults.ts` or `src/styles/`).
    - Override `.splashLogo` in `site.scss` to use the Moonview logo.
3.  **Temporary Asset Strategy:**
    - Create `branding/dev/moonview-dev-mark.svg`.
    - Point splash and key logo elements to this dev mark.
