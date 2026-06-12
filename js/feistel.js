/**
 * ============================================================
 *  feistel.js — Fungsi Feistel DES f(R, K)
 * ============================================================
 *
 * Modul ini mengimplementasikan Fungsi Feistel utama dari DES.
 * Fungsi ini dijalankan pada setiap round (total 16 round).
 *
 * Input:
 * - R: 32-bit (Setengah bagian kanan data)
 * - K: 48-bit (Subkey untuk round ini)
 *
 * Output:
 * - 32-bit (Hasil dari fungsi Feistel)
 *
 * Proses:
 * 1. Expansion (E): R (32-bit) -> 48-bit
 * 2. XOR: Hasil Expansion (48-bit) XOR K (48-bit)
 * 3. S-Box: Hasil XOR (48-bit) -> S-Box -> 32-bit
 * 4. Permutation (P): Hasil S-Box (32-bit) -> 32-bit
 *
 * Dependencies:
 * - constants.js (E, P)
 * - permutation.js (permute)
 * - converter.js (xorBinary)
 * - sbox.js (sBoxSubstitute)
 */

// ============================================================
//  feistelFunction(R, subkey)
// ============================================================
/**
 * Menjalankan fungsi Feistel f(R, K) untuk satu round.
 *
 * Fungsi ini mengembalikan hasil akhirnya beserta semua detail
 * langkah (intermediate values) agar UI bisa menampilkan proses
 * langkah demi langkah untuk pembelajaran mahasiswa.
 *
 * @param {string} R - Blok Kanan 32-bit (biner)
 * @param {string} subkey - Subkey 48-bit (biner)
 * @returns {object} Detail lengkap proses Feistel:
 *   - inputR: 32-bit string (Input R)
 *   - inputKey: 48-bit string (Subkey K)
 *   - expandedR: 48-bit string (Hasil Expansion E)
 *   - xorResult: 48-bit string (Hasil E(R) XOR K)
 *   - sboxDetails: Array 8 detail S-Box
 *   - sboxOutput: 32-bit string (Hasil S-Box substitution)
 *   - finalResult: 32-bit string (Hasil akhir setelah Permutation P)
 */
function feistelFunction(R, subkey) {
    if (R.length !== 32) {
        throw new Error(`Fungsi Feistel membutuhkan blok R 32 bit, tapi mendapat ${R.length} bit`);
    }
    if (subkey.length !== 48) {
        throw new Error(`Fungsi Feistel membutuhkan subkey 48 bit, tapi mendapat ${subkey.length} bit`);
    }

    // 1. Expansion (E)
    // Memperluas 32-bit R menjadi 48-bit menggunakan tabel E
    const expandedR = permute(R, E);

    // 2. XOR dengan Subkey
    // Meng-XOR hasil expansion (48-bit) dengan subkey (48-bit)
    const xorResult = xorBinary(expandedR, subkey);

    // 3. S-Box Substitution
    // Memasukkan hasil XOR (48-bit) ke dalam S-Box untuk mendapatkan 32-bit
    const sboxRes = sBoxSubstitute(xorResult);
    const sboxOutput = sboxRes.output;
    const sboxDetails = sboxRes.details;

    // 4. Permutation (P)
    // Menyusun ulang hasil S-Box menggunakan tabel P
    const finalResult = permute(sboxOutput, P);

    // Mengembalikan object berisi semua intermediate values untuk UI
    return {
        inputR: R,
        inputKey: subkey,
        expandedR: expandedR,
        xorResult: xorResult,
        sboxDetails: sboxDetails,
        sboxOutput: sboxOutput,
        finalResult: finalResult
    };
}
