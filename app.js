// Главный скрипт приложения SVOYA Cosmetics
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ SVOYA Cosmetics Web App загружен');
    
    // Инициализация Telegram Web App
    initTelegramWebApp();
    
    // Инициализация навигации
    if (window.Navigation) {
        Navigation.init();
    }
    
    // Настройка модальных окон
    setupModals();
    
    // Настройка формы заказа
    setupOrderForm();
    
    // Инициализация корзины
    if (window.cart) {
        cart.updateCartCount();
    }
});

// Telegram Web App интеграция
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('📱 Telegram Web App обнаружен');
        
        const tg = window.Telegram.WebApp;
        
        // Расширяем на весь экран
        tg.expand();
        
        // Настраиваем тему Telegram
        setupTelegramTheme(tg);
        
        // Настраиваем кнопку "Назад"
        setupTelegramBackButton(tg);
        
        // Настраиваем главную кнопку
        setupTelegramMainButton(tg);
        
        // Показываем информацию о пользователе
        if (tg.initDataUnsafe?.user) {
            console.log('👤 Пользователь Telegram:', tg.initDataUnsafe.user);
        }
        
        // Сохраняем для глобального доступа
        window.tg = tg;
        
        return tg;
    } else {
        console.log('🌐 Режим обычного браузера');
        return null;
    }
}

// Настройка темы Telegram
function setupTelegramTheme(tg) {
    const themeParams = tg.themeParams;
    
    if (themeParams) {
        const root = document.documentElement;
        
        if (themeParams.bg_color) {
            root.style.setProperty('--bg-body', themeParams.bg_color);
        }
        
        if (themeParams.text_color) {
            root.style.setProperty('--text-primary', themeParams.text_color);
        }
        
        if (themeParams.button_color) {
            root.style.setProperty('--primary-color', themeParams.button_color);
        }
    }
    
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
}

// Настройка кнопки "Назад" в Telegram
function setupTelegramBackButton(tg) {
    const updateBackButton = () => {
        const activeSection = document.querySelector('.page-section.active');
        if (activeSection && activeSection.id !== 'homeSection') {
            tg.BackButton.show();
        } else {
            tg.BackButton.hide();
        }
    };
    
    tg.BackButton.onClick(() => {
        if (window.Navigation) {
            Navigation.switchToSection('home');
        }
        tg.BackButton.hide();
    });
    
    if (window.Navigation) {
        const originalSwitch = Navigation.switchToSection;
        Navigation.switchToSection = function(sectionId) {
            originalSwitch.call(this, sectionId);
            updateBackButton();
        };
    }
    
    updateBackButton();
}

// Настройка главной кнопки Telegram
function setupTelegramMainButton(tg) {
    const updateMainButton = () => {
        if (window.cart && cart.items.length > 0) {
            const total = cart.getTotalPrice();
            tg.MainButton.setText(`🛒 Оформить (${total.toLocaleString()} ₽)`);
            tg.MainButton.setParams({
                color: tg.themeParams?.button_color || '#8a2be2',
                text_color: tg.themeParams?.button_text_color || '#ffffff'
            });
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }
    };
    
    tg.MainButton.onClick(() => {
        if (window.cart && cart.items.length > 0) {
            document.getElementById('cartModal')?.classList.remove('active');
            showOrderForm();
        }
    });
    
    if (window.cart) {
        const originalAdd = cart.addProduct;
        cart.addProduct = function(...args) {
            const result = originalAdd.apply(this, args);
            updateMainButton();
            return result;
        };
        
        const originalRemove = cart.removeProduct;
        cart.removeProduct = function(...args) {
            const result = originalRemove.apply(this, args);
            updateMainButton();
            return result;
        };
        
        const originalClear = cart.clear;
        cart.clear = function(...args) {
            const result = originalClear.apply(this, args);
            updateMainButton();
            return result;
        };
        
        updateMainButton();
    }
}

// Настройка модальных окон
function setupModals() {
    // Открытие корзины
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (window.cart) {
                cart.renderCart();
            }
            document.getElementById('cartModal').classList.add('active');
        });
    }
    
    // Закрытие корзины
    const closeCartBtn = document.getElementById('closeCartModal');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            document.getElementById('cartModal').classList.remove('active');
        });
    }
    
    // Очистка корзины
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (!window.cart || cart.items.length === 0) {
                showNotification('Корзина уже пуста', 'info');
                return;
            }
            
            if (confirm('Вы уверены, что хотите очистить корзину?')) {
                cart.clear();
                if (window.cart) {
                    cart.renderCart();
                }
            }
        });
    }
    
    // Оформление заказа из корзины
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!window.cart || cart.items.length === 0) {
                showNotification('Добавьте товары в корзину', 'error');
                return;
            }
            
            document.getElementById('cartModal').classList.remove('active');
            showOrderForm();
        });
    }
    
    // Закрытие формы заказа
    const closeOrderBtn = document.getElementById('closeOrderModal');
    if (closeOrderBtn) {
        closeOrderBtn.addEventListener('click', () => {
            document.getElementById('orderModal').classList.remove('active');
        });
    }
    
    // Возврат в корзину из формы
    const backToCartBtn = document.getElementById('backToCartBtn');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            document.getElementById('orderModal').classList.remove('active');
            document.getElementById('cartModal').classList.add('active');
        });
    }
    
    // Продолжить покупки после успешного заказа
    const continueBtn = document.getElementById('continueShoppingBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            document.getElementById('successModal').classList.remove('active');
            if (window.Navigation) {
                Navigation.switchToSection('home');
            }
        });
    }
    
    // Закрытие модальных окон при клике на оверлей
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Настройка формы заказа
function setupOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitOrder();
        });
    }
    
    // Маска для телефона
    const phoneInput = document.getElementById('orderPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                
                let formatted = '+7 (';
                if (value.length > 0) {
                    formatted += value.substring(0, 3);
                }
                if (value.length > 3) {
                    formatted += ') ' + value.substring(3, 6);
                }
                if (value.length > 6) {
                    formatted += '-' + value.substring(6, 8);
                }
                if (value.length > 8) {
                    formatted += '-' + value.substring(8, 10);
                }
                
                this.value = formatted;
            }
        });
    }
}

// Показать форму заказа
function showOrderForm() {
    updateOrderPreview();
    
    // Автозаполнение из Telegram
    if (window.tg?.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        const nameInput = document.getElementById('orderName');
        if (nameInput && !nameInput.value) {
            nameInput.value = [user.first_name, user.last_name].filter(Boolean).join(' ');
        }
    }
    
    document.getElementById('orderModal').classList.add('active');
}

// Обновить предпросмотр заказа
function updateOrderPreview() {
    const orderItemsPreview = document.getElementById('orderItemsPreview');
    const orderTotalPrice = document.getElementById('orderTotalPrice');
    
    if (!orderItemsPreview || !orderTotalPrice || !window.cart) return;
    
    let html = '';
    let total = 0;
    
    cart.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--gray-200);">
                <span style="flex: 1;">${item.name} × ${item.quantity}</span>
                <span style="font-weight: bold;">${itemTotal.toLocaleString()} ₽</span>
            </div>
        `;
    });
    
    orderItemsPreview.innerHTML = html || '<p style="color: var(--gray-500);">Нет товаров</p>';
    orderTotalPrice.textContent = `${total.toLocaleString()} ₽`;
}

// Отправить заказ
async function submitOrder() {
    const nameInput = document.getElementById('orderName');
    const phoneInput = document.getElementById('orderPhone');
    
    if (!nameInput || !phoneInput) {
        showNotification('Ошибка формы', 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // Валидация
    if (!name || name.length < 2) {
        showNotification('Введите корректное имя', 'error');
        nameInput.focus();
        return;
    }
    
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}[- ]?\d{2}[- ]?\d{2}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('Введите корректный номер телефона в формате +7 (999) 123-45-67', 'error');
        phoneInput.focus();
        return;
    }
    
    if (!window.cart || cart.items.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }
    
    // Показать загрузку
    const submitBtn = document.querySelector('#orderForm button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    }
    
    try {
        // Создать заказ
        const orderNumber = 'SV-' + Date.now().toString().slice(-6);
        const order = {
            number: orderNumber,
            date: new Date().toLocaleString('ru-RU'),
            name: name,
            phone: phone,
            items: cart.items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            total: cart.getTotalPrice(),
            deliveryMethod: 'Самовывоз',
            paymentMethod: 'Наличные при получении',
            address: 'Голубиная падь, ул. Гоголя, 41',
            source: window.tg ? 'Telegram Web App' : 'Website'
        };
        
        console.log('📦 Создан заказ:', order);
        
        // Отправить в Telegram (особый метод для Web App)
        const telegramSent = window.tg ? await sendToTelegramWebApp(order) : await sendToTelegramWebsite(order);
        
        if (telegramSent) {
            // Сохранить заказ локально
            saveOrderLocally(order);
            
            // Очистить корзину
            if (window.cart) {
                cart.clear();
                cart.renderCart();
            }
            
            // Спрятать главную кнопку Telegram
            if (window.tg) {
                tg.MainButton.hide();
            }
            
            // Показать успех
            document.getElementById('orderModal').classList.remove('active');
            document.getElementById('orderNumber').textContent = orderNumber;
            document.getElementById('successModal').classList.add('active');
            
            showNotification('✅ Заказ успешно оформлен! Мы свяжемся с вами в течение 15 минут.', 'success');
            
        } else {
            showNotification('⚠️ Заказ сохранен. Свяжитесь с нами по телефону для подтверждения.', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Ошибка оформления заказа:', error);
        showNotification('❌ Ошибка оформления заказа', 'error');
    } finally {
        // Восстановить кнопку
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// ОТПРАВКА ИЗ ОБЫЧНОГО САЙТА (работает)
async function sendToTelegramWebsite(order) {
    const BOT_TOKEN = '8578936476:AAG4DgE0kFxJwsZjwwYgFtrzgpnRbCaSu9k';
    const CHAT_ID = '6280461587';
    
    // Форматируем сообщение
    let message = `🛍 *НОВЫЙ ЗАКАЗ SVOYA COSMETICS!*%0A%0A`;
    message += `📦 *Номер заказа:* ${order.number}%0A`;
    message += `📅 *Дата:* ${order.date}%0A`;
    message += `👤 *Клиент:* ${order.name}%0A`;
    message += `📞 *Телефон:* ${order.phone}%0A`;
    message += `📍 *Адрес самовывоза:* ${order.address}%0A`;
    message += `🚚 *Способ получения:* ${order.deliveryMethod}%0A`;
    message += `💳 *Способ оплаты:* ${order.paymentMethod}%0A`;
    message += `🌐 *Источник:* ${order.source}%0A%0A`;
    message += `🛒 *СОСТАВ ЗАКАЗА:*%0A`;
    
    order.items.forEach(item => {
        message += `• ${item.name}%0A  ${item.quantity} × ${item.price} ₽ = ${item.total} ₽%0A`;
    });
    
    message += `%0A💰 *ИТОГО К ОПЛАТЕ:* ${order.total.toLocaleString()} ₽`;
    
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${message}&parse_mode=Markdown`;
    
    console.log('🌐 Отправка с сайта:', telegramUrl);
    
    try {
        // Для обычного сайта используем Image метод
        const img = new Image();
        img.src = telegramUrl;
        
        // Дублируем через iframe
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;border:none;';
        iframe.src = telegramUrl;
        document.body.appendChild(iframe);
        setTimeout(() => {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }, 3000);
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка отправки с сайта:', error);
        return false;
    }
}

// ОТПРАВКА ИЗ TELEGRAM WEB APP (особый метод)
async function sendToTelegramWebApp(order) {
    const BOT_TOKEN = '8578936476:AAG4DgE0kFxJwsZjwwYgFtrzgpnRbCaSu9k';
    const CHAT_ID = '6280461587';
    
    console.log('📱 Отправка из Telegram Web App');
    
    // Метод 1: Используем Telegram Web App API
    if (window.tg) {
        try {
            // Отправляем данные через sendData
            tg.sendData(JSON.stringify({
                type: 'order',
                order: order
            }));
            console.log('✅ Данные отправлены через tg.sendData()');
        } catch (error) {
            console.log('❌ tg.sendData() не сработал:', error);
        }
    }
    
    // Метод 2: Создаем специальную ссылку для Telegram
    let message = `🛍 НОВЫЙ ЗАКАЗ SVOYA COSMETICS!\n\n`;
    message += `📦 Номер заказа: ${order.number}\n`;
    message += `📅 Дата: ${order.date}\n`;
    message += `👤 Клиент: ${order.name}\n`;
    message += `📞 Телефон: ${order.phone}\n`;
    message += `📍 Адрес: ${order.address}\n`;
    message += `🚚 Способ: ${order.deliveryMethod}\n`;
    message += `💳 Оплата: ${order.paymentMethod}\n\n`;
    message += `🛒 СОСТАВ ЗАКАЗА:\n`;
    
    order.items.forEach(item => {
        message += `• ${item.name}\n  ${item.quantity} × ${item.price} ₽ = ${item.total} ₽\n`;
    });
    
    message += `\n💰 ИТОГО: ${order.total.toLocaleString()} ₽`;
    
    // В Telegram Web App используем другой подход
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
    
    console.log('🔗 Telegram URL для Web App:', telegramUrl);
    
    try {
        // В Telegram Web App ограничения строже, используем только разрешенные методы
        
        // 1. Пробуем открыть в системном браузере
        window.open(telegramUrl, '_system');
        
        // 2. Пробуем через location (иногда работает)
        setTimeout(() => {
            window.location.href = telegramUrl;
            setTimeout(() => {
                history.back(); // Возвращаемся назад
            }, 100);
        }, 100);
        
        // 3. Сохраняем заказ для ручной отправки администратором
        saveOrderForManualSending(order);
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки из Web App:', error);
        
        // Создаем кнопку для ручной отправки
        createManualSendButton(order);
        
        return false;
    }
}

// Создать кнопку для ручной отправки
function createManualSendButton(order) {
    const manualBtn = document.createElement('button');
    manualBtn.innerHTML = '📤 Отправить заказ вручную';
    manualBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    manualBtn.onclick = () => {
        const message = `Заказ ${order.number}\nКлиент: ${order.name}\nТелефон: ${order.phone}\nСумма: ${order.total} ₽`;
        const whatsappUrl = `https://wa.me/79991234567?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    document.body.appendChild(manualBtn);
    
    // Убираем через 30 секунд
    setTimeout(() => {
        if (manualBtn.parentNode) {
            document.body.removeChild(manualBtn);
        }
    }, 30000);
}

// Сохранить заказ локально
function saveOrderLocally(order) {
    try {
        const orders = JSON.parse(localStorage.getItem('svoya_orders') || '[]');
        orders.push(order);
        localStorage.setItem('svoya_orders', JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения заказа:', error);
        return false;
    }
}

// Сохранить заказ для ручной отправки
function saveOrderForManualSending(order) {
    try {
        const manualOrders = JSON.parse(localStorage.getItem('svoya_manual_orders') || '[]');
        manualOrders.push({
            ...order,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('svoya_manual_orders', JSON.stringify(manualOrders));
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения для ручной отправки:', error);
        return false;
    }
}

// Альтернативный метод отправки через прокси
async function sendViaProxy(order) {
    try {
        // Используем публичный прокси сервер
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const telegramUrl = `https://api.telegram.org/bot8578936476:AAG4DgE0kFxJwsZjwwYgFtrzgpnRbCaSu9k/sendMessage?chat_id=6280461587&text=${encodeURIComponent(JSON.stringify(order))}`;
        
        const response = await fetch(proxyUrl + telegramUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('❌ Ошибка прокси:', error);
        return false;
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    if (!notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode === notifications) {
                notifications.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Получить иконку для уведомления
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Тест отправки
async function testTelegramSending() {
    console.log('🧪 Тестируем отправку...');
    
    const testOrder = {
        number: 'TEST-' + Date.now().toString().slice(-6),
        date: new Date().toLocaleString('ru-RU'),
        name: 'Тестовый клиент',
        phone: '+7 (999) 123-45-67',
        items: [{ name: 'Тестовый товар', price: 1000, quantity: 1, total: 1000 }],
        total: 1000,
        deliveryMethod: 'Самовывоз',
        paymentMethod: 'Наличные',
        address: 'Тестовый адрес',
        source: 'Тест'
    };
    
    const result = window.tg ? 
        await sendToTelegramWebApp(testOrder) : 
        await sendToTelegramWebsite(testOrder);
    
    showNotification(result ? '✅ Тест отправлен' : '❌ Тест не отправлен', 
                    result ? 'success' : 'error');
    
    return result;
}

// Функции для контактов
function openMap() {
    const address = encodeURIComponent('Голубиная падь, ул. Гоголя, 41');
    const url = `https://yandex.ru/maps/?text=${address}`;
    window.open(url, '_blank');
}

function callPhone(phone) {
    window.location.href = `tel:${phone}`;
}

// Глобальные функции
window.openMap = openMap;
window.callPhone = callPhone;
window.testTelegramSending = testTelegramSending;

// Добавляем кнопку теста в интерфейс
if (window.location.hostname.includes('vercel')) {
    setTimeout(() => {
        const testBtn = document.createElement('button');
        testBtn.innerHTML = '🔧';
        testBtn.title = 'Тест отправки';
        testBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 9999;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #8a2be2;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        testBtn.onclick = testTelegramSending;
        document.body.appendChild(testBtn);
    }, 3000);
}