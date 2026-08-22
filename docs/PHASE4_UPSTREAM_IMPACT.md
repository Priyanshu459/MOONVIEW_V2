# Phase 4 Upstream Impact

Player code is a high-risk area. Any change to playback logic should be treated as HIGH risk and justified. This document classifies every meaningful modification we are making to the player architecture.

| Modification | Type | Risk | Justification |
| :--- | :--- | :--- | :--- |
| **CSS Overrides for `#videoOsdPage`** | CSS | **LOW** | We are using a dedicated SCSS file (`moonview-player.scss`) to override default styles without changing the DOM structure or Javascript logic. |
| **Seek Bar Restyling** | CSS | **LOW** | Targeting `input[is="emby-slider"]` using CSS pseudo-elements (`::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`) ensures native browser slider functionality remains intact while providing the Moonview visual identity. |
| **Control Overlay Restyling** | CSS | **LOW** | Repositioning controls to match the Moonview design (bottom gradient, layout adjustments) only affects layout, not event listeners. |
| **Subtitle / Audio Menu Restyling** | CSS | **LOW** | Targeting `.actionSheet` or similar dialog classes when triggered from the player preserves the native Jellyfin track selection logic. |
| **Next Episode / Up Next** | CSS | **LOW** | Restyling `.upNextContainer` preserves the Jellyfin autoplay countdown logic. |
| **DOM / Class Injection (if needed)** | JS | **MEDIUM** | If CSS is insufficient for specific micro-interactions (e.g., adding a specific wrapper class to `.videoOsdBottom`), we will inject it carefully via `MoonviewShellManager` or a dedicated player hook, avoiding edits to `index.js`. |
| **Modifying `video/index.js`** | JS | **HIGH** | We will AVOID modifying `src/controllers/playback/video/index.js` unless there is a critical functional requirement (e.g., stopping an aggressive default timeout that breaks our CSS fade). |

## Core Principle
Prefer CSS and isolated Moonview wrappers over deep player-controller rewrites.
