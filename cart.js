




let cart = [];
let pendingSandwich = null;

function isSandwichCategory(category) {


    const sandwichCategories = [
        'Pain Standard', 'Pain Crudité', 'Pain Gratiné', 
        'Panini', 'Pain Américain', 'Kébab et Salade'
    ];
    return sandwichCategories.some(cat => category && category.includes(cat));
}

function addToCart(productName, price, category, sauce) {

    const sauceKey = sauce || '';
    const existingItem = cart.find(item => item.name === productName && item.category === (category || '') && item.sauce === sauceKey);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: productName,
            category: category || '',
            sauce: sauce || '',
            price: price,
            quantity: 1
        });
    }

    updateCart();
}


function updateCart() {
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    cartItemsElement.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        



        let label = item.name;
        if (item.category) label = item.category + ' - ' + label;
        if (item.sauce) label = label + ' - ' + item.sauce;
        
        li.innerHTML = `
            <span class="cart-item-name">${label}</span>
            <span class="cart-item-price">€${item.price.toFixed(2)} x ${item.quantity}</span>
            <div class="cart-item-quantity">
                <button onclick="decreaseQuantity(${index})">-</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity(${index})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${index})">Retirer</button>
            </div>
        `;
        cartItemsElement.appendChild(li);
    });
    
    cartTotalElement.textContent = `Total: €${total.toFixed(2)}`;


    updateCounter();


    updateProductCounters();
}



function getToButtonGenerate() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}



function increaseQuantity(index) {
    cart[index].quantity++;
    updateCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        removeFromCart(index);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
    document.getElementById('message').value = '';
}



function updateCounter() {
    const counterEl = document.getElementById('cartCount');
    if (!counterEl) return;
    const totalItems = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    counterEl.textContent = totalItems;
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.classList.add('badge-pop');
        setTimeout(() => badge.classList.remove('badge-pop'), 350);
    }
}



document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const txt = (btn.textContent || '').trim().toLowerCase();
    if (txt.startsWith('ajouter')) {
        btn.classList.add('btn-added');
        setTimeout(() => btn.classList.remove('btn-added'), 300);

        
            let name = btn.getAttribute('data-name');
            let price;
            let category = btn.getAttribute('data-category');
            const card = btn.closest('.product-card');
            if (card) {
                if (!name) {
                    const h = card.querySelector('h4');
                    if (h) name = h.textContent.trim();
                }

                const p = card.querySelector('.price');
                if (p) {
                    const raw = p.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
                    const n = parseFloat(raw);
                    if (!isNaN(n)) price = n;
                }

                if ((price === undefined || isNaN(price))) {
                    const dp = btn.getAttribute('data-price');
                    if (dp !== null) {
                        const n2 = parseFloat(String(dp).replace(',', '.'));
                        price = isNaN(n2) ? 0 : n2;
                    }
                }
                if (!category) {
                    const menuCat = card.closest('.menu-category');
                    if (menuCat) {
                        const ch = menuCat.querySelector('.category-header h3');
                        if (ch) category = ch.textContent.trim();
                    }
                }
            }
            if (name) {
  

                if (isSandwichCategory(category)) {
                    pendingSandwich = { name, price, category };
                    openSauceModal();
                } else {

                    addToCart(name, (typeof price === 'number' && !isNaN(price)) ? price : 0, category || '');
                    showToast(`${name} ajouté au panier`);
                }
            }
    }
});


function updateProductCounters() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const h = card.querySelector('h4');
        if (!h) return;
        const name = h.textContent.trim();
        let category = '';
        const menuCat = card.closest('.menu-category');
        if (menuCat) {
            const ch = menuCat.querySelector('.category-header h3');
            if (ch) category = ch.textContent.trim();
        }


        const totalQty = cart
            .filter(i => i.name === name && i.category === category)
            .reduce((sum, i) => sum + i.quantity, 0);
        
        let badge = card.querySelector('.product-counter');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'product-counter';
            const info = card.querySelector('.product-info');
            if (info) info.insertBefore(badge, info.firstChild);
        }
        badge.textContent = totalQty > 0 ? `x${totalQty}` : '';
        badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
    });
}



function openSauceModal() {
    const modal = document.getElementById('sauceModal');
    const container = document.getElementById('sauceButtons');
    



    const sauceCategory = Array.from(document.querySelectorAll('.menu-category')).find(cat => {
        const h = cat.querySelector('.category-header h3');
        return h && h.textContent.includes('Nos Sauces');
    });
    
    container.innerHTML = '';
    
    if (sauceCategory) {
        const sauceCards = sauceCategory.querySelectorAll('.product-card');
        sauceCards.forEach(card => {
            const h4 = card.querySelector('h4');
            if (h4) {
                const sauceName = h4.textContent.trim();
                const btn = document.createElement('button');
                btn.className = 'sauce-btn';
                btn.textContent = sauceName;
                btn.onclick = () => selectSauce(sauceName);
                container.appendChild(btn);
            }
        });
    }
    
    modal.classList.add('active');
}

function closeSauceModal() {
    const modal = document.getElementById('sauceModal');
    modal.classList.remove('active');
    pendingSandwich = null;
}

function selectSauce(sauceName) {
    if (!pendingSandwich) return;
    



    addToCart(
        pendingSandwich.name, 
        pendingSandwich.price, 
        pendingSandwich.category,
        sauceName
    );
    
    showToast(`${pendingSandwich.name} + ${sauceName} ajoutés au panier`);
    closeSauceModal();
}

function skipSauce() {
    if (!pendingSandwich) return;
    
    addToCart(
        pendingSandwich.name, 
        pendingSandwich.price, 
        pendingSandwich.category,
        ''
    );
    
    showToast(`${pendingSandwich.name} ajouté au panier (sans sauce)`);
    closeSauceModal();
}


function showToast(text) {
    const t = document.createElement('div');
    t.className = 'gs-toast';
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('visible'));
    setTimeout(() => t.classList.remove('visible'), 1500);
    setTimeout(() => t.remove(), 1900);
}

function generateOrderMessage() {
    if (cart.length === 0) {
        alert('Veuillez ajouter des produits au panier!');
        return;
    }
    
    let message = 'Bonjour, je souhaiterais passer la commande suivante:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        



        let label = item.name;
        if (item.category) label = item.category + ' - ' + label;
        if (item.sauce) label = label + ' - ' + item.sauce;
        
        message += `• ${label} x${item.quantity} = €${itemTotal.toFixed(2)}\n`;
        total += itemTotal;
    });
    
    message += `\nTotal: €${total.toFixed(2)}\n\nMerci !`;
    

    


    document.getElementById('message').value = message;
    
    document.getElementById('commande').scrollIntoView({ behavior: 'smooth' });
}

function sendBySMS() {
    const nameInput = document.getElementById('name').value;
    const timeInput = document.getElementById('subject').value;
    const messageInput = document.getElementById('message').value;
    
    if (!nameInput || !timeInput || !messageInput) {
        alert('Veuillez remplir tous les champs du formulaire!');
        return;
    }
    

    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('gosnack_name', nameInput);
    } else {
        localStorage.removeItem('gosnack_name');
    }
    

    


    const fullMessage = `Prénom: ${nameInput}\nHeure: ${timeInput}\n\n${messageInput}`;
    
    // Numéro de téléphone du snack (format international sans le +)
    const phoneNumber = '262692567582'; 
    
    
    // Lien WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
    
    // Lien SMS 
    const smsUrl = `sms:+${phoneNumber}?body=${encodeURIComponent(fullMessage)}`;
    



    const choice = confirm('Choisissez votre méthode:\nOK pour WhatsApp\nAnnuler pour SMS');
    
    if (choice) {
        window.open(whatsappUrl, '_blank');
    } else {
        window.location.href = smsUrl;
    }
}

function toggleCategory(header) {
    const items = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    items.classList.toggle('open');
    icon.classList.toggle('open');
}



document.addEventListener('DOMContentLoaded', function() {
    updateCart();
    updateCounter();
    updateProductCounters();
    
    // Load saved name from localStorage if available
    const savedName = localStorage.getItem('gosnack_name');
    if (savedName) {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.value = savedName;
        }
    }
    
    const modal = document.getElementById('sauceModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeSauceModal();
        }
    });
});
