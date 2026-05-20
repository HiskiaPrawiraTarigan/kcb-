"""
Aplikasi Web Perbandingan Algoritma Pencarian Rute
Studi kasus: Medan ke Berastagi
Algoritma: BFS, Greedy Best-First Search, dan Dijkstra
Framework: Streamlit

Catatan:
- Data jarak antar node adalah estimasi untuk kebutuhan simulasi graf berbobot.
- Posisi node pada visualisasi bukan koordinat GPS asli, melainkan layout agar graf mudah dibaca.
"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
import heapq
from typing import Dict, List, Optional, Set, Tuple

import math
import networkx as nx
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
import folium
from streamlit_folium import st_folium


# =========================================================
# PAGE CONFIG
# =========================================================
st.set_page_config(
    page_title="Route Finder Medan - Berastagi",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="expanded",
)


# =========================================================
# CUSTOM CSS
# =========================================================
st.markdown(
    """
    <style>
    .stApp {
        background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 45%, #f7fbff 100%);
    }

    .hero {
        padding: 34px 32px;
        border-radius: 28px;
        background: linear-gradient(135deg, #0f766e 0%, #2563eb 50%, #4f46e5 100%);
        color: white;
        box-shadow: 0 20px 55px rgba(37, 99, 235, 0.22);
        margin-bottom: 22px;
    }

    .hero h1 {
        margin: 0;
        font-size: 2.35rem;
        line-height: 1.15;
        font-weight: 900;
        letter-spacing: -0.03em;
    }

    .hero p {
        margin-top: 12px;
        margin-bottom: 0;
        max-width: 850px;
        font-size: 1.05rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .badge-row {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .badge {
        padding: 8px 13px;
        border-radius: 999px;
        background: rgba(255,255,255,0.16);
        border: 1px solid rgba(255,255,255,0.28);
        font-size: 0.88rem;
        font-weight: 700;
    }

    .soft-card {
        border-radius: 22px;
        padding: 20px 22px;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.07);
        margin-bottom: 14px;
    }

    .metric-card {
        border-radius: 20px;
        padding: 16px 18px;
        background: white;
        border: 1px solid rgba(148, 163, 184, 0.24);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
        min-height: 112px;
    }

    .metric-label {
        font-size: 0.82rem;
        color: #64748b;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .metric-value {
        font-size: 1.9rem;
        color: #0f172a;
        font-weight: 900;
        margin-top: 7px;
        line-height: 1.1;
    }

    .metric-help {
        color: #64748b;
        font-size: 0.86rem;
        margin-top: 4px;
    }

    .route-box {
        border-radius: 18px;
        padding: 16px 18px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e3a8a;
        font-weight: 800;
        line-height: 1.65;
    }

    .section-title {
        font-size: 1.28rem;
        font-weight: 900;
        color: #0f172a;
        margin: 4px 0 12px 0;
    }

    .note {
        padding: 14px 16px;
        border-radius: 16px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;
    }

    .small-muted {
        color: #64748b;
        font-size: 0.9rem;
    }

    div[data-testid="stSidebar"] {
        background: #ffffff;
        border-right: 1px solid rgba(148, 163, 184, 0.25);
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 3rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# =========================================================
# DATA MODEL
# =========================================================
@dataclass(frozen=True)
class Edge:
    dari: str
    ke: str
    jarak: float
    rute: str


class RouteGraph:
    def __init__(self) -> None:
        self.graph: Dict[str, List[Tuple[str, float]]] = defaultdict(list)
        self.edge_info: List[Edge] = []
        self.heuristic: Dict[str, float] = {}
        self.positions: Dict[str, Tuple[float, float]] = {}
        self.coordinates: Dict[str, Tuple[float, float]] = {}
        self._build_graph()

    def _add_edge(self, dari: str, ke: str, jarak: float, rute: str) -> None:
        self.graph[dari].append((ke, jarak))
        self.graph[ke].append((dari, jarak))
        self.edge_info.append(Edge(dari, ke, jarak, rute))

    def _build_graph(self) -> None:
        # Jalur utama Medan - Berastagi, total estimasi sekitar 57,07 km.
        self._add_edge("Medan", "Padang Bulan", 7.00, "Jalur Utama")
        self._add_edge("Padang Bulan", "Simpang Selayang", 3.50, "Jalur Utama")
        self._add_edge("Simpang Selayang", "Tuntungan", 4.00, "Jalur Utama")
        self._add_edge("Tuntungan", "Pancur Batu", 8.00, "Jalur Utama")
        self._add_edge("Pancur Batu", "Sembahe", 9.00, "Jalur Utama")
        self._add_edge("Sembahe", "Sibolangit", 7.00, "Jalur Utama")
        self._add_edge("Sibolangit", "Bandar Baru", 5.50, "Jalur Utama")
        self._add_edge("Bandar Baru", "Doulu", 4.00, "Jalur Utama")
        self._add_edge("Doulu", "Tongkoh", 3.00, "Jalur Utama")
        self._add_edge("Tongkoh", "Berastagi", 6.07, "Jalur Utama")

        # Alternatif Kutalimbaru
        self._add_edge("Medan", "Tuntungan", 16.00, "Alternatif Kutalimbaru")
        self._add_edge("Tuntungan", "Kutalimbaru", 13.00, "Alternatif Kutalimbaru")
        self._add_edge("Kutalimbaru", "Bandar Baru", 18.80, "Alternatif Kutalimbaru")

        # Jalur alternatif lain untuk membandingkan percabangan graf.
        self._add_edge("Medan", "Delitua", 12.00, "Alternatif Delitua-Namorambe")
        self._add_edge("Delitua", "Namorambe", 10.00, "Alternatif Delitua-Namorambe")
        self._add_edge("Namorambe", "Kutalimbaru", 21.00, "Alternatif Delitua-Namorambe")
        self._add_edge("Medan", "Patumbak", 11.00, "Alternatif Patumbak")
        self._add_edge("Patumbak", "Namorambe", 17.00, "Alternatif Patumbak")
        self._add_edge("Medan", "Sibiru-biru", 25.00, "Alternatif Sibiru-biru")
        self._add_edge("Sibiru-biru", "Talun Kenas", 22.00, "Alternatif Sibiru-biru")
        self._add_edge("Talun Kenas", "Bandar Baru", 19.00, "Alternatif Sibiru-biru")

        # Heuristik untuk Greedy Best-First Search. Semakin kecil, semakin dekat ke Berastagi.
        self.heuristic = {
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
            "Kutalimbaru": 31.0,
            "Delitua": 55.0,
            "Namorambe": 44.0,
            "Patumbak": 58.0,
            "Sibiru-biru": 40.0,
            "Talun Kenas": 38.0,
        }

        # Layout manual agar garis dan label tidak terlalu berantakan.
        self.positions = {
            "Medan": (0.00, 0.00),
            "Padang Bulan": (1.15, 0.80),
            "Simpang Selayang": (2.25, 0.80),
            "Tuntungan": (3.35, 0.10),
            "Pancur Batu": (4.55, 0.55),
            "Sembahe": (5.75, 0.92),
            "Sibolangit": (6.95, 1.22),
            "Bandar Baru": (8.15, 1.18),
            "Doulu": (9.05, 1.45),
            "Tongkoh": (9.95, 1.64),
            "Berastagi": (10.95, 1.82),
            "Kutalimbaru": (5.05, -0.96),
            "Delitua": (1.75, -1.24),
            "Namorambe": (3.45, -1.62),
            "Patumbak": (1.10, -2.05),
            "Sibiru-biru": (2.25, -3.02),
            "Talun Kenas": (5.75, -2.62),
        }
        
        # Koordinat asli (Latitude, Longitude) untuk peta satelit
        self.coordinates = {
            "Medan": (3.5952, 98.6722),
            "Padang Bulan": (3.5600, 98.6439),
            "Simpang Selayang": (3.5269, 98.6186),
            "Tuntungan": (3.5042, 98.6014),
            "Pancur Batu": (3.4984, 98.5714),
            "Sembahe": (3.3857, 98.5583),
            "Sibolangit": (3.3082, 98.5765),
            "Bandar Baru": (3.2750, 98.5528),
            "Doulu": (3.2185, 98.5401),
            "Tongkoh": (3.1973, 98.5366),
            "Berastagi": (3.1853, 98.5047),
            "Kutalimbaru": (3.4475, 98.5085),
            "Delitua": (3.4795, 98.6835),
            "Namorambe": (3.4542, 98.6508),
            "Patumbak": (3.5085, 98.7188),
            "Sibiru-biru": (3.4079, 98.7118),
            "Talun Kenas": (3.3644, 98.7410),
        }

    def neighbors(self, node: str) -> List[Tuple[str, float]]:
        return self.graph[node]

    def h(self, node: str) -> float:
        return self.heuristic.get(node, float("inf"))

    def all_nodes(self) -> List[str]:
        preferred = ["Medan", "Berastagi"]
        rest = sorted([node for node in self.graph.keys() if node not in preferred])
        return preferred + rest

    def edge_distance(self, a: str, b: str) -> float:
        for neighbor, distance in self.graph[a]:
            if neighbor == b:
                return distance
        return float("inf")


def draw_folium_satellite(route_graph: RouteGraph, path: List[str], current_explored: List[str], current_active: str = None) -> folium.Map:
    # Center map on Sembahe
    m = folium.Map(
        location=[3.3857, 98.5583], 
        zoom_start=10.5, 
        tiles='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
        attr='ESRI'
    )
    
    # Draw edges
    for node_a in route_graph.graph:
        for node_b, _ in route_graph.graph[node_a]:
            lat0, lon0 = route_graph.coordinates[node_a]
            lat1, lon1 = route_graph.coordinates[node_b]
            
            is_path_edge = False
            if path:
                for i in range(len(path) - 1):
                    if (node_a == path[i] and node_b == path[i+1]) or (node_b == path[i] and node_a == path[i+1]):
                        is_path_edge = True
                        break
            
            if is_path_edge:
                folium.PolyLine([(lat0, lon0), (lat1, lon1)], color='#3B82F6', weight=6, opacity=1).add_to(m)
            else:
                folium.PolyLine([(lat0, lon0), (lat1, lon1)], color='#94A3B8', weight=2.5, opacity=0.8).add_to(m)
                
    # Draw nodes
    for node in route_graph.all_nodes():
        lat, lon = route_graph.coordinates[node]
        color = '#FFFFFF'
        size = 6
        
        if path and node == path[0]:
            color = '#10B981'
            size = 9
        elif path and node == path[-1]:
            color = '#EF4444'
            size = 9
        elif current_active and node == current_active:
            color = '#A78BFA'
            size = 8
        elif path and node in path:
            color = '#FBBF24'
            size = 7
            
        folium.CircleMarker(
            location=[lat, lon],
            radius=size,
            color='#0F172A',
            weight=2,
            fill=True,
            fill_color=color,
            fill_opacity=1
        ).add_to(m)
        
        # Text Label using DivIcon
        folium.Marker(
            location=[lat, lon],
            icon=folium.DivIcon(
                icon_size=(150,36),
                icon_anchor=(0,0),
                html=f'<div style="font-size: 10pt; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; font-family: Arial Black; font-weight: bold; white-space: nowrap; margin-left: 10px; margin-top: -8px;">{node}</div>'
            )
        ).add_to(m)
        
    return m


# =========================================================
# ALGORITHMS
# =========================================================
class SearchAlgorithms:
    def __init__(self, route_graph: RouteGraph) -> None:
        self.g = route_graph

    def bfs(self, start: str, goal: str) -> Tuple[List[str], float, List[str]]:
        queue = deque([(start, [start], 0.0)])
        visited: Set[str] = {start}
        explored_order: List[str] = []

        while queue:
            node, path, distance = queue.popleft()
            explored_order.append(node)

            if node == goal:
                return path, distance, explored_order

            for neighbor, edge_distance in self.g.neighbors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor], distance + edge_distance))

        return [], float("inf"), explored_order

    def greedy_best_first_search(self, start: str, goal: str) -> Tuple[List[str], float, List[str]]:
        pq: List[Tuple[float, str, List[str], float]] = [(self.g.h(start), start, [start], 0.0)]
        visited: Set[str] = set()
        explored_order: List[str] = []

        while pq:
            _, node, path, distance = heapq.heappop(pq)
            if node in visited:
                continue

            visited.add(node)
            explored_order.append(node)

            if node == goal:
                return path, distance, explored_order

            for neighbor, edge_distance in self.g.neighbors(node):
                if neighbor not in visited:
                    heapq.heappush(pq, (self.g.h(neighbor), neighbor, path + [neighbor], distance + edge_distance))

        return [], float("inf"), explored_order

    def dijkstra(self, start: str, goal: str) -> Tuple[List[str], float, List[str]]:
        pq: List[Tuple[float, str, List[str]]] = [(0.0, start, [start])]
        best_distance: Dict[str, float] = {start: 0.0}
        visited: Set[str] = set()
        explored_order: List[str] = []

        while pq:
            distance, node, path = heapq.heappop(pq)
            if node in visited:
                continue

            visited.add(node)
            explored_order.append(node)

            if node == goal:
                return path, distance, explored_order

            for neighbor, edge_distance in self.g.neighbors(node):
                new_distance = distance + edge_distance
                if new_distance < best_distance.get(neighbor, float("inf")):
                    best_distance[neighbor] = new_distance
                    heapq.heappush(pq, (new_distance, neighbor, path + [neighbor]))

        return [], float("inf"), explored_order


# =========================================================
# VISUALIZATION HELPERS
# =========================================================
def build_networkx_graph(route_graph: RouteGraph) -> nx.Graph:
    graph = nx.Graph()
    for edge in route_graph.edge_info:
        graph.add_edge(edge.dari, edge.ke, weight=edge.jarak, route=edge.rute)
    return graph


def edge_in_path(edge: Tuple[str, str], path: List[str]) -> bool:
    a, b = edge
    return any((path[i] == a and path[i + 1] == b) or (path[i] == b and path[i + 1] == a) for i in range(len(path) - 1))


def draw_plotly_graph(
    route_graph: RouteGraph,
    path: Optional[List[str]],
    title: str,
    explored: Optional[List[str]] = None,
    active_step: Optional[int] = None
) -> go.Figure:
    pos = route_graph.positions
    explored = explored or []
    
    is_simulation = (active_step is not None)
    if is_simulation:
        current_explored = explored[:active_step]
        current_active = explored[active_step - 1] if active_step <= len(explored) else None
        show_path = (active_step == len(explored))
    else:
        current_explored = explored
        current_active = None
        show_path = True

    regular_edge_x = []
    regular_edge_y = []
    highlight_edge_x = []
    highlight_edge_y = []
    
    graph = build_networkx_graph(route_graph)
    
    for u, v, d in graph.edges(data=True):
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        
        # Calculate line shortening (margin) to stop exactly at the circle boundaries
        dx = x1 - x0
        dy = y1 - y0
        dist = math.hypot(dx, dy)
        margin = 0.35  # Adjust this value based on node size
        if dist > 2 * margin:
            ux, uy = dx / dist, dy / dist
            x0_line, y0_line = x0 + ux * margin, y0 + uy * margin
            x1_line, y1_line = x1 - ux * margin, y1 - uy * margin
        else:
            x0_line, y0_line, x1_line, y1_line = x0, y0, x1, y1
        
        is_highlight = False
        if show_path and path and edge_in_path((u, v), path):
            is_highlight = True
            
        if is_highlight:
            highlight_edge_x.extend([x0_line, x1_line, None])
            highlight_edge_y.extend([y0_line, y1_line, None])
        else:
            regular_edge_x.extend([x0_line, x1_line, None])
            regular_edge_y.extend([y0_line, y1_line, None])
            
    traces = []
    
    traces.append(go.Scatter(
        x=regular_edge_x, y=regular_edge_y,
        line=dict(width=2.0, color='#CBD5E1'),
        hoverinfo='none',
        mode='lines',
        name='Jalan Penghubung'
    ))
    
    if highlight_edge_x:
        traces.append(go.Scatter(
            x=highlight_edge_x, y=highlight_edge_y,
            line=dict(width=5.5, color='#2563EB'),
            hoverinfo='none',
            mode='lines',
            name='Jalur Rute Hasil'
        ))
        
    mid_x = []
    mid_y = []
    mid_text = []
    for u, v, d in graph.edges(data=True):
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        mx, my = (x0 + x1)/2.0, (y0 + y1)/2.0
        dist = d.get('weight', 0.0)
        rute_name = d.get('route', '')
        mid_x.append(mx)
        mid_y.append(my)
        mid_text.append(f"<b>Jalan:</b> {u} ↔ {v}<br><b>Jarak:</b> {dist:.2f} km<br><b>Kategori Rute:</b> {rute_name}")
        
    traces.append(go.Scatter(
        x=mid_x, y=mid_y,
        mode='markers',
        marker=dict(size=12, color='rgba(0,0,0,0)', symbol='circle'),
        text=mid_text,
        hoverinfo='text',
        name='Info Segmen',
        showlegend=False
    ))

    node_x = []
    node_y = []
    node_text = []
    node_color = []
    node_size = []
    node_symbol = []
    node_border_color = []
    node_border_width = []
    
    for node in graph.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        
        h_val = route_graph.h(node)
        
        color = '#FFFFFF'
        status = 'Belum Dikunjungi'
        size = 55
        border_color = '#0F172A'
        border_width = 1.5
        symbol = 'circle'
        
        if path and node == path[0]:
            color = '#10B981'
            status = '🟢 Titik Awal (Start)'
            size = 60
            border_width = 2.5
            symbol = 'circle'
        elif path and node == path[-1]:
            color = '#EF4444'
            status = '🔴 Titik Tujuan (Goal)'
            size = 60
            border_width = 2.5
            symbol = 'circle'
        elif current_active and node == current_active:
            color = '#A78BFA'
            status = '🧠 Sedang Dievaluasi (Active Front)'
            size = 60
            border_color = '#4C1D95'
            border_width = 3.0
            symbol = 'circle'
        elif show_path and path and node in path:
            color = '#FBBF24'
            status = '🟡 Bagian dari Rute Hasil'
            size = 58
            border_width = 2.0
        elif node in current_explored:
            color = '#FFFFFF'
            status = '🔵 Sudah Dieksplorasi (Visited)'
            size = 55
            border_width = 1.5
            
        node_color.append(color)
        node_size.append(size)
        node_symbol.append(symbol)
        node_border_color.append(border_color)
        node_border_width.append(border_width)
        
        node_text.append(
            f"<b>Lokasi:</b> {node}<br>"
            f"<b>Status:</b> {status}<br>"
            f"<b>Estimasi Heuristik:</b> {h_val} km"
        )
        
    traces.append(go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        marker=dict(
            showscale=False,
            color=node_color,
            size=node_size,
            symbol=node_symbol,
            line=dict(color=node_border_color, width=node_border_width)
        ),
        text=[f"<b>{n}</b>" for n in graph.nodes()],
        textposition="middle center",
        textfont=dict(size=9.5, color='#0F172A', family='system-ui, sans-serif'),
        hovertext=node_text,
        hoverinfo='text',
        name='Titik Rute'
    ))
    
    fig = go.Figure(data=traces)
    
    annotations = []
    for u, v, d in graph.edges(data=True):
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        mx, my = (x0 + x1)/2.0, (y0 + y1)/2.0
        dist = d.get('weight', 0.0)
        
        is_highlight = False
        if show_path and path and edge_in_path((u, v), path):
            is_highlight = True
            
        annotations.append(
            dict(
                x=mx, y=my,
                text=f"<b>{dist:.1f} km</b>",
                showarrow=False,
                font=dict(size=7.5, color='#334155' if not is_highlight else '#1E3A8A'),
                bgcolor='rgba(255, 255, 255, 0.90)',
                bordercolor='#CBD5E1' if not is_highlight else '#2563EB',
                borderwidth=1 if is_highlight else 0.5,
                borderpad=2.2
            )
        )
        
    fig.update_layout(
        title=dict(
            text=f"<b>{title}</b>",
            font=dict(size=16, family='system-ui, sans-serif', color='#0F172A'),
            x=0.5,
            y=0.97
        ),
        showlegend=False,
        hovermode='closest',
        margin=dict(b=5, l=10, r=10, t=30),
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[-0.8, 11.8]),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[-3.5, 2.3]),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        annotations=annotations,
        height=540
    )
    
    return fig


def draw_comparison_charts(results: Dict[str, Tuple[List[str], float, List[str]]]) -> go.Figure:
    algorithms = list(results.keys())
    distances = [results[algo][1] if results[algo][0] else 0.0 for algo in algorithms]
    explored_counts = [len(results[algo][2]) for algo in algorithms]
    
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=(
            "<b>Total Jarak Rute (km)</b><br><span style='font-size:10px; color:#64748b;'>Lebih kecil lebih baik</span>",
            "<b>Node Dieksplorasi (Efisiensi)</b><br><span style='font-size:10px; color:#64748b;'>Lebih sedikit lebih cepat</span>"
        ),
        horizontal_spacing=0.18
    )
    
    fig.add_trace(
        go.Bar(
            x=algorithms, y=distances,
            text=[f"<b>{d:.2f} km</b>" if d > 0 else "∞" for d in distances],
            textposition='auto',
            marker_color=['#3B82F6', '#F59E0B', '#10B981'],
            name='Jarak Total',
            showlegend=False
        ),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Bar(
            x=algorithms, y=explored_counts,
            text=[f"<b>{c} node</b>" for c in explored_counts],
            textposition='auto',
            marker_color=['#1D4ED8', '#D97706', '#047857'],
            name='Node Dieksplorasi',
            showlegend=False
        ),
        row=1, col=2
    )
    
    fig.update_layout(
        height=330,
        margin=dict(l=20, r=20, t=65, b=20),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#0F172A', family='system-ui, sans-serif')
    )
    
    fig.update_xaxes(showgrid=False, tickfont=dict(size=10.5, color='#475569', weight='bold'))
    fig.update_yaxes(showgrid=True, gridcolor='#E2E8F0', tickfont=dict(size=10, color='#64748b'))
    
    return fig


def path_detail_dataframe(route_graph: RouteGraph, path: List[str]) -> pd.DataFrame:
    rows = []
    total = 0.0
    for i in range(len(path) - 1):
        a, b = path[i], path[i + 1]
        distance = route_graph.edge_distance(a, b)
        total += distance
        rows.append(
            {
                "No": i + 1,
                "Dari": a,
                "Ke": b,
                "Jarak Segmen (km)": round(distance, 2),
                "Akumulasi (km)": round(total, 2),
            }
        )
    return pd.DataFrame(rows)


def algorithm_note(name: str) -> str:
    notes = {
        "BFS": "BFS (Un-informed Search) mengecek node secara melebar (lapis demi lapis). Metode ini Complete, tetapi mengabaikan bobot jarak sehingga tidak menjamin rute terpendek.",
        "Greedy Best-First Search": "Greedy (Informed Search) menggunakan fungsi heuristik (estimasi ke tujuan). Prosesnya cepat, tetapi tidak Optimal dan bisa terjebak di jalur suboptimal.",
        "Dijkstra": "Dijkstra (berprinsip sama dengan Uniform Cost Search) menghitung biaya total terendah. Untuk graf berbobot, metode ini menjamin rute terpendek yang Optimal.",
    }
    return notes[name]


def run_all_algorithms(algorithms: SearchAlgorithms, start: str, goal: str) -> Dict[str, Tuple[List[str], float, List[str]]]:
    return {
        "BFS": algorithms.bfs(start, goal),
        "Greedy Best-First Search": algorithms.greedy_best_first_search(start, goal),
        "Dijkstra": algorithms.dijkstra(start, goal),
    }


def metric_card(label: str, value: str, help_text: str = "") -> None:
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">{label}</div>
            <div class="metric-value">{value}</div>
            <div class="metric-help">{help_text}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def landing_page() -> None:
    st.markdown(
        """
        <div class="hero">
            <h1>🗺️ Route Finder Medan → Berastagi</h1>
            <p>
                Aplikasi visual untuk membandingkan algoritma BFS, Greedy Best-First Search, dan Dijkstra
                pada studi kasus pencarian rute Medan ke Berastagi.
            </p>
            <div class="badge-row">
                <span class="badge">BFS</span>
                <span class="badge">Greedy Best-First Search</span>
                <span class="badge">Dijkstra</span>
                <span class="badge">Visualisasi Graf</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown('<div class="soft-card">', unsafe_allow_html=True)
    st.markdown('<div class="section-title" style="text-align: center; margin-bottom: 20px;">Konfigurasi Simulasi</div>', unsafe_allow_html=True)
    
    # Instantiate graph just to get nodes for the dropdown
    route_graph = RouteGraph()
    nodes = route_graph.all_nodes()
    
    col1, col2, col3 = st.columns(3)
    with col1:
        start_node = st.selectbox("📍 Titik Awal", nodes, index=nodes.index("Medan"), key="init_start")
    with col2:
        goal_node = st.selectbox("🏁 Titik Tujuan", nodes, index=nodes.index("Berastagi"), key="init_goal")
    with col3:
        algo = st.selectbox("🧠 Algoritma", ["Dijkstra", "BFS", "Greedy Best-First Search", "Bandingkan Semua"], key="init_algo")

    st.write("")
    _, mid, _ = st.columns([1, 1.5, 1])
    with mid:
        if st.button("🚀 Mulai Analisis Rute", use_container_width=True, type="primary"):
            st.session_state.started = True
            st.session_state.start_node = start_node
            st.session_state.goal_node = goal_node
            st.session_state.selected_algo = algo
            st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)


# =========================================================
# MAIN UI
# =========================================================
def main() -> None:
    if "started" not in st.session_state:
        st.session_state.started = False

    if not st.session_state.started:
        landing_page()
        return

    route_graph = RouteGraph()
    algorithms = SearchAlgorithms(route_graph)

    st.markdown(
        """
        <div class="hero">
            <h1>🧭 Analisis Pencarian Rute</h1>
            <p>Pilih titik awal, tujuan, dan algoritma. Hasil rute akan divisualisasikan pada graf.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.sidebar.header("⚙️ Pengaturan Rute")
    nodes = route_graph.all_nodes()
    
    # Ambil nilai default dari landing page jika ada
    default_start = st.session_state.get("start_node", "Medan")
    default_goal = st.session_state.get("goal_node", "Berastagi")
    
    start = st.sidebar.selectbox("Titik awal", nodes, index=nodes.index(default_start))
    goal = st.sidebar.selectbox("Titik tujuan", nodes, index=nodes.index(default_goal))
    
    st.sidebar.subheader("🎨 Gaya Tampilan")
    viz_style = st.sidebar.selectbox(
        "Mode Tampilan",
        ["Graf Abstrak (Node)", "Peta Satelit (Real)"],
        index=0,
        help="Pilih peta satelit untuk melihat rute di atas peta asli."
    )
    
    algo_options = ["Dijkstra", "BFS", "Greedy Best-First Search", "Bandingkan Semua"]
    default_algo = st.session_state.get("selected_algo", "Dijkstra")
    
    selected_algorithm = st.sidebar.radio(
        "Pilih algoritma",
        algo_options,
        index=algo_options.index(default_algo)
    )

    with st.sidebar.expander("Keterangan warna graf"):
        st.write("🟢 Node awal")
        st.write("🔴 Node tujuan")
        st.write("🟡 Node rute hasil")
        st.write("🔵 Node yang dieksplorasi")
        st.write("🔷 Garis biru = jalur hasil")

    if st.sidebar.button("🏠 Kembali ke Halaman Awal", use_container_width=True):
        st.session_state.started = False
        st.rerun()

    if start == goal:
        st.warning("Titik awal dan tujuan tidak boleh sama. Silakan pilih tujuan yang berbeda.")
        return

    results = run_all_algorithms(algorithms, start, goal)

    if selected_algorithm != "Bandingkan Semua":
        path, distance, explored = results[selected_algorithm]

        st.markdown(f'<div class="section-title">Hasil Algoritma: {selected_algorithm}</div>', unsafe_allow_html=True)
        st.markdown(f'<div class="soft-card"><b>Penjelasan:</b> {algorithm_note(selected_algorithm)}</div>', unsafe_allow_html=True)

        col_m1, col_m2, col_m3 = st.columns(3)
        with col_m1:
            metric_card("Total Jarak", f"{distance:.2f} km" if path else "-", "Akumulasi bobot edge")
        with col_m2:
            metric_card("Jumlah Node Rute", f"{len(path)}" if path else "-", "Node yang dilalui")
        with col_m3:
            metric_card("Total Node Dieksplorasi", f"{len(explored)}", "Node yang diperiksa algoritma")

        if path:
            st.markdown(f'<div class="route-box">{ " → ".join(path) }</div>', unsafe_allow_html=True)
        else:
            st.error("Rute tidak ditemukan.")

        left, right = st.columns([1.8, 1], gap="large")
        with left:
            st.markdown('<div class="section-title">Visualisasi Graf</div>', unsafe_allow_html=True)
            if viz_style == "Peta Satelit (Real)":
                folium_m = draw_folium_satellite(route_graph, path, explored)
                st.components.v1.html(folium_m._repr_html_(), height=540)
            else:
                plotly_fig = draw_plotly_graph(
                    route_graph,
                    path,
                    f"Pencarian Rute - {selected_algorithm}",
                    explored
                )
                st.plotly_chart(plotly_fig, use_container_width=True)
            
            # Legenda visual cantik di halaman utama
            st.markdown(
                """
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 10px; margin-bottom: 20px;">
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #475569;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: #10B981; border-radius: 50%; border: 1px solid #0F172A;"></span> Titik Awal
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #475569;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: #EF4444; border-radius: 50%; border: 1px solid #0F172A;"></span> Titik Tujuan
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #475569;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: #FBBF24; border-radius: 50%; border: 1px solid #0F172A;"></span> Bagian dari Rute
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #475569;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; border: 1px solid #0F172A;"></span> Sudah Dieksplorasi
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 700; color: #475569;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; border: 1px solid #0F172A;"></span> Belum Dikunjungi
                    </span>
                </div>
                """,
                unsafe_allow_html=True
            )

        with right:
            st.markdown('<div class="section-title">Detail Pencarian</div>', unsafe_allow_html=True)
            if path:
                st.write("**Detail segmen:**")
                st.dataframe(path_detail_dataframe(route_graph, path), use_container_width=True, hide_index=True)
            st.write("**Urutan langkah dieksplorasi:**")
            st.code(" → ".join(explored) if explored else "Tidak ada")

    else:
        st.markdown('<div class="section-title">Perbandingan Efisiensi Semua Algoritma</div>', unsafe_allow_html=True)
        
        # Plotly Subplot Comparison Bar Charts
        st.markdown('<div class="soft-card">', unsafe_allow_html=True)
        comparison_chart = draw_comparison_charts(results)
        st.plotly_chart(comparison_chart, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown('<div class="section-title">Detail Metrik Perbandingan</div>', unsafe_allow_html=True)
        rows = []
        for name, (path, distance, explored) in results.items():
            rows.append(
                {
                    "Algoritma": name,
                    "Rute": " → ".join(path) if path else "Tidak ditemukan",
                    "Total Jarak (km)": round(distance, 2) if path else "∞",
                    "Jumlah Node Rute": len(path) if path else 0,
                    "Node Dieksplorasi": len(explored),
                    "Karakteristik": algorithm_note(name),
                }
            )

        df = pd.DataFrame(rows)
        st.dataframe(df, use_container_width=True, hide_index=True)

        dijkstra_path, dijkstra_distance, dijkstra_explored = results["Dijkstra"]
        st.success(f"Rute terpendek ditemukan oleh Dijkstra: {' → '.join(dijkstra_path)} dengan total {dijkstra_distance:.2f} km.")

        col1, col2 = st.columns([1.6, 1], gap="large")
        with col1:
            st.markdown('<div class="section-title">Graf Rute Terpendek (Dijkstra)</div>', unsafe_allow_html=True)
            if viz_style == "Peta Satelit (Real)":
                folium_m = draw_folium_satellite(route_graph, dijkstra_path, [])
                st.components.v1.html(folium_m._repr_html_(), height=400)
            else:
                fig = draw_plotly_graph(route_graph, dijkstra_path, "Rute Terpendek Menurut Dijkstra (Optimal)", dijkstra_explored)
                st.plotly_chart(fig, use_container_width=True)
        with col2:
            st.markdown('<div class="section-title">Analisis Karakteristik</div>', unsafe_allow_html=True)
            st.markdown(
                """
                <div class="soft-card">
                <b>Breadth-First Search (BFS) - <i>Un-informed Search</i></b>:<br>
                Mengecek node lapis demi lapis secara merata (merujuk Handout 3). BFS bersifat <i>Complete</i>, namun mengabaikan bobot kilometer sehingga tidak efisien dan tidak optimal untuk navigasi nyata berbobot.<br><br>
                <b>Greedy Best-First Search - <i>Informed Search</i></b>:<br>
                Menggunakan nilai heuristik (merujuk Handout 4). Memiliki waktu komputasi yang sangat cepat karena melompat ke node terdekat berdasarkan dugaan heuristik, tetapi bersifat <i>tidak optimal</i> (bisa terjebak di jalur suboptimal).<br><br>
                <b>Dijkstra - <i>Uniform Cost Search</i></b>:<br>
                Mengevaluasi akumulasi jarak dari titik awal (seperti <i>Uniform Cost Search</i> di Handout 3). Menjamin rute terpendek secara mutlak (<i>Optimal</i>) pada graf berbobot positif.
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.divider()
    tab1, tab2, tab3 = st.tabs(["📍 Data Jarak", "🧠 Heuristik Greedy", "📝 Catatan Laporan"])

    with tab1:
        edge_df = pd.DataFrame([edge.__dict__ for edge in route_graph.edge_info])
        edge_df = edge_df.rename(columns={"dari": "Dari", "ke": "Ke", "jarak": "Jarak (km)", "rute": "Keterangan Rute"})
        st.dataframe(edge_df, use_container_width=True, hide_index=True)

    with tab2:
        heuristic_df = pd.DataFrame(
            [{"Node": node, "Heuristik ke Berastagi": value} for node, value in sorted(route_graph.heuristic.items(), key=lambda item: item[1], reverse=True)]
        )
        st.dataframe(heuristic_df, use_container_width=True, hide_index=True)
        st.caption("Heuristik hanya perkiraan jarak sisa ke tujuan dan digunakan oleh Greedy Best-First Search.")

    with tab3:
        st.markdown(
            """
            **📚 Landasan Teori (Berdasarkan Handout Perkuliahan)**
            
            **1. Representasi Pengetahuan (Handout 8)**
            Aplikasi ini memodelkan rute menggunakan konsep **Jaringan Semantik (Semantic Network)**:
            - **Node (Simpul)**: Merepresentasikan objek berupa lokasi (misal: Medan, Berastagi).
            - **Link (Garis/Arc)**: Merepresentasikan hubungan antar objek (jalan) beserta atributnya (jarak tempuh km).
            
            **2. Blind / Un-informed Search (Handout 3)**
            - **Breadth-First Search (BFS)**: Melakukan pencarian buta secara melebar. Bersifat *Complete* (pasti menemukan solusi), namun kurang optimal untuk mencari jalur terpendek dalam graf berbobot. Membutuhkan memori besar.
            - **Uniform Cost Search**: Konsep dasarnya sama dengan **Dijkstra** yang mencari rute berdasarkan biaya total aktual terendah dari asal. Menjamin solusi yang *Optimal*.
            
            **3. Informed / Heuristic Search (Handout 4)**
            - **Greedy Best-First Search**: Menggunakan fungsi heuristik $h(n)$ (estimasi sisa jarak) untuk memandu pencarian. Walaupun memangkas waktu komputasi, algoritma ini *tidak selalu optimal* dan bisa *not complete*.
            - **Algoritma A***: Dijkstra dapat dipandang sebagai bentuk dasar dari A* dimana bobot heuristik $h(n) = 0$.
            """
        )


if __name__ == "__main__":
    main()
