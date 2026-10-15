# Userscript Permission Inventory

| Metadata entry | Purpose | Required |
|---|---|---|
| `@match http://*/*` | Allow user-selected ordinary HTTP pages to use Generic Mode | Yes for broad Generic Mode |
| `@match https://*/*` | Allow user-selected ordinary HTTPS pages to use Generic Mode | Yes for broad Generic Mode |
| `@run-at document-start` | Mount early and reduce visual flash while keeping Original inert | Yes |
| `@grant GM_getValue` | Read SHIFT settings from userscript-manager storage | Yes |
| `@grant GM_setValue` | Atomically replace validated SHIFT settings | Yes |
| `@grant GM_xmlhttpRequest` | Fetch release metadata only while update notifications are enabled | Yes for the update-notification feature |
| `@connect api.github.com` | Restrict the update metadata request to GitHub's API | Yes for the update-notification feature |

No `@require`, privileged tab, cookie, clipboard, download, or notification permission is declared. Clipboard copying uses the ordinary browser API when available and falls back to a user-visible local copy prompt.
