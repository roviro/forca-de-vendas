import type { Order, Product, Customer, Seller, DashboardMetrics, OrderStatus } from '../types';

const BASE_URL = '/api';
const STORAGE_PREFIX = 'roviro_forca_vendas_demo_';

// Mock initial data
const INITIAL_SELLERS: Seller[] = [
  { id: 'sel_1', code: 'V01', name: 'Carlos Silva', phone: '(11) 98888-1122', email: 'carlos@distribuidora.com', commissionRate: 3.5 },
  { id: 'sel_2', code: 'V02', name: 'Amanda Rocha', phone: '(11) 97777-3344', email: 'amanda@distribuidora.com', commissionRate: 4.0 },
  { id: 'sel_3', code: 'V03', name: 'Roberto Mendes', phone: '(19) 99111-5566', email: 'roberto@distribuidora.com', commissionRate: 3.0 },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    corporateName: 'Supermercado Central de Alimentos Ltda',
    tradeName: 'Rede Central Sul',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 3200-1000',
    email: 'compras@redesul.com.br',
    address: 'Av. Paulista, 1500 - São Paulo/SP',
    creditLimit: 50000,
    creditUsed: 18500,
    availableCredit: 31500,
    creditUsagePercent: 37,
    priceTable: 'WHOLESALE',
    sellerId: 'sel_1',
    sellerName: 'Carlos Silva',
    sellerCode: 'V01',
    status: 'ACTIVE'
  },
  {
    id: 'cust_2',
    corporateName: 'Atacadão da Construção e Ferramentas SA',
    tradeName: 'Mega Atacado Express',
    cnpj: '98.765.432/0001-11',
    phone: '(11) 4004-9988',
    email: 'pedidos@megaatacado.com.br',
    address: 'Rodovia Anhanguera, km 35 - Cajamar/SP',
    creditLimit: 120000,
    creditUsed: 98000,
    availableCredit: 22000,
    creditUsagePercent: 81.6,
    priceTable: 'VIP',
    sellerId: 'sel_2',
    sellerName: 'Amanda Rocha',
    sellerCode: 'V02',
    status: 'ACTIVE'
  },
  {
    id: 'cust_3',
    corporateName: 'Padaria e Confeitaria Bella Vista Eireli',
    tradeName: 'Padaria Bella Vista',
    cnpj: '45.123.789/0001-55',
    phone: '(11) 2345-6789',
    email: 'contato@bellavista.com.br',
    address: 'Rua Augusta, 450 - São Paulo/SP',
    creditLimit: 8000,
    creditUsed: 7800,
    availableCredit: 200,
    creditUsagePercent: 97.5,
    priceTable: 'STANDARD',
    sellerId: 'sel_1',
    sellerName: 'Carlos Silva',
    sellerCode: 'V01',
    status: 'ACTIVE'
  },
  {
    id: 'cust_4',
    corporateName: 'Restaurante & Grill Fogão a Lenha Ltda',
    tradeName: 'Fogão a Lenha Gastronomia',
    cnpj: '33.998.112/0001-44',
    phone: '(19) 3456-7890',
    address: 'Av. Barão de Itapura, 920 - Campinas/SP',
    creditLimit: 25000,
    creditUsed: 4200,
    availableCredit: 20800,
    creditUsagePercent: 16.8,
    priceTable: 'WHOLESALE',
    sellerId: 'sel_3',
    sellerName: 'Roberto Mendes',
    sellerCode: 'V03',
    status: 'ACTIVE'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    sku: 'BEB-001',
    name: 'Água Mineral sem Gás 500ml (Fardo c/ 12)',
    category: 'Bebidas',
    unit: 'FD',
    stockQuantity: 420,
    minStock: 50,
    priceStandard: 28.90,
    priceWholesale: 24.50,
    priceVip: 22.00,
    isLowStock: false,
    status: 'ACTIVE'
  },
  {
    id: 'prod_2',
    sku: 'ALI-002',
    name: 'Óleo de Soja Especial 900ml (Caixa c/ 20)',
    category: 'Alimentos',
    unit: 'CX',
    stockQuantity: 180,
    minStock: 30,
    priceStandard: 135.00,
    priceWholesale: 122.00,
    priceVip: 115.00,
    isLowStock: false,
    status: 'ACTIVE'
  },
  {
    id: 'prod_3',
    sku: 'LIM-003',
    name: 'Detergente Concentrado Neutro 5L',
    category: 'Limpeza e Higiene',
    unit: 'GL',
    stockQuantity: 14,
    minStock: 25,
    priceStandard: 46.50,
    priceWholesale: 39.90,
    priceVip: 36.00,
    isLowStock: true,
    status: 'ACTIVE'
  },
  {
    id: 'prod_4',
    sku: 'BEB-004',
    name: 'Suco Integral de Uva Tinto 1.5L (Caixa c/ 6)',
    category: 'Bebidas',
    unit: 'CX',
    stockQuantity: 88,
    minStock: 20,
    priceStandard: 94.00,
    priceWholesale: 82.50,
    priceVip: 76.00,
    isLowStock: false,
    status: 'ACTIVE'
  },
  {
    id: 'prod_5',
    sku: 'DESC-005',
    name: 'Copo Descartável Transparente 200ml (Fardo c/ 2500)',
    category: 'Descartáveis',
    unit: 'FD',
    stockQuantity: 8,
    minStock: 15,
    priceStandard: 89.90,
    priceWholesale: 78.00,
    priceVip: 72.00,
    isLowStock: true,
    status: 'ACTIVE'
  },
  {
    id: 'prod_6',
    sku: 'ALI-006',
    name: 'Café Torrado e Moído Tradicional 500g (Caixa c/ 20)',
    category: 'Alimentos',
    unit: 'CX',
    stockQuantity: 65,
    minStock: 15,
    priceStandard: 340.00,
    priceWholesale: 310.00,
    priceVip: 295.00,
    isLowStock: false,
    status: 'ACTIVE'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 1001,
    customerId: 'cust_1',
    customerTradeName: 'Rede Central Sul',
    customerCorporateName: 'Supermercado Central de Alimentos Ltda',
    customerCnpj: '12.345.678/0001-90',
    customerPhone: '(11) 3200-1000',
    customerAddress: 'Av. Paulista, 1500 - São Paulo/SP',
    sellerId: 'sel_1',
    sellerName: 'Carlos Silva',
    sellerCode: 'V01',
    priceTable: 'WHOLESALE',
    subtotal: 4890.00,
    discount: 0,
    total: 4890.00,
    paymentMethod: 'Boleto 28 Dias',
    status: 'DISPATCHED',
    notes: 'Entregar na doca 2 no período matutino',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { productId: 'prod_1', sku: 'BEB-001', productName: 'Água Mineral sem Gás 500ml (Fardo c/ 12)', unit: 'FD', quantity: 50, unitPrice: 24.50, total: 1225.00 },
      { productId: 'prod_2', sku: 'ALI-002', productName: 'Óleo de Soja Especial 900ml (Caixa c/ 20)', unit: 'CX', quantity: 30, unitPrice: 122.00, total: 3660.00 }
    ]
  },
  {
    id: 'ord_1002',
    orderNumber: 1002,
    customerId: 'cust_2',
    customerTradeName: 'Mega Atacado Express',
    customerCorporateName: 'Atacadão da Construção e Ferramentas SA',
    customerCnpj: '98.765.432/0001-11',
    customerPhone: '(11) 4004-9988',
    customerAddress: 'Rodovia Anhanguera, km 35 - Cajamar/SP',
    sellerId: 'sel_2',
    sellerName: 'Amanda Rocha',
    sellerCode: 'V02',
    priceTable: 'VIP',
    subtotal: 12450.00,
    discount: 250.00,
    total: 12200.00,
    paymentMethod: 'Boleto Faturado 30/60 DDL',
    status: 'SEPARATION',
    notes: 'Agendado carregamento com transportadora própria',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    items: [
      { productId: 'prod_6', sku: 'ALI-006', productName: 'Café Torrado e Moído Tradicional 500g (Caixa c/ 20)', unit: 'CX', quantity: 30, unitPrice: 295.00, total: 8850.00 },
      { productId: 'prod_4', sku: 'BEB-004', productName: 'Suco Integral de Uva Tinto 1.5L (Caixa c/ 6)', unit: 'CX', quantity: 45, unitPrice: 76.00, total: 3420.00 }
    ]
  },
  {
    id: 'ord_1003',
    orderNumber: 1003,
    customerId: 'cust_4',
    customerTradeName: 'Fogão a Lenha Gastronomia',
    customerCorporateName: 'Restaurante & Grill Fogão a Lenha Ltda',
    customerCnpj: '33.998.112/0001-44',
    customerPhone: '(19) 3456-7890',
    customerAddress: 'Av. Barão de Itapura, 920 - Campinas/SP',
    sellerId: 'sel_3',
    sellerName: 'Roberto Mendes',
    sellerCode: 'V03',
    priceTable: 'WHOLESALE',
    subtotal: 1850.00,
    discount: 50.00,
    total: 1800.00,
    paymentMethod: 'PIX Faturado',
    status: 'CREDIT_REVIEW',
    notes: 'Verificação rápida de limite para liberação',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      { productId: 'prod_3', sku: 'LIM-003', productName: 'Detergente Concentrado Neutro 5L', unit: 'GL', quantity: 10, unitPrice: 39.90, total: 399.00 },
      { productId: 'prod_5', sku: 'DESC-005', productName: 'Copo Descartável Transparente 200ml (Fardo c/ 2500)', unit: 'FD', quantity: 5, unitPrice: 78.00, total: 390.00 }
    ]
  }
];

class MockStore {
  private get<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : initial;
    } catch {
      return initial;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set failed', e);
    }
  }

  getSellers(): Seller[] {
    return this.get('sellers', INITIAL_SELLERS);
  }

  getCustomers(): Customer[] {
    return this.get('customers', INITIAL_CUSTOMERS);
  }

  setCustomers(customers: Customer[]): void {
    this.set('customers', customers);
  }

  getProducts(): Product[] {
    return this.get('products', INITIAL_PRODUCTS);
  }

  setProducts(products: Product[]): void {
    this.set('products', products);
  }

  getOrders(): Order[] {
    return this.get('orders', INITIAL_ORDERS);
  }

  setOrders(orders: Order[]): void {
    this.set('orders', orders);
  }

  getSettings(): Record<string, string> {
    return this.get('settings', {
      company_name: 'Roviro Distribuidora B2B',
      cnpj: '10.234.567/0001-89',
      phone: '(11) 3500-9000',
      whatsapp: '5511999998888',
      delivery_alert_email: 'logistica@roviro.com.br'
    });
  }

  setSettings(settings: Record<string, string>): void {
    this.set('settings', settings);
  }
}

const mockStore = new MockStore();

export const api = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const orders = mockStore.getOrders();
    const products = mockStore.getProducts();
    const sellers = mockStore.getSellers();

    const totalSales = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.total, 0);
    const totalOrdersCount = orders.filter(o => o.status !== 'CANCELLED').length;
    const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
    const monthlyGoal = 500000;
    const goalProgressPercent = Math.min(100, (totalSales / monthlyGoal) * 100);

    const ordersByStatus: Record<string, number> = {
      CREDIT_REVIEW: 0,
      SEPARATION: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };
    orders.forEach(o => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    const sellersRanking = sellers.map(seller => {
      const sellerOrders = orders.filter(o => o.sellerId === seller.id && o.status !== 'CANCELLED');
      const totalSold = sellerOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        id: seller.id,
        name: seller.name,
        code: seller.code,
        commissionRate: seller.commissionRate,
        ordersCount: sellerOrders.length,
        totalSold,
        commissionEarned: (totalSold * seller.commissionRate) / 100
      };
    }).sort((a, b) => b.totalSold - a.totalSold);

    const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStock);

    return {
      totalSales,
      totalOrdersCount,
      averageTicket,
      monthlyGoal,
      goalProgressPercent,
      ordersByStatus,
      sellersRanking,
      lowStockProducts
    };
  },

  async getOrders(status?: string, sellerId?: string): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (sellerId && sellerId !== 'ALL') params.append('sellerId', sellerId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/orders${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    let orders = mockStore.getOrders();
    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }
    if (sellerId && sellerId !== 'ALL') {
      orders = orders.filter(o => o.sellerId === sellerId);
    }
    return orders;
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const order = mockStore.getOrders().find(o => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');
    return { order };
  },

  async createOrder(data: any): Promise<{
    order: Order;
    orderSummaryText: string;
    availableCreditAfterOrder: number;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const customers = mockStore.getCustomers();
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) throw new Error('Cliente selecionado não encontrado');

    const sellers = mockStore.getSellers();
    const seller = sellers.find(s => s.id === data.sellerId) || sellers[0];
    const products = mockStore.getProducts();

    // Check credit limit
    const totalOrder = Number(data.total) || 0;
    if (customer.availableCredit < totalOrder) {
      throw new Error(`Limite de crédito excedido! Limite disponível: R$ ${customer.availableCredit.toFixed(2)}, Valor do Pedido: R$ ${totalOrder.toFixed(2)}`);
    }

    // Decrement stock
    const updatedProducts = products.map(prod => {
      const item = data.items?.find((i: any) => i.productId === prod.id);
      if (item) {
        const remaining = Math.max(0, prod.stockQuantity - item.quantity);
        return {
          ...prod,
          stockQuantity: remaining,
          isLowStock: remaining <= prod.minStock
        };
      }
      return prod;
    });
    mockStore.setProducts(updatedProducts);

    // Update customer credit
    customer.creditUsed += totalOrder;
    customer.availableCredit = Math.max(0, customer.creditLimit - customer.creditUsed);
    customer.creditUsagePercent = Math.min(100, (customer.creditUsed / customer.creditLimit) * 100);
    mockStore.setCustomers(customers);

    const orders = mockStore.getOrders();
    const newNumber = 1000 + orders.length + 1;
    const newOrder: Order = {
      id: `ord_${newNumber}`,
      orderNumber: newNumber,
      customerId: customer.id,
      customerTradeName: customer.tradeName,
      customerCorporateName: customer.corporateName,
      customerCnpj: customer.cnpj,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerCode: seller.code,
      priceTable: data.priceTable || customer.priceTable,
      subtotal: data.subtotal || totalOrder,
      discount: data.discount || 0,
      total: totalOrder,
      paymentMethod: data.paymentMethod || 'Boleto 28 Dias',
      status: 'CREDIT_REVIEW',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: data.items || []
    };

    mockStore.setOrders([newOrder, ...orders]);

    const orderSummaryText = `*PEDIDO B2B #${newOrder.orderNumber} EMITIDO COM SUCESSO!*\n\n` +
      `*Cliente:* ${customer.tradeName}\n` +
      `*CNPJ:* ${customer.cnpj}\n` +
      `*Vendedor:* ${seller.name} (${seller.code})\n` +
      `*Valor Total:* R$ ${newOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `*Condição:* ${newOrder.paymentMethod}\n` +
      `*Limite Restante:* R$ ${customer.availableCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return {
      order: newOrder,
      orderSummaryText,
      availableCreditAfterOrder: customer.availableCredit
    };
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    const orders = mockStore.getOrders();
    const updated = orders.map(o => o.id === id ? { ...o, status: status as OrderStatus, updatedAt: new Date().toISOString() } : o);
    mockStore.setOrders(updated);
  },

  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/products${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    let products = mockStore.getProducts();
    if (category && category !== 'ALL') {
      products = products.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return products;
  },

  async adjustStock(id: string, newQuantity: number): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQuantity })
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    const products = mockStore.getProducts();
    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stockQuantity: newQuantity,
          isLowStock: newQuantity <= p.minStock
        };
      }
      return p;
    });
    mockStore.setProducts(updated);
  },

  async createProduct(data: any): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    const products = mockStore.getProducts();
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: data.name,
      category: data.category || 'Geral',
      unit: data.unit || 'UN',
      stockQuantity: Number(data.stockQuantity) || 0,
      minStock: Number(data.minStock) || 10,
      priceStandard: Number(data.priceStandard) || 0,
      priceWholesale: Number(data.priceWholesale) || 0,
      priceVip: Number(data.priceVip) || 0,
      isLowStock: (Number(data.stockQuantity) || 0) <= (Number(data.minStock) || 10),
      status: 'ACTIVE'
    };
    mockStore.setProducts([newProd, ...products]);
  },

  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch(`${BASE_URL}/categories`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const products = mockStore.getProducts();
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return categories.length > 0 ? categories : ['Bebidas', 'Alimentos', 'Limpeza e Higiene', 'Descartáveis'];
  },

  async getCustomers(search?: string, sellerId?: string): Promise<Customer[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sellerId && sellerId !== 'ALL') params.append('sellerId', sellerId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/customers${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    let customers = mockStore.getCustomers();
    if (sellerId && sellerId !== 'ALL') {
      customers = customers.filter(c => c.sellerId === sellerId);
    }
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.tradeName.toLowerCase().includes(q) ||
        c.corporateName.toLowerCase().includes(q) ||
        c.cnpj.includes(q)
      );
    }
    return customers;
  },

  async createCustomer(data: any): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    const customers = mockStore.getCustomers();
    const sellers = mockStore.getSellers();
    const seller = sellers.find(s => s.id === data.sellerId);

    const limit = Number(data.creditLimit) || 10000;
    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      corporateName: data.corporateName,
      tradeName: data.tradeName || data.corporateName,
      cnpj: data.cnpj,
      phone: data.phone,
      email: data.email,
      address: data.address,
      creditLimit: limit,
      creditUsed: 0,
      availableCredit: limit,
      creditUsagePercent: 0,
      priceTable: data.priceTable || 'STANDARD',
      sellerId: data.sellerId,
      sellerName: seller?.name,
      sellerCode: seller?.code,
      status: 'ACTIVE'
    };
    mockStore.setCustomers([newCust, ...customers]);
  },

  async updateCustomerCredit(id: string, data: any): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/customers/${id}/credit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    const customers = mockStore.getCustomers();
    const updated = customers.map(c => {
      if (c.id === id) {
        const newLimit = Number(data.creditLimit) !== undefined ? Number(data.creditLimit) : c.creditLimit;
        const newUsed = Number(data.creditUsed) !== undefined ? Number(data.creditUsed) : c.creditUsed;
        const available = Math.max(0, newLimit - newUsed);
        return {
          ...c,
          creditLimit: newLimit,
          creditUsed: newUsed,
          availableCredit: available,
          creditUsagePercent: newLimit > 0 ? (newUsed / newLimit) * 100 : 0
        };
      }
      return c;
    });
    mockStore.setCustomers(updated);
  },

  async getSellers(): Promise<Seller[]> {
    try {
      const res = await fetch(`${BASE_URL}/sellers`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.getSellers();
  },

  async getSettings(): Promise<Record<string, string>> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.getSettings();
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }
    mockStore.setSettings(data);
  }
};
