// Restaurant Billing System - Main Application Logic

class RestaurantBillingSystem {
    constructor() {
        this.menuItems = this.loadFromStorage('menuItems') || [];
        this.cart = [];
        this.transactions = this.loadFromStorage('transactions') || [];
        this.invoiceCounter = this.loadFromStorage('invoiceCounter') || 1;
        this.editingItemId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderMenu();
        this.renderCart();
        this.loadSampleData();
    }

    bindEvents() {
        // Modal controls
        document.getElementById('menuManagementBtn').addEventListener('click', () => this.openModal('menuManagementModal'));
        document.getElementById('salesReportBtn').addEventListener('click', () => this.openModal('salesReportModal'));
        
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Menu management
        document.getElementById('menuItemForm').addEventListener('submit', (e) => this.handleMenuFormSubmit(e));
        document.getElementById('cancelEdit').addEventListener('click', () => this.cancelEdit());
        // Delegate edit/delete in menu list
        const list = document.getElementById('menuItemsList');
        list.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.getAttribute('data-action');
            const id = target.getAttribute('data-id');
            if (action === 'edit') this.editMenuItem(id);
            if (action === 'delete') this.deleteMenuItem(id);
        });

        // Cart controls
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('generateInvoiceBtn').addEventListener('click', () => this.generateInvoice());
        document.getElementById('payNowBtn').addEventListener('click', () => this.openPaymentModal());

        // Sales report controls
        document.getElementById('dateFilter').addEventListener('change', (e) => this.handleDateFilterChange(e));
        document.getElementById('exportReportBtn').addEventListener('click', () => this.exportSalesReport());

        // Floating cart click to scroll to cart
        document.getElementById('floatingCart').addEventListener('click', () => {
            document.querySelector('.cart-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // Storage Management
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        if (modalId === 'salesReportModal') {
            this.renderSalesReport();
        } else if (modalId === 'menuManagementModal') {
            this.renderMenuItemsList();
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Menu Management
    handleMenuFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const itemData = {
            id: this.editingItemId || Date.now().toString(),
            name: document.getElementById('itemName').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            imageUrl: document.getElementById('itemImage').value || this.getDefaultImage()
        };

        if (this.editingItemId) {
            // Update existing item
            const index = this.menuItems.findIndex(item => item.id === this.editingItemId);
            this.menuItems[index] = itemData;
            this.cancelEdit();
        } else {
            // Add new item
            this.menuItems.push(itemData);
        }

        this.saveToStorage('menuItems', this.menuItems);
        this.renderMenu();
        this.renderMenuItemsList();
        e.target.reset();
    }

    cancelEdit() {
        this.editingItemId = null;
        document.getElementById('menuItemForm').reset();
        document.getElementById('cancelEdit').style.display = 'none';
        document.querySelector('#menuItemForm button[type="submit"]').textContent = 'Add Item';
    }

    editMenuItem(itemId) {
        const item = this.menuItems.find(item => item.id === itemId);
        if (item) {
            this.editingItemId = itemId;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemImage').value = item.imageUrl;
            document.getElementById('cancelEdit').style.display = 'inline-block';
            document.querySelector('#menuItemForm button[type="submit"]').textContent = 'Update Item';
        }
    }

    deleteMenuItem(itemId) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            this.menuItems = this.menuItems.filter(item => item.id !== itemId);
            this.saveToStorage('menuItems', this.menuItems);
            this.renderMenu();
            this.renderMenuItemsList();
        }
    }

    renderMenuItemsList() {
        const container = document.getElementById('menuItemsList');
        container.innerHTML = '';

        this.menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item-admin';
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K'">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)}</p>
                <div class="menu-item-actions">
                    <button class="btn btn-primary btn-small" data-action="edit" data-id="${item.id}">Edit</button>
                    <button class="btn btn-danger btn-small" data-action="delete" data-id="${item.id}">Delete</button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }

    renderMenu() {
        const container = document.getElementById('menuGrid');
        container.innerHTML = '';

        if (this.menuItems.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                    <h3>No menu items yet</h3>
                    <p>Click "Manage Menu" to add items</p>
                </div>
            `;
            return;
        }

        this.menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: none; font-size: 3rem;">🍽️</div>
                </div>
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                </div>
            `;
            
            itemElement.addEventListener('click', () => this.addToCart(item));
            container.appendChild(itemElement);
        });
    }

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        this.showAddToCartAnimation(item.name);
        this.renderCart();
    }

    showAddToCartAnimation(itemName) {
        const animation = document.createElement('div');
        animation.className = 'add-to-cart-animation';
        animation.textContent = `Added ${itemName}!`;
        document.body.appendChild(animation);

        setTimeout(() => {
            document.body.removeChild(animation);
        }, 600);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.renderCart();
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                this.renderCart();
            }
        }
    }

    clearCart() {
        if (this.cart.length > 0 && confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.renderCart();
        }
    }

    renderCart() {
        const container = document.getElementById('cartItems');
        const floatingCart = document.getElementById('floatingCart');
        const cartBadge = document.getElementById('cartBadge');
        
        if (this.cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">Cart is empty</p>';
            document.getElementById('generateInvoiceBtn').disabled = true;
            floatingCart.style.display = 'none';
        } else {
            container.innerHTML = '';
            this.cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', 1)">+</button>
                        <span class="remove-item" onclick="app.removeFromCart('${item.id}')" title="Remove">×</span>
                    </div>
                `;
                container.appendChild(itemElement);
            });
            document.getElementById('generateInvoiceBtn').disabled = false;
            floatingCart.style.display = 'flex';
            
            // Update floating cart badge
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = totalItems;
            
            // Add pulse animation to floating cart if items added
            if (totalItems > 0) {
                floatingCart.classList.add('btn-pulse');
                setTimeout(() => floatingCart.classList.remove('btn-pulse'), 2000);
            }
        }

        this.updateCartSummary();
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `₹${total.toFixed(2)}`;

        // Keep payment modal amount in sync if open later
        const amountDueEl = document.getElementById('amountDue');
        if (amountDueEl) amountDueEl.textContent = `₹${total.toFixed(2)}`;
    }

    generateInvoice() {
        if (this.cart.length === 0) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal;

        const transaction = {
            id: this.invoiceCounter++,
            date: new Date().toISOString(),
            items: [...this.cart],
            subtotal: subtotal,
            tax: 0,
            total: total
        };

        this.transactions.push(transaction);
        this.saveToStorage('transactions', this.transactions);
        this.saveToStorage('invoiceCounter', this.invoiceCounter);

        this.generateInvoicePDF(transaction);
        this.clearCart();
    }

    // Payment Modal
    openPaymentModal() {
        if (this.cart.length === 0) {
            alert('Add items to the cart before proceeding to payment.');
            return;
        }
        const amount = document.getElementById('total').textContent;
        const amountDueEl = document.getElementById('amountDue');
        if (amountDueEl) amountDueEl.textContent = amount;

        // Resolve QR image by checking common filenames in the project root
        const qrImg = document.getElementById('qrImage');
        const fallback = document.getElementById('qrFallback');
        const candidates = [
            // root folder
            'QR.jpeg', 'QR.jpg', 'QR.png', 'QR.webp',
            'qr.jpeg', 'qr.jpg', 'qr.png', 'qr.webp',
            'qr code.jpeg', 'qr code.jpg', 'qr code.png', 'qr code.webp',
            // QR subfolder the user referenced
            'QR/QR.jpeg', 'QR/QR.jpg', 'QR/QR.png', 'QR/QR.webp',
            'QR/qr.jpeg', 'QR/qr.jpg', 'QR/qr.png', 'QR/qr.webp',
            'QR/qr code.jpeg', 'QR/qr code.jpg', 'QR/qr code.png', 'QR/qr code.webp'
        ];
        let found = false;
        // Try loading each candidate; the first that loads will be shown
        const tryNext = (idx) => {
            if (idx >= candidates.length) {
                qrImg.style.display = 'none';
                fallback.style.display = 'block';
                return;
            }
            const candidate = candidates[idx];
            const testImg = new Image();
            testImg.onload = () => {
                qrImg.src = candidate;
                qrImg.style.display = 'inline-block';
                fallback.style.display = 'none';
            };
            testImg.onerror = () => tryNext(idx + 1);
            testImg.src = candidate + `?cacheBust=${Date.now()}`; // avoid caching when swapping
        };
        tryNext(0);
        this.openModal('paymentModal');
    }

    generateInvoicePDF(transaction) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Restaurant Invoice', 20, 30);
        
        doc.setFontSize(12);
        doc.text(`Invoice #: ${transaction.id}`, 20, 45);
        doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, 55);
        doc.text(`Time: ${new Date(transaction.date).toLocaleTimeString()}`, 20, 65);

        // Items table
        const tableData = transaction.items.map(item => [
            item.name,
            item.quantity,
            `₹${item.price.toFixed(2)}`,
            `₹${(item.price * item.quantity).toFixed(2)}`
        ]);

        doc.autoTable({
            head: [['Item', 'Qty', 'Price', 'Total']],
            body: tableData,
            startY: 80,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [102, 126, 234] }
        });

        // Summary
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.text(`Subtotal: ₹${transaction.subtotal.toFixed(2)}`, 20, finalY);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Total: ₹${transaction.total.toFixed(2)}`, 20, finalY + 15);

        // Footer
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Thank you for your business!', 20, finalY + 45);

        doc.save(`invoice-${transaction.id}.pdf`);
    }

    // Sales Reports
    handleDateFilterChange(e) {
        const filter = e.target.value;
        const customRange = document.getElementById('customDateRange');
        
        if (filter === 'custom') {
            customRange.style.display = 'flex';
        } else {
            customRange.style.display = 'none';
            this.renderSalesReport(filter);
        }
    }

    renderSalesReport(filter = 'today') {
        let filteredTransactions = [...this.transactions];
        const now = new Date();

        switch (filter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredTransactions = this.transactions.filter(t => new Date(t.date) >= today);
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredTransactions = this.transactions.filter(t => new Date(t.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filteredTransactions = this.transactions.filter(t => new Date(t.date) >= monthAgo);
                break;
            case 'custom':
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    filteredTransactions = this.transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        return transactionDate >= start && transactionDate <= end;
                    });
                }
                break;
        }

        this.displaySalesReport(filteredTransactions);
    }

    displaySalesReport(transactions) {
        const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
        const totalTransactions = transactions.length;

        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('totalTransactions').textContent = totalTransactions;

        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No transactions found</p>';
            return;
        }

        transactions.reverse().forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <h4>Invoice #${transaction.id}</h4>
                    <p>${new Date(transaction.date).toLocaleString()}</p>
                    <p>${transaction.items.length} item(s)</p>
                </div>
                <div class="transaction-amount">₹${transaction.total.toFixed(2)}</div>
            `;
            container.appendChild(transactionElement);
        });
    }

    exportSalesReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Sales Report', 20, 30);
        
        const now = new Date();
        doc.setFontSize(12);
        doc.text(`Generated: ${now.toLocaleString()}`, 20, 45);

        // Summary
        const allTransactions = this.transactions;
        const totalRevenue = allTransactions.reduce((sum, t) => sum + t.total, 0);
        const totalTransactions = allTransactions.length;

        doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 20, 65);
        doc.text(`Total Transactions: ${totalTransactions}`, 20, 75);

        // Transactions table
        const tableData = allTransactions.map(transaction => [
            transaction.id,
            new Date(transaction.date).toLocaleDateString(),
            transaction.items.length,
            `₹${transaction.total.toFixed(2)}`
        ]);

        doc.autoTable({
            head: [['Invoice #', 'Date', 'Items', 'Total']],
            body: tableData,
            startY: 90,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [102, 126, 234] }
        });

        doc.save(`sales-report-${now.toISOString().split('T')[0]}.pdf`);
    }

    getDefaultImage() {
        // Return a placeholder image URL
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZvb2QgSXRlbTwvdGV4dD4KPC9zdmc+Cg==';
    }

    loadSampleData() {
        if (this.menuItems.length === 0) {
            this.menuItems = [
                {
                    id: '1',
                    name: 'Idly',
                    price: 30.00,
                    imageUrl: 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2018/12/Instant-Suji-idli.jpg?ssl=1?w=300&h=200&fit=crop'
                },
                {
                    id: '2',
                    name: 'Dosa',
                    price: 15.00,
                    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1H8Mu-pfh7Rb3kFFqkAs9BGl3KstjAFkb4A&s?w=300&h=200&fit=crop'
                },
                {
                    id: '3',
                    name: 'Vada',
                    price: 20.00,
                    imageUrl: 'https://www.awesomecuisine.com/wp-content/uploads/2014/12/medhu-vadai.jpg?w=300&h=200&fit=crop'
                },
                {
                    id: '4',
                    name: 'Omelette',
                    price: 15.00,
                    imageUrl: 'https://www.healthyfood.com/wp-content/uploads/2018/02/Basic-omelette.jpg?w=300&h=200&fit=crop'
                },
                {
                    id: '5',
                    name: 'Chutney',
                    price: 15.00,
                    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1H8Mu-pfh7Rb3kFFqkAs9BGl3KstjAFkb4A&s?w=300&h=200&fit=crop'
                },
                {
                    id: '6',
                    name: 'Coffee',
                    price: 20.00,
                    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1H8Mu-pfh7Rb3kFFqkAs9BGl3KstjAFkb4A&s?w=300&h=200&fit=crop'
                }
            ];
            this.saveToStorage('menuItems', this.menuItems);
            this.renderMenu();
        }
    }
}

// Initialize the application and expose globally for inline handlers
window.app = new RestaurantBillingSystem();
