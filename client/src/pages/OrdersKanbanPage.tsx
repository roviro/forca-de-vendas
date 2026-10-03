import { useState, useEffect } from 'react';
import type { Order } from '../types';
import { api } from '../services/api';
import { 
  Building2, User, RefreshCw, CheckCircle, ArrowRight, 
  FileText, X, Printer 
} from 'lucide-react';

export const OrdersKanbanPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderForMirror, setSelectedOrderForMirror] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.getOrders('ALL');
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar pedidos B2B:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (err: any) {
      alert('Erro ao atualizar status logístico: ' + err.message);
    }
  };

  // Separa por colunas
  const creditOrders = orders.filter((o) => o.status === 'CREDIT_REVIEW');
  const separationOrders = orders.filter((o) => o.status === 'SEPARATION');
  const dispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').slice(0, 8);

  const renderCard = (order: Order) => {
    return (
      <div
        key={order.id}
        className="p-4 rounded-xl glass-card border-slate-800/80 space-y-3 hover:border-slate-700 transition-all text-xs"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-extrabold text-white">
              #{order.orderNumber}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-800 text-sky-400">
              {order.priceTable}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-400">
            R$ {Number(order.total).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Customer & Seller */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 font-bold text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{order.customerTradeName}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span>Vend: {order.sellerName} ({order.sellerCode})</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Condição: {order.paymentMethod.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Items summary */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-800/60">
            {order.items.slice(0, 2).map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[170px]">{it.quantity}x {it.productName}</span>
                <span className="text-slate-300 font-medium">R$ {Number(it.total).toFixed(2)}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <span className="text-[10px] text-slate-500 block">
                +{order.items.length - 2} itens adicionais...
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => setSelectedOrderForMirror(order)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Ver Romaneio / Espelho"
          >
            <FileText className="w-4 h-4" />
          </button>

          {order.status === 'CREDIT_REVIEW' && (
            <button
              onClick={() => handleUpdateStatus(order.id, 'SEPARATION')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              <span>Aprovar Crédito</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {order.status === 'SEPARATION' && (
            <button
              onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              <span>Despachar Carga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {order.status === 'DISPATCHED' && (
            <button
              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirmar Entrega</span>
            </button>
          )}

          {order.status === 'DELIVERED' && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mx-auto py-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Entregue</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Expedição & Pipeline Logístico B2B</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operação de Carga
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de pedidos da análise de crédito até a saída das docas e confirmação de entrega ao lojista.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start sm:self-auto"
          title="Atualizar"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {/* Coluna 1: Análise de Crédito */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-bold text-xs text-amber-300 uppercase tracking-wider">
                1. Análise de Crédito
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              {creditOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {creditOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum pedido retido em crédito.
              </div>
            ) : (
              creditOrders.map(renderCard)
            )}
          </div>
        </div>

        {/* Coluna 2: Em Separação no Estoque */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h3 className="font-bold text-xs text-sky-300 uppercase tracking-wider">
                2. Separação (Picking)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-slate-950">
              {separationOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {separationOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Galpão sem pedidos para separar.
              </div>
            ) : (
              separationOrders.map(renderCard)
            )}
          </div>
        </div>

        {/* Coluna 3: Despachados & Em Rota */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <h3 className="font-bold text-xs text-indigo-300 uppercase tracking-wider">
                3. Em Rota / Doca
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
              {dispatchedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {dispatchedOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum caminhão em rota.
              </div>
            ) : (
              dispatchedOrders.map(renderCard)
            )}
          </div>
        </div>

        {/* Coluna 4: Concluídos */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-bold text-xs text-emerald-300 uppercase tracking-wider">
                4. Entregues
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
              {deliveredOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Sem histórico recente.
              </div>
            ) : (
              deliveredOrders.map(renderCard)
            )}
          </div>
        </div>
      </div>

      {/* Modal Romaneio / Espelho do Pedido */}
      {selectedOrderForMirror && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-sky-400">
                  Espelho do Pedido B2B #{selectedOrderForMirror.orderNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  title="Imprimir Romaneio"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrderForMirror(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Razão Social:</span>
                  <strong className="text-white">{selectedOrderForMirror.customerCorporateName}</strong>
                  <span className="text-slate-400 text-[11px] block mt-0.5">CNPJ: {selectedOrderForMirror.customerCnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Vendedor Responsável:</span>
                  <strong className="text-white">{selectedOrderForMirror.sellerName} ({selectedOrderForMirror.sellerCode})</strong>
                  <span className="text-slate-400 text-[11px] block mt-0.5">Tabela: {selectedOrderForMirror.priceTable}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
                  Itens da Carga / Separação
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5 text-center">Un</th>
                        <th className="p-2.5 text-center">Qtd</th>
                        <th className="p-2.5 text-right">R$ Unit</th>
                        <th className="p-2.5 text-right">R$ Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {selectedOrderForMirror.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400">{it.sku}</td>
                          <td className="p-2.5 font-semibold text-white">{it.productName}</td>
                          <td className="p-2.5 text-center">{it.unit}</td>
                          <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                          <td className="p-2.5 text-right">R$ {Number(it.unitPrice).toFixed(2)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-400">R$ {Number(it.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-400">Total Faturado:</span>
                <span className="text-emerald-400 text-base">
                  R$ {Number(selectedOrderForMirror.total).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
