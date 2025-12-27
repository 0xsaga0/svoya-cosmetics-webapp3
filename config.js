// Конфигурация приложения
const CONFIG = {
    // Настройки магазина
    SHOP_NAME: "SVOYA Cosmetics",
    COMPANY_NAME: 'ООО "СИБ-ДВ"',
    ADDRESS: "Голубиная падь, ул. Гоголя, 41",
    PHONE: "+7 (999) 123-45-67",
    EMAIL: "info@svoya-cosmetics.ru",
    
    // Настройки заказа
    ORDER: {
        MIN_AMOUNT: 0, // Минимальная сумма заказа
        FREE_SHIPPING_MIN: 0, // Минимальная сумма для бесплатной доставки
        PICKUP_ONLY: true, // Только самовывоз
        CASH_ONLY: true, // Только наличные при получении
        WORKING_HOURS: {
            weekdays: "9:00 - 20:00",
            weekends: "10:00 - 18:00"
        }
    },
    
    // Настройки уведомлений
    NOTIFICATIONS: {
        AUTO_HIDE: true,
        DURATION: 3000,
        POSITION: "top-right"
    },
    
    // Настройки хранения
    STORAGE_KEYS: {
        CART: "svoya_cart",
        ORDERS: "svoya_orders",
        USER_DATA: "svoya_user"
    },
    
    // Настройки API (если будет бэкенд)
    API: {
        BASE_URL: "", // URL вашего API
        ENDPOINTS: {
            CREATE_ORDER: "/api/orders",
            GET_PRODUCTS: "/api/products",
            GET_CATEGORIES: "/api/categories"
        }
    },
    
    // Настройки Telegram Web App
    TELEGRAM: {
        ENABLED: false, // По умолчанию выключено
        INIT_DATA: null,
        USER: null
    }
};

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}