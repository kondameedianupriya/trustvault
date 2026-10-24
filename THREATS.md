# THREATS.md — Threat Modeling & Security Controls

**Candidate Name:** Kondameedi Anupriya  
**Candidate ID:** 23jk1a4208  
**Project:** TrustVault — Secure Document Sharing with a Real Audit Trail  
**Event:** Snovasys Hiring Challenge 2026  

---

## 1. Threat Analysis & Security Safeguards

| Threat Vector | Risk Description | Severity | Implemented Mitigation in TrustVault | Verification Method |
| :--- | :--- | :---: | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | An unauthorized user attempts to access or download another user's private file by knowing or guessing the document identifier. | **CRITICAL** | Zero-Trust verification: Access is determined strictly by evaluating the user's explicit permissions (`OWNER`, `EDIT`, or `READ`). If no permission exists, the action is blocked. | Tested via the `No Access (Test)` button under the `Viewer` role. The request is denied with a security alert. |
| **Privilege Escalation** | A standard Viewer attempts to upload new files or grant permissions to others. | **HIGH** | Role boundaries are strictly enforced. The `+ Upload Document` and `Share` actions are restricted to Document Owners and Admins only. | Verified that switching to `Viewer` disables the upload trigger and hides share actions. |
| **Audit Trail Tampering** | A malicious user attempts to wipe or manipulate records of unauthorized access to hide their activity. | **HIGH** | The audit log is structured as an append-only store. No update or delete operations are exposed to the UI or client logic. | Inspected state mutations to confirm logs only support prepend/insert actions. |
| **Data Leakage via Direct Sharing** | An owner unintentionally grants permanent public access to an external party. | **MEDIUM** | Granular permissions: Access can be granted with explicit levels (`READ` or `EDIT`) and can be immediately revoked at any time by the owner. | Tested granting access to `viewer@company.com` and subsequently revoking it via the `Revoke` button. |
| **Silent Security Breaches** | Unauthorized attempts go unnoticed by security administrators. | **MEDIUM** | Every denied download attempt automatically triggers an `UNAUTHORIZED_DOWNLOAD_ATTEMPT` event recorded with status `DENIED`. | Verified that rejected attempts immediately display in red on the `Security Audit Trail` table. |

---

## 2. Limitations & Production Hardening Roadmap
- **Server-Side File Encryption:** In a full enterprise production environment, files stored at rest should be encrypted using AES-256 with KMS-managed keys.
- **Cryptographic Log Hashing:** Audit records could be chained using SHA-256 hash pointers (Merkle tree) to guarantee mathematical tamper-proofing.
- **Signed Short-Lived URLs:** Document downloads in production should be served via presigned URLs with strict 60-second expiration windows.