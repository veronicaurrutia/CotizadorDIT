import { useState, useEffect } from "react";
import { REHAB_CONFIG } from "./rehabilitacionData";

const PIEZAS_DENTALES = {
  Superior: ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"],
  Inferior: ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"],
};

const selectClass = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mt-3 block text-xs font-semibold text-slate-600";

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
  const [cemSubtipoTrabajo, setCemSubtipoTrabajo] = useState("");
  const [cemMaterialId, setCemMaterialId] = useState("");
  const [cemSubtipoId, setCemSubtipoId] = useState("");
  const [cemReceta, setCemReceta] = useState("");
  const [cemRecetaArchivo, setCemRecetaArchivo] = useState(null);

  // --- Atornillados state ---
  const [atTipoProtesis, setAtTipoProtesis] = useState("Pilar");
  const [atPilarId, setAtPilarId] = useState(atornilladosPilar.opciones[0].id);
  const [atPilarOpcion, setAtPilarOpcion] = useState(
    atornilladosPilar.opciones[0].variantes?.[0] ?? ""
  );
  const [atCoronaId, setAtCoronaId] = useState(atornilladosCorona.opciones[0].id);
  const [atCoronaSubopcion, setAtCoronaSubopcion] = useState("");
  const [atTornillo, setAtTornillo] = useState(atornilladosTornillo.opciones[0]);

  // Derived — cementados
  const cemMaterial = cementados.materiales.find((m) => m.id === cemMaterialId);
  const cemSubtipo = cemMaterial?.subOpciones?.find((s) => s.id === cemSubtipoId);
  const requiereSubtipoTrabajo = Boolean(cemTipoProtesis);
  const subtipoHabilitado = Boolean(cemTipoProtesis);
  const materialHabilitado = Boolean(cemSubtipoTrabajo);

  const handleTipoProtesisChange = (value) => {
    setCemTipoProtesis(value);
    setCemSubtipoTrabajo("");
    setCemMaterialId("");
    setCemSubtipoId("");
    setCemReceta("");
    setCemRecetaArchivo(null);
  };

  const handleSubtipoTrabajoChange = (value) => {
    setCemSubtipoTrabajo(value);
    setCemMaterialId("");
    setCemSubtipoId("");
    setCemReceta("");
    setCemRecetaArchivo(null);
  };

  const handleMaterialChange = (value) => {
    const nextMaterial = cementados.materiales.find((material) => material.id === value);
    setCemMaterialId(value);
    setCemSubtipoId(nextMaterial?.subOpciones?.[0]?.id ?? "");
    setCemReceta("");
    setCemRecetaArchivo(null);
  };

  const handleDisilicatoChange = (value) => {
    setCemSubtipoId(value);
    setCemReceta("");
    setCemRecetaArchivo(null);
  };

  // Derived — atornillados
  const atPilar = atornilladosPilar.opciones.find((p) => p.id === atPilarId);
  const atCorona = atornilladosCorona.opciones.find((c) => c.id === atCoronaId);
  const pilarRequiereVariante = Boolean(atPilar?.variantes?.length);
  const muestraPilar = atTipoProtesis === "Pilar";
  const muestraCorona = atTipoProtesis === "Corona";
  const etiquetaCeramicaCorona = atCorona?.id === "premill" ? "Cerámica adicional" : "Cerámica";

  useEffect(() => {
    setAtPilarOpcion(atPilar?.variantes?.[0] ?? "");
  }, [atPilarId, atPilar]);

  useEffect(() => {
    setAtCoronaSubopcion(atCorona?.opcionesCeramica?.[0] ?? "");
  }, [atCoronaId, atCorona]);

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
        onError("Selecciona el tipo de prótesis en Cementados.");
        return;
      }

      if (requiereSubtipoTrabajo && !cemSubtipoTrabajo) {
        onError("Selecciona el subtipo en Cementados.");
        return;
      }

      if (!cemMaterial) {
        onError("Selecciona un material para el trabajo cementado.");
        return;
      }

      if (cemMaterial?.id === "disilicato" && cemSubtipo?.requiereReceta) {
        const hasTexto = Boolean(cemReceta.trim());
        const hasArchivo = Boolean(cemRecetaArchivo);
        if (!hasTexto && !hasArchivo) {
          onError("En Disilicato > Receta debes ingresar texto o adjuntar un archivo.");
          return;
        }
      }

      const nombreMaterial = cemSubtipo
        ? `${cemMaterial.nombre} (${cemSubtipo.nombre}${cemSubtipo.requiereReceta && cemReceta ? ` — ${cemReceta}` : ""}${
            cemSubtipo.requiereReceta && cemRecetaArchivo ? ` — Archivo: ${cemRecetaArchivo.name}` : ""
          })`
        : cemMaterial?.nombre ?? "";

      onConfirm({
        modulo: "Cementados",
        nombre: `Rehabilitación Cementada — ${cemTipoProtesis}${cemSubtipoTrabajo ? ` / ${cemSubtipoTrabajo}` : ""}`,
        material: nombreMaterial,
        detalle: {
          tipoProtesis: cemTipoProtesis,
          subtipoTrabajo: cemSubtipoTrabajo || null,
          material: cemMaterial?.nombre,
          subtipo: cemSubtipo?.nombre ?? null,
          receta: cemSubtipo?.requiereReceta ? cemReceta : null,
          recetaArchivo: cemSubtipo?.requiereReceta && cemRecetaArchivo ? cemRecetaArchivo.name : null,
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

      if (!atTornillo) {
        onError("Selecciona una opción de Tornillo para continuar.");
        return;
      }

      const pilarLabel = atPilar?.nombre + (atPilarOpcion ? ` — ${atPilarOpcion}` : "");
      const coronaLabel = atCorona?.nombre
        + (atCorona?.incluyeCeramica ? " + Incluye cerámica" : "")
        + (atCoronaSubopcion ? ` + ${atCoronaSubopcion}` : "");
      const materialSeleccionado = muestraPilar
        ? pilarLabel
        : muestraCorona
          ? coronaLabel
          : "";

      onConfirm({
        modulo: "Atornillados",
        nombre: `Rehabilitación Atornillada — ${atTipoProtesis}`,
        material: materialSeleccionado,
        detalle: {
          tipoProtesis: atTipoProtesis,
          pilar: muestraPilar ? atPilar?.nombre : null,
          pilarOpcion: muestraPilar ? atPilarOpcion || null : null,
          corona: muestraCorona ? atCorona?.nombre : null,
          coronaIncluyeCeramica: muestraCorona ? Boolean(atCorona?.incluyeCeramica) : false,
          coronaSubopcion: muestraCorona ? atCoronaSubopcion || null : null,
          tornillo: atTornillo,
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
          onClick={() => setModulo("cementados")}
          className={`flex-1 px-3 py-2 transition-colors ${
            modulo === "cementados" ? "bg-[#005eb8] text-white" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Cementados
        </button>
        <button
          type="button"
          onClick={() => setModulo("atornillados")}
          className={`flex-1 px-3 py-2 transition-colors ${
            modulo === "atornillados" ? "bg-[#005eb8] text-white" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Atornillados
        </button>
      </div>

      {/* ── Cementados ── */}
      {modulo === "cementados" && (
        <div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
            Nivel 1: Tipo de Prótesis
          </p>

          <label className={labelClass}>
            Tipo de Prótesis
            <select value={cemTipoProtesis} onChange={(e) => handleTipoProtesisChange(e.target.value)} className={selectClass}>
              <option value="">Selecciona una opción</option>
              {cementados.tiposProtesis.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          {subtipoHabilitado && (
            <>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
                Nivel 2: Subtipo
              </p>

              <label className={labelClass}>
                Subtipo
                <select
                  value={cemSubtipoTrabajo}
                  onChange={(e) => handleSubtipoTrabajoChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Selecciona una opción</option>
                  {cementados.subtipos.map((subtipo) => (
                    <option key={subtipo} value={subtipo}>{subtipo}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {cemTipoProtesis && (
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
              Nivel 3: Material
            </p>
          )}

          {cemTipoProtesis && (
            <label className={labelClass}>
              Material
              <select
                value={cemMaterialId}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className={`${selectClass} ${!materialHabilitado ? "bg-slate-100 text-slate-400" : ""}`}
                disabled={!materialHabilitado}
              >
                <option value="">Selecciona un material</option>
                {cementados.materiales.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </label>
          )}

          {cemMaterial?.subOpciones?.length > 0 && (
            <div key={`disilicato-${cemMaterialId}`}>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
                Nivel 4: Detalle de Disilicato
              </p>

              <label className={labelClass}>
                Opción de Disilicato
                <select value={cemSubtipoId} onChange={(e) => handleDisilicatoChange(e.target.value)} className={selectClass}>
                  {cemMaterial.subOpciones.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {cemSubtipo?.requiereReceta && (
            <div key={`receta-${cemSubtipoId}`}>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
                Nivel 5: Acción Condicional
              </p>

              <label className={labelClass}>
                {cemSubtipo.etiquetaReceta || "Receta"}
                <textarea
                  value={cemReceta}
                  onChange={(e) => setCemReceta(e.target.value)}
                  placeholder="Escribe la marca o receta"
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className={labelClass}>
                Adjuntar archivo
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setCemRecetaArchivo(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              {cemRecetaArchivo && (
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  Archivo seleccionado: {cemRecetaArchivo.name}
                </p>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── Atornillados ── */}
      {modulo === "atornillados" && (
        <div>
          <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#005eb8]">
            Selecciona el tipo de prótesis y luego el submódulo correspondiente.
          </p>

          <label className={labelClass}>
            Tipo de Prótesis
            <select value={atTipoProtesis} onChange={(e) => setAtTipoProtesis(e.target.value)} className={selectClass}>
              <option value="Pilar">Pilar</option>
              <option value="Corona">Corona</option>
            </select>
          </label>

          {muestraPilar && (
            <>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
                {atornilladosPilar.etiqueta}
              </p>

              <label className={labelClass}>
                Pilar
                <select value={atPilarId} onChange={(e) => setAtPilarId(e.target.value)} className={selectClass}>
                  {atornilladosPilar.opciones.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </label>

              {pilarRequiereVariante && (
                <label className={labelClass}>
                  Variante de Pilar
                  <select value={atPilarOpcion} onChange={(e) => setAtPilarOpcion(e.target.value)} className={selectClass}>
                    {atPilar.variantes.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          {muestraCorona && (
            <>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
                {atornilladosCorona.etiqueta}
              </p>

              <label className={labelClass}>
                Submódulo de Corona
                <select value={atCoronaId} onChange={(e) => setAtCoronaId(e.target.value)} className={selectClass}>
                  {atornilladosCorona.opciones.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </label>

              {atCorona?.incluyeCeramica && (
                <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#005eb8]">
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
            </>
          )}

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#005eb8]">
            {atornilladosTornillo.etiqueta}
          </p>

          <label className={labelClass}>
            Tipo de Tornillo (fijo)
            <select value={atTornillo} onChange={(e) => setAtTornillo(e.target.value)} className={selectClass}>
              {atornilladosTornillo.opciones.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

        </div>
      )}

      {/* Piezas Dentarias */}
      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-600">Piezas Dentarias</p>
        <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={quiereElegirPiezas}
            onChange={(e) => handleElegirPiezasChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#005eb8]"
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

            <p className="mt-2 text-[11px] font-bold uppercase text-slate-500">Superior</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {PIEZAS_DENTALES.Superior.map((pieza) => (
                <button
                  key={pieza}
                  type="button"
                  onClick={() => togglePieza(pieza)}
                  disabled={piezaModo !== "manual"}
                  className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                    selectedPiezas.includes(pieza)
                      ? "border-[#005eb8] bg-[#005eb8] text-white"
                      : "border-slate-300 text-slate-600"
                  } ${piezaModo !== "manual" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {pieza}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase text-slate-500">Inferior</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {PIEZAS_DENTALES.Inferior.map((pieza) => (
                <button
                  key={pieza}
                  type="button"
                  onClick={() => togglePieza(pieza)}
                  disabled={piezaModo !== "manual"}
                  className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                    selectedPiezas.includes(pieza)
                      ? "border-[#005eb8] bg-[#005eb8] text-white"
                      : "border-slate-300 text-slate-600"
                  } ${piezaModo !== "manual" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {pieza}
                </button>
              ))}
            </div>

          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        className="mt-3 w-full rounded-xl bg-[#005eb8] px-3 py-2 text-sm font-bold text-white"
      >
        Confirmar y generar orden
      </button>
    </div>
  );
}
