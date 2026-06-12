/**
 * Test script untuk validasi sbox.js
 * Jalankan dengan: node js/test_sbox.js
 */

const vm = require('vm');
const fs = require('fs');

// Load dependencies
vm.runInThisContext(fs.readFileSync('./js/constants.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/sbox.js', 'utf8'));

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

console.log('=== VALIDASI SBOX.JS ===\n');

// -------------------------------------------------------
// 1. Test sBoxLookup (Single S-Box)
// -------------------------------------------------------
console.log('1. Test sBoxLookup (Single S-Box):');

// Test S1 dengan input "101011"
// Row = b1b6 = 11 (3)
// Col = b2b3b4b5 = 0101 (5)
// S1[3][5] = 9 -> "1001"
let res = sBoxLookup('101011', 0); // index 0 = S1
assertEqual(res.row, 3, 'S1 Row extraction ("101011") -> 3');
assertEqual(res.col, 5, 'S1 Col extraction ("101011") -> 5');
assertEqual(res.value, 9, 'S1[3][5] value -> 9');
assertEqual(res.output, '1001', 'S1 Output -> "1001"');

// Test S8 dengan input "011110"
// Row = 00 (0)
// Col = 1111 (15)
// S8[0][15] = 7 -> "0111"
res = sBoxLookup('011110', 7); // index 7 = S8
assertEqual(res.row, 0, 'S8 Row extraction ("011110") -> 0');
assertEqual(res.col, 15, 'S8 Col extraction ("011110") -> 15');
assertEqual(res.value, 7, 'S8[0][15] value -> 7');
assertEqual(res.output, '0111', 'S8 Output -> "0111"');

// -------------------------------------------------------
// 2. Test sBoxSubstitute (Full 48-bit -> 32-bit)
// -------------------------------------------------------
console.log('\n2. Test sBoxSubstitute (Full 48-bit):');

// Input 48 bit sembarang (semua 0)
// S1[0][0] = 14 ("1110")
// S2[0][0] = 15 ("1111")
// S3[0][0] = 10 ("1010")
// S4[0][0] = 7 ("0111")
// S5[0][0] = 2 ("0010")
// S6[0][0] = 12 ("1100")
// S7[0][0] = 4 ("0100")
// S8[0][0] = 13 ("1101")
// Output yang diharapkan: "1110 1111 1010 0111 0010 1100 0100 1101" (tanpa spasi)
const inputZeros = '000000'.repeat(8);
const expectedOutputZeros = '11101111101001110010110001001101';
const resultZeros = sBoxSubstitute(inputZeros);

assertEqual(resultZeros.output.length, 32, 'Output length is 32-bit');
assertEqual(resultZeros.output, expectedOutputZeros, 'SBoxSubstitute all zeros -> matches S-Box[0][0] for all');
assertEqual(resultZeros.details.length, 8, 'Details array has 8 items');
assertEqual(resultZeros.details[0].value, 14, 'Detail S1 value is 14');
assertEqual(resultZeros.details[7].value, 13, 'Detail S8 value is 13');

// -------------------------------------------------------
// 3. Error Handling
// -------------------------------------------------------
console.log('\n3. Error Handling:');
try {
    sBoxLookup('10101', 0); // 5 bit
    assert(false, 'Should throw error on invalid length for sBoxLookup');
} catch (e) {
    assert(true, `Throws error on 5 bit input: ${e.message}`);
}

try {
    sBoxSubstitute(inputZeros + '0'); // 49 bit
    assert(false, 'Should throw error on invalid length for sBoxSubstitute');
} catch (e) {
    assert(true, `Throws error on 49 bit input: ${e.message}`);
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
