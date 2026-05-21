# 🗺️ Route Finder - Medan to Berastagi

Aplikasi web interaktif untuk membandingkan algoritma pencarian rute: **BFS**, **Greedy Best-First Search**, dan **Dijkstra**

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Cara Menjalankan](#cara-menjalankan)
- [Algoritma](#algoritma)
- [Data](#data)

## ✨ Fitur

✅ **Tiga Algoritma Pencarian:**
- BFS (Breadth-First Search) - Complete, O(V+E)
- Greedy Best-First Search - Fast, O(E log V)
- Dijkstra - Optimal, O((V+E) log V)

✅ **Visualisasi Interaktif:**
- Diagram graf dengan Canvas
- Peta satelit (Future)
- Highlight rute yang ditemukan
- Node status visualization

✅ **Analisis Detail:**
- Tabel segmen rute dengan akumulasi jarak
- Urutan eksplorasi node
- Metrics cards (jarak, efisiensi)
- Comparison mode untuk 3 algoritma

✅ **Responsive Design:**
- Desktop, tablet, mobile compatible
- Sidebar responsive
- Canvas scalable

## 🛠️ Teknologi

- **HTML5** - Struktur
- **CSS3** - Styling (Gradient, Flexbox, Grid)
- **JavaScript ES6** - Logic & Algorithms
- **Canvas API** - Visualisasi graf
- **No Dependencies** - Pure Vanilla JS

## 📁 Struktur Project

```
tubes-kcb/
├── index.html           # HTML structure
├── styles.css          # Styling & layout
├── script.js           # Algorithms & logic
├── README.md           # Dokumentasi (this file)
└── docs/
    ├── DOKUMENTASI_ALGORITMA_DAN_FUNGSI.txt
    └── CATATAN_PRESENTASI_5_PEMBACA.txt
```

## 🚀 Cara Menjalankan

### Opsi 1: Buka Langsung di Browser
```bash
# Double-click: index.html
```

### Opsi 2: Gunakan VS Code Live Server (Recommended)
1. Buka folder di VS Code
2. Install extension "Live Server"
3. Right-click `index.html` → "Open with Live Server"
4. Otomatis buka di `http://localhost:5500`

### Opsi 3: Gunakan Python Simple Server
```bash
cd "path/to/tubes-kcb"
python -m http.server 8000
# Buka: http://localhost:8000
```

### Opsi 4: Gunakan Node.js HTTP Server
```bash
npm install -g http-server
http-server
# Buka: http://localhost:8080
```

## 🧠 Algoritma

### 1. **BFS (Breadth-First Search)**
- **Kategori:** Un-informed Search
- **Prinsip:** Eksplorasi lapis demi lapis
- **Kompleksitas:** O(V + E) time, O(V) space
- **Optimality:** ✗ Tidak optimal untuk weighted graph
- **Completeness:** ✓ Pasti menemukan solusi
- **Kegunaan:** Learning, unweighted graphs

**Implementasi:** Baris 60-78 di `script.js`

### 2. **Greedy Best-First Search**
- **Kategori:** Informed Search (Heuristic)
- **Prinsip:** Menggunakan heuristik untuk memandu pencarian
- **Kompleksitas:** O(E log V) time, O(V) space
- **Optimality:** ✗ Tidak dijamin optimal
- **Completeness:** ≈ Biasanya menemukan solusi
- **Kegunaan:** Real-time GPS, games, robot navigation

**Implementasi:** Baris 81-108 di `script.js`

### 3. **Dijkstra**
- **Kategori:** Optimal Search
- **Prinsip:** Menghitung biaya akumulatif terendah
- **Kompleksitas:** O((V+E) log V) time, O(V) space
- **Optimality:** ✓ MENJAMIN rute terpendek
- **Completeness:** ✓ Pasti menemukan solusi
- **Kegunaan:** GPS profesional, network routing, game pathfinding

**Implementasi:** Baris 111-145 di `script.js`

## 📊 Data

### Nodes (Lokasi)
Total: **17 lokasi**
- Medan (Start)
- Berastagi (Goal)
- Padang Bulan, Simpang Selayang, Tuntuntan, Pancur Batu
- Sembahe, Sibolangit, Bandar Baru, Doulu, Tongkoh
- Kutalimbaru, Delitua, Namorambe, Patumbak
- Sibiru-biru, Talun Kenas

### Edges (Koneksi)
Total: **18 koneksi**

**Jalur Utama (57.07 km):**
- Medan → Padang Bulan (7 km)
- Padang Bulan → Simpang Selayang (3.5 km)
- Simpang Selayang → Tuntuntan (4 km)
- Tuntuntan → Pancur Batu (8 km)
- Pancur Batu → Sembahe (9 km)
- Sembahe → Sibolangit (7 km)
- Sibolangit → Bandar Baru (5.5 km)
- Bandar Baru → Doulu (4 km)
- Doulu → Tongkoh (3 km)
- Tongkoh → Berastagi (6.07 km)

**Alternatif Kutalimbaru:**
- Medan → Tuntuntan (16 km)
- Tuntuntan → Kutalimbaru (13 km)
- Kutalimbaru → Bandar Baru (18.8 km)

**Alternatif Delitua-Namorambe:**
- Medan → Delitua (12 km)
- Delitua → Namorambe (10 km)
- Namorambe → Kutalimbaru (21 km)

**Alternatif Patumbak:**
- Medan → Patumbak (11 km)
- Patumbak → Namorambe (17 km)

**Alternatif Sibiru-biru:**
- Medan → Sibiru-biru (25 km)
- Sibiru-biru → Talun Kenas (22 km)
- Talun Kenas → Bandar Baru (19 km)

## 🎨 Warna & Design

**Color Scheme:**
- Primary Dark: `#2f3a2e`
- Primary Mid: `#4a5b3e`
- Accent Gold: `#b2a77a`
- Text Light: `#e7e1cf`
- Text Dark: `#0F172A`

**Node Colors:**
- Start Node: `#10B981` (Hijau)
- Goal Node: `#EF4444` (Merah)
- Path Node: `#FBBF24` (Kuning)
- Explored Node: `#FFFFFF` (Putih)
- Active Node: `#A78BFA` (Ungu)

**Edge Colors:**
- Path Edge: `#2563EB` (Biru)
- Regular Edge: `#CBD5E1` (Abu-abu)

## 📖 Dokumentasi Lengkap

Untuk penjelasan detail tentang algoritma dan fungsi, lihat:
- `docs/DOKUMENTASI_ALGORITMA_DAN_FUNGSI.txt` - Dokumentasi lengkap semua class dan fungsi
- `docs/CATATAN_PRESENTASI_5_PEMBACA.txt` - Catatan untuk presentasi dengan pembagian 5 pembaca

## 🔧 Kode Principal Classes

### Class: RouteGraph
Merepresentasikan struktur graf dengan nodes dan edges.

**Properties:**
- `graph`: Map untuk adjacency list
- `edgeInfo`: Array untuk informasi edge
- `heuristic`: Map untuk nilai heuristik
- `positions`: Map untuk koordinat visual
- `coordinates`: Map untuk koordinat GPS

**Methods:**
- `addEdge(dari, ke, jarak, rute)`: Tambah edge dua arah
- `buildGraph()`: Inisialisasi semua nodes dan edges
- `getNeighbors(node)`: Dapatkan tetangga node
- `getHeuristic(node)`: Dapatkan nilai heuristik
- `allNodes()`: Dapatkan semua nodes

### Class: SearchAlgorithms
Mengimplementasikan ketiga algoritma pencarian.

**Methods:**
- `bfs(start, goal)`: Breadth-First Search
- `greedyBestFirstSearch(start, goal)`: Greedy dengan heuristik
- `dijkstra(start, goal)`: Dijkstra optimal
- `runAll(start, goal)`: Jalankan semua algoritma sekaligus

**Return Format:**
```javascript
{
  path: [node1, node2, ..., goalNode],
  distance: totalJarak,
  explored: [node1, node2, ...]
}
```

## 🎯 Hasil yang Diharapkan

**Medan → Berastagi:**
- **Dijkstra (Optimal):** 57.07 km
- **BFS:** Mungkin lebih panjang (tidak optimal)
- **Greedy:** Tergantung heuristik (tidak dijamin optimal)

## 📝 Checklist Implementasi

- ✅ Class RouteGraph dengan 17 nodes
- ✅ Algoritma BFS lengkap
- ✅ Algoritma Greedy Best-First lengkap
- ✅ Algoritma Dijkstra lengkap
- ✅ Visualisasi Canvas
- ✅ UI Sidebar responsive
- ✅ Metrics cards
- ✅ Tabel detail rute
- ✅ Comparison mode
- ✅ Urutan eksplorasi
- ✅ Styling gradient & modern
- ✅ Mobile responsive

## 🚀 Future Enhancements

- [ ] Peta satelit dengan Leaflet.js
- [ ] Animasi step-by-step exploration
- [ ] Export hasil ke PDF
- [ ] Dark/Light mode toggle
- [ ] Custom node & edge input
- [ ] Profiling & time measurement
- [ ] A* algorithm comparison
- [ ] Database untuk menyimpan hasil

## 📞 Support

Untuk pertanyaan atau issue, silakan open issue atau hubungi developer.

---

**Last Updated:** May 21, 2026
**Version:** 1.0.0
**Status:** Production Ready ✓
