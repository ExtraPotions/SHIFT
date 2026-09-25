# Network Inventory

SHIFT `3.0.0` is offline by default. One opt-in metadata request is supported.

| Destination | Purpose | Status |
|---|---|---|
| `https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest` | Compare the latest release tag after quiet update notifications are explicitly enabled; cached/backed off to once daily | Disabled by default; metadata only |

Normal websites continue making their own requests. SHIFT neither proxies nor records them. No fetch, beacon, WebSocket, EventSource, remote import, or `@require` behavior exists. Userscript-manager update/download metadata points only to the published `shift.user.js` release asset.
