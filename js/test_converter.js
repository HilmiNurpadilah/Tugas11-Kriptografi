/**
 * Test script untuk validasi converter.js
 * Jalankan dengan: node js/test_converter.js
 */

const vm = require('vm');
const fs = require('fs');

// Load converter.js
vm.runInThisContext(fs.readFileSync('./js/converter.js', 'utf8'));

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

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

console.log('=== VALIDASI CONVERTER.JS ===\n');

// -------------------------------------------------------
// 1. Test hexToBinary
// -------------------------------------------------------
console.log('1. Test hexToBinary():');

// Test dasar
assertEqual(hexToBinary('0'), '0000', 'hexToBinary("0") = "0000"');
assertEqual(hexToBinary('F'), '1111', 'hexToBinary("F") = "1111"');
assertEqual(hexToBinary('A'), '1010', 'hexToBinary("A") = "1010"');
assertEqual(hexToBinary('5'), '0101', 'hexToBinary("5") = "0101"');

// Test multi-karakter
assertEqual(hexToBinary('FF'), '11111111', 'hexToBinary("FF") = "11111111"');
assertEqual(hexToBinary('00'), '00000000', 'hexToBinary("00") = "00000000"');
assertEqual(hexToBinary('A3'), '10100011', 'hexToBinary("A3") = "10100011"');

// Test DES test vector
assertEqual(
    hexToBinary('0123456789ABCDEF'),
    '0000000100100011010001010110011110001001101010111100110111101111',
    'hexToBinary("0123456789ABCDEF") — DES plaintext test vector'
);

assertEqual(
    hexToBinary('133457799BBCDFF1'),
    '0001001100110100010101110111100110011011101111001101111111110001',
    'hexToBinary("133457799BBCDFF1") — DES key test vector'
);

// Test case insensitive
assertEqual(hexToBinary('ab'), hexToBinary('AB'), 'Case insensitive: "ab" = "AB"');
assertEqual(hexToBinary('cDeF'), hexToBinary('CDEF'), 'Case insensitive: "cDeF" = "CDEF"');

// Test dengan spasi (harus diabaikan)
assertEqual(hexToBinary('A3 F0'), hexToBinary('A3F0'), 'Spasi diabaikan: "A3 F0" = "A3F0"');

// -------------------------------------------------------
// 2. Test binaryToHex
// -------------------------------------------------------
console.log('\n2. Test binaryToHex():');

assertEqual(binaryToHex('0000'), '0', 'binaryToHex("0000") = "0"');
assertEqual(binaryToHex('1111'), 'F', 'binaryToHex("1111") = "F"');
assertEqual(binaryToHex('1010'), 'A', 'binaryToHex("1010") = "A"');
assertEqual(binaryToHex('10100011'), 'A3', 'binaryToHex("10100011") = "A3"');

// Test DES test vector (round-trip)
assertEqual(
    binaryToHex('0000000100100011010001010110011110001001101010111100110111101111'),
    '0123456789ABCDEF',
    'binaryToHex — DES plaintext round-trip'
);

// Test padding (panjang bukan kelipatan 4)
assertEqual(binaryToHex('101'), '5', 'binaryToHex("101") auto-pad → "0101" = "5"');
assertEqual(binaryToHex('1'), '1', 'binaryToHex("1") auto-pad → "0001" = "1"');

// -------------------------------------------------------
// 3. Test round-trip (hex → bin → hex)
// -------------------------------------------------------
console.log('\n3. Test round-trip (hex → binary → hex):');

const testValues = ['0', 'F', 'FF', '0123456789ABCDEF', '133457799BBCDFF1', '85E813540F0AB405'];
for (const val of testValues) {
    const bin = hexToBinary(val);
    const hex = binaryToHex(bin);
    assertEqual(hex, val, `Round-trip: "${val}" → binary → "${hex}"`);
}

// -------------------------------------------------------
// 4. Test validateBinary
// -------------------------------------------------------
console.log('\n4. Test validateBinary():');

assert(validateBinary('01010101').valid === true, '"01010101" valid');
assert(validateBinary('00000000').valid === true, '"00000000" valid');
assert(validateBinary('11111111').valid === true, '"11111111" valid');
assert(validateBinary('').valid === false, 'String kosong invalid');
assert(validateBinary('012').valid === false, '"012" invalid (karakter 2)');
assert(validateBinary('10a01').valid === false, '"10a01" invalid (karakter a)');

// -------------------------------------------------------
// 5. Test validateHex
// -------------------------------------------------------
console.log('\n5. Test validateHex():');

assert(validateHex('0123456789ABCDEF').valid === true, '"0123456789ABCDEF" valid');
assert(validateHex('abcdef').valid === true, '"abcdef" valid (lowercase)');
assert(validateHex('').valid === false, 'String kosong invalid');
assert(validateHex('GHIJ').valid === false, '"GHIJ" invalid');
assert(validateHex('12XY').valid === false, '"12XY" invalid');

// -------------------------------------------------------
// 6. Test validateInput (validasi lengkap DES 64-bit)
// -------------------------------------------------------
console.log('\n6. Test validateInput() — DES 64-bit:');

// Binary valid 64-bit
let result = validateInput('0000000100100011010001010110011110001001101010111100110111101111', 'binary', 64);
assert(result.valid === true, 'Binary 64-bit valid');
assertEqual(result.binary, '0000000100100011010001010110011110001001101010111100110111101111', 'Binary value preserved');

// Binary wrong length
result = validateInput('0101', 'binary', 64);
assert(result.valid === false, 'Binary 4-bit invalid (harus 64)');

// Hex valid 16-karakter
result = validateInput('0123456789ABCDEF', 'hex', 64);
assert(result.valid === true, 'Hex 16-karakter valid');
assertEqual(
    result.binary,
    '0000000100100011010001010110011110001001101010111100110111101111',
    'Hex dikonversi ke binary 64-bit'
);

// Hex wrong length
result = validateInput('ABCD', 'hex', 64);
assert(result.valid === false, 'Hex 4-karakter invalid (harus 16)');

// -------------------------------------------------------
// 7. Test xorBinary
// -------------------------------------------------------
console.log('\n7. Test xorBinary():');

assertEqual(xorBinary('0000', '0000'), '0000', '0000 XOR 0000 = 0000');
assertEqual(xorBinary('1111', '1111'), '0000', '1111 XOR 1111 = 0000');
assertEqual(xorBinary('1010', '1100'), '0110', '1010 XOR 1100 = 0110');
assertEqual(xorBinary('1010', '0101'), '1111', '1010 XOR 0101 = 1111');
assertEqual(xorBinary('0000', '1111'), '1111', '0000 XOR 1111 = 1111');

// Test panjang 48-bit (ukuran subkey DES)
const a48 = '110100010010010001001010101010101010010101101101';
const b48 = '011001010010001000000100101010100110101000100010';
const xorResult = xorBinary(a48, b48);
assertEqual(xorResult.length, 48, 'XOR 48-bit menghasilkan 48-bit');

// Verifikasi XOR properties: a XOR b XOR b = a
assertEqual(xorBinary(xorResult, b48), a48, 'XOR self-inverse: (a XOR b) XOR b = a');

// -------------------------------------------------------
// 8. Test error handling
// -------------------------------------------------------
console.log('\n8. Test error handling:');

try {
    hexToBinary('GG');
    assert(false, 'hexToBinary("GG") seharusnya throw error');
} catch (e) {
    assert(true, `hexToBinary("GG") throws: "${e.message}"`);
}

try {
    xorBinary('101', '1010');
    assert(false, 'xorBinary panjang beda seharusnya throw error');
} catch (e) {
    assert(true, `xorBinary panjang beda throws: "${e.message}"`);
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
