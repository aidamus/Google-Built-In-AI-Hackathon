// File: popup.js - Domain Whitelist Manager

document.addEventListener("DOMContentLoaded", () => {
  const domainInput = document.getElementById("domainInput");
  const addBtn = document.getElementById("addBtn");
  const currentSiteBtn = document.getElementById("currentSiteBtn");
  const domainList = document.getElementById("domainList");

  // Load and display whitelisted domains
  async function loadDomains() {
    const data = await chrome.storage.local.get("aiWhitelistedDomains");
    const whitelisted = data.aiWhitelistedDomains || [];
    domainList.innerHTML = "";

    if (whitelisted.length === 0) {
      domainList.innerHTML =
        '<p style="color: #999; text-align: center; padding: 20px;">No domains added yet</p>';
      return;
    }

    whitelisted.forEach((domain, index) => {
      const div = document.createElement("div");
      div.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f0f0f0;
        border-radius: 8px;
        margin-bottom: 8px;
      `;

      div.innerHTML = `
        <span style="font-family: monospace; color: #333;">${domain}</span>
        <button style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
      `;

      div.querySelector("button").onclick = async () => {
        whitelisted.splice(index, 1);
        await chrome.storage.local.set({ aiWhitelistedDomains: whitelisted });
        loadDomains();
      };

      domainList.appendChild(div);
    });
  }

  // Add domain
  async function addDomain(domain) {
    domain = domain.trim().toLowerCase();
    if (!domain) {
      alert("Please enter a domain");
      return;
    }

    const data = await chrome.storage.local.get("aiWhitelistedDomains");
    const whitelisted = data.aiWhitelistedDomains || [];

    if (whitelisted.includes(domain)) {
      alert("Domain already added");
      return;
    }

    whitelisted.push(domain);
    await chrome.storage.local.set({ aiWhitelistedDomains: whitelisted });
    domainInput.value = "";
    loadDomains();

    // Refresh current tab to load the extension
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  }

  // Add domain from input
  addBtn.onclick = () => {
    addDomain(domainInput.value);
  };

  domainInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addDomain(domainInput.value);
    }
  });

  // Add current site
  currentSiteBtn.onclick = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      const url = new URL(tab.url);
      const domain = url.hostname;
      addDomain(domain);
    }
  };

  // Force-activate the sidebar for the current article (one-time)
  const forceBtn = document.getElementById("forceActivateBtn");
  if (forceBtn) {
    forceBtn.onclick = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || typeof tab.id === "undefined") {
        alert("No active tab found");
        return;
      }

      // Try sending a message to the content script first
      chrome.tabs.sendMessage(
        tab.id,
        { action: "forceActivateArticle" },
        async (response) => {
          if (chrome.runtime.lastError) {
            // Content script may not be ready – inject it and retry (one-time)
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["contentScript.js"],
              });
              // Retry sending the message
              chrome.tabs.sendMessage(
                tab.id,
                { action: "forceActivateArticle" },
                (resp2) => {
                  if (chrome.runtime.lastError) {
                    alert("Activation failed: content script not reachable.");
                  } else {
                    alert("Sidebar activated for this article.");
                  }
                }
              );
            } catch (e) {
              alert("Activation failed: could not inject content script.");
            }
          } else {
            alert("Sidebar activated for this article.");
          }
        }
      );
    };
  }

  // Initial load
  loadDomains();

  // Settings Modal Logic
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeModal = document.getElementById("closeModal");

  if (settingsBtn && settingsModal && closeModal) {
    // Open modal
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("show");
      // Download button and progress bar logic with flag check
      const downloadBtn = document.querySelector(".btn-download");
      const refreshBtn = document.querySelector(".btn-refresh");
      const progressContainer = document.getElementById(
        "downloadProgressContainer"
      );
      const progressBar = document.getElementById("downloadProgressBar");
      const progressText = document.getElementById("downloadProgressText");
      // Place warning at top of modal-body instead of status-actions
      const modalBody = settingsModal.querySelector(".modal-body");
      // Remove any duplicate/old flag warnings on modal open
      if (modalBody) {
        const oldWarnings = modalBody.querySelectorAll(".flag-warning");
        oldWarnings.forEach((w) => w.remove());
      }
      const statusActions = document.querySelector(".status-actions");

      function showFlagError() {
        if (statusActions) {
          const errorDiv = document.createElement("div");
          errorDiv.style.cssText =
            "color:#ef4444; font-size:14px; margin-top:12px; font-weight:600;";
          errorDiv.textContent =
            "To download the model, enable these Chrome flags:";
          const ul = document.createElement("ul");
          ul.style.cssText =
            "margin:8px 0 0 0; padding-left:18px; color:#ef4444; font-size:13px;";
          [
            "chrome://flags/#prompt-api-for-gemini-nano",
            "chrome://flags/#prompt-api-for-gemini-nano-multimodal-input",
            "chrome://flags/#optimization-guide-on-device-model",
          ].forEach((flag) => {
            const li = document.createElement("li");
            li.textContent = flag;
            ul.appendChild(li);
            // Download button and progress bar logic with flag check
            const downloadBtn = document.querySelector(".btn-download");
            const refreshBtn = document.querySelector(".btn-refresh");
            const progressContainer = document.getElementById(
              "downloadProgressContainer"
            );
            const progressBar = document.getElementById("downloadProgressBar");
            const progressText = document.getElementById(
              "downloadProgressText"
            );
            const statusActions = document.querySelector(".status-actions");

            console.log("[AI Popup] DOM loaded");
            console.log("[AI Popup] downloadBtn:", downloadBtn);
            console.log("[AI Popup] refreshBtn:", refreshBtn);
            console.log("[AI Popup] progressContainer:", progressContainer);
            console.log("[AI Popup] progressBar:", progressBar);
            console.log("[AI Popup] progressText:", progressText);
            console.log("[AI Popup] statusActions:", statusActions);

            function showFlagError() {
              console.log("[AI Popup] showFlagError called");
              if (statusActions) {
                // Remove previous warnings
                const oldWarning = statusActions.querySelector(".flag-warning");
                if (oldWarning) oldWarning.remove();

                const errorDiv = document.createElement("div");
                errorDiv.className = "flag-warning";
                errorDiv.style.cssText = `
                  background: #fff5f5;
                  border-left: 4px solid #ef4444;
                  padding: 18px 20px;
                  border-radius: 8px;
                  margin-top: 18px;
                  margin-bottom: 8px;
                  font-size: 15px;
                  color: #b91c1c;
                  box-shadow: 0 2px 8px rgba(239,68,68,0.08);
                  width: 100%;
                  font-weight: 500;
                  text-align: left;
                  display: block;
                `;
                errorDiv.innerHTML = `
                  <div style="font-size:18px; font-weight:700; margin-bottom:8px; color:#ef4444;">⚠️ Model Download Unavailable</div>
                  <div style="margin-bottom:10px;">To download the model, enable these Chrome flags:</div>
                  <ul style="margin:0 0 0 18px; padding:0; color:#ef4444; font-size:14px;">
                    <li>chrome://flags/#prompt-api-for-gemini-nano</li>
                    <li>chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</li>
                    <li>chrome://flags/#optimization-guide-on-device-model</li>
                  </ul>
                  <div style="margin-top:10px; color:#b91c1c; font-size:13px;">After enabling, restart Chrome and reload this popup.</div>
                `;
                // Overlay the warning on top of everything in the popup
                const overlayDiv = document.createElement("div");
                overlayDiv.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.6);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 9999;
                `;
                const warningBox = document.createElement("div");
                warningBox.style.cssText = `
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                  text-align: center;
                  font-size: 14px;
                  color: #333;
                  max-width: 400px;
                `;
                warningBox.innerHTML = `
                  <div style="font-size:18px; font-weight:700; margin-bottom:8px; color:#ef4444;">⚠️ Model Download Unavailable</div>
                  <div style="margin-bottom:10px;">To download the model, enable these Chrome flags:</div>
                  <ul style="margin:0 0 10px 18px; padding:0; color:#ef4444; font-size:14px; text-align:left;">
                    <li>chrome://flags/#prompt-api-for-gemini-nano</li>
                    <li>chrome://flags/#prompt-api-for-gemini-nano-multimodal-input</li>
                    <li>chrome://flags/#optimization-guide-on-device-model</li>
                    <li>chrome://flags/#summarization-api-for-gemini-nano</li>
                  </ul>
                  <div style="margin-top:10px; color:#b91c1c; font-size:13px;">After enabling, restart Chrome and reload this popup.</div>
                `;
                overlayDiv.appendChild(warningBox);
                document.body.appendChild(overlayDiv);

                // Close overlay on click
                overlayDiv.addEventListener("click", () => {
                  document.body.removeChild(overlayDiv);
                });
                console.log("[AI Popup] Flag error UI appended");
              } else {
                console.log("[AI Popup] statusActions not found");
              }
            }

            async function checkLanguageModel() {
              console.log("[AI Popup] checkLanguageModel called");
              if (downloadBtn) downloadBtn.disabled = true;
              try {
                // Try to access LanguageModel
                console.log(
                  "[AI Popup] typeof LanguageModel:",
                  typeof LanguageModel
                );
                if (typeof LanguageModel === "undefined")
                  throw new ReferenceError("LanguageModel is not defined");
                // If no error, enable button
                if (downloadBtn) downloadBtn.disabled = false;
                console.log(
                  "[AI Popup] LanguageModel available, downloadBtn enabled"
                );
              } catch (err) {
                if (downloadBtn) downloadBtn.disabled = true;
                console.log("[AI Popup] LanguageModel error:", err);
                showFlagError();
              }
            }

            if (
              downloadBtn &&
              progressContainer &&
              progressBar &&
              progressText
            ) {
              downloadBtn.onclick = async () => {
                console.log("[AI Popup] Download button clicked");
                progressContainer.style.display = "block";
                progressBar.style.width = "0%";
                progressText.textContent = "0%";
                downloadBtn.disabled = true;
                try {
                  console.log("[AI Popup] Starting LanguageModel.create");
                  const session = await LanguageModel.create({
                    monitor(m) {
                      console.log("[AI Popup] monitor called");
                      m.addEventListener("downloadprogress", (e) => {
                        console.log("[AI Popup] downloadprogress event:", e);
                        const percent = Math.floor(e.loaded * 100);
                        console.log(
                          `[AI Popup] Download progress: ${percent}%`
                        );
                      });
                      m.addEventListener("statechange", (e) => {
                        console.log("[AI Popup] statechange event:", e);
                      });
                      m.addEventListener("error", (e) => {
                        console.log("[AI Popup] error event:", e);
                      });
                      m.addEventListener("downloadprogress", (e) => {
                        const percent = Math.floor(e.loaded * 100);
                        progressBar.style.width = percent + "%";
                        progressText.textContent = percent + "%";
                        console.log(
                          `[AI Popup] Download progress: ${percent}%`
                        );
                      });
                    },
                  });
                  progressBar.style.width = "100%";
                  progressText.textContent = "Download complete";
                  console.log("[AI Popup] Download complete");
                } catch (err) {
                  progressText.textContent = "Error";
                  progressBar.style.background = "#ef4444";
                  console.log("[AI Popup] Download error:", err);
                } finally {
                  downloadBtn.disabled = false;
                  console.log("[AI Popup] Download button re-enabled");
                }
              };
              checkLanguageModel();
            } else {
              console.log("[AI Popup] Download UI elements missing");
            }

            if (refreshBtn) {
              refreshBtn.onclick = () => {
                console.log("[AI Popup] Refresh button clicked");
                location.reload(true);
              };
            } else {
              console.log("[AI Popup] Refresh button not found");
            }
          });
          errorDiv.appendChild(ul);
          statusActions.appendChild(errorDiv);
        }
      }

      async function checkLanguageModel() {
        if (downloadBtn) downloadBtn.disabled = true;
        try {
          const availability = await LanguageModel.availability();
          console.log(
            "[AI Popup] LanguageModel.availability result:",
            availability
          );
          // If no error, enable button
          if (downloadBtn) downloadBtn.disabled = false;
        } catch (err) {
          console.log("[AI Popup] LanguageModel.availability error:", err);
          if (
            err instanceof ReferenceError &&
            err.message.includes("LanguageModel is not defined")
          ) {
            if (downloadBtn) downloadBtn.disabled = true;
            showFlagError();
          } else {
            // If any other error, start download
            if (downloadBtn) downloadBtn.disabled = false;
            if (downloadBtn) downloadBtn.click();
          }
        }
      }

      if (downloadBtn && progressContainer && progressBar && progressText) {
        // Removed duplicate download logic to ensure consistency
        checkLanguageModel();
      }

      if (refreshBtn) {
        refreshBtn.onclick = () => {
          location.reload(true);
        };
      }
    });

    // Close modal when clicking X
    closeModal.addEventListener("click", () => {
      settingsModal.classList.remove("show");
    });

    // Close modal when clicking outside
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.remove("show");
      }
    });
  }
  // Download button and progress bar logic
  const downloadBtn = document.querySelector(".btn-download");
  const refreshBtn = document.querySelector(".btn-refresh");
  const progressContainer = document.getElementById(
    "downloadProgressContainer"
  );
  const progressBar = document.getElementById("downloadProgressBar");
  const progressText = document.getElementById("downloadProgressText");

  if (downloadBtn && progressContainer && progressBar && progressText) {
    downloadBtn.onclick = async () => {
      progressContainer.style.display = "block";
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      downloadBtn.disabled = true;
      try {
        const session = await LanguageModel.create({
          outputLanguage: "en",
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              const percent = Math.floor(e.loaded * 100);
              progressBar.style.width = percent + "%";
              progressText.textContent = percent + "%";
              console.log("[AI Popup] downloadprogress event:", e);
            });
            m.addEventListener("statechange", (e) => {
              console.log("[AI Popup] statechange event:", e);
            });
            m.addEventListener("error", (e) => {
              console.log("[AI Popup] error event:", e);
            });
          },
        });
        progressBar.style.width = "100%";
        progressText.textContent = "Download complete";
      } catch (err) {
        progressText.textContent = "Error";
        progressBar.style.background = "#ef4444";
      } finally {
        downloadBtn.disabled = false;
      }
    };
  }

  if (refreshBtn) {
    refreshBtn.onclick = () => {
      location.reload(true);
    };
  }
});
