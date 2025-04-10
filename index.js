document.addEventListener("DOMContentLoaded", () => {
  let frontImage = "";
  let backImage = "";
  let backStream = null;
  let frontStream = null;
  let framesCaptured = [];
  let OCRIneResponse = {};
  let ComparaFotoResponse = {};
  let ConsultaIneResponse = {};
  let dataSendIne = {}
  let signature = "";
  let token = "";
  let referencia = "PRUWBASRENE4";
  let hostname = "";

  // Enfoque su rostro
  const PDVI = document.getElementById("pdvi");
  const PDVI_Continue = document.getElementById("pdvi-continue");

  // Antispoofing
  const AS = document.getElementById("as");
  const AS_Video = document.getElementById("as-video");
  const AS_Indicator = document.getElementById("as-indicator");
  const AS_NOT_FOUND = document.getElementById("as-not-found");

  // Captura de identificacion frente
  const CIF = document.getElementById("cif");
  const CIF_Continue = document.getElementById("cif-continue");

  // Toma foto frente
  const TFF = document.getElementById("tff");
  const TFF_Video = document.getElementById("tff-video");
  const TFF_Continue = document.getElementById("tff-continue");

  // Verifique foto frente
  const VFF = document.getElementById("vff");
  const VFF_Photo = document.getElementById("vff-photo");
  const VFF_Retake = document.getElementById("vff-retake");
  const VFF_Continue = document.getElementById("vff-continue");

  // Captura de identificacion reversa
  const CIR = document.getElementById("cir");
  const CIR_Continue = document.getElementById("cir-continue");

  // Toma foto reversa
  const TFR = document.getElementById("tfr");
  const TFR_Video = document.getElementById("tfr-video");
  const TFR_Continue = document.getElementById("tfr-continue");

  // Verifique foto reversa
  const VFR = document.getElementById("vfr");
  const VFR_Photo = document.getElementById("vfr-photo");
  const VFR_Retake = document.getElementById("vfr-retake");
  const VFR_Continue = document.getElementById("vfr-continue");

  // FIRMA
  const CONFI = document.getElementById("confi");
  const CONFI_Continue = document.getElementById("confi-continue");
  const CONFI_SIGN = document.getElementById("confi-sign");
  const CONFI_UNDO = document.getElementById("confi-undo");

  // Loader
  const Loader = document.getElementById("loader");

  // Pantalla bienvenida
  const WLCM = document.getElementById("wlcm");
  const WLCM_Continue = document.getElementById("wlcm-continue");
  const WLCM_Cancel = document.getElementById("wlcm-cancel");

  // Pantalla bienvenida
  const TYC = document.getElementById("tyc");
  const TYC_Continue = document.getElementById("tyc-continue");
  const TYC_Cancel = document.getElementById("tyc-cancel");

  // Verifica informacion 
  const VINFO = document.getElementById("vinfo")
  const VINFO_Continue = document.getElementById("vinfo-continue");
  const VINFO_Info = document.getElementById("vinfo-info");

  // Pantalla exito
  const FINAL = document.getElementById("final");
  const FINAL_Continue = document.getElementById("final-continue");

  // Dialogo de cancelación
  const CancelDialog = document.getElementById("cancel-dialog");
  const CancelDialogClose = document.getElementById("cancel-dialog-close");
  const CancelDialogConfirm = document.getElementById("cancel-dialog-confirm");

  // Cooldown
  const cooldown = document.getElementById("cooldown");

  WLCM_Cancel.addEventListener("click", () => {
    CancelDialog.setAttribute("open", true);
  });
  TYC_Cancel.addEventListener("click", () => {
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
  VINFO_Continue.addEventListener("click", () => {
    changePage(11);
    configureSignBox();
  })
  FINAL_Continue.addEventListener("click", () => {
    const response = {
      estado: 0,
      descripcion: "Satisfactorio",
      img_prueba_vida: framesCaptured[0],
      img_ine_frente: frontImage,
      img_ine_reverso: backImage,
      score_comparacion_facial: ComparaFotoResponse.score,
      data_ocr_ine: OCRIneResponse,
      data_send_service_ine: dataSendIne,
      data_response_service_ine: ConsultaIneResponse,
    }
    console.log(response);
  })
  // Listeners dialogo de cancelación
  CancelDialogClose.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
  });
  CancelDialogConfirm.addEventListener("click", () => {
    CancelDialog.removeAttribute("open");
    changePage(0);
    const response = {
      estado: 2,
      descripcion: "Cancelado por el usuario",
      img_prueba_vida: "",
      img_ine_frente: {},
      img_ine_reverso: {},
      score_comparacion_facial: 0,
      data_ocr_ine: {},
      data_send_service_ine: {},
      data_response_service_ine: {},
    }
    console.log(response);
  });

  // Configurar antispoofing
  async function configureAntispoofing() {
    try {
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
        AS_Indicator.innerHTML = error;
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
            framesCaptured = [];
            changePage(2);
          } else {
            changePage(4);
          }
        } else {
          framesCaptured = [];
          changePage(2);
        }
      };
      AS_NOT_FOUND.style.display = "none"
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
    } catch (error) {
      if (error.name === 'NotFoundError') {
        AS_NOT_FOUND.style.display = "block"
        console.log("No se encontró una cámara.");
      } else if (error.name === 'NotAllowedError') {
        AS_NOT_FOUND.style.display = "block"
        console.log("El usuario denegó el acceso a la cámara.");
      }
    }
  }

  // Configurar firma
  function configureSignBox() {
    const ctx = CONFI_SIGN.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#FFF";
    let screenWidth = window.innerWidth
    let width = CONFI_SIGN.width
    let heigth = CONFI_SIGN.height
    ctx.fillRect(0, 0, width, heigth);
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
      ctx.clearRect(0, 0, width, heigth);
      ctx.fillRect(0, 0, width, heigth);
    });

    CONFI_Continue.addEventListener("click", () => {
      saveSignature(CONFI_SIGN.toDataURL("image/png"));
    });
  }

  // Foto frontal de INE
  CIF_Continue.addEventListener("click", () => {
    changePage(5);
    configureTakeFrontPhoto();
    frontImage = "";
  });
  VFF_Retake.addEventListener("click", () => {
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
    VFF_Photo.src = frontImage;
    changePage(6);
  });
  VFF_Continue.addEventListener("click", () => {
    changePage(7);
  });

  // Foto reversa de INE

  CIR_Continue.addEventListener("click", () => {
    changePage(8);
    configureTakeBackPhoto();
    backImage = "";
  });
  VFR_Retake.addEventListener("click", () => {
    changePage(8);
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
    VFR_Photo.src = backImage;
    changePage(9);
  });
  VFR_Continue.addEventListener("click", () => {
    showLoader();
    callIneServices();
  });

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
        if (data.estado === 0 && data.descripcion === "EXITO") {
          OCRIneResponse = { ...data };
          callComparaFotoCredencial();
        } else {
          OCRIneResponse = {}
          dataSendIne = {}
          changePage(4);
        }
      } catch (error) {
        console.error("Error al realizar la llamada al servicio:", error);
        OCRIneResponse = {}
        dataSendIne = {}
        changePage(4);
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
          OCRIneResponse = {}
          ComparaFotoResponse = {}
          dataSendIne = {}
          changePage(4);
        }
      } else {
        console.error("Error en el servicio: ", data);
        OCRIneResponse = {}
        ComparaFotoResponse = {}
        dataSendIne = {}
        changePage(4);
      }
    } catch (error) {
      console.error("Error al realizar la llamada al servicio:", error);
      OCRIneResponse = {}
      ComparaFotoResponse = {}
      dataSendIne = {}
      changePage(4);
    }
  }

  async function callConsultaIne() {
    if (framesCaptured.length === 0) return;
    try {
      const body = {
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
      }
      dataSendIne = {...body};
      const response = await fetch(
        "https://identidaddigital.iqsec.com.mx/WSCommerceFielValidateCetes/api/Todo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (data.estado === 0 && data.descripcion === "Satisfactorio") {
        ConsultaIneResponse = { ...data };
        changePage(10);
        VINFO_Info.innerHTML = `
          <h3 class="CT-text-H3 CT-color-color-text CT-my-2 CT-text-center">Por favor verifique que sus datos sean correctos</h3>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-1">Nombre (s):</p>
            <p class="CT-text-body CT-color-color-text CT-my-1">${body.nombre}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-1">Apellido Paterno:</p>
            <p class="CT-text-body CT-color-color-text CT-my-1">${body.paterno}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-1">Apellido Materno:</p>
            <p class="CT-text-body CT-color-color-text CT-mt-1 CT-mb-4">${body.materno}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">CURP:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${body.curp}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">Clave de Elector:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${body.claveElector}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">CIC:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${body.cic}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">No. de Emisión:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${OCRIneResponse.no_emision || ""}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">Año de Registro:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${body.anioRegistro}</p>
          </div>
          <div class="CT-justify-between CT-w-full CT-flex">
            <p class="CT-text-body CT-color-color-text CT-my-2">Año de Emisión:</p>
            <p class="CT-text-body CT-color-green-1 CT-my-2">${body.anioEmision}</p>
          </div>
        `
      } else {
        console.error("Error en el servicio: ", data);
        ConsultaIneResponse = {}
        OCRIneResponse = {}
        ComparaFotoResponse = {}
        dataSendIne = {}
        changePage(4);
      }
    } catch (error) {
      console.error("Error al realizar la llamada al servicio:", error);
      ConsultaIneResponse = {}
      OCRIneResponse = {}
      ComparaFotoResponse = {}
      dataSendIne = {}
      changePage(4);
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
            firma: signature.split(',')[1],
            token: token,
            hostname: hostname,
            referencia: referencia,
          }),
        }
      );
      const data = await response.json();
      if (data.estado === 0 && data.descripcion === "Satisfactorio") {
        showFinal();
      } else {
        console.error("Error en el servicio: ", data);
        signature = ""
        changePage(11);
      }
    } catch (error) {}
  }

  async function getToken() {
    hostname = location.hostname;
    if (!hostname || !referencia) return;
    const cad = hostname + "|" + referencia;
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
        const response = {
          estado: data.estado,
          descripcion: data.descripcion,
          img_prueba_vida: "",
          img_ine_frente: "",
          img_ine_reverso: "",
          score_comparacion_facial: 0,
          data_ocr_ine: {},
          data_send_service_ine: {},
          data_response_service_ine: {},
        }
        console.log(response);
        hideAllPages()
        cooldown.style.display = "block";
      }
    } catch (error) {
      console.error(error)
    }
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
        VFF.style.display = "block";
      },
      7: () => {
        CIR.style.display = "block";
      },
      8: () => {
        TFR.style.display = "block";
      },
      9: () => {
        VFR.style.display = "block";
      },
      10: () => {
        VINFO.style.display = "block";
      },
      11: () => {
        CONFI.style.display = "block";
      },
    };
    pages[page]();
  }
  function hideAllPages() {
    PDVI.style.display = "none";
    AS.style.display = "none";
    CIF.style.display = "none";
    TFF.style.display = "none";
    CIR.style.display = "none";
    TFR.style.display = "none";
    Loader.style.display = "none";
    FINAL.style.display = "none";
    CONFI.style.display = "none";
    WLCM.style.display = "none";
    TYC.style.display = "none";
    VFF.style.display = "none";
    VFR.style.display = "none";
    VINFO.style.display = "none";
  }
  function showLoader() {
    hideAllPages();
    Loader.style.display = "block";
  }
  function showFinal() {
    hideAllPages();
    FINAL.style.display = "block";
  }
  getToken();
});
