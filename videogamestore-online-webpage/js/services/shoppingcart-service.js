let cartService;

class ShoppingCartService {

    cart = {
        items: [],
        total: 0
    };

    addToCart(productId) {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        const headers = userService.getHeaders();

        axios.post(url, {}, { headers })
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Add to cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    setCart(data) {
        this.cart = {
            items: [],
            total: 0
        }

        this.cart.total = data.total;

        for (const [key, value] of Object.entries(data.items)) {
            this.cart.items.push(value);
        }
    }

    loadCart() {

        const url = `${config.baseUrl}/cart`;

        axios.get(url)
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Load cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })

    }

    loadCartPage() {
        // templateBuilder.build("cart", this.cart, "main");

        const main = document.getElementById("main")
        main.innerHTML = "";

        let div = document.createElement("div");
        div.classList = "filter-box";
        main.appendChild(div);

        const contentDiv = document.createElement("div")
        contentDiv.id = "content";
        contentDiv.classList.add("content-form");

        const cartHeader = document.createElement("div")
        cartHeader.classList.add("cart-header")

        const h1 = document.createElement("h1")
        h1.innerText = "Cart";
        cartHeader.appendChild(h1);

        // Cart total
        const totalH3 = document.createElement("h3");
        totalH3.id = "cart-total";
        totalH3.innerText = `Total: $${this.cart.total.toFixed(2)}`;
        cartHeader.appendChild(totalH3);

        const button = document.createElement("button");
        button.classList.add("btn")
        button.classList.add("btn-danger")
        button.innerText = "Clear";
        button.addEventListener("click", () => this.clearCart());
        cartHeader.appendChild(button)

        const checkoutBtn = document.createElement("button");
        checkoutBtn.classList.add("btn", "btn-success");
        checkoutBtn.innerText = "Checkout";
        checkoutBtn.disabled = this.cart.items.length === 0;
        checkoutBtn.addEventListener("click", () => this.checkout());
        cartHeader.appendChild(checkoutBtn);

        contentDiv.appendChild(cartHeader);
        main.appendChild(contentDiv);

        // let parent = document.getElementById("cart-item-list");
        this.cart.items.forEach(item => {
            this.buildItem(item, contentDiv)
        });
    }

    buildItem(item, parent) {
        let outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        // Product name
        let div = document.createElement("div");
        outerDiv.appendChild(div);
        let h4 = document.createElement("h4");
        h4.innerText = item.product.name;
        div.appendChild(h4);

        // Product image & price
        let photoDiv = document.createElement("div");
        photoDiv.classList.add("photo");
        let img = document.createElement("img");
        img.src = `/images/products/${item.product.imageUrl}`;
        img.addEventListener("click", () => {
            showImageDetailForm(item.product.name, img.src);
        });
        photoDiv.appendChild(img);

        let priceH4 = document.createElement("h4");
        priceH4.classList.add("price");
        priceH4.innerText = `$${item.product.price}`;
        photoDiv.appendChild(priceH4);
        outerDiv.appendChild(photoDiv);

        // Product description
        let descriptionDiv = document.createElement("div");
        descriptionDiv.innerText = item.product.description;
        outerDiv.appendChild(descriptionDiv);

        // ===== Quantity control with plus/minus buttons =====
        let quantityDiv = document.createElement("div");

        // Minus button
        let minusButton = document.createElement("button");
        minusButton.innerText = "-";
        minusButton.classList.add("quantity-btn");

        // Quantity display
        let quantitySpan = document.createElement("span");
        quantitySpan.innerText = item.quantity;
        quantitySpan.style.margin = "0 10px";
        quantitySpan.classList.add("quantity-display");

        // Plus button
        let plusButton = document.createElement("button");
        plusButton.innerText = "+";
        plusButton.classList.add("quantity-btn");

        // Button click events using the class method
        minusButton.addEventListener("click", () => {
            let newQuantity = item.quantity - 1;
            if (newQuantity < 0) newQuantity = 0;
            item.quantity = newQuantity;
            quantitySpan.innerText = newQuantity;
            cartService.updateItemQuantity(item.product.productId, newQuantity);
        });

        plusButton.addEventListener("click", () => {
            let newQuantity = item.quantity + 1;
            item.quantity = newQuantity;
            quantitySpan.innerText = newQuantity;
            cartService.updateItemQuantity(item.product.productId, newQuantity);
        });

        // Append buttons and span
        quantityDiv.appendChild(minusButton);
        quantityDiv.appendChild(quantitySpan);
        quantityDiv.appendChild(plusButton);

        outerDiv.appendChild(quantityDiv);
        parent.appendChild(outerDiv);
    }

    clearCart() {

        const url = `${config.baseUrl}/cart`;

        axios.delete(url)
            .then(response => {
                this.cart = {
                    items: [],
                    total: 0
                }

                this.cart.total = response.data.total;

                for (const [key, value] of Object.entries(response.data.items)) {
                    this.cart.items.push(value);
                }

                this.updateCartDisplay()
                this.loadCartPage()

            })
            .catch(error => {

                const data = {
                    error: "Empty cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    updateCartDisplay() {
        try {
            const itemCount = this.cart.items.length;
            const cartControl = document.getElementById("cart-items")

            cartControl.innerText = itemCount;
        }
        catch (e) {

        }
    }

    updateItemQuantity(productId, newQuantity) {
        const url = `${config.baseUrl}/cart/products/${productId}`;

        const headers = userService.getHeaders();

        const body = {
            quantity: newQuantity
        };

        axios.put(url, body, { headers })
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()
                this.loadCartPage()

            })
            .catch(error => {

                const data = {
                    error: "Update cart quantity failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    async checkout() {
    if (this.cart.items.length === 0) {
        templateBuilder.append("error", { error: "Your cart is empty." }, "errors");
        return;
    }

    // ---- profile pre-check ----
    try {
        const profileUrl = `${config.baseUrl}/profile`;
        const headers = userService.getHeaders();

        const profileRes = await axios.get(profileUrl, { headers });
        const p = profileRes.data;

        const missing =
            !p ||
            !p.address?.trim() ||
            !p.city?.trim() ||
            !p.state?.trim() ||
            !p.zip?.trim();

        if (missing) {
            templateBuilder.append(
                "error",
                { error: "Please complete your profile (address, city, state, zip) before checking out." },
                "errors"
            );

            if (confirm("You need to complete your profile before checkout. Go there now?")) {
                profileService.loadProfile();
            }
            return; // stop checkout
        }

    } catch (error) {
        // couldn't load profile (not logged in, 401/403, etc.)
        templateBuilder.append("error", { error: "Unable to verify profile. Please log in and try again." }, "errors");
        return;
    }

    // ---- confirm + checkout ----
    const ok = confirm(`Confirm your order?\n\nTotal: $${this.cart.total.toFixed(2)}`);
    if (!ok) return;

    const url = `${config.baseUrl}/checkout`;
    const headers = userService.getHeaders();

    axios.post(url, {}, { headers })
        .then(response => {
            const order = response.data;

            // clear locally immediately (optional but nice)
            this.cart = { items: [], total: 0 };
            this.updateCartDisplay();

            this.loadOrderConfirmationPage(order);
            this.loadCart(); // refresh from server
        })
        .catch(error => {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Checkout failed.";

            templateBuilder.append("error", { error: msg }, "errors");

            if (String(msg).toLowerCase().includes("complete your profile")) {
                if (confirm("You need to complete your profile before checkout. Go there now?")) {
                    profileService.loadProfile();
                }
            }
        });
}

    loadOrderConfirmationPage(order) {
        const main = document.getElementById("main");
        main.innerHTML = "";

        const wrap = document.createElement("div");
        wrap.classList.add("order-confirmation");

        // Success header with icon
        const header = document.createElement("div");
        header.classList.add("confirmation-header");
        
        const successIcon = document.createElement("div");
        successIcon.classList.add("success-icon");
        successIcon.innerHTML = "✓";
        header.appendChild(successIcon);

        const h1 = document.createElement("h1");
        h1.innerText = "Order Confirmed!";
        header.appendChild(h1);
        
        const thankYou = document.createElement("p");
        thankYou.classList.add("thank-you-msg");
        thankYou.innerText = "Thank you for your purchase!";
        header.appendChild(thankYou);
        
        wrap.appendChild(header);

        // Order details section
        const detailsSection = document.createElement("div");
        detailsSection.classList.add("order-details");
        
        const orderIdP = document.createElement("p");
        orderIdP.innerHTML = `<strong>Order #:</strong> ${order.orderId}`;
        detailsSection.appendChild(orderIdP);

        const dateP = document.createElement("p");
        dateP.innerHTML = `<strong>Date:</strong> ${order.date}`;
        detailsSection.appendChild(dateP);

        const shipTo = document.createElement("p");
        shipTo.innerHTML =
            `<strong>Shipping to:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zip}`;
        detailsSection.appendChild(shipTo);
        
        wrap.appendChild(detailsSection);

        // Items ordered section
        if (order.orderLineItems && order.orderLineItems.length > 0) {
            const itemsSection = document.createElement("div");
            itemsSection.classList.add("order-items-section");
            
            const itemsTitle = document.createElement("h3");
            itemsTitle.innerText = "Items Ordered:";
            itemsSection.appendChild(itemsTitle);
            
            const itemsList = document.createElement("div");
            itemsList.classList.add("order-items-list");
            
            order.orderLineItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("order-item");
                
                const itemName = document.createElement("span");
                itemName.classList.add("item-name");
                itemName.innerText = item.product?.name || "Product";
                itemDiv.appendChild(itemName);
                
                const itemQty = document.createElement("span");
                itemQty.classList.add("item-quantity");
                itemQty.innerText = `Qty: ${item.quantity}`;
                itemDiv.appendChild(itemQty);
                
                const itemPrice = document.createElement("span");
                itemPrice.classList.add("item-price");
                const lineTotal = (item.product?.price || 0) * item.quantity;
                itemPrice.innerText = `$${lineTotal.toFixed(2)}`;
                itemDiv.appendChild(itemPrice);
                
                itemsList.appendChild(itemDiv);
            });
            
            itemsSection.appendChild(itemsList);
            wrap.appendChild(itemsSection);
        }

        // Order total
        const totalSection = document.createElement("div");
        totalSection.classList.add("order-total-section");
        
        const totalP = document.createElement("h2");
        totalP.innerHTML = `Order Total: <span class="total-amount">$${Number(order.shippingAmount ?? 0).toFixed(2)}</span>`;
        totalSection.appendChild(totalP);
        
        wrap.appendChild(totalSection);

        // Action button
        const backBtn = document.createElement("button");
        backBtn.classList.add("btn", "btn-success", "continue-btn");
        backBtn.innerText = "Continue Shopping";
        backBtn.addEventListener("click", () => loadHome());
        wrap.appendChild(backBtn);

        main.appendChild(wrap);
    }
}

function showCart() {
    cartService.loadCart();
    cartService.loadCartPage();
}



document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if (userService.isLoggedIn()) {
        cartService.loadCart();
    }

});