/**
 * Test script untuk validasi feistel.js
 * Jalankan dengan: node js/test_feistel.js
 */

const vm = require('vm');
const fs = require('fs');

// Load semua dependencies secara berurutan
vm.runInThisContext(fs.readFileSync('./js/constants.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/converter.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/permutation.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/sbox.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/feistel.js', 'utf8'));

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
    if (actual === expected) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${message}`);
        console.log(`         Expected: "${expected}"`);
        console.log(`         Actual:   "${actual}"`);
        failed++;
    }
}

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

console.log('=== VALIDASI FEISTEL.JS ===\n');

// -------------------------------------------------------
// Setup: Data Test Vector DES (Round 1)
// -------------------------------------------------------
// R0 dalam Hex = "F0AAF0AA"
const R0_hex = 'F0AAF0AA';
const R0_bin = hexToBinary(R0_hex);

// K1 (Subkey round 1) dalam binary dari referensi test_keySchedule.js
const K1_bin = '000110110000001011101111111111000111000001110010';

console.log(`Test Vector Round 1:`);
console.log(`R0 (32-bit): ${R0_bin} (Hex: ${R0_hex})`);
console.log(`K1 (48-bit): ${K1_bin}\n`);

// Eksekusi fungsi Feistel
const result = feistelFunction(R0_bin, K1_bin);

// -------------------------------------------------------
// 1. Validasi Panjang Output (Bit Lengths)
// -------------------------------------------------------
console.log('1. Validasi Panjang Output tiap langkah:');
assertEqual(result.expandedR.length, 48, 'Hasil Expansion E harus 48 bit');
assertEqual(result.xorResult.length, 48, 'Hasil XOR harus 48 bit');
assertEqual(result.sboxOutput.length, 32, 'Hasil S-Box harus 32 bit');
assertEqual(result.finalResult.length, 32, 'Hasil akhir fungsi Feistel harus 32 bit');

// -------------------------------------------------------
// 2. Validasi Nilai f(R0, K1)
// -------------------------------------------------------
console.log('\n2. Validasi Nilai Hasil Feistel f(R0, K1):');
// Berdasarkan referensi DES:
// L0 = CC00CCFF
// R1 = 43CB75CE
// R1 = L0 XOR f(R0, K1) -> f(R0, K1) = L0 XOR R1
// CC00CCFF XOR 43CB75CE = 8FCBB931
const expected_f_hex = '8FCBB931';
const expected_f_bin = hexToBinary(expected_f_hex);

console.log(`Expected (Hex): ${expected_f_hex}`);
console.log(`Expected (Bin): ${expected_f_bin}`);
console.log(`Actual (Bin):   ${result.finalResult}`);
console.log(`Actual (Hex):   ${binaryToHex(result.finalResult)}`);

assertEqual(result.finalResult, expected_f_bin, 'Nilai f(R0, K1) sesuai referensi (dalam Biner)');
assertEqual(binaryToHex(result.finalResult), expected_f_hex, 'Nilai f(R0, K1) sesuai referensi (dalam Hex)');

// -------------------------------------------------------
// 3. Error Handling
// -------------------------------------------------------
console.log('\n3. Error Handling:');
try {
    feistelFunction('101', K1_bin); // Invalid R length
    assert(false, 'Should throw error on invalid R length');
} catch (e) {
    assert(true, `Throws error on invalid R length: ${e.message}`);
}

try {
    feistelFunction(R0_bin, '101'); // Invalid Key length
    assert(false, 'Should throw error on invalid Subkey length');
} catch (e) {
    assert(true, `Throws error on invalid Subkey length: ${e.message}`);
}

// -------------------------------------------------------
// Summary
// -------------------------------------------------------
console.log('\n' + '='.repeat(50));
if (failed === 0) {
    console.log(`🎉 SEMUA TEST PASSED! (${passed}/${passed + failed})`);
} else {
    console.log(`⚠️  ${failed} TEST GAGAL dari ${passed + failed} total.`);
}
console.log('='.repeat(50));
