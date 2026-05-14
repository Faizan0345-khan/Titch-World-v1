
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

   
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.querySelector('.navmenu');
    
    if (menuIcon && navMenu) {
     
        const mobileMenuContainer = document.createElement('div');
        mobileMenuContainer.className = 'mobile-menu-container';
        
    
        const mobileNav = navMenu.cloneNode(true);
        mobileNav.classList.add('mobile-nav');
        mobileMenuContainer.appendChild(mobileNav);
        
       
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-menu';
        closeBtn.innerHTML = '&times;';
        mobileMenuContainer.appendChild(closeBtn);
        
        
        document.body.appendChild(mobileMenuContainer);
        
        
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenuContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
      
        function closeMobileMenu() {
            mobileMenuContainer.classList.remove('active');
            document.body.style.overflow = '';
        }
        
       
        closeBtn.addEventListener('click', closeMobileMenu);
        
      
        mobileMenuContainer.addEventListener('click', function(e) {
            if (e.target === mobileMenuContainer) {
                closeMobileMenu();
            }
        });
        
        
        const mobileLinks = mobileMenuContainer.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

  
    let cart = [];
    
   
    function loadCart() {
        const savedCart = localStorage.getItem('ticthCart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch(e) {
                cart = [];
            }
        }
        updateCartCount();
    }
    
   
    function saveCart() {
        localStorage.setItem('ticthCart', JSON.stringify(cart));
    }
    
   
    function updateCartCount() {
        const cartIcon = document.querySelector('.nav-icon .bx-cart');
        if (cartIcon) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            const existingBadge = document.querySelector('.cart-count');
            if (existingBadge) existingBadge.remove();
            
            if (totalItems > 0) {
                const badge = document.createElement('span');
                badge.className = 'cart-count';
                badge.textContent = totalItems;
                cartIcon.style.position = 'relative';
                cartIcon.appendChild(badge);
            }
        }
    }
    
    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        saveCart();
        updateCartCount();
        showNotification(`${product.name} added to cart!`, 'success');
    }
    
   
    function showNotification(message, type = 'info') {
       
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) existingNotification.remove();
        
      
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <span>${escapeHtml(message)}</span>
            <button class="notification-close">&times;</button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        
        const timeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeout);
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
        }
    }
    
  
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
   
    loadCart();
    
   
    const heartIcons = document.querySelectorAll('.heart-icon');
    heartIcons.forEach((heart) => {
        heart.addEventListener('click', function(e) {
            e.stopPropagation();
            const productRow = this.closest('.row');
            if (productRow) {
                const priceElement = productRow.querySelector('.price');
                const productName = priceElement ? (priceElement.querySelector('h4')?.textContent || 'Product') : 'Product';
                const productPrice = priceElement ? (priceElement.querySelector('p')?.textContent || '$99-$199') : '$99-$199';
                
                const heartIcon = this.querySelector('i');
                if (heartIcon) {
                    const originalClass = heartIcon.className;
                    heartIcon.className = 'bx bxs-heart';
                    heartIcon.style.color = '#ee1c47';
                    setTimeout(() => {
                        heartIcon.className = originalClass;
                        heartIcon.style.color = '';
                    }, 500);
                }
                
                addToCart({
                    name: productName,
                    price: productPrice,
                    image: productRow.querySelector('img')?.src || ''
                });
            }
        });
    });

   
    const searchIcon = document.querySelector('.nav-icon .bx-search');
    let searchOverlay = null;
    
    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!searchOverlay) {
                searchOverlay = document.createElement('div');
                searchOverlay.className = 'search-overlay';
                searchOverlay.innerHTML = `
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search for products..." aria-label="Search products">
                        <button class="search-submit" aria-label="Submit search"><i class='bx bx-search'></i></button>
                        <button class="search-close" aria-label="Close search">&times;</button>
                    </div>
                    <div class="search-results"></div>
                `;
                document.body.appendChild(searchOverlay);
                
              
                const closeBtn = searchOverlay.querySelector('.search-close');
                closeBtn.addEventListener('click', closeSearch);
                
             
                searchOverlay.addEventListener('click', function(e) {
                    if (e.target === searchOverlay) closeSearch();
                });
                
                
                const searchInput = searchOverlay.querySelector('.search-input');
                const searchSubmit = searchOverlay.querySelector('.search-submit');
                
                searchInput.addEventListener('input', performSearch);
                searchSubmit.addEventListener('click', performSearch);
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') performSearch();
                });
            }
            
            searchOverlay.classList.add('active');
            const searchInput = searchOverlay.querySelector('.search-input');
            setTimeout(() => searchInput.focus(), 100);
        });
    }
    
    function performSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput?.value.toLowerCase().trim();
        const resultsContainer = document.querySelector('.search-results');
        
        if (!resultsContainer) return;
        
        if (query === '') {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('has-results');
            return;
        }
        
       
        const products = document.querySelectorAll('.row');
        const matchingProducts = [];
        
        products.forEach(product => {
            const nameElement = product.querySelector('.price h4');
            const priceElement = product.querySelector('.price p');
            const productName = nameElement ? nameElement.textContent.toLowerCase() : '';
            
            if (productName.includes(query)) {
                matchingProducts.push({
                    element: product,
                    name: nameElement?.textContent || 'Product',
                    price: priceElement?.textContent || '$99-$199',
                    image: product.querySelector('img')?.src || ''
                });
            }
        });
        
        
        if (matchingProducts.length > 0) {
            resultsContainer.innerHTML = `
                <h3>Found ${matchingProducts.length} product(s)</h3>
                <div class="search-results-grid">
                    ${matchingProducts.map(product => `
                        <div class="search-result-item" data-name="${escapeHtml(product.name)}">
                            <img src="${product.image}" alt="${escapeHtml(product.name)}">
                            <div class="result-info">
                                <h4>${escapeHtml(product.name)}</h4>
                                <p>${escapeHtml(product.price)}</p>
                                <button class="result-add-btn">Add to Cart</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            resultsContainer.classList.add('has-results');
          
            const resultItems = resultsContainer.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                const addBtn = item.querySelector('.result-add-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const productName = item.querySelector('h4')?.textContent || '';
                        const productPrice = item.querySelector('p')?.textContent || '';
                        
                        const originalProduct = Array.from(products).find(p => {
                            const nameEl = p.querySelector('.price h4');
                            return nameEl && nameEl.textContent === productName;
                        });
                        
                        if (originalProduct) {
                            const heartIcon = originalProduct.querySelector('.heart-icon');
                            if (heartIcon) heartIcon.click();
                        } else {
                            addToCart({ name: productName, price: productPrice });
                        }
                    });
                }
            });
        } else {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No products found for "${escapeHtml(query)}"</p>
                    <p>Try searching with different keywords</p>
                </div>
            `;
            resultsContainer.classList.add('has-results');
        }
    }
    
    function closeSearch() {
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            const resultsContainer = document.querySelector('.search-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.remove('has-results');
            }
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.value = '';
        }
    }
    
 
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

  
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#' && targetId !== '#trending') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    

    const backToTop = document.querySelector('.down-arrow .down');
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (header) {
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    const productRows = document.querySelectorAll('.row');
    productRows.forEach(row => {
      
        if (!row.querySelector('.quick-add-btn')) {
            const addToCartBtn = document.createElement('button');
            addToCartBtn.className = 'quick-add-btn';
            addToCartBtn.innerHTML = '<i class="bx bx-cart"></i> Quick Add';
            addToCartBtn.setAttribute('aria-label', 'Quick add to cart');
            row.appendChild(addToCartBtn);
            
            addToCartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const heartIcon = row.querySelector('.heart-icon');
                if (heartIcon) heartIcon.click();
            });
        }
    });

  
    const subscribeSection = document.querySelector('.five');
    if (subscribeSection) {
      
        if (!subscribeSection.querySelector('.subscribe-form')) {
            const form = document.createElement('form');
            form.className = 'subscribe-form';
            form.innerHTML = `
                <input type="email" placeholder="Enter your email" required aria-label="Email for newsletter">
                <button type="submit" aria-label="Subscribe to newsletter">Subscribe</button>
            `;
            subscribeSection.appendChild(form);
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input');
                const email = emailInput.value.trim();
                
                if (email && isValidEmail(email)) {
                    showNotification(`Thanks for subscribing! We'll send updates to ${email}`, 'success');
                    emailInput.value = '';
                    
                    let subscribers = JSON.parse(localStorage.getItem('ticthSubscribers') || '[]');
                    if (!subscribers.includes(email)) {
                        subscribers.push(email);
                        localStorage.setItem('ticthSubscribers', JSON.stringify(subscribers));
                    }
                } else if (email) {
                    showNotification('Please enter a valid email address', 'error');
                }
            });
        }
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }


  
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });

    const ratings = document.querySelectorAll('.rating');
    ratings.forEach(rating => {
        const stars = rating.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.addEventListener('click', function(e) {
                e.stopPropagation();
              
                stars.forEach(s => {
                    s.className = 'bx bx-star';
                });
               
                for (let i = 0; i <= index; i++) {
                    stars[i].className = 'bx bxs-star';
                }
                showNotification('Rating saved!', 'info');
            });
        });
    });



    const continueReading = document.querySelectorAll('.cart h6, .read-more-btn');
    continueReading.forEach(btn => {
        btn.addEventListener('click', function() {
            const parentCart = this.closest('.cart');
            const title = parentCart?.querySelector('h4')?.textContent || 'Post';
            showNotification(`Reading: ${title}`, 'info');
        });
    });

    const userIcon = document.querySelector('.nav-icon .bx-user');
    if (userIcon) {
        userIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            let profileModal = document.querySelector('.profile-modal');
            if (!profileModal) {
                profileModal = document.createElement('div');
                profileModal.className = 'profile-modal';
                profileModal.innerHTML = `
                    <div class="profile-modal-content">
                        <div class="profile-modal-header">
                            <h3>Account</h3>
                            <button class="profile-modal-close" aria-label="Close modal">&times;</button>
                        </div>
                        <div class="profile-modal-body">
                            <div class="profile-avatar">
                                <i class='bx bx-user-circle'></i>
                            </div>
                            <p>Welcome to Ticth World!</p>
                            <button class="profile-login-btn">Login / Sign Up</button>
                            <div class="profile-links">
                                <a href="#">My Orders</a>
                                <a href="#">Wishlist</a>
                                <a href="#">Settings</a>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(profileModal);
                
                const closeBtn = profileModal.querySelector('.profile-modal-close');
                closeBtn.addEventListener('click', () => profileModal.classList.remove('active'));
                profileModal.addEventListener('click', function(e) {
                    if (e.target === profileModal) profileModal.classList.remove('active');
                });
                
                const loginBtn = profileModal.querySelector('.profile-login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => {
                        showNotification('Login feature coming soon!', 'info');
                        profileModal.classList.remove('active');
                    });
                }
            }
            
            profileModal.classList.add('active');
        });
    }


    const existingAddButtons = document.querySelectorAll('.add-to-cart-btn');
    existingAddButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productRow = this.closest('.row');
            if (productRow) {
                const heartIcon = productRow.querySelector('.heart-icon');
                if (heartIcon) heartIcon.click();
            }
        });
    });

  
    console.log('Ticth World - Website Fully Loaded');
});