// Motion Tier + Capability Detection
(function initMotionTier() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEndCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    let motionTier;
    if (reducedMotion) {
        motionTier = 'minimal';
    } else if (isLowEndCPU || (isMobile && !window.matchMedia('(min-width: 1024px)').matches)) {
        motionTier = 'reduced';
    } else {
        motionTier = 'full';
    }

    document.documentElement.setAttribute('data-motion', motionTier);
    document.documentElement.setAttribute('data-pointer', hasCoarsePointer ? 'coarse' : 'fine');
    document.documentElement.setAttribute('data-touch', isTouchDevice ? 'true' : 'false');

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
        const newTier = e.matches ? 'minimal' :
            (isLowEndCPU || isMobile ? 'reduced' : 'full');
        document.documentElement.setAttribute('data-motion', newTier);
    });
})();

// Loading overlay fade out
window.addEventListener('load', function() {
    setTimeout(() => {
        document.querySelector('.loading-overlay').classList.add('fade-out');
    }, 300);
});

// Number roll animation for profile tags
(function initNumberRoll() {
    const rollNums = document.querySelectorAll('.roll-num');

    rollNums.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;

        // Build digit strip: 0 → target
        const strip = document.createElement('div');
        strip.className = 'roll-num-strip';

        for (let i = 0; i <= target; i++) {
            const digit = document.createElement('span');
            digit.textContent = i;
            strip.appendChild(digit);
        }

        el.appendChild(strip);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const strip = el.querySelector('.roll-num-strip');
                const target = parseInt(el.dataset.target, 10);

                if (strip && !isNaN(target)) {
                    strip.style.transform = `translateY(-${target * 1.05}em)`;
                }

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    rollNums.forEach(el => observer.observe(el));
})();

// Typewriter animation for profile labels
(function initTypewriter() {
    const labels = [
        '浙江人',
        'ISFJ-T',
        'ZJSU英语专业本科',
        'SUIBE外国语言学及应用语言学硕士',
        '六边形战士',
        '想成为一个理科生的文科生'
    ];
    const el = document.getElementById('typewriter');
    if (!el) return;

    let labelIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 120;
    const deleteSpeed = 60;
    const pauseAfterType = 1500;
    const pauseAfterDelete = 400;

    function tick() {
        const current = labels[labelIndex];

        if (!isDeleting) {
            // Typing
            charIndex++;
            el.textContent = current.substring(0, charIndex);

            if (charIndex === current.length) {
                // Finished typing, pause then start deleting
                isDeleting = true;
                setTimeout(tick, pauseAfterType);
            } else {
                setTimeout(tick, typeSpeed);
            }
        } else {
            // Deleting
            charIndex--;
            el.textContent = current.substring(0, charIndex);

            if (charIndex === 0) {
                // Finished deleting, move to next label
                isDeleting = false;
                labelIndex = (labelIndex + 1) % labels.length;
                setTimeout(tick, pauseAfterDelete);
            } else {
                setTimeout(tick, deleteSpeed);
            }
        }
    }

    // Start after hero reveal animations complete
    setTimeout(tick, 1800);
})();

// Parallax scrolling — hero section depth layers
(function initParallax() {
    const motionTier = document.documentElement.getAttribute('data-motion');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window;

    if (motionTier === 'minimal' || isMobile || isTouch) return;

    const bg = document.querySelector('.profile-image');
    const fg = document.querySelector('.profile-info');
    const hero = document.querySelector('.hero-section');

    if (!bg || !fg || !hero) return;

    let currentBg = 0, targetBg = 0;
    let currentFg = 0, targetFg = 0;
    let rafId = null;
    let enabled = false;

    // Enable after hero reveal animations finish (~2s)
    setTimeout(() => {
        document.querySelectorAll('.hero-section .hero-reveal').forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0,0,0)';
        });
        enabled = true;
        tick();
    }, 2000);

    function tick() {
        if (!enabled) return;

        const scrollY = window.scrollY;
        const heroBottom = hero.offsetTop + hero.offsetHeight;

        if (scrollY > heroBottom) {
            rafId = null;
            return;
        }

        // Background: 0.5x (image drifts down, appears slower)
        targetBg = scrollY * 0.5;
        // Foreground: 1.2x (text moves 0.2x extra upward, appears faster)
        targetFg = scrollY * -0.2;

        // Lerp for silk-smooth motion
        currentBg += (targetBg - currentBg) * 0.08;
        currentFg += (targetFg - currentFg) * 0.08;

        bg.style.transform = `translate3d(0, ${currentBg}px, 0)`;
        fg.style.transform = `translate3d(0, ${currentFg}px, 0)`;

        // Keep running until lerp converges
        if (Math.abs(targetBg - currentBg) > 0.1 || Math.abs(targetFg - currentFg) > 0.1) {
            rafId = requestAnimationFrame(tick);
        } else {
            rafId = null;
        }
    }

    window.addEventListener('scroll', () => {
        if (enabled && !rafId) {
            rafId = requestAnimationFrame(tick);
        }
    }, { passive: true });
})();

// Counter animation for all body text numbers
(function initCountUp() {
    // Patterns sorted longest-first to avoid partial matches
    const patterns = [
        { match: '3000+', target: 3000, suffix: '+' },
        { match: '450+', target: 450, suffix: '+' },
        { match: '1万+', target: 1, suffix: '万+' },
        { match: '1w+', target: 1, suffix: 'w+' },
        { match: '3年', target: 3, suffix: '年' },
        { match: '2年', target: 2, suffix: '年' },
    ];

    const containers = document.querySelectorAll(
        '.about-text p, .highlight-item span, .capability-description, .contact-info'
    );

    containers.forEach(el => {
        let html = el.innerHTML;
        let changed = false;
        patterns.forEach(({ match, target, suffix }) => {
            if (html.includes(match)) {
                html = html.replace(match,
                    `<span class="count-num" data-target="${target}">0</span>${suffix}`
                );
                changed = true;
            }
        });
        if (changed) {
            el.innerHTML = html;
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.count-num').forEach(el => observer.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = target <= 10 ? 800 : 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }
})();

// Scroll Manager
(function initScrollManager() {
    const DOM = {
        navbar: document.querySelector('.navbar'),
        progressBar: document.querySelector('.scroll-progress'),
        backToTop: document.querySelector('.back-to-top'),
        actionButtons: document.querySelectorAll('.action-btn')
    };

    const scrollState = {
        lastY: window.scrollY,
        currentY: window.scrollY,
        ticking: false
    };

    window.addEventListener('scroll', () => {
        scrollState.currentY = window.scrollY;

        if (!scrollState.ticking) {
            requestAnimationFrame(updateScroll);
            scrollState.ticking = true;
        }
    }, { passive: true });

    function updateScroll() {
        scrollState.lastY = scrollState.currentY;

        updateNavbar();
        updateScrollProgress();
        updateBackToTop();
        updateActionButtons();
        updateActiveNav();

        scrollState.ticking = false;
    }

    function updateNavbar() {
        if (!DOM.navbar) return;

        if (scrollState.currentY > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    }

    function updateScrollProgress() {
        if (!DOM.progressBar) return;

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollState.currentY / docHeight, 1) : 0;
        DOM.progressBar.style.transform = `scaleX(${progress})`;
    }

    function updateBackToTop() {
        if (!DOM.backToTop) return;

        if (scrollState.currentY > window.innerHeight) {
            DOM.backToTop.classList.add('visible');
        } else {
            DOM.backToTop.classList.remove('visible');
        }
    }

    function updateActionButtons() {
        if (scrollState.currentY > 300) {
            DOM.actionButtons.forEach(btn => btn.classList.add('visible'));
        } else {
            DOM.actionButtons.forEach(btn => btn.classList.remove('visible'));
        }
    }

    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollState.currentY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    requestAnimationFrame(updateScroll);
})();

// Observer Manager (scroll-reveal + staggered children)
(function initObserverManager() {
    const staggerMap = [
        '.system-tag',
        '.capability-card',
        '.sport-card',
        '.contact-item',
        '.qr-card',
    ];

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                if (el.classList.contains('scroll-reveal')) {
                    el.classList.add('revealed');
                    staggerChildren(el);
                }

                if (el.classList.contains('lazy-load')) {
                    el.classList.add('loaded');
                }

                revealObserver.unobserve(el);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    });

    function staggerChildren(parent) {
        staggerMap.forEach(selector => {
            const children = parent.querySelectorAll(selector);
            if (children.length === 0) return;

            children.forEach((child, i) => {
                setTimeout(() => {
                    child.classList.add('stagger-in');
                }, i * 60);
            });
        });
    }

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    document.querySelectorAll('.lazy-load').forEach(el => {
        revealObserver.observe(el);
    });
})();

// Share button
const shareBtn = document.getElementById('shareBtn');

shareBtn.addEventListener('click', async function() {
    const shareData = {
        title: 'Fansir - 软件产品专员',
        text: '来自安克创新ATIT部门的软件产品专员，2年产品经验，1w+粉丝运营经验',
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (err.name !== 'AbortError') {
                copyToClipboard(window.location.href);
            }
        }
    } else {
        copyToClipboard(window.location.href);
    }
});

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            createModal('链接已复制', `
                <div style="margin-bottom: 1.5rem; color: rgba(0,255,255,0.8);"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <p style="font-size: 1.1rem; color: #ffffff; margin-bottom: 1rem;">页面链接已复制到剪贴板</p>
                <p style="font-size: 0.9rem; color: #999999; word-break: break-all; background: #242424; padding: 1rem; border-radius: 10px;">${text}</p>
            `);
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        createModal('链接已复制', `
            <div style="margin-bottom: 1.5rem; color: rgba(0,255,255,0.8);"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <p style="font-size: 1.1rem; color: #ffffff;">页面链接已复制到剪贴板</p>
        `);
    }
}

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));

        if (!isExpanded) {
            const firstLink = navLinks.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        if (!menuToggle || !navLinks) return;
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const headerOffset = this.classList.contains('skip-link') ? 0 : 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: (document.documentElement.getAttribute('data-motion') || 'full') === 'minimal' ? 'auto' : 'smooth'
            });

            if (this.classList.contains('skip-link')) {
                setTimeout(() => {
                    try {
                        targetElement.focus({ preventScroll: true });
                    } catch (_) {
                        targetElement.focus();
                    }
                }, 0);
            }
        }
    });
});

// Dynamic modal creator
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease; padding: 1rem;';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };

    const box = document.createElement('div');
    box.style.cssText = 'position: relative; background: rgba(26,26,26,0.55); backdrop-filter: blur(50px) saturate(130%); -webkit-backdrop-filter: blur(50px) saturate(130%); padding: clamp(1.25rem, 4vw, 2.5rem); border-radius: 16px; text-align: center; max-width: 600px; width: calc(100% - 2rem); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); animation: slideUp 0.4s ease; max-height: 90vh; overflow-y: auto;';

    // Noise texture overlay
    const noise = document.createElement('div');
    noise.style.cssText = "position: absolute; inset: 0; border-radius: inherit; background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\"); opacity: 0.03; pointer-events: none; z-index: 0;";
    box.appendChild(noise);

    const inner = document.createElement('div');
    inner.style.cssText = 'position: relative; z-index: 1;';
    inner.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; color: #ffffff; font-size: 1.5rem;">${title}</h3>
        <div style="margin-bottom: 2rem; color: #999999; line-height: 1.8;">${content}</div>
        <button onclick="this.closest('[style*=fixed]').remove()" style="background: #ffffff; color: #0f0f0f; border: none; padding: 0.8rem 2.5rem; border-radius: 100px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: opacity 0.3s ease;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">关闭</button>
    `;
    box.appendChild(inner);

    modal.appendChild(box);
    document.body.appendChild(modal);
}

// Modal Focus Trap Manager
(function initModalManager() {
    let lastFocusedElement = null;
    const trapHandlers = new Map();

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        lastFocusedElement = document.activeElement;
        modal.classList.add('active');

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const getFocusableElements = () => Array.from(modal.querySelectorAll(focusableSelector));

        const focusables = getFocusableElements();
        if (focusables.length > 0) {
            focusables[0].focus();
        }

        const trapFocus = (e) => {
            if (e.key !== 'Tab') {
                if (e.key === 'Escape') {
                    closeModal(modalId);
                }
                return;
            }

            const currentFocusables = getFocusableElements();
            if (currentFocusables.length === 0) return;

            const firstFocusable = currentFocusables[0];
            const lastFocusable = currentFocusables[currentFocusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        trapHandlers.set(modalId, trapFocus);
        modal.addEventListener('keydown', trapFocus);
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');

        const trap = trapHandlers.get(modalId);
        if (trap) {
            modal.removeEventListener('keydown', trap);
            trapHandlers.delete(modalId);
        }

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    window.showWechat = () => showModal('wechat-modal');
    window.showGzh = () => showModal('gzh-modal');
    window.showPublicAccount = () => showModal('gzh-modal');

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
})();

function showOfficeLocation() {
    createModal('工作地点', `
        <div style="margin-bottom: 1.5rem; color: rgba(0,255,255,0.8);"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20"/><path d="M9 22V12h6v10"/><line x1="8" y1="6" x2="8.01" y2="6"/><line x1="16" y1="6" x2="16.01" y2="6"/><line x1="12" y1="6" x2="12.01" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/></svg></div>
        <p style="font-size: 1.2rem; color: #ffffff; font-weight: 600; margin-bottom: 1rem;">安克大楼 18F-N093</p>
        <p style="font-size: 1rem; color: #999999; margin-bottom: 0.5rem;">ATIT部门</p>
        <p style="font-size: 0.95rem; color: #999999; margin-top: 1.5rem;">欢迎随时来访交流！</p>
    `);
}

// System tag interactions
const systemLinks = {
    '创造者大会': [
        { label: '查看系统', url: 'https://ankermaker-talkshow.anker-in.com/client' },
    ],
    '安克餐厅': [
        { label: 'B端管理后台', url: 'https://ckms.anker-in.com/home' },
        { label: 'C端员工点餐', url: 'https://dining.anker-in.com/employee' },
        { label: '商户端', url: 'https://cmp.anker-in.com' },
    ],
    '积分系统': [
        { label: 'B端管理后台', url: 'https://aps.anker-in.com' },
        { label: 'C端积分商城', url: 'https://points.anker-in.com' },
    ],
    '小邮局快递': [
        { label: '查看系统', url: 'https://e.kuaidi100.com/feishu/page/home-staff' },
    ],
    '安克嘉年华': [
        { label: 'B端管理后台', url: 'https://openday.anker-in.com/admin/#/login' },
        { label: 'C端设计稿 (Figma)', url: 'https://www.figma.com/design/TApD847AzEN8ulDNsdJExZ/Anker%E5%BC%80%E6%94%BE%E6%97%A5%E5%B0%8F%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1?node-id=1-2&t=zZrx40vZl2y5OChF-1' },
    ],
    '价值观系统': [
        { label: '查看系统', url: 'https://talent.anker-in.com/evaBasic/userWelcome' },
    ],
    'Maker Mentor Agent': [
        { label: '打开 Agent', url: 'https://applink.feishu.cn/T93Pgpt4byQU' },
    ],
    '校招Agent': [
        { label: '打开 Agent', url: 'https://applink.feishu.cn/T93Pgv0kkSew' },
    ],
    '飞书人事': [
        { label: '查看系统', url: 'https://anker-in.feishu.cn/people' },
    ],
    '飞书招聘': [
        { label: '查看系统', url: 'https://anker-in.feishu.cn/hire/home' },
    ],
    'MOOC': [
        { label: '查看系统', url: 'https://www.anker-in.firacademy.com/' },
    ],
};

const systemDescriptions = {
    '创造者大会': '支持安克一年一度创造大赛的网站系统和打分系统，确保大赛前期推广和顺利进行。',
    '央厨': '安克央厨管理系统，通过数字化手段打通从食材采购、生产排程到物流配送的全链路，提升运营效率并优化员工用餐体验。',
    '安克餐厅': '公司自研的员工点餐系统，支持在线预订、支付、评价等功能，并通过保温箱配送至各楼层，提供便捷的员工用餐服务。',
    '积分系统': '管理员工积分的获取与消耗，目前主要支持通过爬楼打卡获取积分，并可抵扣积分获取礼品。',
    '咖啡系统': '为员工提供咖啡饮品点单、支付、取餐的一体化服务系统，以 H5 形式嵌入飞书小程序，方便员工使用。',
    '安克嘉年华': '公司年度大型活动"安克嘉年华"的 IT 支持系统，涉及活动报名、互动和数据管理等功能。C端链接已下线，可查看 Figma 设计稿。',
    '安克之家': '借助飞书生态打造的自动化、千人千面的智能企业门户，提升员工访问体验与企业文化感知。',
    '小邮局快递': '公司内部的快递管理系统，用于处理和管理员工的快递收发业务。',
    '价值观系统': '用于公司价值观传播、评估和反馈的系统，帮助员工学习和践行企业文化价值观。',
    '安克央厨系统': '安克央厨管理系统的早期版本，用于管理央厨的采购、生产、配送等业务流程。',
    '悠饭': '公司早期使用的员工点餐系统，现已被自研的"安克餐厅"系统所取代。',
    'Maker Mentor Agent': '一款 AI 智能体，旨在为安克的创造者（Maker）提供导师式的帮助和支持。',
    '校招Agent': '用于辅助校园招聘工作的 AI 智能体。',
    '飞书人事': '基于飞书平台构建的人事管理系统，处理员工信息、入离职、考勤等人力资源相关业务。',
    '飞书招聘': '基于飞书平台构建的招聘管理系统，处理职位发布、简历管理、面试安排等招聘相关业务。',
    'MOOC': '公司内部的大规模开放在线课程平台，用于员工学习和技能提升。'
};

document.querySelectorAll('.system-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        const systemName = this.textContent.trim();
        const description = systemDescriptions[systemName] || '作为软件产品专员，我负责该系统的产品规划、需求分析、项目管理等工作。';
        const links = systemLinks[systemName] || [];
        const linkBtn = links.length > 0
            ? `<div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.5rem;">${links.map(l =>
                `<a href="${l.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.5rem 1.2rem; background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.3); border-radius: 100px; color: rgba(0,255,255,0.9); font-size: 0.85rem; font-weight: 500; text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(0,255,255,0.2)';this.style.borderColor='rgba(0,255,255,0.6)'" onmouseout="this.style.background='rgba(0,255,255,0.1)';this.style.borderColor='rgba(0,255,255,0.3)'">${l.label} ↗</a>`
              ).join('')}</div>`
            : '';
        createModal(systemName, `
            <div style="margin-bottom: 1.5rem; color: rgba(0,255,255,0.8);"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
            <p style="font-size: 1rem; color: #999999; line-height: 1.8; text-align: left;">${description}</p>
            ${linkBtn}
        `);
    });
});

// Ambient light follow — surface highlight tracks mouse
(function initAmbientLight() {
    const selector = '.system-tag, .contact-item, .sport-card, .profile-tag, .qr-card, .action-btn, .back-to-top';

    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--light-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--light-y', `${e.clientY - rect.top}px`);
        }, { passive: true });
    });
})();

// 3D card flip — tap toggle for touch devices
(function initCardFlip() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    document.querySelectorAll('.capability-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Close other flipped cards
            document.querySelectorAll('.capability-card.flipped').forEach(other => {
                if (other !== this) other.classList.remove('flipped');
            });
            this.classList.toggle('flipped');
        });
    });
})();

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('[style*="position: fixed"]').forEach(dialog => {
            if (dialog.style.zIndex === '10000') {
                dialog.remove();
            }
        });

        if (menuToggle && navLinks) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }
});

// About section — scroll-driven right panel switching
(function initAboutScroll() {
    const wrapper = document.querySelector('.about-scroll-wrapper');
    if (!wrapper) return;

    // Mobile: skip scroll hijacking
    if (window.innerWidth <= 768) return;

    const panels = wrapper.querySelectorAll('.about-panel');
    const progressFill = wrapper.querySelector('.about-progress-fill');
    const currentIndex = wrapper.querySelector('.about-current-index');
    const totalPanels = panels.length;
    let activeIndex = 0;

    function updatePanels(newIndex) {
        if (newIndex === activeIndex) return;
        if (newIndex < 0 || newIndex >= totalPanels) return;

        const prev = panels[activeIndex];
        const next = panels[newIndex];

        // Determine direction
        const goingDown = newIndex > activeIndex;

        // Remove all state classes
        panels.forEach(p => {
            p.classList.remove('active', 'exit-up');
        });

        // Previous panel exits
        if (goingDown) {
            prev.classList.add('exit-up');
        }

        // New panel enters
        next.classList.add('active');

        activeIndex = newIndex;

        // Update progress
        if (progressFill) {
            progressFill.style.width = ((newIndex + 1) / totalPanels * 100) + '%';
        }
        if (currentIndex) {
            currentIndex.textContent = newIndex + 1;
        }
    }

    function onScroll() {
        const rect = wrapper.getBoundingClientRect();
        const wrapperHeight = wrapper.offsetHeight;
        const scrolled = -rect.top;

        if (scrolled < 0 || scrolled > wrapperHeight) return;

        // Each panel gets an equal portion of the scroll distance
        // Reserve first and last 100vh for entry/exit
        const scrollRange = wrapperHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(scrolled / scrollRange, 1));
        const panelIndex = Math.min(Math.floor(progress * totalPanels), totalPanels - 1);

        updatePanels(panelIndex);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial state
    panels[0].classList.add('active');
    onScroll();
})();

// Background Music Player — Shuffle Playlist with Prev/Next
(function initBgMusic() {
    const audio = document.getElementById('bgMusic');
    const player = document.getElementById('musicPlayer');
    const btnPlay = document.getElementById('musicToggle');
    const btnPrev = document.getElementById('musicPrev');
    const btnNext = document.getElementById('musicNext');
    if (!audio || !player || !btnPlay) return;

    const tracks = [
        'music/track-01.m4a',
        'music/track-02.m4a',
        'music/track-03.m4a',
        'music/track-04.m4a',
    ];

    // Shuffle playlist
    const playlist = [...tracks].sort(() => Math.random() - 0.5);
    let currentIndex = 0;
    let isPlaying = false;
    let userPaused = false;

    audio.volume = 0.4;

    function loadTrack(index) {
        currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
        audio.src = playlist[currentIndex];
        audio.load();
    }

    function play() {
        audio.play().then(() => {
            isPlaying = true;
            player.classList.add('playing');
        }).catch(() => {});
    }

    function pause() {
        audio.pause();
        isPlaying = false;
        player.classList.remove('playing');
    }

    function nextTrack() {
        loadTrack(currentIndex + 1);
        play();
    }

    function prevTrack() {
        // If > 3s into song, restart; otherwise go to previous
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            play();
        } else {
            loadTrack(currentIndex - 1);
            play();
        }
    }

    // Auto-play next track when current ends
    audio.addEventListener('ended', nextTrack);

    // Button events
    btnPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            pause();
            userPaused = true;
        } else {
            play();
            userPaused = false;
        }
    });

    btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        userPaused = false;
        nextTrack();
    });

    btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        userPaused = false;
        prevTrack();
    });

    // Load first track
    loadTrack(0);

    // Autoplay: try immediately, retry on interaction
    play();

    function retryAutoplay() {
        if (isPlaying || userPaused) return;
        play();
    }

    function removeRetryListeners() {
        ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => {
            document.removeEventListener(evt, retryAutoplay);
        });
    }

    ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => {
        document.addEventListener(evt, retryAutoplay, { passive: true });
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        player.classList.add('playing');
        removeRetryListeners();
    });
})();

// Theme Switcher
(function initThemeSwitcher() {
    const toggle = document.getElementById('themeToggle');
    const panel = document.getElementById('themePanel');
    const dots = document.querySelectorAll('.theme-dot');
    if (!toggle || !panel || !dots.length) return;

    // Aurora blob colors per theme
    const auroraColors = {
        noir: [
            'rgba(30, 30, 30, 0.2)',
            'rgba(40, 40, 40, 0.15)',
            'rgba(20, 20, 20, 0.2)',
            'rgba(50, 50, 50, 0.1)',
            'rgba(25, 25, 25, 0.2)',
        ],
        midnight: [
            'rgba(88, 16, 194, 0.45)',   // purple
            'rgba(180, 30, 120, 0.35)',   // magenta
            'rgba(20, 40, 140, 0.4)',     // blue
            'rgba(200, 80, 30, 0.2)',     // amber
            'rgba(60, 10, 130, 0.4)',     // indigo
        ],
        ocean: [
            'rgba(10, 80, 180, 0.45)',
            'rgba(20, 120, 200, 0.35)',
            'rgba(0, 60, 160, 0.4)',
            'rgba(56, 189, 248, 0.2)',
            'rgba(5, 40, 120, 0.4)',
        ],
        aurora: [
            'rgba(120, 20, 220, 0.45)',
            'rgba(168, 85, 247, 0.35)',
            'rgba(80, 10, 180, 0.4)',
            'rgba(200, 50, 255, 0.2)',
            'rgba(100, 0, 200, 0.4)',
        ],
        forest: [
            'rgba(10, 120, 80, 0.4)',
            'rgba(20, 160, 100, 0.3)',
            'rgba(5, 80, 60, 0.4)',
            'rgba(52, 211, 153, 0.2)',
            'rgba(0, 100, 70, 0.35)',
        ],
        wine: [
            'rgba(160, 20, 50, 0.4)',
            'rgba(200, 40, 80, 0.3)',
            'rgba(120, 10, 40, 0.4)',
            'rgba(251, 113, 133, 0.2)',
            'rgba(140, 0, 50, 0.35)',
        ],
        warm: [
            'rgba(160, 100, 20, 0.4)',
            'rgba(200, 130, 40, 0.3)',
            'rgba(120, 70, 10, 0.4)',
            'rgba(251, 191, 36, 0.2)',
            'rgba(140, 80, 0, 0.35)',
        ],
    };

    // Accent colors for SVG curve, icons, highlights
    const accentColors = {
        noir:     'rgba(255, 255, 255, 0.5)',
        midnight: 'rgba(0, 255, 255, 0.8)',
        ocean:    'rgba(56, 189, 248, 0.8)',
        aurora:   'rgba(168, 85, 247, 0.8)',
        forest:   'rgba(52, 211, 153, 0.8)',
        wine:     'rgba(251, 113, 133, 0.8)',
        warm:     'rgba(251, 191, 36, 0.8)',
    };

    function applyTheme(theme) {
        // Set data attribute for CSS custom properties
        document.documentElement.setAttribute('data-theme', theme);

        // Update aurora blobs
        const blobs = document.querySelectorAll('.aurora-blob');
        const colors = auroraColors[theme] || auroraColors.midnight;
        blobs.forEach((blob, i) => {
            if (colors[i]) {
                const currentBg = getComputedStyle(blob).backgroundImage;
                // Replace the color in radial-gradient
                blob.style.backgroundImage = `radial-gradient(circle, ${colors[i]} 0%, ${colors[i].replace(/[\d.]+\)$/, '0.15)')} 45%, transparent 70%)`;
            }
        });

        // Update accent color CSS variable for dynamic elements
        const accent = accentColors[theme] || accentColors.midnight;
        document.documentElement.style.setProperty('--c-accent-glow', accent);

        // Update active dot
        dots.forEach(d => d.classList.toggle('active', d.dataset.theme === theme));

        // Save preference
        localStorage.setItem('site-theme', theme);
    }

    // Toggle panel open/close
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
    });

    // Close panel on outside click
    document.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    panel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Theme dot clicks
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            applyTheme(dot.dataset.theme);
            panel.classList.remove('open');
        });
    });

    // Load saved theme (default: noir)
    const saved = localStorage.getItem('site-theme') || 'midnight';
    applyTheme(saved);
})();

// Ink Drop Interactive Background
(function initInkCanvas() {
    const canvas = document.getElementById('inkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const drops = [];
    let width, height;
    let frameId = null;
    let trailCanvas, trailCtx;

    // Color palettes per theme
    const palettes = {
        noir:     ['rgba(60,60,60,A)', 'rgba(80,80,80,A)', 'rgba(40,40,40,A)'],
        midnight: ['rgba(0,180,200,A)', 'rgba(0,220,255,A)', 'rgba(0,140,180,A)', 'rgba(20,100,140,A)'],
        ocean:    ['rgba(30,140,220,A)', 'rgba(56,189,248,A)', 'rgba(10,80,160,A)', 'rgba(20,110,190,A)'],
        aurora:   ['rgba(130,50,220,A)', 'rgba(168,85,247,A)', 'rgba(100,20,200,A)', 'rgba(180,100,255,A)'],
        forest:   ['rgba(20,160,100,A)', 'rgba(52,211,153,A)', 'rgba(10,120,80,A)', 'rgba(30,180,110,A)'],
        wine:     ['rgba(200,40,80,A)', 'rgba(251,113,133,A)', 'rgba(160,20,60,A)', 'rgba(220,60,100,A)'],
        warm:     ['rgba(200,150,30,A)', 'rgba(251,191,36,A)', 'rgba(180,120,10,A)', 'rgba(220,170,50,A)'],
    };

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'noir';
    }

    function getPalette() {
        return palettes[getTheme()] || palettes.noir;
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class InkDrop {
        constructor(x, y, isBurst) {
            this.x = x + (Math.random() - 0.5) * (isBurst ? 40 : 6);
            this.y = y + (Math.random() - 0.5) * (isBurst ? 40 : 6);
            this.radius = isBurst ? Math.random() * 4 + 2 : Math.random() * 2 + 1;
            this.maxRadius = this.radius * (isBurst ? 6 : 4) + Math.random() * 10;
            this.opacity = isBurst ? 0.12 : 0.06;
            this.growth = (isBurst ? 0.8 : 0.4) + Math.random() * 0.3;
            this.life = 1;
            this.decay = 0.01 + Math.random() * 0.01;
            const palette = getPalette();
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update() {
            if (this.radius < this.maxRadius) {
                this.radius += this.growth;
                this.growth *= 0.98; // slow down expansion
            }
            this.life -= this.decay;
            return this.life > 0;
        }

        draw(c) {
            const alpha = this.opacity * this.life;
            if (alpha <= 0.001) return;

            const color = this.color.replace('A', alpha.toFixed(3));
            const edgeColor = this.color.replace('A', '0');

            const grad = c.createRadialGradient(
                this.x, this.y, this.radius * 0.1,
                this.x, this.y, this.radius
            );
            grad.addColorStop(0, color);
            grad.addColorStop(0.5, this.color.replace('A', (alpha * 0.6).toFixed(3)));
            grad.addColorStop(1, edgeColor);

            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = grad;
            c.fill();
        }
    }

    function addDrop(x, y, isBurst) {
        drops.push(new InkDrop(x, y, isBurst));
        if (!frameId) animate();
    }

    // Init trail canvas for residue
    function initTrail() {
        trailCanvas = document.createElement('canvas');
        trailCtx = trailCanvas.getContext('2d');
        trailCanvas.width = width;
        trailCanvas.height = height;
    }
    initTrail();

    const _resize = resize;
    resize = function() {
        _resize();
        trailCanvas.width = width;
        trailCanvas.height = height;
    };

    let fadeCounter = 0;

    function animate() {
        // 1. Fade trail — erase 5% opacity each frame
        trailCtx.globalCompositeOperation = 'destination-out';
        trailCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        trailCtx.fillRect(0, 0, width, height);
        trailCtx.globalCompositeOperation = 'source-over';

        // 2. Draw active drops onto trail
        for (let i = drops.length - 1; i >= 0; i--) {
            const drop = drops[i];
            if (!drop.update()) {
                drops.splice(i, 1);
                continue;
            }
            drop.draw(trailCtx);
        }

        // 3. Composite trail onto main canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(trailCanvas, 0, 0);

        if (drops.length > 0) {
            fadeCounter = 0;
            frameId = requestAnimationFrame(animate);
        } else {
            // Continue fading trail until gone
            fadeCounter++;
            if (fadeCounter < 120) { // ~2 seconds at 60fps
                frameId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, width, height);
                trailCtx.clearRect(0, 0, width, height);
                frameId = null;
            }
        }
    }

    // Throttle for mousemove
    let lastMove = 0;

    // Mouse events
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMove < 50) return; // throttle to ~20fps for trail
        lastMove = now;
        addDrop(e.clientX, e.clientY, false);
    }, { passive: true });

    document.addEventListener('click', (e) => {
        // Burst: 6-10 drops
        const count = 6 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            addDrop(e.clientX, e.clientY, true);
        }
    });

    // Touch events
    document.addEventListener('touchmove', (e) => {
        const now = Date.now();
        if (now - lastMove < 50) return;
        lastMove = now;
        const touch = e.touches[0];
        if (touch) addDrop(touch.clientX, touch.clientY, false);
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (!touch) return;
        const count = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            addDrop(touch.clientX, touch.clientY, true);
        }
    }, { passive: true });
})();

// 3D Card Carousel — parallax depth with center focus + blur
(function initCardCarousel() {
    const cards = Array.from(document.querySelectorAll('.carousel-card'));
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (!cards.length) return;

    const total = cards.length;
    let current = 0;
    let transitioning = false;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Responsive gap between cards
    const sideOffset = isMobile ? 240 : 460;

    // Position cards based on their offset from current center
    function layout() {
        cards.forEach((card, i) => {
            const offset = i - current;
            let tx, scale, opacity, z, blur;

            if (offset === 0) {
                // Center — full size, sharp, in front
                tx = '-50%';
                scale = 1;
                opacity = 1;
                z = 3;
                blur = 0;
            } else if (offset === -1 || (offset === total - 1 && current === 0)) {
                // Left — smaller, blurred
                tx = `calc(-50% - ${sideOffset}px)`;
                scale = 0.82;
                opacity = 0.55;
                z = 1;
                blur = 4;
            } else if (offset === 1 || (offset === -(total - 1) && current === total - 1)) {
                // Right — smaller, blurred
                tx = `calc(-50% + ${sideOffset}px)`;
                scale = 0.82;
                opacity = 0.55;
                z = 1;
                blur = 4;
            } else {
                // Hidden — off screen
                tx = offset < 0 ? `calc(-50% - ${sideOffset + 400}px)` : `calc(-50% + ${sideOffset + 400}px)`;
                scale = 0.65;
                opacity = 0;
                z = 0;
                blur = 8;
            }

            card.style.transform = `translateX(${tx}) translateY(-50%) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = z;
            card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
            // Dreamy gradient overlay on non-center cards
            card.classList.toggle('dreamy', offset !== 0);
            // Center + adjacent side cards are clickable
            const isAdjacent = Math.abs(offset) === 1
                || (offset === total - 1 && current === 0)
                || (offset === -(total - 1) && current === total - 1);
            card.style.pointerEvents = (offset === 0 || isAdjacent) ? 'auto' : 'none';
        });

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(index) {
        if (transitioning) return;
        transitioning = true;
        current = ((index % total) + total) % total;
        layout();
        setTimeout(() => { transitioning = false; }, 600);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Click center card to open article, click side card to navigate
    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            if (i === current) {
                const url = card.dataset.url;
                if (url && window.openArticle) window.openArticle(url);
            } else {
                goTo(i);
            }
        });
    });

    // Buttons
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        const section = document.getElementById('articles');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    });

    // Touch swipe
    let touchX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) {
        viewport.addEventListener('touchstart', (e) => {
            touchX = e.touches[0].clientX;
        }, { passive: true });
        viewport.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchX;
            if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
        }, { passive: true });
    }

    // Initial layout
    layout();
})();

// Article Reader Modal
(function initArticleReader() {
    const reader = document.getElementById('articleReader');
    const frame = document.getElementById('readerFrame');
    const closeBtn = document.getElementById('readerClose');
    if (!reader || !frame) return;

    window.openArticle = function(url) {
        if (!url) return;
        frame.src = url;
        reader.style.display = 'flex';
        // Trigger reflow for transition
        void reader.offsetWidth;
        reader.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    function closeReader() {
        reader.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
            reader.style.display = 'none';
            frame.src = '';
        }, 400);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeReader);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && reader.classList.contains('open')) {
            closeReader();
        }
    });

    // Close on backdrop click
    reader.addEventListener('click', (e) => {
        if (e.target === reader) closeReader();
    });
})();
