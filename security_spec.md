# Security Specification: Newsletter Subscriptions & Hardened Rules

## 1. Data Invariants
- **Duplicate Prevention**: Email address acts as the document ID in `/newsletterSubscribers/{email}` to programmatically prevent duplicates at the database level.
- **Identity Integrity**: Guests can create their own subscription (`create`) or check their own status (`get`), but are strictly forbidden from querying (`list`), deleting (`delete`), or updating (`update`) other users' subscription documents.
- **Field Type Constraints**: Subscriptions must contain only validated fields: `email` (string, max 128 characters), `createdAt` (string), `status` (string, "active" or "disabled"), `source` (string, "homepage", "footer", "popup", or "banner"), `device` (string, "desktop" or "mobile"), and `lastUpdated` (string).
- **Temporal Integrity**: All timestamp variables are validated on the client and restricted securely on the database side.

## 2. The "Dirty Dozen" Malicious Payloads
Here are the 12 malicious payloads designed to bypass rules, and how they are safely rejected:

| # | Attack / Payload Description | Target Collection | Expected Result | Mitigation Strategy |
|---|-----------------------------|-------------------|-----------------|---------------------|
| 1 | Setting custom admin flag in `newsletterSubscribers` | `newsletterSubscribers` | `PERMISSION_DENIED` | Rules strictly disallow update operations to standard users. |
| 2 | Injecting a 2MB string into `email` field | `newsletterSubscribers` | `PERMISSION_DENIED` | `isValidSubscriber()` checks email size <= 128 characters. |
| 3 | Query scraping (`list`) all subscriber emails | `newsletterSubscribers` | `PERMISSION_DENIED` | `allow list` is restricted strictly to `isAdmin()`. |
| 4 | Deleting someone else's newsletter subscription | `newsletterSubscribers` | `PERMISSION_DENIED` | `allow delete` is restricted strictly to `isAdmin()`. |
| 5 | Setting `status` to an invalid value (e.g., `gold_member`) | `newsletterSubscribers` | `PERMISSION_DENIED` | `status` validated to match an enum constraint of `['active', 'disabled']`. |
| 6 | Bypassing `createdAt` server time checks | `newsletterSubscribers` | `PERMISSION_DENIED` | Rules validate `createdAt` structure and formatting. |
| 7 | Overwriting existing active subscription with garbage data | `newsletterSubscribers` | `PERMISSION_DENIED` | `allow update` restricted to `isAdmin()`. |
| 8 | Spoofing subscriber `source` as `admin_panel` | `newsletterSubscribers` | `PERMISSION_DENIED` | `source` field must belong to predefined allowed sources. |
| 9 | Attempting to update `email` of a subscriber | `newsletterSubscribers` | `PERMISSION_DENIED` | Key is immutable as it's the document ID, and updates are admin-only. |
| 10| Injecting a script tag `<script>` into the browser/device info | `newsletterSubscribers` | `PERMISSION_DENIED` | HTML sanitization applied on client-side and checked for length limits in rules. |
| 11| Listing all click logs to gather user tracking data | `clicks` | `PERMISSION_DENIED` | `allow list` is restricted strictly to `isAdmin()`. |
| 12| Accessing user profiles of other customers | `users` | `PERMISSION_DENIED` | Reads restricted to `request.auth.uid == userId` or `isAdmin()`. |

## 3. Test Runner Design
A formal verification of the above security boundaries is embedded in the Firestore rules, verified through administrative dashboard testing and local mock dry-runs.
