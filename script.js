/**
 * Lancaster Downtown Deli - The Rotating Special
 * Expandable menu sections and interactions
 * Dynamic content loading from JSON files
 */

(function() {
    'use strict';

    // ============================================
    // LOAD CONTENT FROM JSON FILES
    // ============================================

    async function loadContent() {
        try {
            // Load menu and special data in parallel
            const [menuResponse, specialResponse] = await Promise.all([
                fetch('content/menu.json'),
                fetch('content/special.json')
            ]);

            const menuData = await menuResponse.json();
            const specialData = await specialResponse.json();

            // Render the content
            renderSpecial(specialData);
            renderMenu(menuData);

            // Initialize interactions after content is loaded
            initMenuInteractions();
            initScrollAnimations();

        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    // ============================================
    // RENDER TODAY'S SPECIAL
    // ============================================

    function renderSpecial(special) {
        if (!special.isActive) return;

        const specialSection = document.querySelector('.special-hero');
        if (!specialSection) return;

        // Update special content
        const titleEl = specialSection.querySelector('.special-title');
        const descEl = specialSection.querySelector('.special-description');
        const priceEl = specialSection.querySelector('.special-price');
        const imageEl = specialSection.querySelector('.special-image');
        const tagEl = specialSection.querySelector('.special-tag');

        if (titleEl) titleEl.textContent = special.title;
        if (descEl) descEl.textContent = special.description;
        if (priceEl) priceEl.textContent = `$${special.price.toFixed(2)}`;
        if (imageEl && special.image) {
            imageEl.src = special.image;
            imageEl.alt = special.title;
        }

        // Show/hide customer favorite tag
        if (tagEl) {
            tagEl.style.display = special.showCustomerFavorite ? 'inline-flex' : 'none';
        }
    }

    // ============================================
    // RENDER MENU SECTIONS
    // ============================================

    function renderMenu(menuData) {
        renderMenuCategory('breakfast', menuData.breakfast);
        renderMenuCategory('lunch', menuData.sandwiches);
        renderMenuCategory('sides', menuData.sides, true);
        renderMenuCategory('drinks', menuData.drinks);
    }

    function renderMenuCategory(categoryId, items, showNote = false) {
        const category = document.querySelector(`.menu-category[data-category="${categoryId}"]`);
        if (!category) return;

        const menuItemsContainer = category.querySelector('.menu-items');
        if (!menuItemsContainer) return;

        // Clear existing items
        menuItemsContainer.innerHTML = '';

        // Render each item
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'menu-item' + (item.isPopular ? ' featured' : '');

            const priceDisplay = item.priceDisplay || `$${item.price.toFixed(2)}`;
            const popularIcon = item.isPopular ? ' <i class="fa-solid fa-fire"></i>' : '';

            li.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}${popularIcon}</span>
                    <span class="item-desc">${item.description}</span>
                </div>
                <span class="item-price">${priceDisplay}</span>
            `;

            menuItemsContainer.appendChild(li);
        });

        // Add note for sides category
        if (showNote) {
            const existingNote = category.querySelector('.menu-note');
            if (!existingNote) {
                const noteEl = document.createElement('p');
                noteEl.className = 'menu-note';
                noteEl.innerHTML = '<i class="fa-solid fa-circle-info"></i> All sandwiches come with a side included. All dressings and aiolis made in-house.';
                category.querySelector('.menu-category-content').appendChild(noteEl);
            }
        }
    }

    // ============================================
    // EXPANDABLE MENU CATEGORIES
    // ============================================

    function initMenuInteractions() {
        const menuCategories = document.querySelectorAll('.menu-category');

        menuCategories.forEach(category => {
            const header = category.querySelector('.menu-category-header');

            header.addEventListener('click', () => {
                const isExpanded = category.getAttribute('data-expanded') === 'true';

                // Close all other categories (accordion behavior)
                menuCategories.forEach(other => {
                    if (other !== category) {
                        other.setAttribute('data-expanded', 'false');
                        other.querySelector('.menu-category-header').setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current category
                category.setAttribute('data-expanded', !isExpanded);
                header.setAttribute('aria-expanded', !isExpanded);
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ============================================

    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================

    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animateOnScroll.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        const animateElements = document.querySelectorAll(
            '.menu-category, .review-card, .info-card, .feature'
        );

        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            animateOnScroll.observe(el);
        });

        // Add animation class styles
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================

    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        } else {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // ============================================
    // INITIALIZE
    // ============================================

    // Load content when DOM is ready
    loadContent();

    console.log('Lancaster Downtown Deli v6 - The Rotating Special loaded.');

})();
