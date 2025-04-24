💤 NapTab
=========

**Put your tabs to sleep, not your computer.**\
A smart Chrome extension that auto-suspends inactive tabs to free up memory --- powered by WebAssembly for maximum performance.

* * * * *

🧠 Why NapTab?
--------------

Modern browsing is a mess of open tabs and sluggish performance. **NapTab** brings peace to your browser by automatically "napping" tabs you haven't used in a while.

⚡ Built for speed\
💻 Powered by C++ + WebAssembly\
📊 Fully transparent with a real-time tab dashboard

* * * * *

✨ Key Features
--------------

-   **🌙 Auto Nap Tabs**\
    Suspends the least recently used tabs once your open tabs exceed the limit (default: 10).

-   **🛑 Whitelist Support**\
    Keep your essentials (e.g., Spotify, work docs) always awake.

-   **📋 NapTab Dashboard**\
    See what's active, what's sleeping, and restore tabs in a click.

-   **🚀 High-Performance Core**\
    LRU cache logic in C++ compiled to WebAssembly for O(1) speed.

-   **🔄 Real-Time Monitoring**\
    Seamless tab tracking via Chrome APIs.

* * * * *

🎯 Who It's For
---------------

-   🧑‍💻 Developers with tab overload

-   📚 Students doing deep research

-   🧠 Productivity geeks

-   💡 Anyone who wants Chrome to stop eating RAM

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

🛠️ Roadmap
-----------

-   🧾 Memory usage stats per tab

-   ⭐ Regex & wildcard whitelist support

-   🔁 "Restore All" tabs button

-   💡 Smarter suspension based on tab memory usage
