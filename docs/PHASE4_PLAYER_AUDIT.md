# Phase 4 Player Audit

This audit examines the Jellyfin Web player architecture to determine how to apply the Moonview interaction and visual polish without rewriting the core playback engine.

## Core Files Audited

| Component / Area | File(s) | Purpose | Strategy | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Video OSD Layout** | `src/controllers/playback/video/index.html` | Defines the DOM structure for the video on-screen display (OSD), including transport controls, seek bar, and menus. | **Restyle**. We will heavily target the existing classes (`osdControls`, `sliderContainer`, `btnPause`) using CSS to transform them into the Moonview layout. | **Low** |
| **Video Controller** | `src/controllers/playback/video/index.js` | Manages player state, bindings, overlay timeout, format selection, and subtitle/audio menu interactions. | **Wrap / CSS**. Avoid modifying the controller logic unless we need to inject a specific class or DOM hook for animations. | **High** |
| **OSD Stylesheet** | `src/styles/videoosd.scss` | Contains the default Jellyfin player styles (transparency, absolute positioning). | **Override**. We will create a new `moonview-player.scss` (or component specific files) to override these safely. | **Low** |
| **Up Next Flow** | `.upNextContainer` in `index.html` | Container for the Next Episode overlay. | **Restyle**. We will style the injected next episode card to match Moonview's clean, premium look. | **Low** |
| **Settings Menus** | Rendered via dialogs / action sheets | Handles Quality, Audio, Subtitle selection. | **Restyle**. Target the generic `actionSheet` or dialog classes when they are invoked from the video player. | **Medium** |
| **Sliders / Seek** | `input[is="emby-slider"]` | The native input range sliders for progress and volume. | **Restyle**. Apply Moonview violet/blue accent colors and custom thumb styling using CSS pseudo-elements. | **Low** |

## Implementation Strategy Summary
Following the **CORE RULE** (Polish the experience, do not rebuild the engine), our strategy is 95% CSS-driven. We will introduce `src/styles/moonview-player.scss` (or similar structural overrides) that target the existing `#videoOsdPage` and its children. We will ensure the background gradients, button sizes, icons, and focus states match the Moonview palette without altering the underlying JavaScript event listeners or Web Audio/Media APIs.
