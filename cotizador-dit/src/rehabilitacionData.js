export const productosRehabilitacion = {
  cementados: {
    id: "cementados",
    nombre: "Cementados",
    tiposProtesis: ["Corona", "Inlay", "Onlay"],
    subtipos: ["Terminación", "Sin terminación"],
    materiales: [
      { id: "resina3d", nombre: "Resina 3D" },
      { id: "metal", nombre: "Metal" },
      {
        id: "disilicato",
        nombre: "Disilicato",
        subOpciones: [
          { id: "emax", nombre: "EMAX", requiereReceta: false },
          {
            id: "marca_receta",
            nombre: "Marca (Receta)",
            requiereReceta: true,
            etiquetaReceta: "Marca / Receta",
          },
        ],
      },
    ],
  },
  atornillados: {
    id: "atornillados",
    nombre: "Atornillados",
    requiereSeleccionTresComponentes: true,
    componentes: {
      pilar: {
        id: "pilar",
        etiqueta: "Pilar",
        opciones: [
          {
            id: "pilar_tbase_ti",
            nombre: "Tbase (Ti)",
            variantes: ["Pilar DIT (incluye tornillo)", "Pilar original", "Pilar tercero"],
          },
          {
            id: "pilar_premill_dit_unitario",
            nombre: "Pilar Premill DIT",
            variantes: ["Titanio", "CrCo"],
          },
          {
            id: "pilar_laser_metal",
            nombre: "Pilar Laser Metal",
          },
          {
            id: "pilar_laser_metal_rectificacion_crco",
            nombre: "Pilar Laser Metal + rectificación (CrCo)",
            variantes: ["Unitario", "Múltiple"],
          },
          {
            id: "pilar_ti_fresado",
            nombre: "Pilar Ti Fresado",
            variantes: ["Unitario", "Múltiple"],
          },
        ],
      },
      corona: {
        id: "corona",
        etiqueta: "Corona",
        opciones: [
          { id: "resina3d", nombre: "Resina 3D" },
          { id: "disilicato", nombre: "Disilicato" },
          { id: "zirconio", nombre: "Zirconio" },
          {
            id: "premill",
            nombre: "Premill",
            permiteSeleccionCeramica: true,
            opcionesCeramica: ["Cerámica adicional"],
          },
          {
            id: "laser_metal",
            nombre: "Laser Metal",
            incluyeCeramica: true,
            opcionesCeramica: ["Cerámica"],
          },
        ],
      },
      tornillo: {
        id: "tornillo",
        etiqueta: "Tornillo",
        opciones: ["Externo", "Nuestro"],
      },
    },
  },
};

export const REHAB_CONFIG = productosRehabilitacion;
