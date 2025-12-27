// Модуль для работы с Telegram
const TelegramService = {
    // Отправка сообщения в Telegram
    async sendMessage(order) {
        const { BOT_TOKEN, CHAT_ID, API_URL } = CONFIG.TELEGRAM;
        
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Не настроен Telegram бот');
            return false;
        }
        
        try {
            const message = this.formatOrderMessage(order);
            const url = `${API_URL}${BOT_TOKEN}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            return result.ok === true;
            
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
            return this.sendViaLink(order); // Пробуем альтернативный способ
        }
    },
    
    // Альтернативный способ отправки через ссылку
    sendViaLink(order) {
        try {
            const { BOT_TOKEN, CHAT_ID } = CONFIG.TELEGRAM;
            const message = this.formatOrderMessage(order);
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
            
            // Создаем скрытый iframe для отправки
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            
            // Удаляем через секунду
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('Ошибка альтернативной отправки:', error);
            return false;
        }
    },
    
    // Форматирование сообщения для Telegram
    formatOrderMessage(order) {
        let message = `<b>🛍 Новый заказ SVOYA Cosmetics!</b>\n\n`;
        message += `<b>📦 Номер заказа:</b> ${order.number}\n`;
        message += `<b>📅 Дата:</b> ${new Date(order.date).toLocaleString('ru-RU')}\n`;
        message += `<b>👤 Клиент:</b> ${order.name}\n`;
        message += `<b>📞 Телефон:</b> ${order.phone}\n`;
        message += `<b>📍 Адрес самовывоза:</b> ${order.address}\n`;
        message += `<b>🚚 Способ получения:</b> ${order.deliveryMethod}\n`;
        message += `<b>💳 Способ оплаты:</b> ${order.paymentMethod}\n\n`;
        message += `<b>🛒 Состав заказа:</b>\n`;
        
        order.items.forEach(item => {
            message += `• ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.total} ₽\n`;
        });
        
        message += `\n<b>💰 Итого:</b> ${order.total} ₽`;
        
        return message;
    }
};

// Экспорт для глобального использования
window.TelegramService = TelegramService;