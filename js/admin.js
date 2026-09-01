/* ============================================================
  Shibuli Admin Dashboard - JavaScript
   ============================================================ */

// Admin Authentication
class AdminAuth {
  constructor() {
    this.currentUser = this.checkAuth();
    this.initAuth();
  }

  checkAuth() {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }

  initAuth() {
    // Redirect to login if not authenticated (except on login page)
    if (!this.currentUser && !window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }

    // If already logged in and on login page, redirect to dashboard
    if (this.currentUser && window.location.pathname.includes('index.html')) {
      window.location.href = 'dashboard.html';
    }
  }

  login(username, password) {
    // Demo credentials check
    if (username === 'admin' && password === 'password123') {
      const user = { id: 1, username: 'admin', email: 'admin@shibuli.com', name: 'Admin User' };
      localStorage.setItem('admin_user', JSON.stringify(user));
      this.currentUser = user;
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  }

  logout() {
    localStorage.removeItem('admin_user');
    window.location.href = 'index.html';
  }
}

// Admin Product Management
class ProductManager {
  constructor() {
    this.products = this.loadProducts();
  }

  loadProducts() {
    const stored = localStorage.getItem('admin_products');
    return stored ? JSON.parse(stored) : [];
  }

  saveProducts() {
    localStorage.setItem('admin_products', JSON.stringify(this.products));
  }

  addProduct(productData) {
    const product = {
      id: Date.now(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.unshift(product);
    this.saveProducts();
    return product;
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveProducts();
      return this.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
      return true;
    }
    return false;
  }

  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  getStats() {
    return {
      total: this.products.length,
      active: this.products.filter(p => p.status === 'active').length,
      featured: this.products.filter(p => p.featured === 'yes').length
    };
  }
}

// Initialize
const adminAuth = new AdminAuth();
const productManager = new ProductManager();

// ============================================================
// LOGIN PAGE
// ============================================================

function initLoginPage() {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;

  // Toggle password visibility
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });

  // Form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = adminAuth.login(username, password);
    if (result.success) {
      window.location.href = 'dashboard.html';
    } else {
      alert('Invalid username or password');
    }
  });
}

// ============================================================
// DASHBOARD PAGE
// ============================================================

function initDashboard() {
  if (!document.getElementById('total-products')) return;

  updateDashboardStats();
  loadRecentProducts();
  setupSidebarToggle();
  setupLogout();
}

function updateDashboardStats() {
  const stats = productManager.getStats();
  
  document.getElementById('total-products').textContent = stats.total;
  document.getElementById('total-orders').textContent = Math.floor(Math.random() * 100) + 50;
  document.getElementById('total-customers').textContent = Math.floor(Math.random() * 500) + 100;
  document.getElementById('total-revenue').textContent = 'KSh ' + (Math.random() * 5000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function loadRecentProducts() {
  const recentProductsContainer = document.getElementById('recent-products');
  const recent = productManager.products.slice(0, 5);

  if (recent.length === 0) {
    recentProductsContainer.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> No products yet. <a href="add-product.html">Add your first product</a></p>';
    return;
  }

  recentProductsContainer.innerHTML = recent.map(product => `
    <div class="product-item">
      <div class="product-item-image">
        <i class="fas fa-box"></i>
      </div>
      <div class="product-item-info">
        <h4 class="product-item-name">${product.productName}</h4>
        <p class="product-item-meta">${product.category} • KSh ${parseFloat(product.price).toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

// ============================================================
// PRODUCTS PAGE
// ============================================================

function initProductsPage() {
  if (!document.getElementById('products-table')) return;

  loadProductsTable();
  setupProductFilters();
  setupSidebarToggle();
  setupLogout();
}

function loadProductsTable() {
  const tbody = document.getElementById('products-tbody');
  const products = productManager.products;

  if (products.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><div class="empty-state"><i class="fas fa-inbox"></i><p>No products found</p><a href="add-product.html" class="btn btn-primary btn-sm">Add Product</a></div></td></tr>';
    document.getElementById('product-count').textContent = '0';
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr>
      <td><input type="checkbox" class="product-checkbox" data-id="${product.id}" /></td>
      <td>
        <div class="product-name">
          <div class="product-image"></div>
          <span>${product.productName}</span>
        </div>
      </td>
      <td>${product.category}</td>
      <td>KSh ${parseFloat(product.price).toLocaleString()}</td>
      <td>
        <span class="stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}">
          ${product.stock} units
        </span>
      </td>
      <td><span class="status-badge ${product.status}">${product.status}</span></td>
      <td>
        ${product.featured === 'yes' ? '<span class="featured-badge"><i class="fas fa-star"></i> Yes</span>' : 'No'}
      </td>
      <td>
        <div class="table-actions">
          <button class="action-icon" title="Edit" onclick="editProduct(${product.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-icon delete" title="Delete" onclick="openDeleteModal(${product.id}, '${product.productName}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  document.getElementById('product-count').textContent = products.length;

  // Setup checkboxes
  setupProductCheckboxes();
}

function setupProductCheckboxes() {
  const selectAll = document.querySelector('.select-all');
  const checkboxes = document.querySelectorAll('.product-checkbox');
  const bulkActions = document.getElementById('bulk-actions');

  selectAll.addEventListener('change', () => {
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateBulkActions();
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateBulkActions();
    });
  });

  function updateBulkActions() {
    const selected = document.querySelectorAll('.product-checkbox:checked').length;
    if (selected > 0) {
      bulkActions.style.display = 'flex';
      document.getElementById('selected-count').textContent = selected;
    } else {
      bulkActions.style.display = 'none';
    }
  }
}

function setupProductFilters() {
  const searchInput = document.getElementById('search-products');
  const categoryFilter = document.getElementById('category-filter');
  const statusFilter = document.getElementById('status-filter');

  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const status = statusFilter.value;

    const filtered = productManager.products.filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm) ||
                           (product.sku && product.sku.toLowerCase().includes(searchTerm));
      const matchesCategory = !category || product.category === category;
      const matchesStatus = !status || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    const tbody = document.getElementById('products-tbody');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><div class="empty-state"><i class="fas fa-search"></i><p>No products found</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(product => `
      <tr>
        <td><input type="checkbox" class="product-checkbox" data-id="${product.id}" /></td>
        <td>
          <div class="product-name">
            <div class="product-image"></div>
            <span>${product.productName}</span>
          </div>
        </td>
        <td>${product.category}</td>
        <td>KSh ${parseFloat(product.price).toLocaleString()}</td>
        <td>
          <span class="stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}">
            ${product.stock} units
          </span>
        </td>
        <td><span class="status-badge ${product.status}">${product.status}</span></td>
        <td>
          ${product.featured === 'yes' ? '<span class="featured-badge"><i class="fas fa-star"></i> Yes</span>' : 'No'}
        </td>
        <td>
          <div class="table-actions">
            <button class="action-icon" title="Edit" onclick="editProduct(${product.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-icon delete" title="Delete" onclick="openDeleteModal(${product.id}, '${product.productName}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    setupProductCheckboxes();
  }

  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
  statusFilter.addEventListener('change', filterProducts);
}

function editProduct(id) {
  alert('Edit functionality coming soon!');
}

function openDeleteModal(id, name) {
  const modal = document.getElementById('delete-modal');
  modal.classList.add('active');
  
  const confirmBtn = document.getElementById('confirm-delete');
  confirmBtn.onclick = () => {
    productManager.deleteProduct(id);
    closeModal('delete-modal');
    loadProductsTable();
  };
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ============================================================
// ADD PRODUCT PAGE
// ============================================================

function initAddProductPage() {
  if (!document.getElementById('add-product-form')) return;

  const form = document.getElementById('add-product-form');
  const descriptionInput = document.getElementById('product-description');
  const priceInput = document.getElementById('product-price');
  const discountInput = document.getElementById('product-discount-price');
  const imageUploadArea = document.getElementById('image-upload-area');
  const fileInput = document.getElementById('product-images');

  // Character counter
  if (descriptionInput) {
    descriptionInput.addEventListener('input', () => {
      document.getElementById('char-count').textContent = descriptionInput.value.length;
    });
  }

  // Discount calculation
  if (priceInput && discountInput) {
    const updateDiscount = () => {
      const price = parseFloat(priceInput.value) || 0;
      const discount = parseFloat(discountInput.value) || 0;
      const discountInfo = document.getElementById('discount-info');
      
      if (discount && price) {
        const percentage = ((price - discount) / price * 100).toFixed(1);
        discountInfo.textContent = `${percentage}% discount`;
      } else {
        discountInfo.textContent = '';
      }
    };

    priceInput.addEventListener('input', updateDiscount);
    discountInput.addEventListener('input', updateDiscount);
  }

  // Image upload
  if (imageUploadArea && fileInput) {
    imageUploadArea.addEventListener('click', () => fileInput.click());
    
    imageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadArea.style.background = '#e0f2fe';
    });

    imageUploadArea.addEventListener('dragleave', () => {
      imageUploadArea.style.background = '';
    });

    imageUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      imageUploadArea.style.background = '';
      handleImageFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleImageFiles(e.target.files);
    });
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      productName: document.getElementById('product-name').value,
      category: document.getElementById('product-category').value,
      description: document.getElementById('product-description').value,
      price: document.getElementById('product-price').value,
      discountPrice: document.getElementById('product-discount-price').value || null,
      stock: document.getElementById('product-stock').value,
      status: document.getElementById('product-status').value,
      featured: document.getElementById('product-featured').value,
      sku: document.getElementById('product-sku').value || `SKU-${Date.now()}`,
      brand: document.getElementById('product-brand').value,
      color: document.getElementById('product-color').value,
      warranty: document.getElementById('product-warranty').value,
      rating: document.getElementById('product-rating').value,
      slug: document.getElementById('product-slug').value,
      metaDescription: document.getElementById('product-meta-desc').value
    };

    productManager.addProduct(formData);
    alert('Product added successfully!');
    window.location.href = 'products.html';
  });

  setupSidebarToggle();
  setupLogout();
}

function handleImageFiles(files) {
  const previewGrid = document.getElementById('image-preview-grid');
  
  Array.from(files).forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `
          <img src="${e.target.result}" alt="Product image ${index + 1}" />
          <button type="button" class="image-preview-remove" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        `;
        previewGrid.appendChild(div);
      };
      reader.readAsDataURL(file);
    }
  });
}

// ============================================================
// COMMON FUNCTIONS
// ============================================================

function setupSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking on a link (mobile)
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebar.classList.remove('active');
      });
    });
  }
}

function setupLogout() {
  const logoutBtns = document.querySelectorAll('#logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        adminAuth.logout();
      }
    });
  });
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('index.html') || path.endsWith('admin/')) {
    initLoginPage();
  } else if (path.includes('dashboard')) {
    initDashboard();
  } else if (path.includes('products.html')) {
    initProductsPage();
  } else if (path.includes('add-product')) {
    initAddProductPage();
  }
});

// Prevent form submission if needed
window.addEventListener('beforeunload', () => {
  // Save draft if needed
});
