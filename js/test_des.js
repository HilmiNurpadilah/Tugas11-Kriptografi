/**
 * Test script untuk validasi des.js (Full DES Algorithm)
 * Jalankan dengan: node js/test_des.js
 *
 * Menggunakan test vector NIST:
 * Key = 133457799BBCDFF1
 * Plaintext = 0123456789ABCDEF
 * Ciphertext = 85E813540F0AB405
 */

const vm = require('vm');
const fs = require('fs');

// Load semua dependencies secara berurutan
vm.runInThisContext(fs.readFileSync('./js/constants.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/converter.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/permutation.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/keySchedule.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/sbox.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/feistel.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/des.js', 'utf8'));

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

console.log('=== VALIDASI FULL ALGORITMA DES ===\n');

// Test Vector NIST
const keyHex = '133457799BBCDFF1';
const plaintextHex = '0123456789ABCDEF';
const expectedCiphertextHex = '85E813540F0AB405';

const keyBin = hexToBinary(keyHex);
const plaintextBin = hexToBinary(plaintextHex);
const expectedCiphertextBin = hexToBinary(expectedCiphertextHex);

console.log('Test Vectors:');
console.log(`Key:        ${keyHex}`);
console.log(`Plaintext:  ${plaintextHex}`);
console.log(`Ciphertext: ${expectedCiphertextHex}\n`);

// -------------------------------------------------------
// 1. Uji Enkripsi
// -------------------------------------------------------
console.log('1. Menguji Proses Enkripsi (desEncrypt):');
const encryptResult = desEncrypt(plaintextBin, keyBin);
const actualCiphertextHex = binaryToHex(encryptResult.output);

assertEqual(encryptResult.output, expectedCiphertextBin, 'Hasil enkripsi biner cocok dengan standar NIST');
assertEqual(actualCiphertextHex, expectedCiphertextHex, 'Hasil enkripsi hexadecimal cocok dengan standar NIST');

// -------------------------------------------------------
// 2. Uji Dekripsi
// -------------------------------------------------------
console.log('\n2. Menguji Proses Dekripsi (desDecrypt):');
// Dekripsi menggunakan ciphertext dari hasil ekspektasi
const decryptResult = desDecrypt(expectedCiphertextBin, keyBin);
const actualPlaintextHex = binaryToHex(decryptResult.output);

assertEqual(decryptResult.output, plaintextBin, 'Hasil dekripsi biner cocok dengan plaintext awal');
assertEqual(actualPlaintextHex, plaintextHex, 'Hasil dekripsi hexadecimal cocok dengan plaintext awal');

// -------------------------------------------------------
// 3. Round-Trip Test
// -------------------------------------------------------
console.log('\n3. Menguji Round-Trip Test (Encrypt -> Decrypt):');
const randomMsgHex = 'FEDCBA9876543210';
const randomKeyHex = '1F2E3D4C5B6A7988';

const encrypted = desEncrypt(hexToBinary(randomMsgHex), hexToBinary(randomKeyHex));
const decrypted = desDecrypt(encrypted.output, hexToBinary(randomKeyHex));

assertEqual(binaryToHex(decrypted.output), randomMsgHex, `Round-Trip Test sukses untuk data: ${randomMsgHex}`);

// -------------------------------------------------------
// Summary
// -------------------------------------------------------
console.log('\n' + '='.repeat(50));
if (failed === 0) {
    console.log(`🎉 SEMUA TEST PASSED! (${passed}/${passed + failed})`);
    console.log(`\nALGORITMA DES TELAH TERIMPLEMENTASI DENGAN SEMPURNA! 🚀`);
} else {
    console.log(`⚠️  ${failed} TEST GAGAL dari ${passed + failed} total.`);
}
console.log('='.repeat(50));
