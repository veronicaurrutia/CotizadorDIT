import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RehabilitacionSelector from "./RehabilitacionSelector";

const QUICK_FILTERS = ["Todos", "Zirconio", "Disilicato", "Metal-Ceramica"];

const COLOR_SWATCH = {
  A1: "#f7ead3",
  A2: "#ecd7b6",
  A3: "#e1c39e",
  B1: "#efe3ce",
  B2: "#dcc7a7",
  C1: "#dbcfbf",
  D2: "#cab39b",
};

const productosFija = [
  {
    id: 1,
    nombre: "Corona cementada",
    tipoProducto: "Corona",
    materiales: ["Zirconio monolitico", "Zirconio 3D Pro", "Disilicato"],
    materialPricing: {
      "Zirconio Standard": 0,
      "High Translucency": 6000,
      Multicapa: 9000,
    },
    colores: ["A1", "A2", "A3", "B1"],
    tiempoEntrega: "3 dias",
    tiempoPorMaterial: {
      "Zirconio Standard": 3,
      "High Translucency": 4,
      Multicapa: 5,
    },
    precioBase: 60000,
    morfologia: "Molar",
    masComprado: true,
    quickTag: "Zirconio",
  },
  {
    id: 2,
    nombre: "Corona sobre implante",
    tipoProducto: "Estructura",
    materiales: ["Corona monolitica", "TridiPro", "Disilicato", "Cementado al pilar"],
    materialPricing: {
      "Zirconio Standard": 0,
      Multicapa: 12000,
    },
    colores: ["A1", "A2", "B1"],
    tiempoEntrega: "5 dias",
    tiempoPorMaterial: {
      "Zirconio Standard": 5,
      Multicapa: 6,
    },
    precioBase: 72500,
    morfologia: "Implante",
    masComprado: true,
    quickTag: "Zirconio",
  },
  {
    id: 3,
    nombre: "Corona Disilicato E.max",
    tipoProducto: "Corona",
    materiales: ["Disilicato Press", "Disilicato CAD"],
    materialPricing: {
      "Disilicato Press": 0,
      "Disilicato CAD": 4500,
    },
    colores: ["A1", "A2", "A3", "C1"],
    tiempoEntrega: "3 dias",
    tiempoPorMaterial: {
      "Disilicato Press": 3,
      "Disilicato CAD": 4,
    },
    precioBase: 72000,
    morfologia: "Premolar",
    masComprado: true,
    quickTag: "Disilicato",
  },
  {
    id: 4,
    nombre: "Corona Metal-Ceramica",
    tipoProducto: "Corona",
    materiales: ["Cromo-Cobalto", "Niquel-Cromo"],
    materialPricing: {
      "Cromo-Cobalto": 0,
      "Niquel-Cromo": -3000,
    },
    colores: ["A2", "A3", "B1"],
    tiempoEntrega: "4 dias",
    tiempoPorMaterial: {
      "Cromo-Cobalto": 4,
      "Niquel-Cromo": 4,
    },
    precioBase: 54000,
    morfologia: "Molar",
    masComprado: false,
    quickTag: "Metal-Ceramica",
  },
  {
    id: 5,
    nombre: "Incrustacion Disilicato",
    tipoProducto: "Inlay/Onlay",
    materiales: ["Disilicato CAD"],
    materialPricing: {
      "Disilicato CAD": 0,
    },
    colores: ["A1", "A2", "B1", "C1"],
    tiempoEntrega: "2 dias",
    tiempoPorMaterial: {
      "Disilicato CAD": 2,
    },
    precioBase: 46000,
    morfologia: "Posterior",
    masComprado: false,
    quickTag: "Disilicato",
  },
  {
    id: 6,
    nombre: "Carilla Zirconio Facial",
    tipoProducto: "Carilla",
    materiales: ["High Translucency", "Multicapa"],
    materialPricing: {
      "High Translucency": 0,
      Multicapa: 8000,
    },
    colores: ["A1", "A2", "B1", "D2"],
    tiempoEntrega: "3 dias",
    tiempoPorMaterial: {
      "High Translucency": 3,
      Multicapa: 4,
    },
    precioBase: 65000,
    morfologia: "Anterior",
    masComprado: false,
    quickTag: "Zirconio",
  },
];

function formatCLP(value) {
  return value.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
}

function parseDias(tiempo) {
  const matched = String(tiempo).match(/\d+/);
  return matched ? Number(matched[0]) : 3;
}

function getAvailabilityStyle(days) {
  if (days <= 1) {
    return { label: "Express", className: "bg-emerald-100 text-emerald-700" };
  }
  if (days <= 3) {
    return { label: "Estandar", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Programado", className: "bg-slate-200 text-slate-700" };
}

function createTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-6);
  return `DIT-${stamp}`;
}

function drawDitLogo(doc, x, y) {
  doc.setFillColor(0, 94, 184);
  doc.roundedRect(x, y, 92, 32, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DIT", x + 12, y + 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Laboratorio Dental", x + 37, y + 21);
  doc.setTextColor(0, 0, 0);
}

const MATERIAL_PRICES = {
  "Zirconio monolitico": 64990,
  "Corona monolitica": 72500,
  "Zirconio 3D Pro": 71500,
  "TridiPro": 72500,
  "Disilicato": 79990,
  "Disilicato Press": 79990,
  "Disilicato CAD": 79990,
  "Cementado al pilar": 10990,
  "Cromo-Cobalto": 54000,
  "Niquel-Cromo": 54000,
  "High Translucency": 71500,
  "Multicapa": 71500,
  "Zirconio Standard": 64990,
};

const DENTAL_FILE_ACCEPT = ".stl,.dcm,.dicom,.zip";

function buildCorrelativeOrderId(sequence) {
  return `DIT-ORD-${String(sequence).padStart(6, "0")}`;
}

function isValidDentalFile(fileName) {
  return /\.(stl|dcm|dicom|zip)$/i.test(fileName);
}

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedMaterial, setSelectedMaterial] = useState("Todos");
  const [quickFilter, setQuickFilter] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(180000);
  const [flowStep, setFlowStep] = useState("selection");
  const [activeProduct, setActiveProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedModalMaterial, setSelectedModalMaterial] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const [cartItems, setCartItems] = useState([]);
  const [patientData, setPatientData] = useState({
    fecha: createTodayDate(),
    doctor: "",
    orden: createOrderNumber(),
    paciente: "",
    rut: "",
    email: "",
    telefono: "",
  });

  const [quoteView, setQuoteView] = useState(null);
  const [formError, setFormError] = useState("");
  const [orderSequence, setOrderSequence] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }
    return Number(window.localStorage.getItem("ditOrderSequence") || 0);
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [rehabSelectorVersion, setRehabSelectorVersion] = useState(0);

  const [modalCartItems, setModalCartItems] = useState([]);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const allTypes = useMemo(
    () => ["Todos", ...new Set(productosFija.map((item) => item.tipoProducto))],
    []
  );

  const allMaterials = useMemo(
    () => ["Todos", ...new Set(productosFija.flatMap((item) => item.materiales))],
    []
  );

  const masComprados = useMemo(
    () => productosFija.filter((item) => item.masComprado).slice(0, 3),
    []
  );

  const productosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return productosFija.filter((item) => {
      const byType = selectedType === "Todos" || item.tipoProducto === selectedType;
      const byMaterial =
        selectedMaterial === "Todos" || item.materiales.includes(selectedMaterial);
      const byQuick = quickFilter === "Todos" || item.quickTag === quickFilter;
      const byPrice = item.precioBase <= maxPrice;
      const bySearch =
        !term ||
        item.nombre.toLowerCase().includes(term) ||
        item.materiales.join(" ").toLowerCase().includes(term);

      return byType && byMaterial && byQuick && byPrice && bySearch;
    });
  }, [search, selectedType, selectedMaterial, quickFilter, maxPrice]);

  const modalPrice = useMemo(() => {
    if (!activeProduct || !selectedModalMaterial) {
      return 0;
    }
    return MATERIAL_PRICES[selectedModalMaterial] ?? activeProduct.precioBase;
  }, [activeProduct, selectedModalMaterial]);

  const modalDays = 5;

  const modalAvailability = { label: "Listo en 5 dias habiles", className: "bg-blue-100 text-blue-700" };
  const modalEstimatedTotal = modalPrice * selectedQty;

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.total, 0),
    [cartItems]
  );
  const cartTax = Math.round(cartSubtotal * 0.19);
  const cartGrandTotal = cartSubtotal + cartTax;

  const openProduct = (product) => {
    setActiveProduct(product);
    setSelectedColor(product.colores[0] ?? "A1");
    setSelectedModalMaterial(product.materiales[0] ?? "");
    setSelectedConnection("");
    setSelectedQty(1);
    setIsDetailOpen(true);
  };

  const addToCart = () => {
    if (!isDetailOpen || !activeProduct || !selectedModalMaterial || selectedQty < 1) {
      return;
    }

    const unitPrice = modalPrice;
      const tempKey = `temp-${Date.now()}-${Math.random()}`;

      setModalCartItems((prev) => [
        ...prev,
        {
          key: tempKey,
          name: activeProduct.nombre,
          color: selectedColor,
          material: selectedModalMaterial,
          connection: selectedConnection.trim(),
          qty: selectedQty,
          unitPrice,
          total: unitPrice * selectedQty,
        },
      ]);

      setShowAddedNotification(true);
      setTimeout(() => setShowAddedNotification(false), 2000);

      setSelectedModalMaterial(activeProduct.materiales[0] ?? "");
      setSelectedColor(activeProduct.colores[0] ?? "A1");
      setSelectedConnection("");
      setSelectedQty(1);
  };

    const finalizarModalAndGoToCart = () => {
      if (modalCartItems.length > 0) {
        setCartItems((prev) => [...prev, ...modalCartItems]);
      }

      setModalCartItems([]);
      setIsDetailOpen(false);
      setFlowStep("cart");
    };

    const closeModalWithoutSaving = () => {
      setModalCartItems([]);
      setIsDetailOpen(false);
    };
  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updatePatientField = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePatientData = () => {
    const required = ["fecha", "orden", "doctor", "paciente", "rut", "telefono", "email"];

    const missingField = required.find((field) => !String(patientData[field] || "").trim());
    if (missingField) {
      return "Completa todos los campos obligatorios del paciente antes de continuar.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientData.email.trim())) {
      return "Ingresa un correo electronico valido para el paciente.";
    }

    return "";
  };

  const buildQuoteData = () => ({
    folio: `DIT-${Date.now().toString().slice(-6)}`,
    emitida: new Date().toLocaleString("es-CL"),
    paciente: patientData,
    items: cartItems,
    subtotal: cartSubtotal,
    iva: cartTax,
    total: cartGrandTotal,
  });

  const generateRehabOrder = (rehabData) => {
    const nextSequence = orderSequence + 1;
    const nextOrderId = buildCorrelativeOrderId(nextSequence);

    setOrderSequence(nextSequence);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ditOrderSequence", String(nextSequence));
    }

    setCurrentOrder({
      idOrden: nextOrderId,
      producto: {
        id: null,
        nombre: rehabData.nombre,
        tipoProducto: `Rehabilitación — ${rehabData.modulo}`,
        material: rehabData.material,
        color: "",
        detalle: rehabData.detalle,
      },
      piezas: rehabData.piezas,
      archivos: [],
    });

    setPatientData((prev) => ({ ...prev, orden: nextOrderId }));
    setSubmissionResult(null);
    setFormError("");
  };

  const resetRehabOrder = () => {
    setCurrentOrder(null);
    setSubmissionResult(null);
    setFormError("");
    setIsFileDragOver(false);
    setRehabSelectorVersion((prev) => prev + 1);
  };

  const appendFilesToCurrentOrder = (incomingFiles) => {
    if (!currentOrder) {
      return;
    }

    const validFiles = Array.from(incomingFiles).filter((file) => isValidDentalFile(file.name));
    if (!validFiles.length) {
      setFormError("Solo se permiten archivos STL, DCM, DICOM o ZIP.");
      return;
    }

    setCurrentOrder((prev) => {
      if (!prev) {
        return prev;
      }

      const preparedFiles = validFiles.map((file) => ({
        idArchivo: `${prev.idOrden}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        idOrden: prev.idOrden,
        nombre: file.name,
        tipo: file.type || "application/octet-stream",
        pesoBytes: file.size,
        file,
      }));

      return {
        ...prev,
        archivos: [...prev.archivos, ...preparedFiles],
      };
    });

    setFormError("");
  };

  const handleFileInputChange = (event) => {
    appendFilesToCurrentOrder(event.target.files || []);
    event.target.value = "";
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsFileDragOver(false);
    appendFilesToCurrentOrder(event.dataTransfer.files || []);
  };

  const removeOrderFile = (idArchivo) => {
    setCurrentOrder((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        archivos: prev.archivos.filter((file) => file.idArchivo !== idArchivo),
      };
    });
  };

  const goToCart = () => {
    setFormError("");
    setFlowStep("cart");
  };

  const goToMenu = () => {
    setFormError("");
    setFlowStep("selection");
  };

  const goToPatientForm = () => {
    if (!cartItems.length && !currentOrder) {
      setFormError("Debes agregar un producto al carrito o generar una orden para continuar.");
      return;
    }

    setFormError("");
    setFlowStep("patient");
  };

  const completePatientStep = () => {
    if (!cartItems.length && !currentOrder) {
      setFormError("Debes agregar un producto al carrito o generar una orden antes de continuar.");
      setFlowStep("cart");
      return;
    }

    setFormError("");
    setQuoteView(buildQuoteData());
    setFlowStep("final");
  };

  const emitQuote = () => {
    const validationMessage = validatePatientData();
    if (validationMessage) {
      setFormError(validationMessage);
      setFlowStep("patient");
      return;
    }

    if (!cartItems.length) {
      setFormError("Agrega al menos un producto al carrito para emitir la cotizacion.");
      setFlowStep("cart");
      return;
    }

    setFormError("");
    setQuoteView(buildQuoteData());
  };

  const enviarCotizacion = () => {
    if (!currentOrder) {
      setFormError("Primero debes generar un numero de orden con la configuracion del producto.");
      setFlowStep("selection");
      return;
    }

    const payload = {
      idOrden: currentOrder.idOrden,
      paciente: {
        ...patientData,
        orden: currentOrder.idOrden,
      },
      configuracionProducto: currentOrder.producto,
      piezas: currentOrder.piezas,
      archivos: currentOrder.archivos.map((file) => ({
        idArchivo: file.idArchivo,
        idOrden: file.idOrden,
        nombre: file.nombre,
        tipo: file.tipo,
        pesoBytes: file.pesoBytes,
      })),
      carrito: cartItems,
    };

    setSubmissionResult({
      ok: true,
      mensaje: "Cotizacion enviada correctamente.",
      fechaEnvio: new Date().toLocaleString("es-CL"),
      payload,
    });
    setFormError("");
  };

  const downloadQuotePdf = () => {
    if (!cartItems.length) {
      setFormError("Agrega al menos un producto al carrito para descargar la cotizacion.");
      setFlowStep("cart");
      return;
    }

    setFormError("");
    const quoteData = buildQuoteData();
    setQuoteView(quoteData);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 46;

    drawDitLogo(doc, 40, y - 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Cotizacion Laboratorio DIT", 148, y);

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Folio: ${quoteData.folio}`, 148, y);
    doc.text(`Fecha emision: ${quoteData.emitida}`, 340, y);

    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Datos del paciente", 40, y);

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${quoteData.paciente.fecha || "-"}`, 40, y);
    doc.text(`N de Orden: ${quoteData.paciente.orden || "-"}`, 280, y);

    y += 14;
    doc.text(`Doctor(a): ${quoteData.paciente.doctor || "-"}`, 40, y);
    doc.text(`Paciente: ${quoteData.paciente.paciente || "-"}`, 280, y);

    y += 14;
    doc.text(`Rut Paciente: ${quoteData.paciente.rut || "-"}`, 40, y);
    doc.text(`Telefono: ${quoteData.paciente.telefono || "-"}`, 280, y);

    y += 14;
    doc.text(`Correo electronico: ${quoteData.paciente.email || "-"}`, 40, y);

    y += 24;
    autoTable(doc, {
      startY: y,
      head: [["Producto", "Cant.", "Material", "Tipo de conexion", "Precio neto", "Subtotal"]],
      body: quoteData.items.map((item) => [
        item.name,
        String(item.qty),
        item.material,
        item.connection || "-",
        formatCLP(item.unitPrice),
        formatCLP(item.total),
      ]),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [0, 94, 184] },
    });

    const tableEndY = doc.lastAutoTable?.finalY ?? y + 120;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Neto: ${formatCLP(quoteData.subtotal)}`, 40, tableEndY + 24);
    doc.text(`IVA (19%): ${formatCLP(quoteData.iva)}`, 40, tableEndY + 40);
    doc.text(`Total: ${formatCLP(quoteData.total)}`, 40, tableEndY + 56);

    doc.save(`cotizacion-${quoteData.folio}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#005eb8]">Laboratorio DIT</p>
            <h1 className="text-lg font-extrabold">Cotizador Rehabilitación</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {formError && <p className="mb-4 text-sm font-semibold text-rose-600">{formError}</p>}

        {flowStep === "selection" && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Configuracion de orden</h2>

              <RehabilitacionSelector
                key={`rehab-selector-${rehabSelectorVersion}`}
                onConfirm={generateRehabOrder}
                onError={setFormError}
              />
            </aside>

            <section className="space-y-6">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Orden Activa</h2>

                {currentOrder ? (
                  <>
                    <div className="flex flex-col gap-4 text-sm text-emerald-700 sm:flex-row">
                      <div className="flex-1 space-y-1.5">
                        <p><span className="font-semibold">Numero de orden:</span> {currentOrder.idOrden}</p>
                      </div>
                      <div className="hidden w-px bg-emerald-200 sm:block" />
                      <div className="flex-1 space-y-1.5">
                        <p><span className="font-semibold">Producto:</span> {currentOrder.producto.nombre}</p>
                        <p><span className="font-semibold">Material:</span> {currentOrder.producto.material}</p>
                        {currentOrder.producto.detalle?.tipoProtesis && (
                          <p><span className="font-semibold">Tipo de prótesis:</span> {currentOrder.producto.detalle.tipoProtesis}</p>
                        )}
                        {currentOrder.producto.detalle?.subtipoTrabajo && (
                          <p><span className="font-semibold">Subtipo:</span> {currentOrder.producto.detalle.subtipoTrabajo}</p>
                        )}
                        {currentOrder.producto.detalle?.subtipo && (
                          <p><span className="font-semibold">Detalle disilicato:</span> {currentOrder.producto.detalle.subtipo}</p>
                        )}
                        {currentOrder.producto.detalle?.receta && (
                          <p><span className="font-semibold">Receta:</span> {currentOrder.producto.detalle.receta}</p>
                        )}
                        {currentOrder.producto.detalle?.recetaArchivo && (
                          <p><span className="font-semibold">Archivo receta:</span> {currentOrder.producto.detalle.recetaArchivo}</p>
                        )}
                        {currentOrder.producto.detalle?.pilar && (
                          <p>
                            <span className="font-semibold">Pilar:</span> {currentOrder.producto.detalle.pilar}
                            {currentOrder.producto.detalle.pilarOpcion ? ` — ${currentOrder.producto.detalle.pilarOpcion}` : ""}
                          </p>
                        )}
                        {currentOrder.producto.detalle?.corona && (
                          <p>
                            <span className="font-semibold">Corona:</span> {currentOrder.producto.detalle.corona}
                            {currentOrder.producto.detalle.coronaIncluyeCeramica ? " + Incluye cerámica" : ""}
                            {currentOrder.producto.detalle.coronaSubopcion ? ` + ${currentOrder.producto.detalle.coronaSubopcion}` : ""}
                          </p>
                        )}
                        {currentOrder.producto.detalle?.tornillo && (
                          <p><span className="font-semibold">Tornillo:</span> {currentOrder.producto.detalle.tornillo}</p>
                        )}
                        {currentOrder.producto.color ? (
                          <p><span className="font-semibold">Color:</span> {currentOrder.producto.color}</p>
                        ) : null}
                        <p>
                          <span className="font-semibold">Piezas:</span>{" "}
                          {currentOrder.producto.detalle?.incluyeSeleccionPiezas
                            ? currentOrder.piezas.join(", ") || "-"
                            : "No seleccionadas"}
                        </p>
                        {MATERIAL_PRICES[currentOrder.producto.material] && currentOrder.piezas.length > 0 && (
                          <p className="pt-1 text-base font-extrabold text-emerald-700">
                            Total estimado: {formatCLP(MATERIAL_PRICES[currentOrder.producto.material] * currentOrder.piezas.length)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={resetRehabOrder}
                        className="flex-1 rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Nueva orden
                      </button>
                      <button
                        type="button"
                        onClick={completePatientStep}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Cotizar
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-emerald-700/80">
                    Aun no hay una orden activa. Configura una nueva seleccion para continuar.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                    Carga de archivos del caso
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      currentOrder ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {currentOrder ? `Orden activa: ${currentOrder.idOrden}` : "Genera una orden para asociar archivos"}
                  </span>
                </div>

                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (currentOrder) {
                      setIsFileDragOver(true);
                    }
                  }}
                  onDragLeave={() => setIsFileDragOver(false)}
                  onDrop={currentOrder ? handleFileDrop : (event) => event.preventDefault()}
                  className={`block rounded-2xl border-2 border-dashed p-6 text-center transition ${
                    currentOrder
                      ? isFileDragOver
                        ? "border-[#005eb8] bg-blue-50"
                        : "border-slate-300 bg-slate-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-100"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Arrastra archivos aqui o selecciona desde tu equipo
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Formatos permitidos: STL, DCM, DICOM y ZIP
                  </p>

                  <input
                    type="file"
                    accept={DENTAL_FILE_ACCEPT}
                    multiple
                    disabled={!currentOrder}
                    onChange={handleFileInputChange}
                    className="mt-4 block mx-auto text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#005eb8] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed"
                  />
                </label>

                {currentOrder && currentOrder.archivos.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">Archivos cargados</p>
                      <span className="text-xs font-bold text-slate-500">
                        {currentOrder.archivos.length} archivo(s)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {currentOrder.archivos.map((file) => (
                          <div
                            key={file.idArchivo}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-700">{file.nombre}</p>
                              <p className="text-xs text-slate-500">
                                {(file.pesoBytes / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOrderFile(file.idArchivo)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {flowStep === "cart" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Resumen de carrito</h2>
              <button
                type="button"
                onClick={() => setFlowStep("selection")}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Seguir agregando productos
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Aun no agregas productos. Vuelve al catalogo para continuar.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3">Material</th>
                        <th className="px-4 py-3">Tipo de Conexion</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {cartItems.map((item) => (
                        <tr key={item.key}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.qty}</td>
                          <td className="px-4 py-3">{item.material}</td>
                          <td className="px-4 py-3">{item.connection || "-"}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCLP(item.total)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.key)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 ml-auto max-w-sm space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Neto</span>
                    <span className="font-semibold">{formatCLP(cartSubtotal)}</span>
                  </p>
                  <p className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">IVA (19%)</span>
                    <span className="font-semibold">{formatCLP(cartTax)}</span>
                  </p>
                  <p className="flex items-center justify-between text-base font-extrabold text-[#005eb8]">
                    <span>Total general</span>
                    <span>{formatCLP(cartGrandTotal)}</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={completePatientStep}
                    className="rounded-xl bg-[#005eb8] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Continuar
                  </button>
                  <button
                    type="button"
                    onClick={goToMenu}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
                  >
                    Volver al menu de productos
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {flowStep === "final" && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                Acciones finales
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Datos completados. Ahora puedes emitir la cotizacion en pantalla o descargar el PDF completo.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enviarCotizacion}
                  className="rounded-xl bg-[#005eb8] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#004f9b]"
                >
                  Enviar cotizacion
                </button>
                <button
                  type="button"
                  onClick={downloadQuotePdf}
                  className="rounded-xl border-2 border-[#005eb8] bg-white px-5 py-3 text-sm font-bold text-[#005eb8] hover:bg-blue-50"
                >
                  Descargar cotizacion PDF
                </button>

              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Resumen para cotizacion</h2>
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <p><span className="font-semibold">Fecha:</span> {patientData.fecha}</p>
                <p><span className="font-semibold">N de Orden:</span> {patientData.orden}</p>
                <p><span className="font-semibold">Doctor(a):</span> {patientData.doctor}</p>
                <p><span className="font-semibold">Paciente:</span> {patientData.paciente}</p>
                <p><span className="font-semibold">RUT:</span> {patientData.rut}</p>
                <p><span className="font-semibold">Telefono:</span> {patientData.telefono}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Correo:</span> {patientData.email}</p>
              </div>
            </div>

            {submissionResult?.ok && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Envio exitoso</h2>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                    {submissionResult.payload.idOrden}
                  </span>
                </div>
                <p className="mt-2 text-sm text-emerald-700">{submissionResult.mensaje}</p>
                <p className="text-xs text-emerald-700">Fecha de envio: {submissionResult.fechaEnvio}</p>

                <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-white p-3 text-sm">
                  <p><span className="font-semibold">Paciente:</span> {submissionResult.payload.paciente.paciente}</p>
                  <p><span className="font-semibold">Doctor(a):</span> {submissionResult.payload.paciente.doctor}</p>
                  <p><span className="font-semibold">Producto:</span> {submissionResult.payload.configuracionProducto.nombre}</p>
                  <p><span className="font-semibold">Tipo:</span> {submissionResult.payload.configuracionProducto.tipoProducto}</p>
                  <p><span className="font-semibold">Material:</span> {submissionResult.payload.configuracionProducto.material}</p>
                  <p><span className="font-semibold">Color:</span> {submissionResult.payload.configuracionProducto.color}</p>
                  <p><span className="font-semibold">Piezas:</span> {submissionResult.payload.piezas.join(", ")}</p>
                  <p><span className="font-semibold">Archivos asociados:</span> {submissionResult.payload.archivos.length}</p>
                  {submissionResult.payload.archivos.length > 0 && (
                    <div className="rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
                      {submissionResult.payload.archivos.map((file) => (
                        <p key={file.idArchivo}>{file.nombre} ({file.idOrden})</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {quoteView && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Cotizacion emitida</h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {quoteView.folio}
                  </span>
                </div>

                <div className="space-y-2">
                  {quoteView.items.map((item) => (
                    <div key={`quote-${item.key}`} className="flex items-start justify-between rounded-xl border border-slate-200 p-3 text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-500">
                          {item.material} · Tipo de conexion {item.connection || "-"} · Cantidad {item.qty}
                        </p>
                      </div>
                      <p className="font-bold text-[#005eb8]">{formatCLP(item.total)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
                  <p className="flex justify-between"><span>Neto</span><span className="font-semibold">{formatCLP(quoteView.subtotal)}</span></p>
                  <p className="flex justify-between"><span>IVA (19%)</span><span className="font-semibold">{formatCLP(quoteView.iva)}</span></p>
                  <p className="flex justify-between text-base font-extrabold text-[#005eb8]"><span>Total</span><span>{formatCLP(quoteView.total)}</span></p>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={goToMenu}
                    className="w-full rounded-xl bg-[#005eb8] px-4 py-3 text-sm font-bold text-white hover:bg-[#004f9b]"
                  >
                    Finalizar cotizacion
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {isDetailOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-4 transition-opacity sm:items-center">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-transform">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#005eb8]">Detalle de seleccion</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-800">{activeProduct.nombre}</h3>
                <p className="mt-1 text-sm text-slate-500">{activeProduct.tipoProducto} · {activeProduct.morfologia}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
                            <button
                              type="button"
                              onClick={modalCartItems.length > 0 ? finalizarModalAndGoToCart : closeModalWithoutSaving}
                              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                                modalCartItems.length > 0
                                  ? "bg-[#005eb8] text-white hover:bg-[#004f9b]"
                                  : "border border-slate-300 text-slate-600"
                              }`}
                            >
                              {modalCartItems.length > 0 ? `Finalizar y ver carrito (${modalCartItems.length})` : "Cerrar"}
                            </button>
                          </div>

                          {showAddedNotification && (
                            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 flex items-center gap-2">
                              <span>✓</span>
                              ¡Agregado! Puedes configurar otro material
                            </div>
                          )}

                          {modalCartItems.length > 0 && (
                            <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm">
                              <p className="font-semibold text-blue-700">📋 {modalCartItems.length} producto(s) en lista</p>
                              <div className="mt-2 space-y-1 text-xs text-blue-600">
                                {modalCartItems.map((item) => (
                                  <p key={item.key}>
                                    {item.name} x {item.qty} ({item.material}) - {formatCLP(item.total)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Color</p>
                <div className="flex flex-wrap gap-2.5">
                  {activeProduct.colores.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`relative h-10 w-10 rounded-full border-2 text-[11px] font-bold ${
                        selectedColor === color
                          ? "border-[#005eb8] ring-4 ring-blue-100"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: COLOR_SWATCH[color] ?? "#e2e8f0" }}
                    >
                      <span className="absolute inset-0 grid place-items-center">{color}</span>
                    </button>
                  ))}
                </div>

                <p className="mb-2 mt-6 text-sm font-semibold text-slate-700">Material</p>
                <div className="flex flex-wrap gap-2">
                  {activeProduct.materiales.map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => setSelectedModalMaterial(material)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                        selectedModalMaterial === material
                          ? "border-[#005eb8] bg-[#005eb8] text-white"
                          : "border-slate-300 text-slate-600"
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>

                <p className="mb-2 mt-6 text-sm font-semibold text-slate-700">Cantidad</p>
                <div className="inline-flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQty((prev) => Math.max(1, prev - 1))}
                    className="h-8 w-8 rounded-lg border border-slate-300 text-lg font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center text-lg font-bold text-slate-800">{selectedQty}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQty((prev) => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-[#005eb8] bg-[#005eb8] text-lg font-bold text-white"
                  >
                    +
                  </button>
                </div>

                <label className="mt-6 block text-sm font-semibold text-slate-700">
                  Tipo de Conexion
                  <span className="mt-2 block text-xs font-medium text-slate-500">Escribe el tipo de conexion</span>
                  <textarea
                    value={selectedConnection}
                    onChange={(event) => setSelectedConnection(event.target.value)}
                    placeholder="Escribe el tipo de conexion"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Resumen de configuracion</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Color: <span className="font-semibold text-slate-800">{selectedColor}</span></p>
                  <p>Material: <span className="font-semibold text-slate-800">{selectedModalMaterial}</span></p>
                  <p>Tipo de Conexion: <span className="font-semibold text-slate-800">{selectedConnection || "-"}</span></p>
                </div>

                <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${modalAvailability.className}`}>
                  {modalAvailability.label}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Precio estimado</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#005eb8]">{formatCLP(modalEstimatedTotal)}</p>
                  <p className="mt-1 text-xs text-slate-500">Valor unitario: {formatCLP(modalPrice)}</p>
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  className="mt-4 w-full rounded-xl bg-[#005eb8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004f9b]"
                >
                  Agregar al carrito
                </button>
                              <div className="mt-4 flex flex-col gap-2">
                                {modalCartItems.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={finalizarModalAndGoToCart}
                                    className="w-full rounded-xl bg-[#005eb8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004f9b]"
                                  >
                                    Finalizar ({modalCartItems.length} items)
                                  </button>
                                )}
                              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


