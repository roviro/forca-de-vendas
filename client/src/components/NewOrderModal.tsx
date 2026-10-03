import { useState, useEffect } from 'react';
import type { Customer, Seller, Product } from '../types';
import { api } from '../services/api';
import { 
  X, Plus, Trash2, CheckCircle2, MessageCircle, AlertTriangle, 
  Building2, User, Package, CreditCard, ArrowRight 
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  preselectedCustomerId?: string;
}

export const NewOrderModal = ({
  isOpen,
  onClose,
  onOrderCreated,
  preselectedCustomerId
}: NewOrderModalProps) => {
  if (!isOpen) return null;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BOLETO_28_DAYS');
  const [discount, setDiscount] = useState('0');
  const [orderNotes, setOrderNotes] = useState('');

  // Items State
  const [orderItems, setOrderItems] = useState<Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  // Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedResult, setCompletedResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [custs, sels, prods] = await Promise.all([
          api.getCustomers(),
          api.getSellers(),
          api.getProducts()
        ]);
        setCustomers(custs);
        setSellers(sels);
        setProducts(prods);

        if (custs.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(custs[0].id);
        }
        if (sels.length > 0 && !selectedSellerId) {
          setSelectedSellerId(sels[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar dados para emissão:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Helper para obter preço do produto pela tabela do cliente selecionado
  const getProductPrice = (prod: Product, priceTable: string = 'STANDARD') => {
    if (priceTable === 'VIP') return prod.priceVip;
    if (priceTable === 'WHOLESALE') return prod.priceWholesale;
    return prod.priceStandard;
  };

  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const price = getProductPrice(prod, selectedCustomer?.priceTable);

    setOrderItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1, unitPrice: price }];
    });
  };

  const handleItemQuantityChange = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Cálculos
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  const discountVal = parseFloat(discount.replace(',', '.') || '0') || 0;
  const total = Math.max(0, subtotal - discountVal);

  const availableCredit = selectedCustomer ? selectedCustomer.availableCredit : 0;
  const isCreditExceeded = paymentMethod.startsWith('BOLETO') && total > availableCredit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCustomerId || !selectedSellerId) {
      setErrorMsg('Selecione o cliente e o vendedor.');
      return;
    }
    if (orderItems.length === 0) {
      setErrorMsg('Adicione pelo menos um produto ao pedido.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createOrder({
        customerId: selectedCustomerId,
        sellerId: selectedSellerId,
        paymentMethod,
        discount: discountVal,
        notes: orderNotes.trim() || null,
        items: orderItems
      });

      setCompletedResult(res);
      onOrderCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao emitir pedido B2B.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppReceipt = () => {
    if (!completedResult || !selectedCustomer) return;
    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(completedResult.orderSummaryText)}`;
    window.open(url, '_blank');
  };

  const handleResetAndClose = () => {
    setCompletedResult(null);
    setOrderItems([]);
    setDiscount('0');
    setOrderNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {completedResult ? 'Pedido B2B Transmitido!' : 'Emissão de Pedido B2B (Distribuição)'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {completedResult ? (
            /* Success State */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Pedido #{completedResult.order.orderNumber}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Pedido Transmitido para a Matriz!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A separação no estoque e a emissão de nota já foram notificadas à torre de controle.
                </p>
              </div>

              {/* Order Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 max-w-lg mx-auto text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cliente:</span>
                  <strong className="text-white">{completedResult.order.customerName}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Faturado:</span>
                  <strong className="text-emerald-400 text-sm font-black">
                    R$ {completedResult.order.total.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status Inicial:</span>
                  <span className="text-sky-400 font-semibold">{completedResult.order.status}</span>
                </div>
              </div>

              {/* WhatsApp Action */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <button
                  onClick={openWhatsAppReceipt}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar Espelho do Pedido no WhatsApp</span>
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Fechar e Voltar ao Painel
                </button>
              </div>
            </div>
          ) : isLoadingData ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              Carregando catálogo e clientes...
            </div>
          ) : (
            /* Order Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client & Seller Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Select */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Cliente PJ / Destinatário *</span>
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradeName} ({c.cnpj}) • Tabela {c.priceTable}
                      </option>
                    ))}
                  </select>

                  {/* Credit status banner */}
                  {selectedCustomer && (
                    <div className="pt-2 text-xs border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                      <div>
                        <span>Limite Total: </span>
                        <strong className="text-slate-300">R$ {selectedCustomer.creditLimit.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Disponível: </span>
                        <strong className={selectedCustomer.availableCredit > 1000 ? 'text-emerald-400' : 'text-amber-400'}>
                          R$ {selectedCustomer.availableCredit.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seller Select & Payment Method */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vendedor</span>
                      </label>
                      <select
                        value={selectedSellerId}
                        onChange={(e) => setSelectedSellerId(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                      >
                        {sellers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Condição</span>
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                      >
                        <option value="BOLETO_28_DAYS">Boleto 28 Dias</option>
                        <option value="BOLETO_14_28_42">Boleto 14/28/42</option>
                        <option value="PIX_A_VISTA">PIX à Vista (-5%)</option>
                        <option value="CARTAO">Cartão na Entrega</option>
                      </select>
                    </div>
                  </div>

                  {isCreditExceeded && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5 mt-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Pedido excede o limite disponível! Entrará em Análise de Crédito manual.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Catalog Quick Add */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Adicionar Produtos do Estoque
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {products.map((p) => {
                    const price = getProductPrice(p, selectedCustomer?.priceTable);
                    const inCart = orderItems.find((i) => i.productId === p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleAddItem(p.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          inCart
                            ? 'bg-sky-500/10 border-sky-500/40 text-white'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-slate-400 block">{p.sku}</span>
                          <span className="text-xs font-semibold truncate block text-slate-200">{p.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-extrabold text-sky-400">R$ {price.toFixed(2)}</span>
                            <span className="text-slate-500">• Est: {p.stockQuantity} {p.unit}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            inCart ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Items List */}
              {orderItems.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Itens no Carrinho ({orderItems.length})
                  </h4>

                  <div className="space-y-2">
                    {orderItems.map((it) => {
                      const prod = products.find((p) => p.id === it.productId);
                      if (!prod) return null;
                      const lineTotal = it.quantity * it.unitPrice;

                      return (
                        <div
                          key={it.productId}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-white block truncate">{prod.name}</span>
                            <span className="text-slate-400 text-[11px]">
                              {prod.sku} • R$ {it.unitPrice.toFixed(2)} / {prod.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleItemQuantityChange(it.productId, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-center text-white focus:outline-none focus:border-sky-500"
                            />
                            <span className="w-20 text-right font-extrabold text-sky-400">
                              R$ {lineTotal.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.productId)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discount & Totals */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Desconto Comercial (R$)
                    </label>
                    <input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Observações para a Logística / Entrega
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Ex: Recebimento das 08h às 11h na doca 2"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total do Pedido Faturado:</span>
                  <span className="text-xl font-black text-emerald-400">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* CTA */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || orderItems.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmitir Pedido à Matriz</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
