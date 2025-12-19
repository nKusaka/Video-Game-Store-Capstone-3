function showLoginForm() {
    templateBuilder.build("login-form", {}, "login");
}

function hideModalForm() {
    templateBuilder.clear("login");
}

document.addEventListener("DOMContentLoaded", () => {
    templateBuilder = new TemplateBuilder();
    loadHome();
});

function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;

    if (confirm === password) {
        console.log('this worked')
        userService.register(username, password, confirm);
        hideModalForm();
    }
     if (confirm !== password) {
        alert('password does not match!');
        return;
    }

}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    userService.login(username, password);
    hideModalForm();
}

function showImageDetailForm(product, imageUrl) {
    const imageDetail = {
        name: product,
        imageUrl: imageUrl,
    };

    templateBuilder.build("image-detail", imageDetail, "login");
}

function loadHome() {
    templateBuilder.build("home", {}, "main");

    productService.search();
    categoryService.getAllCategories(loadCategories);
}

function editProfile() {
    profileService.loadProfile();
}

function saveProfile() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;

    const profile = {
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        zip,
    };

    profileService.updateProfile(profile);
}

function showCart() {
    cartService.loadCartPage();
}

function clearCart() {
    cartService.clearCart();
    cartService.loadCartPage();
}

function setCategory(control) {
    productService.addCategoryFilter(control.value);
    productService.search();
}

function setSubcategory(control) {
    productService.addSubcategoryFilter(control.value);
    productService.search();
}

function setMinPrice(slider) {
  if (!productService) return;

  const minSlider = document.getElementById("min-price");
  const maxSlider = document.getElementById("max-price");

  let min = Number(slider.value);
  let max = Number(maxSlider.value);

  // keep min <= max
  if (min > max) {
    min = max;
    minSlider.value = String(min);
  }

  document.getElementById("min-price-display").textContent = String(min);

  // treat 0 as "no filter"
  productService.addMinPriceFilter(min === 0 ? "" : String(min));
  productService.search();
}

function setMaxPrice(slider) {
  if (!productService) return;

  const minSlider = document.getElementById("min-price");
  const maxSlider = document.getElementById("max-price");

  let max = Number(slider.value);
  let min = Number(minSlider.value);

  // keep max >= min
  if (max < min) {
    max = min;
    maxSlider.value = String(max);
  }

  document.getElementById("max-price-display").textContent = String(max);

  // treat 200 as "no filter"
  productService.addMaxPriceFilter(max === 200 ? "" : String(max));
  productService.search();
}


function closeError(control) {
    setTimeout(() => {
        control.click();
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    loadHome();
});

function showRegisterForm() {
    templateBuilder.build("register-form", {}, "login");
}


