/**
 * Presentación gerencial — Herramientas de Mantenimiento AEP
 * Concepto: "pantalla de salidas / tarjeta de embarque". Cada herramienta es una PARADA del vuelo:
 *   1) Pantallazo (tarjeta de embarque)  2) Lo que mejoró  3) En funcionamiento (demo en vivo)
 * Para sumar una herramienta: agregar un objeto en STOPS y (si hace falta) un layout de "mejoras".
 *
 * Uso: node build_deck.js   → genera Presentacion_Mantenimiento_AEP.pptx
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const SKILL = "/root/.claude/skills/synced/806c2dcf-b9cd-48a9-861c-48c2302dc41b_b8674e9b-e43f-44de-9696-0f54fb21bcc5/pptx";
const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js"));

const A = (f) => path.join(__dirname, "assets", f);
const OUT = path.join(__dirname, "Presentacion_Mantenimiento_AEP.pptx");

// ───────────── Paleta (la misma del hub de salidas) ─────────────
const INK = "0A0D10", PANEL = "12171B", PANEL2 = "171D22", LINE = "232B31", LINE2 = "3A444C";
const AMBER = "FFB020", BLUE = "4FB0E8", GREEN = "35C97A", MINT = "8ECB93", BRAND = "2F86B8";
const TEXT = "EDEFF1", MUTED = "8A94A0", GRAY = "6E7A85";
const HEAD = "Arial", BODY = "Arial", MONO = "Courier New";

const THEME = {
  name: "Mantenimiento AEP — Salidas",
  headFontFace: HEAD, bodyFontFace: BODY,
  colors: { dk1: INK, lt1: TEXT, dk2: PANEL, lt2: MUTED, accent1: AMBER, accent2: BLUE, accent3: GREEN,
            accent4: MINT, accent5: BRAND, accent6: "E8664F", hlink: BLUE, folHlink: MUTED },
};

// ───────────── Contenido ─────────────
const { TOTAL_STOPS, ROUTE, STOPS, presentationUrl: PRES_URL, flapLines } = require("./data.js");

// ───────────── Íconos ─────────────
const iconCache = {};
async function icon(name, hex = TEXT) {
  const key = name + hex;
  if (!iconCache[key]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + hex, size: 256 }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    iconCache[key] = "image/png;base64," + buf.toString("base64");
  }
  return iconCache[key];
}

// ───────────── Helpers de dibujo ─────────────
const mono = (s, text, x, y, w, h, o = {}) =>
  s.addText(text, { x, y, w, h, fontFace: MONO, fontSize: 11, color: MUTED, margin: 0, valign: "middle", isTextBox: true, ...o });
const sans = (s, text, x, y, w, h, o = {}) =>
  s.addText(text, { x, y, w, h, fontFace: BODY, fontSize: 14, color: TEXT, margin: 0, valign: "top", isTextBox: true, ...o });

function pill(s, text, x, y, w, color, name) {
  s.addShape("roundRect", { x, y, w, h: 0.36, rectRadius: 0.18, fill: { color, transparency: 85 }, line: { color, width: 1 }, objectName: name || "Estado" });
  mono(s, text, x, y, w, 0.36, { align: "center", bold: true, color, fontSize: 11, charSpacing: 1 });
}

async function header(s, left, status, statusColor) {
  mono(s, left, 0.5, 0.38, 8, 0.36, { color: AMBER, fontSize: 12, bold: true, charSpacing: 1, objectName: "Parada" });
  if (status) pill(s, "●  " + status, 10.43, 0.38, 2.4, statusColor, "Estado de la parada");
}

async function tracker(s, cur) {
  const xs = Array.from({ length: TOTAL_STOPS }, (_, i) => 2.5 + (i * (12.6 - 2.5)) / (TOTAL_STOPS - 1));
  const y = 7.0;
  mono(s, "RUTA MANT-AEP", 0.5, y - 0.15, 1.8, 0.3, { fontSize: 10, charSpacing: 1 });
  s.addShape("line", { x: xs[0], y, w: xs[6] - xs[0], h: 0, line: { color: LINE2, width: 1.5, dashType: "dash" }, objectName: "Ruta pendiente" });
  if (cur > 0) s.addShape("line", { x: xs[0], y, w: xs[cur] - xs[0], h: 0, line: { color: GREEN, width: 2 }, objectName: "Ruta recorrida" });
  for (let i = 0; i < TOTAL_STOPS; i++) {
    if (i < cur) s.addShape("ellipse", { x: xs[i] - 0.1, y: y - 0.1, w: 0.2, h: 0.2, fill: { color: GREEN }, line: { color: GREEN, width: 1 }, objectName: `Parada ${i + 1} hecha` });
    else if (i === cur) {
      s.addShape("ellipse", { x: xs[i] - 0.23, y: y - 0.23, w: 0.46, h: 0.46, fill: { color: INK }, line: { color: AMBER, width: 2 }, objectName: `Parada ${i + 1} actual` });
      s.addImage({ data: await icon("FaPlane", AMBER), x: xs[i] - 0.13, y: y - 0.13, w: 0.26, h: 0.26, altText: "Parada actual", objectName: "Avión" });
    } else s.addShape("ellipse", { x: xs[i] - 0.1, y: y - 0.1, w: 0.2, h: 0.2, fill: { color: INK }, line: { color: LINE2, width: 1.5 }, objectName: `Parada ${i + 1} pendiente` });
  }
}

const base = (pres, section) => { const s = pres.addSlide({ sectionTitle: section }); s.background = { color: INK }; return s; };

// ───────────── Slides ─────────────
async function slideCover(pres) {
  const s = pres.addSlide({ sectionTitle: "Embarque" });
  s.background = { path: A("bg_cover.png") };
  s.addImage({ path: A("logo_blanco.png"), x: 0.8, y: 0.6, w: 1.1, h: 0.94, altText: "Logo Aeropuertos Argentina" });
  mono(s, "●  EMBARQUE GENERAL — MANTENIMIENTO AEP", 0.8, 2.25, 6.6, 0.35, { color: MINT, fontSize: 12, bold: true, charSpacing: 1 });
  sans(s, "Bienvenidos\na bordo.", 0.8, 2.7, 6.6, 2.0, { fontSize: 54, bold: true, fontFace: HEAD, valign: "top", lineSpacingMultiple: 0.95 });
  sans(s, "7 herramientas, un solo recorrido: qué hace cada una, qué ventajas tiene y qué mejoró en el día a día.", 0.8, 4.85, 6.0, 1.0, { fontSize: 18, color: "CFE3E6" });
  mono(s, "AEROPARQUE JORGE NEWBERY  ·  NOVIEMBRE 2026", 0.8, 6.5, 6.6, 0.3, { color: "CFE3E6", fontSize: 11, charSpacing: 1 });

  // Tarjeta de embarque
  const cx = 7.85, cy = 0.9, cw = 4.98, ch = 5.7;
  s.addShape("roundRect", { x: cx, y: cy, w: cw, h: ch, rectRadius: 0.18, fill: { color: "F3F7F8" }, line: { color: "F3F7F8" }, shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 18, offset: 6, angle: 90 }, objectName: "Tarjeta de embarque" });
  s.addImage({ path: A("logo_simbolo.png"), x: cx + 0.35, y: cy + 0.35, w: 0.62, h: 0.35, altText: "Símbolo Aeropuertos Argentina" });
  mono(s, "AEROPUERTOS ARGENTINA", cx + 1.1, cy + 0.33, 3.0, 0.2, { color: INK, bold: true, fontSize: 11, charSpacing: 1 });
  mono(s, "TARJETA DE EMBARQUE · BOARDING PASS", cx + 1.1, cy + 0.55, 3.5, 0.2, { color: "5B6570", fontSize: 10 });
  // desde / hacia
  const ry = cy + 1.2;
  mono(s, "DESDE", cx + 0.35, ry, 1.8, 0.2, { color: "5B6570", fontSize: 10 });
  sans(s, "Datos dispersos", cx + 0.35, ry + 0.25, 1.75, 0.75, { fontSize: 18, bold: true, color: INK });
  s.addImage({ data: await icon("FaPlane", BRAND), x: cx + 2.25, y: ry + 0.38, w: 0.5, h: 0.5, altText: "Avión" });
  mono(s, "HACIA", cx + 2.95, ry, 1.7, 0.2, { color: "5B6570", fontSize: 10 });
  sans(s, "Un solo portal", cx + 2.95, ry + 0.25, 1.7, 0.75, { fontSize: 18, bold: true, color: INK });
  // campos
  const fy = cy + 2.6;
  [["FECHA", "NOV 2026"], ["PARADAS", "07"], ["VUELO", "MANT-AEP"]].forEach(([k, v], i) => {
    const fx = cx + 0.35 + i * 1.5;
    mono(s, k, fx, fy, 1.4, 0.2, { color: "5B6570", fontSize: 10 });
    mono(s, v, fx, fy + 0.25, 1.45, 0.35, { color: INK, bold: true, fontSize: 15 });
  });
  mono(s, "PASAJERO", cx + 0.35, fy + 0.85, 2, 0.2, { color: "5B6570", fontSize: 10 });
  sans(s, "Equipo de Mantenimiento AEP", cx + 0.35, fy + 1.1, 4.3, 0.35, { fontSize: 16, bold: true, color: INK });
  s.addShape("line", { x: cx, y: cy + 4.15, w: cw, h: 0, line: { color: "A9B4BA", width: 1, dashType: "dash" }, objectName: "Perforado" });
  s.addImage({ path: A("qr_presentacion.png"), x: cx + 0.35, y: cy + 4.35, w: 1.2, h: 1.2, altText: "Código QR para abrir la presentación", hyperlink: { url: PRES_URL } });
  mono(s, "ESCANEÁ PARA ABORDAR", cx + 1.85, cy + 4.4, 2.8, 0.2, { color: "5B6570", fontSize: 10 });
  sans(s, "Abrí la presentación en tu celular", cx + 1.85, cy + 4.65, 2.8, 0.6, { fontSize: 16, bold: true, color: INK });
  mono(s, PRES_URL.replace(/^https?:\/\//, ""), cx + 1.85, cy + 5.2, 2.8, 0.3, { color: "5B6570", fontSize: 9 });
  s.addNotes("Apertura. Contar la idea del recorrido: cada herramienta es una parada de un vuelo. En cada una vamos a ver primero un pantallazo (qué hace), después qué mejoró, y por último la página funcionando en vivo.");
}

async function slideItinerary(pres) {
  const s = base(pres, "Embarque");
  await header(s, "SALIDAS · DEPARTURES", null);
  mono(s, "NOVIEMBRE 2026", 10.43, 0.38, 2.4, 0.36, { align: "right", color: AMBER, fontSize: 12, bold: true });
  sans(s, "Itinerario de vuelo", 0.5, 0.85, 8, 0.7, { fontSize: 34, bold: true, fontFace: HEAD });
  sans(s, "Siete paradas, un solo recorrido.", 0.5, 1.5, 8, 0.4, { fontSize: 16, color: MUTED });
  const px = 0.5, py = 2.1, pw = 12.33, rowH = 0.56, hdrH = 0.5;
  s.addShape("roundRect", { x: px, y: py, w: pw, h: hdrH + rowH * 7 + 0.15, rectRadius: 0.12, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: "Panel de salidas" });
  const cols = { n: px + 0.3, dest: px + 1.0, hl: px + 6.0, gate: px + 9.0, st: px + 10.0 };
  [["N°", cols.n, 0.6], ["DESTINO", cols.dest, 4], ["DESTACADO", cols.hl, 3], ["PUERTA", cols.gate, 1], ["ESTADO", cols.st, 2]].forEach(([t, x, w]) =>
    mono(s, t, x, py + 0.12, w, hdrH - 0.2, { fontSize: 10, charSpacing: 1 }));
  for (let i = 0; i < 7; i++) {
    const r = ROUTE[i], y = py + hdrH + i * rowH, live = true;
    if (i === 0) s.addShape("rect", { x: px + 0.1, y: y + 0.02, w: pw - 0.2, h: rowH - 0.04, fill: { color: AMBER, transparency: 92 }, line: { color: AMBER, transparency: 92, width: 0.5 }, objectName: `Fila ${i + 1} destacada` });
    mono(s, String(i + 1).padStart(2, "0"), cols.n, y, 0.6, rowH, { color: live ? AMBER : MUTED, fontSize: 14 });
    mono(s, r.name.toUpperCase(), cols.dest, y, 5.0, rowH, { color: live ? TEXT : MUTED, fontSize: 15, bold: true });
    mono(s, r.highlight || "—", cols.hl, y, 3.4, rowH, { color: live ? MINT : LINE2, fontSize: 11 });
    mono(s, r.gate, cols.gate, y, 1, rowH, { color: live ? AMBER : MUTED, fontSize: 15, bold: true });
    if (live) pill(s, i === 0 ? "EMBARCANDO" : "PRÓXIMA", cols.st, y + 0.1, 1.95, i === 0 ? AMBER : BLUE, `Estado fila ${i + 1}`);
    else pill(s, "PROGRAMADA", cols.st, y + 0.1, 1.95, GRAY, `Estado fila ${i + 1}`);
  }
  s.addNotes("Mostrar el itinerario completo: son 7 herramientas del equipo. En cada parada vemos primero un pantallazo, después qué aporta o qué mejoró, y por último la página funcionando.");
}

// Slide de "cambio de destino": tablero de salidas con el nuevo destino en letras de tablero
async function slideDepart(pres, st) {
  const s = base(pres, st.name);
  const n = String(st.idx + 1).padStart(2, "0");
  await header(s, `PARADA ${n} / ${String(TOTAL_STOPS).padStart(2, "0")}  ·  PUERTA ${st.gate}`, "CAMBIO DE DESTINO", AMBER);
  mono(s, "●  CAMBIO DE DESTINO", 0.5, 1.15, 12.33, 0.4, { align: "center", color: AMBER, bold: true, fontSize: 20, charSpacing: 4 });
  mono(s, st.prev ? `DESDE  ${st.prev.toUpperCase()}  ·  ABORDADA` : "DESDE  ITINERARIO", 0.5, 1.75, 12.33, 0.35, { align: "center", color: MUTED, fontSize: 14, charSpacing: 1 });
  const lines = flapLines(st.name), tw = 0.5, th = 0.8, gap = 0.06, sp = 0.28;
  const y0 = lines.length === 1 ? 2.85 : 2.4;
  lines.forEach((ln, r) => {
    const widths = [...ln].map((c) => (c === " " ? sp : tw));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
    let x = (13.333 - total) / 2; const y = y0 + r * (th + 0.14);
    [...ln].forEach((c, k) => {
      if (c !== " ") {
        s.addText(c, { shape: "roundRect", rectRadius: 0.06, x, y, w: tw, h: th, fill: { color: "1B2229" }, line: { color: LINE2, width: 1 }, fontFace: MONO, fontSize: 40, bold: true, color: TEXT, align: "center", valign: "middle", margin: 0, objectName: `Letra ${c}` });
        s.addShape("line", { x, y: y + th / 2, w: tw, h: 0, line: { color: INK, width: 1.5 }, objectName: "Línea del tablero" });
      }
      x += widths[k] + gap;
    });
  });
  sans(s, st.tagline, 1.5, 4.6, 10.33, 0.5, { fontSize: 18, color: MUTED, align: "center" });
  const chips = [[`PARADA ${n} / ${String(TOTAL_STOPS).padStart(2, "0")}`, TEXT], [`PUERTA ${st.gate}`, AMBER], [`VUELO ${st.flight}`, TEXT]];
  chips.forEach(([t, c], i) => {
    const w = 2.5, x = (13.333 - (w * 3 + 0.3 * 2)) / 2 + i * (w + 0.3);
    s.addShape("roundRect", { x, y: 5.5, w, h: 0.55, rectRadius: 0.1, fill: { color: PANEL }, line: { color: LINE2, width: 1 }, objectName: `Dato ${i + 1}` });
    mono(s, t, x, 5.5, w, 0.55, { align: "center", bold: true, color: c, fontSize: 14, charSpacing: 1 });
  });
  await tracker(s, st.idx);
  s.addNotes(st.notes.destino);
}

// Tarjeta de embarque = pantallazo de la herramienta
async function slidePantallazo(pres, st) {
  const s = base(pres, st.name);
  await header(s, `PARADA ${String(st.idx + 1).padStart(2, "0")} / ${String(TOTAL_STOPS).padStart(2, "0")}  ·  PUERTA ${st.gate}`, "EMBARCANDO", AMBER);
  const cx = 0.5, cy = 0.95, cw = 12.33, ch = 5.6, sx = 9.6;
  s.addShape("roundRect", { x: cx, y: cy, w: cw, h: ch, rectRadius: 0.15, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: "Tarjeta de embarque" });
  s.addShape("line", { x: sx, y: cy + 0.3, w: 0, h: ch - 0.6, line: { color: LINE2, width: 1.25, dashType: "dash" }, objectName: "Perforado" });
  s.addShape("ellipse", { x: sx - 0.2, y: cy - 0.2, w: 0.4, h: 0.4, fill: { color: INK }, line: { color: INK }, objectName: "Muesca superior" });
  s.addShape("ellipse", { x: sx - 0.2, y: cy + ch - 0.2, w: 0.4, h: 0.4, fill: { color: INK }, line: { color: INK }, objectName: "Muesca inferior" });

  mono(s, `DESTINO  ·  PARADA ${String(st.idx + 1).padStart(2, "0")}`, 0.9, 1.25, 8, 0.3, { color: AMBER, bold: true, fontSize: 12, charSpacing: 1 });
  sans(s, st.name, 0.9, 1.55, 8.4, 0.8, { fontSize: 40, bold: true, fontFace: HEAD, valign: "middle" });
  sans(s, st.tagline, 0.9, 2.35, 8.4, 0.4, { fontSize: 16, color: MUTED });
  mono(s, st.tilesLabel, 0.9, 2.95, 8, 0.25, { fontSize: 10, charSpacing: 1 });

  const gx = 0.9, gy = 3.3, gw = 8.3, gap = 0.2;
  if (st.cols === 2) {
    const tw = (gw - gap) / 2, th = 1.3;
    for (let i = 0; i < st.tiles.length; i++) {
      const t = st.tiles[i], x = gx + (i % 2) * (tw + gap), y = gy + Math.floor(i / 2) * (th + gap);
      s.addShape("roundRect", { x, y, w: tw, h: th, rectRadius: 0.1, fill: { color: PANEL2 }, line: { color: LINE, width: 1 }, objectName: `Sección ${t.title}` });
      s.addShape("ellipse", { x: x + 0.22, y: y + (th - 0.66) / 2, w: 0.66, h: 0.66, fill: { color: BRAND }, line: { color: BRAND }, objectName: "Fondo ícono" });
      s.addImage({ data: await icon(t.icon, "FFFFFF"), x: x + 0.38, y: y + (th - 0.34) / 2, w: 0.34, h: 0.34, altText: t.title });
      sans(s, t.title, x + 1.1, y + 0.2, tw - 1.25, 0.35, { fontSize: 17, bold: true });
      sans(s, t.desc, x + 1.1, y + 0.58, tw - 1.25, 0.6, { fontSize: 14, color: MUTED });
    }
  } else {
    const nc = st.cols, tw = (gw - gap * (nc - 1)) / nc, th = nc === 3 ? 1.4 : 1.45;
    for (let i = 0; i < st.tiles.length; i++) {
      const t = st.tiles[i], x = gx + (i % nc) * (tw + gap), y = gy + Math.floor(i / nc) * (th + gap);
      s.addShape("roundRect", { x, y, w: tw, h: th, rectRadius: 0.1, fill: { color: PANEL2 }, line: { color: LINE, width: 1 }, objectName: `Herramienta ${t.title}` });
      s.addImage({ data: await icon(t.icon, BLUE), x: x + 0.15, y: y + 0.14, w: 0.3, h: 0.3, altText: t.title });
      sans(s, t.title, x + 0.15, y + 0.46, tw - 0.25, 0.5, { fontSize: 14, bold: true, valign: "bottom" });
      if (t.desc) sans(s, t.desc, x + 0.15, y + 0.98, tw - 0.25, 0.42, { fontSize: 12, color: MUTED });
      else sans(s, [{ text: t.big + " ", options: { bold: true, color: MINT, fontSize: 13 } }, { text: t.rest, options: { color: MUTED, fontSize: 12 } }], x + 0.15, y + 0.98, tw - 0.25, 0.42, { fontSize: 12 });
    }
  }

  // Talón
  const tx = sx + 0.4, tw2 = cw + cx - sx - 0.8;
  const field = (k, v, y, color = TEXT, size = 26) => {
    mono(s, k, tx, y, tw2, 0.22, { fontSize: 10, charSpacing: 1 });
    mono(s, v, tx, y + 0.24, tw2, 0.5, { fontSize: size, bold: true, color });
  };
  field("PUERTA", st.gate, 1.4, AMBER, 36);
  field("ESTADO", "EMBARCANDO", 2.5, GREEN, 16);
  field("VUELO", st.flight, 3.35, TEXT, 20);
  mono(s, "DESTINO WEB", tx, 4.25, tw2, 0.22, { fontSize: 10, charSpacing: 1 });
  sans(s, st.urlShort, tx, 4.5, tw2, 0.55, { fontSize: 11, color: BLUE, fontFace: MONO });
  s.addImage({ path: A("barcode_claro.png"), x: tx, y: 5.45, w: tw2, h: 0.55, transparency: 25, altText: "Código de barras decorativo" });
  await tracker(s, st.idx);
  s.addNotes(st.notes.pantallazo);
}

async function slideGrillaMejoras(pres, st) {
  const s = base(pres, st.name);
  await header(s, `PARADA 01 / 07  ·  PUERTA ${st.gate}`, "EN VUELO", BLUE);
  sans(s, "Lo que mejoró", 0.5, 0.8, 8, 0.75, { fontSize: 36, bold: true, fontFace: HEAD, valign: "middle" });
  mono(s, "GRILLA INTELIGENTE  ·  DATOS DE PRODUCCIÓN AL 12/11/2026", 0.5, 1.5, 9, 0.3, { fontSize: 11, charSpacing: 1 });
  const stats = [["231", "francos gestionados desde junio"], ["37/39", "personas ya lo usan"], ["2", "técnicos mínimos por especialidad"], ["+1 año", "de cronograma visible"]];
  const sw = (12.33 - 0.6) / 4;
  stats.forEach(([n, l], i) => {
    const x = 0.5 + i * (sw + 0.2), y = 1.95;
    s.addShape("roundRect", { x, y, w: sw, h: 1.55, rectRadius: 0.1, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: `Cifra ${l}` });
    mono(s, n, x, y + 0.15, sw, 0.85, { fontSize: 44, bold: true, color: AMBER, align: "center" });
    sans(s, l, x + 0.2, y + 1.0, sw - 0.4, 0.55, { fontSize: 14, color: MUTED, align: "center" });
  });
  const adv = [
    ["FaShieldAlt", "Guardia siempre cubierta", "Las reglas impiden dejarla sin técnicos"],
    ["FaComments", "Sin cruces al pedir franco", "Cada técnico elige su día en el sistema"],
    ["FaCalendarAlt", "Agenda a más de un año", "Cronograma visible con mucha antelación"],
    ["FaBell", "Vencimientos a tiempo", "Aviso de credencial y permiso de conducir"],
  ];
  const aw = (12.33 - 0.2) / 2, ah = 1.25;
  for (let i = 0; i < 4; i++) {
    const [ic, t, d] = adv[i], x = 0.5 + (i % 2) * (aw + 0.2), y = 3.7 + Math.floor(i / 2) * (ah + 0.2);
    s.addShape("roundRect", { x, y, w: aw, h: ah, rectRadius: 0.1, fill: { color: PANEL2 }, line: { color: LINE, width: 1 }, objectName: `Ventaja ${t}` });
    s.addShape("ellipse", { x: x + 0.3, y: y + (ah - 0.7) / 2, w: 0.7, h: 0.7, fill: { color: GREEN, transparency: 80 }, line: { color: GREEN, width: 1 }, objectName: "Fondo ícono" });
    s.addImage({ data: await icon(ic, GREEN), x: x + 0.46, y: y + (ah - 0.38) / 2, w: 0.38, h: 0.38, altText: t });
    sans(s, t, x + 1.3, y + 0.28, aw - 1.5, 0.4, { fontSize: 19, bold: true });
    sans(s, d, x + 1.3, y + 0.7, aw - 1.5, 0.45, { fontSize: 14, color: MUTED });
  }
  await tracker(s, st.idx);
  s.addNotes(st.notes.mejoras);
}

async function slideTermoMejoras(pres, st) {
  const s = base(pres, st.name);
  await header(s, `PARADA 02 / 07  ·  PUERTA ${st.gate}`, "EN VUELO", BLUE);
  sans(s, "Lo que mejoró", 0.5, 0.75, 8, 0.7, { fontSize: 36, bold: true, fontFace: HEAD, valign: "middle" });
  // Antes → Ahora
  const y0 = 1.45, h0 = 1.25, w0 = 5.6;
  s.addShape("roundRect", { x: 0.5, y: y0, w: w0, h: h0, rectRadius: 0.1, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: "Antes" });
  mono(s, "ANTES", 0.75, y0 + 0.12, 2, 0.22, { fontSize: 10, charSpacing: 1 });
  sans(s, "Datos repartidos en muchas transacciones de SAP", 0.75, y0 + 0.36, w0 - 0.5, 0.5, { fontSize: 14, bold: true, color: "C3CAD0" });
  mono(s, "IH08 · IP24 · IW38 · IW49 · IA17 · MB52", 0.75, y0 + 0.9, w0 - 0.5, 0.25, { fontSize: 11, color: MUTED });
  s.addImage({ data: await icon("FaPlane", AMBER), x: 6.4, y: y0 + 0.37, w: 0.5, h: 0.5, altText: "Hacia" });
  s.addShape("roundRect", { x: 7.23, y: y0, w: w0, h: h0, rectRadius: 0.1, fill: { color: AMBER, transparency: 90 }, line: { color: AMBER, width: 1.25 }, objectName: "Ahora" });
  mono(s, "AHORA", 7.48, y0 + 0.12, 2, 0.22, { fontSize: 10, charSpacing: 1, color: AMBER, bold: true });
  sans(s, "Todo a mano en un solo lugar, para técnicos y supervisión", 7.48, y0 + 0.36, w0 - 0.5, 0.5, { fontSize: 14, bold: true });
  mono(s, "Portal TER/MEC · 6 exports de SAP reunidos", 7.48, y0 + 0.9, w0 - 0.5, 0.25, { fontSize: 11, color: MINT });
  // Gráficos nativos antes/ahora
  const metrics = [
    { t: "Gama identificada sola", d: "+11 pts", v: [83, 94], u: " %", max: 100 },
    { t: "Pico de carga de aire", d: "−26 %", v: [1324, 981], u: " h", max: 1324 },
    { t: "Pico de carga mecánica", d: "−16 %", v: [846, 712], u: " h", max: 846 },
    { t: "Horas de OTs registradas", d: "−27 %", v: [1693, 1239], u: " h", max: 1693 },
  ];
  const cw = 6.065, chh = 1.75;
  metrics.forEach((m, i) => {
    const x = 0.5 + (i % 2) * (cw + 0.2), y = 2.85 + Math.floor(i / 2) * (chh + 0.1);
    s.addShape("roundRect", { x, y, w: cw, h: chh, rectRadius: 0.1, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: `Panel ${m.t}` });
    sans(s, m.t, x + 0.25, y + 0.12, 3.6, 0.35, { fontSize: 14, bold: true, valign: "middle" });
    mono(s, m.d, x + cw - 2.0, y + 0.1, 1.8, 0.4, { fontSize: 20, bold: true, color: GREEN, align: "right" });
    s.addChart(pres.charts.BAR, [{ name: m.t, labels: ["Antes  " + m.v[0].toLocaleString("es-AR") + m.u, "Ahora  " + m.v[1].toLocaleString("es-AR") + m.u], values: m.v }], {
      x: x + 0.15, y: y + 0.52, w: cw - 0.3, h: 1.16, objectName: `Gráfico ${m.t}`,
      barDir: "bar", barGapWidthPct: 45, chartColors: [GRAY, GREEN],
      showValue: false,
      catAxisOrientation: "maxMin", catAxisLabelColor: TEXT, catAxisLabelFontSize: 12, catAxisLabelFontFace: BODY, catAxisLineShow: false,
      valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: m.max, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false, showTitle: false,
    });
  });
  mono(s, "Gris: antes · Verde: ahora · Cargas: propuesta de nivelación con 150 cambios de plan · Exports de SAP, sept. y oct. de 2026", 0.5, 6.52, 12.33, 0.25, { fontSize: 10 });
  await tracker(s, st.idx);
  s.addNotes(st.notes.mejoras);
}

async function slideAporta(pres, st) {
  const s = base(pres, st.name);
  const n = String(st.idx + 1).padStart(2, "0");
  await header(s, `PARADA ${n} / 07  ·  PUERTA ${st.gate}`, "EN VUELO", BLUE);
  sans(s, "Lo que aporta", 0.5, 0.8, 8, 0.75, { fontSize: 36, bold: true, fontFace: HEAD, valign: "middle" });
  mono(s, st.statsLabel || st.name.toUpperCase(), 0.5, 1.5, 12, 0.3, { fontSize: 11, charSpacing: 1 });
  const aw = (12.33 - 0.2) / 2;
  let top = 1.95, ah = 2.1;
  if (st.stats) {
    const sw = (12.33 - 0.6) / 4;
    st.stats.forEach(([num, l], i) => {
      const x = 0.5 + i * (sw + 0.2);
      s.addShape("roundRect", { x, y: 1.95, w: sw, h: 1.55, rectRadius: 0.1, fill: { color: PANEL }, line: { color: LINE, width: 1 }, objectName: `Cifra ${l}` });
      mono(s, num, x, 2.1, sw, 0.85, { fontSize: 40, bold: true, color: AMBER, align: "center" });
      sans(s, l, x + 0.2, 2.95, sw - 0.4, 0.5, { fontSize: 14, color: MUTED, align: "center" });
    });
    top = 3.7; ah = 1.25;
  }
  for (let i = 0; i < 4; i++) {
    const [ic, t, d] = st.adv[i], x = 0.5 + (i % 2) * (aw + 0.2), y = top + Math.floor(i / 2) * (ah + 0.2);
    const big = !st.stats, d0 = big ? 0.9 : 0.7;
    s.addShape("roundRect", { x, y, w: aw, h: ah, rectRadius: 0.1, fill: { color: PANEL2 }, line: { color: LINE, width: 1 }, objectName: `Ventaja ${t}` });
    s.addShape("ellipse", { x: x + 0.3, y: y + (ah - d0) / 2, w: d0, h: d0, fill: { color: GREEN, transparency: 80 }, line: { color: GREEN, width: 1 }, objectName: "Fondo ícono" });
    const is = big ? 0.46 : 0.38;
    s.addImage({ data: await icon(ic, GREEN), x: x + 0.3 + (d0 - is) / 2, y: y + (ah - is) / 2, w: is, h: is, altText: t });
    const tx = x + 0.3 + d0 + 0.3, tw = aw - (tx - x) - 0.25;
    sans(s, t, tx, y + (big ? 0.5 : 0.28), tw, 0.4, { fontSize: big ? 22 : 19, bold: true });
    sans(s, d, tx, y + (big ? 0.95 : 0.7), tw, big ? 0.9 : 0.5, { fontSize: 14, color: MUTED });
  }
  await tracker(s, st.idx);
  s.addNotes(st.notes.mejoras);
}

async function slideDemo(pres, st) {
  const s = base(pres, st.name);
  await header(s, `PARADA ${String(st.idx + 1).padStart(2, "0")} / 07  ·  PUERTA ${st.gate}`, "EN VIVO", GREEN);
  sans(s, "En funcionamiento", 0.5, 0.8, 8, 0.75, { fontSize: 36, bold: true, fontFace: HEAD, valign: "middle" });
  // Marco de navegador
  const bx = 0.5, by = 1.7, bw = 8.4, bh = 4.85, chrome = 0.42;
  s.addShape("roundRect", { x: bx, y: by, w: bw, h: bh, rectRadius: 0.12, fill: { color: PANEL }, line: { color: LINE2, width: 1.25 }, objectName: "Marco del navegador" });
  s.addShape("rect", { x: bx + 0.04, y: by + 0.04, w: bw - 0.08, h: chrome - 0.04, fill: { color: "1B2229" }, line: { color: "1B2229" }, objectName: "Barra del navegador" });
  [["E8664F", 0.22], [AMBER, 0.42], [GREEN, 0.62]].forEach(([c, dx], i) => s.addShape("ellipse", { x: bx + dx, y: by + 0.14, w: 0.14, h: 0.14, fill: { color: c }, line: { color: c }, objectName: `Control ${i + 1}` }));
  s.addShape("roundRect", { x: bx + 1.0, y: by + 0.08, w: bw - 2.0, h: 0.28, rectRadius: 0.14, fill: { color: INK }, line: { color: LINE }, objectName: "Barra de dirección" });
  mono(s, st.urlShort, bx + 1.2, by + 0.08, bw - 2.4, 0.28, { fontSize: 11, color: MUTED });
  const ix = bx + 0.1, iy = by + chrome + 0.06, iw = bw - 0.2, ih = bh - chrome - 0.16;
  const shot = A(`shots/${st.id}.png`);
  if (fs.existsSync(shot)) {
    const meta = await sharp(shot).metadata(); const r = Math.min(iw / meta.width, ih / meta.height);
    const w = meta.width * r, h = meta.height * r;
    s.addImage({ path: shot, x: ix + (iw - w) / 2, y: iy + (ih - h) / 2, w, h, altText: `Captura de ${st.name}` });
  } else {
    s.addShape("rect", { x: ix, y: iy, w: iw, h: ih, fill: { color: INK }, line: { color: LINE }, objectName: "Área de captura" });
    s.addShape("ellipse", { x: ix + iw / 2 - 0.45, y: iy + ih / 2 - 0.65, w: 0.9, h: 0.9, fill: { color: AMBER, transparency: 85 }, line: { color: AMBER, width: 1.5 }, objectName: "Botón play" });
    s.addImage({ data: await icon("FaPlay", AMBER), x: ix + iw / 2 - 0.13, y: iy + ih / 2 - 0.33, w: 0.28, h: 0.28, altText: "Reproducir" });
    mono(s, "INSERTAR CAPTURA O VIDEO DE LA PÁGINA", ix, iy + ih / 2 + 0.4, iw, 0.3, { align: "center", fontSize: 12, color: MUTED, charSpacing: 1 });
  }
  // Recorrido de la demo
  const rx = 9.2, rw = 3.63;
  mono(s, "RECORRIDO DE LA DEMO", rx, 1.7, rw, 0.25, { fontSize: 10, charSpacing: 1, color: AMBER, bold: true });
  st.demo.forEach((t, i) => {
    const y = 2.1 + i * 0.82;
    s.addShape("ellipse", { x: rx, y: y + 0.08, w: 0.42, h: 0.42, fill: { color: AMBER }, line: { color: AMBER }, objectName: `Paso ${i + 1}` });
    mono(s, String(i + 1), rx, y + 0.08, 0.42, 0.42, { align: "center", color: INK, bold: true, fontSize: 14 });
    sans(s, t, rx + 0.6, y, rw - 0.6, 0.65, { fontSize: 14, valign: "middle" });
  });
  s.addShape("roundRect", { x: rx, y: 5.5, w: 2.15, h: 0.55, rectRadius: 0.1, fill: { color: GREEN }, line: { color: GREEN }, objectName: "Botón abrir" });
  s.addText("ABRIR EN VIVO  →", { x: rx, y: 5.5, w: 2.15, h: 0.55, align: "center", valign: "middle", fontFace: MONO, fontSize: 13, bold: true, color: INK, margin: 0, isTextBox: true, hyperlink: { url: st.url, tooltip: st.url } });
  s.addImage({ path: A(`qr_${st.id}.png`), x: rx + 2.35, y: 5.35, w: 1.2, h: 1.2, altText: `Código QR a ${st.urlShort}`, hyperlink: { url: st.url } });
  await tracker(s, st.idx);
  s.addNotes(st.notes.demo);
}

async function slideClose(pres) {
  const s = pres.addSlide({ sectionTitle: "Aterrizaje" });
  s.background = { path: A("bg_close.png") };
  s.addImage({ path: A("logo_blanco.png"), x: 0.8, y: 0.6, w: 0.9, h: 0.77, altText: "Logo Aeropuertos Argentina" });
  mono(s, "●  ATERRIZAJE", 0.8, 1.9, 6, 0.35, { color: MINT, fontSize: 12, bold: true, charSpacing: 1 });
  sans(s, "Mantenimiento más ordenado, medido y planificado", 0.8, 2.3, 10.6, 1.9, { fontSize: 40, bold: true, fontFace: HEAD, lineSpacingMultiple: 0.95 });
  const pts = [["FaClipboardCheck", "ORDENADO", "Todo en un solo lugar, sin cruces ni datos dispersos"],
               ["FaChartLine", "MEDIDO", "Cifras reales de producción y exports de SAP"],
               ["FaCalendarAlt", "PLANIFICADO", "Cronograma a más de un año y cargas niveladas"]];
  const cw = (12.33 - 0.5) / 3;
  for (let i = 0; i < 3; i++) {
    const x = 0.5 + i * (cw + 0.25), y = 4.55;
    s.addShape("roundRect", { x, y, w: cw, h: 1.6, rectRadius: 0.12, fill: { color: INK, transparency: 35 }, line: { color: "FFFFFF", transparency: 75, width: 1 }, objectName: `Mensaje ${pts[i][1]}` });
    s.addImage({ data: await icon(pts[i][0], MINT), x: x + 0.3, y: y + 0.3, w: 0.4, h: 0.4, altText: pts[i][1] });
    mono(s, pts[i][1], x + 0.9, y + 0.3, cw - 1.1, 0.4, { color: MINT, bold: true, fontSize: 16, charSpacing: 1 });
    sans(s, pts[i][2], x + 0.3, y + 0.85, cw - 0.6, 0.65, { fontSize: 14, color: "E4EEF0" });
  }
  mono(s, "7 herramientas de Mantenimiento AEP  ·  un solo recorrido", 0.8, 6.65, 11.7, 0.3, { color: "CFE3E6", fontSize: 12 });
  s.addNotes("Cierre. Volver al mensaje: más ordenado (todo en un lugar), más medido (cifras reales) y más planificado (cronograma a más de un año y cargas niveladas). Dejar los links en pantalla.");
}

// ───────────── Armado ─────────────
(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Herramientas de Mantenimiento AEP";
  pres.author = "Mantenimiento AEP";
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
  ["Embarque", ...STOPS.map((x) => x.name), "Aterrizaje"].forEach((t) => pres.addSection({ title: t }));

  await slideCover(pres);
  await slideItinerary(pres);
  await slideDepart(pres, STOPS[0]);
  await slidePantallazo(pres, STOPS[0]);
  await slideGrillaMejoras(pres, STOPS[0]);
  await slideDemo(pres, STOPS[0]);
  await slideDepart(pres, STOPS[1]);
  await slidePantallazo(pres, STOPS[1]);
  await slideTermoMejoras(pres, STOPS[1]);
  await slideDemo(pres, STOPS[1]);
  for (const st of STOPS.slice(2)) {
    await slideDepart(pres, st);
    await slidePantallazo(pres, st);
    await slideAporta(pres, st);
    await slideDemo(pres, st);
  }
  await slideClose(pres);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK →", OUT);
})();
