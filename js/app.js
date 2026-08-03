// Double Shot Dynamic Menu Logic
let isArabic = false;
let menuData = [];
let cardObserver = null;

const CATEGORY_IMAGES = {
    "coffee corner": "قهوه.jpg",
    "ركن القهوة": "قهوه.jpg",
    "espresso corner": "اسبرسو.webp",
    "ركن الإسبريسو": "اسبرسو.webp",
    "hot corner": "مشروب ساخن.webp",
    "مشروبات ساخنة": "مشروب ساخن.webp",
    "iced corner": "ايس درينك.jpg",
    "ركن المثلجات": "ايس درينك.jpg",
    "frappe corner": "فرابيه.jpg",
    "ركن الفرابيه": "فرابيه.jpg",
    "yogurt corner": "زبادوه.jpg",
    "ركن الزبادي": "زبادوه.jpg",
    "juice corner": "عصير فريش.jpg",
    "عصائر": "عصير فريش.jpg",
    "smoothies corner": "اسموزي.jpg",
    "ركن السموذي": "اسموزي.jpg",
    "soda corner": "صودا.jpg",
    "ركن الصودا": "صودا.jpg",
    "extras": "Double shot.jpeg",
    "إضافات": "Double shot.jpeg"
};

const CATEGORY_CLASSES = {
    "coffee corner": "coffee",
    "espresso corner": "espresso",
    "hot corner": "hot",
    "iced corner": "iced",
    "frappe corner": "frappe",
    "yogurt corner": "yogurt",
    "juice corner": "juice",
    "smoothies corner": "smoothie",
    "soda corner": "soda",
    "extras": "extra"
};

document.addEventListener('DOMContentLoaded', () => {
    initMenu();

    if (CONFIG.AUTO_REFRESH_INTERVAL && CONFIG.AUTO_REFRESH_INTERVAL > 0) {
        setInterval(() => {
            fetchBackgroundData();
        }, CONFIG.AUTO_REFRESH_INTERVAL);
    }
});

async function initMenu() {
    const cached = localStorage.getItem('doubleshot_menuData');

    if (cached) {
        try {
            menuData = JSON.parse(cached);
            renderMenu();
            initIntersectionObserver();
        } catch (e) {
            localStorage.removeItem('doubleshot_menuData');
        }
        fetchBackgroundData();
    } else {
        fetchBackgroundData();
    }
}

async function fetchBackgroundData() {
    if (!CONFIG.API_URL || CONFIG.API_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
        return; // Fallback stays active until URL is provided
    }

    try {
        const response = await fetch(CONFIG.API_URL, { 
            method: "GET",
            mode: "cors"
        });
        
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        
        const result = await response.json();
        if (result.error) throw new Error(result.error);

        const newData = result.data;
        if (newData && newData.length > 0) {
            const newDataString = JSON.stringify(newData);
            const oldDataString = localStorage.getItem('doubleshot_menuData');

            if (newDataString !== oldDataString) {
                menuData = newData;
                localStorage.setItem('doubleshot_menuData', newDataString);
                renderMenu();
            }
        }
    } catch (error) {
        console.warn("Background menu fetch error, keeping existing layout:", error);
    }
}

function renderMenu() {
    if (!menuData || menuData.length === 0) return;

    const container = document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = '';

    const categories = {};
    menuData.forEach(item => {
        const catEn = item.category_en;
        if (!categories[catEn]) {
            categories[catEn] = {
                nameEn: item.category_en,
                nameAr: item.category_ar,
                imageKey: item.image_key,
                items: []
            };
        }
        categories[catEn].items.push(item);
    });

    for (const catKey in categories) {
        const category = categories[catKey];
        const keyLower = category.nameEn.toLowerCase();
        
        let bgImg = category.imageKey || CATEGORY_IMAGES[keyLower] || "Double shot.jpeg";
        let catClass = CATEGORY_CLASSES[keyLower] || "coffee";

        const categoryElem = document.createElement('div');
        categoryElem.className = `category ${catClass}`;

        let headerStyle = bgImg ? `style="background-image: url('${bgImg}');"` : '';

        categoryElem.innerHTML = `
            <div class="category-header" ${headerStyle}>
                <h2>
                    <span class="en">${category.nameEn}</span>
                    <span class="ar">${category.nameAr}</span>
                </h2>
            </div>
            <div class="items-list">
                ${category.items.map(item => `
                    <div class="item-card">
                        <span class="item-name">
                            <span class="en">${item.name_en}</span>
                            <span class="ar">${item.name_ar}</span>
                        </span>
                        <span class="item-price">${item.price}</span>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(categoryElem);
    }

    initIntersectionObserver();
}

function initIntersectionObserver() {
    if (cardObserver) cardObserver.disconnect();

    const observerOptions = { threshold: 0.1 };
    cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.category').forEach(cat => {
        cardObserver.observe(cat);
    });
}
