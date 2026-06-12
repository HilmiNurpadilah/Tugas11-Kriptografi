/**
 * ============================================================
 *  converter.js — Konversi Format Data untuk DES
 * ============================================================
 *
 * Modul ini menyediakan fungsi-fungsi untuk:
 * 1. Konversi Hexadecimal ↔ Binary
 * 2. Validasi format input (hex dan binary)
 * 3. Padding string ke panjang tertentu
 *
 * Semua fungsi bekerja dengan STRING, bukan number,
 * karena DES memproses data sebagai deretan bit (karakter).
 *
 * Contoh:
 *   hexToBinary("A3") → "10100011"
 *   binaryToHex("10100011") → "A3"
 */

// ============================================================
//  TABEL LOOKUP HEX → BINARY
// ============================================================
/**
 * Mapping setiap karakter hex ke 4-bit binary.
 * Menggunakan object lookup lebih cepat dan jelas daripada
 * melakukan konversi matematis setiap kali.
 */
const HEX_TO_BIN_MAP = {
    '0': '0000', '1': '0001', '2': '0010', '3': '0011',
    '4': '0100', '5': '0101', '6': '0110', '7': '0111',
    '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
    'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111'
};

// ============================================================
//  TABEL LOOKUP BINARY → HEX (kebalikan)
// ============================================================
/**
 * Mapping setiap 4-bit binary ke karakter hex.
 * Dibuat otomatis dari HEX_TO_BIN_MAP agar konsisten.
 */
const BIN_TO_HEX_MAP = {};
for (const [hex, bin] of Object.entries(HEX_TO_BIN_MAP)) {
    BIN_TO_HEX_MAP[bin] = hex;
}

// ============================================================
//  hexToBinary(hexString)
// ============================================================
/**
 * Mengkonversi string heksadesimal menjadi string biner.
 *
 * Cara kerja:
 * 1. Ubah semua huruf ke uppercase (agar 'a' = 'A')
 * 2. Hapus spasi (jika ada)
 * 3. Untuk setiap karakter hex, lookup 4-bit binary-nya
 * 4. Gabungkan semua hasil menjadi satu string biner
 *
 * @param {string} hexString - String hex, contoh: "A3F0"
 * @returns {string} String biner, contoh: "1010001111110000"
 *
 * Contoh:
 *   hexToBinary("0123456789ABCDEF")
 *   → "0000000100100011010001010110011110001001101010111100110111101111"
 */
function hexToBinary(hexString) {
    // Langkah 1: Normalisasi — uppercase dan hapus spasi
    const hex = hexString.toUpperCase().replace(/\s/g, '');

    // Langkah 2: Konversi karakter per karakter
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        const char = hex[i];
        const bits = HEX_TO_BIN_MAP[char];

        // Jika karakter tidak valid, throw error
        if (bits === undefined) {
            throw new Error(`Karakter hex tidak valid: '${char}' pada posisi ${i}`);
        }

        binary += bits;
    }

    return binary;
}

// ============================================================
//  binaryToHex(binaryString)
// ============================================================
/**
 * Mengkonversi string biner menjadi string heksadesimal.
 *
 * Cara kerja:
 * 1. Hapus spasi
 * 2. Pastikan panjang kelipatan 4 (pad dengan '0' di depan jika perlu)
 * 3. Ambil setiap 4 bit, lookup karakter hex-nya
 * 4. Gabungkan semua karakter hex
 *
 * @param {string} binaryString - String biner, contoh: "10100011"
 * @returns {string} String hex (uppercase), contoh: "A3"
 *
 * Contoh:
 *   binaryToHex("0000000100100011010001010110011110001001101010111100110111101111")
 *   → "0123456789ABCDEF"
 */
function binaryToHex(binaryString) {
    // Langkah 1: Hapus spasi
    let bin = binaryString.replace(/\s/g, '');

    // Langkah 2: Pad agar panjang kelipatan 4
    // Contoh: "101" → "0101" (tambah '0' di depan)
    const remainder = bin.length % 4;
    if (remainder !== 0) {
        bin = '0'.repeat(4 - remainder) + bin;
    }

    // Langkah 3: Konversi setiap 4 bit ke hex
    let hex = '';
    for (let i = 0; i < bin.length; i += 4) {
        const nibble = bin.substring(i, i + 4);
        const hexChar = BIN_TO_HEX_MAP[nibble];

        // Jika 4-bit tidak valid (mengandung selain 0/1)
        if (hexChar === undefined) {
            throw new Error(`Bit tidak valid: '${nibble}' pada posisi ${i}`);
        }

        hex += hexChar;
    }

    return hex;
}

// ============================================================
//  validateBinary(input)
// ============================================================
/**
 * Memvalidasi apakah string input adalah binary valid.
 *
 * Kriteria:
 * - Hanya berisi karakter '0' dan '1'
 * - Tidak kosong (setelah hapus spasi)
 *
 * @param {string} input - String yang akan divalidasi
 * @returns {object} { valid: boolean, message: string }
 */
function validateBinary(input) {
    const cleaned = input.replace(/\s/g, '');

    if (cleaned.length === 0) {
        return { valid: false, message: 'Input tidak boleh kosong.' };
    }

    // Regex: hanya boleh '0' dan '1'
    if (!/^[01]+$/.test(cleaned)) {
        return { valid: false, message: 'Input biner hanya boleh berisi 0 dan 1.' };
    }

    return { valid: true, message: 'Valid.' };
}

// ============================================================
//  validateHex(input)
// ============================================================
/**
 * Memvalidasi apakah string input adalah hexadecimal valid.
 *
 * Kriteria:
 * - Hanya berisi karakter 0-9 dan A-F (case insensitive)
 * - Tidak kosong (setelah hapus spasi)
 *
 * @param {string} input - String yang akan divalidasi
 * @returns {object} { valid: boolean, message: string }
 */
function validateHex(input) {
    const cleaned = input.replace(/\s/g, '');

    if (cleaned.length === 0) {
        return { valid: false, message: 'Input tidak boleh kosong.' };
    }

    // Regex: hanya boleh 0-9, A-F, a-f
    if (!/^[0-9A-Fa-f]+$/.test(cleaned)) {
        return { valid: false, message: 'Input hex hanya boleh berisi 0-9 dan A-F.' };
    }

    return { valid: true, message: 'Valid.' };
}

// ============================================================
//  validateInput(input, format, expectedBitLength)
// ============================================================
/**
 * Validasi lengkap: format + panjang bit.
 *
 * DES membutuhkan input tepat 64-bit. Fungsi ini memeriksa:
 * 1. Format valid (hex/binary)
 * 2. Panjang sesuai yang diharapkan
 *
 * @param {string} input - String input dari user
 * @param {string} format - 'binary' atau 'hex'
 * @param {number} expectedBitLength - Panjang bit yang diharapkan (64 untuk DES)
 * @returns {object} { valid: boolean, message: string, binary: string }
 */
function validateInput(input, format, expectedBitLength) {
    const cleaned = input.replace(/\s/g, '');

    if (format === 'binary') {
        // Validasi format binary
        const result = validateBinary(cleaned);
        if (!result.valid) return result;

        // Validasi panjang
        if (cleaned.length !== expectedBitLength) {
            return {
                valid: false,
                message: `Input biner harus ${expectedBitLength} bit, tapi Anda memasukkan ${cleaned.length} bit.`
            };
        }

        return { valid: true, message: 'Valid.', binary: cleaned };

    } else if (format === 'hex') {
        // Validasi format hex
        const result = validateHex(cleaned);
        if (!result.valid) return result;

        // Hitung panjang bit (1 hex = 4 bit)
        const expectedHexLength = expectedBitLength / 4;
        if (cleaned.length !== expectedHexLength) {
            return {
                valid: false,
                message: `Input hex harus ${expectedHexLength} karakter (${expectedBitLength} bit), tapi Anda memasukkan ${cleaned.length} karakter.`
            };
        }

        // Konversi ke binary
        return { valid: true, message: 'Valid.', binary: hexToBinary(cleaned) };

    } else {
        return { valid: false, message: `Format tidak dikenal: '${format}'` };
    }
}

// ============================================================
//  XOR dua string biner
// ============================================================
/**
 * Melakukan operasi XOR pada dua string biner dengan panjang sama.
 *
 * XOR (Exclusive OR):
 *   0 XOR 0 = 0
 *   0 XOR 1 = 1
 *   1 XOR 0 = 1
 *   1 XOR 1 = 0
 *
 * @param {string} a - String biner pertama
 * @param {string} b - String biner kedua (panjang harus sama dengan a)
 * @returns {string} Hasil XOR
 *
 * Contoh:
 *   xorBinary("1010", "1100") → "0110"
 */
function xorBinary(a, b) {
    if (a.length !== b.length) {
        throw new Error(`XOR: panjang tidak sama (${a.length} vs ${b.length})`);
    }

    let result = '';
    for (let i = 0; i < a.length; i++) {
        // XOR: sama = '0', beda = '1'
        result += (a[i] === b[i]) ? '0' : '1';
    }
    return result;
}
