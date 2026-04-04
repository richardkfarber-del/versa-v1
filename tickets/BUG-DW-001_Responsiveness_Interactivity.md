Bug Title: Data Weave Dashboard: Critical Responsiveness & Interactivity Issues
Severity: High
Assignee (for fix): Lucius
Design Input Provided: Yes (by Green Lantern, see responsive mockups and interaction specs in `/app/workspace/Versa/Stitch_Data_Weave_Responsive_UI/`)
Affected Files:
*   /app/workspace/Versa/data-weave-dashboard.html
*   /app/workspace/Versa/data-weave-dashboard.css
*   (New) /app/workspace/Versa/data-weave-dashboard.js (for interactivity)

Description of Issues (from Cyborg's QA Report):
1.  Critical Issue: Lack of Responsiveness. The dashboard currently lacks comprehensive media queries, leading to significant layout breakage and horizontal scrolling on smaller viewports. Fixed widths applied to the sidebar and right drawer are problematic.
2.  Functional Issue: Lack of Interactivity. The UI is designed for interactivity (draggable nodes, toggleable right drawer), but the provided HTML and CSS are purely static. Drag-and-drop is not functional without JavaScript. The transformation drawer cannot be opened/closed.
3.  Functional Issue: Empty Dynamic Content. The `.drawer-content` area within the transformation drawer is empty, expecting dynamic content to be loaded. This will appear as a blank panel until JavaScript is implemented.
4.  Code Quality Issue: Embedded Styles. All significant CSS rules are embedded directly within the HTML's `<style>` tags. This is not a best practice for maintainability, code organization, and caching benefits, and should be refactored to the external `data-weave-dashboard.css` file.