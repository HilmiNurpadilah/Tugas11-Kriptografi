/**
 * ============================================================
 *  constants.js — Tabel Konstanta DES (FIPS 46-3)
 * ============================================================
 *
 * File ini berisi SEMUA tabel permutasi dan substitusi yang
 * digunakan dalam algoritma DES. Semua nilai diambil langsung
 * dari spesifikasi FIPS 46-3 (Federal Information Processing
 * Standards Publication 46-3).
 *
 * PENTING:
 * - Tabel menggunakan 1-indexed (posisi bit dimulai dari 1)
 *   sesuai standar FIPS. Saat digunakan dalam kode JavaScript,
 *   kita perlu mengurangi 1 (karena array JS 0-indexed).
 * - Urutan bit: bit paling kiri = bit 1 (MSB)
 *
 * Referensi: https://csrc.nist.gov/publications/detail/fips/46/3/archive/1999-10-25
 */

// ============================================================
//  INITIAL PERMUTATION (IP)
// ============================================================
/**
 * IP (Initial Permutation) — 64 elemen
 *
 * Langkah pertama dalam DES: menyusun ulang 64 bit input
 * sebelum masuk ke 16 round Feistel.
 *
 * Cara membaca: bit output ke-1 diambil dari bit input ke-58,
 *               bit output ke-2 diambil dari bit input ke-50,
 *               dst.
 *
 * Tujuan: Difusi awal — menyebarkan bit-bit input agar
 *         perubahan 1 bit input mempengaruhi banyak bit output.
 */
const IP = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17,  9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7
];

// ============================================================
//  INVERSE INITIAL PERMUTATION (IP^-1)
// ============================================================
/**
 * IP_INV (Inverse Initial Permutation / IP⁻¹) — 64 elemen
 *
 * Langkah TERAKHIR dalam DES: mengembalikan urutan bit
 * ke posisi semula setelah 16 round Feistel selesai.
 *
 * IP_INV adalah kebalikan dari IP.
 * Jika IP memindahkan bit 58 ke posisi 1,
 * maka IP_INV memindahkan bit 1 kembali ke posisi 58.
 *
 * Properti: IP_INV(IP(x)) = x (saling menganulkan)
 */
const IP_INV = [
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41,  9, 49, 17, 57, 25
];

// ============================================================
//  PERMUTED CHOICE 1 (PC-1)
// ============================================================
/**
 * PC1 (Permuted Choice 1) — 56 elemen
 *
 * Digunakan dalam KEY SCHEDULE (pembangkitan subkey).
 *
 * Fungsi: Mengambil 56 bit dari 64-bit key (membuang 8 bit
 * parity, yaitu bit ke-8, 16, 24, 32, 40, 48, 56, 64).
 *
 * Input:  64-bit key
 * Output: 56-bit key (tanpa parity bits)
 *
 * Hasil 56 bit ini kemudian dibagi menjadi:
 * - C0 = 28 bit pertama (kiri)
 * - D0 = 28 bit terakhir (kanan)
 */
const PC1 = [
    57, 49, 41, 33, 25, 17,  9,
     1, 58, 50, 42, 34, 26, 18,
    10,  2, 59, 51, 43, 35, 27,
    19, 11,  3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
     7, 62, 54, 46, 38, 30, 22,
    14,  6, 61, 53, 45, 37, 29,
    21, 13,  5, 28, 20, 12,  4
];

// ============================================================
//  PERMUTED CHOICE 2 (PC-2)
// ============================================================
/**
 * PC2 (Permuted Choice 2) — 48 elemen
 *
 * Digunakan dalam KEY SCHEDULE untuk menghasilkan subkey 48-bit
 * dari 56-bit (Ci + Di) pada setiap round.
 *
 * Input:  56-bit (Ci concatenated Di)
 * Output: 48-bit subkey Ki
 *
 * PC-2 memilih 48 dari 56 bit dan menyusun ulang urutannya.
 * 8 bit yang dibuang: bit 9, 18, 22, 25, 35, 38, 43, 54
 * (penomoran 1-indexed dari CiDi).
 */
const PC2 = [
    14, 17, 11, 24,  1,  5,
     3, 28, 15,  6, 21, 10,
    23, 19, 12,  4, 26,  8,
    16,  7, 27, 20, 13,  2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32
];

// ============================================================
//  SHIFT SCHEDULE
// ============================================================
/**
 * SHIFT_SCHEDULE — 16 elemen
 *
 * Menentukan jumlah LEFT CIRCULAR SHIFT (geser kiri melingkar)
 * pada Ci dan Di di setiap round key schedule.
 *
 * Round 1, 2, 9, 16: shift 1 posisi
 * Round lainnya:      shift 2 posisi
 *
 * Total shift setelah 16 round = 28 posisi
 * (artinya C16 = C0 dan D16 = D0, kembali ke awal)
 *
 * Index: [0]=Round1, [1]=Round2, ..., [15]=Round16
 */
const SHIFT_SCHEDULE = [
    1, 1, 2, 2, 2, 2, 2, 2,
    1, 2, 2, 2, 2, 2, 2, 1
];

// ============================================================
//  EXPANSION PERMUTATION (E)
// ============================================================
/**
 * E (Expansion Permutation / E-Box) — 48 elemen
 *
 * Digunakan dalam FEISTEL FUNCTION.
 *
 * Fungsi: Memperluas 32-bit right block menjadi 48-bit
 * agar bisa di-XOR dengan 48-bit subkey.
 *
 * Input:  32-bit (R block)
 * Output: 48-bit (expanded R)
 *
 * Cara kerja: Membagi 32 bit menjadi 8 grup × 4 bit,
 * lalu menambahkan bit tetangga di kiri dan kanan setiap grup
 * sehingga menjadi 8 grup × 6 bit = 48 bit.
 *
 * Bit-bit yang diduplikasi menciptakan "avalanche effect" —
 * perubahan 1 bit di R mempengaruhi 2 grup S-Box.
 */
const E = [
    32,  1,  2,  3,  4,  5,
     4,  5,  6,  7,  8,  9,
     8,  9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32,  1
];

// ============================================================
//  PERMUTATION P
// ============================================================
/**
 * P (Permutation) — 32 elemen
 *
 * Digunakan dalam FEISTEL FUNCTION setelah S-Box substitution.
 *
 * Fungsi: Menyusun ulang 32-bit output dari S-Box.
 *
 * Input:  32-bit (output gabungan 8 S-Box, masing-masing 4 bit)
 * Output: 32-bit (bit yang sudah dipermutasi)
 *
 * Tujuan: DIFUSI — memastikan output dari satu S-Box
 * tersebar ke input beberapa S-Box berbeda di round berikutnya.
 * Ini menciptakan "avalanche effect" antar round.
 */
const P = [
    16,  7, 20, 21,
    29, 12, 28, 17,
     1, 15, 23, 26,
     5, 18, 31, 10,
     2,  8, 24, 14,
    32, 27,  3,  9,
    19, 13, 30,  6,
    22, 11,  4, 25
];

// ============================================================
//  S-BOX (Substitution Boxes)
// ============================================================
/**
 * S_BOXES — 8 buah S-Box, masing-masing berukuran 4 × 16
 *
 * S-Box adalah SATU-SATUNYA komponen NON-LINEAR dalam DES.
 * Inilah yang memberikan KEAMANAN utama pada algoritma DES.
 *
 * Cara kerja setiap S-Box:
 * - Input:  6 bit  (b1 b2 b3 b4 b5 b6)
 * - Output: 4 bit
 *
 * Penentuan posisi dalam tabel:
 * - ROW    = bit pertama + bit terakhir  = b1b6 (2 bit → 0-3)
 * - COLUMN = 4 bit tengah                = b2b3b4b5 (4 bit → 0-15)
 *
 * Contoh: input = 101011
 *   ROW    = b1b6 = 11 = 3 (desimal)
 *   COLUMN = b2b3b4b5 = 0101 = 5 (desimal)
 *   Output = S-Box[3][5] → dikonversi ke 4-bit biner
 *
 * Total transformasi: 48 bit input → 8 × 6 bit → 8 × S-Box → 8 × 4 bit = 32 bit output
 */
const S_BOXES = [
    // S1
    [
        [14,  4, 13,  1,  2, 15, 11,  8,  3, 10,  6, 12,  5,  9,  0,  7],
        [ 0, 15,  7,  4, 14,  2, 13,  1, 10,  6, 12, 11,  9,  5,  3,  8],
        [ 4,  1, 14,  8, 13,  6,  2, 11, 15, 12,  9,  7,  3, 10,  5,  0],
        [15, 12,  8,  2,  4,  9,  1,  7,  5, 11,  3, 14, 10,  0,  6, 13]
    ],
    // S2
    [
        [15,  1,  8, 14,  6, 11,  3,  4,  9,  7,  2, 13, 12,  0,  5, 10],
        [ 3, 13,  4,  7, 15,  2,  8, 14, 12,  0,  1, 10,  6,  9, 11,  5],
        [ 0, 14,  7, 11, 10,  4, 13,  1,  5,  8, 12,  6,  9,  3,  2, 15],
        [13,  8, 10,  1,  3, 15,  4,  2, 11,  6,  7, 12,  0,  5, 14,  9]
    ],
    // S3
    [
        [10,  0,  9, 14,  6,  3, 15,  5,  1, 13, 12,  7, 11,  4,  2,  8],
        [13,  7,  0,  9,  3,  4,  6, 10,  2,  8,  5, 14, 12, 11, 15,  1],
        [13,  6,  4,  9,  8, 15,  3,  0, 11,  1,  2, 12,  5, 10, 14,  7],
        [ 1, 10, 13,  0,  6,  9,  8,  7,  4, 15, 14,  3, 11,  5,  2, 12]
    ],
    // S4
    [
        [ 7, 13, 14,  3,  0,  6,  9, 10,  1,  2,  8,  5, 11, 12,  4, 15],
        [13,  8, 11,  5,  6, 15,  0,  3,  4,  7,  2, 12,  1, 10, 14,  9],
        [10,  6,  9,  0, 12, 11,  7, 13, 15,  1,  3, 14,  5,  2,  8,  4],
        [ 3, 15,  0,  6, 10,  1, 13,  8,  9,  4,  5, 11, 12,  7,  2, 14]
    ],
    // S5
    [
        [ 2, 12,  4,  1,  7, 10, 11,  6,  8,  5,  3, 15, 13,  0, 14,  9],
        [14, 11,  2, 12,  4,  7, 13,  1,  5,  0, 15, 10,  3,  9,  8,  6],
        [ 4,  2,  1, 11, 10, 13,  7,  8, 15,  9, 12,  5,  6,  3,  0, 14],
        [11,  8, 12,  7,  1, 14,  2, 13,  6, 15,  0,  9, 10,  4,  5,  3]
    ],
    // S6
    [
        [12,  1, 10, 15,  9,  2,  6,  8,  0, 13,  3,  4, 14,  7,  5, 11],
        [10, 15,  4,  2,  7, 12,  9,  5,  6,  1, 13, 14,  0, 11,  3,  8],
        [ 9, 14, 15,  5,  2,  8, 12,  3,  7,  0,  4, 10,  1, 13, 11,  6],
        [ 4,  3,  2, 12,  9,  5, 15, 10, 11, 14,  1,  7,  6,  0,  8, 13]
    ],
    // S7
    [
        [ 4, 11,  2, 14, 15,  0,  8, 13,  3, 12,  9,  7,  5, 10,  6,  1],
        [13,  0, 11,  7,  4,  9,  1, 10, 14,  3,  5, 12,  2, 15,  8,  6],
        [ 1,  4, 11, 13, 12,  3,  7, 14, 10, 15,  6,  8,  0,  5,  9,  2],
        [ 6, 11, 13,  8,  1,  4, 10,  7,  9,  5,  0, 15, 14,  2,  3, 12]
    ],
    // S8
    [
        [13,  2,  8,  4,  6, 15, 11,  1, 10,  9,  3, 14,  5,  0, 12,  7],
        [ 1, 15, 13,  8, 10,  3,  7,  4, 12,  5,  6,  2,  0, 14,  9, 11],
        [ 7, 11,  4,  1,  9, 12, 14,  2,  0,  6, 10, 13, 15,  3,  5,  8],
        [ 2,  1, 14,  7,  4, 10,  8, 13, 15, 12,  9,  0,  3,  5,  6, 11]
    ]
];
