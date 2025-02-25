document.addEventListener("DOMContentLoaded", () => {
  // Enfoque su rostro
  const FF = document.getElementById("ff");
  const FF_Cancel = document.getElementById("ff-cancel");
  const FF_Continue = document.getElementById("ff-continue");

  // Antispoofing
  const AS = document.getElementById("as");
  const AS_Video = document.getElementById("as-video");
  const AS_Indicator = document.getElementById("as-indicator");

  // Dialogo de cancelación
  const CancelDialog = document.getElementById("cancel-dialog");
  const CancelDialogClose = document.getElementById("cancel-dialog-close");
  const CancelDialogConfirm = document.getElementById("cancel-dialog-confirm");

  // Listeners enfoque su rostro
  FF_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  FF_Continue.addEventListener("click", () => {
    changePage(1);
    configureAntispoofing()
  });
  // Listeners dialogo de cancelación
  CancelDialogClose.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
  });
  CancelDialogConfirm.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
  });

  // Configurar antispoofing
  async function configureAntispoofing() {
    const video = AS_Video;
    const canvas = document.createElement("canvas");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 480 },
        height: { ideal: 640 },
        frameRate: { ideal: 60 },
        aspectRatio: 1.777,
      },
    });
    const onError = (error) => {
      AS_Indicator.innerText = error;
    };
    const onCapturingFrames = (message) => {
      AS_Indicator.innerText = message;
    };
    const onFramesCaptured = (data) => {
      console.log("Captured frames:", data);
    };
    const onResponse = (response) => {
      console.log(response);
    };
    const webAntiSpoofing = new AntiSpoofing({
      videoElement: video,
      canvasElement: canvas,
      stream: stream,
      inputSize: 224,
      scoreThreshold: 0.5,
      modelsRoute: "/models",
      urlApi:
        "https://appservicesdev.azurewebsites.net/TestLife/ValidaAntispoff",
      originSelfHeader:
        "5b72c18981e916b193adaa52442c8f969f9fa3fb1e95f2bf3a6bf1883bc8a1d0",
      onError: onError,
      onCapturingFrames: onCapturingFrames,
      onFramesCaptured: onFramesCaptured,
      onResponse: onResponse,
    });
  }

  // Funciones para cambiar páginas
  function changePage(page = 0) {
    hideAllPages();
    const pages = {
      0: () => {
        FF.style.display = "block";
      },
      1: () => {
        AS.style.display = "block";
      },
      1: () => {
        AS.style.display = "block";
      },
    };
    pages[page]();
  }
  function hideAllPages() {
    FF.style.display = "none";
  }
});
