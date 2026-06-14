/**
 * ============================================================
 *  script.js — Main Controller & Event Handlers
 * ============================================================
 *
 * Mengatur interaksi pengguna, membaca input, memvalidasi data,
 * memanggil algoritma DES, dan mengirimkan hasil ke ui.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------
    // DOM Elements
    // --------------------------------------------------------
    const formatRadios = document.querySelectorAll('input[name="format"]');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    
    const keyInput = document.getElementById('keyInput');
    const dataInput = document.getElementById('dataInput');
    
    const keyLengthIndicator = document.getElementById('keyLength');
    const dataLengthIndicator = document.getElementById('dataLength');
    
    const btnRun = document.getElementById('btnRun');
    const btnReset = document.getElementById('btnReset');
    const btnRoundTrip = document.getElementById('btnRoundTrip');
    
    const errorMsgBox = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('resultsSection');
    
    const outputHex = document.getElementById('outputHex');
    const outputBin = document.getElementById('outputBin');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // --------------------------------------------------------
    // Tab Navigation Logic
    // --------------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Hapus class active dari semua
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Tambahkan class active ke yang di-klik
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --------------------------------------------------------
    // Input Validation & Length Indicators
    // --------------------------------------------------------
    function updateLengthIndicators() {
        const format = document.querySelector('input[name="format"]:checked').value;
        const expectedLen = format === 'hex' ? 16 : 64;
        
        const keyVal = keyInput.value.replace(/\s/g, '');
        const dataVal = dataInput.value.replace(/\s/g, '');
        
        // Update Key Indicator
        keyLengthIndicator.textContent = `${keyVal.length}/${expectedLen}`;
        if (keyVal.length === expectedLen) {
            keyLengthIndicator.className = 'length-indicator valid';
        } else {
            keyLengthIndicator.className = 'length-indicator invalid';
        }
        
        // Update Data Indicator
        dataLengthIndicator.textContent = `${dataVal.length}/${expectedLen}`;
        if (dataVal.length === expectedLen) {
            dataLengthIndicator.className = 'length-indicator valid';
        } else {
            dataLengthIndicator.className = 'length-indicator invalid';
        }
    }

    keyInput.addEventListener('input', updateLengthIndicators);
    dataInput.addEventListener('input', updateLengthIndicators);
    
    formatRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isHex = radio.value === 'hex';
            const placeholder = isHex ? 'Masukkan 16 karakter Hex...' : 'Masukkan 64 bit Biner...';
            
            keyInput.placeholder = placeholder;
            dataInput.placeholder = placeholder;
            
            // Bersihkan input saat ganti format (agar tidak bingung)
            keyInput.value = '';
            dataInput.value = '';
            
            updateLengthIndicators();
        });
    });

    // --------------------------------------------------------
    // Tampilkan Error
    // --------------------------------------------------------
    function showError(msg) {
        errorMsgBox.textContent = msg;
        errorMsgBox.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }

    function hideError() {
        errorMsgBox.classList.add('hidden');
    }

    // --------------------------------------------------------
    // Main Run Execution
    // --------------------------------------------------------
    btnRun.addEventListener('click', () => {
        hideError();
        
        const format = document.querySelector('input[name="format"]:checked').value;
        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        // Validasi Key (Pasti 64-bit biner yang diharapkan)
        const keyValidation = validateInput(keyInput.value, format, 64);
        if (!keyValidation.valid) return showError("Key Error: " + keyValidation.message);
        
        // Validasi Data
        const dataValidation = validateInput(dataInput.value, format, 64);
        if (!dataValidation.valid) return showError("Data Error: " + dataValidation.message);
        
        try {
            // Ambil string biner
            const keyBin = keyValidation.binary;
            const dataBin = dataValidation.binary;
            
            // Eksekusi Algoritma DES!
            let resultData;
            if (mode === 'encrypt') {
                resultData = desEncrypt(dataBin, keyBin);
            } else {
                resultData = desDecrypt(dataBin, keyBin);
            }
            
            // Render Hasil ke UI
            displayResults(resultData);
            
        } catch (error) {
            showError("Terjadi kesalahan sistem: " + error.message);
            console.error(error);
        }
    });

    // --------------------------------------------------------
    // Display Results Logic
    // --------------------------------------------------------
    function displayResults(desData) {
        // 1. Tampilkan section hasil
        resultsSection.classList.remove('hidden');
        
        // 2. Set Final Output
        const finalBin = desData.output;
        const finalHex = binaryToHex(finalBin);
        
        // Format biner biar ada spasi per 8 bit agar estetik
        let prettyBin = '';
        for(let i=0; i<finalBin.length; i+=8) prettyBin += finalBin.substring(i, i+8) + ' ';
        
        outputHex.textContent = finalHex;
        outputBin.textContent = prettyBin.trim();
        
        // 3. Render Visualisasi Data lewat ui.js
        renderKeySchedule(desData.keySchedule);
        renderKeyScheduleDetails(desData.keySchedule);  // Tambahan: Detail accordion per round
        renderRounds(desData.rounds);
        initSBoxVisualization(desData.rounds);
        
        // Scroll pelan-pelan ke hasil
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --------------------------------------------------------
    // Fitur Copy Output
    // --------------------------------------------------------
    [outputHex, outputBin].forEach(el => {
        el.addEventListener('click', () => {
            const textToCopy = el.textContent.replace(/\s/g, ''); // Hapus spasi saat dicopy
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = el.textContent;
                el.textContent = "Copied!";
                setTimeout(() => { el.textContent = originalText; }, 1000);
            });
        });
    });

    // --------------------------------------------------------
    // Reset Button
    // --------------------------------------------------------
    btnReset.addEventListener('click', () => {
        keyInput.value = '';
        dataInput.value = '';
        document.getElementById('formatHex').checked = true;
        document.getElementById('modeEncrypt').checked = true;
        
        keyInput.placeholder = 'Masukkan 16 karakter Hex...';
        dataInput.placeholder = 'Masukkan 16 karakter Hex...';
        
        hideError();
        resultsSection.classList.add('hidden');
        updateLengthIndicators();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --------------------------------------------------------
    // Round-Trip Test Button (Testing Otomatis)
    // --------------------------------------------------------
    btnRoundTrip.addEventListener('click', () => {
        // Paksa reset ke nilai uji standar
        document.getElementById('formatHex').checked = true;
        document.getElementById('modeEncrypt').checked = true;
        
        // Plaintext = 0123456789ABCDEF, Key = 133457799BBCDFF1
        keyInput.value = "133457799BBCDFF1";
        dataInput.value = "0123456789ABCDEF";
        updateLengthIndicators();
        
        // Jalankan click enkripsi
        btnRun.click();
        
        // Setelah enkripsi, simulasikan klik OK untuk decrypt
        setTimeout(() => {
            alert("Enkripsi selesai! Output Hex = " + outputHex.textContent + "\n\nSelanjutnya akan otomatis mengubah mode ke Decrypt dan mencoba mendekripsinya kembali.");
            
            document.getElementById('modeDecrypt').checked = true;
            dataInput.value = outputHex.textContent; // Masukkan cipher ke input
            
            // Jalankan click dekripsi
            btnRun.click();
            
            setTimeout(() => {
                alert("Dekripsi selesai! Output = " + outputHex.textContent + "\n(Kembali ke plaintext awal)");
            }, 500);
            
        }, 500);
    });

    // Inisialisasi awal
    updateLengthIndicators();
});
