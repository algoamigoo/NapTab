# 💤 NapTab  
*Put your tabs to sleep — not your computer.*

A high-performance Chrome extension that auto-suspends inactive tabs using a blazing-fast **C++ LRU cache** compiled to **WebAssembly** — freeing up your memory without sacrificing control.

---

## 🧠 Why NapTab?

Modern browsing = 20+ tabs, sluggish Chrome, drained memory.  
**NapTab** brings order to the chaos — automatically "napping" tabs you haven’t used recently, keeping your workflow snappy and your RAM breathing easy.

---

## ⚡ Built Different

- 💻 **C++ + WebAssembly Core** for ultra-fast memory logic  
- 🚀 **LRU-based suspension** in O(1) time  
- 📊 **Live dashboard** to track, suspend, or restore tabs  
- 🧘 100% privacy-respecting — no data tracking, ever

---

## ✨ Features

### 🌙 Smart Auto-Nap
Suspends **least recently used** tabs when your open tab count exceeds a limit (default: **10**).

### 🛡️ Whitelist Essentials
Add important URLs (e.g., Spotify, Docs) to your whitelist — they’ll always stay awake.

### 📋 NapTab Dashboard
View what's active, what's napping, and bring any tab back with one click.

### 🧠 Intelligent Tab Tracking
Leverages Chrome APIs + custom LRU logic for seamless tab management.

---

## 🎯 Who Should Use NapTab?

- 👨‍💻 Developers juggling dozens of tabs  
- 📚 Students deep in research rabbit holes  
- 🔬 Productivity pros who hate sluggish browsers  
- 🧠 Anyone who wants **Chrome, but smarter**

* * * * *

🛠️ Installation
----------------

### Prerequisites

-   **Chrome v54+**

-   **Emscripten SDK** (for compiling C++ → WebAssembly)

### Setup Project

```
naptab/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── style.css
├── lru.cpp
├── lru.js
├── lru.wasm
```


### Compile WebAssembly

```bash
emcc lru.cpp -s WASM=1 \
-s EXPORTED_FUNCTIONS="['_initCache','_useTab','_removeTab','_getActiveTabsCount','_getActiveTabs','_isTabInCache','_malloc','_free']" \
-s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','getValue']" \
-s ALLOW_MEMORY_GROWTH=1 -o lru.js
```

### Load Into Chrome

1.  Go to `chrome://extensions/`

2.  Enable **Developer mode**

3.  Click **Load unpacked** and select your `naptab/` directory

* * * * *

🧪 How to Use NapTab
--------------------

1.  **Click the NapTab icon** in the toolbar

2.  **Set your active tab limit** (default: 10)

3.  **Whitelist important URLs** to keep them always awake

4.  **Browse freely** --- NapTab handles the rest

5.  **Restore tabs** anytime from the dashboard

* * * * *

🐞 Debugging & Tips
-------------------

-   Open Chrome Extension Console → Service Worker Logs

-   Watch for:\
    ✅ `"WebAssembly module initialized"`\
    ❌ `"Failed to discard tab"` -- check whitelist or permissions

* * * * *

🧬 Tech Stack
-------------

-   **C++ + WebAssembly** for high-speed memory handling

-   **Chrome Tabs API** for tab control

-   **Chrome Storage API** for settings + whitelists

-   **Manifest V3** for efficient background execution

* * * * *
☕ Support the Project
If NapTab made your Chrome faster, consider supporting with a coffee:

[[Buy Me a Coffee](https://buymeacoffee.com/itsrudrajaw)
Author
Rudra Jani
@algoamigoo

🚀 Check it out on the Chrome Web Store (coming soon)
💬 💬 Have suggestions? [Open an issue](https://github.com/yourusername/naptab/issues)
