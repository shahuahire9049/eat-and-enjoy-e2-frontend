// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
  if (savedCart.length > 0) updateCartPanel(savedCart);

  // Toggle cart panel
  const toggleBtn = document.getElementById("cartToggle");
  const cartPanel = document.getElementById("cartPanel");

  if (toggleBtn && cartPanel) {
    toggleBtn.addEventListener("click", () => {
      cartPanel.classList.toggle("hidden");
    });
  }

  // Hide cart on outside click
  document.addEventListener("click", function (e) {
  const cartPanel = document.getElementById("cartPanel");
  const toggle = document.getElementById("cartToggle");

  const isInsideCart = cartPanel.contains(e.target);
  const isToggle = toggle.contains(e.target);
  const isCartAction = e.target.hasAttribute("data-action");

  if (!isInsideCart && !isToggle && !isCartAction) {
    cartPanel.classList.add("hidden");
  }
});
});

// Add to cart
function addToCart(name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartPanel(cart);
  showToast("Item added to cart ✅");

  const cartPanel = document.getElementById("cartPanel");
  if (cartPanel) cartPanel.classList.remove("hidden");
}

// Update cart UI
function updateCartPanel(cart) {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItemsContainer || !cartTotal) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const price = parseFloat(item.price);
    total += price * item.quantity;

    const div = document.createElement("div");
    div.className = "flex justify-between items-center mb-2";
    div.innerHTML = `
      <div class="flex items-center space-x-2">
        <img src="${item.image}" class="w-10 h-10 rounded-full border">
        <div>
          <p class="font-medium">${item.name}</p>
          <p class="text-sm text-gray-500">₹${price} x ${item.quantity}</p>
          <div class="flex items-center space-x-2 mt-1">
            <button class="px-2 bg-gray-200 rounded text-sm font-bold" data-action="decrease" data-name="${item.name}">−</button>
            <span class="text-sm">${item.quantity}</span>
            <button class="px-2 bg-gray-200 rounded text-sm font-bold" data-action="increase" data-name="${item.name}">+</button>
            <button class="ml-3 text-red-500 text-xs font-semibold" data-action="remove" data-name="${item.name}">Remove</button>
          </div>
        </div>
      </div>
      <p class="font-semibold">₹${(price * item.quantity).toFixed(0)}</p>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotal.textContent = `₹${total.toFixed(0)}`;

  attachCartActions();
}

document.getElementById("checkoutBtn")?.addEventListener("click", function () {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  if (total === 0) {
    alert("Please add some items to the cart first.");
  } else {
    window.location.href = "payment.html";
  }
});


// Handle quantity change and removal
function attachCartActions() {
  document.querySelectorAll("#cartItems [data-action]").forEach(btn => {
    const action = btn.dataset.action;
    const name = btn.dataset.name;

    btn.addEventListener("click", () => {
      if (action === "increase") changeQty(name, 1);
      if (action === "decrease") changeQty(name, -1);
      if (action === "remove") removeItem(name);
    });
  });
}

function changeQty(name, delta) {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      const index = cart.indexOf(item);
      cart.splice(index, 1);
    }
  }
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartPanel(cart);
}

function removeItem(name) {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const updated = cart.filter(i => i.name !== name);
  localStorage.setItem("cartItems", JSON.stringify(updated));
  updateCartPanel(updated);
}

// function clearCart() {
//   localStorage.removeItem("cartItems");
//   updateCartPanel([]);
// }

// Show toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}
