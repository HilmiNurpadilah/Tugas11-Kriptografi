/**
 * ============================================================
 *  ui.js — UI Rendering & Visualization Logic
 * ============================================================
 *
 * Modul ini bertanggung jawab khusus untuk me-render HTML
 * dinamis berdasarkan hasil proses DES (key schedule, rounds,
 * dan s-box).
 */

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Format bit string dengan spasi setiap 4 atau 6 bit agar mudah dibaca
function formatBits(binaryStr, groupSize = 4) {
    let result = '';
    for (let i = 0; i < binaryStr.length; i += groupSize) {
        result += binaryStr.substring(i, i + groupSize) + ' ';
    }
    return result.trim();
}

// Convert binary ke hexadecimal untuk display
function binaryToHexForDisplay(binaryStr) {
    let hex = '';
    for (let i = 0; i < binaryStr.length; i += 4) {
        const fourBits = binaryStr.substring(i, i + 4);
        hex += parseInt(fourBits, 2).toString(16).toUpperCase();
        if (i + 4 < binaryStr.length && (i + 4) % 32 === 0) hex += ' '; // Spasi setiap 8 hex char (32 bit)
    }
    return hex;
}

// Format khusus untuk 56 bit (dibagi 28-bit C dan 28-bit D)
function formatCiDi(binaryStr) {
    if (binaryStr.length !== 56) return binaryStr;
    const C = binaryStr.substring(0, 28);
    const D = binaryStr.substring(28, 56);
    return `<span class="bit-c">${formatBits(C, 4)}</span> <span class="bit-d">${formatBits(D, 4)}</span>`;
}

// ------------------------------------------------------------
// Render Key Schedule Table
// ------------------------------------------------------------
function renderKeySchedule(keyScheduleData) {
    // Render Detail Initial Key & PC-1
    document.getElementById('ksInitialKeyBin').textContent = formatBits(keyScheduleData.originalKey, 8);
    document.getElementById('ksPc1Result').textContent = formatBits(keyScheduleData.pc1Result, 7);
    document.getElementById('ksC0').textContent = formatBits(keyScheduleData.C0, 4);
    document.getElementById('ksD0').textContent = formatBits(keyScheduleData.D0, 4);

    const tbody = document.getElementById('keyScheduleBody');
    tbody.innerHTML = '';

    // Render baris inisial (Round 0)
    const initTr = document.createElement('tr');
    initTr.innerHTML = `
        <td>Init</td>
        <td>-</td>
        <td class="bit-c">${formatBits(keyScheduleData.C0, 4)}</td>
        <td class="bit-d">${formatBits(keyScheduleData.D0, 4)}</td>
        <td>-</td>
    `;
    tbody.appendChild(initTr);

    // Render baris 1-16
    keyScheduleData.rounds.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>R${r.round}</td>
            <td>${r.shiftCount}</td>
            <td class="bit-c">${formatBits(r.C, 4)}</td>
            <td class="bit-d">${formatBits(r.D, 4)}</td>
            <td class="bit-k">${formatBits(r.subkey, 6)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// Render Key Schedule Detail Accordion
// ============================================================
/**
 * Render accordion detail untuk setiap round key schedule
 * dengan visualisasi yang lebih terstruktur dan educational.
 * 
 * Data yang ditampilkan per round:
 * - Shift amount
 * - Cn (Register C setelah shift)
 * - Dn (Register D setelah shift)  
 * - PC-2 Result (Subkey Kn 48-bit)
 * 
 * @param {object} keyScheduleData - Objek dari generateSubkeys()
 */
function renderKeyScheduleDetails(keyScheduleData) {
    const container = document.getElementById('ksRoundsAccordion');
    if (!container) return; // Safety check
    
    container.innerHTML = '';

    keyScheduleData.rounds.forEach((r, idx) => {
        const item = document.createElement('div');
        item.className = 'ks-round-item';
        
        // Buka Round 1 dan Round 16 secara default untuk referensi
        if (idx === 0 || idx === 15) item.classList.add('active');

        // Render header dengan info round dan shift
        const headerHTML = `
            <button class="ks-round-header" onclick="toggleKeyScheduleRound(this)">
                <div class="round-label">
                    <span class="ks-round-number">R${r.round}</span>
                    <span class="ks-shift-info">
                        Shift: <strong>${r.shiftCount}</strong>
                    </span>
                </div>
                <span class="ks-icon">▼</span>
            </button>
        `;

        // Render content dengan detail
        const contentHTML = `
            <div class="ks-round-content">
                <div class="ks-round-detail">
                    <!-- Column 1 -->
                    <div class="ks-detail-row">
                        <div class="ks-detail-label">
                            Shift Amount (positions)
                        </div>
                        <div class="ks-detail-value" style="font-weight: 700; font-size: 1rem;">
                            ${r.shiftCount} bit${r.shiftCount > 1 ? 's' : ''}
                        </div>
                    </div>

                    <!-- Column 2: Placeholder untuk format -->
                    <div></div>

                    <!-- Full width: C Register -->
                    <div style="grid-column: 1 / 2;">
                        <div class="ks-detail-label">C<sub>${r.round}</sub> After Shift (28-bit)</div>
                        <div class="ks-detail-value bit-c">${formatBits(r.C, 4)}</div>
                    </div>

                    <!-- Full width: D Register -->
                    <div style="grid-column: 2 / 3;">
                        <div class="ks-detail-label">D<sub>${r.round}</sub> After Shift (28-bit)</div>
                        <div class="ks-detail-value bit-d">${formatBits(r.D, 4)}</div>
                    </div>

                    <!-- Full width: PC-2 Result (Subkey) -->
                    <div style="grid-column: 1 / -1; margin-top: 0.5rem;">
                        <div class="ks-detail-label">PC-2 Permutation Result → Subkey K<sub>${r.round}</sub> (48-bit)</div>
                        <div class="ks-detail-value bit-k">${formatBits(r.subkey, 6)}</div>
                    </div>
                </div>
            </div>
        `;

        item.innerHTML = headerHTML + contentHTML;
        container.appendChild(item);
    });
}

// Fungsi toggle untuk key schedule accordion
window.toggleKeyScheduleRound = function(btn) {
    const item = btn.parentElement;
    item.classList.toggle('active');
};

// ============================================================
// Render Feistel Rounds Accordion
// ============================================================
function renderRounds(roundsData) {
    const container = document.getElementById('roundsAccordion');
    container.innerHTML = '';

    roundsData.forEach((r, idx) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        // Item pertama otomatis terbuka
        if (idx === 0) item.classList.add('active');

        // Struktur isi accordion
        item.innerHTML = `
            <button class="accordion-header" onclick="toggleAccordion(this)">
                <span>Round ${r.round}</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="round-detail-grid">
                    <div class="rd-label">Left Input (L<sub>${r.round-1}</sub>)</div>
                    <div class="rd-value">${formatBits(r.leftInput)}</div>
                    
                    <div class="rd-label">Right Input (R<sub>${r.round-1}</sub>)</div>
                    <div class="rd-value">${formatBits(r.rightInput)}</div>
                    
                    <div class="rd-divider"></div>
                    
                    <div class="rd-label">Expansion (E)</div>
                    <div class="rd-value">${formatBits(r.feistel.expandedR, 6)}</div>
                    
                    <div class="rd-label">Subkey K<sub>${r.round}</sub></div>
                    <div class="rd-value bit-k">${formatBits(r.feistel.inputKey, 6)}</div>
                    
                    <div class="rd-label">E ⊕ K</div>
                    <div class="rd-value">${formatBits(r.feistel.xorResult, 6)}</div>
                    
                    <div class="rd-divider"></div>
                    
                    <div class="rd-label">S-Box Output</div>
                    <div class="rd-value bit-c">${formatBits(r.feistel.sboxOutput)}</div>
                    
                    <div class="rd-label">Permutation (P)</div>
                    <div class="rd-value">${formatBits(r.feistel.finalResult)}</div>
                    
                    <div class="rd-divider"></div>
                    
                    <div class="rd-label">L<sub>${r.round-1}</sub> ⊕ f(R,K)</div>
                    <div class="rd-value bit-success">${formatBits(r.newRight)}</div>
                    
                    <div class="rd-label">New Status</div>
                    <div class="rd-value">L<sub>${r.round}</sub> = R<sub>${r.round-1}</sub> | R<sub>${r.round}</sub> = Hasil ⊕</div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ------------------------------------------------------------
// Fungsi pembantu accordion toggle
// ------------------------------------------------------------
window.toggleAccordion = function(btn) {
    const item = btn.parentElement;
    item.classList.toggle('active');
};

// ------------------------------------------------------------
// Render S-Box Details
// ------------------------------------------------------------
let globalRoundsData = null; // Menyimpan data untuk dropdown s-box

function initSBoxVisualization(roundsData) {
    globalRoundsData = roundsData;
    const select = document.getElementById('sboxRoundSelect');
    
    // Isi opsi dropdown 1-16
    select.innerHTML = '';
    for (let i = 1; i <= 16; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Round ${i}`;
        select.appendChild(option);
    }

    // Set default ke Round 1
    renderSBoxForRound(1);

    // Event listener
    select.addEventListener('change', (e) => {
        renderSBoxForRound(parseInt(e.target.value));
    });
}

function renderSBoxForRound(roundNumber) {
    if (!globalRoundsData) return;

    // Ambil data detail sbox pada round terkait (index = roundNumber - 1)
    const roundData = globalRoundsData[roundNumber - 1];
    const sboxDetails = roundData.feistel.sboxDetails;

    const container = document.getElementById('sboxDetailsContainer');
    container.innerHTML = '';

    sboxDetails.forEach((detail, idx) => {
        const card = document.createElement('div');
        card.className = 'sbox-card';
        
        card.innerHTML = `
            <div class="sb-header">
                <span class="sb-title">S-Box ${idx + 1}</span>
                <span class="sb-input">${detail.input}</span>
            </div>
            <div class="sb-detail">
                <span>Row (bit 1,6):</span>
                <strong>${detail.rowBits} (${detail.row})</strong>
            </div>
            <div class="sb-detail">
                <span>Col (bit 2-5):</span>
                <strong>${detail.colBits} (${detail.col})</strong>
            </div>
            <div class="sb-detail">
                <span>Tabel S${idx+1}[${detail.row}][${detail.col}]:</span>
                <strong>${detail.value}</strong>
            </div>
            <div class="sb-output">
                ${detail.output}
            </div>
        `;
        container.appendChild(card);
    });
}
