# Data Weave Dashboard UI - Tablet Layout Mockups (Material Design 3)

This document describes the responsive tablet layout for the Data Weave Dashboard UI, adapting from the mobile layout. The design adheres to Google Material Design 3 principles, focusing on usability and information hierarchy on medium-sized screens.

## Screen Dimensions
*   Typical tablet portrait (e.g., 768px - 834px width)
*   Typical tablet landscape (e.g., 1024px - 1194px width)

## Layout Components Adaptation

### 1. Left Sidebar (Navigation)
*   **Behavior:** On tablet screens, the left sidebar transitions from an overlay/drawer on mobile to a persistently visible, collapsible panel.
    *   **Portrait Mode:** The sidebar can be set to a compact "mini-variant" (e.g., 56-72px wide) showing only icons and expanding on hover/click to reveal labels (e.g., 256px wide). Alternatively, it could be fully hidden with a prominent "hamburger" menu icon to toggle it open as an overlay, similar to mobile but with a wider panel.
    *   **Landscape Mode:** The sidebar is typically fully expanded (e.g., 256px wide) showing both icons and labels, persistently visible on the left side of the screen. It should remain collapsible for user preference.
*   **Content:** Contains primary navigation items (e.g., Dashboard, Connections, Transformations, Settings) with clear labels and icons.

### 2. Main Canvas Area (Data Flow Editor)
*   **Behavior:** The main canvas is the primary interactive area.
    *   **Portrait Mode:** The canvas expands to fill the remaining horizontal space next to the (potentially collapsed or hidden) left sidebar. Vertical scrolling will be enabled for larger data flows. Pinch-to-zoom and pan gestures are critical for navigation.
    *   **Landscape Mode:** The canvas takes up the majority of the screen real estate, optimizing for a wider view of data connections and transformations. It dynamically adjusts its width based on the state of the left sidebar and the right transformation drawer.
*   **Interaction:** Drag-and-drop for nodes, node selection, contextual menus on nodes/connections, and a clear grid or layout system for organizing elements.

### 3. Right Transformation Drawer (Properties/Details Panel)
*   **Behavior:** This drawer provides details and configuration for selected nodes or connections.
    *   **Portrait Mode:** Similar to the mobile layout, the right drawer should primarily function as an overlay/modal, sliding in from the right edge when a node or connection is selected. It should cover a significant portion of the screen (e.g., 70-80% of width) but allow the user to still see a glimpse of the canvas behind it.
    *   **Landscape Mode:** The right drawer can be persistent or semi-persistent. It can slide out from the right, taking up a fixed width (e.g., 300-400px) and pushing the main canvas to the left. It should also have a clear close button and potentially a pin/unpin option to toggle its persistent state.
*   **Content:** Displays properties, settings, and transformation options relevant to the selected item.

## Material Design 3 Considerations
*   **Adaptive Layout:** Uses flexible grids, breakpoints, and dynamic spacing to ensure elements scale appropriately.
*   **Dynamic Color:** Application of color schemes that adapt to user preferences and brand.
*   **Large Screens Best Practices:** Prioritizes content density and efficient use of space without feeling cluttered. Interaction elements should be comfortably reachable.
*   **Gestural Navigation:** Optimized for touch input, including gestures for scrolling, zooming, and drawer manipulation.

This tablet layout ensures a consistent yet optimized experience across medium-sized devices, building upon the mobile design principles while leveraging the increased screen real estate.