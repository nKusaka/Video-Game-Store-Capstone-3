let productService;

class ProductService {
  photos = [];

  filter = {
    cat: undefined,
    minPrice: 0,
    maxPrice: 200,
    subCategory: undefined,
    queryString: () => {
      let qs = "";
      if (this.filter.cat) {
        qs = `cat=${this.filter.cat}`;
      }
      // Always include minPrice and maxPrice (they default to 0 and 200)
      const minP = `minPrice=${this.filter.minPrice}`;
      if (qs.length > 0) {
        qs += `&${minP}`;
      } else {
        qs = minP;
      }
      
      const maxP = `maxPrice=${this.filter.maxPrice}`;
      if (qs.length > 0) {
        qs += `&${maxP}`;
      } else {
        qs = maxP;
      }
      
      if (this.filter.subCategory) {
        const sub = `subCategory=${this.filter.subCategory}`;
        if (qs.length > 0) {
          qs += `&${sub}`;
        } else {
          qs = sub;
        }
      }

      return qs.length > 0 ? `?${qs}` : "";
    },
  };

  constructor() {
    //load list of photos into memory
    axios.get("/images/products/photos.json").then((response) => {
      this.photos = response.data;
    });
  }

  hasPhoto(photo) {
    return this.photos.filter((p) => p == photo).length > 0;
  }

  addCategoryFilter(cat) {
    if (cat == 0) this.clearCategoryFilter();
    else this.filter.cat = cat;
  }

  addMinPriceFilter(price) {
    console.log('Setting minPrice:', price, 'Type:', typeof price);
    const numPrice = parseInt(price);
    
    if (isNaN(numPrice) || price === "" || price === null || price === undefined) {
      this.clearMinPriceFilter();
    } else {
      
      this.filter.minPrice = numPrice;
    }
    console.log('MinPrice after set:', this.filter.minPrice);
  }
  
  addMaxPriceFilter(price) {
    console.log('Setting maxPrice:', price, 'Type:', typeof price);
    const numPrice = parseInt(price);
    
    // Only clear if NaN, empty, or explicitly null/undefined
    if (isNaN(numPrice) || price === "" || price === null || price === undefined) {
      this.clearMaxPriceFilter();
    } else {
      // Store as number
      this.filter.maxPrice = numPrice;
    }
    console.log('MaxPrice after set:', this.filter.maxPrice);
  }
  addSubcategoryFilter(subCategory) {
    if (subCategory == "") this.clearSubcategoryFilter();
    else this.filter.subCategory = subCategory;
  }

  clearCategoryFilter() {
    this.filter.cat = undefined;
  }
  clearMinPriceFilter() {
    this.filter.minPrice = undefined;
  }
  clearMaxPriceFilter() {
    this.filter.maxPrice = undefined;
  }
  clearSubcategoryFilter() {
    this.filter.subCategory = undefined;
  }

  search() {
    const queryString = this.filter.queryString();
    const url = `${config.baseUrl}/products${queryString}`;
    
    console.log('=== SEARCH CALLED ===');
    console.log('Filter state:', {
      minPrice: this.filter.minPrice,
      maxPrice: this.filter.maxPrice,
      subCategory: this.filter.subCategory,
      cat: this.filter.cat
    });
    console.log('Query String:', queryString);
    console.log('Search URL:', url);

    axios
      .get(url)
      .then((response) => {
        let data = {};
        data.products = response.data;
        
        console.log('✅ Products received:', data.products.length);
        
        if (data.products.length === 0) {
          console.warn('⚠️ No products match the current filters!');
        }

        data.products.forEach((product) => {
          if (!this.hasPhoto(product.imageUrl)) {
            product.imageUrl = "no-image.jpg";
          }
        });

        templateBuilder.build("product", data, "content", this.enableButtons);
      })
      .catch((error) => {
        console.error('❌ Search error:', error);
        console.error('Error details:', error.response || error.message);
        const data = {
          error: "Searching products failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }

  enableButtons() {
  // target ONLY the actual buttons inside the add-button containers
  const addToCartButtons = [...document.querySelectorAll(".add-button button")];

  if (userService.isLoggedIn()) {
    addToCartButtons.forEach((btn) => btn.classList.remove("invisible"));
  } else {
    addToCartButtons.forEach((btn) => btn.classList.add("invisible"));
  }
}
}

document.addEventListener("DOMContentLoaded", () => {
  productService = new ProductService();

  // Trigger initial search to load products
  productService.search();
});

function setMinPrice(slider) {
  if (!productService) return;
  const value = slider.value;
  document.getElementById("min-price-display").textContent = value;
  productService.addMinPriceFilter(value);
  productService.search();
}

function setMaxPrice(slider) {
  if (!productService) return;
  const value = slider.value;
  document.getElementById("max-price-display").textContent = value;
  productService.addMaxPriceFilter(value);
  productService.search();
}

function setSubcategory(select) {
  if (!productService) return;
  const value = select.value;
  productService.addSubcategoryFilter(value);
  productService.search();
}
