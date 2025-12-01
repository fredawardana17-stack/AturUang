// ------------------------------------
// BAGIAN 1: KONFIGURASI DAN INISIALISASI FIREBASE
// ------------------------------------
// KONFIGURASI FIREBASE Anda
const firebaseConfig = {
apiKey: "AIzaSyD4cW_bN0-JD8yxFUYRzICArfg8uvR7rjQ",
authDomain: "atur-uang-72c45.firebaseapp.com",
projectId: "atur-uang-72c45",
storageBucket: "atur-uang-72c45.firebasestorage.app",
messagingSenderId: "253858636716",
appId: "1:253858636716:web:e9ce111cb14e0ab2a01009",
measurementId: "G-8K7P7B42JE"
};

// Inisialisasi Firebase dan service
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth(); // KRUSIAL UNTUK FUNGSI LOGIN/DAFTAR
const expensesCollection = db.collection("AturUang");

let currentUserId = null; // Variabel global untuk ID pengguna yang sedang login

// ------------------------------------
// BAGIAN 2: DEKLARASI VARIABEL DOM (MENGAMBIL ELEMEN DARI index.html)
// ------------------------------------
// A. Otentikasi
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');

// B. Tampilan Utama
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const userEmailSpan = document.getElementById('user-email');

// C. Formulir Pengeluaran
const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expense-list');
const totalAmountSpan = document.getElementById('total-amount');

// ------------------------------------
// BAGIAN 3: FUNGSI OTENTIKASI (SIGN UP, SIGN IN, SIGN OUT)
// ------------------------------------

async function signUp() {
if (!emailInput || !passwordInput) {
console.error("Elemen input otentikasi tidak ditemukan.");
return;
}
const email = emailInput.value;
const password = passwordInput.value;
authError.textContent = '';

try {
    await auth.createUserWithEmailAndPassword(email, password);
} catch (error) {
    // Tampilkan pesan error
    authError.textContent = 'Gagal Daftar: ' + error.message;
}


}

async function signIn() {
if (!emailInput || !passwordInput) {
console.error("Elemen input otentikasi tidak ditemukan.");
return;
}
const email = emailInput.value;
const password = passwordInput.value;
authError.textContent = '';

try {
    await auth.signInWithEmailAndPassword(email, password);
} catch (error) {
    // Tampilkan pesan error
    authError.textContent = 'Gagal Masuk: ' + error.message;
}


}

function signOut() {
auth.signOut();
}

// Menghubungkan fungsi ke window agar dapat dipanggil dari onclick di HTML
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;

// ------------------------------------
// BAGIAN 4: LISTENER PERUBAHAN STATUS OTENTIKASI (PENGONTROL TAMPILAN)
// ------------------------------------
auth.onAuthStateChanged((user) => {
if (user) {
// Pengguna berhasil login/masuk
currentUserId = user.uid;
authSection.style.display = 'none';
mainApp.style.display = 'block';
userEmailSpan.textContent = user.email;

    // Muat data khusus pengguna ini
    loadExpenses(); 
} else {
    // Pengguna logout atau belum login
    currentUserId = null;
    authSection.style.display = 'block';
    mainApp.style.display = 'none';
    
    // Bersihkan tampilan saat logout
    if (expenseList && totalAmountSpan) {
        expenseList.innerHTML = ''; 
        totalAmountSpan.textContent = `Rp 0`; 
    }
}


});

// ------------------------------------
// BAGIAN 5: FUNGSI PENGELUARAN (CRUD)
// ------------------------------------

// Fungsi 5A: CREATE (Menambahkan Pengeluaran)
if (expenseForm) {
expenseForm.addEventListener('submit', async (e) => {
e.preventDefault();

    if (!currentUserId) {
        alert("Silakan masuk (login) terlebih dahulu!");
        return;
    }
    
    const amount = parseInt(amountInput.value);
    const category = categoryInput.value;
    const description = descriptionInput.value; 
    const date = new Date().toISOString().split('T')[0];
    
    if (amount > 0 && category && description) {
        try {
            await expensesCollection.add({
                amount: amount,
                category: category,
                description: description,
                date: date,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUserId // Simpan ID pengguna
            });
            // Reset form
            amountInput.value = '';
            descriptionInput.value = '';
            categoryInput.value = '';
        } catch (error) {
            console.error("Error saat menambahkan dokumen: ", error);
            alert("Gagal menambahkan transaksi.");
        }
    } else {
         alert("Pastikan jumlah, kategori, dan deskripsi terisi.");
    }
});


}

// Fungsi 5B: READ (Memuat dan Menampilkan Pengeluaran)
function loadExpenses() {
if (!currentUserId || !expenseList || !totalAmountSpan) return;

// Filter data berdasarkan userId pengguna yang login
expensesCollection
    .where('userId', '==', currentUserId) 
    .orderBy('timestamp', 'desc') 
    .onSnapshot(snapshot => {
        expenseList.innerHTML = '';
        let total = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const itemAmount = typeof data.amount === 'number' ? data.amount : 0;
            total += itemAmount;

            const docId = doc.id; 
            
            const item = document.createElement('div');
            item.className = 'expense-item';
            
            // Struktur HTML item pengeluaran
            item.innerHTML = `
                <div style="flex-grow: 1;">
                    <strong>${data.description}</strong> (${data.category}) - ${data.date} 
                </div>
                <div class="amount">Rp ${itemAmount.toLocaleString('id-ID')}</div>
                <div style="display: flex; gap: 8px;">
                    <!-- Tombol Edit -->
                    <button onclick="window.editExpense('${docId}', ${itemAmount}, '${data.category}', '${data.description}')" 
                            style="background: #007bff; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">
                        Edit
                    </button>
                    
                    <!-- Tombol Hapus -->
                    <button onclick="window.deleteExpense('${docId}')" 
                            style="background: #f44336; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">
                        Hapus
                    </button>
                </div>
            `;
            
            expenseList.appendChild(item);
        });
        
        totalAmountSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }, error => {
        console.error("Error saat membaca data: ", error);
    });


}

// Fungsi 5C: UPDATE (Mengedit Pengeluaran)
function editExpense(docId, oldAmount, oldCategory, oldDescription) {
const newAmount = prompt(Edit Jumlah (Lama: ${oldAmount}):, oldAmount);
if (newAmount === null) return;

const newDescription = prompt(`Edit Deskripsi (Lama: ${oldDescription}):`, oldDescription);
if (newDescription === null) return;

const newCategory = prompt(`Edit Kategori (Lama: ${oldCategory}):`, oldCategory);
if (newCategory === null) return;

if (newAmount && newDescription && newCategory) {
    if (confirm("Yakin ingin mengubah transaksi ini?")) {
        (async () => {
            try {
                await expensesCollection.doc(docId).update({
                    amount: parseInt(newAmount), 
                    description: newDescription,
                    category: newCategory
                });
            } catch (error) {
                console.error("Error saat mengupdate dokumen: ", error);
                alert("Gagal mengupdate transaksi.");
            }
        })();
    }
} else {
    alert("Semua kolom harus diisi!");
}


}

// Fungsi 5D: DELETE (Menghapus Pengeluaran)
async function deleteExpense(docId) {
if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
try {
await expensesCollection.doc(docId).delete();
} catch (error) {
console.error("Error saat menghapus dokumen: ", error);
alert("Gagal menghapus transaksi.");
}
}
}

// Membuat fungsi Edit dan Delete tersedia secara global
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;