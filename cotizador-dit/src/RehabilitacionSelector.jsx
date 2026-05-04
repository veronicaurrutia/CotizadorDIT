import { useState, useEffect, useMemo } from "react";
import { REHAB_CONFIG } from "./rehabilitacionData";

const PIEZAS_DENTALES = {
  Superior: ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"],
  Inferior: ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"],
};

const selectClass = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mt-3 block text-xs font-semibold text-slate-600";

function formatCLP(value) {
  return value.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
}

export default function RehabilitacionSelector({ onConfirm, onError }) {
  const [modulo, setModulo] = useState("cementados");
  const [selectedPiezas, setSelectedPiezas] = useState([]);
  const [quiereElegirPiezas, setQuiereElegirPiezas] = useState(false);
  const [piezaModo, setPiezaModo] = useState("manual");

  const cementados = REHAB_CONFIG.cementados;
  const atornillados = REHAB_CONFIG.atornillados;
  const atornilladosPilar = atornillados.componentes.pilar;
  const atornilladosCorona = atornillados.componentes.corona;
  const atornilladosTornillo = atornillados.componentes.tornillo;

  // --- Cementados state ---
  const [cemTipoProtesis, setCemTipoProtesis] = useState("");
  const [cemMaterialId, setCemMaterialId] = useState("");
  const [cemSubtipoId, setCemSubtipoId] = useState("");
  const [cemReceta, setCemReceta] = useState("");
  const [cemColor, setCemColor] = useState("");
  const [cemCantidadEspecial, setCemCantidadEspecial] = useState("");
  const [cemCoronasPuente, setCemCoronasPuente] = useState("");
  const [cemPonticosPuente, setCemPonticosPuente] = useState("");

  // --- Atornillados state ---
  const [atTipoProtesis, setAtTipoProtesis] = useState("Corona sobre implante");
  const [atPilarId, setAtPilarId] = useState(atornilladosPilar.opciones[0].id);
  const [atPilarOpcion, setAtPilarOpcion] = useState(
    atornilladosPilar.opciones[0].variantes?.[0] ?? ""
  );
  const [atAditamentoInfo, setAtAditamentoInfo] = useState("");
  const [atCoronaId, setAtCoronaId] = useState(atornilladosCorona.opciones[0].id);
  const [atCoronaSubopcion, setAtCoronaSubopcion] = useState("");
  const [atColor, setAtColor] = useState("");
  const [atTornillo, setAtTornillo] = useState(atornilladosTornillo.opciones[0]);
  const [atIncluyeTornillos, setAtIncluyeTornillos] = useState("sin");

  // Derived — cementados
  const cemMaterial = cementados.materiales.find((m) => m.id === cemMaterialId);
  const cemSubtipo = cemMaterial?.subOpciones?.find((s) => s.id === cemSubtipoId);
  const casosCementados = cementados.casos ?? [];
  const tiposCementados = cementados.tiposRehabilitacion ?? cementados.tiposProtesis ?? [];
  const tiposAtornillados = atornillados.tiposRehabilitacion ?? [];
  const materialHabilitado = Boolean(cemTipoProtesis);
  const materialIdsPorTipo = casosCementados
    .filter((caso) => caso.tipo === cemTipoProtesis)
    .map((caso) => caso.materialId);
  const materialesCementadosDisponibles = materialIdsPorTipo.length > 0
    ? cementados.materiales.filter((material) => materialIdsPorTipo.includes(material.id))
    : cementados.materiales;
  const casoCementado = casosCementados.find(
    (caso) => caso.tipo === cemTipoProtesis && caso.materialId === cemMaterialId
  );
  console.log("🟢 casoCementado recalculado:", casoCementado);
  console.log("🟢 cemTipoProtesis:", cemTipoProtesis, "cemMaterialId:", cemMaterialId);
  console.log("🟢 casoCementado.precio:", casoCementado?.precio);
  const requiereCamposPuente = Boolean(casoCementado?.requierePuente);
  const requierePrecioByPieza = Boolean(casoCementado?.precioByPieza);
  const piezaTotal = requierePrecioByPieza
    ? selectedPiezas.length * (casoCementado?.precio ?? 0)
    : null;
  const puenteTotal = requiereCamposPuente
    ? (Number(cemCoronasPuente) || 0) * (casoCementado?.precio ?? 0)
      + (Number(cemPonticosPuente) || 0) * (casoCementado?.precioPontico ?? 0)
    : null;

  const handleTipoProtesisChange = (value) => {
    const materialIds = casosCementados
      .filter((caso) => caso.tipo === value)
      .map((caso) => caso.materialId);
    const materialPorDefecto = materialIds.length === 1 ? materialIds[0] : "";
    const nextMaterial = cementados.materiales.find((material) => material.id === materialPorDefecto);

    setCemTipoProtesis(value);
    setCemMaterialId(materialPorDefecto);
    setCemSubtipoId(nextMaterial?.subOpciones?.[0]?.id ?? "");
    setCemReceta("");
    setCemColor("");
    setCemCantidadEspecial("");
    setCemCoronasPuente("");
    setCemPonticosPuente("");
    setQuiereElegirPiezas(false);
    setPiezaModo("manual");
    setSelectedPiezas([]);
    onError("");
  };

  const handleMaterialChange = (value) => {
    console.log("🔵 handleMaterialChange called with:", value);
    const nextMaterial = cementados.materiales.find((material) => material.id === value);
    console.log("🔵 nextMaterial:", nextMaterial);
    setCemMaterialId(value);
    setCemSubtipoId(nextMaterial?.subOpciones?.[0]?.id ?? "");
    setCemReceta("");
    setCemCantidadEspecial("");
    setCemCoronasPuente("");
    setCemPonticosPuente("");
    setQuiereElegirPiezas(false);
    setPiezaModo("manual");
    setSelectedPiezas([]);
    onError("");
  };

  const handleAtPilarChange = (value) => {
    setAtPilarId(value);
    setAtPilarOpcion("");
    setAtAditamentoInfo("");
    setAtIncluyeTornillos("sin");
    setQuiereElegirPiezas(false);
    setPiezaModo("manual");
    setSelectedPiezas([]);
    onError("");
  };

  const handleAtCoronaChange = (value) => {
    setAtCoronaId(value);
    setAtCoronaSubopcion("");
    setAtColor("");
    setAtAditamentoInfo("");
    setQuiereElegirPiezas(false);
    setPiezaModo("manual");
    setSelectedPiezas([]);
    onError("");
  };

  const resetAtornilladosState = (tipo = atTipoProtesis) => {
    const coronaIdsTipo = (atornillados.casos ?? [])
      .filter((caso) => caso.tipo === tipo && Boolean(caso.coronaId))
      .map((caso) => caso.coronaId);
    const primerCoronaDisponible = atornilladosCorona.opciones.find((opcion) => coronaIdsTipo.includes(opcion.id))?.id
      ?? atornilladosCorona.opciones[0].id;

    setAtPilarId(atornilladosPilar.opciones[0].id);
    setAtPilarOpcion(atornilladosPilar.opciones[0].variantes?.[0] ?? "");
    setAtAditamentoInfo("");
    setAtCoronaId(primerCoronaDisponible);
    setAtCoronaSubopcion("");
    setAtColor("");
    setAtTornillo(atornilladosTornillo.opciones[0]);
    setAtIncluyeTornillos("sin");
    setQuiereElegirPiezas(false);
    setPiezaModo("manual");
    setSelectedPiezas([]);
  };

  const handleAtTipoProtesisChange = (value) => {
    setAtTipoProtesis(value);
    resetAtornilladosState(value);
    onError("");
  };

  const handleModuloChange = (nextModulo) => {
    if (nextModulo === "cementados") {
      const primerTipo = tiposAtornillados[0] ?? "Corona sobre implante";
      setAtTipoProtesis(primerTipo);
      resetAtornilladosState(primerTipo);
    }

    setModulo(nextModulo);
    onError("");
  };

  // Derived — atornillados
  const atPilar = atornilladosPilar.opciones.find((p) => p.id === atPilarId);
  const casosAtornillados = useMemo(() => atornillados.casos ?? [], [atornillados.casos]);
  const atornilladosPriceMatrix = useMemo(() => {
    return casosAtornillados.reduce((acc, caso) => {
      const materialKey = caso.coronaId ?? caso.pilarId;
      if (!materialKey) {
        return acc;
      }

      if (!acc[caso.tipo]) {
        acc[caso.tipo] = {};
      }

      acc[caso.tipo][materialKey] = {
        precio: caso.precio ?? null,
        despachoDias: caso.despachoDias ?? null,
        colores: caso.colores ?? [],
        precioByPieza: Boolean(caso.precioByPieza),
        adicionalTornillos: caso.adicionalTornillos ?? 0,
        material: caso.material ?? null,
      };

      return acc;
    }, {});
  }, [casosAtornillados]);
  const coronaIdsPorTipoAtornillado = casosAtornillados
    .filter((caso) => caso.tipo === atTipoProtesis && Boolean(caso.coronaId))
    .map((caso) => caso.coronaId);
  const opcionesCoronaAtornillado = atornilladosCorona.opciones.filter((opcion) => coronaIdsPorTipoAtornillado.includes(opcion.id));
  const atCorona = opcionesCoronaAtornillado.find((c) => c.id === atCoronaId);
  const pilarRequiereVariante = Boolean(atPilar?.variantes?.length);
  const muestraPilar = atTipoProtesis === "Pilar personalizado sobre implante";
  const muestraCorona = !muestraPilar;
  const etiquetaCeramicaCorona = atCorona?.id === "premill" ? "Cerámica adicional" : "Cerámica";
  const atPrecioConfigCorona = atornilladosPriceMatrix?.[atTipoProtesis]?.[atCoronaId] ?? null;
  const atPrecioConfigPilar = atornilladosPriceMatrix?.[atTipoProtesis]?.[atPilarId] ?? null;
  const atPrecioId = muestraPilar
    ? `${atTipoProtesis}__${atPilarId}`
    : `${atTipoProtesis}__${atCoronaId}`;
  const requierePrecioByPiezaAtornillado = Boolean(atPrecioConfigCorona?.precioByPieza);
  const precioCoronaAtornillado = muestraCorona
    ? (requierePrecioByPiezaAtornillado
      ? (quiereElegirPiezas
          ? selectedPiezas.length * (atPrecioConfigCorona?.precio ?? 0)
          : (atPrecioConfigCorona?.precio ?? null))
      : (atPrecioConfigCorona?.precio ?? null))
    : null;
  const precioPilarPersonalizado = atPrecioConfigPilar
    ? (atPrecioConfigPilar.precio ?? 0) + (atIncluyeTornillos === "con" ? atPrecioConfigPilar.adicionalTornillos ?? 0 : 0)
    : null;

  useEffect(() => {
    setAtPilarOpcion(atPilar?.variantes?.[0] ?? "");
  }, [atPilarId, atPilar]);

  useEffect(() => {
    setAtCoronaSubopcion(atCorona?.opcionesCeramica?.[0] ?? "");
  }, [atCoronaId, atCorona]);

  useEffect(() => {
    setCemColor(casoCementado?.colores?.[0] ?? "");
  }, [casoCementado]);

  useEffect(() => {
    setAtIncluyeTornillos("sin");
  }, [atTipoProtesis, atPilarId]);

  useEffect(() => {
    setAtColor(atPrecioConfigCorona?.colores?.[0] ?? "");
  }, [atPrecioConfigCorona]);

  useEffect(() => {
    if (!muestraCorona || opcionesCoronaAtornillado.length === 0) {
      return;
    }

    const existeOpcionActual = opcionesCoronaAtornillado.some((opcion) => opcion.id === atCoronaId);
    if (!existeOpcionActual) {
      setAtCoronaId(opcionesCoronaAtornillado[0].id);
    }
  }, [muestraCorona, opcionesCoronaAtornillado, atCoronaId]);

  useEffect(() => {
    if (!requierePrecioByPieza && !requierePrecioByPiezaAtornillado) {
      setQuiereElegirPiezas(false);
      setSelectedPiezas([]);
    }
  }, [requierePrecioByPieza, requierePrecioByPiezaAtornillado]);

  // ----------------------------------------------------------------
  const togglePieza = (pieza) => {
    setSelectedPiezas((prev) =>
      prev.includes(pieza) ? prev.filter((p) => p !== pieza) : [...prev, pieza]
    );
  };

  const seleccionarGrupoPiezas = (modo) => {
    setPiezaModo(modo);

    if (modo === "manual") {
      setSelectedPiezas([]);
      return;
    }

    if (modo === "superior") {
      setSelectedPiezas([...PIEZAS_DENTALES.Superior]);
      return;
    }

    if (modo === "inferior") {
      setSelectedPiezas([...PIEZAS_DENTALES.Inferior]);
      return;
    }

    if (modo === "ambas") {
      setSelectedPiezas([...PIEZAS_DENTALES.Superior, ...PIEZAS_DENTALES.Inferior]);
    }
  };

  const handleElegirPiezasChange = (checked) => {
    setQuiereElegirPiezas(checked);

    if (!checked) {
      setPiezaModo("manual");
      setSelectedPiezas([]);
    }
  };

  const handleConfirm = () => {
    if (quiereElegirPiezas && selectedPiezas.length === 0) {
      onError("Selecciona al menos una pieza dental para generar la orden de rehabilitación.");
      return;
    }
    onError("");

    if (modulo === "cementados") {
      if (!cemTipoProtesis) {
        onError("Selecciona el tipo de rehabilitación en Cementados.");
        return;
      }

      if (!cemMaterial) {
        onError("Selecciona un material para el trabajo cementado.");
        return;
      }

      if (cemMaterial?.id === "disilicato" && cemSubtipo?.requiereReceta) {
        if (!cemReceta.trim()) {
          onError("En Disilicato > Receta debes ingresar texto.");
          return;
        }
      }

      if (casoCementado?.colores?.length > 0 && !cemColor) {
        onError("Selecciona un color para continuar.");
        return;
      }

      if (requiereCamposPuente) {
        const coronas = Number(cemCoronasPuente);
        if (!Number.isInteger(coronas) || coronas <= 0) {
          onError("Ingresa una cantidad válida de corona(s).");
          return;
        }

        const ponticos = Number(cemPonticosPuente);
        if (!Number.isInteger(ponticos) || ponticos <= 0) {
          onError("Ingresa una cantidad válida de póntico(s).");
          return;
        }
      }

      if (casoCementado?.requiereCantidad) {
        const cantidad = Number(cemCantidadEspecial);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          onError(`Ingresa ${casoCementado.etiquetaCantidad?.toLowerCase() || "la cantidad requerida"}.`);
          return;
        }
      }

      const nombreMaterial = cemSubtipo
        ? `${cemMaterial.nombre} (${cemSubtipo.nombre}${cemSubtipo.requiereReceta && cemReceta ? ` — ${cemReceta}` : ""})`
        : casoCementado
          ? `${cemMaterial?.nombre ?? ""}${casoCementado.sku ? ` — SKU ${casoCementado.sku}` : ""}${cemColor ? ` — Color ${cemColor}` : ""}${requiereCamposPuente && puenteTotal ? ` — ${formatCLP(puenteTotal)}` : casoCementado.precio ? ` — ${formatCLP(casoCementado.precio)}` : ""}`
        : cemMaterial?.nombre ?? "";

      onConfirm({
        modulo: "Cementados",
        nombre: `Rehabilitación Cementada — ${cemTipoProtesis}`,
        material: nombreMaterial,
        detalle: {
          tipoProtesis: cemTipoProtesis,
          subtipoTrabajo: null,
          material: cemMaterial?.nombre,
          subtipo: cemSubtipo?.nombre ?? null,
          receta: cemSubtipo?.requiereReceta ? cemReceta : null,
          recetaArchivo: null,
          sku: casoCementado?.sku ?? null,
          nombreProducto: casoCementado?.nombreProducto ?? null,
          coronasPuente: requiereCamposPuente ? Number(cemCoronasPuente) : null,
          ponticosPuente: requiereCamposPuente ? Number(cemPonticosPuente) : null,
          color: casoCementado ? cemColor || null : null,
          precio: requiereCamposPuente ? (puenteTotal ?? null) : requierePrecioByPieza ? (quiereElegirPiezas ? (piezaTotal ?? null) : (casoCementado?.precio ?? null)) : (casoCementado?.precio ?? null),
          despachoDias: casoCementado?.despachoDias ?? null,
          requiereCantidadEspecial: Boolean(casoCementado?.requiereCantidad),
          cantidadEspecial: casoCementado?.requiereCantidad ? Number(cemCantidadEspecial) : null,
          etiquetaCantidad: casoCementado?.requiereCantidad ? casoCementado?.etiquetaCantidad ?? null : null,
          incluyeSeleccionPiezas: quiereElegirPiezas,
        },
        piezas: [...selectedPiezas],
      });
    } else {
      if (muestraPilar && !atPilar) {
        onError("Selecciona una opción de Pilar para continuar.");
        return;
      }

      if (muestraPilar && pilarRequiereVariante && !atPilarOpcion) {
        onError("Selecciona la variante del Pilar para continuar.");
        return;
      }

      if (muestraCorona && !atCorona) {
        onError("Selecciona una opción de Corona para continuar.");
        return;
      }

      if (muestraCorona && atPrecioConfigCorona?.colores?.length > 0 && !atColor) {
        onError("Selecciona un color para continuar.");
        return;
      }

      if (!muestraPilar && !atTornillo) {
        onError("Selecciona una opción de Tornillo para continuar.");
        return;
      }

      const pilarLabel = atPrecioConfigPilar
        ? `${atPilar?.nombre} + ${atPrecioConfigPilar?.material}${atIncluyeTornillos === "con" ? " + Tornillos" : ""}${atAditamentoInfo ? ` — ${atAditamentoInfo}` : ""}${precioPilarPersonalizado ? ` — ${formatCLP(precioPilarPersonalizado)}` : ""}`
        : atPilar?.nombre + (atAditamentoInfo ? ` — ${atAditamentoInfo}` : "");
      const coronaLabel = atCorona?.nombre
        + (atCorona?.incluyeCeramica ? " + Incluye cerámica" : "")
        + (atCoronaSubopcion ? ` + ${atCoronaSubopcion}` : "");
      const coronaMaterialSeleccionado = atPrecioConfigCorona
        ? `${coronaLabel}${atColor ? ` — Color ${atColor}` : ""}${precioCoronaAtornillado ? ` — ${formatCLP(precioCoronaAtornillado)}` : ""}${atAditamentoInfo ? ` — ${atAditamentoInfo}` : ""}`
        : `${coronaLabel}${atAditamentoInfo ? ` — ${atAditamentoInfo}` : ""}`;
      const materialSeleccionado = muestraPilar
        ? pilarLabel
        : muestraCorona
          ? coronaMaterialSeleccionado
          : "";

      onConfirm({
        modulo: "Atornillados",
        nombre: `Rehabilitación Atornillada — ${atTipoProtesis}`,
        material: materialSeleccionado,
        detalle: {
          tipoProtesis: atTipoProtesis,
          pilar: muestraPilar ? atPilar?.nombre : null,
          pilarOpcion: muestraPilar ? atPilarOpcion || null : null,
          pilarMaterial: muestraPilar ? atPrecioConfigPilar?.material ?? null : null,
          aditamentoInfo: muestraPilar ? atAditamentoInfo.trim() || null : null,
          incluyeTornillos: muestraPilar ? atIncluyeTornillos === "con" : false,
          adicionalTornillos: muestraPilar && atIncluyeTornillos === "con" ? atPrecioConfigPilar?.adicionalTornillos ?? 0 : 0,
          precio: muestraPilar ? precioPilarPersonalizado : null,
          despachoDias: muestraPilar ? atPrecioConfigPilar?.despachoDias ?? null : null,
          corona: muestraCorona ? atCorona?.nombre : null,
          color: muestraCorona ? atColor || null : null,
          precioCorona: precioCoronaAtornillado,
          despachoDiasCorona: muestraCorona ? atPrecioConfigCorona?.despachoDias ?? null : null,
          precioId: atPrecioId,
          coronaIncluyeCeramica: muestraCorona ? Boolean(atCorona?.incluyeCeramica) : false,
          coronaSubopcion: muestraCorona ? atCoronaSubopcion || null : null,
          tornillo: muestraPilar ? (atIncluyeTornillos === "con" ? "Con tornillos" : "Sin tornillos") : atTornillo,
          incluyeSeleccionPiezas: quiereElegirPiezas,
        },
        piezas: [...selectedPiezas],
      });
    }
  };

  // ----------------------------------------------------------------
  return (
    <div>
      {/* Module tabs */}
      <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-200 text-sm font-semibold">
        <button
          type="button"
          onClick={() => handleModuloChange("cementados")}
          className={`flex-1 px-3 py-2 transition-colors ${
            modulo === "cementados" ? "bg-[#2F58BC] text-white" : "text-[#999999] hover:bg-[#2F58BC]/5"
          }`}
        >
          Cementados
        </button>
        <button
          type="button"
          onClick={() => handleModuloChange("atornillados")}
          className={`flex-1 px-3 py-2 transition-colors ${
            modulo === "atornillados" ? "bg-[#2F58BC] text-white" : "text-[#999999] hover:bg-[#2F58BC]/5"
          }`}
        >
          Atornillados
        </button>
      </div>

      {/* ── Cementados ── */}
      {modulo === "cementados" && (
        <div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2F58BC]">
            Nivel 1: Tipo de Rehabilitación
          </p>

          <label className={labelClass}>
            Tipo de Rehabilitación
            <select value={cemTipoProtesis} onChange={(e) => handleTipoProtesisChange(e.target.value)} className={selectClass}>
              <option value="">Selecciona una opción</option>
              {tiposCementados.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          {cemTipoProtesis && (
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2F58BC]">
              Nivel 3: Material
            </p>
          )}

          {cemTipoProtesis && (
            <label className={labelClass}>
              Material
              <select
                key={`material-${cemTipoProtesis}`}
                value={cemMaterialId}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className={`${selectClass} ${!materialHabilitado ? "bg-slate-100 text-slate-400" : ""}`}
                disabled={!materialHabilitado}
              >
                <option value="">Selecciona un material</option>
                {materialesCementadosDisponibles.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </label>
          )}

          {casoCementado && (
            <div key={`precio-${cemMaterialId}-${cemTipoProtesis}`} className="mt-3 rounded-xl border border-[#2F58BC]/10 bg-[#2F58BC]/5 px-3 py-3 text-xs text-[#2F58BC]">
              {casoCementado.sku && <p className="font-semibold">SKU: {casoCementado.sku}</p>}
              {requiereCamposPuente ? (
                <>
                  <p className="font-semibold">Corona(s): {Number(cemCoronasPuente) || 0} × {formatCLP(casoCementado.precio)}</p>
                  <p className="font-semibold">Póntico(s): {formatCLP(casoCementado.precioPontico ?? 0)} c/u</p>
                  {puenteTotal > 0 && <p className="font-bold mt-1">Total: {formatCLP(puenteTotal)}</p>}
                </>
              ) : requierePrecioByPieza ? (
                <>
                  <p className="font-semibold">Precio por pieza: {formatCLP(casoCementado.precio)}</p>
                  {quiereElegirPiezas && selectedPiezas.length > 0 && (
                    <p className="font-bold mt-1">Total ({selectedPiezas.length} piezas): {formatCLP(piezaTotal)}</p>
                  )}
                </>
              ) : (
                <p className="font-semibold">Precio: {formatCLP(casoCementado.precio)}</p>
              )}
              <p className="mt-1 font-semibold">Despacho: {casoCementado.despachoDias} días</p>
            </div>
          )}

          {casoCementado?.colores?.length > 0 && (
            <label className={labelClass}>
              Color
              <select value={cemColor} onChange={(e) => setCemColor(e.target.value)} className={selectClass}>
                <option value="">Selecciona un color</option>
                {casoCementado.colores.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </label>
          )}

          {requiereCamposPuente && (
            <>
              <label className={labelClass}>
                Corona(s)
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={cemCoronasPuente}
                  onChange={(e) => setCemCoronasPuente(e.target.value)}
                  placeholder="Ingresa la cantidad de coronas"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className={labelClass}>
                Póntico(s)
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={cemPonticosPuente}
                  onChange={(e) => setCemPonticosPuente(e.target.value)}
                  placeholder="Ingresa la cantidad de pónticos"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </>
          )}

          {casoCementado?.requiereCantidad && (
            <label className={labelClass}>
              {casoCementado.etiquetaCantidad || "Cantidad"}
              <input
                type="number"
                min={1}
                step={1}
                value={cemCantidadEspecial}
                onChange={(e) => setCemCantidadEspecial(e.target.value)}
                placeholder="Ingresa una cantidad"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          )}

        </div>
      )}

      {/* ── Atornillados ── */}
      {modulo === "atornillados" && (
        <div>
          <p className="mt-3 rounded-xl border border-[#2F58BC]/10 bg-[#2F58BC]/5 px-3 py-2 text-xs font-semibold text-[#2F58BC]">
            Selecciona el tipo de rehabilitación y luego el submódulo correspondiente.
          </p>

          <label className={labelClass}>
            Tipo de Rehabilitación
            <select value={atTipoProtesis} onChange={(e) => handleAtTipoProtesisChange(e.target.value)} className={selectClass}>
              {tiposAtornillados.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </label>

          {muestraPilar && (
            <>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2F58BC]">
                {atornilladosPilar.etiqueta}
              </p>

              <label className={labelClass}>
                Pilar
                <select value={atPilarId} onChange={(e) => handleAtPilarChange(e.target.value)} className={selectClass}>
                  {atornilladosPilar.opciones.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </label>

              {atPrecioConfigPilar && (
                <div className="mt-3 rounded-xl border border-[#2F58BC]/10 bg-[#2F58BC]/5 px-3 py-3 text-xs text-[#2F58BC]">
                  <p className="font-semibold">Material: {atPrecioConfigPilar.material}</p>
                  <p className="mt-1 font-semibold">Precio base: {formatCLP(atPrecioConfigPilar.precio ?? 0)}</p>
                  <p className="mt-1 font-semibold">Despacho: {atPrecioConfigPilar.despachoDias} días</p>
                  <p className="mt-1 font-semibold">Adicional tornillos: {formatCLP(atPrecioConfigPilar.adicionalTornillos ?? 0)}</p>
                  <p className="mt-1 font-bold">Total: {formatCLP(precioPilarPersonalizado ?? (atPrecioConfigPilar.precio ?? 0))}</p>
                </div>
              )}

              <label className={labelClass}>
                ¿Lo quieres con o sin tornillos?
                <select value={atIncluyeTornillos} onChange={(e) => setAtIncluyeTornillos(e.target.value)} className={selectClass}>
                  <option value="sin">Sin tornillos</option>
                  <option value="con">Con tornillos</option>
                </select>
              </label>
            </>
          )}

          {muestraCorona && (
            <>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2F58BC]">
                {atornilladosCorona.etiqueta}
              </p>

              <label className={labelClass}>
                Submódulo de Corona
                <select value={atCoronaId} onChange={(e) => handleAtCoronaChange(e.target.value)} className={selectClass}>
                  {opcionesCoronaAtornillado.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </label>

              {atCorona?.incluyeCeramica && (
                <p className="mt-3 rounded-xl border border-[#2F58BC]/10 bg-[#2F58BC]/5 px-3 py-2 text-xs font-semibold text-[#2F58BC]">
                  Esta opción incluye cerámica.
                </p>
              )}

              {atCorona?.opcionesCeramica?.length > 0 && (
                <label className={labelClass}>
                  {etiquetaCeramicaCorona}
                  <select value={atCoronaSubopcion} onChange={(e) => setAtCoronaSubopcion(e.target.value)} className={selectClass}>
                    {atCorona.opcionesCeramica.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}

              {atPrecioConfigCorona && (
                <div className="mt-3 rounded-xl border border-[#2F58BC]/10 bg-[#2F58BC]/5 px-3 py-3 text-xs text-[#2F58BC]">
                  {requierePrecioByPiezaAtornillado ? (
                    <>
                      <p className="font-semibold">Precio por pieza: {formatCLP(atPrecioConfigCorona.precio ?? 0)}</p>
                      {quiereElegirPiezas && selectedPiezas.length > 0 && (
                        <p className="mt-1 font-bold">Total ({selectedPiezas.length} piezas): {formatCLP(precioCoronaAtornillado)}</p>
                      )}
                    </>
                  ) : (
                    <p className="font-semibold">Precio: {formatCLP(atPrecioConfigCorona.precio ?? 0)}</p>
                  )}
                  <p className="mt-1 font-semibold">Despacho: {atPrecioConfigCorona.despachoDias} días</p>
                </div>
              )}

              {atPrecioConfigCorona?.colores?.length > 0 && (
                <label className={labelClass}>
                  Color
                  <select value={atColor} onChange={(e) => setAtColor(e.target.value)} className={selectClass}>
                    <option value="">Selecciona un color</option>
                    {atPrecioConfigCorona.colores.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          <label className={labelClass}>
            Escriba información de aditamento
            <textarea
              value={atAditamentoInfo}
              onChange={(e) => setAtAditamentoInfo(e.target.value)}
              placeholder="Escriba información de aditamento"
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          {!muestraPilar && (
            <>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2F58BC]">
                {atornilladosTornillo.etiqueta}
              </p>

              <label className={labelClass}>
                Tipo de aditamiento
                <select value={atTornillo} onChange={(e) => setAtTornillo(e.target.value)} className={selectClass}>
                  {atornilladosTornillo.opciones.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </>
          )}

        </div>
      )}

      {/* Piezas Dentarias */}
      {!requiereCamposPuente && (requierePrecioByPieza || requierePrecioByPiezaAtornillado) && (
      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-600">Piezas Dentarias</p>
        <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={quiereElegirPiezas}
            onChange={(e) => handleElegirPiezasChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#2F58BC]"
          />
          ¿Quieres elegir las piezas?
        </label>

        {quiereElegirPiezas && (
          <>
            <label className={labelClass}>
              ¿Cómo quieres seleccionarlas?
              <select
                value={piezaModo}
                onChange={(e) => seleccionarGrupoPiezas(e.target.value)}
                className={selectClass}
              >
                <option value="manual">Selección manual</option>
                <option value="superior">Arriba</option>
                <option value="inferior">Abajo</option>
                <option value="ambas">Ambas</option>
              </select>
            </label>

            {piezaModo !== "manual" && (
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Cambia a selección manual si quieres marcar piezas individuales.
              </p>
            )}

            <p className="mt-2 text-[11px] font-bold uppercase text-[#999999]">Superior</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {PIEZAS_DENTALES.Superior.map((pieza) => (
                <button
                  key={pieza}
                  type="button"
                  onClick={() => togglePieza(pieza)}
                  disabled={piezaModo !== "manual"}
                  className={`rounded border px-2 py-1 text-[11px] font-semibold transition-colors ${
                    selectedPiezas.includes(pieza)
                      ? "border-[#2F58BC] bg-[#2F58BC] text-white"
                      : "border-slate-300 text-slate-600 hover:border-[#3366FF] hover:bg-[#3366FF]/5"
                  } ${piezaModo !== "manual" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {pieza}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase text-[#999999]">Inferior</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {PIEZAS_DENTALES.Inferior.map((pieza) => (
                <button
                  key={pieza}
                  type="button"
                  onClick={() => togglePieza(pieza)}
                  disabled={piezaModo !== "manual"}
                  className={`rounded border px-2 py-1 text-[11px] font-semibold transition-colors ${
                    selectedPiezas.includes(pieza)
                      ? "border-[#2F58BC] bg-[#2F58BC] text-white"
                      : "border-slate-300 text-slate-600 hover:border-[#3366FF] hover:bg-[#3366FF]/5"
                  } ${piezaModo !== "manual" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {pieza}
                </button>
              ))}
            </div>

          </>
        )}
      </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        className="mt-3 w-full rounded-xl bg-[#2F58BC] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3366FF]"
      >
        Confirmar y generar orden
      </button>
    </div>
  );
}



