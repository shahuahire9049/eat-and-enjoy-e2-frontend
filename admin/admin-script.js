
// Interceptor-like function for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    throw new Error('No admin token found');
  }
  options.headers = {
    ...options.headers,
    'Authorization': 'Bearer ' + token
  };
  
  if (url.startsWith('/api/')) {
    url = API_BASE_URL + url;
  }
  
  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    window.location.href = 'login.html';
  }
  return res;
};

// For normal categories
// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('deals-form');
//   if (!form) return; // Ensure form exists

//   form.addEventListener('submit', async function (e) {
//     e.preventDefault();

//     const id = document.getElementById('deal-id').value;
//     const name = document.getElementById('deal-name').value;
//     const price = document.getElementById('deal-price').value;
//     const description = document.getElementById('deal-description').value;
//     const image = document.getElementById('deal-image').files[0];

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('price', price);
//     formData.append('description', description);
//     if (image) formData.append('image', image);

//     const url = id
//       ? `/api/deals/${id}`
//       : `/api/deals`;

//     const method = id ? 'PUT' : 'POST';

//     try {
//       const res = await authFetch(url, { method, body: formData });
//       if (!res.ok) throw new Error('Error saving deal');
//       alert(id ? 'Deal updated!' : 'Deal added!');
//       form.reset();
//       document.getElementById('deal-id').value = '';
//       fetchDeals();
//     } catch (err) {
//       console.error('Save deal failed:', err);
//       alert('Error saving deal.');
//     }
//   });

//   fetchDeals(); // ✅ Call it once here
// });

// // Fetch and Display Deals
// async function fetchDeals() {
//   try {
//     const res = await authFetch('/api/deals');
//     const data = await res.json();
//     const list = document.getElementById('deal-list');
//     list.innerHTML = '';

//     data.forEach(deal => {
//       const card = document.createElement('div');
//       card.className = 'border rounded p-4 shadow bg-white space-y-2';

//       card.innerHTML = `
//         <img src="${deal.image}" class="w-full h-32 object-cover rounded" />
//         <h3 class="font-semibold">${deal.name}</h3>
//         <p class="text-sm">${deal.description}</p>
//         <p class="text-sm text-gray-600">₹${deal.price}</p>
//         <div class="flex justify-end gap-2">
//           <button onclick="editDeal('${deal._id}', '${deal.name}', '${deal.price}', '${deal.description}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
//           <button onclick="deleteDeal('${deal._id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
//         </div>
//       `;
//       list.appendChild(card);
//     });
//   } catch (err) {
//     console.error('Load failed:', err);
//   }
// }

// // Edit Deal
// window.editDeal = function (id, name, price, description) {
//   document.getElementById('deal-id').value = id;
//   document.getElementById('deal-name').value = name;
//   document.getElementById('deal-price').value = price;
//   document.getElementById('deal-description').value = description;
//   document.getElementById('deal-image').value = ''; // Reset file input
// };

// // Delete Deal
// window.deleteDeal = async function (id) {
//   if (!confirm('Delete this deal?')) return;
//   try {
//     const res = await authFetch(`/api/deals/${id}`, {
//       method: 'DELETE'
//     });
//     if (!res.ok) throw new Error('Delete failed');
//     alert('Deleted!');
//     fetchDeals();
//   } catch (err) {
//     console.error('Delete error:', err);
//   }
// };


document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchFeaturedCategories();
    fetchRestaurants();
    fetchHotDeals();
    fetchTeamMembers();
    fetchBlogPosts();
    fetchFoodItems();
    populateCategoryDropdown();
    fetchTodayOrders();
    loadAllOrders();
    toggleSection('dashboard-section');


    function fetchCategories() {
      authFetch('/api/categories')
        .then(res => res.json())
        .then(categories => {
          const list = document.getElementById('category-list');
          list.innerHTML = '';
          categories.forEach(cat => {
            list.innerHTML += `
            <div class="relative bg-white border border-gray-200 rounded-lg p-2 shadow hover:shadow-md transition text-center text-sm space-y-2">
              <img src="${cat.image || 'https://placehold.co/100x80?text=No+Image'}" 
                  alt="${cat.name}" 
                  class="w-full h-24 object-cover rounded-md" />
              
              <p class="font-medium truncate">${cat.name}</p>
              
              <div class="absolute top-2 right-2 flex gap-2">
                <button onclick="editCategory('${cat._id}', '${cat.name}', '${cat.slug}')" 
                        class="text-blue-500 hover:text-blue-700 text-xs">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button onclick="deleteCategory('${cat._id}')" 
                        class="text-red-500 hover:text-red-700 text-xs">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>`;
          });
        });
    }

    window.editCategory = function (id, name, slug) {
      document.getElementById('category-id').value = id;
      document.getElementById('category-name').value = name;
      document.getElementById('category-slug').value = slug;
      document.getElementById('category-submit-btn').innerText = 'Update Category';
    };

    window.deleteCategory = function (id) {
  if (confirm('Are you sure you want to delete this category?')) {
    authFetch(`/api/categories/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        alert('Category deleted successfully!');
        fetchCategories();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete category. It may not exist anymore.');
      });
  }
};

    document.getElementById('add-category-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value;
  const slug = document.getElementById('category-slug').value;
  const image = document.getElementById('category-image').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('slug', slug);
  if (image) formData.append('image', image);

  const url = id
    ? `/api/categories/${id}`
    : `/api/categories`;
  const method = id ? 'PUT' : 'POST';

  authFetch(url, {
    method: method,
    body: formData
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then(() => {
      alert(id ? 'Category updated successfully!' : 'Category added successfully!');
      fetchCategories();
      this.reset();
      document.getElementById('category-id').value = '';
      document.getElementById('category-submit-btn').innerText = 'Add Category';
    })
    .catch(err => {
      console.error(err);
      alert(id ? 'Failed to update category.' : 'Failed to add category.');
    });
});
});


// For featured categories
function fetchFeaturedCategories() {
  authFetch('/api/featured-categories')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('featured-list');
      list.innerHTML = '';
      data.forEach(item => {
        list.innerHTML += `
          <div class="relative bg-white border border-gray-200 rounded-lg p-2 shadow hover:shadow-md transition text-center text-sm space-y-2">
            <img src="${item.imageUrl || 'https://placehold.co/100x80?text=No+Image'}"
                alt="${item.name}"
                class="w-full h-24 object-cover rounded" />
            <p class="font-medium truncate">${item.name}</p>
            <p class="text-xs text-gray-500">${item.productCount} products</p>
            <div class="absolute top-2 right-2 flex gap-2">
              <button onclick="editFeatured('${item._id}', '${item.name}', '${item.slug}', '${item.productCount}')"
                      class="text-blue-500 hover:text-blue-700 text-xs">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button onclick="deleteFeatured('${item._id}')"
                      class="text-red-500 hover:text-red-700 text-xs">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>`;
      });
    })
    .catch(err => {
      console.error('Failed to fetch featured categories:', err.message);
    });
}

window.editFeatured = function (id, name, slug, count) {
  document.getElementById('featured-id').value = id;
  document.getElementById('featured-name').value = name;
  document.getElementById('featured-slug').value = slug;
  document.getElementById('featured-count').value = count;
  document.getElementById('featured-submit-btn').innerText = 'Update Featured';
};

window.deleteFeatured = function (id) {
  if (confirm('Are you sure you want to delete this featured category?')) {
    authFetch(`/api/featured-categories/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        alert('Featured category deleted successfully!');
        fetchFeaturedCategories();
      })
      .catch(err => {
        console.error('Delete failed:', err.message);
        alert('Failed to delete item.');
      });
  }
};

document.getElementById('featured-category-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('featured-id').value;
  const name = document.getElementById('featured-name').value;
  const slug = document.getElementById('featured-slug').value;
  const count = document.getElementById('featured-count').value;
  const image = document.getElementById('featured-image').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('slug', slug);
  formData.append('productCount', count);
  if (image) formData.append('image', image);

  const url = id
    ? `/api/featured-categories/${id}`
    : `/api/featured-categories`;
  const method = id ? 'PUT' : 'POST';

  authFetch(url, {
    method,
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(() => {
      alert(id ? 'Featured category updated successfully!' : 'Featured category added successfully!');
      fetchFeaturedCategories();
      this.reset();
      document.getElementById('featured-id').value = '';
      document.getElementById('featured-submit-btn').innerText = 'Add Featured';
    })
    .catch(err => {
      console.error('Submit failed:', err.message);
      alert(id ? 'Failed to update featured category.' : 'Failed to add featured category.');
    });
});


// === Popular Restaurants ===

function fetchRestaurants() {
  authFetch('/api/popular-restaurants')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('restaurant-list');
      container.innerHTML = '';
      data.forEach(item => {
        container.innerHTML += `
          <div class="relative bg-white border border-gray-200 rounded-lg p-2 shadow text-center text-sm space-y-2">
            <img src="${item.image || 'https://placehold.co/100x80?text=No+Image'}" class="w-full h-24 object-cover rounded" />
            <p class="font-medium truncate">${item.name}</p>
            <p class="text-xs text-gray-500">${item.rating} ★</p>
            <div class="absolute top-2 right-2 flex gap-2">
              <button onclick="editRestaurant('${item._id}', '${item.name}', '${item.slug}', '${item.rating}', '${item.openingHours}', '${item.address}')" class="text-blue-500 hover:text-blue-700 text-xs"><i class="fas fa-pencil-alt"></i></button>
              <button onclick="deleteRestaurant('${item._id}')" class="text-red-500 hover:text-red-700 text-xs"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>`;
      });
    })
    .catch(err => console.error('Fetch failed:', err.message));
}

window.editRestaurant = function (id, name, slug, rating, hours, address) {
  document.getElementById('restaurant-id').value = id;
  document.getElementById('restaurant-name').value = name;
  document.getElementById('restaurant-slug').value = slug;
  document.getElementById('restaurant-rating').value = rating;
  document.getElementById('restaurant-hours').value = hours;
  document.getElementById('restaurant-address').value = address;
  document.getElementById('restaurant-submit-btn').innerText = 'Update Restaurant';
};

window.deleteRestaurant = function (id) {
  if (confirm('Delete this restaurant?')) {
    authFetch(`/api/popular-restaurants/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.ok ? fetchRestaurants() : alert('Failed to delete.'))
      .catch(err => alert('Error deleting: ' + err.message));
  }
};

document.getElementById('popular-restaurant-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('restaurant-id').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('restaurant-name').value);
  formData.append('slug', document.getElementById('restaurant-slug').value);
  formData.append('rating', document.getElementById('restaurant-rating').value);
  formData.append('openingHours', document.getElementById('restaurant-hours').value);
  formData.append('address', document.getElementById('restaurant-address').value);

  const image = document.getElementById('restaurant-image').files[0];
  if (image) formData.append('image', image);

  const url = id
    ? `/api/popular-restaurants/${id}`
    : '/api/popular-restaurants';
  const method = id ? 'PUT' : 'POST';

  authFetch(url, {
    method,
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP error');
      return res.json();
    })
    .then(() => {
      alert(id ? 'Updated successfully!' : 'Added successfully!');
      fetchRestaurants();
      this.reset();
      document.getElementById('restaurant-id').value = '';
      document.getElementById('restaurant-submit-btn').innerText = 'Add Restaurant';
    })
    .catch(err => alert('Submit failed: ' + err.message));
});



// For Hot Deals

// ==== HOT DEALS ====
function fetchHotDeals() {
  authFetch('/api/hot-deals')
    .then(res => res.json())
    .then(deals => {
      const list = document.getElementById('deal-list');
      list.innerHTML = '';
      deals.forEach(deal => {
        list.innerHTML += `
          <div class="relative bg-white border rounded p-2 shadow text-sm text-center space-y-1">
            <img src="${deal.image}" class="w-full h-24 object-cover rounded" />
            <p class="font-semibold truncate">${deal.name}</p>
            <p class="text-xs text-gray-500">${deal.price} (was ₹${deal.originalPrice})</p>
            <div class="absolute top-2 right-2 flex gap-1">
              <button onclick="editHotDeal('${deal._id}', '${deal.name}', '${deal.description}', ${deal.price}, ${deal.originalPrice})"
                      class="text-blue-500 hover:text-blue-700 text-xs"><i class="fas fa-pencil-alt"></i></button>
              <button onclick="deleteHotDeal('${deal._id}')" class="text-red-500 hover:text-red-700 text-xs"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>`;
      });
    });
}

window.editHotDeal = function(id, name, description, price, originalPrice) {
  document.getElementById('deal-id').value = id;
  document.getElementById('deal-name').value = name;
  document.getElementById('deal-description').value = description;
  document.getElementById('deal-price').value = price;
  document.getElementById('deal-original-price').value = originalPrice;
  document.querySelector('#hot-deal-form button').innerText = 'Update Deal';
};

window.deleteHotDeal = function(id) {
  if (confirm('Delete this deal?')) {
    authFetch(`/api/hot-deals/${id}`, { method: 'DELETE' })
      .then(() => {
        alert('Deleted!');
        fetchHotDeals();
      });
  }
};

document.getElementById('hot-deal-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const id = document.getElementById('deal-id').value;

  const url = id
    ? `/api/hot-deals/${id}`
    : `/api/hot-deals`;
  const method = id ? 'PUT' : 'POST';

  authFetch(url, { method, body: formData })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(() => {
      alert(id ? 'Deal updated!' : 'Deal added!');
      this.reset();
      document.getElementById('deal-id').value = '';
      document.querySelector('#hot-deal-form button').innerText = 'Add Deal';
      fetchHotDeals();
    })
    .catch(err => {
      console.error(err);
      alert('Submit failed: ' + err.message);
    });
});


// Team Members

function fetchTeamMembers() {
  authFetch('/api/team-members')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('team-list');
      list.innerHTML = '';
      data.forEach(member => {
        list.innerHTML += `
          <div class="relative bg-white border border-gray-200 rounded-lg p-2 shadow text-center space-y-2">
            <img src="${member.image}" alt="${member.name}" class="w-full h-24 object-cover rounded" />
            <p class="font-semibold truncate">${member.name}</p>
            <p class="text-sm text-gray-500">${member.role}</p>
            <div class="absolute top-2 right-2 flex gap-2">
              <button onclick="editTeam('${member._id}', '${member.name}', '${member.role}')" class="text-blue-500 hover:text-blue-700 text-xs">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button onclick="deleteTeam('${member._id}')" class="text-red-500 hover:text-red-700 text-xs">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>`;
      });
    });
}

window.editTeam = function (id, name, role) {
  document.getElementById('team-id').value = id;
  document.getElementById('team-name').value = name;
  document.getElementById('team-role').value = role;
  document.getElementById('team-submit-btn').innerText = 'Update Member';
};

window.deleteTeam = function (id) {
  if (confirm('Are you sure you want to delete this member?')) {
    authFetch(`/api/team-members/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        alert('Deleted successfully!');
        fetchTeamMembers();
      });
  }
};

document.getElementById('team-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('team-id').value;
  const name = document.getElementById('team-name').value;
  const role = document.getElementById('team-role').value;
  const image = document.getElementById('team-image').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('role', role);
  if (image) formData.append('image', image);

  const url = id
    ? `/api/team-members/${id}`
    : `/api/team-members`;
  const method = id ? 'PUT' : 'POST';

  authFetch(url, {
    method,
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(() => {
      alert(id ? 'Member updated!' : 'Member added!');
      fetchTeamMembers();
      this.reset();
      document.getElementById('team-id').value = '';
      document.getElementById('team-submit-btn').innerText = 'Add Member';
    })
    .catch(err => {
      console.error(err);
      alert('Submit failed: HTTP error');
    });
});


// Blogspot
function fetchBlogPosts() {
  authFetch('/api/blog-posts')
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById('blog-list');
      list.innerHTML = '';
      posts.forEach(post => {
        list.innerHTML += `
          <div class="bg-white p-4 rounded shadow relative">
            <img src="${post.image || 'https://placehold.co/200x100'}" class="w-full h-32 object-cover rounded" />
            <h3 class="mt-2 font-semibold text-sm">${post.title}</h3>
            <p class="text-xs text-gray-500">${post.author.name}</p>
            <div class="absolute top-2 right-2 flex gap-2">
              <button onclick="editBlog('${post._id}', \`${post.title}\`, \`${post.category}\`, \`${post.description}\`, \`${post.author.name}\`)" class="text-blue-500 hover:text-blue-700 text-xs">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button onclick="deleteBlog('${post._id}')" class="text-red-500 hover:text-red-700 text-xs">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>`;
      });
    });
}

window.editBlog = function (id, title, category, description, authorName) {
  document.getElementById('blog-id').value = id;
  document.getElementById('blog-title').value = title;
  document.getElementById('blog-category').value = category;
  document.getElementById('blog-description').value = description;
  document.getElementById('blog-author').value = authorName;
  document.getElementById('blog-submit-btn').innerText = 'Update Post';
};

window.deleteBlog = function (id) {
  if (confirm('Are you sure you want to delete this blog post?')) {
    authFetch(`/api/blog-posts/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        alert('Blog post deleted!');
        fetchBlogPosts();
      })
      .catch(err => {
        console.error(err);
        alert('Error deleting post.');
      });
  }
};

document.getElementById('blog-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('blog-id').value;
  const formData = new FormData(this);

  const url = id ? `/api/blog-posts/${id}` : `/api/blog-posts`;
  const method = id ? 'PUT' : 'POST';

  authFetch(url, {
    method,
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(() => {
      alert(id ? 'Blog post updated!' : 'Blog post added!');
      this.reset();
      document.getElementById('blog-id').value = '';
      document.getElementById('blog-submit-btn').innerText = 'Publish Post';
      fetchBlogPosts();
    })
    .catch(err => {
      console.error('Submit failed:', err.message);
      alert('Failed to submit blog post.');
    });
});

// Food Items

// ================== FOOD ITEM CRUD =====================

// Fetch and display all food items
async function fetchFoodItems() {
  try {
    const res = await authFetch('/api/food-items');
    const data = await res.json();
    const container = document.getElementById('food-item-list');
    container.innerHTML = '';

    data.forEach(item => {
      container.innerHTML += `
        <div class="relative bg-white border border-gray-200 rounded-lg p-2 shadow text-center text-sm space-y-2">
          <img src="${item.image || 'https://placehold.co/100x80'}" class="w-full h-24 object-cover rounded" />
          <p class="font-semibold truncate">${item.name}</p>
          <p class="text-gray-500 text-xs">${item.category}</p>
          <p class="text-gray-600 text-sm">₹${item.price}</p>
          <div class="absolute top-2 right-2 flex gap-2">
            <button onclick="editItem('${item._id}', '${item.name}', '${item.category}', '${item.price}')" class="text-blue-500 hover:text-blue-700 text-xs">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button onclick="deleteItem('${item._id}')" class="text-red-500 hover:text-red-700 text-xs">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Error fetching food items:', err.message);
  }
}

// Add / Update Food Item
document.getElementById('food-item-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('item-id').value;
  const name = document.getElementById('item-name').value;
  const category = document.getElementById('item-category').value;
  const price = document.getElementById('item-price').value;
  const image = document.getElementById('item-image').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('price', price);
  if (image) formData.append('image', image);

  const url = id ? `/api/food-items/${id}` : `/api/food-items`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await authFetch(url, {
      method,
      body: formData
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    alert(id ? 'Item updated successfully!' : 'Item added successfully!');
    this.reset();
    document.getElementById('item-id').value = '';
    fetchFoodItems();
  } catch (err) {
    console.error('Save failed:', err.message);
    alert('Error saving item.');
  }
});

// Edit Item
window.editItem = function (id, name, category, price) {
  document.getElementById('item-id').value = id;
  document.getElementById('item-name').value = name;
  document.getElementById('item-category').value = category;
  document.getElementById('item-price').value = price;
  document.getElementById('item-image').value = ''; // clear file input
};

// Delete Item
window.deleteItem = async function (id) {
  if (confirm('Are you sure you want to delete this food item?')) {
    try {
      const res = await authFetch(`/api/food-items/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert('Item deleted!');
      fetchFoodItems();
    } catch (err) {
      console.error('Delete failed:', err.message);
      alert('Failed to delete item.');
    }
  }
};

async function populateCategoryDropdown() {
  try {
    const res = await authFetch('/api/categories'); // Adjust if route is different
    const categories = await res.json();

    const categorySelect = document.getElementById('item-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.slug;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error fetching categories for dropdown:', err);
  }
}


// Fetch and render today's orders
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("orderModal").classList.add("hidden");
});

function toggleOrderDetails(orderId) {
  const details = document.getElementById(`details-${orderId}`);
  const icon = document.querySelector(`#toggle-${orderId} svg`);

  if (!details) return;

  if (details.classList.contains('max-h-0')) {
    details.classList.remove('max-h-0', 'opacity-0');
    details.classList.add('max-h-[1000px]', 'opacity-100');
    icon?.classList.add('rotate-180');
  } else {
    details.classList.add('max-h-0', 'opacity-0');
    details.classList.remove('max-h-[1000px]', 'opacity-100');
    icon?.classList.remove('rotate-180');
  }
}

function createOrderCard(order) {
  const card = document.createElement("div");
  card.className = "bg-white shadow rounded-lg p-4 border border-gray-200";

  card.innerHTML = `
    <div class="order-card flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="bg-blue-100 p-2 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-800">${order.name}</p>
          <div class="flex gap-2 mt-1 flex-wrap">
            <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">#${order.orderId}</span>
            <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Order Placed</span>
          </div>
        </div>
      </div>
      <div>
        <button id="toggle-${order.orderId}" onclick="toggleOrderDetails('${order.orderId}')" class="flex items-center space-x-1 text-sm px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition">
          <span>Details</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Accordion Content -->
    <div id="details-${order.orderId}" class="accordion-content max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out">
      <div class="border-t mt-4 pt-4">
        <p class="text-xs text-gray-500 font-semibold uppercase mb-1">Contact</p>
        <p class="text-sm text-gray-700">${order.email}</p>
        <p class="text-sm text-gray-700">${order.phone}</p>

        <p class="mt-2 text-xs text-gray-500 font-semibold uppercase mb-1">Address</p>
        <p class="text-sm text-gray-700">${order.address}</p>

        <div class="mt-4">
          <p class="text-xs text-gray-500 font-semibold uppercase mb-2">Items</p>
          <div class="space-y-2">
            ${order.items.map(item => `
              <div class="flex justify-between items-center border-b py-2">
                <div class="flex items-center space-x-3">
                  <img src="${item.image}" class="w-10 h-10 rounded-md border" />
                  <div>
                    <p class="text-sm font-medium text-gray-800">${item.name}</p>
                    <p class="text-xs text-gray-500">Qty: ${item.quantity}</p>
                  </div>
                </div>
                <p class="text-sm font-medium">₹${item.price}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="flex justify-between items-center mt-6">
          <div>
            <p class="text-xs text-gray-500">Order Date</p>
            <p class="text-sm font-medium">${new Date(order.placedAt).toLocaleString()}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500">Total</p>
            <p class="text-lg font-bold text-blue-600">₹${order.total}</p>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button onclick="window.print()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Print Invoice
          </button>
          <button onclick='showMoreInfo(${JSON.stringify(order)})' class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
            More Info
          </button>
        </div>
      </div>
    </div>
  `;
  return card;
}

async function fetchTodayOrders() {
  try {
    const res = await authFetch('/api/orders/today');
    const orders = await res.json();
    const container = document.getElementById("dashboardOrdersSection");
    container.innerHTML = '';
    orders.forEach(order => container.appendChild(createOrderCard(order)));
  } catch (err) {
    console.error("Error fetching today's orders:", err);
  }
}

async function loadAllOrders() {
  try {
    const response = await authFetch(`/api/orders`);
    const orders = await response.json();
    const container = document.getElementById("allOrdersContainer");
    container.innerHTML = '';
    orders.forEach(order => {
      container.appendChild(createOrderCard(order));
    });
  } catch (err) {
    console.error("Error loading all orders:", err);
  }
}

// function toggleSection(id) {
//   document.querySelectorAll('main section').forEach(section => {
//     section.classList.add('hidden');
//   });

//   const target = document.getElementById(id);
//   if (target) {
//     target.classList.remove('hidden');
//   }

//   if (id === 'dashboard-section') {
//     fetchTodayOrders();
//   } else if (id === 'all-orders-section') {
//     loadAllOrders();
//   }
// }




//  Print Invoice

function printOrders(containerId) {
  const container = document.getElementById(containerId);
  const printableContent = container.innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Order Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .bg-white { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h2>Order Invoice</h2>
        ${printableContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}



// Manage Admins

const BASE_API_URL = '/api';
const token = localStorage.getItem('token');

// Load all admins
async function loadAdmins() {
  try {
    const res = await authFetch(`/api/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch admins');

    const admins = await res.json();
    const list = document.getElementById('admin-table-body');
    list.innerHTML = '';

    admins.forEach(admin => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${admin.username}</td>
        <td class="py-2 px-4 border-b">${admin.role}</td>
        <td class="py-2 px-4 border-b space-x-2">
          <button onclick="editAdmin('${admin._id}', '${admin.username}', '${admin.role}')" class="text-blue-600 hover:underline">Edit</button>
          <button onclick="deleteAdmin('${admin._id}')" class="text-red-600 hover:underline">Delete</button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load admins:', err);
  }
}

// Submit admin form
const adminForm = document.getElementById('admin-form');
adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('admin-id').value;
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  const role = document.getElementById('admin-role').value;

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/admins/${id}` : `/api/admins`;

  try {
    const res = await authFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, role }),
    });

    if (!res.ok) throw new Error('Failed to save admin');

    adminForm.reset();
    document.getElementById('admin-id').value = '';
    loadAdmins();
  } catch (err) {
    console.error(err);
  }
});

// Edit admin
function editAdmin(id, username, role) {
  document.getElementById('admin-id').value = id;
  document.getElementById('admin-username').value = username;
  document.getElementById('admin-role').value = role;
  document.getElementById('admin-password').value = '';
}

// Delete admin
async function deleteAdmin(id) {
  if (!confirm('Are you sure you want to delete this admin?')) return;

  try {
    const res = await authFetch(`/api/admins/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to delete admin');
    loadAdmins();
  } catch (err) {
    console.error(err);
  }
}

// Toggle section visibility
function toggleSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach(sec => sec.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}