import { useState, useEffect } from 'react';
import type { DashboardMetrics } from '../types';
import { api } from '../services/api';
import { 
  DollarSign, TrendingUp, Target, ShoppingCart, 
  AlertTriangle, Award, Truck, CheckCircle2 
} from 'lucide-react';

interface DashboardMatrizProps {
  onOpenNewOrder: () => void;
  onNavigateToKanban: () => void;
  onNavigateToStock: () => void;
}

export const DashboardMatriz = ({
  onOpenNewOrder,
  onNavigateToKanban,
  onNavigateToStock
}: DashboardMatrizProps) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const data = await api.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-xs">
        Carregando indicadores da Torre de Controle...
      </div>
    );
  }

  const ordersByStatus = metrics?.ordersByStatus || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Torre de Controle & Gestão B2B</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Ao Vivo
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoramento centralizado de vendas externas, limites de crédito, expedição e reposição de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToKanban}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Ver Expedição</span>
          </button>
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            + Emitir Pedido
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturamento */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Faturamento Faturado
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              R$ {Number(metrics?.totalSales || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {metrics?.totalOrdersCount || 0} pedidos confirmados
            </div>
          </div>
        </div>

        {/* Meta de Vendas */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Meta Mensal da Matriz
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Meta: R$ {Number(metrics?.monthlyGoal || 0).toLocaleString('pt-BR')}</span>
              <strong className="text-sky-400 font-bold">{Number(metrics?.goalProgressPercent || 0).toFixed(1)}%</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, metrics?.goalProgressPercent || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ticket Médio B2B */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ticket Médio por Pedido
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-400">
              R$ {Number(metrics?.averageTicket || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Média por loja compradora
            </div>
          </div>
        </div>

        {/* Em Análise de Crédito */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pedidos na Expedição
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              {(ordersByStatus.CREDIT_REVIEW || 0) + (ordersByStatus.SEPARATION || 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {ordersByStatus.CREDIT_REVIEW || 0} em crédito • {ordersByStatus.SEPARATION || 0} separando
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Seller Rankings & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sellers Ranking */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Performance dos Representantes Comerciais</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Comissão por Desempenho
            </span>
          </div>

          <div className="space-y-3">
            {metrics?.sellersRanking && metrics.sellersRanking.length > 0 ? (
              metrics.sellersRanking.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-white block">{s.name}</strong>
                      <span className="text-slate-400 text-[11px]">{s.code} • {s.ordersCount} pedidos</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 block">
                      R$ {Number(s.totalSold).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Comissão: R$ {Number(s.commissionEarned).toFixed(2).replace('.', ',')} ({s.commissionRate}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Nenhum vendedor registrado.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl glass-card border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Alertas de Estoque Mínimo (Reposição Urgente)</span>
            </h3>
            <button
              onClick={onNavigateToStock}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
            >
              Gerenciar
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics?.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
              metrics.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-rose-400 block">{p.sku}</span>
                    <strong className="text-slate-200 block truncate max-w-xs">{p.name}</strong>
                    <span className="text-[10px] text-slate-400">{p.category}</span>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded font-extrabold text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {p.stockQuantity} {p.unit}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Mínimo: {p.minStock} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span>Todos os produtos com estoque saudável!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
