# DES Simulator - Key Schedule Visualization Enhancement

## 📝 Ringkasan Perubahan

Telah ditambahkan **visualisasi detail key schedule yang komprehensif** tanpa mengubah logic algoritma yang sudah berjalan. Visualisasi baru menampilkan setiap tahap key schedule generation secara terstruktur dan educational.

---

## 🎨 Fitur Visualisasi Baru

### 1. **Section: Initial Key, PC-1, dan Split C0/D0**
Menampilkan tahap awal key schedule:
- **Initial Key (64-bit)** - Format binary dengan spasi per 8 bit
- **PC-1 Permutation (56-bit)** - Hasil setelah permutasi choice 1, membuang parity bits
- **Split C0 dan D0** - Masing-masing 28-bit, dengan warna berbeda:
  - C0 (LEFT) - Warna orange/gold (#FF9500)
  - D0 (RIGHT) - Warna cyan (#00F0FF)

### 2. **Accordion Detail untuk Setiap Round (1-16)**
Ekspandable accordion yang menampilkan detail per round:

Setiap accordion item menampilkan:
- **Round Header**: Round number dan shift amount dalam badge
- **Shift Amount** - Jumlah left circular shift (1 atau 2 bit)
- **Cn After Shift** - Register C setelah shift (28-bit)
- **Dn After Shift** - Register D setelah shift (28-bit)
- **PC-2 Permutation Result** - Subkey Kn (48-bit)

**Status Accordion:**
- Round 1 dan Round 16 otomatis terbuka untuk referensi
- Round 2-15 dalam status collapsed
- Dapat di-click untuk toggle expand/collapse

### 3. **Summary Table**
Tabel ringkasan tradisional tetap ada di bawah untuk quick reference:
- Round | Shift | Register C (28-bit) | Register D (28-bit) | Subkey K (48-bit)

---

## 📋 File yang Dimodifikasi

### 1. **index.html**
**Perubahan:**
- Mengganti tabel sederhana dengan accordion container `#ksRoundsAccordion`
- Struktur accordion div dengan ID untuk setiap round (diisi via JavaScript)
- Menambahkan summary table sebagai optional reference

**Section yang Dimodifikasi:**
```html
<h4 class="ks-rounds-title">4. Key Schedule Rounds (1-16)</h4>

<div class="ks-rounds-accordion" id="ksRoundsAccordion">
    <!-- Diisi oleh JavaScript untuk setiap round -->
</div>

<!-- Optional: Summary Table (non-interactive) -->
<div style="...">
    <h4>Summary Table</h4>
    <table class="data-table">
        <!-- Summary table remains -->
    </table>
</div>
```

### 2. **style.css**
**Penambahan CSS baru:**
- `.ks-rounds-accordion` - Container flex untuk accordion
- `.ks-round-item` - Item accordion dengan border dan background
- `.ks-round-header` - Header button dengan flex layout
- `.ks-round-number` - Styling untuk round number (cyan color, bold)
- `.ks-shift-info` - Badge untuk shift information
- `.ks-icon` - Icon toggle dengan rotate animation
- `.ks-round-content` - Content container (hidden by default)
- `.ks-round-detail` - Grid 2 column untuk layout detail
- `.ks-detail-row`, `.ks-detail-label`, `.ks-detail-value` - Styling untuk setiap row detail
- `.bit-c`, `.bit-d`, `.bit-k` - Color-coding untuk C, D, dan Subkey

**Responsive Design:**
- Pada mobile (< 768px), grid berubah ke single column

### 3. **js/ui.js**
**Penambahan Function:**

**`renderKeyScheduleDetails(keyScheduleData)`**
- Fungsi baru yang render accordion detail untuk setiap round
- Membuat 16 accordion items, satu untuk setiap round
- Round 1 dan Round 16 otomatis di-expand (class `.active`)
- Menggunakan grid layout 2-column untuk C dan D registers
- Full-width display untuk PC-2 result

**`toggleKeyScheduleRound(btn)` (window function)**
- Fungsi toggle untuk accordion
- Toggle class `.active` pada parent `.ks-round-item`

### 4. **script.js**
**Perubahan pada `displayResults()` function:**
```javascript
// Tambahan: Detail accordion per round
renderKeyScheduleDetails(desData.keySchedule);
```
- Memanggil function render detail setelah `renderKeySchedule()`
- Menggunakan data keySchedule yang sudah tersedia dari `generateSubkeys()`

---

## 🎯 Data Struktur yang Digunakan

Function `generateSubkeys()` dari `keySchedule.js` sudah mengembalikan object lengkap:

```javascript
{
    originalKey: "...",      // 64-bit binary
    pc1Result: "...",        // 56-bit binary (PC-1 result)
    C0: "...",               // 28-bit binary
    D0: "...",               // 28-bit binary
    rounds: [
        {
            round: 1-16,
            shiftCount: 1 atau 2,
            C: "...",        // Cn after shift (28-bit)
            D: "...",        // Dn after shift (28-bit)
            CD: "...",       // CnDn gabungan (56-bit)
            subkey: "..."    // Kn (48-bit)
        },
        // ... for 16 rounds
    ]
}
```

---

## 🎨 Warna-Coding Visual

| Element | Warna | Hex Code | Makna |
|---------|-------|----------|-------|
| **C Register** | Orange/Gold | #FFB900-#FFA500 | Left half (28-bit) |
| **D Register** | Cyan/Neon | #00F0FF | Right half (28-bit) |
| **Subkey K** | Magenta/Pink | #FF007F-#FF6B9D | 48-bit hasil PC-2 |
| **Round Number** | Cyan | #00F0FF | Highlight round identifier |
| **Shift Info** | Gray | #94A3B8 | Metadata information |

---

## ✅ Fitur Preservasi

✓ **Logic tidak diubah** - Semua algoritma DES tetap berjalan seperti semula
✓ **Backward compatible** - Tidak merusak function yang sudah ada
✓ **Data intact** - Menggunakan data yang sudah tersedia dari `generateSubkeys()`
✓ **Modular design** - Function render terpisah, mudah di-maintain
✓ **Responsive** - Accordion bekerja baik di desktop dan mobile

---

## 🚀 Cara Menggunakan

1. **Run aplikasi** dan masukkan key + plaintext
2. **Klik "Eksekusi Algoritma"**
3. **Buka tab "Key Schedule"** (sudah otomatis terbuka)
4. **Lihat section "4. Key Schedule Rounds (1-16)"**
5. **Klik salah satu accordion** untuk melihat detail round
   - Round 1 dan 16 sudah terbuka secara default
   - Round lain dapat di-click untuk expand

---

## 📊 Contoh Visualisasi

### Header Accordion
```
┌─────────────────────────────────┐
│ R1         Shift: 1        ▲    │  ← Expanded
├─────────────────────────────────┤
│ SHIFT AMOUNT (POSITIONS)        │
│ 1 bit                           │
│                                 │
│ C1 AFTER SHIFT (28-BIT)         │
│ 1110 0001 1001 1001 0101 ...    │
│                                 │
│ D1 AFTER SHIFT (28-BIT)         │
│ 0101 0101 1111 1001 1011 ...    │
│                                 │
│ PC-2 PERMUTATION RESULT         │
│ → SUBKEY K1 (48-BIT)            │
│ 000110 110000 001011 ...        │
└─────────────────────────────────┘
```

---

## 🔍 Testing Checklist

- [x] Initial Key display (64-bit binary)
- [x] PC-1 result display (56-bit binary)
- [x] C0 dan D0 split display (28-bit each dengan warna berbeda)
- [x] Accordion header dengan round number dan shift info
- [x] Cn register display setelah shift
- [x] Dn register display setelah shift
- [x] PC-2 result display (48-bit subkey)
- [x] Accordion toggle functionality (expand/collapse)
- [x] Round 1 dan 16 otomatis expanded
- [x] Round 2-15 collapsed by default
- [x] Color-coding untuk C (orange), D (cyan), K (magenta)
- [x] Responsive design (tested mobile viewport)
- [x] Summary table still visible
- [x] No console errors
- [x] Logic DES tidak berubah

---

## 📝 Notes

- Visualisasi menggunakan data yang sudah dicompute oleh `generateSubkeys()`
- Tidak ada penambahan computational overhead
- Semua styling menggunakan CSS variables untuk konsistensi theme
- Accordion toggle menggunakan vanilla JavaScript (tanpa library)
- Grid layout responsive untuk berbagai ukuran layar

---

**Last Updated:** June 14, 2026
**Status:** ✅ Selesai dan Tested
