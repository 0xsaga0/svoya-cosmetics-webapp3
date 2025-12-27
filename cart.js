// Модуль корзины покупок
class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.updateCartCount();
    }
    
    // Загрузить корзину из localStorage
    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('svoya_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            return [];
        }
    }
    
    // Сохранить корзину в localStorage
    saveToStorage() {
        try {
            localStorage.setItem('svoya_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    }
    
    // Добавить товар в корзину
    addProduct(productId, quantity = 1) {
        const product = Products.getById(productId);
        if (!product) {
            this.showNotification('Товар не найден', 'error');
            return false;
        }
        
        const existingItemIndex = this.items.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            // Товар уже в корзине - увеличиваем количество
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // Добавляем новый товар
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                icon: product.icon,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateCartCount();
        this.showNotification(`${product.name} добавлен в корзину!`);
        
        return true;
    }
    
    // Удалить товар из корзины
    removeProduct(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length < initialLength) {
            this.saveToStorage();
            this.updateCartCount();
            return true;
        }
        
        return false;
    }
    
    // Очистить корзину
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartCount();
        this.showNotification('Корзина очищена');
    }
    
    // Получить общее количество товаров
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    // Получить общую стоимость
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Обновить счетчик в интерфейсе
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.getTotalItems();
        const displayCount = totalItems > 99 ? '99+' : totalItems.toString();
        
        if (cartCount) {
            cartCount.textContent = displayCount;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    // Отобразить корзину в модальном окне
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartTotalPrice = document.getElementById('cartTotalPrice');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'block';
        } else {
            cartItems.style.display = 'block';
            if (cartEmpty) cartEmpty.style.display = 'none';
            
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">${item.icon}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" onclick="cart.decreaseQuantity(${item.id})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="cart.increaseQuantity(${item.id})">+</button>
                        <button class="quantity-btn remove" onclick="cart.removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `${this.getTotalPrice().toLocaleString()} ₽`;
        }
    }
    
    // Увеличить количество товара
    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.saveToStorage();
            this.updateCartCount();
            this.renderCart();
        }
    }
    
    // Уменьшить количество товара
    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            this.saveToStorage();
            this.updateCartCount();
            this.renderCart();
        } else {
            this.removeFromCart(productId);
        }
    }
    
    // Удалить товар из корзины (публичный метод для onclick)
    removeFromCart(productId) {
        if (this.removeProduct(productId)) {
            this.renderCart();
            this.showNotification('Товар удален из корзины');
        }
    }
    
    // Показать уведомление
    showNotification(message, type = 'success') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // Автоматически скрыть уведомление
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode === notifications) {
                    notifications.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Создаем глобальный экземпляр корзины
const cart = new Cart();

// Публичные методы для использования в onclick атрибутах
window.addToCart = function(productId) {
    cart.addProduct(productId);
    cart.renderCart();
};

window.openCart = function() {
    cart.renderCart();
    document.getElementById('cartModal').classList.add('active');
};

window.closeCart = function() {
    document.getElementById('cartModal').classList.remove('active');
};

window.clearCart = function() {
    if (confirm('Очистить всю корзину?')) {
        cart.clear();
        cart.renderCart();
    }
};