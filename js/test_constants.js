/**
 * Test script untuk validasi constants.js
 * Jalankan dengan: node js/test_constants.js
 */

// Load constants — gunakan vm agar variabel const terdefinisi di scope ini
const vm = require('vm');
const fs = require('fs');
const code = fs.readFileSync('./js/constants.js', 'utf8');
vm.runInThisContext(code);

let allPassed = true;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
    } else {
        console.log(`  ❌ FAIL: ${message}`);
        allPassed = false;
    }
}

console.log('=== VALIDASI CONSTANTS.JS ===\n');

// 1. Validasi ukuran tabel
console.log('1. Validasi ukuran tabel:');
assert(IP.length === 64,         `IP  memiliki ${IP.length} elemen (harus 64)`);
assert(IP_INV.length === 64,     `IP_INV memiliki ${IP_INV.length} elemen (harus 64)`);
assert(PC1.length === 56,        `PC1 memiliki ${PC1.length} elemen (harus 56)`);
assert(PC2.length === 48,        `PC2 memiliki ${PC2.length} elemen (harus 48)`);
assert(E.length === 48,          `E memiliki ${E.length} elemen (harus 48)`);
assert(P.length === 32,          `P memiliki ${P.length} elemen (harus 32)`);
assert(SHIFT_SCHEDULE.length === 16, `SHIFT_SCHEDULE memiliki ${SHIFT_SCHEDULE.length} elemen (harus 16)`);
assert(S_BOXES.length === 8,     `S_BOXES memiliki ${S_BOXES.length} S-Box (harus 8)`);

// 2. Validasi S-Box dimensions (4x16)
console.log('\n2. Validasi dimensi S-Box:');
for (let i = 0; i < 8; i++) {
    assert(S_BOXES[i].length === 4, `S${i+1} memiliki ${S_BOXES[i].length} baris (harus 4)`);
    for (let row = 0; row < 4; row++) {
        assert(S_BOXES[i][row].length === 16, `S${i+1} baris ${row} memiliki ${S_BOXES[i][row].length} kolom (harus 16)`);
    }
}

// 3. Validasi S-Box values (harus 0-15)
console.log('\n3. Validasi nilai S-Box (harus 0-15):');
for (let i = 0; i < 8; i++) {
    let valid = true;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 16; col++) {
            if (S_BOXES[i][row][col] < 0 || S_BOXES[i][row][col] > 15) {
                valid = false;
            }
        }
    }
    assert(valid, `S${i+1} semua nilai dalam range 0-15`);
}

// 4. Validasi IP dan IP_INV saling inverse
console.log('\n4. Validasi IP dan IP_INV saling inverse:');
let ipInvValid = true;
for (let i = 0; i < 64; i++) {
    // IP memetakan posisi IP[i] ke posisi i+1
    // IP_INV harus memetakan posisi i+1 kembali ke IP[i]
    // Artinya: IP_INV[IP[i]-1] harus = i+1
    if (IP_INV[IP[i] - 1] !== i + 1) {
        ipInvValid = false;
        console.log(`    IP_INV[IP[${i}]-1] = IP_INV[${IP[i]-1}] = ${IP_INV[IP[i]-1]}, expected ${i+1}`);
    }
}
assert(ipInvValid, 'IP_INV(IP(x)) = x untuk semua posisi');

// 5. Validasi PC1 tidak mengandung bit parity (8,16,24,32,40,48,56,64)
console.log('\n5. Validasi PC1 membuang parity bits:');
const parityBits = [8, 16, 24, 32, 40, 48, 56, 64];
let pc1NoParity = true;
for (const pb of parityBits) {
    if (PC1.includes(pb)) {
        pc1NoParity = false;
        console.log(`    PC1 mengandung parity bit ${pb}!`);
    }
}
assert(pc1NoParity, 'PC1 tidak mengandung parity bits (8,16,24,32,40,48,56,64)');

// 6. Validasi SHIFT_SCHEDULE total = 28
console.log('\n6. Validasi SHIFT_SCHEDULE:');
const totalShift = SHIFT_SCHEDULE.reduce((a, b) => a + b, 0);
assert(totalShift === 28, `Total shift = ${totalShift} (harus 28, agar C16=C0)`);
assert(SHIFT_SCHEDULE[0] === 1, `Round 1 shift = ${SHIFT_SCHEDULE[0]} (harus 1)`);
assert(SHIFT_SCHEDULE[1] === 1, `Round 2 shift = ${SHIFT_SCHEDULE[1]} (harus 1)`);
assert(SHIFT_SCHEDULE[8] === 1, `Round 9 shift = ${SHIFT_SCHEDULE[8]} (harus 1)`);
assert(SHIFT_SCHEDULE[15] === 1, `Round 16 shift = ${SHIFT_SCHEDULE[15]} (harus 1)`);

// 7. Validasi beberapa nilai spesifik dari FIPS 46-3
console.log('\n7. Validasi nilai spesifik FIPS 46-3:');
assert(IP[0] === 58,     `IP[0] = ${IP[0]} (harus 58)`);
assert(IP[63] === 7,     `IP[63] = ${IP[63]} (harus 7)`);
assert(IP_INV[0] === 40, `IP_INV[0] = ${IP_INV[0]} (harus 40)`);
assert(PC1[0] === 57,    `PC1[0] = ${PC1[0]} (harus 57)`);
assert(PC2[0] === 14,    `PC2[0] = ${PC2[0]} (harus 14)`);
assert(E[0] === 32,      `E[0] = ${E[0]} (harus 32)`);
assert(P[0] === 16,      `P[0] = ${P[0]} (harus 16)`);

// S1[0][0] = 14
assert(S_BOXES[0][0][0] === 14, `S1[0][0] = ${S_BOXES[0][0][0]} (harus 14)`);
// S8[3][15] = 11
assert(S_BOXES[7][3][15] === 11, `S8[3][15] = ${S_BOXES[7][3][15]} (harus 11)`);

console.log('\n' + '='.repeat(40));
if (allPassed) {
    console.log('🎉 SEMUA TEST PASSED! constants.js VALID.');
} else {
    console.log('⚠️  ADA TEST YANG GAGAL. Periksa kembali.');
}
console.log('='.repeat(40));
