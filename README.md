# Portofolio Retro-Futuristik

![Made with HTML, CSS, & JS](https://img.shields.io/badge/Made%20with-HTML%2C%20CSS%2C%20JS-orange?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg?style=for-the-badge)

> Sebuah portofolio pribadi berkonsep *Single-Page Application* (SPA) dengan estetika Retro-Futuristik, terinspirasi dari antarmuka terminal komputer klasik, CRT monitor, dan nuansa cyberpunk.

Selamat datang di terminal portofolio saya. `Initializing systems... Boot sequence complete.`

---

![Screenshot Aplikasi]
![image](https://github.com/user-attachments/assets/04e68284-4e64-453f-9cff-084fa2784954)


## 🚀 Tentang Proyek Ini

Portofolio ini dirancang untuk menjadi lebih dari sekadar halaman statis. Tujuannya adalah untuk menyajikan profil, proyek, dan keahlian saya (Agung Pradana) dalam format yang unik, interaktif, dan berkesan. Setiap elemen, mulai dari animasi ketik hingga efek *scanline*, dirancang untuk menciptakan pengalaman pengguna yang imersif dan menyenangkan.

Proyek ini dibangun sepenuhnya dengan teknologi web fundamental tanpa menggunakan framework eksternal, menunjukkan penguasaan mendalam pada HTML5, CSS3, dan Vanilla JavaScript.

## ✨ Fitur Utama

Proyek ini dilengkapi dengan berbagai fitur interaktif:

* **Estetika Retro-Futuristik:** Lengkap dengan efek CRT overlay, *scanlines*, dan skema warna neon yang terinspirasi dari terminal klasik.
* **Navigasi SPA (Single-Page Application):** Perpindahan antar halaman (Profile, Projects, dll.) terjadi secara instan tanpa perlu me-reload halaman.
* **Animasi Dinamis:**
    * Efek ketik (*typewriter*) pada judul dan teks untuk nuansa terminal.
    * Animasi *on-scroll* untuk bar keahlian (*skill bars*) yang akan terisi saat terlihat di layar.
* **Galeri Proyek Interaktif:**
    * Fitur filter berdasarkan kategori (All, Web, Data).
    * Fungsi pencarian real-time untuk menemukan proyek.
    * Modal Pratinjau Proyek yang detail dengan galeri gambar (*thumbnail*) dan deskripsi lengkap.
* **Galeri Sertifikat:** Menampilkan sertifikat atau pencapaian dalam sebuah modal yang elegan.
* **Formulir Kontak Fungsional:** Terintegrasi langsung dengan **WhatsApp**, memudahkan perekrut atau klien untuk menghubungi.
* **Sistem Audio:** Dilengkapi dengan musik latar yang bisa di-toggle (play/pause) dan efek suara untuk interaksi pengguna.
* **Easter Egg:** Coba masukkan **Konami Code** (`↑ ↑ ↓ ↓ ← → ← → B A`) untuk sebuah kejutan!
* **Desain Responsif:** Tampilan yang dioptimalkan untuk berbagai ukuran layar, dari desktop hingga mobile.

## 🛠️ Teknologi yang Digunakan

* **HTML5:** Untuk struktur semantik konten.
* **CSS3:** Untuk styling dan semua efek visual, termasuk *Custom Properties (Variables)*, *Flexbox*, *Grid*, dan *Animations/Keyframes*.
* **Vanilla JavaScript (ES6+):** Untuk semua logika, interaktivitas, manipulasi DOM, dan manajemen event tanpa ketergantungan pada library eksternal.
* **Font Awesome:** Untuk ikonografi.

## ⚙️ Cara Menjalankan

Proyek ini tidak memerlukan proses instalasi atau server.

1.  **Clone atau Unduh Repository**
    ```bash
    git clone [https://github.com/iamberro/Portofolio.git](https://github.com/iamberro/Portofolio.git])
    ```
    Atau cukup unduh file ZIP-nya.

2.  **Pastikan Semua File dalam Satu Folder**
    Letakkan `index.html`, `styles.css`, `script.js`, dan semua aset (gambar, audio) sesuai dengan struktur folder yang ada.

3.  **Buka di Browser**
    Cukup klik dua kali pada file `index.html`. Portofolio akan langsung berjalan di browser default Anda.

## 🎨 Kustomisasi

Anda bisa dengan mudah mengadaptasi portofolio ini untuk kebutuhan Anda sendiri:

* **Mengganti Teks:** Buka `index.html` dan edit langsung konten teks seperti nama, bio, deskripsi proyek, dll.
* **Mengganti Warna:** Buka `styles.css`. Semua warna utama didefinisikan di bagian paling atas dalam blok `:root`. Anda bisa mengganti nilai variabel seperti `--retro-green` atau `--retro-purple` untuk mengubah tema warna secara keseluruhan.
* **Mengganti Data Proyek:** Buka `script.js` dan cari objek `const projects = {...}`. Edit atau tambahkan data proyek Anda di sana dengan mengikuti format yang ada.
* **Mengganti Nomor WhatsApp:** Di `script.js`, cari fungsi `sendToWhatsApp()` dan ganti nomor `6282318221577` dengan nomor Anda.
* **Mengganti Gambar & Aset:** Ganti file gambar seperti `agung.png`, `profile.png`, gambar proyek, dan sertifikat di dalam folder aset Anda.

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
