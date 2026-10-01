const API_BASE = 'http://localhost:5000/api';
let currentStore = null;
let cart = [];
let currentPage = 1;
let currentCategory = '';
let currentSearch = '';
let searchDebounce = null;

window.addEventListener('DOMContentLoaded', () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchNearestStore(pos.coords.latitude, pos.coords.longitude),
            () => fetchNearestStore()
        );
    } else {
        fetchNearestStore();
    }
});

async function fetchNearestStore(lat = null, lon = null) {
    const url = lat ? `${API_BASE}/stores/nearest?lat=${lat}&lon=${lon}` : `${API_BASE}/stores/nearest`;
    const res = await fetch(url);
    currentStore = await res.json();
    
    document.getElementById('store-banner').innerText = `📍 ${currentStore.store_name} (${currentStore.distance_km ? currentStore.distance_km + 'km away' : 'Default Store'})`;
    loadProducts();
    loadQueueAnalytics();
}

async function loadProducts() {
    if (!currentStore) return;
    const url = `${API_BASE}/products/${currentStore.store_id}?page=${currentPage}&limit=12&category=${currentCategory}&search=${encodeURIComponent(currentSearch)}`;
    
    const res = await fetch(url);
    const data = await res.json();

    const grid = document.getElementById('product-grid');
    grid.innerHTML = data.products.map(p => `
        <div class="product-card">
            <img src="${p.image_url}" alt="${p.name}" loading="lazy">
            <h4>${p.name}</h4>
            <div class="price">$${(p.discount_price || p.price).toFixed(2)}</div>
            <button class="btn-add" onclick="addToCart('${p.name.replace(/'/g, "\\'")}', ${p.discount_price || p.price})">+ Add</button>
        </div>
    `).join('');

    document.getElementById('page-info').innerText = `Page ${data.currentPage} of ${data.totalPages}`;
    document.getElementById('prev-btn').disabled = data.currentPage <= 1;
    document.getElementById('next-btn').disabled = data.currentPage >= data.totalPages;
}

async function loadQueueAnalytics() {
    const res = await fetch(`${API_BASE}/queue/analytics/${currentStore.store_id}`);
    const data = await res.json();
    
    document.getElementById('predicted-wait').innerText = `${data.aiInsights.current_predicted_wait_min} min`;
    document.getElementById('congestion-status').innerText = data.aiInsights.congestion_status;
    document.getElementById('ai-recommendation').innerText = `💡 ${data.aiInsights.recommendation}`;
    
    document.getElementById('counters-list').innerHTML = data.counters.map(c => `
        <div class="counter-badge">
            <span>${c.counter_name}</span>
            <span><strong>${c.current_queue_count}</strong> waiting</span>
        </div>
    `).join('');
}

function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = 'Your cart is empty.';
        document.getElementById('cart-total').innerText = '0.00';
        return;
    }

    container.innerHTML = cart.map(i => `
        <div class="cart-row">
            <span>${i.name}</span>
            <span>$${i.price.toFixed(2)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function changePage(delta) { currentPage += delta; loadProducts(); }
function handleCategoryChange() { currentCategory = document.getElementById('category-filter').value; currentPage = 1; loadProducts(); }
function handleSearch() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        currentSearch = document.getElementById('search-input').value;
        currentPage = 1;
        loadProducts();
    }, 300);
}

async function processCheckout() {
    if (cart.length === 0) return alert("Add items to your cart first!");
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const paymentMode = document.getElementById('payment-mode').value;

    const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: currentStore.store_id, totalAmount, paymentMode })
    });

    const data = await res.json();
    if (data.success) {
        const qrBox = document.getElementById('qr-result');
        qrBox.classList.remove('hidden');
        qrBox.innerHTML = `
            <h3>✅ Order Verified</h3>
            <p>Pass Code: <strong>${data.qrCodeHash}</strong></p>
            <small>Show code at store exit scanner</small>
        `;
        cart = [];
        renderCart();
    }
}