importScripts("lru.js");

let cacheCapacity = 10; // Default max active non-whitelisted tabs
let whitelist = new Set(); // Whitelisted URLs

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(["capacity", "whitelist"], (result) => {
    if (result.capacity) cacheCapacity = result.capacity;
    if (result.whitelist) whitelist = new Set(result.whitelist);
    if (typeof Module._initCache === "function") {
      Module._initCache(cacheCapacity);
      initializeCache();
    } else {
      console.error(
        "WebAssembly module not initialized: _initCache unavailable"
      );
    }
  });
}

// Initialize cache with existing tabs
function initializeCache() {
  chrome.tabs.query({}, (tabs) => {
    tabs.sort((a, b) => a.id - b.id); // Sort by ID for consistency
    let count = 0;
    for (let tab of tabs) {
      if (!whitelist.has(tab.url) && count < cacheCapacity) {
        if (typeof Module._useTab === "function") {
          Module._useTab(tab.id);
          count++;
        }
      }
    }
    checkAndDiscard();
  });
}

Module.onRuntimeInitialized = () => {
  console.log("WebAssembly module initialized");
  loadSettings();

  // Tab activation
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (!tab.url || whitelist.has(tab.url)) return;
      if (typeof Module._useTab === "function") {
        const evicted = Module._useTab(tab.id);
        if (evicted !== -1) {
          chrome.tabs.discard(evicted, () => {
            if (chrome.runtime.lastError) {
              console.warn(
                `Failed to discard tab ${evicted}:`,
                chrome.runtime.lastError.message
              );
            }
          });
        }
      }
      checkAndDiscard();
    });
  });

  // Tab creation
  chrome.tabs.onCreated.addListener((tab) => {
    if (!tab.url || whitelist.has(tab.url)) return;
    if (typeof Module._useTab === "function") {
      const evicted = Module._useTab(tab.id);
      if (evicted !== -1) {
        chrome.tabs.discard(evicted, () => {
          if (chrome.runtime.lastError) {
            console.warn(
              `Failed to discard tab ${evicted}:`,
              chrome.runtime.lastError.message
            );
          }
        });
      }
    }
    checkAndDiscard();
  });

  // Tab removal
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (typeof Module._removeTab === "function") {
      Module._removeTab(tabId);
    }
    checkAndDiscard();
  });
};

// Check and discard inactive tabs
function checkAndDiscard() {
  chrome.tabs.query({}, (tabs) => {
    const activeTabs = getActiveTabs();
    const tabStates = tabs.map((tab) => ({
      id: tab.id,
      url: tab.url || "",
      title: tab.title || tab.url || "Untitled",
      isActive: whitelist.has(tab.url) || activeTabs.includes(tab.id),
      isDiscarded: tab.discarded,
    }));

    // Update storage with current tab states
    chrome.storage.local.set({ tabStates });

    // Discard inactive non-whitelisted tabs
    for (let tab of tabs) {
      if (!tab.url || whitelist.has(tab.url) || activeTabs.includes(tab.id))
        continue;
      chrome.tabs.discard(tab.id, () => {
        if (chrome.runtime.lastError) {
          console.warn(
            `Failed to discard tab ${tab.id}:`,
            chrome.runtime.lastError.message
          );
        }
      });
    }
  });
}

// Get active tabs from WASM
function getActiveTabs() {
  if (
    typeof Module._getActiveTabsCount !== "function" ||
    typeof Module._getActiveTabs !== "function" ||
    typeof Module._malloc !== "function" ||
    typeof Module._free !== "function" ||
    typeof Module.getValue !== "function"
  ) {
    console.error("WebAssembly functions unavailable");
    return [];
  }

  try {
    const count = Module._getActiveTabsCount();
    if (count <= 0) return [];

    const buffer = Module._malloc(count * 4); // 4 bytes per int32
    try {
      Module._getActiveTabs(buffer);
      const activeTabs = [];
      for (let i = 0; i < count; i++) {
        activeTabs.push(Module.getValue(buffer + i * 4, "i32"));
      }
      return activeTabs;
    } finally {
      Module._free(buffer);
    }
  } catch (error) {
    console.error("Failed to get active tabs from WebAssembly:", error);
    return [];
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateCapacity") {
    cacheCapacity = message.capacity;
    chrome.storage.sync.set({ capacity: cacheCapacity });
    if (typeof Module._initCache === "function") {
      Module._initCache(cacheCapacity);
      initializeCache();
    }
  } else if (message.type === "updateWhitelist") {
    whitelist = new Set(message.whitelist);
    chrome.storage.sync.set({ whitelist: Array.from(whitelist) });
    if (typeof Module._initCache === "function") {
      Module._initCache(cacheCapacity);
      initializeCache();
    }
  }
});
