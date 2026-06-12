/**
 * ============================================================
 *  permutation.js — Fungsi Permutasi Generik DES
 * ============================================================
 *
 * Modul ini menyediakan SATU fungsi utama: permute()
 *
 * Fungsi permute() digunakan untuk SEMUA operasi permutasi
 * dalam DES:
 *   - Initial Permutation (IP)
 *   - Inverse Initial Permutation (IP⁻¹)
 *   - Permuted Choice 1 (PC-1)
 *   - Permuted Choice 2 (PC-2)
 *   - Expansion (E)
 *   - Permutation (P)
 *
 * Prinsip: Semua permutasi DES bekerja sama — mengambil bit
 * dari posisi tertentu dan menyusunnya dalam urutan baru.
 * Yang berbeda hanyalah TABEL yang digunakan.
 *
 * Catatan: Tabel DES menggunakan 1-indexed (bit pertama = 1).
 * JavaScript array menggunakan 0-indexed (elemen pertama = 0).
 * Maka kita perlu mengurangi 1 saat mengakses: input[table[i] - 1]
 */

// ============================================================
//  permute(inputBits, table)
// ============================================================
/**
 * Menerapkan tabel permutasi pada string bit.
 *
 * Cara kerja:
 * 1. Untuk setiap posisi i di tabel (dari 0 sampai table.length - 1):
 * 2. Ambil nilai table[i] → ini adalah posisi bit SUMBER (1-indexed)
 * 3. Ambil bit dari input pada posisi (table[i] - 1) → karena JS 0-indexed
 * 4. Taruh bit tersebut di posisi i pada output
 *
 * Hasilnya: string bit baru dengan panjang = table.length
 *
 * PENTING:
 * - Panjang output = panjang tabel (BUKAN panjang input)
 * - Contoh: PC-1 mengubah 64 bit → 56 bit (tabel 56 elemen)
 * - Contoh: E mengubah 32 bit → 48 bit (tabel 48 elemen, ada duplikasi)
 *
 * @param {string} inputBits - String bit input, misal "01011010..."
 * @param {Array<number>} table - Tabel permutasi (1-indexed), misal IP, PC1, E
 * @returns {string} String bit output setelah dipermutasi
 *
 * Contoh:
 *   permute("ABCD", [3, 1, 4, 2]) → "CADB"
 *   Karena: output[0]=input[3-1]='C', output[1]=input[1-1]='A',
 *           output[2]=input[4-1]='D', output[3]=input[2-1]='B'
 */
function permute(inputBits, table) {
    let output = '';

    // Iterasi setiap posisi di tabel permutasi
    for (let i = 0; i < table.length; i++) {
        // table[i] adalah posisi bit sumber (1-indexed)
        // Kurangi 1 untuk konversi ke 0-indexed JavaScript
        const sourcePosition = table[i] - 1;

        // Ambil bit dari posisi sumber dan tambahkan ke output
        output += inputBits[sourcePosition];
    }

    return output;
}

// ============================================================
//  leftCircularShift(bits, shiftCount)
// ============================================================
/**
 * Melakukan LEFT CIRCULAR SHIFT (geser kiri melingkar).
 *
 * Digunakan dalam KEY SCHEDULE untuk menggeser register C dan D.
 *
 * Cara kerja "circular" (melingkar):
 * - Bit yang keluar dari sisi kiri masuk kembali dari sisi kanan
 *
 * Contoh: leftCircularShift("ABCDE", 2)
 *   Langkah 1: "ABCDE" → ambil 2 karakter pertama "AB"
 *   Langkah 2: sisa = "CDE"
 *   Langkah 3: gabungkan = "CDE" + "AB" = "CDEAB"
 *
 * Dalam konteks DES key schedule:
 * - Register C dan D masing-masing 28 bit
 * - Shift 1 atau 2 posisi per round (sesuai SHIFT_SCHEDULE)
 *
 * @param {string} bits - String bit yang akan digeser
 * @param {number} shiftCount - Jumlah posisi shift (1 atau 2)
 * @returns {string} String bit setelah digeser
 *
 * Contoh:
 *   leftCircularShift("1111000011001100", 1)
 *   → "1110000110011001"
 *   (bit '1' paling kiri pindah ke paling kanan)
 */
function leftCircularShift(bits, shiftCount) {
    // Ambil bagian setelah shift dan tambahkan bagian awal di belakang
    // Contoh: shift 2 pada "ABCDE" → "CDE" + "AB" = "CDEAB"
    return bits.substring(shiftCount) + bits.substring(0, shiftCount);
}
