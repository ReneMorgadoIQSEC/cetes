document.addEventListener("DOMContentLoaded", () => {
  let frontImage = "";
  let backImage = "";
  let backStream = null;
  let frontStream = null;
  let framesCaptured = [];
  let OCRIneResponse = {};
  let ComparaFotoResponse = {};
  let ConsultaIneResponse = {};
  let signature = "";
  let token = "";
  let referencia = "";
  let hostname = ""

  // Enfoque su rostro
  const PDVI = document.getElementById("pdvi");
  const PDVI_Continue = document.getElementById("pdvi-continue");

  // Antispoofing
  const AS = document.getElementById("as");
  const AS_Error = document.getElementById("as-error");
  const AS_Video = document.getElementById("as-video");
  const AS_Indicator = document.getElementById("as-indicator");
  const AS_Cancel = document.getElementById("as-cancel");
  const AS_Retry = document.getElementById("as-retry");

  // Captura de identificacion frente
  const CIF = document.getElementById("cif");
  const CIF_Continue = document.getElementById("cif-continue");

  // Toma foto frente
  const TFF = document.getElementById("tff");
  const TFF_Video = document.getElementById("tff-video");
  const TFF_Continue = document.getElementById("tff-continue");

  // Captura de identificacion reversa
  const CIR = document.getElementById("cir");
  const CIR_Continue = document.getElementById("cir-continue");

  // Toma foto reversa
  const TFR = document.getElementById("tfr");
  const TFR_Video = document.getElementById("tfr-video");
  const TFR_Continue = document.getElementById("tfr-continue");

  // FIRMA
  const CONFI = document.getElementById("confi");
  const CONFI_Continue = document.getElementById("confi-continue");
  const CONFI_SIGN = document.getElementById("confi-sign");
  const CONFI_UNDO = document.getElementById("confi-undo");

  // Loader
  const Loader = document.getElementById("loader");

  // Pantalla error INE
  const INE_Error = document.getElementById("ine-error");
  const INE_Cancel = document.getElementById("ine-cancel");
  const INE_Retry = document.getElementById("ine-retry");

  // Pantalla bienvenida
  const WLCM = document.getElementById("wlcm");
  const WLCM_Continue = document.getElementById("wlcm-continue");
  const WLCM_Cancel = document.getElementById("wlcm-cancel");

  // Pantalla bienvenida
  const TYC = document.getElementById("tyc");
  const TYC_Continue = document.getElementById("tyc-continue");
  const TYC_Cancel = document.getElementById("tyc-cancel");

  // Pantalla exito
  const SUCCESS = document.getElementById("success");

  // Pantalla Error firma
  const SG_Error = document.getElementById("sg-error");
  const SG_Cancel = document.getElementById("sg-cancel");
  const SG_Retry = document.getElementById("sg-retry");

  // Dialogo de cancelación
  const CancelDialog = document.getElementById("cancel-dialog");
  const CancelDialogClose = document.getElementById("cancel-dialog-close");
  const CancelDialogConfirm = document.getElementById("cancel-dialog-confirm");

  // Listeners enfoque su rostro
  AS_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  INE_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  WLCM_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  TYC_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  SG_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  WLCM_Continue.addEventListener("click", () => {
    changePage(1);
  });
  TYC_Continue.addEventListener("click", () => {
    changePage(2);
  });
  PDVI_Continue.addEventListener("click", () => {
    changePage(3);
    configureAntispoofing();
  });
  AS_Retry.addEventListener("click", () => {
    changePage(3);
    configureAntispoofing();
  });
  INE_Retry.addEventListener("click", () => {
    changePage(4);
    configureAntispoofing();
  });
  SG_Retry.addEventListener("click", () => {
    changePage(8);
    configureSignBox();
  });
  // Listeners dialogo de cancelación
  CancelDialogClose.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
  });
  CancelDialogConfirm.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
    changePage(0);
  });

  CIF_Continue.addEventListener("click", () => {
    changePage(5);
    configureTakeFrontPhoto();
    frontImage = "";
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
      framesCaptured = [...data];
      showLoader();
    };
    const onResponse = (response) => {
      if (response.success) {
        if (response.isSpoof) {
          showErrorAS();
        } else {
          changePage(4);
        }
      } else {
        showErrorAS();
      }
    };
    const webAntiSpoofing = new AntiSpoofing({
      videoElement: video,
      canvasElement: canvas,
      stream: stream,
      inputSize: 224,
      scoreThreshold: 0.5,
      modelsRoute: "/models",
      urlApi:
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
      FielnetToken: token,
      hostname: hostname,
      reference: referencia,
      onError: onError,
      onCapturingFrames: onCapturingFrames,
      onFramesCaptured: onFramesCaptured,
      onResponse: onResponse,
    });
  }

  // Configurar firma
  function configureSignBox() {
    const ctx = CONFI_SIGN.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, CONFI_SIGN.width, CONFI_SIGN.height);
    let drawing = false;
    CONFI_SIGN.addEventListener("mousedown", (e) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    });

    CONFI_SIGN.addEventListener("mousemove", (e) => {
      if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    });

    CONFI_SIGN.addEventListener("mouseup", () => {
      drawing = false;
    });

    CONFI_UNDO.addEventListener("click", () => {
      ctx.clearRect(0, 0, CONFI_SIGN.width, CONFI_SIGN.height);
      ctx.fillRect(0, 0, CONFI_SIGN.width, CONFI_SIGN.height);
    });

    CONFI_Continue.addEventListener("click", () => {
      console.log(CONFI_SIGN.toDataURL("image/jpeg"));
      saveSignature(CONFI_SIGN.toDataURL("image/jpeg"));
    });
  }

  // Foto frontal de INE
  CIF_Continue.addEventListener("click", () => {
    changePage(5);
    configureTakeFrontPhoto();
    frontImage = "";
  });
  function configureTakeFrontPhoto() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        TFF_Video.srcObject = stream;
        frontStream = stream;
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
      });
  }
  TFF_Continue.addEventListener("click", () => {
    if (frontStream) {
      frontStream.getTracks().forEach((track) => track.stop());
      frontStream = null;
    }
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = TFF_Video.videoWidth;
    canvas.height = TFF_Video.videoHeight;
    context.drawImage(TFF_Video, 0, 0, canvas.width, canvas.height);
    frontImage = canvas.toDataURL("image/jpeg", 0.8);
    canvas.remove();
    context = null;
    canvas = null;
    changePage(6);
  });

  // Foto reversa de INE

  CIR_Continue.addEventListener("click", () => {
    changePage(7);
    configureTakeBackPhoto();
    backImage = "";
  });
  function configureTakeBackPhoto() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        TFR_Video.srcObject = stream;
        backStream = stream;
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
      });
  }
  TFR_Continue.addEventListener("click", () => {
    if (backStream) {
      backStream.getTracks().forEach((track) => track.stop());
      backImage = null;
    }
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = TFR_Video.videoWidth;
    canvas.height = TFR_Video.videoHeight;
    context.drawImage(TFR_Video, 0, 0, canvas.width, canvas.height);
    backImage = canvas.toDataURL("image/jpeg", 0.8);
    canvas.remove();
    context = null;
    canvas = null;
    showLoader();
    callIneServices();
  });

  // LLamada servicio validación INE
  async function callIneServices() {
    if (frontImage && backImage && frontImage !== "" && backImage !== "") {
      try {
        const response = await fetch(
          "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              oper: "OCRLocal",
              imagenAnverso: frontImage.split(",")[1],
              imagenReverso: backImage.split(",")[1],
              token: token,
              hostname: hostname,
              referencia: referencia,
            }),
          }
        );
        const data = await response.json();
        console.log(data)
        if (data.estado === 0 && data.descripcion === "EXITO") {
          OCRIneResponse = { ...data };
          callComparaFotoCredencial();
        } else {
          showErrorINE();
        }
      } catch (error) {
        console.error("Error al realizar la llamada al servicio:", error);
        showErrorINE();
      }
    }
  }

  async function callComparaFotoCredencial() {
    if (framesCaptured.length === 0) return;
    try {
      const response = await fetch(
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oper: "ComparaFotoCredencialLocal",
            foto: framesCaptured[0].split(",")[1],
            credencial: frontImage.split(",")[1],
            token: token,
            hostname: hostname,
            referencia: referencia,
          }),
        }
      );
      const data = await response.json();
      if (data.estado === 0 && data.descripcion === "EXITO") {
        if (data.score >= 90) {
          ComparaFotoResponse = { ...data };
          callConsultaIne();
        } else {
          console.error("No cumple con el score: ", data);
          showErrorINE();
        }
      } else {
        console.error("Error en el servicio: ", data);
        showErrorINE();
      }
    } catch (error) {
      console.error("Error al realizar la llamada al servicio:", error);
      showErrorINE();
    }
  }

  async function callConsultaIne() {
    if (framesCaptured.length === 0) return;
    try {
      const response = await fetch(
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            hostname: hostname,
            referencia: referencia,
            oper: "ConsultaINE",
            anioRegistro: OCRIneResponse.registro?.split(" ")[0] || "",
            anioEmision: OCRIneResponse.registro?.split(" ")[0] || "",
            cic: OCRIneResponse.cic || "",
            claveElector: OCRIneResponse.claveElector || "",
            curp: OCRIneResponse.curp || "",
            materno: OCRIneResponse.segundoApellido || "",
            paterno: OCRIneResponse.primerApellido || "",
            codigoPostal:
              OCRIneResponse.colonia?.split(" ")[
                OCRIneResponse.colonia?.split(" ")?.length - 1
              ] || "",
            estado: isNaN(parseInt(OCRIneResponse.entidadFederativa))
              ? 0
              : parseInt(OCRIneResponse.entidadFederativa),
            nombre: OCRIneResponse.nombres || "",
            numeroEmision: OCRIneResponse.no_emision || "",
            ocr: OCRIneResponse.ocr || "",
            consentimiento: true,
            modalidad: 1,
            latitud: 0.0,
            longitud: 0.0,
            realizoPruebaDeVida: true,
            mapafacial: framesCaptured[0].split(",")[1],
          }),
        }
      );
      const data = await response.json();
      if (data.estado === 0 && data.descripcion === "Satisfactorio") {
        ConsultaIneResponse = { ...data };
        changePage(8);
        configureSignBox();
      } else {
        console.error("Error en el servicio: ", data);
        showErrorINE();
      }
    } catch (error) {
      console.error("Error al realizar la llamada al servicio:", error);
      showErrorINE();
    }
  }

  async function saveSignature(signature) {
    if (!signature) return;
    try {
      showLoader();
      const response = await fetch(
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oper: "ResguardaFirma",
            firma: signature,
            token: token,
            hostname: hostname,
            referencia: referencia,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.estado === 0 && data.descripcion === "Satisfactorio") {
        showSuccess();
      } else {
        console.error("Error en el servicio: ", data);
        showErrorSignature();
      }
    } catch (error) {}
  }

  async function getToken() {
    hostname = 'hostname';
    referencia = "pruebas IQSECSACV1"; // Este dato lo compartirá Hiber
    const cad = hostname + "|" + referencia;
    if (!hostname || !referencia && !cad) return;
    try {
      showLoader();
      const response = await fetch(
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/getToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: btoa(cad),
          }),
        }
      );
      const data = await response.json();
      if (data.estado === 0 && data.descripcion === "Satisfactorio") {
        changePage(0);
        token = data.token;
      } else {
        location.reload();
      }
    } catch (error) {}
  }

  function changePage(page = 0) {
    hideAllPages();
    const pages = {
      0: () => {
        WLCM.style.display = "block";
      },
      1: () => {
        TYC.style.display = "block";
      },
      2: () => {
        PDVI.style.display = "block";
      },
      3: () => {
        AS.style.display = "block";
      },
      4: () => {
        CIF.style.display = "block";
      },
      5: () => {
        TFF.style.display = "block";
      },
      6: () => {
        CIR.style.display = "block";
      },
      7: () => {
        TFR.style.display = "block";
      },
      8: () => {
        CONFI.style.display = "block";
      },
    };
    pages[page]();
  }
  function hideAllPages() {
    PDVI.style.display = "none";
    AS.style.display = "none";
    AS_Error.style.display = "none";
    CIF.style.display = "none";
    TFF.style.display = "none";
    CIR.style.display = "none";
    TFR.style.display = "none";
    INE_Error.style.display = "none";
    Loader.style.display = "none";
    SUCCESS.style.display = "none";
    CONFI.style.display = "none";
    WLCM.style.display = "none";
    TYC.style.display = "none";
    SG_Error.style.display = "none";
  }
  function showErrorAS() {
    hideAllPages();
    framesCaptured = [];
    AS_Error.style.display = "block";
  }
  function showLoader() {
    hideAllPages();
    Loader.style.display = "block";
  }
  function showErrorINE() {
    hideAllPages();
    OCRIneResponse = {};
    ComparaFotoResponse = {};
    INE_Error.style.display = "block";
  }
  function showErrorSignature() {
    hideAllPages();
    signature = "";
    SG_Error.style.display = "block";
  }
  function showSuccess() {
    hideAllPages();
    SUCCESS.style.display = "block";
    console.log("Datos obtenidos:");
    console.table(OCRIneResponse);
    console.table(ComparaFotoResponse);
    console.table(ConsultaIneResponse);
  }
  getToken();
});
