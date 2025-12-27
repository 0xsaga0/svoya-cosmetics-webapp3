// Простейшая и самая надежная отправка в Telegram
window.sendToTelegramSimple = function(order) {
    // Токен и чат ID
    const BOT_TOKEN = '7405044418:AAG5uZ4-7L2eCtsqgR6w3p_zcQhX3dYH-l4';
    const CHAT_ID = '6662824638';
    
    // Формируем сообщение
    let message = `🛍 Новый заказ SVOYA Cosmetics!\n\n`;
    message += `📦 Номер заказа: ${order.number}\n`;
    message += `📅 Дата: ${order.date}\n`;
    message += `👤 Клиент: ${order.name}\n`;
    message += `📞 Телефон: ${order.phone}\n`;
    message += `📍 Адрес самовывоза: ${order.address}\n`;
    message += `🚚 Способ получения: ${order.deliveryMethod}\n`;
    message += `💳 Способ оплаты: ${order.paymentMethod}\n\n`;
    message += `🛒 Состав заказа:\n`;
    
    order.items.forEach(item => {
        message += `• ${item.name} - ${item.quantity} × ${item.price} ₽ = ${item.total} ₽\n`;
    });
    
    message += `\n💰 Итого: ${order.total} ₽`;
    
    // Кодируем для URL
    const encodedMessage = encodeURIComponent(message);
    
    // Формируем URL
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodedMessage}`;
    
    // Отправляем через несколько методов для надежности
    
    // Метод 1: Image (самый надежный обход CORS)
    const img = new Image();
    img.src = telegramUrl;
    
    // Метод 2: Iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = telegramUrl;
    document.body.appendChild(iframe);
    
    // Метод 3: Script tag
    const script = document.createElement('script');
    script.src = telegramUrl;
    document.body.appendChild(script);
    
    // Метод 4: Form submit
    setTimeout(() => {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = telegramUrl;
        form.target = '_blank';
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => document.body.removeChild(form), 1000);
    }, 100);
    
    // Метод 5: Открываем в новом окне
    setTimeout(() => {
        window.open(telegramUrl, '_telegram');
    }, 200);
    
    // Очистка через 5 секунд
    setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        if (document.body.contains(script)) document.body.removeChild(script);
    }, 5000);
    
    return true;
};