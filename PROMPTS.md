# PROMPTS.md — AI Engineering & Review Log

**Candidate Name:** Kondameedi Anupriya  
**Candidate ID:** 23jk1a4208  
**Project:** TrustVault — Secure Document Sharing with a Real Audit Trail  
**Event:** Snovasys Hiring Challenge 2026  

---

## 1. Project Implementation Prompts & AI Review

### Prompt 1: Role-Based Access Control & Multi-Role Simulation
- **Purpose:** Create a system with 3 distinct roles: `ADMIN`, `DOCUMENT_OWNER`, and `VIEWER`.
- **AI Suggestion Received:** AI initially suggested showing or hiding UI buttons based on the user's role without verifying permission on the action level.
- **Flaws Identified:** Merely hiding buttons on the frontend is not a security control. If a user inspects the DOM or bypasses the UI, they could still trigger the action.
- **Changes Personally Made:**
  - Implemented an explicit permission verification function (`getUserAccess`) that strictly validates whether `currentUser.id === doc.ownerId` or if a matching record exists in the document's permission table.
  - Added an `Active Role` switcher in the top navigation to allow evaluators to immediately verify that unauthorized actions are blocked.
- **Verification:** Switched to the `Viewer` role and attempted to download an unpermitted document; the application successfully rejected the request and triggered a security alarm.

---

### Prompt 2: Preventing Insecure Direct Object References (IDOR)
- **Purpose:** Prevent unauthorized users from downloading confidential documents (e.g., Executive Salary slips or Master Service Agreements).
- **AI Suggestion Received:** The AI suggested allowing all authenticated users to download any file by simply passing the document ID.
- **Flaws Identified:** This is a classic Insecure Direct Object Reference (IDOR) vulnerability. A viewer could guess or iterate IDs to access files they do not own.
- **Changes Personally Made:**
  - Designed the download handler (`handleDownload`) to enforce Zero-Trust checks.
  - If a user with `NONE` access attempts to download, access is explicitly denied, a red security alert is displayed, and the unauthorized attempt is recorded in the audit trail.
- **Verification:** Clicked the `No Access (Test)` button as a Viewer; the download was blocked and logged as an `UNAUTHORIZED_DOWNLOAD_ATTEMPT`.

---

### Prompt 3: Immutable Append-Only Security Audit Trail
- **Purpose:** Maintain an auditable history of all security-sensitive operations.
- **AI Suggestion Received:** AI provided a standard log update function that replaced previous state entries.
- **Flaws Identified:** Audit logs must be append-only and immutable. Deleting or overwriting existing logs destroys the forensic trail.
- **Changes Personally Made:**
  - Structured the audit logger (`logEvent`) using prepend array spreading (`[newLog, ...prev]`) so newer records sit on top without modifying existing entries.
  - Logged key metadata: timestamp, actor email, security action name, target document, status (`SUCCESS` or `DENIED`), and audit details.
- **Verification:** Verified that every upload, download, share grant, revoke, and denied attempt immediately appears in the `Security Audit Trail` tab.

---

## 2. Summary of AI Tools Used
- **Tools:** ChatGPT & Claude
- **Scope:** Assistance with React state architecture and Tailwind CSS layout design.
- **Candidate Ownership:** Reviewed, verified, and hardened all authorization logic, Zero-Trust controls, and audit event structures.