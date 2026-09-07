/* =========================================================
   PIUS MEDICAL ACCESSORIES
   PRODUCTS PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");

    const cartBtn = document.getElementById("cartBtn");
    const cartCount = document.getElementById("cartCount");

    const productSearch = document.getElementById("productSearch");
    const productCategory = document.getElementById("productCategory");

    const productsGrid = document.getElementById("productsGrid");
    const noProducts = document.getElementById("noProducts");
    const productsMessage = document.getElementById("productsMessage");

    const productCards = Array.from(
        document.querySelectorAll(".product-card")
    );


    /* =====================================================
       CART
    ===================================================== */

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("piusCart")) || [];
    } catch (error) {
        cart = [];
    }


    function updateCartCount() {

        if (!cartCount) return;

        const totalItems = cart.reduce((total, item) => {
            return total + Number(item.quantity || 1);
        }, 0);

        cartCount.textContent = totalItems;
    }


    function saveCart() {

        localStorage.setItem(
            "piusCart",
            JSON.stringify(cart)
        );

        updateCartCount();
    }


    function addToCart(card) {

        const productId = card.dataset.productId;
        const productName = card.dataset.name || "";
        const productPrice = Number(card.dataset.price || 0);

        const imageElement = card.querySelector(".product-image");

        const productImage = imageElement
            ? imageElement.getAttribute("src")
            : "";

        const existingProduct = cart.find(
            item => item.id === productId
        );

        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity || 1) + 1;

        } else {

            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }

        saveCart();

        showMessage(
            `${productName} added to your cart.`
        );
    }


    /* =====================================================
       CART BUTTON
    ===================================================== */

    if (cartBtn) {

        cartBtn.addEventListener("click", () => {

            window.location.href = "cart.html";

        });
    }


    /* =====================================================
       ADD TO CART BUTTONS
    ===================================================== */

    document.querySelectorAll(".add-to-cart-btn").forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            const card = button.closest(".product-card");

            if (!card) return;

            addToCart(card);

        });

    });


    /* =====================================================
       FAVORITES
    ===================================================== */

    let favorites = [];

    try {
        favorites = JSON.parse(
            localStorage.getItem("piusFavorites")
        ) || [];
    } catch (error) {
        favorites = [];
    }


    function saveFavorites() {

        localStorage.setItem(
            "piusFavorites",
            JSON.stringify(favorites)
        );
    }


    function updateFavoriteButton(button, productId) {

        const isFavorite = favorites.includes(productId);

        button.classList.toggle(
            "active",
            isFavorite
        );

        const icon = button.querySelector("i");

        if (!icon) return;

        if (isFavorite) {

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

        } else {

            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }
    }


    function toggleFavorite(button, card) {

        const productId = card.dataset.productId;

        if (!productId) return;

        const favoriteIndex =
            favorites.indexOf(productId);

        if (favoriteIndex === -1) {

            favorites.push(productId);

            showMessage(
                `${card.dataset.name || "Product"} added to favorites.`
            );

        } else {

            favorites.splice(
                favoriteIndex,
                1
            );

            showMessage(
                `${card.dataset.name || "Product"} removed from favorites.`
            );
        }

        saveFavorites();

        updateFavoriteButton(
            button,
            productId
        );
    }


    document.querySelectorAll(".favorite-btn").forEach(button => {

        const card = button.closest(".product-card");

        if (!card) return;

        updateFavoriteButton(
            button,
            card.dataset.productId
        );

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            toggleFavorite(
                button,
                card
            );

        });

    });


    /* =====================================================
       SEARCH + CATEGORY FILTER
    ===================================================== */

    function filterProducts() {

        const searchValue =
            productSearch
                ? productSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const categoryValue =
            productCategory
                ? productCategory.value
                : "all";

        let visibleProducts = 0;

        productCards.forEach(card => {

            const productName =
                (card.dataset.name || "")
                    .toLowerCase();

            const productCategoryValue =
                (card.dataset.category || "")
                    .toLowerCase();

            const productText =
                card.textContent.toLowerCase();

            const matchesSearch =
                !searchValue ||
                productName.includes(searchValue) ||
                productText.includes(searchValue);

            const matchesCategory =
                categoryValue === "all" ||
                productCategoryValue ===
                    categoryValue.toLowerCase();

            if (matchesSearch && matchesCategory) {

                card.style.display = "";

                visibleProducts++;

            } else {

                card.style.display = "none";
            }

        });


        if (noProducts) {

            noProducts.hidden =
                visibleProducts !== 0;
        }
    }


    if (productSearch) {

        productSearch.addEventListener(
            "input",
            filterProducts
        );
    }


    if (productCategory) {

        productCategory.addEventListener(
            "change",
            filterProducts
        );
    }


    /* =====================================================
       SIDE MENU
    ===================================================== */

    function openMenu() {

        if (sideMenu) {
            sideMenu.classList.add("active");
        }

        if (menuOverlay) {
            menuOverlay.classList.add("active");
        }

        document.body.classList.add(
            "menu-open"
        );
    }


    function closeMenu() {

        if (sideMenu) {
            sideMenu.classList.remove("active");
        }

        if (menuOverlay) {
            menuOverlay.classList.remove("active");
        }

        document.body.classList.remove(
            "menu-open"
        );
    }


    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            openMenu
        );
    }


    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            closeMenu
        );
    }


    /* =====================================================
       CLOSE MENU WITH ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    /* =====================================================
       SIDE MENU LINKS
    ===================================================== */

    if (sideMenu) {

        sideMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {
                        closeMenu();
                    }
                );

            });
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem(
                    "loggedIn"
                );

                localStorage.removeItem(
                    "firebaseUser"
                );

                localStorage.removeItem(
                    "noirUser"
                );

                window.location.href =
                    "login.html";
            }
        );
    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    let messageTimer = null;

    function showMessage(message) {

        if (!productsMessage) return;

        productsMessage.textContent =
            message;

        productsMessage.style.display =
            "block";

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {

            productsMessage.style.display =
                "none";

        }, 2200);
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartCount();

    filterProducts();

});
