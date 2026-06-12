/**
 * ============================================================
 *  sbox.js — Substitusi S-Box DES
 * ============================================================
 *
 * Modul ini menangani proses substitusi non-linear menggunakan
 * 8 S-Box yang didefinisikan dalam konstanta DES.
 *
 * Input: 48-bit (hasil XOR antara Expansion E(R) dan Subkey)
 * Output: 32-bit
 *
 * Dependencies:
 * - constants.js (S_BOXES)
 */

// ============================================================
//  sBoxLookup(sixBits, sBoxIndex)
// ============================================================
/**
 * Melakukan substitusi untuk SATU S-Box (6 bit → 4 bit).
 *
 * @param {string} sixBits - String biner 6 bit (contoh: "101011")
 * @param {number} sBoxIndex - Index S-Box (0-7, mewakili S1-S8)
 * @returns {object} Detail hasil substitusi untuk visualisasi
 */
function sBoxLookup(sixBits, sBoxIndex) {
    if (sixBits.length !== 6) {
        throw new Error(`Input S-Box harus 6 bit, tapi mendapat ${sixBits.length} bit`);
    }

    // 1. Row (Baris) = bit pertama + bit terakhir
    const rowBits = sixBits[0] + sixBits[5];
    const row = parseInt(rowBits, 2); // Konversi biner ke desimal (0-3)

    // 2. Column (Kolom) = 4 bit di tengah (bit 2,3,4,5)
    const colBits = sixBits.substring(1, 5);
    const col = parseInt(colBits, 2); // Konversi biner ke desimal (0-15)

    // 3. Lookup ke tabel S-Box
    const value = S_BOXES[sBoxIndex][row][col];

    // 4. Ubah nilai desimal ke 4-bit biner
    let outBits = value.toString(2);
    // Pad dengan '0' di depan jika kurang dari 4 bit
    while (outBits.length < 4) {
        outBits = '0' + outBits;
    }

    // Kembalikan objek dengan detail lengkap agar UI bisa memvisualisasikan cara kerjanya
    return {
        input: sixBits,
        rowBits: rowBits,
        row: row,
        colBits: colBits,
        col: col,
        value: value,
        output: outBits
    };
}

// ============================================================
//  sBoxSubstitute(input48bit)
// ============================================================
/**
 * Melakukan proses substitusi lengkap untuk ke-8 S-Box.
 *
 * @param {string} input48bit - String biner 48 bit
 * @returns {object} { output: "32-bit", details: [array of 8 S-Box details] }
 */
function sBoxSubstitute(input48bit) {
    if (input48bit.length !== 48) {
        throw new Error(`S-Box Substitute membutuhkan 48 bit, tapi mendapat ${input48bit.length} bit`);
    }

    let finalOutput = '';
    const details = [];

    // Proses 8 blok (masing-masing 6 bit)
    for (let i = 0; i < 8; i++) {
        // Ambil 6 bit untuk S-Box ke-i
        const startIdx = i * 6;
        const sixBits = input48bit.substring(startIdx, startIdx + 6);

        // Lakukan substitusi
        const sBoxResult = sBoxLookup(sixBits, i);

        // Gabungkan 4-bit hasil ke output akhir
        finalOutput += sBoxResult.output;

        // Simpan detail
        details.push(sBoxResult);
    }

    return {
        output: finalOutput, // 32-bit string biner
        details: details     // Array berisi 8 objek untuk visualisasi
    };
}
