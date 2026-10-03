import { 
  Building2, Smartphone, LayoutDashboard, Truck, 
  Package, Users, Plus, Settings 
} from 'lucide-react';

interface NavbarProps {
  currentView: 'matriz_dashboard' | 'matriz_kanban' | 'matriz_products' | 'matriz_customers' | 'matriz_settings' | 'seller_app';
  setCurrentView: (view: 'matriz_dashboard' | 'matriz_kanban' | 'matriz_products' | 'matriz_customers' | 'matriz_settings' | 'seller_app') => void;
  onOpenNewOrder: () => void;
  companyName?: string;
}

export const Navbar = ({
  currentView,
  setCurrentView,
  onOpenNewOrder,
  companyName = 'Roviro Distribuidora B2B'
}: NavbarProps) => {
  const isSellerMode = currentView === 'seller_app';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mode Switcher Pill */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
              🚛
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
                  {companyName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  B2B Supply
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Força de Vendas & Torre de Controle Logística
              </p>
            </div>
          </div>

          {/* Navigation Mode: Matriz vs Vendedor Externo */}
          <div className="flex items-center gap-2">
            {/* View Switcher: Matriz vs Campo */}
            <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setCurrentView('matriz_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !isSellerMode
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Torre Matriz</span>
              </button>

              <button
                onClick={() => setCurrentView('seller_app')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSellerMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App Vendedor</span>
              </button>
            </div>

            {/* Matriz Tabs (when in Matriz mode) */}
            {!isSellerMode && (
              <nav className="hidden lg:flex items-center gap-1 ml-2">
                <button
                  onClick={() => setCurrentView('matriz_dashboard')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    currentView === 'matriz_dashboard'
                      ? 'text-sky-400 bg-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visão Geral"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView('matriz_kanban')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentView === 'matriz_kanban'
                      ? 'text-sky-400 bg-slate-800 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Expedição & Logística"
                >
                  <Truck className="w-4 h-4" />
                  <span>Expedição</span>
                </button>

                <button
                  onClick={() => setCurrentView('matriz_products')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentView === 'matriz_products'
                      ? 'text-sky-400 bg-slate-800 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Estoque & Produtos"
                >
                  <Package className="w-4 h-4" />
                  <span>Estoque</span>
                </button>

                <button
                  onClick={() => setCurrentView('matriz_customers')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentView === 'matriz_customers'
                      ? 'text-sky-400 bg-slate-800 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Clientes PJ"
                >
                  <Users className="w-4 h-4" />
                  <span>Clientes</span>
                </button>

                <button
                  onClick={() => setCurrentView('matriz_settings')}
                  className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ${
                    currentView === 'matriz_settings' ? 'text-sky-400 bg-slate-800' : ''
                  }`}
                  title="Configurações da Distribuidora"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </nav>
            )}

            {/* Quick Emit Button */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all ml-1"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Emitir Pedido</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
