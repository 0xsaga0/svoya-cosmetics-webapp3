// Прокси для отправки в Telegram (работает без CORS)
class TelegramProxy {
    constructor() {
        this.proxyUrls = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            '' // Прямой запрос (может не работать из-за CORS)
        ];
        
        this.currentProxyIndex = 0;
    }
    
    // Основной метод отправки
    async sendOrder(order) {
        const BOT_TOKEN = '7405044418:AAG5uZ4-7L2eCtsqgR6w3p_zcQhX3dYH-l4';
        const CHAT_ID = '6662824638';
        
        // Формируем сообщение
        const message = this.formatMessage(order);
        
        // Пробуем все прокси по очереди
        for (let i = 0; i < this.proxyUrls.length; i++) {
            try {
                const success = await this.trySend(this.proxyUrls[i], BOT_TOKEN, CHAT_ID, message);
                if (success) {
                    console.log(`Успешно отправлено через прокси ${i}`);
                    return true;
                }
            } catch (error) {
                console.log(`Прокси ${i} не сработал:`, error.message);
                continue;
            }
        }
        
        // Если все прокси не сработали, используем fallback метод
        return this.fallbackSend(BOT_TOKEN, CHAT_ID, message);
    }
    
    // Пробуем отправить через конкретный прокси
    async trySend(proxyUrl, botToken, chatId, message) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const params = {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        };
        
        // Для GET запроса
        const getUrl = `${url}?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
        
        try {
            const response = await fetch(proxyUrl + getUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'fetch'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.ok === true;
            
        } catch (error) {
            throw error;
        }
    }
    
    // Fallback метод (самый надежный)
    fallbackSend(botToken, chatId, message) {
        try {
            // Кодируем сообщение для URL
            const encodedMessage = encodeURIComponent(message);
            
            // Создаем URL для Telegram API
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=Markdown`;
            
            // Метод 1: Открываем в новом окне/вкладке
            window.open(telegramUrl, '_telegramSend');
            
            // Метод 2: Создаем и удаляем iframe
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;';
            iframe.src = telegramUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
            }, 3000);
            
            return true;
            
        } catch (error) {
            console.error('Fallback метод также не сработал:', error);
            return false;
        }
    }
    
    // Форматирование сообщения
    formatMessage(order) {
        let message = `🛍 *Новый заказ SVOYA Cosmetics!*\n\n`;
        message += `📦 *Номер заказа:* ${order.number}\n`;
        message += `📅 *Дата:* ${order.date}\n`;
        message += `👤 *Клиент:* ${order.name}\n`;
        message += `📞 *Телефон:* ${order.phone}\n`;
        message += `📍 *Адрес самовывоза:* ${order.address}\n`;
        message += `🚚 *Способ получения:* ${order.deliveryMethod}\n`;
        message += `💳 *Способ оплаты:* ${order.paymentMethod}\n\n`;
        message += `🛒 *Состав заказа:*\n`;
        
        order.items.forEach(item => {
            message += `• ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.total} ₽\n`;
        });
        
        message += `\n💰 *Итого:* ${order.total} ₽`;
        
        return message;
    }
}

// Создаем глобальный экземпляр
window.TelegramProxy = new TelegramProxy();