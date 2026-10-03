import { useState, useEffect } from 'react';
import type { Customer, Product, Seller } from '../types';
import { api } from '../services/api';
import { 
  Building2, Search, Plus, Minus, ShoppingBag, 
  Send, MessageCircle, Sparkles, X, Check 
} from 'lucide-react';

export const SellerAppPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart State (map of productId -> qty)
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState('BOLETO_28_DAYS');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custs, prods, sels, cats] = await Promise.all([
          api.getCustomers(),
          api.getProducts(),
          api.getSellers(),
          api.getCategories()
        ]);
        setCustomers(custs);
        setProducts(prods);
        setSellers(sels);
        setCategories(cats);

        if (custs.length > 0) setSelectedCustomerId(custs[0].id);
        if (sels.length > 0) setSelectedSellerId(sels[0].id);
      } catch (err) {
        console.error('Erro ao carregar dados do app do vendedor:', err);
      }
    };
    fetchData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedSeller = sellers.find((s) => s.id === selectedSellerId);

  const getProductPrice = (prod: Product, table: string = 'STANDARD') => {
    if (table === 'VIP') return prod.priceVip;
    if (table === 'WHOLESALE') return prod.priceWholesale;
    return prod.priceStandard;
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const subtotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    if (!prod) return sum;
    const price = getProductPrice(prod, selectedCustomer?.priceTable);
    return sum + qty * price;
  }, 0);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedSellerId || totalItemsCount === 0) return;

    try {
      setIsSubmitting(true);
      const itemsPayload = Object.entries(cart).map(([productId, quantity]) => {
        const prod = products.find((p) => p.id === productId)!;
        return {
          productId,
          quantity,
          unitPrice: getProductPrice(prod, selectedCustomer?.priceTable)
        };
      });

      const res = await api.createOrder({
        customerId: selectedCustomerId,
        sellerId: selectedSellerId,
        paymentMethod,
        discount: 0,
        items: itemsPayload
      });

      setCompletedOrder(res);
      setCart({});
    } catch (err: any) {
      alert('Erro ao transmitir pedido: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppReceipt = () => {
    if (!completedOrder || !selectedCustomer) return;
    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(completedOrder.orderSummaryText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#080c14] pb-24">
      {/* Seller Header */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modo Força de Vendas em Campo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Emissão Externa de Pedidos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Vendedor: <strong className="text-slate-200">{selectedSeller?.name || 'Representante'}</strong> ({selectedSeller?.code})
            </p>
          </div>

          {/* Quick Customer Switcher */}
          <div className="w-full sm:w-80 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400" />
              <span>Cliente Atendido Agora</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-900 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradeName} • Tabela {c.priceTable}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="flex justify-between items-center text-[10px] pt-1 text-slate-400">
                <span>Limite Disp:</span>
                <span className="font-bold text-emerald-400">
                  R$ {selectedCustomer.availableCredit.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Category Pills */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-3 shadow-md">
        <div className="max-w-5xl mx-auto px-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar SKU ou nome do produto..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              Todos os Itens
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((p) => {
            const price = getProductPrice(p, selectedCustomer?.priceTable);
            const inCartQty = cart[p.id] || 0;

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-800/80 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-slate-400 block">{p.sku}</span>
                    <h3 className="font-bold text-xs text-white truncate">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                      <span className="font-black text-sky-400">R$ {price.toFixed(2)}</span>
                      <span className="text-slate-500 font-medium">/ {p.unit}</span>
                    </div>
                    <span className={`text-[10px] font-bold block mt-0.5 ${p.stockQuantity <= p.minStock ? 'text-rose-400' : 'text-slate-400'}`}>
                      Estoque: {p.stockQuantity} {p.unit}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {inCartQty > 0 ? (
                      <strong className="text-emerald-400">
                        Total: R$ {(inCartQty * price).toFixed(2)}
                      </strong>
                    ) : (
                      'Nenhum no pedido'
                    )}
                  </span>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(p.id, -1)}
                      disabled={inCartQty <= 0}
                      className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-white">
                      {inCartQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(p.id, 1)}
                      className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white font-bold text-sm shadow-2xl shadow-emerald-500/30 flex items-center justify-between active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {totalItemsCount}
              </span>
              <span>Revisar & Transmitir Pedido</span>
            </div>
            <div className="font-black text-base text-emerald-100">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </div>
          </button>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Revisão do Pedido B2B</span>
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {completedOrder ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Pedido Transmitido com Sucesso!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Número do Pedido: <strong className="text-sky-400">#{completedOrder.order.orderNumber}</strong>
                  </p>
                </div>
                <button
                  onClick={openWhatsAppReceipt}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Espelho no WhatsApp do Cliente</span>
                </button>
                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    setIsDrawerOpen(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline block mx-auto"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Destinatário:</span>
                  <strong className="text-white text-sm">{selectedCustomer?.tradeName}</strong>
                  <span className="text-slate-400 block text-[11px] mt-0.5">CNPJ: {selectedCustomer?.cnpj}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Condição de Pagamento:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="BOLETO_28_DAYS">Boleto Bancário 28 Dias</option>
                    <option value="BOLETO_14_28_42">Boleto Parcelado 14/28/42 Dias</option>
                    <option value="PIX_A_VISTA">PIX Imediato à Vista (5% Desconto)</option>
                    <option value="CARTAO">Cartão no Ato da Entrega</option>
                  </select>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(cart).map(([pId, qty]) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    const price = getProductPrice(prod, selectedCustomer?.priceTable);
                    return (
                      <div key={pId} className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span>{qty}x {prod.name} ({prod.unit})</span>
                        <strong className="text-sky-400">R$ {(qty * price).toFixed(2)}</strong>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Total Faturado:</span>
                  <span className="text-emerald-400 text-lg">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitindo...' : 'Transmitir Pedido à Matriz'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
