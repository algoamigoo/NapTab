document.addEventListener("DOMContentLoaded", () => {
  // Load settings
  chrome.storage.sync.get(["capacity", "whitelist"], (result) => {
    document.getElementById("capacity").value = result.capacity || 10;
    const whitelist = result.whitelist || [];
    const whitelistUl = document.getElementById("whitelist");
    whitelist.forEach((url) => addWhitelistItem(url, whitelist, whitelistUl));
  });
  // Load saved theme
  chrome.storage.sync.get("theme", (result) => {
    const theme = result.theme || "light";
    document.body.className = theme;
  });

  // Theme toggle button
  document.getElementById("themeToggle").addEventListener("click", () => {
    const isLight = document.body.classList.contains("light");
    const newTheme = isLight ? "dark" : "light";
    document.body.className = newTheme;
    chrome.storage.sync.set({ theme: newTheme });
  });
  // Save capacity
  document.getElementById("saveCapacity").addEventListener("click", () => {
    const capacity = parseInt(document.getElementById("capacity").value);
    if (capacity > 0) {
      chrome.runtime.sendMessage({ type: "updateCapacity", capacity });
    }
  });

  // Add to whitelist
  document.getElementById("addWhitelist").addEventListener("click", () => {
    const url = document.getElementById("newWhitelist").value.trim();
    if (url) {
      chrome.storage.sync.get("whitelist", (result) => {
        const whitelist = result.whitelist || [];
        if (!whitelist.includes(url)) {
          whitelist.push(url);
          chrome.runtime.sendMessage({ type: "updateWhitelist", whitelist });
          addWhitelistItem(
            url,
            whitelist,
            document.getElementById("whitelist")
          );
          document.getElementById("newWhitelist").value = "";
        }
      });
    }
  });

  // Display tab states
  chrome.storage.local.get("tabStates", (result) => {
    const tabStates = result.tabStates || [];
    const activeUl = document.getElementById("activeTabs");
    const sleepingUl = document.getElementById("sleepingTabs");

    tabStates.forEach((tab) => {
      const li = document.createElement("li");
      li.textContent = tab.title;
      if (tab.isActive) {
        activeUl.appendChild(li);
      } else if (tab.isDiscarded) {
        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.addEventListener("click", () => {
          chrome.tabs.update(tab.id, { active: true });
        });
        li.appendChild(restoreBtn);
        sleepingUl.appendChild(li);
      }
    });
  });
});

function addWhitelistItem(url, whitelist, whitelistUl) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = url;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    whitelist.splice(whitelist.indexOf(url), 1);
    chrome.runtime.sendMessage({ type: "updateWhitelist", whitelist });
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(removeBtn);
  whitelistUl.appendChild(li);
}
