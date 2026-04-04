# Bug Report: Versa Branding Asset Issue

**Status:** Open
**Severity:** Medium
**Component:** Frontend (Branding)
**Reporter:** Oracle Subagent

## Description
The current frontend implementation in `login.html` and `signup.html` uses external placeholder URLs for the company logo instead of the official local asset. While a local path is referenced, it currently points to `/frontend/company_logo.png`, which may resolve incorrectly depending on the hosting environment (e.g., if the root is `/app/workspace/frontend/`).

## Current Implementation
```html
<img alt="Versa Logo" class="h-12 mx-auto mb-6 drop-shadow-2xl" 
     src="/frontend/company_logo.png" 
     onerror="this.src='https://lh3.googleusercontent.com/aida-public/...'"/>
```

## Problem
1. **Placeholder Dependency:** The `onerror` fallback points to a Google UserContent URL which is not part of the official brand system.
2. **Pathing Risk:** The absolute path `/frontend/company_logo.png` might fail if the site is served from the `frontend` directory itself.

## Requirements
1. Update `login.html` and `signup.html` to use a relative path for the local `company_logo.png`.
2. Ensure the fallback (`onerror`) is either removed or points to a brand-approved backup system (e.g., a CDN-hosted version of the official logo, not a placeholder).
3. The local asset `company_logo.png` (present in `/app/workspace/frontend/`) must be the primary source.

## Proposed Fix
Change:
```html
src="/frontend/company_logo.png"
```
To:
```html
src="company_logo.png"
```
And verify the fallback strategy aligns with Versa's brand guidelines.
