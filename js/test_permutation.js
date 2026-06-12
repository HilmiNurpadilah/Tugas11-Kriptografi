/**
 * Test script untuk validasi permutation.js
 * Jalankan dengan: node js/test_permutation.js
 */

const vm = require('vm');
const fs = require('fs');

// Load dependencies
vm.runInThisContext(fs.readFileSync('./js/constants.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/converter.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/permutation.js', 'utf8'));

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

console.log('=== VALIDASI PERMUTATION.JS ===\n');

// -------------------------------------------------------
// 1. Test permute() — kasus sederhana
// -------------------------------------------------------
console.log('1. Test permute() — kasus sederhana:');

// Test dengan string karakter (untuk visualisasi)
assertEqual(permute('ABCD', [3, 1, 4, 2]), 'CADB', 'permute("ABCD", [3,1,4,2]) = "CADB"');
assertEqual(permute('ABCD', [4, 3, 2, 1]), 'DCBA', 'permute("ABCD", [4,3,2,1]) = "DCBA" (reverse)');
assertEqual(permute('ABCD', [1, 2, 3, 4]), 'ABCD', 'permute("ABCD", [1,2,3,4]) = "ABCD" (identity)');

// Test expansion (output lebih panjang dari input)
assertEqual(permute('AB', [1, 2, 1, 2]), 'ABAB', 'permute("AB", [1,2,1,2]) = "ABAB" (expansion)');

// Test compression (output lebih pendek dari input)
assertEqual(permute('ABCDEF', [2, 4]), 'BD', 'permute("ABCDEF", [2,4]) = "BD" (compression)');

// -------------------------------------------------------
// 2. Test permute() — dengan bit string
// -------------------------------------------------------
console.log('\n2. Test permute() — dengan bit string:');

assertEqual(permute('10110100', [8, 7, 6, 5, 4, 3, 2, 1]), '00101101',
    'Reverse bit: "10110100" → "00101101"');

assertEqual(permute('10110100', [1, 2, 3, 4, 5, 6, 7, 8]), '10110100',
    'Identity permutation: bit tidak berubah');

// -------------------------------------------------------
// 3. Test IP dan IP_INV saling menganulkan
// -------------------------------------------------------
console.log('\n3. Test IP dan IP_INV saling menganulkan:');

// Gunakan DES test vector plaintext: 0123456789ABCDEF
const plaintext = hexToBinary('0123456789ABCDEF');
console.log(`   Input:  ${plaintext}`);
console.log(`   Hex:    0123456789ABCDEF`);

// Terapkan IP
const afterIP = permute(plaintext, IP);
console.log(`   IP(x):  ${afterIP}`);

// Terapkan IP_INV pada hasil IP → harus kembali ke plaintext
const afterIPInv = permute(afterIP, IP_INV);
console.log(`   IP⁻¹(IP(x)): ${afterIPInv}`);

assertEqual(afterIPInv, plaintext, 'IP⁻¹(IP(plaintext)) = plaintext');

// Verifikasi nilai IP yang diketahui dari referensi
// IP(0123456789ABCDEF) = CC00CCFFF0AAF0AA (ini adalah nilai IP yang benar)
const expectedAfterIP = '1100110000000000110011001111111111110000101010101111000010101010';
assertEqual(afterIP, expectedAfterIP, 'IP(0123456789ABCDEF) sesuai referensi');
assertEqual(binaryToHex(afterIP), 'CC00CCFFF0AAF0AA', 'IP result hex = CC00CCFFF0AAF0AA');

// -------------------------------------------------------
// 4. Test PC-1 pada key
// -------------------------------------------------------
console.log('\n4. Test PC-1 pada DES key:');

const key = hexToBinary('133457799BBCDFF1');
console.log(`   Key (64-bit): ${key}`);
console.log(`   Key hex:      133457799BBCDFF1`);

const afterPC1 = permute(key, PC1);
console.log(`   PC-1(key) (56-bit): ${afterPC1}`);

assertEqual(afterPC1.length, 56, `PC-1 output = ${afterPC1.length} bit (harus 56)`);

// Nilai PC-1 yang diketahui dari referensi DES
const expectedPC1 = '11110000110011001010101011110101010101100110011110001111';
assertEqual(afterPC1, expectedPC1, 'PC-1(key) sesuai referensi');

// Split C0 dan D0 (masing-masing 28 bit)
const C0 = afterPC1.substring(0, 28);
const D0 = afterPC1.substring(28, 56);
console.log(`   C0 (28-bit): ${C0}`);
console.log(`   D0 (28-bit): ${D0}`);
assertEqual(C0, '1111000011001100101010101111', 'C0 sesuai referensi');
assertEqual(D0, '0101010101100110011110001111', 'D0 sesuai referensi');

// -------------------------------------------------------
// 5. Test leftCircularShift()
// -------------------------------------------------------
console.log('\n5. Test leftCircularShift():');

// Shift 1 posisi
assertEqual(leftCircularShift('ABCDE', 1), 'BCDEA', 'shift 1: "ABCDE" → "BCDEA"');

// Shift 2 posisi
assertEqual(leftCircularShift('ABCDE', 2), 'CDEAB', 'shift 2: "ABCDE" → "CDEAB"');

// Shift 0 posisi (tidak berubah)
assertEqual(leftCircularShift('ABCDE', 0), 'ABCDE', 'shift 0: "ABCDE" → "ABCDE"');

// Test dengan C0 dari key schedule
// C0 = 1111000011001100101010101111
// Shift 1 → C1 = 1110000110011001010101011111
const C1 = leftCircularShift(C0, 1);
console.log(`   C0: ${C0}`);
console.log(`   C1 (shift 1): ${C1}`);
assertEqual(C1, '1110000110011001010101011111', 'C1 = leftShift(C0, 1) sesuai referensi');

// D0 = 0101010101100110011110001111
// Shift 1 → D1 = 1010101011001100111100011110
const D1 = leftCircularShift(D0, 1);
console.log(`   D0: ${D0}`);
console.log(`   D1 (shift 1): ${D1}`);
assertEqual(D1, '1010101011001100111100011110', 'D1 = leftShift(D0, 1) sesuai referensi');

// Full rotation: shift 28 posisi pada 28-bit string → kembali ke awal
let rotated = C0;
for (let i = 0; i < SHIFT_SCHEDULE.length; i++) {
    rotated = leftCircularShift(rotated, SHIFT_SCHEDULE[i]);
}
assertEqual(rotated, C0, 'Full rotation (28 shifts total): C kembali ke C0');

// -------------------------------------------------------
// 6. Test Expansion E
// -------------------------------------------------------
console.log('\n6. Test Expansion E (32 → 48 bit):');

// R0 = right half setelah IP
// afterIP = CC00CCFFF0AAF0AA → L0 = CC00CCFF, R0 = F0AAF0AA
const R0 = afterIP.substring(32, 64);
console.log(`   R0 (32-bit): ${R0}`);
assertEqual(R0.length, 32, `R0 length = ${R0.length} (harus 32)`);

const expandedR0 = permute(R0, E);
console.log(`   E(R0) (48-bit): ${expandedR0}`);
assertEqual(expandedR0.length, 48, `E(R0) length = ${expandedR0.length} (harus 48)`);

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
