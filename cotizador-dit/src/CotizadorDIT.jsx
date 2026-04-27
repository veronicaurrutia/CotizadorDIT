import { useState } from "react";

const PRODUCTOS = [
  // Cementados
  {
    id: 1,
    nombre: "Corona",
    tipo: "cementado",
    categoria: "Cementados",
    precio: 150000,
    icono: "👑",
  },
  {
    id: 2,
    nombre: "Cofia",
    tipo: "cementado",
    categoria: "Cementados",
    precio: 120000,
    icono: "🧢",
  },
  {
    id: 3,
    nombre: "Corona Implante Soportada",
    tipo: "cementado",
    categoria: "Cementados",
    precio: 180000,
    icono: "🦷",
  },
  {
    id: 4,
    nombre: "Inlay/Onlay",
    tipo: "cementado",
    categoria: "Cementados",
    precio: 140000,
    icono: "🔷",
  },
  // Atornillados
  {
    id: 5,
    nombre: "Corona Atornillada",
    tipo: "atornillado",
    categoria: "Atornillados",
    precio: 160000,
    icono: "🔩",
  },
  {
    id: 6,
    nombre: "Tbase Externo + Corona Atornillada",
    tipo: "atornillado",
    categoria: "Atornillados",
    precio: 210000,
    icono: "⚙️",
  },
  {
    id: 7,
    nombre: "Tbase DIT + Corona Atornillada",
    tipo: "atornillado",
    categoria: "Atornillados",
    precio: 220000,
    icono: "🔧",
  },
];

function formatCLP(valor) {
  return valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
}

export default function CotizadorDIT() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("cementado");
  const [cantidades, setCantidades] = useState(
    Object.fromEntries(PRODUCTOS.map((p) => [p.id, 0]))
  );

  const cambiarCantidad = (id, delta) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }));
  };

  const productosFiltrados = PRODUCTOS.filter((p) => p.tipo === tipoSeleccionado);
  const itemsSeleccionados = productosFiltrados.filter((p) => cantidades[p.id] > 0);
  const total = productosFiltrados.reduce(
    (acc, p) => acc + p.precio * cantidades[p.id],
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white py-5 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <span className="text-blue-900 text-xl font-bold leading-none select-none">
              DIT
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Cotizador de Implantes DIT
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
              Seleccione los productos y ajuste las cantidades
            </p>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Productos */}
          <section className="flex-1">
            {/* Selector de Tipo de Producto */}
            <div className="mb-6">
              <h2 className="text-blue-900 text-lg font-semibold mb-3">
                Tipo de Producto
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setTipoSeleccionado("cementado")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    tipoSeleccionado === "cementado"
                      ? "bg-blue-900 text-white shadow-md"
                      : "bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-50"
                  }`}
                >
                  Cementados
                </button>
                <button
                  onClick={() => setTipoSeleccionado("atornillado")}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    tipoSeleccionado === "atornillado"
                      ? "bg-blue-900 text-white shadow-md"
                      : "bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-50"
                  }`}
                >
                  Atornillados
                </button>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-4">
              <h2 className="text-blue-900 text-lg font-semibold mb-2">
                Productos disponibles
              </h2>
              {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-shadow hover:shadow-md"
              >
                {/* Icono + info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl select-none">{producto.icono}</div>
                  <div>
                    <h3 className="text-blue-900 font-semibold text-base leading-tight">
                      {producto.nombre}
                    </h3>
                    <p className="text-blue-700 font-bold text-base mt-1">
                      {formatCLP(producto.precio)}
                      <span className="text-slate-400 font-normal text-xs ml-1">
                        / unidad
                      </span>
                    </p>
                  </div>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-3 self-center sm:self-auto">
                  <button
                    onClick={() => cambiarCantidad(producto.id, -1)}
                    disabled={cantidades[producto.id] === 0}
                    className="w-9 h-9 rounded-full border-2 border-blue-900 text-blue-900 font-bold text-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-900 hover:text-white transition-colors"
                    aria-label={`Reducir cantidad de ${producto.nombre}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-blue-900 font-bold text-lg tabular-nums">
                    {cantidades[producto.id]}
                  </span>
                  <button
                    onClick={() => cambiarCantidad(producto.id, 1)}
                    className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold text-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    aria-label={`Aumentar cantidad de ${producto.nombre}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            </div>
          </section>

          {/* Sidebar de resumen */}
          <aside className="mt-8 lg:mt-0 lg:w-80 xl:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:sticky lg:top-6">
              <h2 className="text-blue-900 text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📋</span> Orden activa
              </h2>

              {itemsSeleccionados.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">
                  Aún no has seleccionado productos.
                </p>
              ) : (
                <ul className="space-y-3 mb-4">
                  {itemsSeleccionados.map((p) => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="text-slate-700 flex-1 pr-2 leading-snug">
                        {p.nombre}
                        <span className="text-slate-400 ml-1">
                          ×{cantidades[p.id]}
                        </span>
                      </span>
                      <span className="text-blue-900 font-semibold whitespace-nowrap">
                        {formatCLP(p.precio * cantidades[p.id])}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {itemsSeleccionados.length > 0 && (
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Total</span>
                    <span className="text-blue-900 text-xl font-bold">
                      {formatCLP(total)}
                    </span>
                  </div>
                </div>
              )}

              <button
                disabled={itemsSeleccionados.length === 0}
                className="mt-5 w-full bg-blue-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Solicitar cotización formal
              </button>

              {/* Nota legal */}
              <p className="text-slate-400 text-xs mt-4 leading-relaxed text-center">
                Esta es una cotización referencial sujeta a evaluación clínica.
                Los precios pueden variar según diagnóstico y disponibilidad.
              </p>
            </div>
          </aside>
        </div>
        
      </main>
    </div>
    
  );
}
