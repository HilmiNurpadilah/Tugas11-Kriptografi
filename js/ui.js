/**
 * ============================================================
 *  ui.js — UI Rendering & Visualization Logic
 * ============================================================
 *
 * Modul ini bertanggung jawab khusus untuk me-render HTML
 * dinamis berdasarkan hasil proses DES (key schedule, rounds,
 * dan s-box).
 */

// Format bit string dengan spasi setiap 4 atau 6 bit agar mudah dibaca
function formatBits(binaryStr, groupSize = 4) {
    let result = '';
    for (let i = 0; i < binaryStr.length; i += groupSize) {
        result += binaryStr.substring(i, i + groupSize) + ' ';
    }
    return result.trim();
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

// ------------------------------------------------------------
// Render Feistel Rounds Accordion
// ------------------------------------------------------------
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
