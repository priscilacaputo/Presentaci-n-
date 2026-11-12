/**
 * Genera la versión web de la presentación (presentacion/index.html, un solo archivo + assets/).
 * Usa los mismos datos que el .pptx (data.js). Uso: node build_web.js
 */
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const fa = require("react-icons/fa");
const data = require("./data.js");

// Íconos usados: los de los datos + los fijos de la plantilla
const names = new Set(["FaPlane", "FaArrowRight", "FaExternalLinkAlt", "FaClipboardCheck", "FaChartLine", "FaCalendarAlt"]);
for (const st of data.STOPS) {
  (st.tiles || []).forEach((t) => names.add(t.icon));
  (st.adv || []).forEach((a) => names.add(a[0]));
}
const icons = {};
for (const n of names) {
  if (!fa[n]) throw new Error("Ícono inexistente: " + n);
  icons[n] = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[n]));
}

// JSON seguro para incrustar dentro de <script>
const safe = (o) => JSON.stringify(o).replace(/</g, "\\u003c").split("\u2028").join("").split("\u2029").join("");
const src = fs.readFileSync(path.join(__dirname, "web_src.html"), "utf8");
const out = src.replace("/*DATA*/", () => safe(data)).replace("/*ICONS*/", () => safe(icons));
fs.writeFileSync(path.join(__dirname, "index.html"), out);
console.log("OK → presentacion/index.html", (out.length / 1024).toFixed(0) + " KB");
