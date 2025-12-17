// ========== DETAIL PAGE DYNAMIC RENDERING ==========

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Product descriptions database
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

    // Update product image
    const productImageElement = document.querySelector('.main-product-image');
    if (productImageElement && productImage) {
        productImageElement.src = productImage;
        productImageElement.alt = productName;
    }

    // Update product title
    const productTitleElement = document.querySelector('.product-title');
    if (productTitleElement) {
        productTitleElement.textContent = productName;
    }

    // Update product price
    const priceElement = document.getElementById('current-price');
    if (priceElement) {
        priceElement.textContent = `RM${parseFloat(productPrice).toFixed(2)}`;
    }

    // Update tag line
    const tagLineElement = document.querySelector('.tag-line');
    if (tagLineElement && productDescriptions[productId]) {
        tagLineElement.textContent = productDescriptions[productId].tagLine;
    }

    // Update description
    const descriptionElement = document.querySelector('.product-description p');
    if (descriptionElement && productDescriptions[productId]) {
        descriptionElement.textContent = productDescriptions[productId].description;
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
}

// Handle size selection and update price
function handleSizeSelection() {
    const sizeRadios = document.querySelectorAll('input[name="size"]');

    sizeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            updatePrice();
        });
    });
}

// Update price based on selected size
function updatePrice() {
    if (!window.currentProduct) return;

    const selectedSize = document.querySelector('input[name="size"]:checked');
    const sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;

    const totalPrice = window.currentProduct.basePrice + sizePrice;

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
            const selectedSize = document.querySelector('input[name="size"]:checked');
            const sizeValue = selectedSize ? selectedSize.value : 'small';
            const sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;

            const milkSweetener = document.querySelector('select[name="milk_sweetener"]');
            const milkValue = milkSweetener ? milkSweetener.value : 'none';

            const quantity = parseInt(document.getElementById('quantity').value) || 1;

            // Calculate final price
            const finalPrice = window.currentProduct.basePrice + sizePrice;

            // Create product data for cart
            const productData = {
                id: `${window.currentProduct.id}-${sizeValue}-${milkValue}`,
                name: window.currentProduct.name,
                price: finalPrice,
                image: window.currentProduct.image,
                options: {
                    size: sizeValue,
                    milkSweetener: milkValue
                }
            };

            // Add to cart (using the function from cart.js)
            if (typeof addToCart === 'function') {
                for (let i = 0; i < quantity; i++) {
                    addToCart(productData);
                }
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

