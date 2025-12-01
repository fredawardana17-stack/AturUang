// 1. KONFIGURASI FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyD4cW_bN0-JD8yxFUYRzICArfg8uvR7rjQ",
    authDomain: "atur-uang-72c45.firebaseapp.com",
    projectId: "atur-uang-72c45",
    storageBucket: "atur-uang-72c45.firebasestorage.app",
    messagingSenderId: "253858636716",
    appId: "1:253858636716:web:e9ce111cb14e0ab2a01009",
    measurementId: "G-8K7P7B42JE"
  };

// Inisialisasi Firebase dan Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const expensesCollection = db.collection("expenses"); // Nama koleksi data

// 2. FUNGSI MENAMBAH PENGELUARAN (CREATE)
// ... (Bagian atas fungsi tetap sama) ...

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseInt(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value; // <-- BARIS BARU
    const date = new Date().toISOString().split('T')[0];
    
    // ... (Cek login dan cek data: pastikan description juga ada)

    if (amount > 0 && category && description) { // <-- Cek description
        try {
            await expensesCollection.add({
                amount: amount,
                category: category,
                description: description, // <-- SIMPAN KE FIRESTORE
                date: date,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUserId 
            });
            // ... (reset form) ...
        } catch (error) {
            // ...
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

            const docId = doc.id; 
            
            const item = document.createElement('div');
            item.className = 'expense-item';
            
            // --- PERUBAHAN DI SINI ---
            // Tampilkan deskripsi sebelum kategori
            item.innerHTML = `
                <div>
                    <strong>${data.description}</strong> (${data.category}) - ${data.date} 
                    <button onclick="deleteExpense('${docId}')" 
                            style="background: #f44336; color: white; border: none; padding: 3px 6px; cursor: pointer; margin-left: 10px;">
                        Hapus
                    </button>
                </div>
                <div class="amount">Rp ${data.amount.toLocaleString('id-ID')}</div>
            `;
            // ---------------------------
            
            expenseList.appendChild(item);
        });

        // Update total pengeluaran
        totalAmountSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        
    }, (error) => {
        console.error("Error mendengarkan perubahan data:", error);
    });

```javascript
// ... (Konfigurasi Firebase dan inisialisasi app/db) ...
const auth = firebase.auth(); 

const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const userEmailSpan = document.getElementById('user-email');
const authError = document.getElementById('auth-error');

const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');

// Fungsi Pendaftaran Pengguna Baru
async function signUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    authError.textContent = ''; // Reset error

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // Otomatis pindah ke main-app karena ada listener onAuthStateChanged
    } catch (error) {
        authError.textContent = 'Gagal Daftar: ' + error.message;
    }
}

// Fungsi Masuk Pengguna
async function signIn() {
    const email = emailInput.value;
    const password = passwordInput.value;
    authError.textContent = ''; // Reset error

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        authError.textContent = 'Gagal Masuk: ' + error.message;
    }
}

// Fungsi Keluar (Logout)
function signOut() {
    auth.signOut();
}

let currentUserId = null; // Simpan ID pengguna yang sedang login

auth.onAuthStateChanged((user) => {
    if (user) {
        // Pengguna berhasil login/masuk
        currentUserId = user.uid; // Simpan ID unik pengguna
        
        authSection.style.display = 'none';
        mainApp.style.display = 'block';
        userEmailSpan.textContent = user.email;

        // Panggil fungsi untuk memuat/mendengarkan pengeluaran di sini
        // Saat ini kita akan menggunakan fungsi 3 (menampilkan data) yang sudah ada
        // (CATATAN: Di tahap berikutnya, kita akan memfilter data berdasarkan currentUserId)
        
    } else {
        // Pengguna logout atau belum login
        currentUserId = null;
        
        authSection.style.display = 'block';
        mainApp.style.display = 'none';
        
        expenseList.innerHTML = ''; // Hapus riwayat pengeluaran
        totalAmountSpan.textContent = 'Rp 0'; // Reset total
    }
});

// CATATAN PENTING: Untuk multi-user yang lebih aman, Anda perlu mengimplementasikan Firebase Authentication.