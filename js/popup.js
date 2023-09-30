document.addEventListener("DOMContentLoaded", () => {
  // GET THE SELECTORS OF THE BUTTONS
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
        const { micEnabled, cameraEnabled, isRecording } = result;
        if (micEnabled !== undefined) {
          toggleMic.checked = micEnabled;
        }
        if (cameraEnabled !== undefined) {
          toggleCamera.checked = cameraEnabled;
        }
        if (isRecording !== undefined) {
          isRecording = isRecording;
          updateButtonVisibility();
        }
      }
    );
  }

  // Initialize the state
  restoreState();

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
              isRecording = true; // Update recording state
              updateButtonVisibility();
              saveState(micEnabled, cameraEnabled); // Save the state
            } else {
              console.log(chrome.runtime.lastError, "error line 64");
            }
          }
        );
      });
    } else {
      alert("Please enable both camera and microphone to start recording.");
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
            isRecording = false; // Update recording state
            updateButtonVisibility();
            saveState(toggleMic.checked, toggleCamera.checked); // Save the state
          } else {
            console.log(chrome.runtime.lastError, "error line 79");
          }
        }
      );
    });
  });
});
