// ================================================================
// ROUTE FINDER - JAVASCRIPT IMPLEMENTATION
// BFS, Greedy Best-First Search, Dijkstra Comparison
// ================================================================

/**
 * CLASS: RouteGraph
 * Represents the graph with nodes, edges, and heuristics
 */
class RouteGraph {
    constructor() {
        this.graph = new Map();
        this.edgeInfo = [];
        this.heuristic = new Map();
        this.positions = new Map();
        this.coordinates = new Map();
        this.buildGraph();
    }

    addEdge(dari, ke, jarak, rute) {
        if (!this.graph.has(dari)) {
            this.graph.set(dari, []);// ================================================================
// ROUTE FINDER - JAVASCRIPT IMPLEMENTATION
// BFS, Greedy Best-First Search, Dijkstra Comparison
//
// PERBAIKAN:
//  1. Koordinat GPS diverifikasi & dikoreksi ke titik jalan OSM nyata
//  2. Rute di peta menggunakan OSRM (road-snapping ke jalan asli)
//  3. Struktur NODE_CONFIG terpusat — mudah tambah/ubah titik rute
//  4. Tidak ada duplikat id="leafletMap" — satu instance Leaflet
//  5. Tab switching diperbaiki untuk single & comparison view
// ================================================================

// ================================================================
// NODE CONFIGURATION — Ubah/tambah titik rute DI SINI saja
// lat/lng diverifikasi di OSM dan di-snap ke badan jalan utama
// ================================================================
const NODE_CONFIG = {
    "Medan": {
        // Simpang Pos / Jl. Sisingamangaraja — pusat kota, di jalan utama
        coords: [3.5896, 98.6731],
        heuristic: 64.0,
        canvasPos: [80, 300]
    },
    "Padang Bulan": {
        // Simpang Padang Bulan, Jl. Jamin Ginting
        coords: [3.5682, 98.6503],
        heuristic: 56.0,
        canvasPos: [160, 290]
    },
    "Simpang Selayang": {
        // Simpang Selayang, Jl. Jamin Ginting
        coords: [3.5321, 98.6278],
        heuristic: 50.0,
        canvasPos: [240, 278]
    },
    "Tuntuntan": {
        // Pasar Tuntuntan, Jl. Jamin Ginting
        coords: [3.4950, 98.5961],
        heuristic: 44.0,
        canvasPos: [320, 268]
    },
    "Pancur Batu": {
        // Pasar Pancur Batu, Jl. Jamin Ginting
        coords: [3.4602, 98.5648],
        heuristic: 34.0,
        canvasPos: [400, 258]
    },
    "Rumah Sumbul": {
        // Persimpangan Rumah Sumbul, Jl. Jamin Ginting
        coords: [3.4178, 98.5281],
        heuristic: 26.0,
        canvasPos: [475, 248]
    },
    "Sembahe": {
        // Jembatan Sembahe / wisata alam, Jl. Jamin Ginting
        coords: [3.3891, 98.5047],
        heuristic: 20.0,
        canvasPos: [548, 235]
    },
    "Sibolangit": {
        // Pasar Sibolangit, Jl. Jamin Ginting
        coords: [3.3447, 98.4728],
        heuristic: 15.0,
        canvasPos: [618, 222]
    },
    "Bandar Baru": {
        // Persimpangan Bandar Baru menuju Berastagi
        coords: [3.3012, 98.4447],
        heuristic: 8.90,
        canvasPos: [690, 210]
    },
    "Berastagi": {
        // Tugu / pusat kota Berastagi, Jl. Veteran
        coords: [3.1939, 98.5122],
        heuristic: 0.0,
        canvasPos: [760, 215]
    }
};

// ================================================================
// CLASS: RouteGraph
// ================================================================
class RouteGraph {
    constructor() {
        this.graph    = new Map();
        this.edgeInfo = [];
        this.heuristic  = new Map();
        this.positions  = new Map();
        this.coordinates = new Map();
        this._loadFromConfig();
        this._buildEdges();
    }

    /** Muat koordinat, heuristik, posisi canvas dari NODE_CONFIG */
    _loadFromConfig() {
        for (const [name, cfg] of Object.entries(NODE_CONFIG)) {
            this.heuristic.set(name, cfg.heuristic);
            this.positions.set(name, cfg.canvasPos);
            // Simpan sebagai [lat, lng] — format Leaflet
            this.coordinates.set(name, cfg.coords);
            this.graph.set(name, []);
        }
    }

    /** Definisi edge — ubah bobot jika perlu, atau tambah edge baru */
    _buildEdges() {
        // Jalur utama Medan – Berastagi via Jamin Ginting
        this.addEdge("Medan",           "Padang Bulan",      7.50, "Jalur Utama");
        this.addEdge("Padang Bulan",    "Simpang Selayang",  6.00, "Jalur Utama");
        this.addEdge("Simpang Selayang","Tuntuntan",         5.50, "Jalur Utama");
        this.addEdge("Tuntuntan",       "Pancur Batu",       9.80, "Jalur Utama");
        this.addEdge("Pancur Batu",     "Rumah Sumbul",      8.50, "Jalur Utama");
        this.addEdge("Rumah Sumbul",    "Sembahe",           5.20, "Jalur Utama");
        this.addEdge("Sembahe",         "Sibolangit",        7.80, "Jalur Utama");
        this.addEdge("Sibolangit",      "Bandar Baru",       6.50, "Jalur Utama");
        this.addEdge("Bandar Baru",     "Berastagi",         8.90, "Jalur Utama");

        // Jalur alternatif via Tuntuntan langsung
        this.addEdge("Medan",           "Tuntuntan",        15.00, "Alternatif Tuntuntan");
        this.addEdge("Pancur Batu",     "Sibolangit",       22.00, "Alternatif Tuntuntan");
    }

    addEdge(dari, ke, jarak, rute) {
        this.graph.get(dari).push([ke,   jarak]);
        this.graph.get(ke  ).push([dari, jarak]);
        this.edgeInfo.push({ dari, ke, jarak, rute });
    }

    getNeighbors(node)  { return this.graph.get(node) || []; }
    getHeuristic(node)  { return this.heuristic.get(node)  ?? Infinity; }
    getPosition(node)   { return this.positions.get(node)  || [0, 0]; }
    getCoordinates(node){ return this.coordinates.get(node)|| [0, 0]; }

    allNodes() {
        return Array.from(this.graph.keys()).sort((a, b) => {
            if (a === "Medan")     return -1;
            if (b === "Medan")     return  1;
            if (a === "Berastagi") return  1;
            if (b === "Berastagi") return -1;
            return a.localeCompare(b);
        });
    }

    getEdgeDistance(a, b) {
        for (const [nb, d] of this.getNeighbors(a)) {
            if (nb === b) return d;
        }
        return Infinity;
    }
}

// ================================================================
// CLASS: SearchAlgorithms
// ================================================================
class SearchAlgorithms {
    constructor(graph) { this.graph = graph; }

    bfs(start, goal) {
        const queue   = [[start, [start], 0.0]];
        const visited = new Set([start]);
        const explored = [];

        while (queue.length > 0) {
            const [node, path, dist] = queue.shift();
            explored.push(node);
            if (node === goal) return { path, distance: dist, explored };

            for (const [nb, d] of this.graph.getNeighbors(node)) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    queue.push([nb, [...path, nb], dist + d]);
                }
            }
        }
        return { path: [], distance: Infinity, explored };
    }

    greedyBestFirstSearch(start, goal) {
        const pq = [[this.graph.getHeuristic(start), start, [start], 0.0]];
        const visited = new Set();
        const explored = [];

        while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0]);
            const [, node, path, dist] = pq.shift();
            if (visited.has(node)) continue;
            visited.add(node);
            explored.push(node);
            if (node === goal) return { path, distance: dist, explored };

            for (const [nb, d] of this.graph.getNeighbors(node)) {
                if (!visited.has(nb)) {
                    pq.push([this.graph.getHeuristic(nb), nb, [...path, nb], dist + d]);
                }
            }
        }
        return { path: [], distance: Infinity, explored };
    }

    dijkstra(start, goal) {
        const pq      = [[0.0, start, [start]]];
        const bestDist = new Map([[start, 0.0]]);
        const visited  = new Set();
        const explored = [];

        while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0]);
            const [dist, node, path] = pq.shift();
            if (visited.has(node)) continue;
            visited.add(node);
            explored.push(node);
            if (node === goal) return { path, distance: dist, explored };

            for (const [nb, d] of this.graph.getNeighbors(node)) {
                const nd = dist + d;
                if (nd < (bestDist.get(nb) ?? Infinity)) {
                    bestDist.set(nb, nd);
                    pq.push([nd, nb, [...path, nb]]);
                }
            }
        }
        return { path: [], distance: Infinity, explored };
    }

    runAll(start, goal) {
        return {
            bfs:      this.bfs(start, goal),
            greedy:   this.greedyBestFirstSearch(start, goal),
            dijkstra: this.dijkstra(start, goal)
        };
    }
}

// ================================================================
// CANVAS VISUALIZATION (tidak berubah secara signifikan)
// ================================================================
function drawGraph(canvas, graph, path, explored) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#fafafa');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const mainEdges = graph.edgeInfo.filter(e => e.rute === "Jalur Utama");
    const altEdges  = graph.edgeInfo.filter(e => e.rute !== "Jalur Utama");

    altEdges.forEach(e  => drawEdge(ctx, graph, e, path, false));
    mainEdges.forEach(e => drawEdge(ctx, graph, e, path, true));

    const nodes = { start: null, goal: null, path: [], explored: [], unvisited: [] };
    for (const node of graph.allNodes()) {
        if (path.length > 0) {
            if      (node === path[0])              nodes.start = node;
            else if (node === path[path.length - 1]) nodes.goal  = node;
            else if (path.includes(node))            nodes.path.push(node);
            else if (explored.includes(node))        nodes.explored.push(node);
            else                                     nodes.unvisited.push(node);
        } else {
            nodes.unvisited.push(node);
        }
    }

    nodes.unvisited.forEach(n => drawNode(ctx, graph, n, '#E5E7EB', '#9CA3AF', 18));
    nodes.explored.forEach(n  => drawNode(ctx, graph, n, '#F3F4F6', '#6B7280', 19));
    nodes.path.forEach(n      => drawNode(ctx, graph, n, '#FBBF24', '#D97706', 21));
    if (nodes.goal)  drawNode(ctx, graph, nodes.goal,  '#EF4444', '#991B1B', 23);
    if (nodes.start) drawNode(ctx, graph, nodes.start, '#10B981', '#047857', 23);

    drawCanvasLegend(ctx, W, H, path.length > 0);
    drawCanvasStats(ctx, W, H, path, explored);
}

function drawEdge(ctx, graph, edge, path, isMain) {
    const [x1, y1] = graph.getPosition(edge.dari);
    const [x2, y2] = graph.getPosition(edge.ke);
    const inPath = path.length > 1 && isEdgeInPath(edge.dari, edge.ke, path);

    ctx.strokeStyle = inPath ? '#2563EB' : isMain ? '#D1D5DB' : '#E5E7EB';
    ctx.lineWidth   = inPath ? 6 : isMain ? 2 : 1.5;
    if (inPath) { ctx.shadowColor = 'rgba(37,99,235,0.3)'; ctx.shadowBlur = 8; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.shadowColor = 'transparent';

    if (isMain || inPath) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const text = `${edge.jarak.toFixed(1)}`;
        ctx.font = 'bold 10px Arial';
        const w = ctx.measureText(text).width;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx - w / 2 - 4, my - 9, w + 8, 14);
        ctx.fillStyle = inPath ? '#1E3A8A' : '#374151';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, mx, my);
    }
}

function drawNode(ctx, graph, node, fill, border, r) {
    const [x, y] = graph.getPosition(node);
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 5;
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0F172A'; ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.length > 8 ? node.substring(0, 7) + '.' : node, x, y);
}

function drawCanvasLegend(ctx, W, H, hasPath) {
    const lx = W - 210, ly = 15, lw = 195, lh = hasPath ? 145 : 100;
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, lw, lh);
    ctx.fillStyle = '#0F172A'; ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Legenda', lx + 10, ly + 15);

    const items = [
        { color: '#10B981', label: 'Titik Awal' },
        { color: '#EF4444', label: 'Titik Tujuan' },
        ...(hasPath ? [{ color: '#FBBF24', label: 'Dalam Rute' }] : []),
        { color: '#F3F4F6', border: '#6B7280', label: 'Dieksplorasi' },
        { color: '#E5E7EB', border: '#9CA3AF', label: 'Belum Dikunjungi' }
    ];

    let iy = ly + 35;
    for (const item of items) {
        ctx.fillStyle = item.color;
        ctx.beginPath(); ctx.arc(lx + 18, iy, 7, 0, 2 * Math.PI); ctx.fill();
        if (item.border) { ctx.strokeStyle = item.border; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.fillStyle = '#374151'; ctx.font = '10px Arial';
        ctx.fillText(item.label, lx + 32, iy);
        iy += 20;
    }
}

function drawCanvasStats(ctx, W, H, path, explored) {
    const sx = 10, sy = 10, sw = 170, sh = 85;
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = '#0F172A'; ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Statistik', sx + 10, sy + 15);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx + 10, sy + 25); ctx.lineTo(sx + sw - 10, sy + 25); ctx.stroke();

    const stats = [
        { label: 'Route Length:', value: path.length > 0 ? path.length : '-' },
        { label: 'Nodes Explored:', value: explored.length },
        { label: 'Status:', value: path.length > 0 ? 'Found ✓' : 'No Route' }
    ];
    let statY = sy + 38;
    for (const s of stats) {
        ctx.fillStyle = '#0F172A'; ctx.font = 'bold 9px Arial';
        ctx.fillText(s.label, sx + 10, statY);
        ctx.font = '9px Arial';
        ctx.fillStyle = path.length > 0 ? '#10B981' : '#6B7280';
        ctx.fillText(String(s.value), sx + 110, statY);
        statY += 16;
    }
}

// ================================================================
// MAP VISUALIZATION — Leaflet + OSRM road-snapping
// ================================================================
let routeMap     = null;
let mapMarkers   = [];
let mapPolylines = [];

/**
 * Inisialisasi Leaflet map SEKALI — menggunakan id="leafletMap" yang
 * sekarang hanya ada satu di index.html (di dalam #singleMapContainer)
 */
function initializeMap() {
    if (routeMap) return;

    routeMap = L.map('leafletMap', { zoomControl: true }).setView([3.45, 98.58], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(routeMap);

    // Tambahkan semua marker
    const graph = window._graph;
    for (const node of graph.allNodes()) {
        const [lat, lng] = graph.getCoordinates(node);
        const marker = L.marker([lat, lng], {
            icon: buildIcon('#CBD5E1', node),
            title: node
        })
        .bindPopup(`
            <strong>${node}</strong><br>
            <small>lat: ${lat.toFixed(5)}, lng: ${lng.toFixed(5)}</small>
        `)
        .addTo(routeMap);

        marker._nodeName = node;
        mapMarkers.push(marker);
    }
}

function buildIcon(color, label, emoji = '') {
    const display = emoji || label.substring(0, 2);
    return L.divIcon({
        className: '',
        html: `<div style="
            background:${color};width:34px;height:34px;border-radius:50%;
            border:2.5px solid #0F172A;display:flex;align-items:center;
            justify-content:center;color:#0F172A;font-weight:700;
            font-size:${emoji ? '16px' : '11px'};
            box-shadow:0 4px 10px rgba(0,0,0,0.3);">${display}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
}

/**
 * Ambil rute nyata dari OSRM (road-snapping otomatis).
 * Fallback ke garis lurus jika OSRM tidak dapat diakses.
 */
async function fetchOSRMRoute(coordPairs) {
    // coordPairs: array [[lat,lng], [lat,lng], ...]
    // OSRM pakai format lng,lat
    const coords = coordPairs.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM HTTP error ' + res.status);
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('OSRM no route found');
        }
        // GeoJSON coordinates: [lng, lat] → balik ke [lat, lng] untuk Leaflet
        return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    } catch (err) {
        console.warn('OSRM tidak dapat diakses, menggunakan garis lurus:', err.message);
        return null; // sinyal fallback
    }
}

async function drawRouteOnMap(graph, path, explored) {
    if (!routeMap) initializeMap();

    // Hapus semua layer rute sebelumnya
    mapPolylines.forEach(p => p.remove());
    mapPolylines = [];

    // Update warna marker
    for (const marker of mapMarkers) {
        const node = marker._nodeName;
        let color = '#CBD5E1', emoji = '';
        if (path.length > 0) {
            if      (node === path[0])               { color = '#10B981'; emoji = '📍'; }
            else if (node === path[path.length - 1]) { color = '#EF4444'; emoji = '🎯'; }
            else if (path.includes(node))            { color = '#FBBF24'; }
            else if (explored.includes(node))        { color = '#E5E7EB'; }
        }
        marker.setIcon(buildIcon(color, node, emoji));
    }

    // Gambar semua edge sebagai garis tipis di background
    for (const edge of graph.edgeInfo) {
        const inPath = isEdgeInPath(edge.dari, edge.ke, path);
        if (!inPath) {
            const [lat1, lng1] = graph.getCoordinates(edge.dari);
            const [lat2, lng2] = graph.getCoordinates(edge.ke);
            const line = L.polyline([[lat1, lng1], [lat2, lng2]], {
                color: '#CBD5E1', weight: 2, opacity: 0.35
            }).addTo(routeMap);
            mapPolylines.push(line);
        }
    }

    // Gambar rute utama menggunakan OSRM
    if (path.length > 1) {
        const coordPairs = path.map(node => graph.getCoordinates(node));

        // Tampilkan loading indicator sementara fetch OSRM
        const loadingLine = L.polyline(coordPairs, {
            color: '#93C5FD', weight: 4, opacity: 0.5, dashArray: '8 6'
        }).addTo(routeMap);
        mapPolylines.push(loadingLine);

        const osrmCoords = await fetchOSRMRoute(coordPairs);

        // Hapus loading line
        loadingLine.remove();
        mapPolylines = mapPolylines.filter(p => p !== loadingLine);

        if (osrmCoords) {
            // Rute mengikuti jalan asli OSM
            const routeLine = L.polyline(osrmCoords, {
                color: '#2563EB', weight: 6, opacity: 0.85,
                lineJoin: 'round', lineCap: 'round'
            }).addTo(routeMap);

            // Garis bayangan untuk efek visual
            const shadowLine = L.polyline(osrmCoords, {
                color: '#1E3A8A', weight: 10, opacity: 0.25
            }).addTo(routeMap);

            mapPolylines.push(shadowLine, routeLine);

            // Fit bounds ke rute OSRM
            routeMap.fitBounds(routeLine.getBounds(), { padding: [60, 60], maxZoom: 13 });

        } else {
            // Fallback: garis lurus antar node
            const fallbackLine = L.polyline(coordPairs, {
                color: '#2563EB', weight: 5, opacity: 0.8, dashArray: '10 6'
            }).addTo(routeMap);
            mapPolylines.push(fallbackLine);

            const group = new L.featureGroup(
                mapMarkers.filter(m => path.includes(m._nodeName))
            );
            routeMap.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });

            // Tampilkan warning
            const warn = L.popup()
                .setLatLng(routeMap.getCenter())
                .setContent('<b>⚠️ Mode Offline:</b> Rute ditampilkan sebagai garis lurus.<br>Hubungkan ke internet untuk rute jalan asli via OSRM.')
                .openOn(routeMap);
            setTimeout(() => routeMap.closePopup(warn), 5000);
        }
    }
}

// ================================================================
// UTILITIES
// ================================================================
function isEdgeInPath(a, b, path) {
    for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === a && path[i+1] === b) || (path[i] === b && path[i+1] === a)) {
            return true;
        }
    }
    return false;
}

function createRouteTable(graph, path) {
    const tbody = document.getElementById('routeTableBody');
    tbody.innerHTML = '';
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dari = path[i], ke = path[i + 1];
        const d = graph.getEdgeDistance(dari, ke);
        total += d;
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td><td>${dari}</td><td>${ke}</td>
                <td>${d.toFixed(2)}</td><td>${total.toFixed(2)}</td>
            </tr>`;
    }
}

function showExplorationOrder(explored) {
    document.getElementById('explorationOrder').textContent = explored.join(' → ');
}

function resizeAllCanvases() {
    ['graphCanvas', 'comparisonCanvas'].forEach(id => {
        const c = document.getElementById(id);
        if (c && c.parentElement && c.parentElement.offsetWidth > 0) {
            const w = Math.min(c.parentElement.offsetWidth - 30, 900);
            c.width = w; c.style.width = w + 'px';
        }
    });
}

// ================================================================
// TAB SWITCHING
// Sekarang menggunakan data-target="single"|"compare" agar tidak
// tercampur antara tab di single-result dan comparison-result
// ================================================================
function setupTabSwitching() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.viz-tab-btn');
        if (!btn) return;

        const target = btn.dataset.target; // "single" atau "compare"
        const tab    = btn.dataset.tab;    // "canvas" atau "map"

        // Update button aktif dalam grup yang sama
        const siblingBtns = btn.closest('.visualization-tabs')
            .querySelectorAll('.viz-tab-btn');
        siblingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (target === 'single') {
            const canvas = document.getElementById('singleCanvasContainer');
            const map    = document.getElementById('singleMapContainer');
            if (tab === 'canvas') {
                canvas.style.display = 'block';
                map.style.display    = 'none';
                setTimeout(resizeAllCanvases, 50);
            } else {
                canvas.style.display = 'none';
                map.style.display    = 'block';
                if (routeMap) setTimeout(() => routeMap.invalidateSize(), 150);
            }
        } else if (target === 'compare') {
            const canvas = document.getElementById('compareCanvasContainer');
            const map    = document.getElementById('compareMapContainer');
            if (tab === 'canvas') {
                canvas.style.display = 'block';
                map.style.display    = 'none';
                setTimeout(resizeAllCanvases, 50);
            } else {
                canvas.style.display = 'none';
                map.style.display    = 'block';
                // Pindahkan div#leafletMap ke sini jika belum ada
                const leafletDiv = document.getElementById('leafletMap');
                const placeholder = document.getElementById('compareMapPlaceholder');
                if (leafletDiv && !map.contains(leafletDiv)) {
                    if (placeholder) placeholder.style.display = 'none';
                    map.appendChild(leafletDiv);
                    leafletDiv.style.display = 'block';
                    leafletDiv.style.height  = '100%';
                }
                if (routeMap) setTimeout(() => routeMap.invalidateSize(), 150);
            }
        }
    });
}

// ================================================================
// UI: SHOW RESULTS
// ================================================================
function showSingleResult(graph, result, algoName, algoDesc) {
    document.getElementById('singleResultDiv').style.display     = 'block';
    document.getElementById('comparisonResultDiv').style.display = 'none';
    document.getElementById('resultsSection').style.display      = 'block';
    document.getElementById('infoSection').style.display         = 'none';

    const { path, distance, explored } = result;

    document.getElementById('algoTitle').textContent       = `Hasil: ${algoName}`;
    document.getElementById('algoDesc').textContent        = algoDesc;
    document.getElementById('totalDistance').textContent   = distance === Infinity ? '∞' : `${distance.toFixed(2)} km`;
    document.getElementById('numNodesRoute').textContent   = path.length > 0 ? `${path.length} lokasi` : '-';
    document.getElementById('nodesExplored').textContent   = `${explored.length} node`;
    document.getElementById('routePath').textContent       = path.length > 0 ? path.join(' → ') : 'Tidak ditemukan';

    if (path.length > 0) { createRouteTable(graph, path); showExplorationOrder(explored); }

    // Reset tab ke canvas
    document.querySelectorAll('#singleVizTabs .viz-tab-btn').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
    });
    document.getElementById('singleCanvasContainer').style.display = 'block';
    document.getElementById('singleMapContainer').style.display    = 'none';

    setTimeout(() => {
        resizeAllCanvases();
        const c = document.getElementById('graphCanvas');
        if (c) drawGraph(c, graph, path, explored);
    }, 50);

    // Pastikan leafletMap ada di singleMapContainer
    const leafletDiv = document.getElementById('leafletMap');
    const singleMapCont = document.getElementById('singleMapContainer');
    if (leafletDiv && !singleMapCont.contains(leafletDiv)) {
        singleMapCont.appendChild(leafletDiv);
        leafletDiv.style.display = 'block';
        leafletDiv.style.height  = '100%';
    }

    drawRouteOnMap(graph, path, explored);
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function showComparisonResult(graph, results) {
    document.getElementById('singleResultDiv').style.display     = 'none';
    document.getElementById('comparisonResultDiv').style.display = 'block';
    document.getElementById('resultsSection').style.display      = 'block';
    document.getElementById('infoSection').style.display         = 'none';

    const { bfs, greedy, dijkstra } = results;

    document.getElementById('bfs-distance').textContent     = bfs.distance === Infinity     ? '∞' : `${bfs.distance.toFixed(2)} km`;
    document.getElementById('bfs-explored').textContent     = `${bfs.explored.length} nodes`;
    document.getElementById('greedy-distance').textContent  = greedy.distance === Infinity  ? '∞' : `${greedy.distance.toFixed(2)} km`;
    document.getElementById('greedy-explored').textContent  = `${greedy.explored.length} nodes`;
    document.getElementById('dijkstra-distance').textContent= dijkstra.distance === Infinity? '∞' : `${dijkstra.distance.toFixed(2)} km`;
    document.getElementById('dijkstra-explored').textContent= `${dijkstra.explored.length} nodes`;

    const tbody = document.getElementById('comparisonTableBody');
    tbody.innerHTML = [['BFS', bfs], ['Greedy', greedy], ['Dijkstra', dijkstra]].map(([name, r]) =>
        `<tr>
            <td>${name}</td>
            <td>${r.path.length > 0 ? r.path.join(' → ') : 'Tidak ditemukan'}</td>
            <td>${r.distance === Infinity ? '∞' : r.distance.toFixed(2)}</td>
            <td>${r.path.length}</td>
            <td>${r.explored.length}</td>
        </tr>`
    ).join('');

    document.getElementById('optimalRouteBox').textContent = dijkstra.path.length > 0
        ? `${dijkstra.path.join(' → ')} (${dijkstra.distance.toFixed(2)} km)` : 'Tidak ditemukan';

    // Reset tab ke canvas
    document.querySelectorAll('#compareVizTabs .viz-tab-btn').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
    });
    document.getElementById('compareCanvasContainer').style.display = 'block';
    document.getElementById('compareMapContainer').style.display    = 'none';

    setTimeout(() => {
        resizeAllCanvases();
        const c = document.getElementById('comparisonCanvas');
        if (c) drawGraph(c, graph, dijkstra.path, dijkstra.explored);
    }, 50);

    // Pastikan map ada di singleMapContainer (default home untuk leafletMap)
    const leafletDiv  = document.getElementById('leafletMap');
    const singleMapCont = document.getElementById('singleMapContainer');
    if (leafletDiv && !singleMapCont.contains(leafletDiv)) {
        singleMapCont.appendChild(leafletDiv);
    }

    drawRouteOnMap(graph, dijkstra.path, dijkstra.explored);
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ================================================================
// INIT
// ================================================================
const graph      = new RouteGraph();
const algorithms = new SearchAlgorithms(graph);
window._graph    = graph; // Referensi global untuk initializeMap

setupTabSwitching();

const algoDesc = {
    bfs:      "BFS mengecek node melebar lapis demi lapis. Complete tapi tidak optimal untuk weighted graph.",
    greedy:   "Greedy Best-First menggunakan heuristik untuk memandu pencarian. Cepat tapi bisa suboptimal.",
    dijkstra: "Dijkstra menjamin rute terpendek dengan biaya akumulatif terendah. Digunakan di GPS profesional."
};

document.getElementById('analyzeBtn').addEventListener('click', () => {
    const start = document.getElementById('startNode').value;
    const goal  = document.getElementById('goalNode').value;
    const algo  = document.querySelector('input[name="algorithm"]:checked').value;

    if (start === goal) { alert('Titik awal dan tujuan tidak boleh sama!'); return; }

    if (algo === 'compare') {
        showComparisonResult(graph, algorithms.runAll(start, goal));
    } else {
        const fn   = { bfs: 'bfs', greedy: 'greedyBestFirstSearch', dijkstra: 'dijkstra' }[algo];
        const name = { bfs: 'BFS', greedy: 'Greedy Best-First Search', dijkstra: 'Dijkstra' }[algo];
        showSingleResult(graph, algorithms[fn](start, goal), name, algoDesc[algo]);
    }
});

window.addEventListener('resize', resizeAllCanvases);
window.addEventListener('load', () => { resizeAllCanvases(); });

console.log('✓ Route Finder loaded — nodes:', graph.allNodes().length, '| edges:', graph.edgeInfo.length);
console.log('Node coordinates:');
graph.allNodes().forEach(n => {
    const [lat, lng] = graph.getCoordinates(n);
    console.log(`  ${n}: lat=${lat}, lng=${lng}`);
});
        }
        if (!this.graph.has(ke)) {
            this.graph.set(ke, []);
        }

        this.graph.get(dari).push([ke, jarak]);
        this.graph.get(ke).push([dari, jarak]);
        this.edgeInfo.push({ dari, ke, jarak, rute });
    }

    buildGraph() {
        // Jalur utama Medan - Berastagi (realistic main route)
        this.addEdge("Medan", "Padang Bulan", 7.50, "Jalur Utama");
        this.addEdge("Padang Bulan", "Simpang Selayang", 6.00, "Jalur Utama");
        this.addEdge("Simpang Selayang", "Tuntuntan", 5.50, "Jalur Utama");
        this.addEdge("Tuntuntan", "Pancur Batu", 9.80, "Jalur Utama");
        this.addEdge("Pancur Batu", "Rumah Sumbul", 8.50, "Jalur Utama");
        this.addEdge("Rumah Sumbul", "Sembahe", 5.20, "Jalur Utama");
        this.addEdge("Sembahe", "Sibolangit", 7.80, "Jalur Utama");
        this.addEdge("Sibolangit", "Bandar Baru", 6.50, "Jalur Utama");
        this.addEdge("Bandar Baru", "Berastagi", 8.90, "Jalur Utama");

        // Alternatif dengan Lau Debuk-debuk dan Penatapan
        this.addEdge("Medan", "Tuntuntan", 15.00, "Alternatif Tuntuntan");
        this.addEdge("Tuntuntan", "Pancur Batu", 9.80, "Alternatif Tuntuntan");
        this.addEdge("Pancur Batu", "Sibolangit", 22.00, "Alternatif Tuntuntan");
        this.addEdge("Sibolangit", "Bandar Baru", 6.50, "Alternatif Tuntuntan");
        this.addEdge("Bandar Baru", "Berastagi", 8.90, "Alternatif Tuntuntan");

        // Heuristik untuk Greedy (distance to Berastagi)
        this.heuristic.set("Medan", 64.0);
        this.heuristic.set("Padang Bulan", 56.0);
        this.heuristic.set("Simpang Selayang", 50.0);
        this.heuristic.set("Tuntuntan", 44.0);
        this.heuristic.set("Pancur Batu", 34.0);
        this.heuristic.set("Rumah Sumbul", 26.0);
        this.heuristic.set("Sembahe", 20.0);
        this.heuristic.set("Sibolangit", 15.0);
        this.heuristic.set("Bandar Baru", 8.90);
        this.heuristic.set("Berastagi", 0.0);

        // Posisi visual untuk canvas (improved layout - main route)
        this.positions.set("Medan", [80, 300]);
        this.positions.set("Padang Bulan", [150, 290]);
        this.positions.set("Simpang Selayang", [220, 280]);
        this.positions.set("Tuntuntan", [290, 270]);
        this.positions.set("Pancur Batu", [360, 260]);
        this.positions.set("Rumah Sumbul", [430, 250]);
        this.positions.set("Sembahe", [500, 240]);
        this.positions.set("Sibolangit", [570, 230]);
        this.positions.set("Bandar Baru", [640, 220]);
        this.positions.set("Berastagi", [710, 210]);

        // GPS Coordinates untuk Map (Accurate coordinates Medan-Berastagi route)
        this.coordinates.set("Medan", [3.1957, 98.6722]);
        this.coordinates.set("Padang Bulan", [3.1853, 98.6333]);
        this.coordinates.set("Simpang Selayang", [3.1822, 98.5858]);
        this.coordinates.set("Tuntuntan", [3.1673, 98.5308]);
        this.coordinates.set("Pancur Batu", [3.1488, 98.4982]);
        this.coordinates.set("Rumah Sumbul", [3.1307, 98.4595]);
        this.coordinates.set("Sembahe", [3.1192, 98.4302]);
        this.coordinates.set("Sibolangit", [3.0905, 98.3858]);
        this.coordinates.set("Bandar Baru", [3.0640, 98.3533]);
        this.coordinates.set("Berastagi", [3.0964, 98.3133]);
    }

    getNeighbors(node) {
        return this.graph.get(node) || [];
    }

    getHeuristic(node) {
        return this.heuristic.get(node) || Infinity;
    }

    getPosition(node) {
        return this.positions.get(node) || [0, 0];
    }

    allNodes() {
        const nodes = Array.from(this.graph.keys());
        return nodes.sort((a, b) => {
            if (a === "Medan") return -1;
            if (b === "Medan") return 1;
            if (a === "Berastagi") return -1;
            if (b === "Berastagi") return 1;
            return a.localeCompare(b);
        });
    }

    getEdgeDistance(a, b) {
        const neighbors = this.getNeighbors(a);
        for (let [neighbor, distance] of neighbors) {
            if (neighbor === b) return distance;
        }
        return Infinity;
    }

    getCoordinates(node) {
        return this.coordinates.get(node) || [0, 0];
    }
}

/**
 * CLASS: SearchAlgorithms
 * Implements BFS, Greedy, and Dijkstra
 */
class SearchAlgorithms {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * BFS - Breadth First Search
     */
    bfs(start, goal) {
        const queue = [[start, [start], 0.0]];
        const visited = new Set([start]);
        const exploredOrder = [];

        while (queue.length > 0) {
            const [node, path, distance] = queue.shift();
            exploredOrder.push(node);

            if (node === goal) {
                return { path, distance, explored: exploredOrder };
            }

            const neighbors = this.graph.getNeighbors(node);
            for (const [neighbor, edgeDistance] of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, [...path, neighbor], distance + edgeDistance]);
                }
            }
        }

        return { path: [], distance: Infinity, explored: exploredOrder };
    }

    /**
     * Greedy Best-First Search
     */
    greedyBestFirstSearch(start, goal) {
        const pq = [[this.graph.getHeuristic(start), start, [start], 0.0]];
        const visited = new Set();
        const exploredOrder = [];

        while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0]);
            const [_, node, path, distance] = pq.shift();

            if (visited.has(node)) continue;
            visited.add(node);
            exploredOrder.push(node);

            if (node === goal) {
                return { path, distance, explored: exploredOrder };
            }

            const neighbors = this.graph.getNeighbors(node);
            for (const [neighbor, edgeDistance] of neighbors) {
                if (!visited.has(neighbor)) {
                    const heuristic = this.graph.getHeuristic(neighbor);
                    pq.push([heuristic, neighbor, [...path, neighbor], distance + edgeDistance]);
                }
            }
        }

        return { path: [], distance: Infinity, explored: exploredOrder };
    }

    /**
     * Dijkstra Algorithm
     */
    dijkstra(start, goal) {
        const pq = [[0.0, start, [start]]];
        const bestDistance = new Map();
        bestDistance.set(start, 0.0);
        const visited = new Set();
        const exploredOrder = [];

        while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0]);
            const [distance, node, path] = pq.shift();

            if (visited.has(node)) continue;
            visited.add(node);
            exploredOrder.push(node);

            if (node === goal) {
                return { path, distance, explored: exploredOrder };
            }

            const neighbors = this.graph.getNeighbors(node);
            for (const [neighbor, edgeDistance] of neighbors) {
                const newDistance = distance + edgeDistance;
                if (newDistance < (bestDistance.get(neighbor) || Infinity)) {
                    bestDistance.set(neighbor, newDistance);
                    pq.push([newDistance, neighbor, [...path, neighbor]]);
                }
            }
        }

        return { path: [], distance: Infinity, explored: exploredOrder };
    }

    runAll(start, goal) {
        return {
            bfs: this.bfs(start, goal),
            greedy: this.greedyBestFirstSearch(start, goal),
            dijkstra: this.dijkstra(start, goal)
        };
    }
}

// ================================================================
// VISUALIZATION
// ================================================================

function drawGraph(canvas, graph, path, explored, algorithm) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#fafafa');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // ===== DRAW EDGES FIRST (Behind nodes) =====
    const edgesByType = {
        mainRoute: [],
        alternative: []
    };

    // Categorize edges
    for (const edge of graph.edgeInfo) {
        if (edge.rute === "Jalur Utama") {
            edgesByType.mainRoute.push(edge);
        } else {
            edgesByType.alternative.push(edge);
        }
    }

    // Draw alternative routes first (lighter)
    for (const edge of edgesByType.alternative) {
        drawEdge(ctx, graph, edge, path, false);
    }

    // Draw main route (darker)
    for (const edge of edgesByType.mainRoute) {
        drawEdge(ctx, graph, edge, path, true);
    }

    // ===== DRAW NODES =====
    // Group nodes by state
    const nodesByState = {
        start: null,
        goal: null,
        path: [],
        explored: [],
        unvisited: []
    };

    for (const node of graph.allNodes()) {
        if (path.length > 0) {
            if (node === path[0]) {
                nodesByState.start = node;
            } else if (node === path[path.length - 1]) {
                nodesByState.goal = node;
            } else if (path.includes(node)) {
                nodesByState.path.push(node);
            } else if (explored.includes(node)) {
                nodesByState.explored.push(node);
            } else {
                nodesByState.unvisited.push(node);
            }
        } else {
            nodesByState.unvisited.push(node);
        }
    }

    // Draw unvisited nodes first
    for (const node of nodesByState.unvisited) {
        drawNode(ctx, graph, node, '#E5E7EB', '#9CA3AF', 18);
    }

    // Draw explored nodes
    for (const node of nodesByState.explored) {
        drawNode(ctx, graph, node, '#F3F4F6', '#6B7280', 19);
    }

    // Draw path nodes
    for (const node of nodesByState.path) {
        drawNode(ctx, graph, node, '#FBBF24', '#D97706', 21);
    }

    // Draw goal node
    if (nodesByState.goal) {
        drawNode(ctx, graph, nodesByState.goal, '#EF4444', '#991B1B', 23);
    }

    // Draw start node
    if (nodesByState.start) {
        drawNode(ctx, graph, nodesByState.start, '#10B981', '#047857', 23);
    }

    // ===== DRAW LEGEND =====
    drawCanvasLegend(ctx, width, height, path.length > 0);

    // ===== DRAW STATISTICS =====
    drawCanvasStats(ctx, width, height, path, explored);
}

function drawEdge(ctx, graph, edge, path, isMainRoute) {
    const [x1, y1] = graph.getPosition(edge.dari);
    const [x2, y2] = graph.getPosition(edge.ke);

    const isPathEdge = path.length > 1 && isEdgeInPath(edge.dari, edge.ke, path);

    // Edge styling
    if (isPathEdge) {
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 6;
    } else if (isMainRoute) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 2;
    } else {
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1.5;
    }

    // Draw shadow for path edges
    if (isPathEdge) {
        ctx.shadowColor = 'rgba(37, 99, 235, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Draw edge label (distance)
    if (isMainRoute || isPathEdge) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        const text = `${edge.jarak.toFixed(1)}`;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        const metrics = ctx.measureText(text);
        
        // Background for text
        ctx.fillRect(midX - metrics.width / 2 - 4, midY - 9, metrics.width + 8, 14);
        
        // Text
        ctx.fillStyle = isPathEdge ? '#1E3A8A' : '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY);
    }
}

function drawNode(ctx, graph, node, fillColor, borderColor, radius) {
    const [x, y] = graph.getPosition(node);

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Draw circle
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Truncate long names
    let displayName = node;
    if (node.length > 8) {
        displayName = node.substring(0, 7) + '.';
    }
    ctx.fillText(displayName, x, y);
}

function drawCanvasLegend(ctx, width, height, hasPath) {
    const legendX = width - 210;
    const legendY = 15;
    const legendWidth = 195;
    const legendHeight = hasPath ? 145 : 100;

    // Legend background with border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Legend', legendX + 10, legendY + 18);

    // Divider line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(legendX + 10, legendY + 25);
    ctx.lineTo(legendX + legendWidth - 10, legendY + 25);
    ctx.stroke();

    // Legend items
    const items = hasPath ? [
        { color: '#10B981', label: 'Start', border: '#047857' },
        { color: '#EF4444', label: 'Goal', border: '#991B1B' },
        { color: '#FBBF24', label: 'Path', border: '#D97706' },
        { color: '#F3F4F6', label: 'Explored', border: '#6B7280' },
        { color: '#E5E7EB', label: 'Unvisited', border: '#9CA3AF' }
    ] : [
        { color: '#E5E7EB', label: 'Not Explored', border: '#9CA3AF' }
    ];

    let itemY = legendY + 35;
    for (const item of items) {
        // Circle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + 15, itemY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = item.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#0F172A';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, legendX + 28, itemY + 2);

        itemY += 18;
    }
}

function drawCanvasStats(ctx, width, height, path, explored) {
    const statsX = 15;
    const statsY = 15;
    const statsWidth = 180;
    const statsHeight = 90;

    // Stats background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.fillRect(statsX, statsY, statsWidth, statsHeight);
    
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(statsX, statsY, statsWidth, statsHeight);

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Statistics', statsX + 10, statsY + 18);

    // Divider
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(statsX + 10, statsY + 25);
    ctx.lineTo(statsX + statsWidth - 10, statsY + 25);
    ctx.stroke();

    // Stats items
    const stats = [
        { label: 'Route Length:', value: path.length > 0 ? path.length : '-' },
        { label: 'Nodes Explored:', value: explored.length },
        { label: 'Status:', value: path.length > 0 ? 'Found ✓' : 'No Route' }
    ];

    let statY = statsY + 35;
    for (const stat of stats) {
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(stat.label, statsX + 10, statY);

        ctx.font = '9px Arial';
        ctx.fillStyle = path.length > 0 ? '#10B981' : '#6B7280';
        ctx.fillText(stat.value, statsX + 100, statY);

        statY += 16;
    }
}

// Map visualization using Leaflet
let routeMap = null;
let mapMarkers = [];
let mapPolylines = [];

function initializeMap() {
    if (routeMap) return;

    // Initialize Leaflet map - centered at Medan (starting point)
    routeMap = L.map('leafletMap').setView([3.1957, 98.6722], 10);

    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(routeMap);

    // Custom icon
    const createCustomIcon = (color, label) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #0F172A; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">${label.substring(0, 2)}</label></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    };

    // Add markers for all nodes
    const graph = window.graph; // Global reference
    for (const node of graph.allNodes()) {
        const [lat, lng] = graph.getCoordinates(node);
        const marker = L.marker([lat, lng], {
            icon: createCustomIcon('#CBD5E1', node),
            title: node
        }).bindPopup(`<strong>${node}</strong>`).addTo(routeMap);

        marker.node = node;
        mapMarkers.push(marker);
    }

    console.log('Map initialized with', mapMarkers.length, 'markers');
}

function drawRouteOnMap(graph, path, explored) {
    if (!routeMap) initializeMap();

    // Clear previous polylines
    mapPolylines.forEach(poly => poly.remove());
    mapPolylines = [];

    // Update marker colors and styles
    mapMarkers.forEach(marker => {
        const node = marker.node;
        let color = '#CBD5E1';
        let label = node.substring(0, 2);
        
        if (path.length > 0) {
            if (node === path[0]) {
                color = '#10B981';
                label = '📍';
            } else if (node === path[path.length - 1]) {
                color = '#EF4444';
                label = '🎯';
            } else if (path.includes(node)) {
                color = '#FBBF24';
            } else if (explored.includes(node)) {
                color = '#E5E7EB';
            }
        }

        // Update marker appearance
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0F172A; display: flex; align-items: center; justify-content: center; color: #0F172A; font-weight: bold; font-size: 12px; text-shadow: 1px 1px 1px rgba(255,255,255,0.8);">${label}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        marker.setIcon(icon);
    });

    // Draw route polyline if path found
    if (path.length > 1) {
        const pathCoords = path.map(node => {
            const [lat, lng] = graph.getCoordinates(node);
            return [lat, lng];
        });

        const polyline = L.polyline(pathCoords, {
            color: '#2563EB',
            weight: 5,
            opacity: 0.8,
            dashArray: '5, 5',
            className: 'route-line'
        }).addTo(routeMap);

        mapPolylines.push(polyline);

        // Fit map to route with maxZoom to keep markers visible
        const group = new L.featureGroup([...mapMarkers.filter(m => path.includes(m.node))]);
        setTimeout(() => routeMap.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 11 }), 100);
    }

    // Draw all edges in light color
    for (const edge of graph.edgeInfo) {
        const isPathEdge = path.length > 1 && isEdgeInPath(edge.dari, edge.ke, path);
        if (!isPathEdge) {
            const [lat1, lng1] = graph.getCoordinates(edge.dari);
            const [lat2, lng2] = graph.getCoordinates(edge.ke);
            
            const edgeLine = L.polyline([[lat1, lng1], [lat2, lng2]], {
                color: '#CBD5E1',
                weight: 2,
                opacity: 0.4,
                className: 'graph-edge'
            }).addTo(routeMap);

            mapPolylines.push(edgeLine);
        }
    }
}

function isEdgeInPath(a, b, path) {
    for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) {
            return true;
        }
    }
    return false;
}

function createRouteTable(graph, path) {
    const tbody = document.getElementById('routeTableBody');
    tbody.innerHTML = '';

    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dari = path[i];
        const ke = path[i + 1];
        const distance = graph.getEdgeDistance(dari, ke);
        total += distance;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${dari}</td>
            <td>${ke}</td>
            <td>${distance.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    }
}

function showExplorationOrder(explored) {
    document.getElementById('explorationOrder').textContent = explored.join(' → ');
}

// ================================================================
// UI FUNCTIONS
// ================================================================

function showSingleResult(graph, result, algorithmName, algorithmDesc) {
    document.getElementById('singleResultDiv').style.display = 'block';
    document.getElementById('comparisonResultDiv').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('infoSection').style.display = 'none';

    const { path, distance, explored } = result;

    document.getElementById('algoTitle').textContent = `Hasil Analisis: ${algorithmName}`;
    document.getElementById('algoDesc').textContent = algorithmDesc;
    document.getElementById('totalDistance').textContent = distance === Infinity ? '∞' : `${distance.toFixed(2)} km`;
    document.getElementById('numNodesRoute').textContent = path.length > 0 ? `${path.length} lokasi` : '-';
    document.getElementById('nodesExplored').textContent = `${explored.length} node`;
    document.getElementById('routePath').textContent = path.length > 0 ? path.join(' → ') : 'Tidak ditemukan';

    if (path.length > 0) {
        createRouteTable(graph, path);
        showExplorationOrder(explored);
    }

    // Reset tab to canvas
    const tabBtns = document.querySelectorAll('.viz-tab-btn');
    tabBtns.forEach(b => b.classList.remove('active'));
    tabBtns[0].classList.add('active');
    
    document.querySelectorAll('.canvas-container').forEach(c => c.style.display = 'block');
    const leafletMapDiv = document.getElementById('leafletMap');
    if (leafletMapDiv) leafletMapDiv.style.display = 'none';

    // Resize and draw canvas
    setTimeout(() => {
        resizeAllCanvases();
        const canvas = document.getElementById('graphCanvas');
        if (canvas) drawGraph(canvas, graph, path, explored);
    }, 50);

    // Draw on map
    drawRouteOnMap(graph, path, explored);

    // Show visualization tabs
    document.getElementById('visualizationTabs').style.display = 'flex';

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function showComparisonResult(graph, results) {
    document.getElementById('singleResultDiv').style.display = 'none';
    document.getElementById('comparisonResultDiv').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('infoSection').style.display = 'none';

    const { bfs, greedy, dijkstra } = results;

    // Update comparison cards
    document.getElementById('bfs-distance').textContent = bfs.distance === Infinity ? '∞' : `${bfs.distance.toFixed(2)} km`;
    document.getElementById('bfs-explored').textContent = `${bfs.explored.length} nodes`;

    document.getElementById('greedy-distance').textContent = greedy.distance === Infinity ? '∞' : `${greedy.distance.toFixed(2)} km`;
    document.getElementById('greedy-explored').textContent = `${greedy.explored.length} nodes`;

    document.getElementById('dijkstra-distance').textContent = dijkstra.distance === Infinity ? '∞' : `${dijkstra.distance.toFixed(2)} km`;
    document.getElementById('dijkstra-explored').textContent = `${dijkstra.explored.length} nodes`;

    // Comparison table
    const tbody = document.getElementById('comparisonTableBody');
    tbody.innerHTML = `
        <tr>
            <td>BFS</td>
            <td>${bfs.path.length > 0 ? bfs.path.join(' → ') : 'Tidak ditemukan'}</td>
            <td>${bfs.distance === Infinity ? '∞' : bfs.distance.toFixed(2)}</td>
            <td>${bfs.path.length}</td>
            <td>${bfs.explored.length}</td>
        </tr>
        <tr>
            <td>Greedy</td>
            <td>${greedy.path.length > 0 ? greedy.path.join(' → ') : 'Tidak ditemukan'}</td>
            <td>${greedy.distance === Infinity ? '∞' : greedy.distance.toFixed(2)}</td>
            <td>${greedy.path.length}</td>
            <td>${greedy.explored.length}</td>
        </tr>
        <tr>
            <td>Dijkstra</td>
            <td>${dijkstra.path.length > 0 ? dijkstra.path.join(' → ') : 'Tidak ditemukan'}</td>
            <td>${dijkstra.distance === Infinity ? '∞' : dijkstra.distance.toFixed(2)}</td>
            <td>${dijkstra.path.length}</td>
            <td>${dijkstra.explored.length}</td>
        </tr>
    `;

    // Optimal route
    document.getElementById('optimalRouteBox').textContent = dijkstra.path.length > 0 
        ? `${dijkstra.path.join(' → ')} (${dijkstra.distance.toFixed(2)} km)`
        : 'Tidak ditemukan';

    // Reset tab to canvas
    const tabBtns = document.querySelectorAll('.viz-tab-btn');
    tabBtns.forEach(b => b.classList.remove('active'));
    tabBtns[0].classList.add('active');
    
    document.querySelectorAll('.canvas-container').forEach(c => c.style.display = 'block');
    const leafletMapDiv = document.getElementById('leafletMap');
    if (leafletMapDiv) leafletMapDiv.style.display = 'none';

    // Resize and draw canvas with Dijkstra (best result)
    setTimeout(() => {
        resizeAllCanvases();
        const canvas = document.getElementById('comparisonCanvas');
        if (canvas) drawGraph(canvas, graph, dijkstra.path, dijkstra.explored);
    }, 50);

    // Draw on map with Dijkstra (best result)
    drawRouteOnMap(graph, dijkstra.path, dijkstra.explored);

    // Show visualization tabs
    document.getElementById('visualizationTabs').style.display = 'flex';

    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ================================================================
// EVENT HANDLERS
// ================================================================

let graph = new RouteGraph();
let algorithms = new SearchAlgorithms(graph);
window.graph = graph; // Make global for map functions

const algoDescriptions = {
    bfs: "BFS (Breadth-First Search) mengecek node secara melebar lapis demi lapis. Metode ini Complete, tetapi tidak optimal untuk weighted graph karena mengabaikan bobot jarak.",
    greedy: "Greedy Best-First Search menggunakan fungsi heuristik untuk memandu pencarian. Prosesnya cepat, tetapi tidak Optimal dan bisa terjebak di jalur suboptimal.",
    dijkstra: "Dijkstra menjamin rute terpendek dengan menghitung biaya akumulatif terendah. Untuk graf berbobot, metode ini OPTIMAL dan digunakan di GPS profesional."
};

document.getElementById('analyzeBtn').addEventListener('click', () => {
    const startNode = document.getElementById('startNode').value;
    const goalNode = document.getElementById('goalNode').value;
    const algorithm = document.querySelector('input[name="algorithm"]:checked').value;

    if (startNode === goalNode) {
        alert('Titik awal dan tujuan tidak boleh sama!');
        return;
    }

    if (algorithm === 'compare') {
        const results = algorithms.runAll(startNode, goalNode);
        showComparisonResult(graph, results);
    } else {
        let result;
        let algoName;
        let algoDesc;

        switch (algorithm) {
            case 'bfs':
                result = algorithms.bfs(startNode, goalNode);
                algoName = 'BFS';
                algoDesc = algoDescriptions.bfs;
                break;
            case 'greedy':
                result = algorithms.greedyBestFirstSearch(startNode, goalNode);
                algoName = 'Greedy Best-First Search';
                algoDesc = algoDescriptions.greedy;
                break;
            case 'dijkstra':
                result = algorithms.dijkstra(startNode, goalNode);
                algoName = 'Dijkstra';
                algoDesc = algoDescriptions.dijkstra;
                break;
        }

        showSingleResult(graph, result, algoName, algoDesc);
    }
});

// Visualization tab switching
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.viz-tab-btn');
    const vizCanvases = document.querySelectorAll('.canvas-container');
    const vizMap = document.getElementById('leafletMap');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');

                // Update button styles
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Hide ALL visualizations first
                vizCanvases.forEach(canvas => canvas.style.display = 'none');
                if (vizMap) vizMap.style.display = 'none';

                // Show ONLY selected visualization
                if (tabName === 'canvas') {
                    vizCanvases.forEach(canvas => canvas.style.display = 'block');
                    // Trigger canvas resize
                    setTimeout(() => {
                        resizeAllCanvases();
                    }, 50);
                } else if (tabName === 'map') {
                    if (vizMap) {
                        vizMap.style.display = 'block';
                        // Trigger map resize after display
                        if (routeMap) {
                            setTimeout(() => routeMap.invalidateSize(), 100);
                        }
                    }
                }

                console.log('Visualization switched to:', tabName);
            });
        });
    }
});

// Ensure canvas is properly sized
window.addEventListener('resize', () => {
    resizeAllCanvases();
});

function resizeAllCanvases() {
    const canvas = document.getElementById('graphCanvas');
    if (canvas && canvas.parentElement && canvas.parentElement.offsetWidth > 0) {
        const parentWidth = canvas.parentElement.offsetWidth;
        const maxWidth = 900;
        const newWidth = Math.min(parentWidth - 30, maxWidth);
        canvas.width = newWidth;
        canvas.style.width = newWidth + 'px';
    }

    const comparisonCanvas = document.getElementById('comparisonCanvas');
    if (comparisonCanvas && comparisonCanvas.parentElement && comparisonCanvas.parentElement.offsetWidth > 0) {
        const parentWidth = comparisonCanvas.parentElement.offsetWidth;
        const maxWidth = 900;
        const newWidth = Math.min(parentWidth - 30, maxWidth);
        comparisonCanvas.width = newWidth;
        comparisonCanvas.style.width = newWidth + 'px';
    }
}

// Initialize canvas size
window.addEventListener('load', () => {
    resizeAllCanvases();
    console.log('Canvas initialized');
});

console.log('✓ Route Finder Application Loaded');
console.log('Graph nodes:', graph.allNodes().length);
console.log('Graph edges:', graph.edgeInfo.length);