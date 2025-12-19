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

        // Checkout button
        const checkoutBtn = document.createElement("button");
        checkoutBtn.classList.add("btn");
        checkoutBtn.classList.add("btn-success");
        checkoutBtn.innerText = "Checkout";

        checkoutBtn.addEventListener("click", () => this.checkout());

        cartHeader.appendChild(checkoutBtn);

        contentDiv.appendChild(cartHeader)
        main.appendChild(contentDiv);

        // let parent = document.getElementById("cart-item-list");
        this.cart.items.forEach(item => {
            this.buildItem(item, contentDiv)
        });
    }

    checkout() {
        // If cart is empty, don't allow checkout
        if (!this.cart.items || this.cart.items.length === 0) {
            templateBuilder.append("error", { error: "Your cart is empty." }, "errors");
            return;
        }

        // If you have an orders endpoint, call it here.
        // Common patterns:
        // POST /orders  OR  POST /checkout  OR  POST /cart/checkout
        const url = `${config.baseUrl}/checkout`; // change if your backend uses a different route
        const headers = userService.getHeaders();

        axios.post(url, {}, { headers })
            .then(response => {
                // Success message (optional)
                templateBuilder.append("message", { message: "Order placed successfully!" }, "main");

                // Clear cart UI (or reload cart from backend)
                this.loadCart();
                this.loadCartPage();
            })
            .catch(error => {
                templateBuilder.append("error", { error: "Checkout failed." }, "errors");
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
}





document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if (userService.isLoggedIn()) {
        cartService.loadCart();
    }

});