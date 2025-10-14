// Global audio variables
let backgroundMusic;
let isMusicPlaying = false;
let currentPage = 1;
const projectsPerPage = 6;
let allProjects = [];       // Akan menyimpan SEMUA proyek dari JSON
let filteredProjects = [];  // Akan menyimpan proyek setelah difilter/dicari
let allProjectDetails = {};
let paginationListenersAttached = false;

// Tunggu sampai semua elemen HTML dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', function() {
    // FUNGSI UTAMA BARU: Memuat data dari JSON untuk mengisi bagian Proyek dan Pencapaian
    loadAndDisplayContent();

    // Fungsi-fungsi lain dari script asli Anda tetap dipanggil di sini
    initAudioSystem();
    const navLinks = document.querySelectorAll('.retro-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    updateSignatureDate();
    initTypingEffects();
    setupSkillBarObserver();
    setupProfileObserver();
    setupPixelImageEffects();
    setupKonamiCode();
    setupFormSubmission();
    setupProjectFilters();

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // --> INI DIA SOLUSINYA <--
            // Jika link yang diklik sudah memiliki class 'active',
            // hentikan fungsi ini agar tidak melakukan scroll ulang.
            if (this.classList.contains('active')) {
                return;
            }

            playClickSound();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            // Mengambil tinggi header
            const header = document.querySelector('.retro-header');
            const headerHeight = header ? header.offsetHeight : 0;
            
            // Menghitung posisi scroll yang benar
            const targetPosition = targetSection.offsetTop - headerHeight;

            // Scroll ke posisi yang sudah dihitung
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Tetap aktifkan link dan section seperti biasa
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            contentSections.forEach(section => section.classList.remove('active'));
            targetSection.classList.add('active');
        });
    });

    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Filter projects (ditempatkan di sini agar bisa berfungsi setelah proyek dimuat)
    function setupProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.querySelector('.search-input');

        const applyFilters = () => {
            const filterValue = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            const searchTerm = searchInput.value.toLowerCase();

            // Lakukan filter berdasarkan SEMUA proyek
            filteredProjects = allProjects.filter(project => {
                const categoryMatch = filterValue === 'all' || project.category === filterValue;
                // Search di judul, deskripsi, dan tag teknologi
                const searchMatch = 
                    project.title.toLowerCase().includes(searchTerm) ||
                    project.description.toLowerCase().includes(searchTerm) ||
                    project.tech.join(' ').toLowerCase().includes(searchTerm);
                
                return categoryMatch && searchMatch;
            });

            currentPage = 1; // Selalu kembali ke halaman pertama setelah filter
            displayCurrentPageOfProjects();
            setupAndUpdatePagination(); // Perbarui pagination berdasarkan hasil filter
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                playClickSound();
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
    }
});


// --- BAGIAN BARU UNTUK MENGELOLA DATA DARI JSON ---

/**
 * Memuat data dari data.json, lalu memanggil fungsi untuk menampilkannya.
 */
async function loadAndDisplayContent() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        allProjects = data.projects;
        allProjectDetails = data.projects_details;
        filteredProjects = [...allProjects]; // Awalnya, semua proyek ditampilkan

        displayCurrentPageOfProjects();
        setupAndUpdatePagination(); // Fungsi baru untuk mengatur pagination

        buildAchievementCards(data.achievements);
        initAchievementsSection(data.achievements_details);

    } catch (error) {
        console.error('Gagal memuat konten:', error);
    }
}

function displayCurrentPageOfProjects() {
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);

    buildProjectCards(projectsToShow);
    initProjectsSection(allProjectDetails);
}

function setupAndUpdatePagination() {
    const paginationContainer = document.querySelector('.retro-pagination');
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    // Tampilkan atau sembunyikan pagination berdasarkan jumlah halaman
    if (totalPages > 1) {
        paginationContainer.style.display = 'flex';
    } else {
        paginationContainer.style.display = 'none';
        return;
    }

    const pageInfo = document.querySelector('.page-info');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Perbarui teks halaman dan status tombol
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Tambahkan event listener HANYA SEKALI untuk mencegah duplikasi
    if (!paginationListenersAttached) {
        prevBtn.addEventListener('click', () => {
            // Cek 'disabled' mencegah klik ganda yang cepat
            if (prevBtn.disabled) return;
            currentPage--;
            displayCurrentPageOfProjects();
            setupAndUpdatePagination(); // Update lagi setelah klik
        });

        nextBtn.addEventListener('click', () => {
            if (nextBtn.disabled) return;
            currentPage++;
            displayCurrentPageOfProjects();
            setupAndUpdatePagination(); // Update lagi setelah klik
        });

        // Tandai bahwa listener sudah terpasang
        paginationListenersAttached = true;
    }
}

/**
 * Membangun kartu-kartu proyek di halaman utama.
 * @param {Array} projectsData - Array objek proyek dari data.json.
 */
function buildProjectCards(projectsData) {
    const projectContainer = document.getElementById('project-list');
    if (!projectContainer) return;
    projectContainer.innerHTML = '';

    projectsData.forEach(project => {
        const techTags = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
        const badgeHTML = project.badge ? `<div class="project-badge">${project.badge}</div>` : '';

        const projectCardHTML = `
            <div class="project-item" data-category="${project.category}" data-tags="${project.tags}">
                <div class="project-header">
                    <div class="project-icon"><i class="${project.icon}"></i></div>
                    ${badgeHTML}
                </div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">${techTags}</div>
                <div class="project-actions">
                    <button class="retro-btn project-preview-btn"><i class="fas fa-eye"></i> Preview</button>
                </div>
            </div>
        `;
        projectContainer.innerHTML += projectCardHTML;
    });
}

/**
 * Membangun kartu-kartu pencapaian di halaman utama.
 * @param {Array} achievementsData - Array objek pencapaian dari data.json.
 */
function buildAchievementCards(achievementsData) {
    const achievementContainer = document.getElementById('achievement-list');
    if (!achievementContainer) return;
    achievementContainer.innerHTML = '';

    achievementsData.forEach(achievement => {
        const achievementHTML = `
            <div class="trophy-item">
                <div class="trophy-icon ${achievement.color}"><i class="${achievement.icon}"></i></div>
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                <div class="trophy-date">${achievement.date}</div>
            </div>
        `;
        achievementContainer.innerHTML += achievementHTML;
    });
}


// --- KODE ASLI ANDA YANG DIMODIFIKASI & LENGKAP ---

/**
 * Inisialisasi fungsionalitas modal (popup) untuk proyek.
 * Data tidak lagi di-hardcode di sini, tapi diterima sebagai argumen.
 * @param {Object} projectsDetails - Objek detail proyek dari data.json.
 */
function initProjectsSection(projectsDetails) {
    if (!projectsDetails) return;
    const modal = document.getElementById('projectModal');
    const closeModal = document.getElementById('closeModal');
    const mobileCloseModal = document.getElementById('mobileCloseModal');
    const mainPreviewImage = document.getElementById('mainPreviewImage');
    const projectTitle = document.getElementById('projectTitle');
    const projectCategory = document.getElementById('projectCategory');
    const projectDate = document.getElementById('projectDate');
    const projectFullDescription = document.getElementById('projectFullDescription');
    const projectTechTags = document.getElementById('projectTechTags');
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const demoBtn = document.querySelector('#projectModal .project-actions .retro-btn.primary');
    const codeBtn = document.querySelector('#projectModal .project-actions .retro-btn.secondary');

    document.querySelectorAll('.project-preview-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const projectName = this.closest('.project-item').querySelector('h3').textContent;
            const project = projectsDetails[projectName];

            if (project) {
                playAchievementSound();
                projectTitle.textContent = project.title;
                projectCategory.textContent = project.category;
                projectDate.textContent = project.date;
                projectFullDescription.textContent = project.description;
                projectTechTags.innerHTML = project.tech.map(tag => `<span>${tag}</span>`).join('');
                mainPreviewImage.src = project.images[0];
                mainPreviewImage.alt = project.title;

                thumbnailsContainer.innerHTML = '';
                project.images.forEach((img, index) => {
                    const thumb = document.createElement('div');
                    thumb.className = 'thumbnail-item' + (index === 0 ? ' active' : '');
                    thumb.innerHTML = `<img src="${img}" alt="Thumbnail ${index + 1}">`;
                    thumb.addEventListener('click', function () {
                        mainPreviewImage.src = img;
                        document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                    });
                    thumbnailsContainer.appendChild(thumb);
                });

                demoBtn.onclick = () => window.open(project.demoUrl, '_blank');
                codeBtn.onclick = () => window.open(project.codeUrl, '_blank');

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModalHandler() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', closeModalHandler);
    if (mobileCloseModal) mobileCloseModal.addEventListener('click', closeModalHandler);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalHandler();
    });
}

/**
 * Inisialisasi fungsionalitas modal (popup) untuk pencapaian/sertifikat.
 * @param {Object} achievementsDetails - Objek detail pencapaian dari data.json.
 */
function initAchievementsSection(achievementsDetails) {
    if (!achievementsDetails) return;
    const existingModal = document.querySelector('.achievement-modal');
    if (existingModal) existingModal.remove(); // Hapus modal lama jika ada

    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.innerHTML = `
        <span class="modal-close">&times;</span>
        <div class="certificate-container">
            <img class="certificate-image" src="" alt="Certificate">
            <p class="certificate-desc"></p>
        </div>
    `;
    document.body.appendChild(modal);

    document.querySelectorAll('.trophy-item').forEach(item => {
        item.addEventListener('click', function () {
            const title = this.querySelector('h3').textContent;
            const achievement = achievementsDetails[title];

            if (achievement) {
                const img = modal.querySelector('.certificate-image');
                const desc = modal.querySelector('.certificate-desc');

                img.src = achievement.imageUrl;
                img.alt = title;
                desc.textContent = achievement.description;

                // Pastikan animasi lama dihapus sebelum memunculkan
                img.classList.remove('rotate-in');
                
                // Tampilkan modal
                modal.classList.add('active');

                // ----> INI BAGIAN YANG DITAMBAHKAN KEMBALI UNTUK ANIMASI <----
                // Beri jeda sesaat agar browser sempat memproses sebelum animasi dimulai
                setTimeout(() => {
                    img.classList.add('rotate-in');
                }, 10);
                // -------------------------------------------------------------

                playAchievementSound();
            }
        });
    });

    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        playClickSound();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            playClickSound();
        }
    });
}

// Audio System Initialization
function initAudioSystem() {
    try {
        // Mengambil elemen audio dari HTML
        backgroundMusic = document.getElementById('bgMusic');
        const musicToggle = document.getElementById('musicToggle');

        // Jika salah satu elemen tidak ditemukan, hentikan fungsi
        if (!backgroundMusic || !musicToggle) {
            console.error("Elemen audio atau tombol toggle tidak ditemukan.");
            return;
        }

        // Menambahkan fungsi ke tombol toggle
        musicToggle.addEventListener('click', () => {
            // Memainkan suara klik setiap tombol ditekan
            playClickSound();

            if (isMusicPlaying) {
                backgroundMusic.pause();
                musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                // 'play()' mengembalikan promise, tangani jika gagal
                backgroundMusic.play().catch(e => console.error("Gagal memulai musik:", e));
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            // Balikkan status musik
            isMusicPlaying = !isMusicPlaying;
        });

    } catch (e) {
        console.error('Inisialisasi sistem audio gagal:', e);
    }
}

// Update signature date with current date
function updateSignatureDate() {
    const dateElement = document.querySelector('.signature-date');
    if (dateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = `[${now.toLocaleDateString('en-US', options).toUpperCase()}]`;
    }
}

// Initialize all typing effects
function initTypingEffects() {
    const profileTexts = document.querySelectorAll('.terminal-line .output');
    profileTexts.forEach((textElement, index) => {
        const fullText = textElement.textContent;
        textElement.textContent = '';
        setTimeout(() => {
            typeWriter(textElement, fullText, 50);
        }, 500 * index);
    });
}

// Animate skill bars when they come into view
function setupSkillBarObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.value;
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.bar-fill').forEach(bar => observer.observe(bar));
}

// Setup observer for profile section animations
function setupProfileObserver() {
    const bioElement = document.querySelector('.retro-bio');
    if (!bioElement) return;
    const fullBio = bioElement.textContent;
    bioElement.textContent = ''; // Kosongkan bio

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeWriter(bioElement, fullBio, 8, typeCoreSkills);
            observer.disconnect();
        }
    }, { threshold: 0.1 });
    observer.observe(document.querySelector('#profile'));
}

// Typewriter effect for core skills
function typeCoreSkills() {
    // --> INI DIA PERBAIKANNYA <--
    // Pastikan wadah utamanya terlihat sebelum memulai animasi
    const coreSkillsSection = document.querySelector('.core-skills-section');
    if (coreSkillsSection) {
        coreSkillsSection.style.opacity = '1';
    }

    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        const textElement = item.querySelector('.skill-text');
        if (!textElement) return; // Pengaman jika elemen tidak ditemukan
        
        const fullText = textElement.textContent;
        textElement.textContent = '';
        item.style.opacity = '1'; // Membuat setiap baris skill terlihat

        // Atur jeda sebelum memulai animasi ketik untuk setiap baris
        setTimeout(() => {
            typeWriter(textElement, fullText, 20);
        }, index * 300);
    });
}

// Helper function for typewriter effect
function typeWriter(element, text, speed, callback) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (callback) {
            callback();
        }
    }
    typing();
}

// Add pixelated effect to images on hover
function setupPixelImageEffects() {
    document.querySelectorAll('.pixelated').forEach(img => {
        img.style.imageRendering = 'pixelated';
    });
}

// Easter Egg
function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateEasterEgg() {
    console.log("Konami Code Activated!");
    // Tambahkan efek visual atau audio di sini
    document.body.classList.add('konami');
    setTimeout(() => document.body.classList.remove('konami'), 3000);
    playAchievementSound();
}

// Form Submission handler
function setupFormSubmission() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const whatsappUrl = `https://wa.me/6282318221577?text=Halo,%20saya%20${encodeURIComponent(name)}.%0A%0A${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
}

// Handle scroll to update active navigation
function handleScroll() {
    const scrollPosition = window.scrollY + 150;
    const navLinks = document.querySelectorAll('.retro-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
            });
        }
    });
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Sound effects
function playClickSound() {
    try {
        // Menggunakan file suara klik lokal dari folder 'audio'
        const clickSound = new Audio('audio/click.mp3');
        clickSound.volume = 0.5;
        clickSound.play().catch(()=>{}); // Mainkan dan abaikan error jika ada
    } catch (e) {
        console.error("Gagal memutar suara klik:", e);
    }
}

function playAchievementSound() {
    try {
        // Menggunakan file suara klik lokal dari folder 'audio'
        const clickSound = new Audio('audio/achievement.mp3');
        clickSound.volume = 0.5;
        clickSound.play().catch(()=>{}); // Mainkan dan abaikan error jika ada
    } catch (e) {
        console.error("Gagal memutar suara klik:", e);
    }
}