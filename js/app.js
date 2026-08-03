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
    "extras": "",
    "إضافات": ""
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

const VALID_LOCAL_IMAGES = [
    "Double shot.jpeg",
    "اسبرسو.webp",
    "اسموزي.jpg",
    "ايس درينك.jpg",
    "بوبا.jpg",
    "زبادوه.jpg",
    "صودا.jpg",
    "عصير فريش.jpg",
    "فرابيه.jpg",
    "قهوه.jpg",
    "مشروب ساخن.webp",
    "هوت.jpg"
];

function parseCSV(csvText) {
    const lines = [];
    let currentLine = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentLine.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentLine.push(currentCell.trim());
            if (currentLine.some(cell => cell !== '')) {
                lines.push(currentLine);
            }
            currentLine = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }

    if (currentCell || currentLine.length > 0) {
        currentLine.push(currentCell.trim());
        if (currentLine.some(cell => cell !== '')) {
            lines.push(currentLine);
        }
    }

    if (lines.length < 2) return [];

    const headers = lines[0].map(h => h.toLowerCase());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const item = {};
        headers.forEach((h, idx) => {
            item[h] = row[idx] !== undefined ? row[idx] : '';
        });

        let avail = String(item.availability).toUpperCase();
        let isAvailable = (avail === '' || avail === 'TRUE' || avail === '1' || item.availability === true);

        if (isAvailable) {
            items.push({
                id: item.id,
                category_en: item.category_en,
                category_ar: item.category_ar,
                name_en: item.name_en,
                name_ar: item.name_ar,
                price: item.price,
                availability: isAvailable,
                order: parseInt(item.order) || 0,
                image_key: item.image_key
            });
        }
    }

    items.sort((a, b) => a.order - b.order);
    return items;
}

async function fetchBackgroundData() {
    if (!CONFIG.API_URL || CONFIG.API_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
        return; // Fallback stays active until URL is provided
    }

    try {
        const response = await fetch(CONFIG.API_URL, { 
            method: "GET",
            cache: "no-store"
        });
        
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        
        let newData = [];
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("json")) {
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            newData = result.data;
        } else {
            const text = await response.text();
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                const result = JSON.parse(text);
                newData = result.data || result;
            } else {
                newData = parseCSV(text);
            }
        }

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
        
        let isExtra = (keyLower === "extras" || keyLower === "إضافات");
        let bgImg = isExtra ? "" : category.imageKey;
        if (!isExtra && (!bgImg || !VALID_LOCAL_IMAGES.includes(bgImg))) {
            bgImg = CATEGORY_IMAGES[keyLower] || "Double shot.jpeg";
        }
        let catClass = CATEGORY_CLASSES[keyLower] || "coffee";

        const categoryElem = document.createElement('div');
        categoryElem.className = `category ${catClass}`;

        let headerStyle = bgImg ? `style="background-image: url('${bgImg}');"` : 'style="background-image: none; background-color: #0b0a09;"';

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
