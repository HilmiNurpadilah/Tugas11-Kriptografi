/**
 * ============================================================
 *  des.js — Orchestrator Utama Algoritma DES
 * ============================================================
 *
 * Modul ini menggabungkan semua komponen sebelumnya untuk
 * melakukan proses ENCRYPT dan DECRYPT secara utuh.
 *
 * Alur Encrypt:
 * 1. Generate 16 subkeys dari Key (K1..K16)
 * 2. Initial Permutation (IP) pada Plaintext
 * 3. Split L0 dan R0
 * 4. 16 Round Feistel:
 *    L_i = R_{i-1}
 *    R_i = L_{i-1} XOR f(R_{i-1}, K_i)
 * 5. Final Swap (L16 dan R16 ditukar menjadi R16 L16)
 * 6. Inverse Initial Permutation (IP^-1) -> Ciphertext
 *
 * Alur Decrypt:
 * Sama persis dengan Encrypt, hanya saja urutan subkey
 * DIBALIK (K16..K1).
 */

// ============================================================
//  desAlgorithm(input64, key64, mode)
// ============================================================
/**
 * Fungsi utama DES yang mengeksekusi 16 round.
 *
 * @param {string} input64 - Plaintext/Ciphertext 64-bit biner
 * @param {string} key64 - Kunci 64-bit biner
 * @param {string} mode - "encrypt" atau "decrypt"
 * @returns {object} Object berisi ciphertext/plaintext dan seluruh detail round
 */
function desAlgorithm(input64, key64, mode) {
    if (input64.length !== 64) throw new Error("Input data harus 64 bit");
    if (key64.length !== 64) throw new Error("Key harus 64 bit");

    // 1. Generate Subkeys
    const keySchedule = generateSubkeys(key64);
    const subkeys = keySchedule.subkeys;

    // Jika decrypt, balik urutan subkey
    // Hati-hati: reverse() mengubah array asli, jadi kita buat copy dulu
    const roundKeys = mode === 'decrypt' ? [...subkeys].reverse() : subkeys;

    // 2. Initial Permutation (IP)
    const ipResult = permute(input64, IP);

    // 3. Split L0 dan R0
    let L = ipResult.substring(0, 32);
    let R = ipResult.substring(32, 64);

    const roundDetails = [];

    // 4. 16 Round Feistel
    for (let i = 0; i < 16; i++) {
        const currentL = L;
        const currentR = R;
        const currentKey = roundKeys[i];

        // L_i = R_{i-1}
        L = currentR;

        // R_i = L_{i-1} XOR f(R_{i-1}, K_i)
        const feistel = feistelFunction(currentR, currentKey);
        R = xorBinary(currentL, feistel.finalResult);

        // Simpan detail untuk UI
        roundDetails.push({
            round: i + 1,
            leftInput: currentL,
            rightInput: currentR,
            subkey: currentKey,
            feistel: feistel,
            newRight: R
        });
    }

    // 5. Final Swap (Tukar L16 dan R16)
    // Ingat: Setelah round 16, L dan R ditukar posisinya (R16 L16)
    const preOutput = R + L;

    // 6. Inverse Initial Permutation (IP^-1)
    const finalResult = permute(preOutput, IP_INV);

    return {
        output: finalResult,
        keySchedule: keySchedule,
        ipResult: ipResult,
        rounds: roundDetails,
        preOutput: preOutput
    };
}

// ============================================================
//  desEncrypt(plaintext, key)
// ============================================================
function desEncrypt(plaintext, key) {
    return desAlgorithm(plaintext, key, 'encrypt');
}

// ============================================================
//  desDecrypt(ciphertext, key)
// ============================================================
function desDecrypt(ciphertext, key) {
    return desAlgorithm(ciphertext, key, 'decrypt');
}
