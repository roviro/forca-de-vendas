import type { Order, Product, Customer, Seller, DashboardMetrics } from '../types';

const BASE_URL = '/api';

export const api = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error('Falha ao carregar métricas');
    return res.json();
  },

  async getOrders(status?: string, sellerId?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (sellerId && sellerId !== 'ALL') params.append('sellerId', sellerId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/orders${query}`);
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    return res.json();
  },

  async getOrderById(id: string): Promise<{ order: Order }> {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Falha ao carregar detalhes do pedido');
    return res.json();
  },

  async createOrder(data: any): Promise<{
    order: Order;
    orderSummaryText: string;
    availableCreditAfterOrder: number;
  }> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao emitir pedido B2B');
    }
    return res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status');
  },

  async getProducts(category?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/products${query}`);
    if (!res.ok) throw new Error('Falha ao carregar catálogo');
    return res.json();
  },

  async adjustStock(id: string, newQuantity: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newQuantity })
    });
    if (!res.ok) throw new Error('Falha ao atualizar estoque');
  },

  async createProduct(data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao cadastrar produto');
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Falha ao carregar categorias');
    return res.json();
  },

  async getCustomers(search?: string, sellerId?: string): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sellerId && sellerId !== 'ALL') params.append('sellerId', sellerId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/customers${query}`);
    if (!res.ok) throw new Error('Falha ao carregar clientes');
    return res.json();
  },

  async createCustomer(data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao cadastrar cliente');
  },

  async updateCustomerCredit(id: string, data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/customers/${id}/credit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao alterar limite de crédito');
  },

  async getSellers(): Promise<Seller[]> {
    const res = await fetch(`${BASE_URL}/sellers`);
    if (!res.ok) throw new Error('Falha ao carregar vendedores');
    return res.json();
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao salvar configurações');
  }
};
