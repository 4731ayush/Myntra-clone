console.log("JS File Successfully Loaded!");

// ==========================================
// 1. AAPKE APNE ITEMS (SEQUENCE MEIN SABSE PEHLE)
// ==========================================
let products = [
    { name: "Travel Bag", price: 1499, image: "images/images1.webp", category: "men" },
    { name: "Premium Suit", price: 2999, image: "images/WhatsApp Image 2026-05-14 at 7.00.42 PM.jpeg", category: "men" },
    { name: "KIDS Wear", price: 299, image: "images/images3.webp", category: "kids" },
    { name: "Casual SHIRT", price: 700, image: "images/WhatsApp Image 2026-04-14 at 12.03.07 PM.jpeg", category: "women" },
    { name: "Luxury WATCH", price: 1999, image: "images/images5.webp", category: "men" },
    { name: "Sports SHOES", price: 199, image: "images/images6.png", category: "women" }
];

// ==========================================
// 2. CART & WISHLIST STATE (localStorage se load, hamesha sabse upar rakha
//    taaki neeche koi bhi function inhe safely use kar sake)
// ==========================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function addToCart(product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addWishlist(product) {
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function removeFromWishlist(name) {
    wishlist = wishlist.filter(item => item.name !== name);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

const brandRow = document.querySelector(".brandRow");

// Jo bhi list abhi screen par dikh rahi hai (search/sort/filter ke baad bhi),
// usko yahan track karte hain — taaki click handler sahi product dhoondh sake
let currentProducts = products;

// ==========================================
// 3. DISPLAY FUNCTION (ROW-COLUMN DISPLAYER)
// ==========================================
function displayProducts(productsToDisplay = products) {
    if (!brandRow) return;
    currentProducts = productsToDisplay;

    if (productsToDisplay.length === 0) {
        brandRow.innerHTML = `<p class="empty-message">Is category mein abhi koi product nahi hai.</p>`;
        return;
    }

    const productHTML = productsToDisplay.map(item => {
        const isWishlisted = wishlist.some(w => w.name === item.name);
        return `
            <div class="branditems">
                <i class="${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart wishlist-icon" data-name="${item.name}"></i>
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>₹${parseInt(item.price)}</p>
                <button class="cart-btn" data-name="${item.name}">Add to cart</button>
            </div>
        `;
    }).join("");

    brandRow.innerHTML = productHTML;
}

// Pehli baar mein aapke 6 items screen par rows/cols mein set ho jayenge
displayProducts();

// ==========================================
// 4. FETCH LIVE ITEMS & ADD IN SEQUENCE
// ==========================================
// fakestoreapi categories ("men's clothing" etc.) ko apne nav categories se match karta hai
function mapApiCategory(apiCategory) {
    if (!apiCategory) return "other";
    if (apiCategory.includes("men's")) return "men";
    if (apiCategory.includes("women's")) return "women";
    return "other";
}

async function getLiveProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products?limit=4");
        const liveProducts = await response.json();

        const formattedLiveProducts = liveProducts.map(item => ({
            name: item.title.substring(0, 25) + "...",
            price: Math.round(item.price * 80),
            image: item.image,
            category: mapApiCategory(item.category)
        }));

        // SEQUENCE: [...purane_items, ...naye_live_items]
        products = [...products, ...formattedLiveProducts];

        // Dobara render karo taaki row/column sequence update ho jaye
        displayProducts();
        console.log("Sequence Updated: Local + Live items grid ready!");
    } catch (error) {
        console.log("Internet slow hai ya API fail hui, sirf aapke items safe hain.");
    }
}

getLiveProducts();

// ==========================================
// 5. SEARCH (ek hi jagah se control hota hai ab — duplicate listeners hata diye)
// ==========================================
const searchForm = document.querySelector(".headerRight form");
const searchInput = document.querySelector(".headerRight input");

function runSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = products.filter(item => item.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Enter dabane par page reload na ho
        runSearch();
    });
}

if (searchInput) {
    searchInput.addEventListener("input", runSearch); // type karte hi live filter
}

// ==========================================
// 6. CART COUNT BADGE (ab seedha cart.length se aata hai, alag counter nahi)
// ==========================================
const countDisplay = document.getElementById("count");
if (countDisplay) countDisplay.innerText = cart.length;

const wishlistCountDisplay = document.getElementById("wishlistCount");
function updateWishlistCount() {
    if (wishlistCountDisplay) wishlistCountDisplay.innerText = wishlist.length;
}
updateWishlistCount();

// ==========================================
// 7. CART + WISHLIST CLICK HANDLING (dono brandRow par delegated hain)
// ==========================================
if (brandRow) {
    brandRow.addEventListener("click", (event) => {
        const target = event.target;

        // ---- Add to Cart ----
        if (target.classList.contains("cart-btn")) {
            const product = currentProducts.find(p => p.name === target.dataset.name);
            if (!product) return;

            addToCart(product);
            if (countDisplay) countDisplay.innerText = cart.length;

            target.innerText = "Added ✔";
            target.style.background = "#27ae60";
            setTimeout(() => {
                target.innerText = "Add to cart";
                target.style.background = "#ff3f6c";
            }, 1500);
        }

        // ---- Wishlist toggle ----
        if (target.classList.contains("wishlist-icon")) {
            const name = target.dataset.name;
            const isWishlisted = wishlist.some(w => w.name === name);

            if (isWishlisted) {
                removeFromWishlist(name);
                target.classList.remove("fa-solid");
                target.classList.add("fa-regular");
            } else {
                const product = currentProducts.find(p => p.name === name);
                if (product) addWishlist(product);
                target.classList.remove("fa-regular");
                target.classList.add("fa-solid");
            }
            updateWishlistCount();
        }
    });
}

// ==========================================
// 8. SORT (jo currently screen par dikh raha hai, usi ko sort karta hai)
// ==========================================
function sortLowToHigh() {
    displayProducts([...currentProducts].sort((a, b) => a.price - b.price));
}

function sortHighToLow() {
    displayProducts([...currentProducts].sort((a, b) => b.price - a.price));
}

// ==========================================
// 9. EXTRA FILTERS — ab "Under ₹500" button aur nav menu (MEN/WOMEN/KIDS) se connected hain
// ==========================================
function filterUnder500() {
    displayProducts(products.filter(item => item.price < 500));
}

function filterCategory(cat) {
    displayProducts(products.filter(item => item.category === cat));
}

// ==========================================
// 10. BANNER SLIDER
// ==========================================
const banner = ["images/Images-1.webp", "images/Images2.jpg"];
let bannerIndex = 0;
const slider = document.getElementById("slider");
if (slider) {
    setInterval(() => {
        bannerIndex = (bannerIndex + 1) % banner.length;
        slider.src = banner[bannerIndex];
    }, 3000);
}

// ==========================================
// 11. SIDE PANELS (Cart / Wishlist / Profile)
// ==========================================
const overlay = document.getElementById("overlay");

function openPanel(id) {
    document.querySelectorAll(".side-panel").forEach(p => p.classList.remove("open"));
    const panel = document.getElementById(id);
    if (panel) panel.classList.add("open");
    if (overlay) overlay.classList.add("active");

    if (id === "cartPanel") renderCartPanel();
    if (id === "wishlistPanel") renderWishlistPanel();
}

function closePanels() {
    document.querySelectorAll(".side-panel").forEach(p => p.classList.remove("open"));
    if (overlay) overlay.classList.remove("active");
}

function renderCartPanel() {
    const body = document.getElementById("cartPanelBody");
    const totalDisplay = document.getElementById("cartTotal");
    if (!body) return;

    if (cart.length === 0) {
        body.innerHTML = `<p class="empty-message">Aapka bag khaali hai.</p>`;
    } else {
        body.innerHTML = cart.map((item, i) => `
            <div class="panel-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="panel-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${parseInt(item.price)}</p>
                </div>
                <button class="panel-remove" data-index="${i}">Remove</button>
            </div>
        `).join("");
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (totalDisplay) totalDisplay.innerText = "₹" + total;
}

function renderWishlistPanel() {
    const body = document.getElementById("wishlistPanelBody");
    if (!body) return;

    if (wishlist.length === 0) {
        body.innerHTML = `<p class="empty-message">Aapki wishlist khaali hai.</p>`;
    } else {
        body.innerHTML = wishlist.map(item => `
            <div class="panel-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="panel-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${parseInt(item.price)}</p>
                </div>
                <button class="panel-remove" data-name="${item.name}">Remove</button>
            </div>
        `).join("");
    }
}

// Cart panel ke andar "Remove" click -> us index ko cart se nikal do
const cartPanelBody = document.getElementById("cartPanelBody");
if (cartPanelBody) {
    cartPanelBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("panel-remove")) {
            const idx = parseInt(event.target.dataset.index);
            cart.splice(idx, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            if (countDisplay) countDisplay.innerText = cart.length;
            renderCartPanel();
        }
    });
}

// Wishlist panel ke andar "Remove" click -> us product ko wishlist se nikal do
const wishlistPanelBody = document.getElementById("wishlistPanelBody");
if (wishlistPanelBody) {
    wishlistPanelBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("panel-remove")) {
            removeFromWishlist(event.target.dataset.name);
            updateWishlistCount();
            renderWishlistPanel();
            displayProducts(currentProducts); // grid ke heart icons bhi sync ho jayenge
        }
    });
}
// Galat tarika (agar elements dynamically bane hain)
document.querySelectorAll('.cart-item').forEach(item => {
   item.addEventListener('click', () => { /* redirect */ });
});

// Sahi tarika (Event Delegation)
document.querySelector('.bag-items-container').addEventListener('click', (event) => {
   if (event.target.closest('.cart-item')) {
       // Yaha redirect ka logic likhein
       window.location.href = "product_details.html";
   }
});