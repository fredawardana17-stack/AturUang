// 1. KONFIGURASI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSy...", // GANTI DENGAN KUNCI API ANDA
  authDomain: "pengeluaran-harian-app.firebaseapp.com", // GANTI DENGAN DOMAIN ANDA
  projectId: "pengeluaran-harian-app", // GANTI DENGAN PROJECT ID ANDA
  // ... dan properti lainnya
};

// Inisialisasi Firebase dan Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const expensesCollection = db.collection("expenses"); // Nama koleksi data

// 2. FUNGSI MENAMBAH PENGELUARAN (CREATE)
const expenseForm = document.getElementById('expense-form');

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseInt(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    if (amount > 0 && category) {
        try {
            await expensesCollection.add({
                amount: amount,
                category: category,
                date: date,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Untuk pengurutan
            });
            console.log("Pengeluaran berhasil dicatat!");
            expenseForm.reset(); // Kosongkan form setelah berhasil
        } catch (error) {
            console.error("Error saat menambahkan dokumen: ", error);
            alert("Gagal mencatat pengeluaran.");
        }
    }
});

// 3. FUNGSI MENAMPILKAN DATA SECARA REAL-TIME (READ & LISTEN)
const expenseList = document.getElementById('expense-list');
const totalAmountSpan = document.getElementById('total-amount');

// Gunakan 'onSnapshot' untuk mendengarkan perubahan data secara real-time
expensesCollection
    .orderBy('timestamp', 'desc') // Urutkan dari yang terbaru
    .limit(10) // Hanya tampilkan 10 transaksi terakhir (opsional)
    .onSnapshot((snapshot) => {
        expenseList.innerHTML = ''; // Kosongkan daftar lama
        let total = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            total += data.amount;

            // Buat elemen HTML untuk setiap pengeluaran
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div>${data.category} - ${data.date}</div>
                <div class="amount">Rp ${data.amount.toLocaleString('id-ID')}</div>
            `;
            expenseList.appendChild(item);
        });

        // Update total pengeluaran
        totalAmountSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        
    }, (error) => {
        console.error("Error mendengarkan perubahan data:", error);
    });

// CATATAN PENTING: Untuk multi-user yang lebih aman, Anda perlu mengimplementasikan Firebase Authentication.