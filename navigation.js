// Модуль навигации между категориями и каталогом
const Navigation = {
    currentCategory: 'all',
    
    // Инициализация навигации
    init() {
        this.loadCategories();
        this.setupEventListeners();
    },
    
    // Загрузка карточек категорий
    loadCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;
        
        const categories = Products.getCategories();
        
        categoriesGrid.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-image">
                    ${category.icon}
                </div>
                <div class="category-content">
                    <h3 class="category-title">${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                    <div class="category-count">
                        <i class="fas fa-box"></i>
                        <span>${category.count} товаров</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Добавить обработчики кликов на карточки категорий
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.category;
                this.openCatalog(categoryId);
            });
        });
    },
    
    // Открыть каталог с товарами выбранной категории
    openCatalog(categoryId) {
        this.currentCategory = categoryId;
        
        // Обновить заголовок каталога
        const category = Products.getCategoryById(categoryId);
        const catalogTitle = document.getElementById('catalogTitle');
        if (catalogTitle && category) {
            catalogTitle.textContent = category.name;
        }
        
        // Загрузить товары категории
        this.loadProducts(categoryId);
        
        // Переключить на раздел каталога
        this.switchToSection('catalog');
        
        // Прокрутить вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Загрузить товары категории
    loadProducts(categoryId) {
        const productsGrid = document.getElementById('productsGrid');
        const noProducts = document.getElementById('noProducts');
        
        if (!productsGrid) return;
        
        const products = Products.getByCategory(categoryId);
        
        if (products.length === 0) {
            productsGrid.style.display = 'none';
            if (noProducts) noProducts.style.display = 'block';
            return;
        }
        
        productsGrid.style.display = 'grid';
        if (noProducts) noProducts.style.display = 'none';
        
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.icon}
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-details">
                        <span class="product-volume">${product.volume}</span>
                        ${product.inStock ? '<span class="product-instock">В наличии</span>' : ''}
                    </div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> В корзину
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Переключение между разделами
    switchToSection(sectionId) {
        // Скрыть все разделы
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Показать выбранный раздел
        const targetSection = document.getElementById(sectionId + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Обновить активную кнопку навигации
        this.updateNavButtons(sectionId);
    },
    
    // Обновить активные кнопки навигации
    updateNavButtons(activeSection) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            if (button.dataset.section === activeSection) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопки нижней навигации
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = button.dataset.section;
                this.switchToSection(sectionId);
            });
        });
        
        // Кнопка "Назад к категориям"
        const backToCategoriesBtn = document.getElementById('backToCategories');
        if (backToCategoriesBtn) {
            backToCategoriesBtn.addEventListener('click', () => {
                this.switchToSection('home');
            });
        }
        
        // Кнопки "Назад" в разделах "О компании" и "Контакты"
        const backFromAboutBtn = document.getElementById('backFromAbout');
        if (backFromAboutBtn) {
            backFromAboutBtn.addEventListener('click', () => {
                this.switchToSection('home');
            });
        }
        
        const backFromContactsBtn = document.getElementById('backFromContacts');
        if (backFromContactsBtn) {
            backFromContactsBtn.addEventListener('click', () => {
                this.switchToSection('home');
            });
        }
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
} else {
    window.Navigation = Navigation;
}