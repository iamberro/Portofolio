// Global audio variables
let backgroundMusic;
let isMusicPlaying = false;

document.addEventListener('DOMContentLoaded', function () {
    // Initialize audio system
    initAudioSystem();

    // Navigation functionality
    const navLinks = document.querySelectorAll('.retro-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    // Set current date in signature
    updateSignatureDate();

    // Initialize typing animations
    initTypingEffects();

    // Initialize skill bar animations
    setupSkillBarObserver();

    // Setup profile section observer
    setupProfileObserver();

    // Add pixelated image effects
    setupPixelImageEffects();

    // Konami code easter egg
    setupKonamiCode();

    // Form submission handler
    setupFormSubmission();

    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Get the target section ID
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // Update active states
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');

            contentSections.forEach(section => section.classList.remove('active'));
            targetSection.classList.add('active');

            // Scroll to top of the section
            targetSection.scrollIntoView({ behavior: 'smooth' });

            // For mobile, close menu after selection
            if (window.innerWidth <= 768) {
                document.body.scrollIntoView({ behavior: 'smooth' });
            }

            // Play click sound
            playClickSound();
        });
    });

    // Auto-activate section based on scroll position
    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Add click sound to buttons
    const buttons = document.querySelectorAll('.retro-btn, .clickable-stat');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            playClickSound();
        });
    });

    // Initialize projects section observer
    const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initProjectsSection();
                projectsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
        projectsObserver.observe(projectsSection);
    }

    // Initialize achievements section observer
    const achievementsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initAchievementsSection();
                achievementsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const achievementsSection = document.querySelector('#achievements');
    if (achievementsSection) {
        achievementsObserver.observe(achievementsSection);
    }
});

// Audio System Initialization
function initAudioSystem() {
    try {
        // Create audio element
        backgroundMusic = new Audio();

        // Try primary source first
        backgroundMusic.src = 'audio/background.mp3'; // Local file
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.8;
        backgroundMusic.preload = 'auto';

        // Error handling
        backgroundMusic.addEventListener('error', function () {
            console.error('Error loading background music:', backgroundMusic.error);
            // Fallback to online source
            backgroundMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';
            backgroundMusic.load();
        });

        // Music control button
        const musicToggle = document.getElementById('music-toggle');

        if (musicToggle) {
            musicToggle.addEventListener('click', async function () {
                try {
                    if (isMusicPlaying) {
                        await backgroundMusic.pause();
                        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    } else {
                        await backgroundMusic.play();
                        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                    isMusicPlaying = !isMusicPlaying;
                    playClickSound();
                } catch (error) {
                    console.error('Audio playback failed:', error);
                    musicToggle.style.display = 'none';
                }
            });
        }

        // Preload audio after user interaction
        document.addEventListener('click', function initAudioInteraction() {
            try {
                backgroundMusic.play().then(() => {
                    backgroundMusic.pause();
                    backgroundMusic.currentTime = 0;
                }).catch(e => {
                    console.log('Audio preload interaction failed:', e);
                });
                document.removeEventListener('click', initAudioInteraction);
            } catch (e) {
                console.error('Audio init interaction failed:', e);
            }
        }, { once: true });

    } catch (e) {
        console.error('Audio system initialization failed:', e);
    }
}


// Update signature date with current date
function updateSignatureDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options).toUpperCase();
    const dateElement = document.querySelector('.signature-date');
    if (dateElement) {
        dateElement.textContent = `[${dateString}]`;
    }
}

// Initialize all typing effects
function initTypingEffects() {
    // Profile text typing animation
    const profileTexts = document.querySelectorAll('.terminal-line .output');

    profileTexts.forEach((textElement, index) => {
        const fullText = textElement.textContent;
        textElement.textContent = '';

        setTimeout(() => {
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < fullText.length) {
                    textElement.textContent += fullText.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 80 + (index * 10)); // Stagger the animations
        }, 800 * index);
    });
}

// Animate skill bars when they come into view
function setupSkillBarObserver() {
    const skillBars = document.querySelectorAll('.bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.dataset.value || bar.style.width;
                bar.style.width = '0';

                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Setup observer for profile section animations
function setupProfileObserver() {
    const profileObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeBio();
                profileObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const profileSection = document.querySelector('#profile');
    if (profileSection) {
        profileObserver.observe(profileSection);
    }
}

// Typewriter effect for biography text
function typeBio() {
    const bioElement = document.querySelector('.retro-bio');
    if (!bioElement) return;

    const fullBio = bioElement.textContent;
    bioElement.textContent = '';

    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < fullBio.length) {
            bioElement.textContent += fullBio.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            // After bio finishes, start typing the core skills
            typeCoreSkills();
        }
    }, 30);
}

// Typewriter effect for core skills
function typeCoreSkills() {
    const skillTexts = document.querySelectorAll('.skill-text');
    skillTexts.forEach((item, index) => {
        const fullText = item.textContent;
        item.textContent = '';

        setTimeout(() => {
            let j = 0;
            const skillInterval = setInterval(() => {
                if (j < fullText.length) {
                    item.textContent += fullText.charAt(j);
                    j++;
                } else {
                    clearInterval(skillInterval);
                }
            }, 30);
        }, index * 500); // Stagger each skill item
    });

    // Make the section visible
    const coreSkillsSection = document.querySelector('.core-skills-section');
    if (coreSkillsSection) {
        coreSkillsSection.style.opacity = '1';
    }
}

// Add pixelated effect to images on hover
function setupPixelImageEffects() {
    const pixelImages = document.querySelectorAll('.pixelated');
    pixelImages.forEach(img => {
        img.style.imageRendering = 'pixelated';

        img.addEventListener('mouseenter', () => {
            img.style.imageRendering = 'auto';
        });

        img.addEventListener('mouseleave', () => {
            img.style.imageRendering = 'pixelated';
        });
    });
}

// Easter Egg Audio with better handling
function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
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
    try {
        // Pause main music if playing
        if (isMusicPlaying && backgroundMusic) {
            backgroundMusic.pause();
        }

        // Create new audio element for Easter egg
        const easterEggMusic = new Audio();
        easterEggMusic.src = 'audio/easter-egg.mp3'; // Local fallback
        easterEggMusic.loop = true;
        easterEggMusic.volume = 0.5;

        // Try to play with fallback
        easterEggMusic.play().catch(e => {
            console.log('Easter egg music fallback:', e);
            easterEggMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-game-show-suspense-waiting-668.mp3';
            easterEggMusic.play().catch(e => console.error('Fallback also failed:', e));
        });

        // Visual effects
        document.body.style.backgroundColor = '#0000ff';
        document.body.style.color = '#ffff00';

        const gameElements = document.createElement('div');
        gameElements.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; text-align: center;">
                <div style="font-size: 24px; color: #ffff00; margin-bottom: 20px;">SECRET LEVEL UNLOCKED!</div>
                <div style="font-size: 16px; color: #ffffff;">30 LIVES ADDED</div>
            </div>
        `;
        document.body.appendChild(gameElements);

        // Play sound effect
        playEasterEggSound();

        // Reset after 5 seconds
        setTimeout(() => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            gameElements.remove();
            easterEggMusic.pause();

            // Resume background music if it was playing
            if (isMusicPlaying && backgroundMusic) {
                backgroundMusic.play().catch(e => console.log('Music resume prevented:', e));
            }
        }, 5000);

    } catch (e) {
        console.error('Easter egg activation failed:', e);
    }
}// Easter Egg Audio with better handling
function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
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
    try {
        // Pause main music if playing
        if (isMusicPlaying && backgroundMusic) {
            backgroundMusic.pause();
        }

        // Create new audio element for Easter egg
        const easterEggMusic = new Audio();
        easterEggMusic.src = 'audio/easter-egg.mp3'; // Local fallback
        easterEggMusic.loop = true;
        easterEggMusic.volume = 0.5;

        // Try to play with fallback
        easterEggMusic.play().catch(e => {
            console.log('Easter egg music fallback:', e);
            easterEggMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-game-show-suspense-waiting-668.mp3';
            easterEggMusic.play().catch(e => console.error('Fallback also failed:', e));
        });

        // Visual effects
        document.body.style.backgroundColor = '#0000ff';
        document.body.style.color = '#ffff00';

        const gameElements = document.createElement('div');
        gameElements.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; text-align: center;">
                <div style="font-size: 24px; color: #ffff00; margin-bottom: 20px;">SECRET LEVEL UNLOCKED!</div>
                <div style="font-size: 16px; color: #ffffff;">30 LIVES ADDED</div>
            </div>
        `;
        document.body.appendChild(gameElements);

        // Play sound effect
        playEasterEggSound();

        // Reset after 5 seconds
        setTimeout(() => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            gameElements.remove();
            easterEggMusic.pause();

            // Resume background music if it was playing
            if (isMusicPlaying && backgroundMusic) {
                backgroundMusic.play().catch(e => console.log('Music resume prevented:', e));
            }
        }, 5000);

    } catch (e) {
        console.error('Easter egg activation failed:', e);
    }
}

function setupFormSubmission() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Validate required fields
        if (!formData.name || !formData.message) {
            showAlert('ERROR', 'NAME AND MESSAGE ARE REQUIRED!');
            return;
        }

        // Format WhatsApp message
        const whatsappMessage = formatWhatsAppMessage(formData);

        // Show confirmation alert
        showAlert(
            'CONFIRM SEND',
            `Send this message to WhatsApp?\n\n${whatsappMessage.replace(/\*/g, '')}`,
            () => sendToWhatsApp(whatsappMessage) // Proceed callback
        );
    });
}

function formatWhatsAppMessage(data) {
    return [
        '*NEW WEBSITE MESSAGE*',
        '',
        `*Name:* ${data.name}`,
        `*Email:* ${data.email || 'Not provided'}`,
        `*Subject:* ${data.subject || 'No subject'}`,
        '',
        `*Message:*`,
        data.message
    ].join('\n');
}

function sendToWhatsApp(message) {
    try {
        const encodedMessage = encodeURIComponent(message)
            .replace(/\n/g, '%0A')     // Newlines
            .replace(/'/g, '%27')      // Apostrophes
            .replace(/\(/g, '%28')     // Parentheses
            .replace(/\)/g, '%29');

        window.open(`https://wa.me/6282318221577?text=${encodedMessage}`, '_blank');
    } catch (error) {
        console.error('WhatsApp Error:', error);
        showAlert('ERROR', 'Failed to open WhatsApp!');
    }
}

function showAlert(title, message, confirmCallback) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.retro-alert');
    if (existingAlert) existingAlert.remove();

    // Create alert element
    const alertBox = document.createElement('div');
    alertBox.className = 'retro-alert';

    // Style the alert box (compact version)
    Object.assign(alertBox.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#000',
        border: '2px solid #0f0',
        padding: '15px',
        zIndex: '9999',
        maxWidth: '280px',
        width: '90%',
        textAlign: 'center',
        fontFamily: "'Courier New', monospace",
        color: '#0f0',
        fontSize: '13px'
    });

    // Alert content with Cancel button
    alertBox.innerHTML = `
        <div style="margin-bottom:10px;font-weight:bold;border-bottom:1px solid #0f0;padding-bottom:5px;">
            ${title}
        </div>
        <div style="margin-bottom:15px;white-space:pre-line;max-height:200px;overflow-y:auto;">
            ${message}
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
            <button id="alert-cancel" style="flex:1;background:#333;color:#0f0;border:1px solid #0f0;padding:5px;cursor:pointer;">
                CANCEL
            </button>
            <button id="alert-confirm" style="flex:1;background:#0f0;color:#000;border:none;padding:5px;cursor:pointer;">
                OK
            </button>
        </div>
    `;

    document.body.appendChild(alertBox);

    // Button handlers
    document.getElementById('alert-cancel').addEventListener('click', () => {
        alertBox.remove();
    });

    document.getElementById('alert-confirm').addEventListener('click', () => {
        alertBox.remove();
        if (confirmCallback) confirmCallback();
    });

    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            alertBox.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

// Handle scroll to update active navigation
function handleScroll() {
    const scrollPosition = window.scrollY + 100;
    const navLinks = document.querySelectorAll('.retro-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    contentSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const id = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`.retro-nav a[href="#${id}"]`);

            if (correspondingNavLink && !correspondingNavLink.classList.contains('active')) {
                navLinks.forEach(link => link.classList.remove('active'));
                correspondingNavLink.classList.add('active');
            }
        }
    });
}

// Throttle function for scroll events
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Sound effects with better error handling
function playClickSound() {
    try {
        const audio = new Audio();
        audio.src = 'audio/click.mp3'; // Local file
        audio.volume = 0.3;
        audio.play().catch(e => {
            console.log('Click sound fallback:', e);
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3';
            audio.play().catch(e => console.error('Fallback click sound failed:', e));
        });
    } catch (e) {
        console.error('Click sound failed:', e);
    }
}

function playEasterEggSound() {
    try {
        const audio = new Audio();
        audio.src = 'audio/achievement.mp3'; // Local file
        audio.volume = 0.2;
        audio.play().catch(e => {
            console.log('Easter egg sound fallback:', e);
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3';
            audio.play().catch(e => console.error('Fallback achievement sound failed:', e));
        });
    } catch (e) {
        console.error('Easter egg sound failed:', e);
    }
}

// Projects Section Functionality
function initProjectsSection() {
    // Sample project data (replace with your actual project data)
    const projects = {
        'Sales Dashboard (Local Access)': {
            title: 'Sales Dashboard (Local Access)',
            category: 'Web',
            date: '2025',
            description: 'Interactive dashboard for real-time sales monitoring and reporting. Features include dynamic charts, data filtering, and export functionality. Built with modern web technologies for optimal performance.',
            tech: ['HTML/CSS', 'JavaScript', 'API', 'Chart.js'],
            images: [
                'assets/images/dashboard317/login.png',
                'assets/images/dashboard317/register.png',
                'assets/images/dashboard317/dashboard.png',
                'assets/images/dashboard317/profile.png',
            ],
            demoUrl: 'aksesmaaf.html',
            codeUrl: 'codemaaf.html'
        },
        'Dashboard Sales Report': {
            title: 'Dashboard Sales Report',
            category: 'Data',
            date: '2023',
            description: 'Excel automation for daily sales data processing and visualization. This tool automatically imports sales data, cleans it, and generates comprehensive reports with pivot tables and charts.',
            tech: ['Excel', 'Spreadsheet', 'Google Form'],
            images: [
                'assets/images/sales/dashboard.png',
            ],
            demoUrl: 'aksesmaaf.html',
            codeUrl: 'codemaaf.html'
        },
        'Tracking Sallary': {
            title: 'Tracking Sallary',
            category: 'Web',
            date: '2024',
            description: 'Web application for tracking income and expenses with user authentication and data visualization. Helps users manage their finances with categorized transactions and monthly summaries.',
            tech: ['PHP', 'Bootstrap', 'MySQL', 'Chart.js'],
            images: [
                'assets/images/sallary/login.png',
                'assets/images/sallary/register.png',
                'assets/images/sallary/dashboard.png',
                'assets/images/sallary/report.png',
                'assets/images/sallary/pemasukan.png',
                'assets/images/sallary/pengeluaran.png',
                'assets/images/sallary/profile-setting.png',
                'assets/images/sallary/details-setting.png',
                'assets/images/sallary/user-setting.png',
                'assets/images/sallary/history-setting.png',
            ],
            demoUrl: 'aksesmaaf.html',
            codeUrl: 'codemaaf.html'
        },
        'Unit Usaha Koperasi 317': {
            title: 'Unit Usaha Koperasi 317',
            category: 'Web',
            date: '2025',
            description: 'Web application for Unit Usaha 317 do they Activity for Sale and Report Unit.',
            tech: ['PHP', 'Bootstrap', 'MySQL', 'Chart.js'],
            images: [
                'assets/images/koperasi/login.png',
                'assets/images/koperasi/register.png',
                'assets/images/koperasi/dashboard.png',
                'assets/images/koperasi/transaksi.png',
                'assets/images/koperasi/riwayat-transaksi.png',
                'assets/images/koperasi/contoh-report-excel.png',
                'assets/images/koperasi/contoh-struk.png',
                'assets/images/koperasi/laporan.png',
                'assets/images/koperasi/profile.png',
                'assets/images/koperasi/setting-produk.png',
                'assets/images/koperasi/setting-set.png',
                'assets/images/koperasi/setting-user.png',
                'assets/images/koperasi/setting-trx.png',
            ],
            demoUrl: 'aksesmaaf.html',
            codeUrl: 'codemaaf.html'
        },
        'Sales SNT View': {
            title: 'Sales SNT View',
            category: 'Web',
            date: '2025',
            description: 'Web for View Sales Shop and Talk',
            tech: ['HTML', 'CSS', 'Java Script'],
            images: [
                'assets/images/snt/Page1.png',
                'assets/images/snt/Page2.png',
            ],
            demoUrl: 'http://berro.my.id/snt/',
            codeUrl: 'codemaaf.html'
        }
    };

    // Get modal elements
    const modal = document.getElementById('projectModal');
    const closeModal = document.getElementById('closeModal');
    const mobileCloseModal = document.getElementById('mobileCloseModal'); // Fix: Add this line
    const mainPreviewImage = document.getElementById('mainPreviewImage');
    const projectTitle = document.getElementById('projectTitle');
    const projectCategory = document.getElementById('projectCategory');
    const projectDate = document.getElementById('projectDate');
    const projectFullDescription = document.getElementById('projectFullDescription');
    const projectTechTags = document.getElementById('projectTechTags');
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const demoBtn = document.querySelector('#projectModal .project-actions .retro-btn.primary');
    const codeBtn = document.querySelector('#projectModal .project-actions .retro-btn.secondary');

    // Make modal more mobile-friendly
    function adjustModalForMobile() {
        if (window.innerWidth <= 768) {
            modal.style.alignItems = 'flex-start';
            modal.style.paddingTop = '20px';
            modal.style.paddingBottom = '80px';
            const bottomNavHeight = 60;
            modal.style.paddingBottom = `${bottomNavHeight + 20}px`;
        } else {
            modal.style.alignItems = 'center';
            modal.style.paddingTop = '0';
            modal.style.paddingBottom = '0';
        }
    }

    adjustModalForMobile();
    window.addEventListener('resize', adjustModalForMobile);

    // Set up event listeners for project preview buttons
    document.querySelectorAll('.project-preview-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const projectItem = this.closest('.project-item');
            const projectName = projectItem.querySelector('h3').textContent;

            if (projects[projectName]) {
                const project = projects[projectName];

                // Set main content
                projectTitle.textContent = project.title;
                projectCategory.textContent = project.category;
                projectDate.textContent = project.date;
                projectFullDescription.textContent = project.description;

                // Set tech tags
                projectTechTags.innerHTML = '';
                project.tech.forEach(tag => {
                    const span = document.createElement('span');
                    span.textContent = tag;
                    projectTechTags.appendChild(span);
                });

                // Set images
                mainPreviewImage.src = project.images[0];
                mainPreviewImage.alt = project.title;

                // Set thumbnails
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

                // Update action buttons
                demoBtn.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(project.demoUrl, '_blank');
                };

                codeBtn.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(project.codeUrl, '_blank');
                };

                // Show modal
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal functions
    function closeModalHandler() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', closeModalHandler);

    if (mobileCloseModal) {
        mobileCloseModal.addEventListener('click', closeModalHandler);
    }

    // Close modal when clicking outside content
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProjectsSection);

// Filter projects
const filterButtons = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.dataset.filter;

        // Filter projects
        projectItems.forEach(item => {
            if (filterValue === 'all' || item.dataset.category === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            } else {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });

        // Play click sound
        playClickSound();
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();

        projectItems.forEach(item => {
            const itemText = item.textContent.toLowerCase();
            if (itemText.includes(searchTerm)) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            } else {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
}

// Achievement Section Functionality
function initAchievementsSection() {
    // Data sertifikat untuk setiap achievement
    const achievementData = {
        "Kompetensi Keahlian Kejuruan": {
            imageUrl: "assets/images/sertifikasi/kompetensi.png",
            description: "Sertifikat Kopetensi Kejuruan Keahlian"
        },
        "Nilai Kompetensi Keahlian Kejuruan": {
            imageUrl: "assets/images/sertifikasi/kompetensi2.png",
            description: "Nilai Sertifikat Kopetensi Kejuruan Keahlian"
        },
    };

    // Buat modal element
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

    // Tambahkan event listener untuk achievement items
    const trophyItems = document.querySelectorAll('.trophy-item');
    trophyItems.forEach(item => {
        item.addEventListener('click', function () {
            const title = this.querySelector('h3').textContent;
            const achievement = achievementData[title];

            if (achievement) {
                const img = modal.querySelector('.certificate-image');
                const desc = modal.querySelector('.certificate-desc');

                // Set image dan description
                img.src = achievement.imageUrl;
                img.alt = title;
                img.classList.remove('rotate-in');

                desc.textContent = achievement.description;

                // Tampilkan modal
                modal.classList.add('active');

                // Trigger animation setelah DOM update
                setTimeout(() => {
                    img.classList.add('rotate-in');
                }, 10);

                // Play sound effect
                playAchievementSound();
            }
        });
    });

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        playClickSound();
    });

    // Close ketika klik di luar modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            playClickSound();
        }
    });
}

// Sound effect khusus achievement
function playAchievementSound() {
    try {
        const audio = new Audio('audio/achievement.mp3');
        audio.volume = 0.5; // Naikkan volume sedikit
        audio.play().catch(e => {
            console.log('Audio play failed:', e);
            // Fallback: Coba play setelah interaksi user
            document.addEventListener('click', function handler() {
                audio.play().catch(console.error);
                document.removeEventListener('click', handler);
            }, { once: true });
        });
    } catch (e) {
        console.log('Audio error:', e);
    }
}
// Add this to handle browser autoplay restrictions
document.addEventListener('click', async function firstInteraction() {
    try {
        await backgroundMusic.play();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    } catch (e) {
        console.log('Audio preload failed:', e);
    }
    document.removeEventListener('click', firstInteraction);
}, { once: true });

// Variabel global
let audioContext;
let musicBuffer;
let musicSource;
const musicToggle = document.getElementById('musicToggle');

// Fungsi untuk inisialisasi audio
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch('background.mp3');
        musicBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());

        // Set event listener untuk tombol setelah audio siap
        musicToggle.addEventListener('click', toggleMusic);
        musicToggle.style.display = 'block'; // Tampilkan tombol setelah audio siap
    } catch (error) {
        console.error('Audio initialization failed:', error);
        musicToggle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> NO MUSIC';
        musicToggle.disabled = true;
    }
}

// Fungsi untuk toggle music
function toggleMusic() {
    if (!isMusicPlaying) {
        // Jika audio context dalam suspended state (karena autoplay policy), resume dulu
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        musicSource = audioContext.createBufferSource();
        musicSource.buffer = musicBuffer;
        musicSource.loop = true;
        musicSource.connect(audioContext.destination);
        musicSource.start();
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        isMusicPlaying = true;

        // Handle ketika musik selesai (seharusnya tidak terjadi karena loop=true)
        musicSource.onended = () => {
            isMusicPlaying = false;
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        };
    } else {
        musicSource.stop();
        musicSource = null;
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        isMusicPlaying = false;
    }
}

// Handler untuk interaksi pertama (mengatasi autoplay restrictions)
document.addEventListener('click', async function firstInteraction() {
    try {
        // Coba init audio setelah interaksi pertama
        await initAudio();

        // Untuk beberapa browser, perlu memulai context audio dulu
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    } catch (e) {
        console.log('Audio initialization failed:', e);
    }

    // Hapus event listener setelah interaksi pertama
    document.removeEventListener('click', firstInteraction);
}, { once: true });

// Sembunyikan tombol sampai audio siap
musicToggle.style.display = 'none';
