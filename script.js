document.addEventListener('DOMContentLoaded', () => {
  const scrollUpBtn = document.getElementById('scrollUpBtn');

  if (scrollUpBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollUpBtn.classList.remove('hidden');
      } else {
        scrollUpBtn.classList.add('hidden');
      }
    });

    scrollUpBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
    // Swipe left & right in category option

  function scrollLeft() {
    const container = document.getElementById('scrollContainer');
    container.scrollBy({ left: -200, behavior: 'smooth' });
  }

  function scrollRight() {
    const container = document.getElementById('scrollContainer');
    container.scrollBy({ left: 200, behavior: 'smooth' });
  }

// For user login & register on index.html
let dropdownVisible = false;
let hideTimeout;

window.toggleProfileDropdown = function () {
  const dropdown = document.getElementById('profileDropdown');
  dropdownVisible = !dropdownVisible;
  dropdown.classList.toggle('opacity-100', dropdownVisible);
  dropdown.classList.toggle('pointer-events-auto', dropdownVisible);
  dropdown.classList.toggle('scale-100', dropdownVisible);
  dropdown.classList.toggle('opacity-0', !dropdownVisible);
  dropdown.classList.toggle('pointer-events-none', !dropdownVisible);
  dropdown.classList.toggle('scale-95', !dropdownVisible);
};

window.showProfileDropdown = function () {
  clearTimeout(hideTimeout);
  const dropdown = document.getElementById('profileDropdown');
  dropdown.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
  dropdown.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
};

window.hideProfileDropdownDelayed = function () {
  hideTimeout = setTimeout(() => {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
    dropdown.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
  }, 200);
};

window.cancelHideDropdown = function () {
  clearTimeout(hideTimeout);
};





// ==== PAYMENT PAGE (payment.html) ====

function renderPaymentPageCart() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const orderSummary = document.getElementById("orderSummary");
  const totalAmount = document.getElementById("totalAmount");

  if (!orderSummary || !totalAmount) return;

  let total = 0;
  orderSummary.innerHTML = "";

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} x ${item.quantity} - ₹${subtotal}
    `;
    orderSummary.appendChild(li);
  });

  totalAmount.textContent = `₹${total.toFixed(0)}`;
}

async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  if (cart.length === 0) {
    alert("Please add some item in cart first.");
    return;
  }

  const form = document.getElementById("billingForm");
  const [name, email, phone, address] = Array.from(form.elements).map(el => el.value.trim());

  if (!name || !email || !phone || !address) {
    alert("Please fill in all billing details.");
    return;
  }

  const order = {
    name,
    email,
    phone,
    address,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };

  try {
    const res = await fetch(API_BASE_URL + '/api/orders', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await res.json();

    if (res.ok) {
      // 🟢 Show success modal with dynamic order details
      document.getElementById('modalOrderId').textContent = `#${data.orderId || "N/A"}`;
      document.getElementById('modalCustomerName').textContent = order.name;
      document.getElementById('modalCustomerPhone').textContent = order.phone;
      document.getElementById('modalCustomerAddress').textContent = order.address;

      const itemList = document.getElementById('modalOrderItems');
      itemList.innerHTML = '';
      order.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (x${item.quantity})`;
        itemList.appendChild(li);
      });

      document.getElementById('orderSuccessModal').classList.remove('hidden');

      // Clear cart
      localStorage.removeItem("cartItems");
    } else {
      alert(data.error || "Failed to place order.");
    }
  } catch (err) {
    console.error("Order error:", err);
    alert("An error occurred while placing the order.");
  }
}

window.closeOrderModal = function () {
  document.getElementById('orderSuccessModal').classList.add('hidden');
  window.location.href = "index.html";
}

// Expose to global scope so HTML can call these
window.renderPaymentPageCart = renderPaymentPageCart;
window.placeOrder = placeOrder;


// Index Dynamic Food Items

async function loadCategories() {
  try {
    const res = await fetch(API_BASE_URL + '/api/categories');
    const categories = await res.json();
    const container = document.getElementById('scrollContainer');
    container.innerHTML = '';

    categories.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'flex-shrink-0 text-center w-28';

      div.innerHTML = `
        <a href="category.html?category=${cat.slug}" class="block">
          <img src="${cat.image}" alt="${cat.name}"
               onerror="this.src='https://placehold.co/80x80?text=No+Image'"
               class="w-24 h-24 object-cover rounded-full shadow-md mx-auto transition-transform duration-200 hover:scale-105" />
          <p class="mt-2 text-sm font-medium text-gray-700">${cat.name}</p>
        </a>`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

loadCategories();


  // 
 fetch(API_BASE_URL + '/api/featured-categories')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('featuredCategories');
    container.innerHTML = '';
    if (Array.isArray(data)) data.forEach(item => {
      container.innerHTML += `
        <a href="category.html?category=${item.slug}" class="block hover:shadow-lg transition duration-200">
          <div class="flex flex-col items-center text-center space-y-2 bg-white shadow rounded-lg p-4">
            <img src="${item.imageUrl}" alt="${item.name}"
              class="w-full h-48 object-cover rounded-lg"
              onerror="this.src='https://placehold.co/240x180?text=No+Image'" />
            <h3 class="font-bold text-lg text-gray-800">${item.name}</h3>
            <p class="text-sm text-gray-600">${item.productCount} Restaurants Products</p>
          </div>
        </a>`;
    });
  })
  .catch(err => console.error('Error fetching featured categories:', err));

// 

fetch(API_BASE_URL + '/api/popular-restaurants')
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector('.popular-restaurants');
    container.innerHTML = '';

    if (Array.isArray(data)) data.forEach(item => {
      container.innerHTML += `
        <article class="bg-white w-72 rounded-xl shadow-md hover:shadow-yellow-300 transition overflow-hidden relative group cursor-pointer">
        <a href="category.html?category=${item.slug}" class="block hover:shadow-lg transition duration-200">  
        <img src="${item.image}" alt="${item.name}"
            class="w-full h-44 object-cover"
            onerror="this.src='https://placehold.co/300x200?text=Image+Unavailable'" />
          <div class="p-4 text-left space-y-2">
            <h3 class="text-lg font-bold text-gray-900 truncate">${item.name}</h3>
            <div class="flex items-center text-sm text-gray-500 gap-2">
              <span class="flex items-center gap-1">
                <span>⭐${item.rating}</span>
              </span>
              <span>•</span>
              <span>${item.openingHours}</span>
            </div>
            <p class="text-xs text-gray-400">${item.address}</p>
          </div>
          <div class="absolute top-3 left-3 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-lg">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 10-8 0v7..." />
            </svg>
          </div>
        </article>
        </a>`;
    });
  })
  .catch(err => console.error('Error fetching popular restaurants:', err));

// 

fetch(API_BASE_URL + '/api/hot-deals')
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector('.hot-deals-section');
    container.innerHTML = '';

    if (Array.isArray(data)) data.forEach(item => {
      container.innerHTML += `
        <article class="bg-white w-64 rounded-xl shadow-md hover:shadow-yellow-400 transition overflow-hidden cursor-pointer">
          <img src="${item.image}" alt="${item.name}"
            class="w-full h-44 object-cover"
            onerror="this.src='https://placehold.co/300x200?text=No+Image'" />
          <div class="p-4 flex flex-col justify-between h-40">
            <h4 class="font-semibold text-lg text-left truncate">${item.name}</h4>
            <p class="text-xs text-gray-600 text-left">${item.description}</p>
            <div class="text-sm font-bold text-black mt-auto text-left">
              <span>₹${item.price.toFixed(2)}</span>
              <del class="text-gray-400 font-normal">₹${item.originalPrice.toFixed(2)}</del>
            </div>
          </div>
        </article>`;
    });
  })
  .catch(err => console.error('Error fetching hot deals:', err));

  // Team Members

  fetch(API_BASE_URL + '/api/team-members')
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector('.team-members');
    container.innerHTML = '';

    if (Array.isArray(data)) data.forEach(member => {
      container.innerHTML += `
        <article class="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
          <div class="overflow-hidden">
            <img src="${member.image}" alt="Portrait of ${member.name}"
                 class="w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-500"
                 onerror="this.src='https://placehold.co/300x400?text=Unavailable'" />
          </div>
          <div class="p-5 text-center space-y-1">
            <h3 class="text-lg font-semibold text-gray-900">${member.name}</h3>
            <p class="text-sm text-gray-500">${member.role}</p>
          </div>
        </article>`;
    });
  })
  .catch(err => console.error('Error fetching team members:', err));

  // Blogspot

  fetch(API_BASE_URL + '/api/blog-posts')
  .then(res => res.json())
  .then(posts => {
    const container = document.querySelector('.blog-posts');
    container.innerHTML = '';

    posts.forEach(post => {
      const date = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      container.innerHTML += `
        <article class="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 group overflow-hidden">
          <div class="overflow-hidden">
            <img src="${post.image}" alt="${post.title}"
                 class="w-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                 onerror="this.src='https://placehold.co/400x250?text=Image+Unavailable'" />
          </div>
          <div class="p-5 space-y-3">
            <p class="text-yellow-500 font-bold text-xs uppercase">${post.category}</p>
            <h3 class="font-semibold text-lg text-gray-800 leading-snug group-hover:text-yellow-500 transition-colors">${post.title}</h3>
            <p class="text-sm text-gray-600">${post.description.slice(0, 140)}...</p>
            <footer class="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <img src="${post.author.avatar}" alt="Author avatar" class="w-6 h-6 rounded-full" onerror="this.src='https://placehold.co/40x40?text=A'" />
              <span>${post.author.name}</span>
              <time datetime="${post.date}">${date}</time>
            </footer>
          </div>
        </article>`;
    });
  })
  .catch(err => console.error('Error fetching blog posts:', err));

// Index search bar
const keywordInput = document.getElementById('keyword');
  const suggestionsList = document.getElementById('suggestions');
  const searchForm = document.getElementById('searchForm');

  keywordInput.addEventListener('input', async (e) => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      suggestionsList.innerHTML = '';
      suggestionsList.classList.add('hidden');
      return;
    }

    try {
      const res = await fetch(API_BASE_URL + '/api/categories');
      const categories = await res.json();

      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(value)
      );

      if (filtered.length === 0) {
        suggestionsList.innerHTML = `<li class="px-4 py-2 text-gray-500">No results found</li>`;
        suggestionsList.classList.remove('hidden');
        return;
      }

      suggestionsList.innerHTML = '';
filtered.forEach(cat => {
  const li = document.createElement('li');
  li.className = 'flex items-center px-4 py-2 hover:bg-yellow-100 cursor-pointer';
  li.innerHTML = `
    <img src="${cat.image}" alt="${cat.name}" class="w-8 h-8 rounded-full object-cover mr-3" />
    <span class="text-sm font-medium text-gray-800">${cat.name}</span>
  `;
  li.addEventListener('click', () => {
    window.location.href = `category.html?category=${cat.slug}`;
  });
  suggestionsList.appendChild(li);
});
suggestionsList.classList.remove('hidden');


      suggestionsList.classList.remove('hidden');
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  });

  document.addEventListener('click', (e) => {
    if (!suggestionsList.contains(e.target) && e.target !== keywordInput) {
      suggestionsList.classList.add('hidden');
    }
  });

  function goToCategory(slug) {
    window.location.href = `category.html?category=${slug}`;
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = keywordInput.value.trim().toLowerCase();
    if (value) {
      // Optional: try to redirect directly using slug
      window.location.href = `category.html?category=${value}`;
    }
  });


// Make your order

async function loadGridCategories() {
  try {
    const res = await fetch(API_BASE_URL + '/api/categories');
    const categories = await res.json();
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    categories.slice(0, 8).forEach(cat => {
      const div = document.createElement('div');
      div.className = 'text-center cursor-pointer';

      div.innerHTML = `
        <a href="category.html?category=${cat.slug}" class="block">
          <img src="${cat.image}" alt="${cat.name}"
               onerror="this.src='https://placehold.co/80x80?text=No+Image'"
               class="w-24 h-24 object-cover rounded-full shadow-md mx-auto transition-transform duration-200 hover:scale-105" />
          <p class="mt-2 text-sm font-medium text-gray-700">${cat.name}</p>
        </a>`;

      div.addEventListener('click', () => {
        window.location.href = `category.html?category=${cat.slug}`;
      });

      grid.appendChild(div);
    });
  } catch (err) {
    console.error('Failed to load categories:', err);
    document.getElementById('categoryGrid').innerHTML = `<p class="text-red-500 col-span-4">Failed to load categories.</p>`;
  }
}

document.getElementById('showCategoriesBtn').addEventListener('click', () => {
  document.getElementById('orderCategories').classList.remove('hidden');
  loadGridCategories();
});

//  Todays Special

// fetch(API_BASE_URL + '/api/specials')
//   .then(res => res.json())
//   .then(data => {
//     const container = document.getElementById("foodItemsContainer");
//     container.innerHTML = "";
//     if (Array.isArray(data)) data.forEach(item => {
//       const card = document.createElement("div");
//       card.className = "bg-white shadow-md rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition";

//       card.innerHTML = `
//         <div class="flex items-center space-x-4">
//           <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-md object-cover shadow border" />
//           <div>
//             <h3 class="text-lg font-semibold text-gray-800">${item.name}</h3>
//             <p class="text-sm text-gray-500">${item.description}</p>
//             <p class="text-orange-600 font-bold mt-1">₹${item.price}</p>
//           </div>
//         </div>
//         <button class="bg-orange-500 hover:bg-orange-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow">+</button>
//       `;

//       container.appendChild(card);
//     });
//   });

  });
