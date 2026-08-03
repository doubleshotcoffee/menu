const CONFIG = {
    // Google Apps Script API URL (Paste your Web App URL here after deploying Google Sheet script)
    API_URL: "https://script.google.com/macros/s/AKfycbwTaZLNF38R5jHEwiMu9y5VNqsBmqNB0DpZnCnXtiLL-gH4jpZtxswgiOFK6GOaWDyA/exec",

    // Caching duration & revalidation
    CACHE_DURATION_MS: 0,

    // Auto refresh interval in milliseconds (15 seconds for fast live updates)
    AUTO_REFRESH_INTERVAL: 15000,

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
