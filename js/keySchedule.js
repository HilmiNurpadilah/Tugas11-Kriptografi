/**
 * ============================================================
 *  keySchedule.js — Pembangkitan 16 Subkey DES
 * ============================================================
 *
 * Modul ini mengimplementasikan KEY SCHEDULE DES:
 * Proses menghasilkan 16 subkey (K1–K16) dari kunci 64-bit.
 *
 * Alur:
 * 1. Terapkan PC-1 pada key 64-bit → 56 bit (buang parity)
 * 2. Split menjadi C0 (28 bit kiri) dan D0 (28 bit kanan)
 * 3. Untuk setiap round i = 1..16:
 *    a. Left circular shift Ci dan Di sesuai SHIFT_SCHEDULE
 *    b. Gabungkan CiDi (56 bit)
 *    c. Terapkan PC-2 → subkey Ki (48 bit)
 *
 * Dependencies:
 * - constants.js (PC1, PC2, SHIFT_SCHEDULE)
 * - permutation.js (permute, leftCircularShift)
 */

// ============================================================
//  generateSubkeys(key64bit)
// ============================================================
/**
 * Menghasilkan 16 subkey dari kunci 64-bit.
 *
 * Fungsi ini juga mengembalikan SEMUA detail intermediate
 * untuk keperluan visualisasi di UI.
 *
 * @param {string} key64bit - Kunci 64-bit dalam format string biner
 * @returns {object} Objek berisi:
 *   - subkeys: Array 16 subkey (masing-masing 48-bit string)
 *   - rounds: Array 16 objek detail per round, berisi:
 *       - round: nomor round (1-16)
 *       - shiftCount: jumlah shift pada round ini
 *       - C: string 28-bit register C setelah shift
 *       - D: string 28-bit register D setelah shift
 *       - CD: string 56-bit gabungan C+D
 *       - subkey: string 48-bit subkey Ki
 *   - pc1Result: string 56-bit hasil PC-1
 *   - C0: string 28-bit register C awal
 *   - D0: string 28-bit register D awal
 *
 * Contoh penggunaan:
 *   const result = generateSubkeys(keyBinary);
 *   console.log(result.subkeys[0]);  // K1 (48-bit)
 *   console.log(result.rounds[0].C); // C1 (28-bit)
 */
function generateSubkeys(key64bit) {
    // -------------------------------------------------------
    // LANGKAH 1: Terapkan PC-1 (Permuted Choice 1)
    // -------------------------------------------------------
    // PC-1 mengambil 56 bit dari 64-bit key
    // Membuang 8 parity bits (bit ke-8, 16, 24, 32, 40, 48, 56, 64)
    const pc1Result = permute(key64bit, PC1);
    // pc1Result sekarang 56 bit

    // -------------------------------------------------------
    // LANGKAH 2: Split menjadi C0 dan D0
    // -------------------------------------------------------
    // C0 = 28 bit pertama (kiri) dari hasil PC-1
    // D0 = 28 bit terakhir (kanan) dari hasil PC-1
    const C0 = pc1Result.substring(0, 28);
    const D0 = pc1Result.substring(28, 56);

    // -------------------------------------------------------
    // LANGKAH 3: Generate K1 sampai K16
    // -------------------------------------------------------
    const subkeys = [];    // Array untuk menyimpan 16 subkey
    const rounds = [];     // Array untuk menyimpan detail tiap round

    // Register C dan D yang akan di-shift setiap round
    let currentC = C0;
    let currentD = D0;

    for (let i = 0; i < 16; i++) {
        const roundNumber = i + 1;  // Round 1-16 (bukan 0-15)

        // Jumlah shift untuk round ini (1 atau 2)
        const shiftCount = SHIFT_SCHEDULE[i];

        // -------------------------------------------------
        // LANGKAH 3a: Left Circular Shift pada C dan D
        // -------------------------------------------------
        // Geser register C dan D ke kiri sebanyak shiftCount posisi
        // Bit yang keluar dari kiri masuk kembali dari kanan (circular)
        currentC = leftCircularShift(currentC, shiftCount);
        currentD = leftCircularShift(currentD, shiftCount);

        // -------------------------------------------------
        // LANGKAH 3b: Gabungkan Ci dan Di
        // -------------------------------------------------
        // CiDi = 56 bit (28 bit C + 28 bit D)
        const CD = currentC + currentD;

        // -------------------------------------------------
        // LANGKAH 3c: Terapkan PC-2 → Subkey Ki
        // -------------------------------------------------
        // PC-2 memilih 48 bit dari 56 bit CiDi
        // Hasilnya adalah subkey Ki yang digunakan di round ke-i
        const subkey = permute(CD, PC2);

        // Simpan subkey
        subkeys.push(subkey);

        // Simpan detail round untuk visualisasi
        rounds.push({
            round: roundNumber,
            shiftCount: shiftCount,
            C: currentC,         // Ci setelah shift
            D: currentD,         // Di setelah shift
            CD: CD,              // CiDi gabungan (56 bit)
            subkey: subkey        // Ki (48 bit)
        });
    }

    // Return semua data untuk visualisasi
    return {
        subkeys: subkeys,    // Array of 16 subkeys (48-bit each)
        rounds: rounds,      // Array of 16 round details
        pc1Result: pc1Result, // 56-bit PC-1 result
        C0: C0,              // Initial C (28-bit)
        D0: D0               // Initial D (28-bit)
    };
}
