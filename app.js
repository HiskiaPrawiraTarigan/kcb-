const SPECIAL_NODES = ["USU", "Jl. Dr. Mansyur", "Simpang Pos", "Jl. Jamin Ginting", "Padang Bulan / Pajus", "Simalingkar"];

// =========================================================
// DATA REPRESENTATION & GRAPH DEFINITION
// =========================================================
const GRAPH_DATA = {
  // Nodes & their GPS Coordinates for Leaflet map (Latitude, Longitude)
  coordinates: {
    "Medan": [3.5952, 98.6722],
    "Padang Bulan": [3.5600, 98.6439],
    "Simpang Selayang": [3.5269, 98.6186],
    "Tuntungan": [3.5042, 98.6014],
    "Pancur Batu": [3.4984, 98.5714],
    "Sembahe": [3.3857, 98.5583],
    "Sibolangit": [3.3082, 98.5765],
    "Bandar Baru": [3.2750, 98.5528],
    "Doulu": [3.2185, 98.5401],
    "Tongkoh": [3.1973, 98.5366],
    "Berastagi": [3.1853, 98.5047],
    "Kutalimbaru": [3.4475, 98.5085],
    "Delitua": [3.4795, 98.6835],
    "Namorambe": [3.4542, 98.6508],
    "Patumbak": [3.5085, 98.7188],
    "Sibiru-biru": [3.4079, 98.7118],
    "Talun Kenas": [3.3644, 98.7410],
    "USU": [3.5616, 98.6562],
    "Jl. Dr. Mansyur": [3.5578, 98.6505],
    "Padang Bulan / Pajus": [3.5440, 98.6368],
    "Simpang Pos": [3.5405, 98.6325],
    "Jl. Jamin Ginting": [3.5355, 98.6270],
    "Simalingkar": [3.5025, 98.6235],
  },

  // Heuristic distance values (straight-line estimate to Berastagi) for Greedy Best-First Search
  heuristics: {
    "Medan": 57.0,
    "Padang Bulan": 51.0,
    "Simpang Selayang": 48.0,
    "Tuntungan": 43.0,
    "Pancur Batu": 35.0,
    "Sembahe": 27.0,
    "Sibolangit": 20.0,
    "Bandar Baru": 13.0,
    "Doulu": 9.0,
    "Tongkoh": 6.0,
    "Berastagi": 0.0,
    "Kutalimbaru": 45.0,
    "Delitua": 60.0,
    "Namorambe": 52.0,
    "Patumbak": 65.0,
    "Sibiru-biru": 70.0,
    "Talun Kenas": 60.0,
    "USU": 13.0,
    "Jl. Dr. Mansyur": 12.0,
    "Padang Bulan / Pajus": 11.2,
    "Simpang Pos": 10.5,
    "Jl. Jamin Ginting": 9.5,
    "Simalingkar": 0.0,
  },

  // Manual layout coordinates for Abstract Graph SVG layout (x, y)
  // Adjusted to look visually pleasing, clear, and easy to read
  layoutPositions: {
    "Medan": [0.00, 0.00],
    "Padang Bulan": [1.15, 0.80],
    "Simpang Selayang": [2.25, 0.80],
    "Tuntungan": [3.35, 0.10],
    "Pancur Batu": [4.55, 0.55],
    "Sembahe": [5.75, 0.92],
    "Sibolangit": [6.95, 1.22],
    "Bandar Baru": [8.15, 1.18],
    "Doulu": [9.05, 1.45],
    "Tongkoh": [9.95, 1.64],
    "Berastagi": [10.95, 1.82],
    "Kutalimbaru": [5.05, -0.96],
    "Delitua": [1.75, -1.24],
    "Namorambe": [3.45, -1.62],
    "Patumbak": [1.10, -2.05],
    "Sibiru-biru": [2.25, -3.02],
    "Talun Kenas": [5.75, -2.62],
    "USU": [-1.0, 2.8],
    "Jl. Dr. Mansyur": [0.2, 2.8],
    "Padang Bulan / Pajus": [1.4, 2.7],
    "Simpang Pos": [2.6, 2.6],
    "Jl. Jamin Ginting": [3.8, 2.5],
    "Simalingkar": [6.4, 2.25],
  },

  // Edges data: node A <-> node B with distance (km) and category
  edges: [
    // Jalur Utama (Medan - Berastagi)
    { from: "Medan", to: "Padang Bulan", distance: 7.00, route: "Jalur Utama" },
    { from: "Padang Bulan", to: "Simpang Selayang", distance: 3.50, route: "Jalur Utama" },
    { from: "Simpang Selayang", to: "Tuntungan", distance: 4.00, route: "Jalur Utama" },
    { from: "Tuntungan", to: "Pancur Batu", distance: 8.00, route: "Jalur Utama" },
    { from: "Pancur Batu", to: "Sembahe", distance: 9.00, route: "Jalur Utama" },
    { from: "Sembahe", to: "Sibolangit", distance: 7.00, route: "Jalur Utama" },
    { from: "Sibolangit", to: "Bandar Baru", distance: 5.50, route: "Jalur Utama" },
    { from: "Bandar Baru", to: "Doulu", distance: 4.00, route: "Jalur Utama" },
    { from: "Doulu", to: "Tongkoh", distance: 3.00, route: "Jalur Utama" },
    { from: "Tongkoh", to: "Berastagi", distance: 6.07, route: "Jalur Utama" },

    // Alternatif Kutalimbaru
    { from: "Tuntungan", to: "Kutalimbaru", distance: 13.00, route: "Alternatif Kutalimbaru" },
    { from: "Kutalimbaru", to: "Bandar Baru", distance: 18.80, route: "Alternatif Kutalimbaru" },

    // Alternatif Delitua-Namorambe
    { from: "Medan", to: "Delitua", distance: 12.00, route: "Alternatif Delitua-Namorambe" },
    { from: "Delitua", to: "Namorambe", distance: 6.30, route: "Alternatif Delitua-Namorambe" },
    { from: "Namorambe", to: "Kutalimbaru", distance: 21.00, route: "Alternatif Delitua-Namorambe" },

    // Alternatif Patumbak
    { from: "Medan", to: "Patumbak", distance: 11.00, route: "Alternatif Patumbak" },
    { from: "Patumbak", to: "Delitua", distance: 7.20, route: "Alternatif Patumbak-Delitua" },

    // Alternatif Namorambe-Sembahe
    { from: "Namorambe", to: "Sembahe", distance: 17.00, route: "Alternatif Namorambe-Sembahe" },

    // Alternatif Sibiru-biru
    { from: "Medan", to: "Sibiru-biru", distance: 25.00, route: "Alternatif Sibiru-biru" },
    { from: "Sibiru-biru", to: "Talun Kenas", distance: 22.00, route: "Alternatif Sibiru-biru" },
    { from: "Talun Kenas", to: "Bandar Baru", distance: 19.00, route: "Alternatif Sibiru-biru" },

    // Jalur Spesial Anak USU
    { from: "USU", to: "Jl. Dr. Mansyur", distance: 1.20, route: "Jalur Spesial" },
    { from: "Jl. Dr. Mansyur", to: "Padang Bulan / Pajus", distance: 1.50, route: "Jalur Spesial" },
    { from: "Padang Bulan / Pajus", to: "Simpang Pos", distance: 0.80, route: "Jalur Spesial" },
    { from: "Simpang Pos", to: "Jl. Jamin Ginting", distance: 1.20, route: "Jalur Spesial" },
    { from: "Jl. Jamin Ginting", to: "Simpang Selayang", distance: 2.30, route: "Jalur Spesial" },
    { from: "Simpang Selayang", to: "Simalingkar", distance: 5.00, route: "Jalur Spesial" },
  ]
};

// Custom edge geometries (latitude/longitude coordinates along real streets) for Leaflet Map view
const EDGE_GEOMETRIES = {
  "USU-Jl. Dr. Mansyur": [
    [3.5616, 98.6562], // USU Bureau
    [3.5630, 98.6558], // inside campus
    [3.5635, 98.6534], // campus road near library
    [3.5633, 98.6521], // Dr. Mansyur exit gate
    [3.5606, 98.6511], // Jl. Dr. Mansyur
    [3.5578, 98.6505]  // Jl. Dr. Mansyur / Simpang Kampus
  ],
  "Jl. Dr. Mansyur-Padang Bulan / Pajus": [
    [3.5578, 98.6505], // Simpang Kampus
    [3.5540, 98.6470], // Jl. Jamin Ginting, near USU gate 2
    [3.5480, 98.6410], // Jl. Jamin Ginting, near Pasar 1
    [3.5440, 98.6368]  // Padang Bulan / Pajus (Pajus Baru)
  ],
  "Padang Bulan / Pajus-Simpang Pos": [
    [3.5440, 98.6368], // Padang Bulan / Pajus
    [3.5405, 98.6325]  // Simpang Pos
  ],
  "Simpang Pos-Jl. Jamin Ginting": [
    [3.5405, 98.6325], // Simpang Pos
    [3.5380, 98.6300],
    [3.5355, 98.6270]  // Jl. Jamin Ginting
  ],
  "Jl. Jamin Ginting-Simpang Selayang": [
    [3.5355, 98.6270], // Jl. Jamin Ginting
    [3.5320, 98.6230],
    [3.5269, 98.6186]  // Simpang Selayang
  ],
  "Simpang Selayang-Simalingkar": [
    [3.5269, 98.6186],
    [3.5200, 98.6140],
    [3.5130, 98.6080],
    [3.5080, 98.6150],
    [3.5025, 98.6235]  // Simalingkar
  ],
  "Padang Bulan-Simpang Selayang": [
    [3.5600, 98.6439], // Padang Bulan
    [3.5540, 98.6395],
    [3.5480, 98.6350],
    [3.5405, 98.6325],
    [3.5355, 98.6270],
    [3.5280, 98.6188],
    [3.5269, 98.6186]  // Simpang Selayang
  ],
  "Patumbak-Delitua": [
    [3.5085, 98.7188], // Patumbak
    [3.5040, 98.7050],
    [3.4960, 98.6940],
    [3.4880, 98.6880],
    [3.4795, 98.6835]  // Delitua
  ],
  "Delitua-Namorambe": [
    [3.4795, 98.6835], // Delitua
    [3.4720, 98.6740],
    [3.4630, 98.6630],
    [3.4542, 98.6508]  // Namorambe
  ],
  "Namorambe-Sembahe": [
    [3.4542, 98.6508], // Namorambe
    [3.4430, 98.6360],
    [3.4320, 98.6180],
    [3.4210, 98.5980],
    [3.4060, 98.5740],
    [3.3857, 98.5583]  // Sembahe
  ]
};

function getEdgeGeometry(from, to) {
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  if (EDGE_GEOMETRIES[key1]) {
    return EDGE_GEOMETRIES[key1];
  }
  if (EDGE_GEOMETRIES[key2]) {
    return [...EDGE_GEOMETRIES[key2]].reverse();
  }
  return null;
}

// Graph Utility class
class RouteGraph {
  constructor() {
    this.graph = {};
    this.edgeMap = new Map();
    this.buildGraph();
  }

  buildGraph() {
    // Initialize nodes adjacency list
    Object.keys(GRAPH_DATA.coordinates).forEach(node => {
      this.graph[node] = [];
    });

    // Populate edges
    GRAPH_DATA.edges.forEach(edge => {
      this.graph[edge.from].push({ node: edge.to, distance: edge.distance });
      this.graph[edge.to].push({ node: edge.from, distance: edge.distance });

      const key1 = `${edge.from}-${edge.to}`;
      const key2 = `${edge.to}-${edge.from}`;
      this.edgeMap.set(key1, edge);
      this.edgeMap.set(key2, edge);
    });
  }

  neighbors(node) {
    let list = this.graph[node].map(edge => [edge.node, edge.distance]);
    if (!state.specialRouteUnlocked) {
      list = list.filter(([neighbor]) => !SPECIAL_NODES.includes(neighbor));
    }
    return list;
  }

  h(node) {
    return GRAPH_DATA.heuristics[node] !== undefined ? GRAPH_DATA.heuristics[node] : Infinity;
  }

  getEdge(a, b) {
    return this.edgeMap.get(`${a}-${b}`);
  }

  allNodes() {
    // Sort nodes to put Medan and Berastagi first, then alphabetically
    const preferred = ["Medan", "Berastagi"];
    const rest = Object.keys(this.graph)
      .filter(n => !preferred.includes(n))
      .sort();
    return [...preferred, ...rest];
  }
}

const graphInstance = new RouteGraph();

// =========================================================
// SEARCH ALGORITHMS (MAPPED EXACTLY FROM PYTHON LOGIC)
// =========================================================

/**
 * Breadth-First Search (BFS) - Uninformed Search
 */
function bfsSearch(start, goal) {
  let queue = [{ node: start, path: [start], distance: 0.0 }];
  let visited = new Set([start]);
  let explored = [];

  while (queue.length > 0) {
    let current = queue.shift();
    let node = current.node;
    let path = current.path;
    let distance = current.distance;

    explored.push({ node, path });

    if (node === goal) {
      return { path, distance, explored };
    }

    let neighbors = graphInstance.neighbors(node);
    for (let [neighbor, edgeDist] of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          node: neighbor,
          path: [...path, neighbor],
          distance: distance + edgeDist
        });
      }
    }
  }
  return { path: [], distance: Infinity, explored };
}

/**
 * Greedy Best-First Search - Informed Search
 */
function greedyBestFirstSearch(start, goal) {
  let pq = [{ h: graphInstance.h(start), node: start, path: [start], distance: 0.0 }];
  let visited = new Set();
  let explored = [];

  while (pq.length > 0) {
    // Sort priority queue: primary sort by heuristic h, tie-breaker lexicographically by node name
    pq.sort((a, b) => {
      if (a.h !== b.h) return a.h - b.h;
      return a.node.localeCompare(b.node);
    });

    let current = pq.shift();
    let node = current.node;
    let path = current.path;
    let distance = current.distance;

    if (visited.has(node)) continue;

    visited.add(node);
    explored.push({ node, path });

    if (node === goal) {
      return { path, distance, explored };
    }

    let neighbors = graphInstance.neighbors(node);
    for (let [neighbor, edgeDist] of neighbors) {
      if (!visited.has(neighbor)) {
        pq.push({
          h: graphInstance.h(neighbor),
          node: neighbor,
          path: [...path, neighbor],
          distance: distance + edgeDist
        });
      }
    }
  }
  return { path: [], distance: Infinity, explored };
}

/**
 * Dijkstra (Uniform Cost Search)
 */
function dijkstraSearch(start, goal) {
  let pq = [{ distance: 0.0, node: start, path: [start] }];
  let bestDistance = {};
  bestDistance[start] = 0.0;
  let visited = new Set();
  let explored = [];

  while (pq.length > 0) {
    // Sort priority queue: primary sort by cost distance, tie-breaker lexicographically by node name
    pq.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.node.localeCompare(b.node);
    });

    let current = pq.shift();
    let distance = current.distance;
    let node = current.node;
    let path = current.path;

    if (visited.has(node)) continue;

    visited.add(node);
    explored.push({ node, path });

    if (node === goal) {
      return { path, distance, explored };
    }

    let neighbors = graphInstance.neighbors(node);
    for (let [neighbor, edgeDist] of neighbors) {
      let newDistance = distance + edgeDist;
      let best = bestDistance[neighbor] !== undefined ? bestDistance[neighbor] : Infinity;
      if (newDistance < best) {
        bestDistance[neighbor] = newDistance;
        pq.push({
          distance: newDistance,
          node: neighbor,
          path: [...path, neighbor]
        });
      }
    }
  }
  return { path: [], distance: Infinity, explored };
}

// Run search for specific algorithm
function runAlgorithm(algoName, start, goal) {
  switch (algoName) {
    case "BFS":
      return bfsSearch(start, goal);
    case "Greedy":
      return greedyBestFirstSearch(start, goal);
    case "Dijkstra":
      return dijkstraSearch(start, goal);
    default:
      return dijkstraSearch(start, goal);
  }
}

// =========================================================
// STATE MANAGEMENT & WORKSPACE SETUP
// =========================================================
const state = {
  startNode: "Medan",
  goalNode: "Berastagi",
  selectedAlgo: "Dijkstra", // Dijkstra, BFS, Greedy, Bandingkan
  activeTab: "abstract-graph-view", // abstract-graph-view, satellite-map-view
  currentStep: 0, // step index in search simulation
  isPlaying: false,
  playTimer: null,
  playSpeed: 800, // ms
  specialRouteUnlocked: false, // Hidden by default for the presentation easter egg!

  // Results cache
  results: {
    BFS: null,
    Greedy: null,
    Dijkstra: null
  }
};

// =========================================================
// GRAPHICS & MAPS RENDERERS
// =========================================================
let leafletMap = null;
let leafletLayers = {
  streets: null
};
let leafletMarkers = [];
let leafletPolylines = [];
let distanceChart = null;
let exploredChart = null;

/**
 * Check if edge is in the route path
 */
function isEdgeInPath(fromNode, toNode, path) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if ((a === fromNode && b === toNode) || (a === toNode && b === fromNode)) {
      return true;
    }
  }
  return false;
}

/**
 * Initialize Leaflet Map
 */
function initLeafletMap() {
  if (leafletMap) return;

  // Center on Sembahe
  leafletMap = L.map('leaflet-map', {
    center: [3.3857, 98.5583],
    zoom: 11,
    zoomControl: true
  });

  // Street map tiles (Peta Jalan)
  leafletLayers.streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Default layer is Peta Jalan
  leafletLayers.streets.addTo(leafletMap);
}

/**
 * Update Leaflet Map Visuals based on the simulation state
 */
function updateLeafletMap(path, explored, activeNode, showPath) {
  if (!leafletMap) return;

  // Clear existing items
  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletPolylines.forEach(p => leafletMap.removeLayer(p));
  leafletMarkers = [];
  leafletPolylines = [];

  const exploredSet = new Set(explored);
  const pathSet = new Set(path);

  // Draw Edges
  GRAPH_DATA.edges.forEach(edge => {
    // Hide special route edges if not unlocked yet
    if (!state.specialRouteUnlocked && (SPECIAL_NODES.includes(edge.from) || SPECIAL_NODES.includes(edge.to))) {
      return;
    }

    const customGeom = getEdgeGeometry(edge.from, edge.to);
    const coordsPath = customGeom ? customGeom : [GRAPH_DATA.coordinates[edge.from], GRAPH_DATA.coordinates[edge.to]];

    let isPathEdge = showPath && isEdgeInPath(edge.from, edge.to, path);
    let color = isPathEdge ? '#3b82f6' : '#94a3b8';
    let weight = isPathEdge ? 6 : 2.5;
    let opacity = isPathEdge ? 1.0 : 0.6;

    const polyline = L.polyline(coordsPath, {
      color: color,
      weight: weight,
      opacity: opacity
    }).addTo(leafletMap);

    polyline.bindPopup(`<b>Segmen:</b> ${edge.from} ↔ ${edge.to}<br><b>Jarak:</b> ${edge.distance.toFixed(2)} km<br><b>Jalur:</b> ${edge.route}`);
    leafletPolylines.push(polyline);
  });

  // Draw Nodes
  Object.keys(GRAPH_DATA.coordinates).forEach(nodeName => {
    // Hide special route nodes if not unlocked yet
    if (!state.specialRouteUnlocked && SPECIAL_NODES.includes(nodeName)) {
      return;
    }

    const coords = GRAPH_DATA.coordinates[nodeName];

    // Choose marker style matching node status
    let fillColor = '#FFFFFF';
    let size = 6;
    let statusText = 'Belum Dikunjungi';

    if (nodeName === state.startNode) {
      fillColor = '#10B981'; // Green
      size = 9;
      statusText = '📍 Titik Awal (Start)';
    } else if (nodeName === state.goalNode) {
      fillColor = '#EF4444'; // Red
      size = 9;
      statusText = '🏁 Titik Tujuan (Goal)';
    } else if (nodeName === activeNode) {
      fillColor = '#A78BFA'; // Purple
      size = 8;
      statusText = '🧠 Sedang Dievaluasi (Active Front)';
    } else if (showPath && pathSet.has(nodeName)) {
      fillColor = '#FBBF24'; // Yellow
      size = 7;
      statusText = '🟡 Bagian dari Rute';
    } else if (exploredSet.has(nodeName)) {
      fillColor = '#BFDBFE'; // Soft blue
      size = 7;
      statusText = '🔵 Sudah Dieksplorasi (Visited)';
    }

    // Node CircleMarker
    const marker = L.circleMarker(coords, {
      radius: size,
      fillColor: fillColor,
      color: '#0F172A',
      weight: 2,
      fillOpacity: 1
    }).addTo(leafletMap);

    // Create custom Street View URL (Google Maps 360 viewpoint)
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords[0]},${coords[1]}`;

    marker.bindPopup(`
      <div style="font-family:'Inter',sans-serif; width:220px; padding:4px;">
        <h4 style="margin:0 0 6px 0; font-family:'Outfit',sans-serif; color:var(--text-main); font-size:1.05rem;">📍 ${nodeName}</h4>
        <p style="margin:0 0 10px 0; font-size:0.8rem; color:var(--text-muted); line-height:1.4;">
          <b>Status:</b> ${statusText}<br>
          <b>Koordinat:</b> ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}
        </p>
        <a href="${streetViewUrl}" target="_blank" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.8rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
          transition: all 0.2s;
          text-align: center;
        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 12px rgba(239, 68, 68, 0.35)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 8px rgba(239, 68, 68, 0.25)';">
          <span>🌍 Mainkan Street View (GeoGuessr)</span>
        </a>
      </div>
    `, {
      maxWidth: 260
    });

    leafletMarkers.push(marker);

    // Text Label Overlay
    const textIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="map-label">${nodeName}</div>`,
      iconSize: [120, 20],
      iconAnchor: [0, 10]
    });

    const labelMarker = L.marker(coords, { icon: textIcon, interactive: false }).addTo(leafletMap);
    leafletMarkers.push(labelMarker);
  });
}

/**
 * Render Abstract Graph SVG with highly professional visuals
 */
function renderAbstractGraph(path, explored, activeNode, showPath) {
  const svg = document.getElementById('graph-svg');
  if (!svg) return;

  // Clear previous content
  svg.innerHTML = '';

  const w = svg.clientWidth || 800;
  const h = svg.clientHeight || 540;

  // Mapping coordinate boundaries
  const paddingX = 60;
  const paddingY = 60;
  const minX = -0.5, maxX = 11.5;
  const minY = -3.5, maxY = 2.2;

  const scaleX = (x) => paddingX + ((x - minX) / (maxX - minX)) * (w - 2 * paddingX);
  const scaleY = (y) => paddingY + ((maxY - y) / (maxY - minY)) * (h - 2 * paddingY); // Inverted Y in SVG

  const exploredSet = new Set(explored);
  const pathSet = new Set(path);

  // Group elements so edges are placed behind nodes
  const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const edgeWeightsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  svg.appendChild(edgesGroup);
  svg.appendChild(edgeWeightsGroup);
  svg.appendChild(nodesGroup);

  // 1. Draw Edges
  GRAPH_DATA.edges.forEach(edge => {
    // Hide special route edges if not unlocked yet
    if (!state.specialRouteUnlocked && (SPECIAL_NODES.includes(edge.from) || SPECIAL_NODES.includes(edge.to))) {
      return;
    }

    const posA = GRAPH_DATA.layoutPositions[edge.from];
    const posB = GRAPH_DATA.layoutPositions[edge.to];

    const x0 = scaleX(posA[0]);
    const y0 = scaleY(posA[1]);
    const x1 = scaleX(posB[0]);
    const y1 = scaleY(posB[1]);

    const isPathEdge = showPath && isEdgeInPath(edge.from, edge.to, path);
    const strokeColor = isPathEdge ? '#2563EB' : '#CBD5E1';
    const strokeWidth = isPathEdge ? 5.5 : 2.0;

    // Draw main line connecting node centers
    // In SVG, we can shorten line slightly so it finishes nicely at the boundary of circles
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const radiusMargin = 22; // node radius visual

    let x0_line = x0, y0_line = y0, x1_line = x1, y1_line = y1;
    if (dist > 2 * radiusMargin) {
      const ux = dx / dist;
      const uy = dy / dist;
      x0_line = x0 + ux * radiusMargin;
      y0_line = y0 + uy * radiusMargin;
      x1_line = x1 - ux * radiusMargin;
      y1_line = y1 - uy * radiusMargin;
    }

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x0_line);
    line.setAttribute('y1', y0_line);
    line.setAttribute('x2', x1_line);
    line.setAttribute('y2', y1_line);
    line.setAttribute('stroke', strokeColor);
    line.setAttribute('stroke-width', strokeWidth);

    let edgeClass = 'graph-edge';
    if (isPathEdge) {
      edgeClass += ' neon-flow';
    }
    line.setAttribute('class', edgeClass);

    // Add title popup for standard browser tooltips
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${edge.from} ↔ ${edge.to} (${edge.distance} km) - ${edge.route}`;
    line.appendChild(title);

    edgesGroup.appendChild(line);

    // Draw Edge Distance Labels in the middle
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', mx - 20);
    bgRect.setAttribute('y', my - 8);
    bgRect.setAttribute('width', 40);
    bgRect.setAttribute('height', 16);
    bgRect.setAttribute('class', 'edge-weight-bg');
    bgRect.setAttribute('stroke', isPathEdge ? '#2563EB' : '#E2E8F0');
    bgRect.setAttribute('stroke-width', isPathEdge ? 1 : 0.5);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', mx);
    text.setAttribute('y', my + 3);
    text.setAttribute('class', `edge-weight-text ${isPathEdge ? 'highlighted' : ''}`);
    text.textContent = `${edge.distance.toFixed(1)} km`;

    edgeWeightsGroup.appendChild(bgRect);
    edgeWeightsGroup.appendChild(text);
  });

  // 2. Draw Nodes
  Object.keys(GRAPH_DATA.layoutPositions).forEach(nodeName => {
    // Hide special route nodes if not unlocked yet
    if (!state.specialRouteUnlocked && SPECIAL_NODES.includes(nodeName)) {
      return;
    }

    const pos = GRAPH_DATA.layoutPositions[nodeName];
    const x = scaleX(pos[0]);
    const y = scaleY(pos[1]);

    let color = '#FFFFFF';
    let border = '#0F172A';
    let borderWidth = 1.5;
    let r = 24;
    let className = 'graph-node';
    let tooltipStatus = 'Belum dikunjungi';

    if (nodeName === state.startNode) {
      color = '#10B981'; // Green
      borderWidth = 2.5;
      r = 26;
      tooltipStatus = 'Titik Awal (Start)';
    } else if (nodeName === state.goalNode) {
      color = '#EF4444'; // Red
      borderWidth = 2.5;
      r = 26;
      tooltipStatus = 'Titik Tujuan (Goal)';
    } else if (nodeName === activeNode) {
      color = '#A78BFA'; // Purple
      border = '#4C1D95';
      borderWidth = 3.0;
      r = 27;
      className += ' pulse-active';
      tooltipStatus = 'Sedang dievaluasi (Active Front)';
    } else if (showPath && pathSet.has(nodeName)) {
      color = '#FBBF24'; // Yellow
      borderWidth = 2.0;
      r = 25;
      tooltipStatus = 'Bagian dari rute hasil';
    } else if (exploredSet.has(nodeName)) {
      color = '#BFDBFE'; // Soft blue
      border = '#3B82F6';
      borderWidth = 2.0;
      tooltipStatus = 'Sudah dieksplorasi (Visited)';
    }

    const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Elastic spring pop-in style for evaluated/explored nodes OR newly unlocked special nodes!
    if (exploredSet.has(nodeName) || nodeName === activeNode || SPECIAL_NODES.includes(nodeName)) {
      nodeG.setAttribute('class', 'node-container-g');
      nodeG.setAttribute('style', `transform-origin: ${x}px ${y}px;`);
    }

    // Expanding active sonar pulse wave
    if (nodeName === activeNode) {
      const sonarRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      sonarRing.setAttribute('cx', x);
      sonarRing.setAttribute('cy', y);
      sonarRing.setAttribute('class', 'sonar-ring');
      nodeG.appendChild(sonarRing);
    }

    // Outer Circle for node
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', border);
    circle.setAttribute('stroke-width', borderWidth);
    circle.setAttribute('class', className);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `Lokasi: ${nodeName}\nStatus: ${tooltipStatus}\nHeuristik ke Berastagi: ${graphInstance.h(nodeName)} km\n(Double-click untuk membuka Street View GeoGuessr!)`;
    circle.appendChild(title);

    nodeG.appendChild(circle);

    // Label Text (Below the node)
    const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    labelText.setAttribute('x', x);
    labelText.setAttribute('y', y + r + 13);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('style', "font-size: 9.5px; font-weight: 700; font-family: 'Inter', sans-serif; fill: #0f172a; pointer-events:none;");
    labelText.textContent = nodeName;

    // We can draw a little background behind labels to keep it legible
    const textWidth = nodeName.length * 5.8;
    labelBg.setAttribute('x', x - textWidth / 2 - 4);
    labelBg.setAttribute('y', y + r + 3);
    labelBg.setAttribute('width', textWidth + 8);
    labelBg.setAttribute('height', 13);
    labelBg.setAttribute('class', 'node-label-bg');

    nodeG.appendChild(labelBg);
    nodeG.appendChild(labelText);

    // Inner Text Label (Abbreviation inside the circle node)
    const innerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    innerText.setAttribute('x', x);
    innerText.setAttribute('y', y + 3.5);
    innerText.setAttribute('class', 'node-text');

    // Quick Abbreviation generator
    const getAbbreviation = (str) => {
      if (str === "Medan") return "Mdn";
      if (str === "Berastagi") return "Bst";
      return str.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
    };
    innerText.textContent = getAbbreviation(nodeName);
    nodeG.appendChild(innerText);

    // Interactive event listeners
    circle.addEventListener('mouseenter', () => {
      // Highlight adjacent lines
      const incidentEdges = Array.from(svg.querySelectorAll('.graph-edge')).filter(lineEl => {
        const titleText = lineEl.querySelector('title').textContent;
        return titleText.startsWith(nodeName) || titleText.includes(` ↔ ${nodeName}`);
      });
      incidentEdges.forEach(el => {
        el.setAttribute('stroke', '#1E3A8A');
        el.setAttribute('stroke-width', parseFloat(el.getAttribute('stroke-width')) * 1.5);
      });
    });

    circle.addEventListener('mouseleave', () => {
      // Re-trigger render state to normalize
      const isCurrentlyActive = (nodeName === activeNode);
      const isPath = showPath && pathSet.has(nodeName);

      const incidentEdges = Array.from(svg.querySelectorAll('.graph-edge')).filter(lineEl => {
        const titleText = lineEl.querySelector('title').textContent;
        return titleText.startsWith(nodeName) || titleText.includes(` ↔ ${nodeName}`);
      });
      incidentEdges.forEach(el => {
        const titleText = el.querySelector('title').textContent;
        const fromTo = titleText.split(' (')[0].split(' ↔ ');
        const isPathLine = showPath && isEdgeInPath(fromTo[0], fromTo[1], path);
        el.setAttribute('stroke', isPathLine ? '#2563EB' : '#CBD5E1');
        el.setAttribute('stroke-width', isPathLine ? 5.5 : 2.0);
      });
    });

    // Make node selectable as start/goal on click!
    circle.addEventListener('click', () => {
      if (nodeName === state.startNode) return;

      // Let's set as goal node
      state.goalNode = nodeName;
      document.getElementById('ws-goal').value = nodeName;
      document.getElementById('landing-goal').value = nodeName;
      runSearchSimulation();
    });

    // Double-click opens real Street View GeoGuessr style!
    circle.addEventListener('dblclick', () => {
      const coords = GRAPH_DATA.coordinates[nodeName];
      const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords[0]},${coords[1]}`;
      window.open(streetViewUrl, '_blank');
    });

    nodesGroup.appendChild(nodeG);
  });
}

// =========================================================
// SIMULATION ENGINE & STATE SYNC
// =========================================================

/**
 * Populate Dropdowns
 */
function populateDropdowns() {
  const nodes = graphInstance.allNodes().filter(n => !SPECIAL_NODES.includes(n) || state.specialRouteUnlocked);
  const selectElements = [
    document.getElementById('landing-start'),
    document.getElementById('landing-goal'),
    document.getElementById('ws-start'),
    document.getElementById('ws-goal')
  ];

  selectElements.forEach((el, index) => {
    if (!el) return;
    el.innerHTML = '';

    nodes.forEach(node => {
      const opt = document.createElement('option');
      opt.value = node;
      opt.textContent = node;

      // Defaults setup
      const isStartDropdown = index % 2 === 0;
      if (isStartDropdown) {
        if (node === "Medan") opt.selected = true;
      } else {
        if (node === "Berastagi") opt.selected = true;
      }

      el.appendChild(opt);
    });
  });
}

/**
 * Execute Search Calculations and render GUI details
 */
function runSearchSimulation() {
  // Pause any ongoing playback
  pausePlayback();

  const start = state.startNode;
  const goal = state.goalNode;
  const algo = state.selectedAlgo;

  if (start === goal) {
    alert("Titik awal dan tujuan tidak boleh sama! Silakan pilih yang berbeda.");
    return;
  }

  // Show/hide Heuristik Greedy tab based on selected algorithm
  const tabHeuristics = document.getElementById('tab-heuristics');
  if (tabHeuristics) {
    if (algo === 'Greedy' || algo === 'Bandingkan') {
      tabHeuristics.style.display = '';
    } else {
      tabHeuristics.style.display = 'none';
      // If Heuristik Greedy is currently the active tab, switch back to the first tab (Rincian Segmen)
      if (tabHeuristics.classList.contains('active')) {
        tabHeuristics.classList.remove('active');
        const contentHeuristics = document.getElementById('detail-heuristics-tab');
        if (contentHeuristics) contentHeuristics.classList.remove('active');

        // Activate "Rincian Segmen" tab
        const defaultTabBtn = document.querySelector('.details-card .tabs-header .tab-btn[data-target="detail-route-tab"]');
        const defaultTabContent = document.getElementById('detail-route-tab');
        if (defaultTabBtn && defaultTabContent) {
          defaultTabBtn.classList.add('active');
          defaultTabContent.classList.add('active');
        }
      }
    }
  }

  // Pre-calculate all algorithms for comparison
  state.results.BFS = bfsSearch(start, goal);
  state.results.Greedy = greedyBestFirstSearch(start, goal);
  state.results.Dijkstra = dijkstraSearch(start, goal);

  if (algo === "Bandingkan") {
    // COMPARISON MODE UI SETUP
    document.getElementById('algo-info-card').style.display = 'none';
    document.getElementById('metric-distance-card').style.display = 'none';
    document.getElementById('metric-nodes-card').style.display = 'none';
    document.getElementById('metric-explored-card').style.display = 'none';
    document.getElementById('route-path-box').style.display = 'none';
    document.getElementById('sim-control-panel').style.display = 'none';

    // Show comparison area
    document.getElementById('comparison-dashboard').style.display = 'block';

    // Put Dijkstra as primary visualization in the tab panel (Dijkstra is the optimal)
    const dijkstraRes = state.results.Dijkstra;
    syncVisualizers(dijkstraRes.path, dijkstraRes.explored, dijkstraRes.explored.length);

    // Update charts & table comparison
    updateComparisonCharts();
    updateComparisonTable();

  } else {
    // SINGLE ALGORITHM WORKSPACE SETUP
    document.getElementById('algo-info-card').style.display = 'block';
    document.getElementById('metric-distance-card').style.display = 'block';
    document.getElementById('metric-nodes-card').style.display = 'block';
    document.getElementById('metric-explored-card').style.display = 'block';
    document.getElementById('route-path-box').style.display = 'block';
    document.getElementById('sim-control-panel').style.display = 'flex';
    document.getElementById('comparison-dashboard').style.display = 'none';

    // Update Header Text Info
    const infoTitles = {
      Dijkstra: "Dijkstra (Uniform Cost Search)",
      BFS: "Breadth-First Search (BFS)",
      Greedy: "Greedy Best-First Search"
    };
    const infoDescs = {
      Dijkstra: "Dijkstra mengevaluasi biaya total terkecil dari titik awal. Menjamin rute terpendek yang paling optimal secara mutlak untuk graf berbobot positif.",
      BFS: "BFS mengecek simpul secara melebar lapis demi lapis. Metode ini lengkap (Complete) namun mengabaikan bobot kilometer sehingga tidak menjamin rute terpendek.",
      Greedy: "Greedy menggunakan fungsi heuristik (estimasi jarak lurus ke tujuan). Prosesnya berjalan sangat cepat, namun hasilnya tidak dijamin optimal."
    };

    document.getElementById('info-algo-title').textContent = infoTitles[algo];
    document.getElementById('info-algo-desc').textContent = infoDescs[algo];

    const currentResult = state.results[algo];

    // Set simulator bounds
    const totalSteps = currentResult.explored.length;
    state.currentStep = 1; // start from step 1 for automatic animation!

    const slider = document.getElementById('sim-slider');
    slider.max = totalSteps;
    slider.value = 1;

    // Sync metrics and render views
    syncVisualizers(currentResult.path, currentResult.explored, 1);

    // Automatically trigger step-by-step path exploration animation!
    setTimeout(() => {
      playPlayback();
    }, 400);
  }

  // Update detail tabs (Rincian Segmen, Urutan Eksplorasi, etc.)
  updateDetailsTabs();
}

/**
 * Synchronize all UI visual boards to current step
 */
function syncVisualizers(path, explored, activeStepIndex) {
  const totalSteps = explored.length;
  document.getElementById('sim-step-text').textContent = `Langkah ${activeStepIndex} / ${totalSteps}`;
  document.getElementById('sim-slider').value = activeStepIndex;

  const currentExploredObjects = explored.slice(0, activeStepIndex);
  const currentExploredNames = currentExploredObjects.map(e => e.node);
  const currentActiveNode = activeStepIndex > 0 ? explored[activeStepIndex - 1].node : null;
  const currentActivePath = activeStepIndex > 0 ? explored[activeStepIndex - 1].path : [];
  const isFinalStep = activeStepIndex === totalSteps;

  // Determine current metrics matching step
  let stepDistance = 0;
  let stepPath = [];

  if (isFinalStep) {
    stepPath = path;
    // Calculate distance
    if (path.length > 0) {
      const selectedAlgo = state.selectedAlgo === "Bandingkan" ? "Dijkstra" : state.selectedAlgo;
      stepDistance = state.results[selectedAlgo].distance;
    }
  }

  // Update core widgets
  document.getElementById('metric-distance').textContent = isFinalStep && stepPath.length > 0 ? `${stepDistance.toFixed(2)} km` : "-";
  document.getElementById('metric-nodes').textContent = isFinalStep && stepPath.length > 0 ? stepPath.length : "-";
  document.getElementById('metric-explored').textContent = currentExploredNames.length;

  // Display Route String
  const routeBox = document.getElementById('route-path-box');
  if (isFinalStep && stepPath.length > 0) {
    routeBox.className = "route-box";
    let routeHtml = stepPath.map((node, i) => {
      const prefix = i === 0 ? "🟢 " : i === stepPath.length - 1 ? "🔴 " : "";
      return `<span style="white-space: nowrap;">${prefix}${node}</span>`;
    }).join('<span class="route-arrow">→</span>');

    if (state.startNode === "USU" && state.goalNode === "Simalingkar") {
      routeHtml += `
        <div style="margin-top: 14px; padding: 14px 18px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; color: #92400e; font-size: 0.92rem; font-weight: 600; line-height: 1.5; text-align: left; box-shadow: var(--shadow-sm); animation: fadeIn 0.4s ease-out;">
          💡 <strong>Jalur Spesial Mahasiswa:</strong> Dari USU menuju Simalingkar melewati jalur legendaris anak kampus.<br>
          🏫 <strong>Jalur Spesial Anak USU:</strong> Hidup Mahasiswa, Hidup Simalingkar.
        </div>
      `;
    }
    routeBox.innerHTML = routeHtml;
  } else if (isFinalStep) {
    routeBox.className = "route-box alert-card";
    routeBox.innerHTML = "<strong>❌ Rute tidak ditemukan!</strong> Maaf, tidak ada sambungan jalan dari asal ke tujuan.";
  } else {
    routeBox.className = "route-box";
    routeBox.innerHTML = `⏳ <strong>Mengevaluasi...</strong> Lokasi aktif: <span style="color:var(--active); font-weight:900;">${currentActiveNode || 'N/A'}</span>`;
  }

  // Draw the blue path following the active exploring node!
  const pathToHighlight = isFinalStep ? path : currentActivePath;
  const showPath = true;

  // Render SVG
  renderAbstractGraph(pathToHighlight, currentExploredNames, currentActiveNode, showPath);

  // Render Leaflet
  if (state.activeTab === "satellite-map-view") {
    // Wait standard timeout for animation transitions or layout renders
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize();

        // Auto-center map viewport on the active exploring node ONLY if it goes off-screen!
        if (currentActiveNode) {
          const activeCoords = GRAPH_DATA.coordinates[currentActiveNode];
          if (activeCoords) {
            const bounds = leafletMap.getBounds();
            // Only pan if the node is currently outside the user's viewable map area
            if (!bounds.contains(activeCoords)) {
              leafletMap.panTo(activeCoords, { animate: true, duration: 0.4 });
            }
          }
        } else if (isFinalStep && path.length > 0) {
          // Zoom out smoothly to fit the entire final path upon search completion!
          const bounds = L.latLngBounds(path.map(node => GRAPH_DATA.coordinates[node]));
          leafletMap.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.0 });
        }
      }
      updateLeafletMap(pathToHighlight, currentExploredNames, currentActiveNode, showPath);
    }, 100);
  } else {
    updateLeafletMap(pathToHighlight, currentExploredNames, currentActiveNode, showPath);
  }

  // Trigger Path Runner Animation on completion
  if (isFinalStep && path.length >= 2) {
    startPathRunnerAnimation(path);
  } else {
    stopPathRunnerAnimation();
  }
}

/**
 * Handle Step Change Slider & Buttons
 */
function changeStep(targetStep) {
  const currentResult = state.results[state.selectedAlgo];
  if (!currentResult) return;

  const total = currentResult.explored.length;
  if (targetStep < 1) targetStep = 1;
  if (targetStep > total) targetStep = total;

  state.currentStep = targetStep;
  syncVisualizers(currentResult.path, currentResult.explored, targetStep);
}

/**
 * Animation playback control
 */
function playPlayback() {
  if (state.isPlaying) return;

  const currentResult = state.results[state.selectedAlgo];
  if (!currentResult) return;

  // If at the end, wrap to step 1
  if (state.currentStep === currentResult.explored.length) {
    state.currentStep = 1;
  }

  state.isPlaying = true;
  document.getElementById('play-icon').style.display = 'none';
  document.getElementById('pause-icon').style.display = 'inline';

  // Recursive loop to dynamically recalculate speed per step
  function runStep() {
    if (!state.isPlaying) return;

    const total = currentResult.explored.length;
    if (state.currentStep < total) {
      changeStep(state.currentStep + 1);

      // Calculate dynamic speed based on Leaflet map zoom level!
      let currentDelay = state.playSpeed;
      if (leafletMap && state.activeTab === "satellite-map-view") {
        const zoom = leafletMap.getZoom();
        // If zoom is zoomed in (closer than 11), scale up the delay to give tiles time to load
        if (zoom > 11) {
          const scaleFactor = 1 + (zoom - 11) * 0.45; // e.g. zoom 13 is 1.9x slower, zoom 14 is 2.35x slower
          currentDelay = Math.round(state.playSpeed * scaleFactor);
        }
      }

      state.playTimer = setTimeout(runStep, currentDelay);
    } else {
      pausePlayback();
    }
  }

  state.playTimer = setTimeout(runStep, state.playSpeed);
}

function pausePlayback() {
  if (!state.isPlaying) return;
  state.isPlaying = false;
  document.getElementById('play-icon').style.display = 'inline';
  document.getElementById('pause-icon').style.display = 'none';

  if (state.playTimer) {
    clearTimeout(state.playTimer);
    state.playTimer = null;
  }
}

// =========================================================
// CHARTS & METRICS VISUALIZATIONS
// =========================================================
function updateComparisonCharts() {
  const algos = ["BFS", "Greedy", "Dijkstra"];
  const distances = algos.map(a => state.results[a].path.length > 0 ? state.results[a].distance : 0.0);
  const exploredCounts = algos.map(a => state.results[a].explored.length);

  const colors = ['#3B82F6', '#F59E0B', '#10B981']; // BFS Blue, Greedy Amber, Dijkstra Teal
  const hoverColors = ['#1D4ED8', '#D97706', '#059669'];

  // Distance Chart
  if (distanceChart) {
    distanceChart.destroy();
  }
  const ctxDist = document.getElementById('chart-distance').getContext('2d');
  distanceChart = new Chart(ctxDist, {
    type: 'bar',
    data: {
      labels: ["BFS", "Greedy Best-First", "Dijkstra"],
      datasets: [{
        label: 'Jarak (km)',
        data: distances,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.raw.toFixed(2)} km`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
        y: {
          grid: { color: '#f1f5f9' },
          title: { display: true, text: 'Bobot Kilometer (km)', font: { size: 11 } }
        }
      }
    }
  });

  // Explored Chart
  if (exploredChart) {
    exploredChart.destroy();
  }
  const ctxExplored = document.getElementById('chart-explored').getContext('2d');
  exploredChart = new Chart(ctxExplored, {
    type: 'bar',
    data: {
      labels: ["BFS", "Greedy Best-First", "Dijkstra"],
      datasets: [{
        label: 'Node Dieksplorasi',
        data: exploredCounts,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
        y: {
          grid: { color: '#f1f5f9' },
          title: { display: true, text: 'Jumlah Simpul', font: { size: 11 } },
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

function updateComparisonTable() {
  const tableBody = document.getElementById('comparison-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const algos = ["Dijkstra", "BFS", "Greedy"];

  algos.forEach(algoKey => {
    const res = state.results[algoKey];
    const row = document.createElement('tr');

    let pathString = res.path.length > 0 ? res.path.join(' → ') : "Tidak ditemukan";
    if (pathString.length > 50) {
      pathString = pathString.substring(0, 47) + "...";
    }

    row.innerHTML = `
      <td style="font-weight: 800; color:var(--text-main);">${algoKey === "Greedy" ? "Greedy Best-First" : algoKey}</td>
      <td style="font-family:monospace; font-size:11px;" title="${res.path.join(' → ')}">${pathString}</td>
      <td style="font-weight:700;">${res.path.length > 0 ? res.distance.toFixed(2) + ' km' : '∞'}</td>
      <td>${res.path.length}</td>
      <td><span class="badge" style="background-color:#f1f5f9; color:var(--text-main); border:none; padding:4px 8px;">${res.explored.length} node</span></td>
    `;
    tableBody.appendChild(row);
  });
}

// =========================================================
// DETAILS & THEORIES TABS UPDATES
// =========================================================
function updateDetailsTabs() {
  const algo = state.selectedAlgo === "Bandingkan" ? "Dijkstra" : state.selectedAlgo;
  const currentResult = state.results[algo];

  if (!currentResult) return;

  // 1. Rincian Segmen Table
  const routeDetailsBody = document.getElementById('route-details-body');
  routeDetailsBody.innerHTML = '';

  if (currentResult.path.length > 0) {
    let accumulated = 0;
    for (let i = 0; i < currentResult.path.length - 1; i++) {
      const from = currentResult.path[i];
      const to = currentResult.path[i + 1];
      const edge = graphInstance.getEdge(from, to);
      const dist = edge ? edge.distance : 0.0;
      accumulated += dist;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td style="font-weight:700; color:var(--text-main);">${from}</td>
        <td style="font-weight:700; color:var(--text-main);">${to}</td>
        <td>${dist.toFixed(2)} km</td>
        <td style="font-weight:700; color:var(--primary);">${accumulated.toFixed(2)} km</td>
      `;
      routeDetailsBody.appendChild(tr);
    }
  } else {
    routeDetailsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-light);">Tidak ada segmen rute yang ditemukan.</td></tr>`;
  }

  // 2. Explored List Box
  const flowContainer = document.getElementById('explored-nodes-flow');
  flowContainer.innerHTML = currentResult.explored.map(e => e.node).join(' <span style="color:#f59e0b; font-weight:800;">→</span> ');

  // 3. Distance List Table
  const distanceTableBody = document.getElementById('distances-table-body');
  distanceTableBody.innerHTML = '';
  GRAPH_DATA.edges.forEach(edge => {
    // Hide special route edges if not unlocked yet
    if (!state.specialRouteUnlocked && (SPECIAL_NODES.includes(edge.from) || SPECIAL_NODES.includes(edge.to))) {
      return;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--text-main);">${edge.from}</td>
      <td style="font-weight:600; color:var(--text-main);">${edge.to}</td>
      <td style="font-weight:700;">${edge.distance.toFixed(2)} km</td>
      <td><span class="badge" style="background-color:${edge.route === 'Jalur Utama' ? 'rgba(16,185,129,0.1)' : 'rgba(79,70,229,0.1)'}; color:${edge.route === 'Jalur Utama' ? 'var(--success)' : 'var(--primary)'}; border:none; font-size:11px;">${edge.route}</span></td>
    `;
    distanceTableBody.appendChild(tr);
  });

  // 4. Heuristics Data Table
  const heuristicsTableBody = document.getElementById('heuristics-table-body');
  heuristicsTableBody.innerHTML = '';
  // Sort heuristics descending by value
  const sortedHeuristics = Object.entries(GRAPH_DATA.heuristics)
    .sort((a, b) => b[1] - a[1]);

  sortedHeuristics.forEach(([node, hVal]) => {
    // Hide special route nodes if not unlocked yet
    if (!state.specialRouteUnlocked && SPECIAL_NODES.includes(node)) {
      return;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--text-main);">${node}</td>
      <td style="font-weight:700; color:var(--warning);">${hVal.toFixed(1)} km</td>
    `;
    heuristicsTableBody.appendChild(tr);
  });
}

// =========================================================
// UI EVENT LISTENERS
// =========================================================
function setupEventListeners() {

  // Unified function to unlock and transition to the secret route
  function unlockSpecialRoute() {
    if (state.specialRouteUnlocked) return;

    state.specialRouteUnlocked = true;

    // Hide dedicated landing page button
    const btnSecret = document.getElementById('btn-secret-unlock');
    if (btnSecret) btnSecret.style.display = 'none';

    // Change style and label of sidebar button to act as a lock toggle
    const btnSidebar = document.getElementById('btn-sidebar-secret');
    if (btnSidebar) {
      btnSidebar.innerHTML = '<span>🔒 Sembunyikan Jalur Spesial</span>';
      btnSidebar.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      btnSidebar.style.color = '#EF4444';
      btnSidebar.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.08)';
    }

    // Play a gorgeous pop-in animation on the UI header
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.background = 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #4f46e5 100%)';
    }

    // Repopulate dropdowns
    populateDropdowns();

    // Automatically select USU as Start and Simalingkar as Goal
    state.startNode = "USU";
    state.goalNode = "Simalingkar";

    document.getElementById('ws-start').value = "USU";
    document.getElementById('ws-goal').value = "Simalingkar";
    document.getElementById('landing-start').value = "USU";
    document.getElementById('landing-goal').value = "Simalingkar";

    // If currently on landing view, auto start the app workspace
    const landingView = document.getElementById('landing-view');
    if (landingView && landingView.style.display !== 'none') {
      document.getElementById('btn-start').click();
    } else {
      runSearchSimulation();
    }

    // Show premium glassmorphic toast notification
    const toast = document.getElementById('secret-toast');
    if (toast) {
      toast.style.display = 'block';
      toast.style.animation = 'toastSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';

      // Auto-close after 6 seconds
      const closeBtn = document.getElementById('btn-toast-close');
      const autoCloseTimeout = setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.4s ease-in both';
        setTimeout(() => { toast.style.display = 'none'; }, 400);
      }, 6000);

      if (closeBtn) {
        closeBtn.onclick = () => {
          clearTimeout(autoCloseTimeout);
          toast.style.animation = 'toastSlideOut 0.4s ease-in both';
          setTimeout(() => { toast.style.display = 'none'; }, 400);
        };
      }
    }
  }

  // Function to lock/revert the secret route back to hidden state
  function lockSpecialRoute() {
    if (!state.specialRouteUnlocked) return;

    state.specialRouteUnlocked = false;

    // Play header color restoration to main theme
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.background = 'linear-gradient(135deg, #0f766e 0%, #2563eb 50%, #4f46e5 100%)';
    }

    // Repopulate dropdowns (filtering out special nodes)
    populateDropdowns();

    // Automatically select Medan as Start and Berastagi as Goal
    state.startNode = "Medan";
    state.goalNode = "Berastagi";

    document.getElementById('ws-start').value = "Medan";
    document.getElementById('ws-goal').value = "Berastagi";
    document.getElementById('landing-start').value = "Medan";
    document.getElementById('landing-goal').value = "Berastagi";

    // Show the landing page secret button again
    const btnSecret = document.getElementById('btn-secret-unlock');
    if (btnSecret) btnSecret.style.display = 'block';

    // Restore sidebar button text and style
    const btnSidebar = document.getElementById('btn-sidebar-secret');
    if (btnSidebar) {
      btnSidebar.innerHTML = '<span>🎓 Jalur Spesial Anak USU</span>';
      btnSidebar.style.borderColor = 'rgba(236, 72, 153, 0.4)';
      btnSidebar.style.color = '#ec4899';
      btnSidebar.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.06)';
    }

    // Run normal search simulation
    runSearchSimulation();

    // Close toast if open
    const toast = document.getElementById('secret-toast');
    if (toast) {
      toast.style.animation = 'toastSlideOut 0.4s ease-in both';
      setTimeout(() => { toast.style.display = 'none'; }, 400);
    }
  }

  // Secret Click on the main title to unlock the secret Simalingkar route!
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    heroTitle.style.cursor = 'pointer';
    heroTitle.addEventListener('click', unlockSpecialRoute);
  }

  // Dedicated special route button (Landing page)
  const btnSecretUnlock = document.getElementById('btn-secret-unlock');
  if (btnSecretUnlock) {
    btnSecretUnlock.addEventListener('click', unlockSpecialRoute);
  }

  // Dedicated special route button (Sidebar workspace) with toggle action
  const btnSidebarSecret = document.getElementById('btn-sidebar-secret');
  if (btnSidebarSecret) {
    btnSidebarSecret.addEventListener('click', () => {
      if (state.specialRouteUnlocked) {
        lockSpecialRoute();
      } else {
        unlockSpecialRoute();
      }
    });
  }

  // 1. Landing View Form Submit
  document.getElementById('btn-start').addEventListener('click', () => {
    const start = document.getElementById('landing-start').value;
    const goal = document.getElementById('landing-goal').value;
    const algo = document.getElementById('landing-algo').value;

    if (start === goal) {
      alert("Titik awal dan tujuan tidak boleh sama. Silakan pilih tujuan yang berbeda.");
      return;
    }

    // Sync State
    state.startNode = start;
    state.goalNode = goal;
    state.selectedAlgo = algo;

    // Sync Workspace controls
    document.getElementById('ws-start').value = start;
    document.getElementById('ws-goal').value = goal;

    // Check radio buttons
    const radios = document.getElementsByName('search-algo');
    radios.forEach(radio => {
      if (radio.value === algo) {
        radio.checked = true;
        radio.closest('.radio-label').classList.add('selected');
      } else {
        radio.closest('.radio-label').classList.remove('selected');
      }
    });

    // Toggle view visibility
    document.getElementById('landing-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'grid';

    // Initalize Map once visible to prevent layout render bugs
    initLeafletMap();

    // Trigger logic
    runSearchSimulation();
  });

  // 2. Workspace Sidebar Changes
  document.getElementById('ws-start').addEventListener('change', (e) => {
    state.startNode = e.target.value;
    document.getElementById('landing-start').value = e.target.value;
    runSearchSimulation();
  });

  document.getElementById('ws-goal').addEventListener('change', (e) => {
    state.goalNode = e.target.value;
    document.getElementById('landing-goal').value = e.target.value;
    runSearchSimulation();
  });

  // Radio button choices
  const radios = document.getElementsByName('search-algo');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.selectedAlgo = e.target.value;
      document.getElementById('landing-algo').value = e.target.value;

      // Update visual style selection inside sidebar
      radios.forEach(r => r.closest('.radio-label').classList.remove('selected'));
      e.target.closest('.radio-label').classList.add('selected');

      runSearchSimulation();
    });
  });

  // 3. Tab switching (Upper Graphics panel: Graph vs Map)
  const tabGraph = document.getElementById('tab-graph');
  const tabMap = document.getElementById('tab-map');

  tabGraph.addEventListener('click', (e) => {
    tabGraph.classList.add('active');
    tabMap.classList.remove('active');
    document.getElementById('abstract-graph-view').classList.add('active');
    document.getElementById('satellite-map-view').classList.remove('active');
    state.activeTab = "abstract-graph-view";

    // Render immediately
    const currentResult = state.results[state.selectedAlgo === "Bandingkan" ? "Dijkstra" : state.selectedAlgo];
    if (currentResult) {
      renderAbstractGraph(currentResult.path, currentResult.explored.slice(0, state.currentStep), currentResult.explored[state.currentStep - 1], state.currentStep === currentResult.explored.length);
    }
  });

  tabMap.addEventListener('click', (e) => {
    tabMap.classList.add('active');
    tabGraph.classList.remove('active');
    document.getElementById('satellite-map-view').classList.add('active');
    document.getElementById('abstract-graph-view').classList.remove('active');
    state.activeTab = "satellite-map-view";

    // Setup map layout fixes
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize();

        // Fit Map bounds automatically to contain Medan and Berastagi
        leafletMap.fitBounds([
          GRAPH_DATA.coordinates["Medan"],
          GRAPH_DATA.coordinates["Berastagi"]
        ], { padding: [40, 40] });
      }

      const currentResult = state.results[state.selectedAlgo === "Bandingkan" ? "Dijkstra" : state.selectedAlgo];
      if (currentResult) {
        updateLeafletMap(currentResult.path, currentResult.explored.slice(0, state.currentStep), currentResult.explored[state.currentStep - 1], state.currentStep === currentResult.explored.length);
      }
    }, 50);
  });

  // 4. Tab switching (Lower Details sections)
  const detailTabs = document.querySelectorAll('.details-card .tabs-header .tab-btn');
  detailTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      detailTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-target');
      const contents = document.querySelectorAll('.details-card .tab-content');
      contents.forEach(c => {
        if (c.id === targetId) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    });
  });

  // 5. Back to Landing View button
  document.getElementById('btn-back').addEventListener('click', () => {
    pausePlayback();
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('landing-view').style.display = 'block';
  });

  // 6. Simulation Play/Pause & Step Controls
  document.getElementById('btn-play-pause').addEventListener('click', () => {
    if (state.isPlaying) {
      pausePlayback();
    } else {
      playPlayback();
    }
  });

  document.getElementById('btn-step-prev').addEventListener('click', () => {
    pausePlayback();
    changeStep(state.currentStep - 1);
  });

  document.getElementById('btn-step-next').addEventListener('click', () => {
    pausePlayback();
    changeStep(state.currentStep + 1);
  });

  const slider = document.getElementById('sim-slider');
  slider.addEventListener('input', (e) => {
    pausePlayback();
    changeStep(parseInt(e.target.value));
  });

  document.getElementById('sim-speed').addEventListener('change', (e) => {
    state.playSpeed = parseInt(e.target.value);
    if (state.isPlaying) {
      pausePlayback();
      playPlayback();
    }
  });

  // Handle window resizing to keep SVG graph scalable
  window.addEventListener('resize', () => {
    if (state.activeTab === "abstract-graph-view") {
      const currentResult = state.results[state.selectedAlgo === "Bandingkan" ? "Dijkstra" : state.selectedAlgo];
      if (currentResult) {
        renderAbstractGraph(
          currentResult.path,
          currentResult.explored.slice(0, state.currentStep),
          currentResult.explored[state.currentStep - 1],
          state.currentStep === currentResult.explored.length
        );
      }
    }
  });
}

// =========================================================
// PATH TRAVERSAL RUNNER ANIMATION
// =========================================================
const runnerState = {
  active: false,
  path: [],
  currentIndex: 0,
  progress: 0.0,
  speed: 0.025, // speed of movement (percentage per frame)
  animationFrameId: null,
  svgMarker: null,
  leafletMarker: null
};

function startPathRunnerAnimation(path) {
  stopPathRunnerAnimation();

  if (!path || path.length < 2) return;

  runnerState.active = true;
  runnerState.path = path;
  runnerState.currentIndex = 0;
  runnerState.progress = 0.0;

  // 1. Create SVG Pulsing Runner Dot
  const svg = document.getElementById('graph-svg');
  if (svg) {
    runnerState.svgMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    runnerState.svgMarker.setAttribute('r', '8');
    runnerState.svgMarker.setAttribute('fill', '#EF4444'); // glowing red runner
    runnerState.svgMarker.setAttribute('stroke', '#FFFFFF');
    runnerState.svgMarker.setAttribute('stroke-width', '2.5');
    runnerState.svgMarker.setAttribute('style', 'filter: drop-shadow(0 0 10px #EF4444); pointer-events: none;');
    svg.appendChild(runnerState.svgMarker);
  }

  // 2. Create Leaflet Pulsing Runner Dot
  if (leafletMap) {
    const startCoords = GRAPH_DATA.coordinates[path[0]];
    runnerState.leafletMarker = L.circleMarker(startCoords, {
      radius: 9,
      fillColor: '#EF4444',
      color: '#FFFFFF',
      weight: 2.5,
      fillOpacity: 1,
      className: 'path-runner-leaflet'
    }).addTo(leafletMap);

    // Add pulsing CSS style to Leaflet marker
    const styleEl = document.createElement('style');
    styleEl.id = 'leaflet-runner-style';
    styleEl.innerHTML = `
      .path-runner-leaflet {
        animation: leafletMarkerPulse 1s infinite alternate;
        filter: drop-shadow(0 0 8px #EF4444);
      }
      @keyframes leafletMarkerPulse {
        0% { r: 7px; stroke-width: 2px; }
        100% { r: 10px; stroke-width: 3.5px; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 3. Animation Loop
  function animate() {
    if (!runnerState.active) return;

    const i = runnerState.currentIndex;
    const p = runnerState.path;

    if (i >= p.length - 1) {
      // Loop complete, restart from beginning
      runnerState.currentIndex = 0;
      runnerState.progress = 0.0;
      runnerState.animationFrameId = requestAnimationFrame(animate);
      return;
    }

    const nodeA = p[i];
    const nodeB = p[i + 1];

    // SVG Runner Update
    if (runnerState.svgMarker && svg) {
      const posA = GRAPH_DATA.layoutPositions[nodeA];
      const posB = GRAPH_DATA.layoutPositions[nodeB];

      const w = svg.clientWidth || 800;
      const h = svg.clientHeight || 540;
      const paddingX = 60;
      const paddingY = 60;
      const minX = -0.5, maxX = 11.5;
      const minY = -3.5, maxY = 2.2;

      const scaleX = (x) => paddingX + ((x - minX) / (maxX - minX)) * (w - 2 * paddingX);
      const scaleY = (y) => paddingY + ((maxY - y) / (maxY - minY)) * (h - 2 * paddingY);

      const ax = scaleX(posA[0]);
      const ay = scaleY(posA[1]);
      const bx = scaleX(posB[0]);
      const by = scaleY(posB[1]);

      const currentX = ax + (bx - ax) * runnerState.progress;
      const currentY = ay + (by - ay) * runnerState.progress;

      runnerState.svgMarker.setAttribute('cx', currentX);
      runnerState.svgMarker.setAttribute('cy', currentY);
    }

    // Leaflet Runner Update
    if (runnerState.leafletMarker && leafletMap) {
      const coordA = GRAPH_DATA.coordinates[nodeA];
      const coordB = GRAPH_DATA.coordinates[nodeB];

      const lat = coordA[0] + (coordB[0] - coordA[0]) * runnerState.progress;
      const lng = coordA[1] + (coordB[1] - coordA[1]) * runnerState.progress;

      runnerState.leafletMarker.setLatLng([lat, lng]);
    }

    // Advance progress
    runnerState.progress += runnerState.speed;
    if (runnerState.progress >= 1.0) {
      runnerState.progress = 0.0;
      runnerState.currentIndex++;
    }

    runnerState.animationFrameId = requestAnimationFrame(animate);
  }

  runnerState.animationFrameId = requestAnimationFrame(animate);
}

function stopPathRunnerAnimation() {
  runnerState.active = false;
  if (runnerState.animationFrameId) {
    cancelAnimationFrame(runnerState.animationFrameId);
    runnerState.animationFrameId = null;
  }
  if (runnerState.svgMarker) {
    runnerState.svgMarker.remove();
    runnerState.svgMarker = null;
  }
  if (runnerState.leafletMarker && leafletMap) {
    leafletMap.removeLayer(runnerState.leafletMarker);
    runnerState.leafletMarker = null;
  }
  const styleEl = document.getElementById('leaflet-runner-style');
  if (styleEl) styleEl.remove();
}

// =========================================================
// APPLICATION INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize structures
  populateDropdowns();
  setupEventListeners();

  // Draw an initial abstract graph in the background just to display placeholder
  setTimeout(() => {
    renderAbstractGraph([], [], null, false);
  }, 100);
});
