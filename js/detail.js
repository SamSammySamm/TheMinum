// ========== DETAIL PAGE DYNAMIC RENDERING ==========

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyA03gmfkZFjWauZR9uza-TkTrTuAPWsUFg",
    authDomain: "theminums.firebaseapp.com",
    projectId: "theminums",
    storageBucket: "theminums.firebasestorage.app",
    messagingSenderId: "130106351120",
    appId: "1:130106351120:web:458a2576f99cef54b4b495"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Product descriptions database (Fallback)
const productDescriptions = {
    'signature-cold-brew': {
        description: 'Our Signature Cold Brew is steeped for over 18 hours, resulting in a super-smooth, low-acidity coffee concentrate. It\'s strong enough to kickstart your morning and perfectly balanced to enjoy all day. Sourced from single-origin, ethically farmed beans.',
        details: [
            'Origin: Ethiopian Yirgacheffe',
            'Notes: Chocolate, Caramel, hint of Citrus',
            'Caffeine Level: High',
            'Best Served: Iced or over milk'
        ],
        tagLine: 'Crafted for Clarity'
    },
    'tropical-sunset-smoothie': {
        description: 'A vibrant blend of exotic tropical fruits including mango, pineapple, and passion fruit. Each sip transports you to a sunny beach paradise. Packed with vitamins and natural sweetness, it\'s the perfect refreshing treat for any time of day.',
        details: [
            'Ingredients: Mango, Pineapple, Passion Fruit, Banana',
            'Vitamins: Rich in Vitamin C & A',
            'Sweetness: Naturally Sweet',
            'Best Served: Chilled with ice'
        ],
        tagLine: 'Sunshine in a Glass'
    },
    'calming-chamomile-tea': {
        description: 'Our Calming Chamomile Tea is made from premium dried chamomile flowers, known for their soothing and relaxing properties. Perfect for unwinding after a long day or enjoying a peaceful moment. Naturally caffeine-free and gently sweet.',
        details: [
            'Type: Herbal Tea',
            'Origin: Organic Chamomile Flowers',
            'Caffeine: None',
            'Best Served: Hot or Iced'
        ],
        tagLine: 'Peaceful Moments Await'
    }
};

// Load product details from URL parameters
function loadProductDetails() {
    const productId = getURLParameter('id');
    const productName = getURLParameter('name');
    const productPrice = getURLParameter('price');
    const productImage = getURLParameter('image');

    // If no parameters, use default product
    if (!productId || !productName || !productPrice) {
        console.warn('No product parameters found, using default product');
        return;
    }

    // Update page title
    document.title = `${productName} | The Minum`;

    // Select Elements
    const imgEl = document.querySelector('.main-product-image');
    const titleEl = document.querySelector('.product-title');
    const priceEl = document.getElementById('current-price');
    const tagLineEl = document.querySelector('.tag-line');
    const descEl = document.getElementById('desc-content');

    // Update Elements
    if (imgEl && productImage) {
        imgEl.src = productImage;
        imgEl.alt = productName;
    }

    if (titleEl) titleEl.textContent = productName;

    if (priceEl) priceEl.textContent = `RM${parseFloat(productPrice).toFixed(2)}`;

    // Update Tag Line
    if (tagLineEl) {
        if (productDescriptions[productId]) {
            tagLineEl.textContent = productDescriptions[productId].tagLine;
        } else {
            tagLineEl.style.display = 'none'; // Hide if no tagline
        }
    }

    // Update Description
    // Priority: URL Param > Dictionary > Default
    if (descEl) {
        let descText = getURLParameter('desc');
        if (!descText && productDescriptions[productId]) {
            descText = productDescriptions[productId].description;
        }
        descEl.textContent = descText || 'Delicious refreshment from The Minums.';
    }

    // Update details list
    const detailsList = document.querySelector('.product-description ul');
    if (detailsList && productDescriptions[productId]) {
        detailsList.innerHTML = '';
        productDescriptions[productId].details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });
    }

    // Store product data for add to cart functionality
    window.currentProduct = {
        id: productId,
        name: productName,
        basePrice: parseFloat(productPrice),
        image: productImage
    };

    // Fetch Full Product Data from Firestore for Add-ons
    db.collection("products").doc(productId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            window.currentProduct.addons = data.addons || [];
            window.currentProduct.addonsLimit = data.addonsLimit || 0;
            window.currentProduct.allowAddons = data.allowAddons || false;
            window.currentProduct.allowSizes = data.allowSizes !== false; // Default true

            // Hide sizes if not allowed
            const sizeGroup = document.querySelector('.customization-option');
            if (sizeGroup && !window.currentProduct.allowSizes) {
                sizeGroup.style.display = 'none';
            } else if (sizeGroup) {
                sizeGroup.style.display = 'block';
            }

            if (window.currentProduct.allowAddons && window.currentProduct.addons.length > 0) {
                renderAddons(window.currentProduct.addons, window.currentProduct.addonsLimit);
            }
        }
    });
}

function renderAddons(addons, limit) {
    const container = document.getElementById('dynamic-addons-container');
    if (!container) return;

    let limitText = limit > 0 ? `(Select up to ${limit})` : '(Optional)';
    container.innerHTML = `
        <label style="display: block; font-weight: 600; margin-bottom: 10px;">2. Add-ons / Flavors ${limitText}</label>
        <div class="addons-grid" style="display: grid; grid-template-columns: 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
            ${addons.map((a, index) => `
                <label class="addon-checkbox-label" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 5px 0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" name="addon" value="${a.name}" data-price="${a.price}" onchange="validateAddonLimit(this, ${limit})">
                        <span>${a.name}</span>
                    </div>
                    <span style="color: #666; font-size: 0.9rem;">+RM${parseFloat(a.price).toFixed(2)}</span>
                </label>
            `).join('')}
        </div>
    `;
}

function validateAddonLimit(checkbox, limit) {
    if (limit <= 0) {
        updatePrice();
        return;
    }

    const checkedCount = document.querySelectorAll('input[name="addon"]:checked').length;
    if (checkedCount > limit) {
        checkbox.checked = false;
        alert(`You can only select up to ${limit} options.`);
    }
    updatePrice();
}

// Handle size selection and update price
function handleSizeSelection() {
    const sizeRadios = document.querySelectorAll('input[name="size"]');

    function updateVisuals() {
        document.querySelectorAll('.radio-label').forEach(label => {
            label.classList.remove('active');
        });
        const checked = document.querySelector('input[name="size"]:checked');
        if (checked) {
            checked.closest('.radio-label').classList.add('active');
        }
    }

    // Initialize visuals on load
    updateVisuals();

    sizeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            updatePrice();
            updateVisuals();
        });
    });
}

// Update price based on selected size and add-ons
function updatePrice() {
    if (!window.currentProduct) return;

    let sizePrice = 0;
    if (window.currentProduct.allowSizes) {
        const selectedSize = document.querySelector('input[name="size"]:checked');
        sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;
    }

    // Calculate add-ons price
    let addonsPrice = 0;
    const checkedAddons = document.querySelectorAll('input[name="addon"]:checked');
    checkedAddons.forEach(addon => {
        addonsPrice += parseFloat(addon.dataset.price) || 0;
    });

    const totalPrice = window.currentProduct.basePrice + sizePrice + addonsPrice;

    const priceElement = document.getElementById('current-price');
    if (priceElement) {
        priceElement.textContent = `RM${totalPrice.toFixed(2)}`;
    }
}

// Handle add to cart from detail page
function handleDetailPageAddToCart() {
    const form = document.querySelector('.product-customization-form');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!window.currentProduct) {
                alert('Product information not available');
                return;
            }

            // Get selected options
            let sizeValue = 'standard';
            let sizePrice = 0;

            if (window.currentProduct.allowSizes) {
                const selectedSize = document.querySelector('input[name="size"]:checked');
                sizeValue = selectedSize ? selectedSize.value : 'small';
                sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;
            }

            // Get selected add-ons
            const selectedAddons = [];
            let totalAddonsPrice = 0;
            document.querySelectorAll('input[name="addon"]:checked').forEach(cb => {
                const name = cb.value;
                const price = parseFloat(cb.dataset.price) || 0;
                selectedAddons.push({ name, price });
                totalAddonsPrice += price;
            });

            // Get enquiry
            const enquiry = document.getElementById('p-enquiry')?.value || '';

            const quantity = parseInt(document.getElementById('quantity').value) || 1;

            // Calculate final price per unit
            const finalPrice = window.currentProduct.basePrice + sizePrice + totalAddonsPrice;

            // Create product data for cart
            // We append a hash of options to the ID so that different customizations are different items in cart
            const optionsHash = btoa(JSON.stringify({ size: sizeValue, addons: selectedAddons, enquiry: enquiry })).slice(0, 8);

            const productData = {
                id: `${window.currentProduct.id}-${optionsHash}`,
                name: window.currentProduct.name,
                price: finalPrice,
                image: window.currentProduct.image,
                quantity: quantity,
                options: {
                    size: sizeValue,
                    selectedAddons: selectedAddons,
                    enquiry: enquiry
                }
            };

            // Add to cart (using the function from cart.js)
            if (typeof addToCart === 'function') {
                addToCart(productData);
            } else {
                console.error('addToCart function not found');
            }
        });
    }
}

// Initialize detail page
document.addEventListener('DOMContentLoaded', function () {
    loadProductDetails();
    handleSizeSelection();
    handleDetailPageAddToCart();
});

