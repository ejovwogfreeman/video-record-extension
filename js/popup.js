document.addEventListener("DOMContentLoaded", () => {
  // GET THE SELECTORS OF THE BUTTONS
  const msg = document.querySelector(".msg");
  const toggleMic = document.querySelector("#toggleMic");
  const toggleCamera = document.querySelector("#toggleCamera");
  const startRecordingButton = document.querySelector("#startRecording");
  const stopRecordingButton = document.querySelector("#stopRecording");

  // Initialize recording state
  let isRecording = false;

  // Function to update button visibility
  function updateButtonVisibility() {
    startRecordingButton.style.display = isRecording ? "none" : "block";
    stopRecordingButton.style.display = isRecording ? "block" : "none";
  }

  // Function to save microphone and camera state
  function saveState(micEnabled, cameraEnabled) {
    chrome.storage.sync.set({ micEnabled, cameraEnabled, isRecording });
  }

  // Function to restore microphone, camera, and recording state
  function restoreState() {
    chrome.storage.sync.get(
      ["micEnabled", "cameraEnabled", "isRecording"],
      (result) => {
        const { micEnabled, cameraEnabled, isRecording: recorded } = result;
        if (micEnabled !== undefined) {
          toggleMic.checked = micEnabled;
        }
        if (cameraEnabled !== undefined) {
          toggleCamera.checked = cameraEnabled;
        }
        if (recorded !== undefined) {
          isRecording = recorded; // Update the outer isRecording variable
          updateButtonVisibility();
        }
      }
    );
  }

  // Initialize the state
  restoreState();

  // Function to check if media recording is active
  function isMediaRecordingActive(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "check_media_recording" },
        function (response) {
          if (!chrome.runtime.lastError) {
            callback(response.isRecording);
          }
        }
      );
    });
  }

  // Check if media recording is active when the popup opens
  isMediaRecordingActive((active) => {
    isRecording = active;
    updateButtonVisibility();
    saveState(toggleMic.checked, toggleCamera.checked);
  });

  // Adding event listeners

  startRecordingButton.addEventListener("click", () => {
    const micEnabled = toggleMic.checked;
    const cameraEnabled = toggleCamera.checked;

    if (micEnabled && cameraEnabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "request_recording" },
          function (response) {
            if (!chrome.runtime.lastError) {
              console.log(response);
              isRecording = true;
              updateButtonVisibility();
              saveState(micEnabled, cameraEnabled);
            } else {
              console.log(chrome.runtime.lastError, "error line 76");
            }
          }
        );
      });
    } else {
      msg.textContent = "PLEASE ENABLE CAMERA AND MICROPHONE";
      msg.style.display = "block";
      setTimeout(() => {
        msg.style.display = "none";
      }, 3000);
    }
  });

  stopRecordingButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "stopvideo" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
            isRecording = false;
            updateButtonVisibility();
            saveState(false, false);
            toggleMic.checked = false;
            toggleCamera.checked = false;
          } else {
            console.log(chrome.runtime.lastError, "error line 98");
          }
        }
      );
    });
  });
});
