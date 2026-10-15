# Network Inventory

SHIFT `3.0.0` makes one metadata request, for update notifications. It is on by default for new installs and can be turned off.

| Destination | Purpose | Status |
|---|---|---|
| `https://api.github.com/repos/ExtraPotions/SHIFT/releases/latest` | Compare the latest release tag while quiet update notifications are enabled; cached/backed off to at most every 12 hours | Enabled by default for new installs, user can disable; metadata only; never installs automatically |

Normal websites continue making their own requests. SHIFT neither proxies nor records them. No fetch, beacon, WebSocket, EventSource, remote import, or `@require` behavior exists. Userscript-manager update/download metadata points only to the published `shift.user.js` release asset.
