# **Hosteva Project Blueprint & Swarm Briefing**

**Project Name:** Hosteva

**Mission:** "Hosting Compliance, Simplified". **Platform Type:** Responsive Web Application and Mobile App.

## **1\. Project Overview**

Hosteva is an end-to-end AI ecosystem and property management software designed to simplify short-term rental (STR) compliance for property owners and investors. The platform solves the highly fragmented regulatory environment by automating compliance checklists, reviewing documentation via AI, and providing a unified operational hub to manage listings, calendars, and guest communications across multiple Online Travel Agencies (OTAs). The MVP is initially focused on the Florida market, automating state (DBPR), county, and municipal requirements.

## **2\. Design & UI/UX Guidelines (For Design Agent)**

The design must evoke security, professionalism, and trust.

* **Logo:** A shield icon concept.  
* **Typography:** 'Inter' font family for a modern, clean interface.  
* **Color Palette:**  
  * **Primary (Deep Navy):** \#113274.  
  * **Secondary/Action Buttons (Vibrant Teal):** \#2BB79A.  
  * **Headers (Midnight Blue):** \#0A2540.  
  * **Accents/Icons (Soft Teal):** \#55DDA4.  
  * **Backgrounds/Borders (Cloud White / Light Gray):** \#E5BEF0 / \#E8EEF0.

## **3\. Technical Architecture (For Developer Agent)**

* **Workspace Environment:** The application must be containerized. All project files and directories are contained exclusively within the /app/workspace/Hosteva directory.  
* **Backend:** A Python backend application utilizing the Flask or FastAPI framework to expose RESTful API endpoints.  
* **Database:** A local SQLite database (hosteva.db) for initial MVP data storage.  
* **Frontend:** A responsive front-end web interface using a modern CSS framework via CDN (Tailwind CSS or Bootstrap). The UI will use vanilla JavaScript to execute API fetch calls.  
* **Core Data Models:** \* *Host:* Unique ID, full name, email address, and account creation date.  
  * *Property:* Unique ID, relational link to Host ID, title, description, nightly rate, maximum guest capacity, physical location, property type (Condo vs. Single-Family), and HOA status.  
* **Key Integrations:** Google Maps API for address validation, Stripe for billing, AI logic for Optical Character Recognition (OCR) document review, and direct API connections to Airbnb, Vrbo, and https://www.google.com/url?sa=E\&source=gmail\&q=Booking.com.

## **4\. Feature Specifications & User Stories (For PO Agent)**

### **Module 1: Public Site & Onboarding**

* **Landing Page:** A hero section featuring a "Check My Property" CTA, pricing tiers, and an interactive "Revenue Estimator" widget that provides a quick snapshot of STR legality and estimated annual revenue.  
* **Authentication & Settings:** Secure account creation via Email, Google, or Apple SSO. Users can manage Stripe billing and invite co-hosts or cleaners with restricted, role-based access.  
* **"Add Property" Wizard:** A guided, multi-step flow where users input an address for Google Maps validation. The system triggers a Zoning Auto-Reject to halt the wizard if the property is in a strictly prohibited STR zone. Users select property types and toggle HOA status, prompting the AI Compliance Engine to build a custom checklist.

### **Module 2: Property Compliance Hub**

* **Dynamic Checklist Engine:** Generates categorized checklists for State, County, and Municipal requirements based on the exact property location.  
* **AI Document Auditor:** Users upload required PDFs and images (e.g., DBPR licenses, HOA approvals) into Document Upload Zones. The AI Document Review processes the files using OCR to verify accuracy, flagging them as "Approved" or "Rejected" with specific reasoning (e.g., missing signatures).  
* **Manual Application Redirects:** The app provides direct out-links to the exact state or county application portals once all preliminary documents are AI-verified.

### **Module 3: Content Generation & Syndication**

* **AI Media Studio:** Hosts upload a photo gallery to the AI Photo Enhancer, which utilizes a before/after slider for lighting and wide-angle correction. An AI Description Generator outputs SEO-optimized titles and descriptions tailored to specific OTA character limits.  
* **1-Click Channel Manager:** Hosts maintain a Universal Property Profile. Once the property achieves a 100% compliance score, the "1-Click Post" CTA unlocks, syndicating the compliant listing directly to Airbnb, Vrbo, and https://www.google.com/url?sa=E\&source=gmail\&q=Booking.com.

### **Module 4: The Operational Hub**

* **Main Host Dashboard:** Features repeating cards for a high-level overview of all properties, at-a-glance compliance scores, revenue snapshots, and an Active Alerts section for AI-prioritized tasks.  
* **Unified Multi-Calendar:** A master calendar view combining reservations from all connected OTAs. It features visual color-coding by platform and completely prevents double-booking.  
* **Unified AI Inbox:** Aggregates guest communications from all platforms into a single chat interface. The AI analyzes incoming questions and drafts suggested replies based on property house rules for a seamless "Approve & Send" workflow.  
* **Financials & Tax Tracking:** Total revenue charts broken down by OTA, alongside an Estimated Tax Liability tracker that displays amounts owed to specific jurisdictions.

### **Module 5: Admin Portal (Internal Tool)**

* **Jurisdiction Manager:** An interface for admins to add, edit, or deactivate State, County, and City compliance rules.  
* **Zip Code Mapping Tool:** Allows admins to assign specific zip codes to municipal rules, ensuring the compliance generation engine remains accurate.

