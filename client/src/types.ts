export type PriceTable = 'STANDARD' | 'WHOLESALE' | 'VIP';

export type OrderStatus = 'CREDIT_REVIEW' | 'SEPARATION' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface Seller {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  commissionRate: number;
}

export interface Customer {
  id: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email?: string;
  address: string;
  creditLimit: number;
  creditUsed: number;
  availableCredit: number;
  creditUsagePercent: number;
  priceTable: PriceTable;
  sellerId?: string;
  sellerName?: string;
  sellerCode?: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stockQuantity: number;
  minStock: number;
  priceStandard: number;
  priceWholesale: number;
  priceVip: number;
  image?: string;
  isLowStock?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerId: string;
  customerTradeName?: string;
  customerCorporateName?: string;
  customerCnpj?: string;
  customerPhone?: string;
  customerAddress?: string;
  sellerId: string;
  sellerName?: string;
  sellerCode?: string;
  priceTable: PriceTable;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface SellerRanking {
  id: string;
  name: string;
  code: string;
  commissionRate: number;
  ordersCount: number;
  totalSold: number;
  commissionEarned: number;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrdersCount: number;
  averageTicket: number;
  monthlyGoal: number;
  goalProgressPercent: number;
  ordersByStatus: Record<string, number>;
  sellersRanking: SellerRanking[];
  lowStockProducts: Product[];
}
