const cartBtn = document.querySelector(".cart-btn");
const backDrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".product-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonsDom = [];

import { productsData } from "./products.js";

// get products
class Products {
  getProducts() {
    return productsData;
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
      <div class="img-container">
        <img
          class="product-img"
          src="${item.imageUrl}"
          alt="bed"
        />
      </div>
      <div class="product-desc">
        <p class="product-price">${item.price}</p>
        <p class="product-title">${item.title}</p>
      </div>
      <button class="btn add-to-cart" data-id=${item.id}>add to cart</button>
    </div>`;
      productsDom.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    //اگر محصول توی سبد خرید بود دکمه اش رو غیر فعال می کنه اگرنه به سبد خرید اضافه می کنه
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDom = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart or not
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        const addedProduct = Storage.getProduct(id);
        // add to cart
        cart = [...cart, { ...addedProduct, quantity: 1 }];
        // save cart to local storage
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);
      });
    });
  }
  setCartValue(cart) {
    // set cart total price
    let tempCratItems = 0;
    const totlalPrice = cart.reduce((acc, curr) => {
      tempCratItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `total price: ${totlalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCratItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img class="cart-item-img" src=${cartItem.imageUrl} alt="" />
    <div class="cart-item-desc">
      <h4>${cartItem.title}</h4>
      <h5>${cartItem.price}$</h5>
    </div>
    <div class="cart-item-controller">
      <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
      <p>${cartItem.quantity}</p>
      <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
    </div>
      <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
  `;
    cartContent.appendChild(div);
  }
  setupApp() {
    cart = Storage.getCart() || [];
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    this.setCartValue(cart);
  }
  cartLogic() {
    clearCart.addEventListener("click", () => this.clearCart());
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        const addQuantity = event.target;
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {

        const removeItem = event.target;
        const removedItem = cart.find((c) => parseInt(c.id) === parseInt(removeItem.dataset.id));
        this.removeItem(removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      }else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const subedItem = cart.find(
          (cItem) => cItem.id == subQuantity.dataset.id
        );
        if(subedItem.quantity===1){
          this.removeItem(subedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
        }
        subedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = subedItem.quantity;
      }
    });
  }
  clearCart() {
    cart.forEach((c) => this.removeItem(c.id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunc();
  }
  removeItem(id) {
    // update cart
    cart = cart.filter((cItem) => parseInt(cItem.id) !== parseInt(id));
    // total price and cart items
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDom.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    button.disabled = false;
  }
}
// storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

//زمانی که صفحه لود شد چه اتفاقاتی بیفته
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  ui.setupApp();
  ui.cartLogic();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  Storage.saveProducts(productsData);
});

///این قسمت برای باز و بسته کردن سبدخرید است
// cart item modal
cartBtn.addEventListener("click", showModalFunc);
closeModal.addEventListener("click", closeModalFunc);
backDrop.addEventListener("click", closeModalFunc);

function showModalFunc() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "50px";
}
function closeModalFunc() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100px";
}
