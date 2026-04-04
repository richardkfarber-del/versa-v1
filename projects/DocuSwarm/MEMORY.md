### Application File Locations

- **Versa App Root Workspace:** `/app/workspace/Versa/`
- **Frontend Files (Markdown, Images, Designs, Code):**
  - Location: `/app/workspace/Versa/frontend/`
  - Examples: `payment_ui.html`, `payment_styles.css`, `payment_flow.js`
- **Backend Files:**
  - Location: `/app/workspace/Versa/backend/`
  - Examples: `server.js`
- **Root Configuration Files:**
  - Location: `/app/workspace/Versa/`
  - Examples: `package.json`
- **Documentation & Reports:**
  - Location: `/app/workspace/Versa/documentation/` (with subdirectories for security_reviews, deployment_reports, legal_and_security_audits, qa_reports/phase3_testing/, qa_reports/security_fixes/)

### Agent-Specific Memory Directives

- **Oracle's Project Plan & Backlog Tickets:** Oracle must retain and remember the location of her project plan and backlog tickets to prevent duplicate work.
- **Critical Directive: Versa Workspace Adherence:** All agents (Green Lantern, Lucius, Oracle, Victor) **MUST** strictly adhere to saving all Versa app-related files within `/app/workspace/Versa/`. They must also consistently utilize the established Versa app's "look and feel" for all designs and implementations.
- **Strategic Design Oversight (Green Lantern):** Master Wayne has noted inconsistencies in Green Lantern's design output with the established Versa app "look and feel." For future design tasks requiring strict aesthetic alignment, an external application will be used for "facelifts" to ensure consistency. Green Lantern's designs will be subject to this external review.
- **Model Allocation Protocols:**
  - **Alfred & Cyborg:** Utilize native Gemini Model.
  - **Lucius & Green Lantern:** Utilize local Llama Models.
- **Deployment & File Path Vigilance:** All agents are to exercise extreme vigilance regarding file paths during deployment and development. Verify existence before assuming, and always save to the explicitly designated workspace `/app/workspace/Versa/`.
- **Formalized Fix/Change Process:** For all bug fixes or changes, Alfred **MUST** proactively suggest/ensure Oracle writes a detailed ticket with clear requirements, and Cyborg validates the changes with clear test cases *before* any deployment attempts. Documentation and clear test cases are paramount.
