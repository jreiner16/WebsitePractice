const DEFAULT_DATA = [
    {
        id: 'sauvage-edt',
        name: 'Sauvage EDT',
        brand: 'Dior',
        image: 'https://images.unsplash.com/photo-1585386959984-a415522316f6?q=80&w=900&auto=format&fit=crop',
        notes: ['ambroxan', 'bergamot', 'pepper', 'fresh', 'woody'],
        description: 'Crisp bergamot and pepper over ambroxan woods. Versatile, mass-appealing fresh-woody.',
        price: 99,
        currency: 'USD',
        link: 'https://www.dior.com/',
        alternatives: [
            { name: 'Armaf Club de Nuit Intense Man', brand: 'Armaf', price: 38, similarity: 70 },
            { name: 'Perry Ellis 360 Red', brand: 'Perry Ellis', price: 25, similarity: 60 }
        ]
    },
    {
        id: 'aventus',
        name: 'Aventus',
        brand: 'Creed',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=900&auto=format&fit=crop',
        notes: ['pineapple', 'birch', 'musk', 'fruity', 'smoky'],
        description: 'Iconic pineapple over smoky birch and musk. Confident and refined signature.',
        price: 365,
        currency: 'USD',
        link: 'https://www.creedfragrances.com/',
        alternatives: [
            { name: 'Armaf Club de Nuit Intense Man', brand: 'Armaf', price: 38, similarity: 80 },
            { name: 'Montblanc Explorer', brand: 'Montblanc', price: 65, similarity: 70 }
        ]
    },
    {
        id: 'light-blue',
        name: 'Light Blue Pour Homme',
        brand: 'Dolce & Gabbana',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=900&auto=format&fit=crop',
        notes: ['citrus', 'aquatic', 'fresh', 'juniper'],
        description: 'Sparkling citrus and aquatic breeze. Bright, casual, summer-ready.',
        price: 76,
        currency: 'USD',
        alternatives: [
            { name: 'Versace Man Eau Fraiche', brand: 'Versace', price: 55, similarity: 65 },
            { name: 'Bath & Body Works Ocean', brand: 'BBW', price: 16, similarity: 45 }
        ]
    }
];

const gridEl = document.getElementById('grid');
const searchEl = document.getElementById('searchInput');
const resultCountEl = document.getElementById('resultCount');

const STORAGE_KEY = 'fragrance_finder_data_v1';

function getData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_DATA;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_DATA;
        return parsed;
    } catch (e) {
        console.warn('Failed to parse saved data, falling back to defaults', e);
        return DEFAULT_DATA;
    }
}

function setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatPrice(price, currency = 'USD') {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
    } catch {
        return `$${price}`;
    }
}

function html(strings, ...values) {
    return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');
}

function renderCard(item) {
    const altId = `alt-${item.id}`;
    const notes = item.notes && item.notes.length ? item.notes.join(', ') : '';
    const price = item.price != null ? formatPrice(item.price, item.currency) : '';
    const hasAlts = Array.isArray(item.alternatives) && item.alternatives.length > 0;
    const imgSrc = item.image || 'https://images.unsplash.com/photo-1520975682031-7f89c7199a76?q=80&w=900&auto=format&fit=crop';
    return html`
    <article class="card" data-id="${item.id}">
      <img class="thumb" src="${imgSrc}" alt="${item.name} bottle" loading="lazy" />
      <div class="card-body">
        <div class="title">
          <div>
            <h3>${item.name}</h3>
            <div class="brand">${item.brand}</div>
          </div>
          <div class="price">${price}</div>
        </div>
        ${notes ? `<div class="notes">${notes}</div>` : ''}
        ${item.description ? `<div class="desc">${item.description}</div>` : ''}
        ${hasAlts ? `<button class="toggle" data-target="${altId}" type="button">See alternatives</button>` : ''}
        ${hasAlts ? renderAlternatives(item.alternatives, altId) : ''}
      </div>
    </article>
  `;
}

function renderAlternatives(alternatives, id) {
    const rows = alternatives.map((alt) => {
        const price = alt.price != null ? formatPrice(alt.price) : '';
        const right = [price, alt.similarity != null ? `${alt.similarity}%` : null]
            .filter(Boolean)
            .join(' · ');
        const label = [alt.name, alt.brand].filter(Boolean).join(' — ');
        const linkAttrs = alt.link ? `href="${alt.link}" target="_blank" rel="noopener"` : '';
        return html`
      <div class="alt-item">
        <div class="label">
          <strong>${label}</strong>
        </div>
        <div>
          ${alt.link ? `<a ${linkAttrs} class="btn btn-ghost">Buy</a>` : ''}
          <span class="muted">${right}</span>
        </div>
      </div>
    `;
    }).join('');
    return html`<div id="${id}" class="alt-list">${rows}</div>`;
}

function renderGrid(data) {
    const q = (searchEl.value || '').trim().toLowerCase();
    const filtered = q ? data.filter((item) => matchesQuery(item, q)) : data;
    gridEl.innerHTML = filtered.map(renderCard).join('');
    resultCountEl.textContent = `Showing ${filtered.length}`;
}

function matchesQuery(item, q) {
    const haystack = [
        item.name,
        item.brand,
        item.description,
        ...(item.notes || [])
    ].join(' ').toLowerCase();
    return haystack.includes(q);
}

// Utilities to load and parse fragrances.txt (Python-like list of tuples)
const EMBEDDED_FRAGRANCES_TXT = `fragrances = [
    ("Aventus", "Creed", ["Pineapple", "Bergamot", "Birch", "Musk"], "A fruity-woody powerhouse beloved for its pineapple, smoky birch and musky sophistication.", 425, ["Al Haramain L'Aventure", "Armaf Club de Nuit Intense Man"]),
    ("Baccarat Rouge 540", "Maison Francis Kurkdjian", ["Saffron", "Amberwood", "Jasmine", "Cedar"], "A radiant amber-woody gourmand with airy saffron and sweet, crystalline woods.", 325, ["Ariana Grande Cloud", "Al Haramain Amber Oud Rouge"]),
    ("Sauvage", "Dior", ["Bergamot", "Ambroxan", "Pepper", "Lavender"], "A modern aromatic-amber scent built on bright bergamot and salty ambroxan.", 130, ["Armaf Ventana", "Rasasi Blue Lady (similar vibe)"]),
    ("Bleu de Chanel", "Chanel", ["Grapefruit", "Incense", "Cedar", "Ginger"], "A sophisticated aromatic-woody fragrance balancing fresh citrus with smoky incense.", 150, ["Mont Blanc Explorer", "Armaf Tag-Him"]),
    ("Light Blue", "Dolce & Gabbana", ["Lemon", "Apple", "Cedar", "Musk"], "A crisp Mediterranean-inspired scent with sparkling citrus and apple freshness.", 100, ["Versace Dylan Turquoise", "Zara Summer dupes"]),
    ("La Vie Est Belle", "Lancôme", ["Iris", "Praline", "Vanilla", "Patchouli"], "A sweet-floral gourmand celebrating femininity with iris and creamy gourmand facets.", 120, ["Armaf Club de Nuit Women", "Lattafa Raghba Woman"]),
    ("Good Girl", "Carolina Herrera", ["Tonka Bean", "Tuberose", "Cocoa", "Coffee"], "A modern oriental floral mixing sweet tonka and sultry tuberose for bold femininity.", 125, ["Zara Oriental", "Armaf Club de Nuit Women"]),
    ("1 Million", "Paco Rabanne", ["Cinnamon", "Leather", "Amber", "Rose"], "A flashy spicy-oriental with sweet cinnamon and leather gourmand facets.", 110, ["Armaf Club de Nuit Urban Man", "Afnan 9PM"]),
    ("Flowerbomb", "Viktor & Rolf", ["Jasmine", "Patchouli", "Vanilla", "Orange Blossom"], "An explosive floral gourmand known for its lush jasmine and warm vanilla undercurrent.", 145, ["Ariana Grande Cloud"]),
    ("Black Opium", "Yves Saint Laurent", ["Coffee", "Vanilla", "Jasmine", "Pear"], "A gourmand-oriental built on coffee, soft white florals and sweet vanilla.", 135, ["Zara Gardenia", "Lattafa Khamrah Qahwa"]),
    ("Acqua di Gio", "Giorgio Armani", ["Marine Notes", "Jasmine", "Cedar", "Patchouli"], "A classic aquatic aromatic evoking sea breeze, citrus and clean woods.", 115, ["Armaf Tres Nuit", "Perry Ellis 360 Red"]),
    ("Coco Mademoiselle", "Chanel", ["Orange", "Patchouli", "Rose", "Vanilla"], "A modern chypre-floral with lively citrus and sensual patchouli for timeless femininity.", 150, ["Zara Femme", "Armaf La Marocaine"]),
    ("Aventus for Her", "Creed", ["Green Apple", "Bergamot", "Patchouli", "Musk"], "A bright fruity-floral with pineapple/green apple facets and a musky-woody base.", 345, ["Rasasi Hawas Eau de Parfum"]),
    ("Aqua Universalis", "Maison Francis Kurkdjian", ["Lemon", "Lime", "Musk", "Muguet"], "A fresh, clean cologne-driven scent ideal as a crisp everyday fragrance.", 200, ["Jo Malone Wood Sage & Sea Salt"]),
    ("Tobacco Vanille", "Tom Ford", ["Tobacco", "Vanilla", "Cocoa", "Spices"], "A rich oriental gourmand marrying warm tobacco and creamy vanilla for luxurious depth.", 295, ["Montale Intense Cafe"]),
    ("Oud Wood", "Tom Ford", ["Oud", "Cardamom", "Vanilla", "Sandalwood"], "A polished woody-oriental built around smooth oud and exotic spices.", 290, ["Armaf Club de Nuit Intense"]),
    ("Santal 33", "Le Labo", ["Sandalwood", "Cedar", "Cardamom", "Leather"], "An iconic modern woody with smoky sandalwood and spicy creamy facets.", 280, ["Maison Margiela Jazz Club"]),
    ("Molecule 01", "Escentric Molecules", ["Iso E Super"], "A minimalist, skin-like woody-amber that highlights the molecule ISO E SUPER for unique diffusion.", 130, ["Various minimalistic woody dupes"]),
    ("J'adore", "Dior", ["Ylang-Ylang", "Damask Rose", "Jasmine", "Bergamot"], "A luminous floral bouquet centered on ylang-ylang and rich white florals.", 140, ["Versace Bright Crystal"]),
    ("Alien", "Thierry Mugler", ["Jasmine Sambac", "Cashmeran", "Amber", "White Wood"], "A distinctive woody-amber floral with an otherworldly jasmine-amber signature.", 120, ["Thierry Mugler Aura"]),
    ("Angel", "Thierry Mugler", ["Patchouli", "Vanilla", "Chocolate", "Red Berries"], "A groundbreaking gourmand-oriental with heavy patchouli and sweet confectionary notes.", 110, ["Angel Eau Sucree"]),
    ("Le Male", "Jean Paul Gaultier", ["Lavender", "Mint", "Vanilla", "Cinnamon"], "An aromatic fougère with sweet vanilla and fresh aromatic top for masculine charisma.", 95, ["Paco Rabanne 1 Million"]),
    ("Jubilation XXV", "Amouage", ["Tobacco", "Frankincense", "Berries", "Oud"], "A complex, opulent oriental blending rich resins, fruits and dark woods for formal occasions.", 350, ["Amouage Reflection Man"]),
    ("Reflection Man", "Amouage", ["Neroli", "Jasmine", "Iris", "Sandalwood"], "A refined woody-floral offering a polished neroli-jasmine heart over warm woods.", 300, ["Creed Spring Flower"]),
    ("Encre Noire", "Lalique", ["Cypress", "Vetiver", "Cashmere Wood", "Musk"], "A dark vetiver-centric woody with deep earthy and mineral facets.", 85, ["Rasasi La Yuqawam"]),
    ("Green Irish Tweed", "Creed", ["Lemon", "Iris", "Sandalwood", "Ambergris"], "A fresh aromatic fougère evoking green, grassy elegance and crisp citrus.", 395, ["Davidoff Cool Water"]),
    ("Silver Mountain Water", "Creed", ["Black Currant", "Tea", "Bergamot", "Musk"], "A bright aquatic-fruity with crisp bergamot and verdant black currant facets.", 345, ["Al Haramain L'Aventure Blanche"]),
    ("Black Afgano", "Nasomatto", ["Cannabis", "Agarwood", "Coffee", "Incense"], "A dark, resinous, smoky scent invoking rich oud, coffee and resinous notes for bold statements.", 220, ["Montale Black Aoud"]),
    ("Portrait of a Lady", "Frederic Malle", ["Rose", "Patchouli", "Incense", "Blackcurrant"], "A luxurious rose-oriental with intense Turkish rose and a rich patchouli base.", 240, ["By Kilian Back to Black"]),
    ("Lost Cherry", "Tom Ford", ["Black Cherry", "Bitter Almond", "Tonka", "Benzoin"], "A decadent cherry gourmand with boozy cherry and marzipan-like almond underpinnings.", 240, ["Montale Intense Cherry"]),
    ("Nuit d'Issey Polaris", "Issey Miyake", ["Spices", "Leather", "Ambroxan", "Tonka"], "A bold, spicy-amber composition with leathery depth for evening wear.", 120, ["Boss The Scent (darker)"]),
    ("Wood Sage & Sea Salt", "Jo Malone", ["Sea Salt", "Sage", "Grapefruit", "Ambrette"], "A breezy, mineral scent capturing coastal air, sea salt and aromatic sage.", 140, ["Maison Francis Kurkdjian Aqua Universalis"]),
    ("Colonia", "Acqua di Parma", ["Bergamot", "Orange", "Lavender", "Rosemary"], "A classic citrus cologne with refined Italian citrus and aromatic herbal accents.", 175, ["4711 Eau de Cologne"]),
    ("Oud Satin Mood", "Maison Francis Kurkdjian", ["Oud", "Benzoin", "Rose", "Vanilla"], "A velvety oud-rose blend with gourmand sweetness and enveloping resinous textures.", 330, ["Armaf Club de Nuit Intense"]),
    ("Layton", "Parfums de Marly", ["Apple", "Lavender", "Vanilla", "Patchouli"], "A crowd-pleasing oriental woody with bright fruity top and warm vanilla base.", 220, ["Armaf Club de Nuit Intense Man"]),
    ("Herod", "Parfums de Marly", ["Tobacco Leaf", "Vanilla", "Cinnamon", "Sandalwood"], "A smooth tobacco-vanilla oriental with gourmand warmth and refined spice.", 215, ["Mancera Red Tobacco"]),
    ("Interlude Man", "Amouage", ["Orris", "Amber", "Incense", "Myrrh"], "An epic smoky-amber with dense resinous and incense layers for dramatic presence.", 350, ["Xerjoff Uden"]),
    ("Narciso", "Narciso Rodriguez", ["Musk", "Orange Blossom", "Ambrette", "Patchouli"], "A musky-floral signature noted for clean musks softened by white florals.", 120, ["Montblanc Lady Emblem"]),
    ("Oud Immortel", "Byredo", ["Patchouli", "Agarwood", "Papyrus", "Tobacco"], "A smoky woody-amber featuring warm patchouli and dry, papyrus-like textures.", 195, ["Montale Black Aoud"]),
    ("Gypsy Water", "Byredo", ["Bergamot", "Juniper", "Pine Needles", "Vanilla"], "A fresh aromatic woody evoking pine forests and warm vanilla undercurrent.", 180, ["Le Labo Another 13"]),
    ("Jazz Club", "Maison Margiela Replica", ["Rum", "Tobacco Leaf", "Vanilla", "Styrax"], "A cozy, smoky club vibe with boozy rum, tobacco and sweet vanilla undertones.", 120, ["Tom Ford Tobacco Vanille"]),
    ("By the Fireplace", "Maison Margiela Replica", ["Chestnut", "Cloves", "Vanilla", "Guaiac Wood"], "Warm smoky chestnut and wood-smoke gourmand evoking winter fireplaces.", 120, ["Montale Intense Cafe"]),
    ("Angel Muse", "Thierry Mugler", ["Hazelnut", "Vetiver", "Cocoa", "Patchouli"], "A modern twist on classic gourmand with hazelnut praline and earthy vetiver.", 110, ["Angel (original family)"]),
    ("Mon Paris", "Yves Saint Laurent", ["Strawberry", "Datura", "Patchouli", "Ambroxan"], "A modern fruity-floral with sweet berries and a dusty patchouli base.", 125, ["Viktor & Rolf Flowerbomb"]),
    ("Idole", "Lancôme", ["Pear", "Jasmine", "Musk", "Patchouli"], "A clean, modern floral spotlighting jasmine and smooth musks for a skin-like signature.", 115, ["Glossier You"]),
    ("Irish Leather", "Memo Paris", ["Leather", "Juniper", "Green Notes", "Tonka"], "A bold leathery-green fragrance inspired by the Irish countryside and horseback rides.", 240, ["Tom Ford Tuscan Leather"]),
    ("Tuscan Leather", "Tom Ford", ["Leather", "Saffron", "Blackcurrant", "Sandalwood"], "A rich, smoky leather complemented by sweet berry facets and resinous saffron.", 320, ["Memo Irish Leather"]),
    ("Eros", "Versace", ["Mint", "Tonka Bean", "Vanilla", "Cedar"], "A bold, sweet aromatic with fresh mint brightness and creamy tonka-vanilla depth.", 105, ["Rasasi Hawas"]),
    ("Dylan Blue", "Versace", ["Bergamot", "Patchouli", "Incense", "Grapefruit"], "A versatile aromatic-woody with aquatic freshness and dry patchouli depth.", 105, ["Afnan 9AM Dive"]),
    ("Bright Crystal", "Versace", ["Pomegranate", "Peony", "Yuzu", "Musk"], "A light, fruity-floral perfect for summer with airy musk and sparkling fruit.", 85, ["Escada Florals"]),
    ("The One", "Dolce & Gabbana", ["Grapefruit", "Tobacco", "Amber", "Ginger"], "A warm, spicy-oriental with elegant tobacco and amber facets for evening wear.", 125, ["Armaf Club de Nuit Intense Man"]),
    ("Black Orchid", "Tom Ford", ["Black Truffle", "Black Orchid", "Patchouli", "Incense"], "A dark, opulent floral-oriental with truffle, rich florals and deep woods.", 210, ["Yves Saint Laurent Black Opium"]),
    ("Olympea", "Paco Rabanne", ["Green Mandarin", "Jasmine", "Salt", "Vanilla"], "A modern gourmand floral with salty accords, sweet vanilla and fresh citrus top.", 110, ["Viktor & Rolf Flowerbomb"]),
    ("Libre", "Yves Saint Laurent", ["Lavender", "Orange Blossom", "Musk", "Vanilla"], "A bold floral-oriental combining aromatic lavender and warm vanilla musk.", 120, ["Chanel Coco Mademoiselle"]),
    ("Smoky Vetiver", "Tom Ford", ["Vetiver", "Smoke", "Grapefruit", "Cedar"], "A refined vetiver with smoky and citrus facets for a sophisticated earthy scent.", 240, ["Encre Noire"]),
    ("Pure XS", "Paco Rabanne", ["Ginger", "Vanilla", "Cedar", "Myrrh"], "An opulent oriental-gourmand with spicy ginger and sweet vanilla for seductive nights.", 95, ["Jean Paul Gaultier Ultra Male"]),
    ("Invictus", "Paco Rabanne", ["Grapefruit", "Marine Accord", "Bay Leaf", "Guaiac Wood"], "A sporty aquatic-woody with fresh citrus and a warm woody base.", 95, ["Davidoff Cool Water"]),
    ("Fleur Musc", "Narciso Rodriguez", ["Rose", "Musk", "Amber", "Cedar"], "A soft, musky floral with powdery rose and clean musk for intimate wear.", 110, ["Narciso (original)"]),
    ("Mitsouko", "Guerlain", ["Peach", "Moss", "Spice", "Oakmoss"], "A classic chypre with fruity top and mossy, mysterious drydown.", 150, ["Vintage chypre alternatives"]),
    ("Fracas", "Robert Piguet", ["Tuberose", "Orange Blossom", "Jasmine", "Citrus"], "A heady white floral tuberose icon with powerful projection.", 140, ["Other tuberose niche scents"]),
    ("Aqva Pour Homme", "Bvlgari", ["Marine Notes", "Mandarin", "Santolina", "Mineral"], "An aquatic aromatic evoking mineral sea air and crisp citrus.", 60, ["Acqua di Gio (lighter aquatic)"]),
    ("Fico di Amalfi", "Acqua di Parma", ["Fig", "Citrus", "Jasmine", "Cedar"], "A juicy fig-centric fresh scent inspired by the Amalfi coast.", 175, ["Atelier Cologne fig options"]),
    ("Vanille Fatale", "Tom Ford", ["Vanilla", "Incense", "Benzoin", "Spices"], "A luxurious, smoky-vanilla oriental with resinous depth and spice nuances.", 260, ["Various niche vanilla fragrances"]),
    ("Intense Cafe", "Montale", ["Coffee", "Rose", "Vanilla", "Amber"], "A gourmand pairing of rich coffee and sweet vanilla wrapped in a rose accord.", 130, ["Tom Ford Tobacco Vanille"]),
    ("Red Tobacco", "Mancera", ["Tobacco", "Cinnamon", "Vanilla", "Sandalwood"], "A spicy-tobacco gourmand with sweet cinnamon and vanilla smoothing the edges.", 150, ["Parfums de Marly Herod"]),
    ("Portrait of a Lady (Frederic Malle)", "Frederic Malle", ["Rose", "Blackcurrant", "Patchouli", "Incense"], "A baroque rose-centered oriental with heavy patchouli and smoky incense accents.", 240, ["By Kilian Back to Black"]),
    ("Shalimar", "Guerlain", ["Bergamot", "Iris", "Vanilla", "Tonka"], "A legendary oriental with powdery iris, sweet vanilla and warm resins.", 110, ["Classic orientals list"]),
    ("No.5", "Chanel", ["Aldehydes", "Rose", "Ylang-Ylang", "Sandalwood"], "The archetypal aldehydic floral balancing powdery florals and warm woods.", 160, ["Classic aldehydic florals"]),
    ("L'Interdit", "Givenchy", ["Orange Blossom", "Jasmine", "Patchouli", "Vetiver"], "A modern white-floral with dark patchouli contrast for sophisticated femininity.", 115, ["Dior J'adore"]),
    ("Terre d'Hermes", "Hermès", ["Grapefruit", "Vetiver", "Orange", "Patchouli"], "A refined woody-earthy citrus with bitter orange and mineral vetiver backbone.", 135, ["Dior Homme"]),
    ("Eau de Cartier", "Cartier", ["Yuzu", "Lavender", "Patchouli", "Cypress"], "A clean aromatic-citrus with a mineral freshness and smooth herbal backbone.", 85, ["Light aquatic colognes"]),
    ("Spicebomb", "Viktor & Rolf", ["Cinnamon", "Tobacco", "Vetiver", "Violet"], "An explosive spicy oriental with pronounced cinnamon and tobacco-forward profile.", 95, ["Paco Rabanne 1 Million"]),
    ("L'Eau d'Issey", "Issey Miyake", ["Lotus", "Yuzu", "Cedar", "Musk"], "A watery-floral aquatic with clean, airy aquatic notes and soft floral touches.", 80, ["Light Blue"]),
    ("Chypre", "Various (classic)", ["Bergamot", "Oakmoss", "Patchouli", "Labdanum"], "A category of perfumes (classic chypre profile) celebrated for mossy, woody, citrus balance.", 100, ["Vintage chypres"])
]`;
function toSlugId(name, brand) {
    const slug = `${(name || '').toString()}-${(brand || '').toString()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || 'item';
}

function parseFragrancesTxt(raw) {
    try {
        if (!raw) return [];
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) return [];
        const inner = raw.slice(start, end + 1);
        // Convert tuple syntax ( ... ) to JSON arrays [ ... ]
        const asJsonArrays = inner.replace(/\(/g, '[').replace(/\)/g, ']');
        const data = JSON.parse(asJsonArrays);
        if (!Array.isArray(data)) return [];
        // Each entry: [name, brand, notes[], description, price, alternatives[]]
        const objects = data.map((arr) => {
            const [name, brand, notes, description, price, alternatives] = arr;
            return {
                id: toSlugId(name, brand),
                name: name,
                brand: brand,
                image: '',
                notes: Array.isArray(notes) ? notes : [],
                description: description || '',
                price: typeof price === 'number' ? price : undefined,
                currency: 'USD',
                alternatives: Array.isArray(alternatives) ? alternatives.map((n) => ({ name: n })) : []
            };
        });
        return objects;
    } catch (e) {
        console.warn('Failed to parse fragrances.txt', e);
        return [];
    }
}

async function loadFragrancesTxt() {
    try {
        const res = await fetch('./fragrances.txt', { cache: 'no-cache' });
        if (res.ok) {
            const text = await res.text();
            const parsed = parseFragrancesTxt(text);
            if (parsed && parsed.length) return parsed;
        }
        // Fallback to embedded copy if fetch blocked or empty
        const embeddedParsed = parseFragrancesTxt(EMBEDDED_FRAGRANCES_TXT);
        return embeddedParsed && embeddedParsed.length ? embeddedParsed : null;
    } catch (e) {
        // Likely blocked when opened via file://; fallback to embedded copy
        const embeddedParsed = parseFragrancesTxt(EMBEDDED_FRAGRANCES_TXT);
        return embeddedParsed && embeddedParsed.length ? embeddedParsed : null;
    }
}

function mergeByNameBrand(baseData, incoming) {
    const normalize = (s) => (s || '').toString().trim().toLowerCase();
    const map = new Map();
    for (const item of baseData) {
        map.set(`${normalize(item.brand)}|${normalize(item.name)}`, item);
    }
    for (const item of incoming) {
        const key = `${normalize(item.brand)}|${normalize(item.name)}`;
        if (!map.has(key)) {
            map.set(key, item);
        }
    }
    return Array.from(map.values());
}

function onClick(e) {
    const toggle = e.target.closest('.toggle');
    if (toggle) {
        const id = toggle.getAttribute('data-target');
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle('open');
            toggle.textContent = el.classList.contains('open') ? 'Hide alternatives' : 'See alternatives';
        }
    }
}

function attachEvents() {
    searchEl.addEventListener('input', () => renderGrid(getData()));
    gridEl.addEventListener('click', onClick);
}

async function boot() {
    attachEvents();
    // Initial render with existing (possibly saved) data
    renderGrid(getData());
    // Try to load fragrances.txt and merge in new items
    const loaded = await loadFragrancesTxt();
    if (loaded && loaded.length) {
        const merged = mergeByNameBrand(getData(), loaded);
        setData(merged);
        renderGrid(merged);
    }
}

// Soundboard (runs only when window.SOUNDBOARD_MODE is true)
(function () {
    const keyLayout = [
        ['1', '2', '3', '4', '5', '6', '7', '8'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',']
    ];
    const padNames = (
        'Kick,SNARE,Clap,Hat,Bass,Lead,Chord,FX,' +
        'Tom,Shaker,Cowbell,OpenHat,Sub,Pluck,Stab,Bell,' +
        'Noise,Sweep,Pad,Whistle,Arp,Glass,Click,Boom,' +
        'Zap,Blip,Laser,Rise,Whoosh,Ding,Pop,Drop'
    ).split(',');

    let audioCtx = null;
    let masterGain = null;
    let isMuted = false;
    let volume = 0.8;
    const SETTINGS_KEY = 'soundboard_settings_v1';

    function loadSettings() {
        try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { volume: 0.8, muted: false }; } catch { return { volume: 0.8, muted: false }; }
    }
    function saveSettings(s) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { } }

    function ensureAudio() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = AC ? new AC() : null;
            if (audioCtx) {
                masterGain = audioCtx.createGain();
                masterGain.connect(audioCtx.destination);
                applyVolume();
            }
        }
    }
    function applyVolume() { if (masterGain) masterGain.gain.value = isMuted ? 0 : volume; }

    function playTone(freq, type, dur, attack, release) {
        ensureAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + (attack ?? 0.005));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (attack ?? 0.005) + (dur ?? 0.2) + (release ?? 0.12));
        osc.connect(gain).connect(masterGain);
        osc.start(now);
        osc.stop(now + 1);
    }
    function playNoise(dur, lpHz) {
        ensureAudio();
        if (!audioCtx) return;
        const d = dur ?? 0.1;
        const bufferSize = Math.floor(audioCtx.sampleRate * d);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = lpHz ?? 6000;
        const gain = audioCtx.createGain();
        gain.gain.value = 1;
        src.connect(filter).connect(gain).connect(masterGain);
        src.start();
        src.stop(audioCtx.currentTime + d + 0.02);
    }
    function playPadSound(i) {
        const idx = i % 32;
        switch (idx) {
            case 0: playTone(60, 'sine', 0.22); break;
            case 1: playTone(180, 'triangle', 0.12); break;
            case 2: playNoise(0.05, 10000); break;
            case 3: playTone(220, 'square', 0.18); break;
            case 4: playTone(110, 'sawtooth', 0.25); break;
            case 5: playTone(440, 'triangle', 0.22); break;
            case 6: playTone(330, 'square', 0.2); break;
            case 7: playTone(550, 'sine', 0.15); break;
            case 8: playTone(98, 'sine', 0.25); break;
            case 9: playTone(262, 'sawtooth', 0.22); break;
            case 10: playNoise(0.08, 5000); break;
            case 11: playTone(880, 'square', 0.1); break;
            case 12: playTone(65, 'sine', 0.28); break;
            case 13: playTone(392, 'triangle', 0.2); break;
            case 14: playTone(523, 'square', 0.12); break;
            case 15: playNoise(0.2, 2000); break;
            case 16: playTone(740, 'sine', 0.12); break;
            case 17: playTone(988, 'triangle', 0.08); break;
            case 18: playTone(440, 'sine', 0.4); break;
            case 19: playTone(659, 'sawtooth', 0.14); break;
            case 20: playNoise(0.06, 8000); break;
            case 21: playTone(330, 'sine', 0.22); break;
            case 22: playTone(247, 'triangle', 0.18); break;
            case 23: playTone(784, 'square', 0.12); break;
            case 24: playNoise(0.04, 12000); break;
            case 25: playTone(300, 'sawtooth', 0.2); break;
            case 26: playTone(200, 'square', 0.22); break;
            case 27: playTone(600, 'sine', 0.1); break;
            case 28: playTone(850, 'triangle', 0.1); break;
            case 29: playTone(150, 'sawtooth', 0.18); break;
            case 30: playTone(500, 'square', 0.12); break;
            case 31: playTone(250, 'triangle', 0.15); break;
        }
    }
    function renderPads() {
        const grid = document.getElementById('padGrid');
        if (!grid) return;
        const keys = keyLayout.flat().map(k => k.toUpperCase());
        grid.innerHTML = keyLayout.map((row, r) => row.map((k, c) => {
            const idx = r * 8 + c;
            const accent = `accent${(idx % 4) + 1}`;
            const name = padNames[idx] || `Pad ${idx + 1}`;
            const hint = keys[idx] || '';
            return `<button class="pad ${accent}" data-idx="${idx}" type="button" aria-label="${name}">\n` +
                `<div class=\"label\"><div class=\"name\">${name}</div><div class=\"hint\">${hint}</div></div>\n` +
                `</button>`;
        }).join('')).join('');
    }
    function flashPad(el) {
        el.style.transform = 'translateY(1px) scale(0.99)';
        el.style.boxShadow = '0 4px 18px rgba(0,0,0,.45)';
        setTimeout(() => { el.style.transform = ''; el.style.boxShadow = ''; }, 90);
    }
    function onPadClick(e) {
        const pad = e.target.closest('.pad');
        if (!pad) return;
        ensureAudio(); if (audioCtx && audioCtx.resume) audioCtx.resume();
        const idx = Number(pad.getAttribute('data-idx')) || 0;
        flashPad(pad);
        playPadSound(idx);
    }
    function onKey(e) {
        const k = (e.key || '').toLowerCase();
        const flat = keyLayout.flat();
        const idx = flat.indexOf(k);
        if (idx >= 0) {
            const pad = document.querySelector(`[data-idx="${idx}"]`);
            if (pad) { pad.click(); e.preventDefault(); }
        }
    }
    function bindControls() {
        const s = loadSettings();
        isMuted = !!s.muted;
        volume = typeof s.volume === 'number' ? s.volume : 0.8;
        const muteBtn = document.getElementById('muteBtn');
        const volumeEl = document.getElementById('volume');
        if (volumeEl) { volumeEl.value = String(volume); volumeEl.addEventListener('input', (e) => { volume = Number(e.target.value); applyVolume(); saveSettings({ volume, muted: isMuted }); }); }
        if (muteBtn) { muteBtn.setAttribute('aria-pressed', String(isMuted)); muteBtn.textContent = isMuted ? 'Unmute' : 'Mute'; muteBtn.addEventListener('click', () => { isMuted = !isMuted; muteBtn.setAttribute('aria-pressed', String(isMuted)); muteBtn.textContent = isMuted ? 'Unmute' : 'Mute'; applyVolume(); saveSettings({ volume, muted: isMuted }); }); }
    }
    function bootSoundboard() {
        renderPads();
        bindControls();
        const grid = document.getElementById('padGrid');
        if (grid) grid.addEventListener('click', onPadClick);
        document.addEventListener('keydown', onKey);
    }
    document.addEventListener('DOMContentLoaded', () => {
        if (window.SOUNDBOARD_MODE) bootSoundboard();
        else if (typeof boot === 'function') boot();
    });
})();

// End


