const CONFIG = {
    // Google Apps Script API URL (Paste your Web App URL here after deploying Google Sheet script)
    API_URL: "https://script.google.com/macros/s/AKfycbwDwY8gqqFpfJ9yLyluG1qHBsmG43n9nHiKiDIu6_EIv_MJyKSMQkn4vhD1p3vCTgl9rQ/exec",

    // Caching duration & revalidation
    CACHE_DURATION_MS: 0,

    // Auto refresh interval in milliseconds (30 seconds)
    AUTO_REFRESH_INTERVAL: 30000,

    // Auto-scroll settings
    AUTO_SCROLL: {
        ENABLED: false, // Set to true if auto-scrolling is desired
        SPEED: 1,
        PAUSE_DURATION: 2000,
        RESUME_DELAY: 4000
    },

    // Service Charge Text
    SERVICE_CHARGE_EN: "Add 12% Service In House",
    SERVICE_CHARGE_AR: "يضاف 12% خدمة بالداخل"
};
