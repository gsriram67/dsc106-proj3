// ============================================================
// DATA
// ============================================================

const PERIODS = [
  { id: "2012-13", label: "2012–13", subtitle: "Drought Onset"   },
  { id: "2014-16", label: "2014–16", subtitle: "Peak Drought"    },
  { id: "2017-19", label: "2017–19", subtitle: "Wet Recovery"    },
  { id: "2020-22", label: "2020–22", subtitle: "Renewed Drought" },
];

// FIPS: 5-digit Census county code (state "06" = California + 3-digit county)
// region: used only for scatter dot color
const COUNTIES = [
  { fips: "06001", name: "Alameda",         region: "Bay Area" },
  { fips: "06003", name: "Alpine",          region: "Sierra" },
  { fips: "06005", name: "Amador",          region: "Sierra Foothills" },
  { fips: "06007", name: "Butte",           region: "Sacramento Valley" },
  { fips: "06009", name: "Calaveras",       region: "Sierra Foothills" },
  { fips: "06011", name: "Colusa",          region: "Sacramento Valley" },
  { fips: "06013", name: "Contra Costa",    region: "Bay Area" },
  { fips: "06015", name: "Del Norte",       region: "North Coast" },
  { fips: "06017", name: "El Dorado",       region: "Sierra" },
  { fips: "06019", name: "Fresno",          region: "San Joaquin Valley" },
  { fips: "06021", name: "Glenn",           region: "Sacramento Valley" },
  { fips: "06023", name: "Humboldt",        region: "North Coast" },
  { fips: "06025", name: "Imperial",        region: "Desert" },
  { fips: "06027", name: "Inyo",            region: "Desert" },
  { fips: "06029", name: "Kern",            region: "San Joaquin Valley" },
  { fips: "06031", name: "Kings",           region: "San Joaquin Valley" },
  { fips: "06033", name: "Lake",            region: "North Coast Ranges" },
  { fips: "06035", name: "Lassen",          region: "Northeast" },
  { fips: "06037", name: "Los Angeles",     region: "South Coast" },
  { fips: "06039", name: "Madera",          region: "San Joaquin Valley" },
  { fips: "06041", name: "Marin",           region: "Bay Area" },
  { fips: "06043", name: "Mariposa",        region: "Sierra Foothills" },
  { fips: "06045", name: "Mendocino",       region: "North Coast" },
  { fips: "06047", name: "Merced",          region: "San Joaquin Valley" },
  { fips: "06049", name: "Modoc",           region: "Northeast" },
  { fips: "06051", name: "Mono",            region: "Sierra" },
  { fips: "06053", name: "Monterey",        region: "Central Coast" },
  { fips: "06055", name: "Napa",            region: "Bay Area" },
  { fips: "06057", name: "Nevada",          region: "Sierra" },
  { fips: "06059", name: "Orange",          region: "South Coast" },
  { fips: "06061", name: "Placer",          region: "Sierra" },
  { fips: "06063", name: "Plumas",          region: "Sierra" },
  { fips: "06065", name: "Riverside",       region: "Inland South" },
  { fips: "06067", name: "Sacramento",      region: "Sacramento Valley" },
  { fips: "06069", name: "San Benito",      region: "Central Coast" },
  { fips: "06071", name: "San Bernardino",  region: "Inland South" },
  { fips: "06073", name: "San Diego",       region: "South Coast" },
  { fips: "06075", name: "San Francisco",   region: "Bay Area" },
  { fips: "06077", name: "San Joaquin",     region: "San Joaquin Valley" },
  { fips: "06079", name: "San Luis Obispo", region: "Central Coast" },
  { fips: "06081", name: "San Mateo",       region: "Bay Area" },
  { fips: "06083", name: "Santa Barbara",   region: "South Coast" },
  { fips: "06085", name: "Santa Clara",     region: "Bay Area" },
  { fips: "06087", name: "Santa Cruz",      region: "Bay Area" },
  { fips: "06089", name: "Shasta",          region: "North Valley" },
  { fips: "06091", name: "Sierra",          region: "Sierra" },
  { fips: "06093", name: "Siskiyou",        region: "North" },
  { fips: "06095", name: "Solano",          region: "Bay Area" },
  { fips: "06097", name: "Sonoma",          region: "Bay Area" },
  { fips: "06099", name: "Stanislaus",      region: "San Joaquin Valley" },
  { fips: "06101", name: "Sutter",          region: "Sacramento Valley" },
  { fips: "06103", name: "Tehama",          region: "Sacramento Valley" },
  { fips: "06105", name: "Trinity",         region: "North Coast Ranges" },
  { fips: "06107", name: "Tulare",          region: "San Joaquin Valley" },
  { fips: "06109", name: "Tuolumne",        region: "Sierra Foothills" },
  { fips: "06111", name: "Ventura",         region: "South Coast" },
  { fips: "06113", name: "Yolo",            region: "Sacramento Valley" },
  { fips: "06115", name: "Yuba",            region: "Sacramento Valley" },
];

const REGION_COLORS = {
  "San Joaquin Valley": "#f04040",
  "Sacramento Valley":  "#f97316",
  "Desert":             "#c084fc",
  "South Coast":        "#fb923c",
  "Inland South":       "#fbbf24",
  "Bay Area":           "#34d399",
  "North Coast":        "#22d3ee",
  "Central Coast":      "#60a5fa",
  "Sierra":             "#818cf8",
  "Sierra Foothills":   "#a5b4fc",
  "Northeast":          "#94a3b8",
  "North Coast Ranges": "#4ade80",
  "North Valley":       "#fde68a",
  "North":              "#d0d8f0",
};

// countyLookup is populated from anomalies.json at load time
const countyLookup = {};
COUNTIES.forEach(c => { countyLookup[c.fips] = { ...c, data: {} }; });

// ============================================================
// STATE
// ============================================================

let currentPeriodId = "2014-16";
let currentMapVar   = "ndvi";    // "ndvi" | "lst"
let hoveredFips     = null;
let brushedFips     = new Set(); // empty → no active brush

// ============================================================
// PANEL DIMENSIONS
// ============================================================

const mapPanel     = document.getElementById("map-panel");
const scatterPanel = document.getElementById("scatter-panel");

const mapW  = mapPanel.clientWidth;
const mapH  = mapPanel.clientHeight;
const scW   = scatterPanel.clientWidth;
const scH   = scatterPanel.clientHeight;

// ============================================================
// PERIOD BUTTONS
// ============================================================

const periodBtnsEl = document.getElementById("period-btns");
PERIODS.forEach(p => {
  const btn = document.createElement("button");
  btn.className = "period-btn" + (p.id === currentPeriodId ? " active" : "");
  btn.innerHTML = `<strong>${p.label}</strong>&nbsp;<span style="opacity:0.7;font-size:11px">${p.subtitle}</span>`;
  btn.addEventListener("click", () => {
    currentPeriodId = p.id;
    periodBtnsEl.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    brushedFips.clear();
    brushG.call(brush.move, null);
    updateAll();
  });
  periodBtnsEl.appendChild(btn);
});

// ============================================================
// MAP-VARIABLE BUTTONS
// ============================================================

const varBtnsEl = document.getElementById("var-btns");
[
  { id: "ndvi", label: "NDVI Anomaly" },
  { id: "lst",  label: "LST Anomaly (°C)" },
].forEach(v => {
  const btn = document.createElement("button");
  btn.className = "var-btn" + (v.id === currentMapVar ? " active" : "");
  btn.textContent = v.label;
  btn.addEventListener("click", () => {
    currentMapVar = v.id;
    varBtnsEl.querySelectorAll(".var-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    updateMapColors();
    updateInfoLegend();
  });
  varBtnsEl.appendChild(btn);
});

// ============================================================
// COLOR SCALES  (binned — ColorBrewer palettes, colorblind-safe)
// ============================================================

// NDVI: BrBG-5 (brown = drought stress, teal = healthy vegetation)
// Avoids red-green — safe for deuteranopia/protanopia
const NDVI_BREAKS = [-0.06, -0.02, 0.005, 0.015];
const NDVI_COLORS = ['#8c510a', '#d8b365', '#f5f5f5', '#80cdc1', '#018571'];
const NDVI_LABELS = ['< −0.060', '−0.060 – −0.020', '−0.020 – +0.005', '+0.005 – +0.015', '> +0.015'];

// LST: RdYlBu-5 reversed (blue = below baseline, red = extreme heat anomaly)
const LST_BREAKS = [0, 1, 2, 3];
const LST_COLORS = ['#2c7bb6', '#abd9e9', '#ffffbf', '#fdae61', '#d73027'];
const LST_LABELS = ['< 0°C', '0 – 1°C', '1 – 2°C', '2 – 3°C', '> 3°C'];

const ndviScale = d3.scaleThreshold().domain(NDVI_BREAKS).range(NDVI_COLORS);
const lstScale  = d3.scaleThreshold().domain(LST_BREAKS).range(LST_COLORS);

function countyFill(fips) {
  const d = countyLookup[fips]?.data[currentPeriodId];
  if (!d) return "#1e2030";
  return currentMapVar === "ndvi" ? ndviScale(d.ndvi) : lstScale(d.lst);
}

// ============================================================
// MAP LEGEND  (SVG, bottom-left of map panel)
// legendG is declared after mapSvg below — function defined here, called later

function updateInfoLegend() {
  const colors = currentMapVar === "ndvi" ? NDVI_COLORS : LST_COLORS;
  const labels = currentMapVar === "ndvi" ? NDVI_LABELS : LST_LABELS;
  const title  = currentMapVar === "ndvi" ? "NDVI Anomaly" : "LST Anomaly (°C)";

  const sw = 13, sh = 13, gap = 3, rowH = sh + gap;
  const padX = 12, padY = 10;
  const boxH = padY * 2 + 14 + colors.length * rowH - gap;
  const boxW = 148;
  const x0 = 12, y0 = mapH - boxH - 12;

  legendG.selectAll("*").remove();

  // Background
  legendG.append("rect")
    .attr("x", x0).attr("y", y0)
    .attr("width", boxW).attr("height", boxH)
    .attr("rx", 5)
    .attr("fill", "rgba(10,12,22,0.82)")
    .attr("stroke", "#232640").attr("stroke-width", 1);

  // Title
  legendG.append("text")
    .attr("x", x0 + padX).attr("y", y0 + padY + 9)
    .attr("fill", "#9090b0").attr("font-size", 10)
    .attr("font-weight", "600").attr("letter-spacing", "0.05em")
    .text(title.toUpperCase());

  // Swatches + labels
  colors.forEach((c, i) => {
    const ry = y0 + padY + 18 + i * rowH;
    legendG.append("rect")
      .attr("x", x0 + padX).attr("y", ry)
      .attr("width", sw).attr("height", sh).attr("rx", 2)
      .attr("fill", c)
      .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 0.5);
    legendG.append("text")
      .attr("x", x0 + padX + sw + 6).attr("y", ry + sh - 2)
      .attr("fill", "#8090b0").attr("font-size", 10)
      .text(labels[i]);
  });
}

// ============================================================
// MAP SVG
// ============================================================

const mapSvg = d3.select("#map-panel").append("svg")
  .attr("width", mapW)
  .attr("height", mapH);

const mapG    = mapSvg.append("g").attr("class", "map-g");
const legendG = mapSvg.append("g").attr("class", "map-legend");
const pathGen = d3.geoPath();

// Period label — centred at top of map
const periodLabelG = mapSvg.append("g").attr("transform", `translate(${mapW / 2}, 24)`);
const periodLabel = periodLabelG.append("text")
  .attr("text-anchor", "middle")
  .attr("fill", "#d0d4f8")
  .attr("font-size", 15)
  .attr("font-weight", "700");
const periodSub = periodLabelG.append("text")
  .attr("text-anchor", "middle")
  .attr("fill", "#666880")
  .attr("font-size", 12)
  .attr("y", 17);

// ============================================================
// SCATTER SVG
// ============================================================

const scMarg = { top: 38, right: 22, bottom: 58, left: 68 };
const scInW  = scW - scMarg.left - scMarg.right;
const scInH  = scH - scMarg.top  - scMarg.bottom;

const scSvg = d3.select("#scatter-panel").append("svg")
  .attr("width",  scW)
  .attr("height", scH);

const scG = scSvg.append("g")
  .attr("transform", `translate(${scMarg.left},${scMarg.top})`);

// Fixed axes — so cloud position is visually comparable across periods
const xSc = d3.scaleLinear().domain([-0.8, 5.8]).range([0, scInW]);
const ySc = d3.scaleLinear().domain([-0.46, 0.18]).range([scInH, 0]);

// Grid
scG.append("g").attr("class", "grid")
  .call(d3.axisLeft(ySc).tickSize(-scInW).tickFormat(""))
  .call(g => g.select(".domain").remove());
scG.append("g").attr("class", "grid")
  .attr("transform", `translate(0,${scInH})`)
  .call(d3.axisBottom(xSc).tickSize(-scInH).tickFormat(""))
  .call(g => g.select(".domain").remove());

// Axes
scG.append("g").attr("class", "axis")
  .attr("transform", `translate(0,${scInH})`)
  .call(d3.axisBottom(xSc).ticks(6).tickFormat(d => `${d >= 0 ? "+" : ""}${d}°C`));
scG.append("g").attr("class", "axis")
  .call(d3.axisLeft(ySc).ticks(6).tickFormat(d => `${d >= 0 ? "+" : ""}${d.toFixed(2)}`));

// Zero-reference lines
scG.append("line")
  .attr("x1", xSc(0)).attr("x2", xSc(0)).attr("y1", 0).attr("y2", scInH)
  .attr("stroke", "#3a3d58").attr("stroke-dasharray", "4,3");
scG.append("line")
  .attr("x1", 0).attr("x2", scInW).attr("y1", ySc(0)).attr("y2", ySc(0))
  .attr("stroke", "#3a3d58").attr("stroke-dasharray", "4,3");

// Axis labels
scG.append("text")
  .attr("x", scInW / 2).attr("y", scInH + 48)
  .attr("text-anchor", "middle").attr("fill", "#d8defc").attr("font-size", 11.5)
  .attr("font-weight", "600")
  .text("LST anomaly (°C)");
scG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -scInH / 2).attr("y", -56)
  .attr("text-anchor", "middle").attr("fill", "#d8defc").attr("font-size", 11.5)
  .attr("font-weight", "600")
  .text("NDVI anomaly");

// Chart title (inside SVG, above plot area)
const scTitle = scG.append("text")
  .attr("x", scInW / 2).attr("y", -16)
  .attr("text-anchor", "middle").attr("fill", "#9090b0").attr("font-size", 12);

// Regression line (behind dots)
const regrG = scG.append("g");
const dotsG = scG.append("g");

// Brush — lives on top layer
const brushG = scG.append("g").attr("class", "brush");

// ============================================================
// BRUSH
// ============================================================

const brush = d3.brush()
  .extent([[0, 0], [scInW, scInH]])
  .on("start brush end", onBrush);

brushG.call(brush);

function onBrush(event) {
  if (!event.selection) {
    brushedFips.clear();
    applyHighlight();
    return;
  }
  const [[x0, y0], [x1, y1]] = event.selection;
  const lstMin  = xSc.invert(x0), lstMax  = xSc.invert(x1);
  const ndviMin = ySc.invert(y1), ndviMax = ySc.invert(y0); // y inverted

  brushedFips.clear();
  COUNTIES.forEach(c => {
    const d = countyLookup[c.fips].data[currentPeriodId];
    if (d.lst >= lstMin && d.lst <= lstMax && d.ndvi >= ndviMin && d.ndvi <= ndviMax) {
      brushedFips.add(c.fips);
    }
  });
  applyHighlight();
}

// ============================================================
// TOOLTIP
// ============================================================

const tooltip = d3.select("#tooltip");

function showTip(html, cx, cy) {
  // Keep tooltip inside viewport
  const tw = 210, margin = 14;
  let left = cx + margin;
  let top  = cy - 10;
  if (left + tw > window.innerWidth)  left = cx - tw - margin;
  if (top  < 0) top = 0;
  tooltip.html(html).style("opacity", 1).style("left", left + "px").style("top", top + "px");
}

function hideTip() { tooltip.style("opacity", 0); }

function countyTipHtml(fips) {
  const c = countyLookup[fips];
  if (!c) return "";
  const d = c.data[currentPeriodId];
  return `<strong>${c.name} County</strong>
    <span class="reg">${c.region}</span>
    LST Anomaly: <span class="val">${d.lst >= 0 ? "+" : ""}${d.lst.toFixed(2)}°C</span><br>
    NDVI Anomaly: <span class="val">${d.ndvi >= 0 ? "+" : ""}${d.ndvi.toFixed(3)}</span>`;
}

// ============================================================
// HIGHLIGHT HELPERS
// ============================================================

function applyHighlight() {
  const hasBrush = brushedFips.size > 0;

  mapG.selectAll(".county-path")
    .attr("opacity",      d => !hasBrush ? 1 : brushedFips.has(d.id) ? 1 : 0.18)
    .attr("stroke",       d => (d.id === hoveredFips || brushedFips.has(d.id)) ? "#ffffff" : "#1a1d30")
    .attr("stroke-width", d => d.id === hoveredFips ? 2.2 : brushedFips.has(d.id) ? 1.4 : 0.4);

  dotsG.selectAll(".scatter-dot")
    .attr("opacity",      d => !hasBrush ? 0.82 : brushedFips.has(d.fips) ? 1 : 0.12)
    .attr("stroke",       d => (d.fips === hoveredFips || brushedFips.has(d.fips)) ? "#fff" : "none")
    .attr("stroke-width", d => d.fips === hoveredFips ? 2.5 : 1.5)
    .attr("r",            d => d.fips === hoveredFips ? 7.5 : 5.5);
}

// ============================================================
// MAP DRAW / UPDATE
// ============================================================

function updateMapColors() {
  mapG.selectAll(".county-path")
    .transition().duration(550).ease(d3.easeCubicOut)
    .attr("fill", d => countyFill(d.id));
  // Re-apply opacity/stroke state after transition
  setTimeout(applyHighlight, 600);
}

function updatePeriodLabel() {
  const p = PERIODS.find(q => q.id === currentPeriodId);
  periodLabel.text(p.label);
  periodSub.text(p.subtitle);
}

// ============================================================
// SCATTER DRAW / UPDATE
// ============================================================

function updateScatter() {
  const pid = currentPeriodId;

  // Update title
  const p = PERIODS.find(q => q.id === pid);
  scTitle.text(`${p.label}: ${p.subtitle} — Vegetation Response vs. LST`);

  // Dots
  dotsG.selectAll(".scatter-dot")
    .data(COUNTIES, d => d.fips)
    .join(
      enter => enter.append("circle")
        .attr("class", "scatter-dot")
        .attr("r", 5.5)
        .attr("cx", d => xSc(countyLookup[d.fips].data[pid].lst))
        .attr("cy", d => ySc(countyLookup[d.fips].data[pid].ndvi))
        .attr("fill", d => REGION_COLORS[d.region] || "#888")
        .attr("opacity", 0.82)
        .attr("stroke", "none")
        .on("mouseenter", (event, d) => {
          hoveredFips = d.fips;
          showTip(countyTipHtml(d.fips), event.clientX, event.clientY);
          applyHighlight();
        })
        .on("mousemove", event => {
          showTip(countyTipHtml(hoveredFips), event.clientX, event.clientY);
        })
        .on("mouseleave", () => {
          hoveredFips = null;
          hideTip();
          applyHighlight();
        }),
      update => update
        .transition().duration(550).ease(d3.easeCubicOut)
        .attr("cx", d => xSc(countyLookup[d.fips].data[pid].lst))
        .attr("cy", d => ySc(countyLookup[d.fips].data[pid].ndvi))
    );

  updateRegressionLine();
  applyHighlight();
}

function updateRegressionLine() {
  const pid = currentPeriodId;
  const pts = COUNTIES.map(c => ({
    x: countyLookup[c.fips].data[pid].lst,
    y: countyLookup[c.fips].data[pid].ndvi,
  }));
  const mx = d3.mean(pts, d => d.x);
  const my = d3.mean(pts, d => d.y);
  const Sxy = d3.sum(pts, d => (d.x - mx) * (d.y - my));
  const Sxx = d3.sum(pts, d => (d.x - mx) ** 2);
  const Syy = d3.sum(pts, d => (d.y - my) ** 2);
  const b   = Sxy / Sxx;
  const a   = my - b * mx;
  const r   = Sxy / Math.sqrt(Sxx * Syy);

  const [xL, xR] = xSc.domain();
  regrG.selectAll(".reg-line").data([null])
    .join("line").attr("class", "reg-line")
    .transition().duration(550)
    .attr("x1", xSc(xL)).attr("y1", ySc(b * xL + a))
    .attr("x2", xSc(xR)).attr("y2", ySc(b * xR + a))
    .attr("stroke", "#ffd166")
    .attr("stroke-width", 2.2);

  // r label near the line (at 75% of x range)
  const xLabel = xSc.domain()[0] + (xSc.domain()[1] - xSc.domain()[0]) * 0.75;
  const yLabel = b * xLabel + a;
  regrG.selectAll(".r-label").data([null])
    .join("text").attr("class", "r-label")
    .transition().duration(550)
    .attr("x", xSc(xLabel))
    .attr("y", ySc(yLabel) - 9)
    .attr("fill", "#ffd166")
    .attr("font-size", 11)
    .text(`r = ${r.toFixed(2)}`);
}

// ============================================================
// (legend lives in the HTML info panel — see updateInfoLegend above)

// ============================================================
// SCATTER REGION LEGEND
// ============================================================

function buildRegionLegend() {
  const regions = [...new Set(COUNTIES.map(c => c.region))].sort();
  const lx = scMarg.left + scInW + 4;
  const ly = scMarg.top;
  // If there's not enough right-margin room, skip (we only have 22px)
  // Instead embed it below the scatter
  const lG = scSvg.append("g").attr("class", "region-legend")
    .attr("transform", `translate(${scMarg.left}, ${scMarg.top + scInH + 34})`);

  // Two-column layout for region legend
  const cols = 2;
  const perCol = Math.ceil(regions.length / cols);
  const itemH = 13, colW = scInW / cols;

  lG.append("text").attr("x", 0).attr("y", -4)
    .attr("fill", "#555570").attr("font-size", 10)
    .text("Region (scatter dot color):");

  // This might go off-screen if scH is small — only render if it fits
  if (scMarg.top + scInH + 34 + perCol * itemH < scH) {
    regions.forEach((r, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      const g = lG.append("g").attr("transform", `translate(${col * colW}, ${row * itemH})`);
      g.append("circle").attr("cx", 5).attr("cy", 0).attr("r", 3.5)
        .attr("fill", REGION_COLORS[r] || "#888");
      g.append("text").attr("x", 13).attr("y", 4)
        .attr("fill", "#666880").attr("font-size", 9.5).text(r);
    });
  }
}

// ============================================================
// MAIN UPDATE
// ============================================================

function updateAll() {
  updatePeriodLabel();
  updateMapColors();
  updateScatter();
}

// ============================================================
// LOAD DATA + TOPOJSON
// ============================================================

// Try loading real MODIS anomalies (produced by process_anomalies.py).
// Falls back to the synthetic data already in countyLookup if file is absent.
const anomaliesLoad = d3.json("anomalies.json").catch(() => null);
const topoLoad      = d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json");

Promise.all([topoLoad, anomaliesLoad]).then(([us, anomalies]) => {
  // If real data exists, overwrite the synthetic countyLookup values
  if (anomalies) {
    let swapped = 0;
    COUNTIES.forEach(c => {
      if (anomalies[c.fips]) {
        countyLookup[c.fips].data = anomalies[c.fips];
        swapped++;
      }
    });
    console.log(`Loaded real MODIS data for ${swapped} counties.`);

    // Calibrate scatter axes to actual data range (with 10% padding)
    const allNdvi = COUNTIES.flatMap(c =>
      PERIODS.map(p => countyLookup[c.fips].data[p.id]?.ndvi).filter(v => v != null)
    );
    const allLst = COUNTIES.flatMap(c =>
      PERIODS.map(p => countyLookup[c.fips].data[p.id]?.lst).filter(v => v != null)
    );
    const ndviMin = d3.min(allNdvi), ndviMax = d3.max(allNdvi);
    const lstMin  = d3.min(allLst),  lstMax  = d3.max(allLst);
    xSc.domain([lstMin  - (lstMax  - lstMin)  * 0.1, lstMax  + (lstMax  - lstMin)  * 0.1]);
    ySc.domain([ndviMin - (ndviMax - ndviMin) * 0.1, ndviMax + (ndviMax - ndviMin) * 0.1]);
  } else {
    console.error("anomalies.json not found — no data to display.");
  }

  const all = topojson.feature(us, us.objects.counties);

  // Filter to California (FIPS state prefix "06")
  const caFeatures = all.features
    .filter(f => String(f.id).padStart(5, "0").startsWith("06"))
    .map(f => ({ ...f, id: String(f.id).padStart(5, "0") }));

  const caFC = { type: "FeatureCollection", features: caFeatures };

  // Fit projection to California bounds
  const projection = d3.geoMercator()
    .fitExtent([[24, 44], [mapW - 24, mapH - 24]], caFC);
  pathGen.projection(projection);

  mapG.selectAll(".county-path")
    .data(caFeatures, d => d.id)
    .join("path")
    .attr("class", "county-path")
    .attr("d", pathGen)
    .attr("fill", d => countyFill(d.id))
    .on("mouseenter", (event, d) => {
      hoveredFips = d.id;
      showTip(countyTipHtml(d.id), event.clientX, event.clientY);
      applyHighlight();
    })
    .on("mousemove", event => {
      showTip(countyTipHtml(hoveredFips), event.clientX, event.clientY);
    })
    .on("mouseleave", () => {
      hoveredFips = null;
      hideTip();
      applyHighlight();
    });

  updatePeriodLabel();
  updateInfoLegend();
  updateScatter();
  buildRegionLegend();
});
