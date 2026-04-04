# Bug Ticket: MatchReveal.tsx Framework Mismatch
**Assignee:** Green Lantern
**Severity:** CRITICAL
**File:** `/app/workspace/projects/Versa/src/frontend/src/components/MatchReveal.tsx`

## Description
The component was written using React Native primitives (`View`, `Text`, etc.) instead of standard React web elements for a Vite web environment. This fundamentally breaks the web build.

## Required Action
Rewrite the component using standard React web elements (HTML DOM elements) so it can be integrated into the existing Vite toolchain.