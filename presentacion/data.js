// Datos compartidos por build_deck.js (.pptx) y build_web.js (versión web)
const TOTAL_STOPS = 7;
const ROUTE = [
  { name: "Grilla Inteligente", gate: "A1", highlight: "231 francos gestionados" },
  { name: "Web Termo", gate: "A2", highlight: "+1.000 equipos con ficha" },
  { name: "Ventanas BHS", gate: "A3", highlight: "1.935 h de ventanas posibles" },
  { name: "Programación Equipos de Aire", gate: "A4", highlight: "Setpoints según pronóstico" },
  { name: "Recorrida", gate: "A5", highlight: "Recorridas de aire y mecánica" },
  { name: "Filtraciones de Techo", gate: "A6", highlight: "Mapa de calor de incidencias" },
  { name: "Infraestructura lado pista", gate: "A7", highlight: "PCI por loza (0 a 100)" },
];

const STOPS = [
  {
    id: "grilla", idx: 0, name: "Grilla Inteligente", gate: "A1", flight: "MANT-01",
    url: "https://grilla-inteligente-termo.vercel.app/", urlShort: "grilla-inteligente-termo.vercel.app",
    tagline: "Gestión de guardias del Departamento de Ingeniería Termomecánica",
    tilesLabel: "QUÉ ENCONTRÁS EN LA PÁGINA", cols: 2,
    tiles: [
      { icon: "FaUsers", title: "Vista General", desc: "Quién está de guardia, de un vistazo" },
      { icon: "FaCalendarAlt", title: "Mi Calendario", desc: "Tu grilla de guardias y francos" },
      { icon: "FaClipboardList", title: "Mis Solicitudes", desc: "Pedí tu franco y seguí su estado" },
      { icon: "FaIdCard", title: "Mi Perfil", desc: "Cargá tu credencial y permiso de conducir" },
    ],
    demo: [
      "Vista General: quién está de guardia hoy",
      "Mi Calendario: guardias y francos propios",
      "Mis Solicitudes: pedir un franco y ver su estado",
      "Mi Perfil: cargar credencial y permiso",
    ],
    notes: {
      pantallazo: "Qué es: la página donde el equipo de Termomecánica gestiona las guardias. Tiene cuatro secciones: Vista General, Mi Calendario, Mis Solicitudes y Mi Perfil. Contar en una frase cada una y pasar a lo que cambió.",
      mejoras: "Cuatro mejoras que ya se sienten: la guardia nunca queda sin técnicos (hay reglas que lo impiden), no hay cruces al pedir franco porque cada uno elige su día en el sistema, el cronograma se ve con más de un año de antelación y hay aviso de vencimiento de credencial y permiso de conducir. Números de la base de producción al 12/11/2026.",
      demo: "Pasar a la página en vivo (botón o QR). Recorrido sugerido: Vista General → Mi Calendario → pedir un franco en Mis Solicitudes → Mi Perfil.",
    },
  },
  {
    id: "termo", idx: 1, name: "Web Termo", gate: "A2", flight: "MANT-02",
    url: "https://web-termo.vercel.app/", urlShort: "web-termo.vercel.app",
    tagline: "Portal TER/MEC de Aeroparque: todo a mano, en un solo lugar",
    tilesLabel: "OCHO HERRAMIENTAS EN EL PORTAL", cols: 4,
    tiles: [
      { icon: "FaDatabase", title: "Fichas de equipos", big: "+1.000", rest: "equipos" },
      { icon: "FaTasks", title: "Planificación del mes", big: "4–5", rest: "sistemas de aire por guardia" },
      { icon: "FaChartLine", title: "Estado y seguimiento", big: "−27 %", rest: "horas sobreestimadas" },
      { icon: "FaTint", title: "Hidrolavados", big: "2", rest: "campañas al año" },
      { icon: "FaSearch", title: "Auditor de SAP", big: "99,9 %", rest: "de planes con ciclo válido" },
      { icon: "FaRoute", title: "Hojas de ruta", big: "264", rest: "contadores revisados" },
      { icon: "FaCommentDots", title: "Gamas para SAM", big: "94 %", rest: "de OTs con gama identificada" },
      { icon: "FaBoxes", title: "Pañol virtual", big: "22.315", rest: "materiales con su stock" },
    ],
    demo: [
      "Fichas de equipos: buscar un equipo y ver su ficha",
      "Planificación del mes: carga por guardia",
      "Estado y seguimiento: horas por OT",
      "Auditor de SAP y Pañol virtual",
    ],
    notes: {
      pantallazo: "Qué es: un portal que reúne en un solo lugar lo que antes estaba repartido en muchas transacciones de SAP (IH08, IP24, IW38, IW49, IA17, MB52). Son 8 herramientas y +1.000 equipos con su ficha. Recorrer las tarjetas rápido, una frase cada una.",
      mejoras: "Resultados medidos con exports de SAP de septiembre y octubre de 2026. Las cargas son una propuesta de nivelación con 150 cambios de plan. Remarcar: gama identificada sola 83 % → 94 %, pico de carga de aire −26 %, pico de carga mecánica −16 %, horas de OTs registradas −27 %.",
      demo: "Pasar al portal en vivo. Recorrido sugerido: una ficha de equipo → planificación del mes → estado y seguimiento → auditor de SAP / pañol.",
    },
  },
  {
    id: "bhs", idx: 2, name: "Ventanas BHS", gate: "A3", flight: "MANT-03", kind: "aporta",
    url: "https://patio-de-valijas-aep.vercel.app/", urlShort: "patio-de-valijas-aep.vercel.app",
    tagline: "Plan Maestro BHS: ventanas operativas propuestas para el patio de valijas",
    tilesLabel: "QUÉ ENCONTRÁS EN LA PÁGINA", cols: 2,
    tiles: [
      { icon: "FaChartBar", title: "Panel de mantenimiento", desc: "Huecos disponibles y mejor ventana para intervenir" },
      { icon: "FaTasks", title: "Planificador", desc: "Disponibilidad por línea, mostrador y carrusel" },
      { icon: "FaClipboardList", title: "Órdenes de trabajo", desc: "Cada OT con su ventana operativa propuesta" },
      { icon: "FaBookOpen", title: "Cómo funciona el BHS", desc: "Base de conocimiento del STE/SATE" },
    ],
    statsLabel: "PLAN MAESTRO BHS  ·  DATOS CARGADOS EN LA PÁGINA, SEPTIEMBRE 2026",
    stats: [["11.234", "vuelos cargados"], ["122", "OTs cargadas, todas con hueco"], ["1.935 h", "de mantenimiento posibles"], ["166 h", "mejor ventana (línea L-200)"]],
    adv: [
      ["FaClock", "Ventanas operativas a la vista", "Huecos de 60 min o más detectados en cada línea"],
      ["FaFlag", "La mejor ventana, identificada", "El hueco más grande del período para intervenir"],
      ["FaClipboardList", "OTs con hueco recomendado", "Cada orden sale con su ventana propuesta"],
      ["FaBookOpen", "Conocimiento del sistema a mano", "Consulta del STE/SATE sin bajar el PDF técnico"],
    ],
    demo: ["Inicio: huecos y mejor ventana", "Planificador: elegir un día y ver los huecos", "Órdenes de trabajo: ventana propuesta de cada OT", "Cómo funciona el BHS (STE/SATE)"],
    notes: {
      pantallazo: "Qué es: el Plan Maestro del patio de valijas (sistema de tratamiento de equipajes). Propone ventanas operativas para hacer mantenimiento sin molestar la operación. Recorrer los cuatro bloques en una frase cada uno.",
      mejoras: "Cifras tomadas de la página, con los datos cargados de septiembre 2026: 11.234 vuelos, 122 OTs (todas con hueco), 1.935 h de mantenimiento posibles y la mejor ventana en la línea L-200 (166 h 25 min). Si tenés una comparación contra el método anterior, sumala acá.",
      demo: "Pasar a la página en vivo. Recorrido sugerido: Inicio → Planificador (elegir un día) → Órdenes de trabajo → Funcionamiento del sistema.",
    },
  },
  {
    id: "hvac", idx: 3, name: "Programación Equipos de Aire", gate: "A4", flight: "MANT-04", kind: "aporta",
    url: "https://hvacsetpoint.vercel.app/", urlShort: "hvacsetpoint.vercel.app",
    tagline: "HVAC Setpoint Advisor: recomendaciones automáticas según el pronóstico",
    tilesLabel: "SEIS SECCIONES EN LA PÁGINA", cols: 3,
    tiles: [
      { icon: "FaThermometerHalf", title: "Resumen", desc: "Clima actual, setpoints y pronóstico a 7 días" },
      { icon: "FaClock", title: "Tabla horaria", desc: "Sugerencias hora por hora, próximas 24 hs" },
      { icon: "FaCogs", title: "Equipo", desc: "Equipos guardados: unidades piso techo y splits" },
      { icon: "FaStethoscope", title: "Diagnóstico", desc: "Detección de fallas (AFDD) y estado de filtro" },
      { icon: "FaSlidersH", title: "Configuración", desc: "Perfiles de setpoints y límites de validación" },
      { icon: "FaBookOpen", title: "Referencia BMS", desc: "Guía de programación Johnson Metasys" },
    ],
    adv: [
      ["FaCloudSun", "Setpoints según el clima", "Recomendación automática con el pronóstico de Aeroparque"],
      ["FaClock", "Sugerencias hora por hora", "Tabla para las próximas 24 horas"],
      ["FaStethoscope", "Diagnóstico de fallas", "Compara el comando con el estado real del equipo"],
      ["FaSlidersH", "Perfiles por equipo", "Confort, ahorro energético, operación 24/7 y más"],
    ],
    demo: ["Resumen: clima actual y setpoints recomendados", "Tabla horaria: sugerencias de las próximas 24 hs", "Diagnóstico: correr el AFDD en un equipo", "Configuración: elegir un perfil de setpoints"],
    notes: {
      pantallazo: "Qué es: un asesor que recomienda setpoints de los equipos de aire a partir del pronóstico meteorológico (Open-Meteo, se actualiza cada 15 min). Tiene seis secciones: Resumen, Tabla horaria, Equipo, Diagnóstico, Configuración y Referencia BMS.",
      mejoras: "Esta parada no tiene cifras de antes/ahora cargadas todavía: las ventajas salen de lo que hace la página. Si tenés ahorro energético o alguna medición, sumala acá.",
      demo: "Pasar a la página en vivo. Recorrido sugerido: Resumen → Tabla horaria → Diagnóstico (AFDD) → Configuración de perfiles. Falta insertar la captura de pantalla.",
    },
  },
  {
    id: "recorrida", idx: 4, name: "Recorrida", gate: "A5", flight: "MANT-05", kind: "aporta",
    url: "https://recorrida-f778.vercel.app/", urlShort: "recorrida-f778.vercel.app",
    tagline: "Recorridas diarias de Mantenimiento Termomecánica en Aeroparque",
    tilesLabel: "QUÉ ENCONTRÁS EN LA PÁGINA", cols: 2,
    tiles: [
      { icon: "FaPlusCircle", title: "Nueva recorrida", desc: "Elegís el tipo de inspección que vas a hacer" },
      { icon: "FaWind", title: "Recorrida de aire", desc: "Climatización y ventilación, recorrido verde o celeste" },
      { icon: "FaCogs", title: "Recorrida mecánica", desc: "Equipos mecánicos, patio de valijas y pozos/bombas" },
      { icon: "FaHistory", title: "Historial", desc: "Consulta de las recorridas ya realizadas" },
    ],
    adv: [
      ["FaMapMarkedAlt", "Plano de referencia", "Cada recorrido marcado sobre el mapa de AEP"],
      ["FaWind", "Dos tipos de recorrida", "Aire y mecánica, cada una con su ruta"],
      ["FaFlag", "Puntos de control claros", "Check Point, Puesto Pampa y límite PSA en el recorrido"],
      ["FaHistory", "Registro diario con historial", "Las recorridas quedan guardadas para consultar"],
    ],
    demo: ["Nueva: elegir el tipo de recorrida", "Plano de referencia: ver la ruta sobre el mapa", "Recorrida de aire: verde o celeste", "Historial: consultar recorridas anteriores"],
    notes: {
      pantallazo: "Qué es: la página para registrar las recorridas diarias del equipo, con un plano esquemático de Aeroparque que muestra cada ruta (verde: aire, celeste: aire + mecánico, ámbar: control PSA).",
      mejoras: "Esta parada no tiene cifras de antes/ahora cargadas todavía: las ventajas salen de lo que hace la página. Si tenés cantidad de recorridas o tiempos, sumalos acá.",
      demo: "Pasar a la página en vivo. Recorrido sugerido: Nueva → elegir tipo → mirar la ruta en el plano → Historial.",
    },
  },
  {
    id: "techo", idx: 5, name: "Filtraciones de Techo", gate: "A6", flight: "MANT-06", kind: "aporta",
    url: "https://filtraciones-infra.vercel.app/", urlShort: "filtraciones-infra.vercel.app",
    tagline: "Monitoreo de techos de la terminal: incidencias por sector",
    tilesLabel: "QUÉ ENCONTRÁS EN LA PÁGINA", cols: 2,
    tiles: [
      { icon: "FaMapMarkedAlt", title: "Mapa por sectores", desc: "Tocás un sector del techo para seleccionarlo" },
      { icon: "FaPlusCircle", title: "Nueva incidencia", desc: "Registrás la incidencia sobre el sector" },
      { icon: "FaFireAlt", title: "Mapa de calor", desc: "Los sectores se colorean según la cantidad de incidencias" },
      { icon: "FaFileDownload", title: "Resumen y exportación", desc: "Totales por estado y descarga en CSV" },
    ],
    adv: [
      ["FaFireAlt", "Sectores críticos visibles", "El color indica dónde se concentran las incidencias"],
      ["FaClipboardList", "Seguimiento hasta el cierre", "Abiertas, en reparación y cerradas"],
      ["FaFileDownload", "Datos para analizar", "Exportación a CSV de todas las incidencias"],
      ["FaMobileAlt", "Pensada para usar en campo", "Zoom y rotación con dos dedos en el celular"],
    ],
    demo: ["Mapa: seleccionar un sector del techo", "Registrar una nueva incidencia", "Mapa de calor por cantidad de incidencias", "Resumen y exportación a CSV"],
    notes: {
      pantallazo: "Qué es: un mapa del techo de la terminal dividido en sectores donde se registran las filtraciones; el color de cada sector muestra cuántas incidencias tiene.",
      mejoras: "Esta parada no tiene cifras de antes/ahora cargadas todavía: las ventajas salen de lo que hace la página. Si tenés cantidad de incidencias registradas o tiempos de cierre, sumalos acá.",
      demo: "Pasar a la página en vivo. Recorrido sugerido: elegir un sector → registrar una incidencia → ver el mapa de calor → exportar. Falta insertar la captura de pantalla.",
    },
  },
  {
    id: "pista", idx: 6, name: "Infraestructura lado pista", gate: "A7", flight: "MANT-07", kind: "aporta",
    url: "https://infra-lado-pista.vercel.app/", urlShort: "infra-lado-pista.vercel.app",
    tagline: "Monitoreo PCI de pista: estado del pavimento por loza e incidencias",
    tilesLabel: "QUÉ ENCONTRÁS EN LA PÁGINA", cols: 2,
    tiles: [
      { icon: "FaMapMarkedAlt", title: "Mapa por loza", desc: "Un clic en una loza muestra su información" },
      { icon: "FaTachometerAlt", title: "Escala PCI", desc: "De 0 a 100, de fallado a excelente" },
      { icon: "FaExclamationTriangle", title: "Incidencias", desc: "Registro por loza, filtrable por estructura" },
      { icon: "FaExchangeAlt", title: "Dos vistas", desc: "Alterná entre vista PCI e incidencias" },
    ],
    adv: [
      ["FaMapMarkedAlt", "Pavimento a la vista", "Cada loza coloreada según su PCI"],
      ["FaTachometerAlt", "Una escala común", "Siete categorías, de excelente a fallado"],
      ["FaExclamationTriangle", "Incidencias con seguimiento", "Abiertas, en reparación y cerradas"],
      ["FaFileDownload", "Filtros y exportación", "Filtro por estructura y descarga en CSV"],
    ],
    demo: ["Vista PCI: estado de cada loza", "Clic en una loza para ver su información", "Vista de incidencias", "Filtrar por estructura y exportar"],
    notes: {
      pantallazo: "Qué es: el monitoreo del PCI (índice de condición del pavimento) del lado pista de Aeroparque, loza por loza, junto con el registro de incidencias.",
      mejoras: "Esta parada no tiene cifras de antes/ahora cargadas todavía: las ventajas salen de lo que hace la página. Si tenés el PCI promedio o cantidad de incidencias, sumalos acá.",
      demo: "Pasar a la página en vivo. Recorrido sugerido: vista PCI → clic en una loza → vista de incidencias → filtro por estructura. Falta insertar la captura de pantalla.",
    },
  },
];


// ── Campos extra solo para la versión web ──
Object.assign(STOPS[0], {
  kind: "aporta", aportaTitle: "Lo que mejoró",
  statsLabel: "GRILLA INTELIGENTE  ·  DATOS DE PRODUCCIÓN AL 12/11/2026",
  stats: [["231", "francos gestionados desde junio"], ["37/39", "personas ya lo usan"], ["2", "técnicos mínimos por especialidad"], ["+1 año", "de cronograma visible"]],
  adv: [
    ["FaShieldAlt", "Guardia siempre cubierta", "Las reglas impiden dejarla sin técnicos"],
    ["FaComments", "Sin cruces al pedir franco", "Cada técnico elige su día en el sistema"],
    ["FaCalendarAlt", "Agenda a más de un año", "Cronograma visible con mucha antelación"],
    ["FaBell", "Vencimientos a tiempo", "Aviso de credencial y permiso de conducir"],
  ],
});
Object.assign(STOPS[1], {
  kind: "compare", aportaTitle: "Lo que mejoró",
  before: { title: "Datos repartidos en muchas transacciones de SAP", sub: "IH08 · IP24 · IW38 · IW49 · IA17 · MB52" },
  after: { title: "Todo a mano en un solo lugar, para técnicos y supervisión", sub: "Portal TER/MEC · 6 exports de SAP reunidos" },
  metrics: [
    { t: "Gama identificada sola", d: "+11 pts", v: [83, 94], u: " %" },
    { t: "Pico de carga de aire", d: "−26 %", v: [1324, 981], u: " h" },
    { t: "Pico de carga mecánica", d: "−16 %", v: [846, 712], u: " h" },
    { t: "Horas de OTs registradas", d: "−27 %", v: [1693, 1239], u: " h" },
  ],
  foot: "Gris: antes · Verde: ahora · Cargas: propuesta de nivelación con 150 cambios de plan · Exports de SAP, sept. y oct. de 2026",
});
for (const st of STOPS.slice(2)) st.aportaTitle = "Lo que aporta";

module.exports = { TOTAL_STOPS, ROUTE, STOPS };
