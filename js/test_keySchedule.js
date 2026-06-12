/**
 * Test script untuk validasi keySchedule.js
 * Jalankan dengan: node js/test_keySchedule.js
 *
 * Menggunakan test vector DES resmi:
 * Key = 133457799BBCDFF1 (hex)
 *
 * Referensi subkeys dari: https://page.math.tu-berlin.de/~kant/teaching/hess/krypto-ws2006/des.htm
 */

const vm = require('vm');
const fs = require('fs');

// Load semua dependencies secara berurutan
vm.runInThisContext(fs.readFileSync('./js/constants.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/converter.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/permutation.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/keySchedule.js', 'utf8'));

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

console.log('=== VALIDASI KEYSCHEDULE.JS ===\n');

// -------------------------------------------------------
// Setup: DES Test Vector
// -------------------------------------------------------
const keyHex = '133457799BBCDFF1';
const keyBinary = hexToBinary(keyHex);

console.log(`Key (hex):    ${keyHex}`);
console.log(`Key (binary): ${keyBinary}`);
console.log(`Key length:   ${keyBinary.length} bit\n`);

// Generate subkeys
const result = generateSubkeys(keyBinary);

// -------------------------------------------------------
// 1. Test PC-1 Result
// -------------------------------------------------------
console.log('1. Test PC-1 Result:');
assertEqual(result.pc1Result.length, 56, 'PC-1 output = 56 bit');
assertEqual(result.pc1Result, '11110000110011001010101011110101010101100110011110001111',
    'PC-1 result sesuai referensi');

// -------------------------------------------------------
// 2. Test C0 dan D0
// -------------------------------------------------------
console.log('\n2. Test C0 dan D0:');
assertEqual(result.C0, '1111000011001100101010101111', 'C0 sesuai referensi');
assertEqual(result.D0, '0101010101100110011110001111', 'D0 sesuai referensi');

// -------------------------------------------------------
// 3. Test jumlah subkeys
// -------------------------------------------------------
console.log('\n3. Test jumlah subkeys:');
assertEqual(result.subkeys.length, 16, 'Menghasilkan 16 subkeys');
assertEqual(result.rounds.length, 16, 'Menghasilkan 16 round details');

// -------------------------------------------------------
// 4. Test setiap subkey (48-bit)
// -------------------------------------------------------
console.log('\n4. Test panjang subkey:');
for (let i = 0; i < 16; i++) {
    assert(result.subkeys[i].length === 48, `K${i+1} = ${result.subkeys[i].length} bit (harus 48)`);
}

// -------------------------------------------------------
// 5. Validasi subkeys terhadap referensi DES
// -------------------------------------------------------
console.log('\n5. Validasi subkeys terhadap referensi DES:');

// Subkeys yang benar untuk key 133457799BBCDFF1
// Sumber: referensi implementasi DES standar
const expectedSubkeys = [
    '000110110000001011101111111111000111000001110010', // K1
    '011110011010111011011001110110111100100111100101', // K2
    '010101011111110010001010010000101100111110011001', // K3
    '011100101010110111010110110110110011010100011101', // K4
    '011111001110110000000111111010110101001110101000', // K5
    '011000111010010100111110010100000111101100101111', // K6
    '111011001000010010110111111101100001100010111100', // K7
    '111101111000101000111010110000010011101111111011', // K8
    '111000001101101111101011111011011110011110000001', // K9
    '101100011111001101000111101110100100011001001111', // K10
    '001000010101111111010011110111101101001110000110', // K11
    '011101010111000111110101100101000110011111101001', // K12
    '100101111100010111010001111110101011101001000001', // K13
    '010111110100001110110111111100101110011100111010', // K14
    '101111111001000110001101001111010011111100001010', // K15
    '110010110011110110001011000011100001011111110101'  // K16
];

for (let i = 0; i < 16; i++) {
    assertEqual(result.subkeys[i], expectedSubkeys[i],
        `K${(i+1).toString().padStart(2, ' ')} = ${result.subkeys[i].substring(0, 20)}...`);
}

// -------------------------------------------------------
// 6. Validasi C dan D setiap round
// -------------------------------------------------------
console.log('\n6. Validasi C dan D setiap round:');

// Referensi C dan D untuk setiap round
const expectedC = [
    '1110000110011001010101011111', // C1
    '1100001100110010101010111111', // C2
    '0000110011001010101011111111', // C3
    '0011001100101010101111111100', // C4
    '1100110010101010111111110000', // C5
    '0011001010101011111111000011', // C6
    '1100101010101111111100001100', // C7
    '0010101010111111110000110011', // C8
    '0101010101111111100001100110', // C9
    '0101010111111110000110011001', // C10
    '0101011111111000011001100101', // C11
    '0101111111100001100110010101', // C12
    '0111111110000110011001010101', // C13
    '1111111000011001100101010101', // C14
    '1111100001100110010101010111', // C15
    '1111000011001100101010101111'  // C16
];

const expectedD = [
    '1010101011001100111100011110', // D1
    '0101010110011001111000111101', // D2
    '0101011001100111100011110101', // D3
    '0101100110011110001111010101', // D4
    '0110011001111000111101010101', // D5
    '1001100111100011110101010101', // D6
    '0110011110001111010101010110', // D7
    '1001111000111101010101011001', // D8
    '0011110001111010101010110011', // D9
    '1111000111101010101011001100', // D10
    '1100011110101010101100110011', // D11
    '0001111010101010110011001111', // D12
    '0111101010101011001100111100', // D13
    '1110101010101100110011110001', // D14
    '1010101010110011001111000111', // D15
    '0101010101100110011110001111'  // D16
];

for (let i = 0; i < 16; i++) {
    assertEqual(result.rounds[i].C, expectedC[i],
        `C${(i+1).toString().padStart(2, ' ')} sesuai referensi`);
    assertEqual(result.rounds[i].D, expectedD[i],
        `D${(i+1).toString().padStart(2, ' ')} sesuai referensi`);
}

// -------------------------------------------------------
// 7. Verifikasi shift schedule
// -------------------------------------------------------
console.log('\n7. Verifikasi shift schedule:');
const expectedShifts = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
for (let i = 0; i < 16; i++) {
    assertEqual(result.rounds[i].shiftCount, expectedShifts[i],
        `Round ${(i+1).toString().padStart(2, ' ')} shift = ${result.rounds[i].shiftCount}`);
}

// -------------------------------------------------------
// 8. Verifikasi C16 = C0 dan D16 = D0 (full rotation)
// -------------------------------------------------------
console.log('\n8. Verifikasi full rotation:');
assertEqual(result.rounds[15].C, result.C0, 'C16 = C0 (full rotation)');
assertEqual(result.rounds[15].D, result.D0, 'D16 = D0 (full rotation)');

// -------------------------------------------------------
// 9. Tampilkan key schedule lengkap (untuk visualisasi)
// -------------------------------------------------------
console.log('\n9. Key Schedule Lengkap:');
console.log('─'.repeat(120));
console.log(`${'Round'.padEnd(7)} ${'Shift'.padEnd(7)} ${'Ci (28 bit)'.padEnd(32)} ${'Di (28 bit)'.padEnd(32)} ${'Ki (48 bit)'}`);
console.log('─'.repeat(120));

console.log(`${'Init'.padEnd(7)} ${'-'.padEnd(7)} ${result.C0.padEnd(32)} ${result.D0.padEnd(32)} -`);

for (let i = 0; i < 16; i++) {
    const r = result.rounds[i];
    console.log(
        `${('R' + r.round).padEnd(7)} ` +
        `${r.shiftCount.toString().padEnd(7)} ` +
        `${r.C.padEnd(32)} ` +
        `${r.D.padEnd(32)} ` +
        `${r.subkey}`
    );
}
console.log('─'.repeat(120));

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
