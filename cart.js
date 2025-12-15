// ========== CART MANAGEMENT SYSTEM ==========

// Initialize cart from localStorage or create empty cart
function getCart() {
    const cartData = localStorage.getItem('minumsCart');
    return cartData ? JSON.parse(cartData) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('minumsCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart item count in header
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-item-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(productData) {
    const cart = getCart();

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item =>
        item.id === productData.id || item.name === productData.name
    );

    if (existingItemIndex > -1) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // New item, add to cart
        cart.push({
            id: productData.id || `item-${Date.now()}`,
            name: productData.name,
            price: productData.price,
            image: productData.image || 'images/default.jpg',
            quantity: 1
        });
    }

    saveCart(cart);
    showAddToCartNotification(productData.name);
}

// Show notification when item is added to cart
function showAddToCartNotification(itemName) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <span class="notification-icon">✓</span>
        <span class="notification-text">${itemName} added to cart!</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation keyframes
    if (!document.querySelector('#cart-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            .notification-icon {
                background: white;
                color: #667eea;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize "Add to Cart" buttons
function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Find the parent product card
            const productCard = this.closest('.product-card');

            if (productCard) {
                // Extract product information
                const productName = productCard.querySelector('h4')?.textContent.trim() || 'Unknown Product';
                const priceText = productCard.querySelector('.price')?.textContent.trim() || 'RM0.00';
                const price = parseFloat(priceText.replace('RM', '').trim());
                const image = productCard.querySelector('img')?.src || 'images/default.jpg';

                // Create product data object
                const productData = {
                    id: productName.toLowerCase().replace(/\s+/g, '-'),
                    name: productName,
                    price: price,
                    image: image
                };

                // Add to cart
                addToCart(productData);
            }
        });
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    initializeAddToCartButtons();

    // If we're on the cart page, render the cart items
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }

    // If we're on the checkout page, render the checkout summary
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutPage();
    }

    // If we're on the confirmation page, populate details
    if (window.location.pathname.includes('confirmation.html')) {
        renderConfirmationPage();
    }
});

// ========== CART PAGE RENDERING ==========

// Render checkout page summary
function renderCheckoutPage() {
    const cart = getCart();
    const itemListPreview = document.querySelector('.item-list-preview');

    if (!itemListPreview) return;

    // Remove existing preview lines but keep the edit link
    const editLink = itemListPreview.querySelector('.edit-cart-link');
    itemListPreview.innerHTML = '';

    if (cart.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'item-preview-line';
        emptyMsg.textContent = 'Your cart is empty';
        itemListPreview.appendChild(emptyMsg);
    } else {
        cart.forEach(item => {
            const p = document.createElement('p');
            p.className = 'item-preview-line';
            p.textContent = `${item.quantity}x ${item.name}`;
            itemListPreview.appendChild(p);
        });
    }

    if (editLink) {
        itemListPreview.appendChild(editLink);
    }

    // Update totals
    updateOrderSummary(cart);
}

// Render confirmation page with order details
function renderConfirmationPage() {
    const cart = getCart();

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address') || 'No address provided';

    // Generate Order ID (Random for demo)
    const orderId = '#TMR-' + Math.floor(Math.random() * 1000000);
    document.querySelector('.order-id').textContent = orderId;

    // Set Address
    document.querySelector('.customer-address').textContent = address;

    // Render Items
    const itemList = document.querySelector('.item-list');
    itemList.innerHTML = '';

    if (cart.length > 0) {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.name} x${item.quantity}</span>
                <span class="item-price">RM${(item.price * item.quantity).toFixed(2)}</span>
            `;
            itemList.appendChild(li);
        });

        // Calculate Totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 3.00;
        const taxRate = 0.07;
        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax;

        // Add Breakdown Total Line
        const breakdownLi = document.createElement('li');
        breakdownLi.className = 'breakdown-total';
        breakdownLi.innerHTML = `
            <span class="item-name">Subtotal / Delivery / Tax</span>
            <span class="item-price">RM${subtotal.toFixed(2)} / RM${deliveryFee.toFixed(2)} / RM${tax.toFixed(2)}</span>
        `;
        itemList.appendChild(breakdownLi);

        // Update Final Total
        document.querySelector('.final-total').textContent = `RM${total.toFixed(2)}`;

        // Clear cart after a delay ( simulating order processing )
        // Using a flag to prevent immediate clearing if user refreshes
        if (!sessionStorage.getItem('orderProcessed_' + orderId)) {
            localStorage.removeItem('minumsCart');
            sessionStorage.setItem('orderProcessed_' + orderId, 'true');
            updateCartCount(); // Update header count to 0
        }

    } else {
        // Handle case where user navigates back or refreshes after cart is cleared
        itemList.innerHTML = '<li>Order details have been processed.</li>';
        document.querySelector('.final-total').textContent = '-';
    }
}

// Render cart items on cart.html page
function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const orderSummary = document.querySelector('.order-summary-box');

    if (!cartItemsContainer) return;

    // Clear existing items
    cartItemsContainer.innerHTML = '';

    // Handle empty cart
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; padding: 60px 20px;">
                <span style="font-size: 80px;">🛒</span>
                <h3 style="margin: 20px 0 10px; color: #333;">Your cart is empty</h3>
                <p style="color: #666; margin-bottom: 30px;">Add some refreshing drinks to get started!</p>
                <a href="listing.html" class="cta-button button-primary">Browse Our Menu</a>
            </div>
        `;

        // Hide order summary if cart is empty
        if (orderSummary) {
            orderSummary.style.display = 'none';
        }
        return;
    }

    // Show order summary
    if (orderSummary) {
        orderSummary.style.display = 'block';
    }

    // Render each cart item
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartItemsContainer.appendChild(itemElement);
    });

    // Update order summary
    updateOrderSummary(cart);
}

// Create HTML element for a cart item
function createCartItemElement(item, index) {
    const article = document.createElement('article');
    article.className = 'cart-item';
    article.dataset.id = item.id;
    article.dataset.price = item.price;

    const subtotal = (item.price * item.quantity).toFixed(2);

    article.innerHTML = `
        <div class="item-details">
            <figure class="item-image-wrap">
                <img src="${item.image}" alt="${item.name}">
            </figure>
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-price">RM${item.price.toFixed(2)}</p>
            </div>
        </div>
        
        <div class="item-controls">
            <div class="quantity-input-group">
                <label for="qty-${index}" class="sr-only">Quantity</label>
                <input type="number" id="qty-${index}" value="${item.quantity}" min="1" class="item-quantity-input" data-item-id="${item.id}">
                <button class="update-qty-btn button-secondary button-small" data-item-id="${item.id}">Update</button>
            </div>
            <button class="remove-item-btn button-secondary button-small" data-item-id="${item.id}">
                <span class="icon">🗑️</span> Remove
            </button>
        </div>
        
        <p class="item-subtotal-display">RM${subtotal}</p>
    `;

    // Add event listeners
    const removeBtn = article.querySelector('.remove-item-btn');
    const updateBtn = article.querySelector('.update-qty-btn');

    removeBtn.addEventListener('click', () => removeFromCart(item.id));
    updateBtn.addEventListener('click', () => updateCartItemQuantity(item.id));

    return article;
}

// Remove item from cart
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    renderCartPage();
}

// Update cart item quantity
function updateCartItemQuantity(itemId) {
    const input = document.querySelector(`input[data-item-id="${itemId}"]`);
    const newQuantity = parseInt(input.value);

    if (newQuantity < 1) {
        alert('Quantity must be at least 1');
        return;
    }

    let cart = getCart();
    const item = cart.find(item => item.id === itemId);

    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
        renderCartPage();
    }
}

// Update order summary with totals
function updateOrderSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 3.00;
    const taxRate = 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update summary elements
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryDelivery = document.getElementById('summary-delivery');
    const summaryTax = document.getElementById('summary-tax');
    const summaryTotal = document.getElementById('summary-total');

    if (summarySubtotal) summarySubtotal.textContent = `RM${subtotal.toFixed(2)}`;
    if (summaryDelivery) summaryDelivery.textContent = `RM${deliveryFee.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `RM${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `RM${total.toFixed(2)}`;

    // Update item count in summary
    const summaryLine = document.querySelector('.summary-line span');
    if (summaryLine) {
        summaryLine.textContent = `Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})`;
    }
}
