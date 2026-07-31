---
name: Protected content links
description: Student-facing routes must never expose raw external file URLs — use the internal /api/files proxy paths.
---

# Protected content links

Rule: any student-facing API response that references a PDF/document stored as an external link (Google Drive etc.) must return the internal protected path (`/api/files/<kind>/<id>`, auth-required proxy) instead of the raw external URL. YouTube videos are played only via the hardened in-app player (youtube-nocookie embed + click shields), never opened externally.

**Why:** The owner requires content to be viewable only inside the app; leaked external links let students download/share files outside it. Full screenshot/recording prevention is impossible on the web — owner accepted best-effort hardening only.

**How to apply:** When adding new student-facing content types with file links, add the kind to the secure-files proxy route and return `internalFilePath(kind, id)` in the response. Video URLs must also be masked server-side (`maskVideoUrl`): YouTube → contained nocookie embed URL, anything else → proxy path. The proxy enforces an SSRF policy (HTTPS only, no IP literals/ports/credentials, DNS checked against private ranges, bounded re-validated redirects) — keep it when extending. Admin routes keep raw links (admins edit them). Frontend viewers: internal PDF iframe with `#toolbar=0&navpanes=0`, no external-open buttons, context menu/selection disabled; videos via the shared SecureVideoPlayer component.
