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
  let checkUser = false

  if (password === confirm) {
    alert('user was created')
    userService.register(username, password, confirm);
    checkUser = true;
  }

  if (checkUser) {
    hideModalForm();
  }

  if (!checkUser) {
    alert('password do not match')
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
  
  productService.addMinPriceFilter("0");
  productService.addMaxPriceFilter("200");
  
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

function onPriceSliderChange() {
  const minSlider = document.getElementById('min-price');
  const maxSlider = document.getElementById('max-price');

  const minDisplay = document.getElementById('min-price-display');
  const maxDisplay = document.getElementById('max-price-display');
  const sliderTrack = document.querySelector('.slider-track');

  let min = parseInt(minSlider.value);
  let max = parseInt(maxSlider.value);

  

  console.log('Slider change - Min:', min, 'Max:', max);

  
  if (min > max) {
    minSlider.value = max;
    min = max;
  }

  
  minDisplay.textContent = `$${min}`;
  maxDisplay.textContent = `$${max}`;


  
  if (sliderTrack) {
    const minPercent = (min / 200) * 100;
    const maxPercent = (max / 200) * 100;
    sliderTrack.style.left = minPercent + "%";
    sliderTrack.style.right = (100 - maxPercent) + "%";
  }

  // Apply filter - handle edge cases for 0 and 200
  const minValue = (min === 0) ? 0 : min;
  const maxValue = (max === 200) ? 200 : max;

  console.log('Applying filters - Min:', minValue, 'Max:', maxValue);
  
  productService.addMinPriceFilter(minValue.toString());
  productService.addMaxPriceFilter(maxValue.toString());
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
