import { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RehabilitacionSelector from "./RehabilitacionSelector";
import logoDIT from "./img/logoDIT.jpeg";

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

function getOrderMaterialSummary(order) {
  const detail = order?.producto?.detalle;
  if (!detail) {
    return order?.producto?.material ?? "-";
  }

  if (detail.material) {
    const parts = [detail.material];
    if (detail.sku) {
      parts.push(`SKU ${detail.sku}`);
    }
    if (detail.subtipo) {
      parts.push(detail.subtipo);
    }
    if (detail.color) {
      parts.push(`Color ${detail.color}`);
    }
    return parts.join("  —  ");
  }

  if (detail.pilar) {
    const parts = [detail.pilar];
    if (detail.pilarMaterial) {
      parts.push(detail.pilarMaterial);
    }
    if (detail.color) {
      parts.push(`Color ${detail.color}`);
    }
    return parts.join(" — ");
  }

  if (detail.corona) {
    const parts = [detail.corona];
    if (detail.color) {
      parts.push(`Color ${detail.color}`);
    }
    return parts.join(" — ");
  }

  return order?.producto?.material ?? "-";
}

function getOrderApproximateTotal(order) {
  const detail = order?.producto?.detalle;
  if (!detail) {
    return null;
  }

  if (typeof detail.precio === "number") {
    return detail.requiereCantidadEspecial && detail.cantidadEspecial
      ? detail.precio * detail.cantidadEspecial
      : detail.precio;
  }

  if (typeof detail.precioCorona === "number") {
    return detail.precioCorona;
  }

  return null;
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
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  
  // Sistema de cupones
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Modal de correo para cupón
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalInput, setEmailModalInput] = useState("");
  const [emailModalError, setEmailModalError] = useState("");
  const [couponRevealed, setCouponRevealed] = useState(false);
  
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
  const activeOrderMaterialSummary = currentOrder ? getOrderMaterialSummary(currentOrder) : "-";
  const activeOrderApproximateTotal = currentOrder ? getOrderApproximateTotal(currentOrder) : null;

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.total, 0),
    [cartItems]
  );
  const cartTax = Math.round(cartSubtotal * 0.19);
  const cartGrandTotal = cartSubtotal + cartTax;
  
  // Calcular total con descuento si hay cupón aplicado
  const discountAmount = appliedCoupon ? Math.round(cartGrandTotal * appliedCoupon.discount) : 0;
  const finalTotal = cartGrandTotal - discountAmount;

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

  // Generar cupón automáticamente cuando se ingresa email válido
  const generateCouponFromEmail = useCallback((email) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !generatedCoupon) {
      const couponCode = `BIENVENIDO10`;
      setGeneratedCoupon({
        code: couponCode,
        discount: 0.10,
        email: email
      });
      setCouponMessage("");
    }
  }, [generatedCoupon]);

  // Watcher para email válido - generar cupón automático
  useEffect(() => {
    if (patientData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      generateCouponFromEmail(patientData.email);
    }
  }, [patientData.email, generateCouponFromEmail]);

  // Aplicar cupón
  const applyCoupon = () => {
    const inputCode = couponInput.trim().toUpperCase();
    
    if (!inputCode) {
      setCouponMessage("Ingresa un código de cupón");
      return;
    }

    if (generatedCoupon && inputCode === generatedCoupon.code) {
      setAppliedCoupon(generatedCoupon);
      setCouponMessage("¡Cupón aplicado exitosamente!");
    } else {
      setCouponMessage("Cupón inválido");
      setAppliedCoupon(null);
    }
  };

  // Remover cupón aplicado
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage("");
  };

  const handleCotizarClick = () => {
    setEmailModalInput(patientData.email || "");
    setEmailModalError("");
    setCouponRevealed(!!generatedCoupon);
    setShowEmailModal(true);
  };

  const handleEmailModalSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailModalInput.trim())) {
      setEmailModalError("Ingresa un correo electrónico válido.");
      return;
    }
    updatePatientField("email", emailModalInput.trim());
    if (!generatedCoupon) {
      setGeneratedCoupon({ code: "BIENVENIDO10", discount: 0.10, email: emailModalInput.trim() });
    }
    setEmailModalError("");
    setCouponRevealed(true);
  };

  const handleEmailModalContinue = () => {
    setShowEmailModal(false);
    setFlowStep("selection");
  };

  const buildQuoteData = () => ({
    folio: `DIT-${Date.now().toString().slice(-6)}`,
    emitida: new Date().toLocaleString("es-CL"),
    paciente: patientData,
    items: cartItems,
    subtotal: cartSubtotal,
    iva: cartTax,
    total: cartGrandTotal,
    cupon: appliedCoupon ? {
      codigo: appliedCoupon.code,
      descuento: appliedCoupon.discount,
      montoDescuento: discountAmount
    } : null,
    totalConDescuento: finalTotal,
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
    setOrderConfirmed(true);
    setFlowStep("confirmation");
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
    doc.text("Cotizacion DIT", 148, y);

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
    
    let finalY = tableEndY + 40;
    
    if (quoteData.cupon) {
      finalY += 16;
      doc.setTextColor(34, 139, 34);
      doc.text(`Cupon aplicado (${quoteData.cupon.codigo}):`, 40, finalY);
      doc.text(`-${formatCLP(quoteData.cupon.montoDescuento)}`, 320, finalY);
      doc.setTextColor(0, 0, 0);
      finalY += 16;
      doc.text(`Total con descuento: ${formatCLP(quoteData.totalConDescuento)}`, 40, finalY);
    } else {
      finalY += 16;
      doc.text(`Total: ${formatCLP(quoteData.total)}`, 40, finalY);
    }

    doc.save(`cotizacion-${quoteData.folio}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logoDIT} alt="Logo DIT" className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F58BC]">Cotización DIT</p>
              <h1 className="text-lg font-extrabold">Cotizador Rehabilitación</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {formError && <p className="mb-4 text-sm font-semibold text-rose-600">{formError}</p>}

        {flowStep === "selection" && (
          <div className="grid gap-6 lg:grid-cols-[370px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#999999]">Configuración de orden</h2>

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
                        <p><span className="font-semibold">Material:</span> {activeOrderMaterialSummary}</p>
                        {currentOrder.producto.detalle?.sku && (
                          <p><span className="font-semibold">SKU:</span> {currentOrder.producto.detalle.sku}</p>
                        )}
                        {currentOrder.producto.detalle?.tipoProtesis && (
                          <p><span className="font-semibold">Tipo de rehabilitación:</span> {currentOrder.producto.detalle.tipoProtesis}</p>
                        )}
                        {currentOrder.producto.detalle?.coronasPuente && (
                          <p><span className="font-semibold">Corona(s):</span> {currentOrder.producto.detalle.coronasPuente}</p>
                        )}
                        {currentOrder.producto.detalle?.ponticosPuente && (
                          <p><span className="font-semibold">Póntico(s):</span> {currentOrder.producto.detalle.ponticosPuente}</p>
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
                        {activeOrderApproximateTotal !== null && (
                          <p className="pt-1 text-base font-extrabold text-emerald-700">
                            Total aproximado {formatCLP(activeOrderApproximateTotal)}
                          </p>
                        )}
                        <p className="pt-1 text-xs text-emerald-700/80">
                          La cotizacion puede estar sujeta a cambios.
                        </p>
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
                        onClick={handleCotizarClick}
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
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#999999]">
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
                        ? "border-[#2F58BC] bg-[#2F58BC]/5"
                        : "border-slate-300 bg-slate-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-100"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Arrastra archivos aqui o selecciona desde tu equipo
                  </p>
                  <p className="mt-1 text-xs text-[#999999]">
                    Formatos permitidos: STL, DCM, DICOM y ZIP
                  </p>

                  <input
                    type="file"
                    accept={DENTAL_FILE_ACCEPT}
                    multiple
                    disabled={!currentOrder}
                    onChange={handleFileInputChange}
                    className="mt-4 block mx-auto text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2F58BC] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed"
                  />
                </label>

                {currentOrder && currentOrder.archivos.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">Archivos cargados</p>
                      <span className="text-xs font-bold text-[#999999]">
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
                              <p className="text-xs text-[#999999]">
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
                )}              </div>

              {/* Card del cupón generado */}
              {generatedCoupon && (
                <div className="mt-6 rounded-3xl border-2 border-dashed border-[#3366FF] bg-[#3366FF]/5 p-6 shadow-sm text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#2F58BC] flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#2F58BC] mb-2">¡Cupón de Bienvenida!</h3>
                  <p className="text-sm text-[#999999] mb-3">Gracias por registrar tu email</p>
                  <div className="inline-block bg-white border-2 border-dashed border-[#2F58BC] rounded-lg px-6 py-3">
                    <p className="text-xs font-semibold text-[#999999] mb-1">CÓDIGO DEL CUPÓN</p>
                    <p className="text-2xl font-extrabold text-[#2F58BC] tracking-wider">{generatedCoupon.code}</p>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-700">10% de descuento en tu compra</p>
                  <p className="mt-1 text-xs text-[#999999]">Aplica este código al finalizar tu orden</p>
                </div>
              )}
            </section>
          </div>
        )}

        {flowStep === "cart" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#999999]">Resumen de carrito</h2>
              <button
                type="button"
                onClick={() => setFlowStep("selection")}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Seguir agregando productos
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-[#999999]">
                Aun no agregas productos. Vuelve al catalogo para continuar.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[#999999]">
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
                  
                  {/* Sección para aplicar cupón */}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-[#999999] mb-2">¿Tienes un cupón?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Ingresa tu código"
                        disabled={!!appliedCoupon}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                      {!appliedCoupon ? (
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="rounded-lg bg-[#2F58BC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3366FF] transition-colors"
                        >
                          Aplicar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    {couponMessage && (
                      <p className={`mt-2 text-xs font-semibold ${
                        appliedCoupon ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  {appliedCoupon && (
                    <p className="flex items-center justify-between text-sm text-emerald-600">
                      <span className="font-semibold">Descuento (10%)</span>
                      <span className="font-semibold">-{formatCLP(discountAmount)}</span>
                    </p>
                  )}
                  
                  <p className="flex items-center justify-between text-base font-extrabold text-[#2F58BC]">
                    <span>Total general</span>
                    <span>{formatCLP(finalTotal)}</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={completePatientStep}
                    className="rounded-xl bg-[#2F58BC] px-4 py-2.5 text-sm font-bold text-white"
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

        {flowStep === "confirmation" && orderConfirmed && (
          <section className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm text-center">
              <div className="mb-6">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-200 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-2xl font-extrabold text-emerald-700">¡Orden Lista!</h2>
              </div>

              <p className="text-lg text-emerald-700 mb-2">
                Tu orden ha sido registrada y enviada correctamente.
              </p>

              <p className="text-sm text-emerald-600 mb-8">
                <strong>Nº de Orden:</strong> {currentOrder?.idOrden || patientData.orden}
              </p>

              {appliedCoupon && (
                <div className="mb-6 rounded-xl border border-[#3366FF]/20 bg-[#3366FF]/5 p-4">
                  <p className="text-sm font-semibold text-[#2F58BC] mb-1">✨ Cupón aplicado</p>
                  <p className="text-xs text-[#999999]">
                    Código: <span className="font-bold">{appliedCoupon.code}</span> - Descuento: 10%
                  </p>
                  <p className="text-lg font-bold text-emerald-600 mt-2">
                    Ahorraste {formatCLP(discountAmount)}
                  </p>
                </div>
              )}

              <p className="text-lg font-semibold text-emerald-700 mb-8">
                ¡Gracias por tu cotización!
              </p>

              <button
                type="button"
                onClick={() => {
                  setOrderConfirmed(false);
                  setCartItems([]);
                  setCurrentOrder(null);
                  setFlowStep("selection");
                }}
                className="w-full rounded-xl bg-[#2F58BC] px-6 py-3 text-sm font-bold text-white hover:bg-[#3366FF]"
              >
                Volver al cotizador
              </button>
            </div>
          </section>
        )}

      </main>

      {isDetailOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-4 transition-opacity sm:items-center">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-transform">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F58BC]">Detalle de seleccion</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-800">{activeProduct.nombre}</h3>
                <p className="mt-1 text-sm text-[#999999]">{activeProduct.tipoProducto} — {activeProduct.morfologia}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-[#999999] hover:bg-slate-50"
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
                                  ? "bg-[#2F58BC] text-white hover:bg-[#3366FF]"
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
                            <div className="mt-4 rounded-lg border border-[#3366FF]/20 bg-[#3366FF]/5 p-3 text-sm">
                              <p className="font-semibold text-[#2F58BC]">🛒 {modalCartItems.length} producto(s) en lista</p>
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
                      className={`relative h-10 w-10 rounded-full border-2 text-[11px] font-bold transition-all ${
                        selectedColor === color
                          ? "border-[#2F58BC] ring-4 ring-[#2F58BC]/10"
                          : "border-white hover:border-[#3366FF]"
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
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                        selectedModalMaterial === material
                          ? "border-[#2F58BC] bg-[#2F58BC] text-white"
                          : "border-slate-300 text-slate-600 hover:border-[#3366FF] hover:bg-[#3366FF]/5"
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
                    className="h-8 w-8 rounded-lg border border-slate-300 text-lg font-bold text-slate-700 transition-colors hover:border-[#999999] hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center text-lg font-bold text-slate-800">{selectedQty}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQty((prev) => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-[#2F58BC] bg-[#2F58BC] text-lg font-bold text-white transition-colors hover:bg-[#3366FF]"
                  >
                    +
                  </button>
                </div>

                <label className="mt-6 block text-sm font-semibold text-slate-700">
                  Tipo de Conexion
                  <span className="mt-2 block text-xs font-medium text-[#999999]">Escribe el tipo de conexion</span>
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
                <p className="text-xs font-bold uppercase tracking-wide text-[#999999]">Resumen de configuracion</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Color: <span className="font-semibold text-slate-800">{selectedColor}</span></p>
                  <p>Material: <span className="font-semibold text-slate-800">{selectedModalMaterial}</span></p>
                  <p>Tipo de Conexion: <span className="font-semibold text-slate-800">{selectedConnection || "-"}</span></p>
                </div>

                <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${modalAvailability.className}`}>
                  {modalAvailability.label}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs uppercase tracking-wide text-[#999999]">Precio estimado</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#2F58BC]">{formatCLP(modalEstimatedTotal)}</p>
                  <p className="mt-1 text-xs text-[#999999]">Valor unitario: {formatCLP(modalPrice)}</p>
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  className="mt-4 w-full rounded-xl bg-[#2F58BC] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3366FF]"
                >
                  Agregar al carrito
                </button>
                              <div className="mt-4 flex flex-col gap-2">
                                {modalCartItems.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={finalizarModalAndGoToCart}
                                    className="w-full rounded-xl bg-[#2F58BC] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3366FF]"
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

      {/* Modal de correo para cupón */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            {!couponRevealed && (
              <div key="step-email">
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#2F58BC]/10">
                    <span className="text-3xl">&#9993;</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">Ingresa tu correo</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Recibe un <span className="font-bold text-[#2F58BC]">cupon de 10% de descuento</span> al ingresar tu email.
                  </p>
                </div>

                <input
                  type="email"
                  value={emailModalInput}
                  onChange={(e) => setEmailModalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailModalSubmit()}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#2F58BC] focus:outline-none"
                />
                {emailModalError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{emailModalError}</p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailModalSubmit}
                    className="flex-1 rounded-xl bg-[#2F58BC] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3366FF]"
                  >
                    Obtener cupon
                  </button>
                </div>
              </div>
            )}

            {couponRevealed && (
              <div key="step-cupon">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-4xl">&#127881;</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-emerald-700">Cupon obtenido!</h3>
                  <p className="mt-1 text-sm text-slate-500">Usalo al finalizar tu compra para obtener el descuento</p>
                </div>

                <div className="mt-5 rounded-2xl border-2 border-dashed border-[#2F58BC] bg-[#2F58BC]/5 p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#999999]">Codigo del cupon</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-wider text-[#2F58BC]">
                    {generatedCoupon?.code}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-600">10% de descuento en tu compra</p>
                </div>

                <button
                  type="button"
                  onClick={handleEmailModalContinue}
                  className="mt-5 w-full rounded-xl bg-[#2F58BC] px-4 py-3 text-sm font-bold text-white hover:bg-[#3366FF]"
                >
                  Volver al cotizador
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}






