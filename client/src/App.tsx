import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { NewOrderModal } from './components/NewOrderModal';
import { DashboardMatriz } from './pages/DashboardMatriz';
import { OrdersKanbanPage } from './pages/OrdersKanbanPage';
import { ProductsCatalogPage } from './pages/ProductsCatalogPage';
import { CustomersPage } from './pages/CustomersPage';
import { SellerAppPage } from './pages/SellerAppPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentView, setCurrentView] = useState<
    'matriz_dashboard' | 'matriz_kanban' | 'matriz_products' | 'matriz_customers' | 'matriz_settings' | 'seller_app'
  >('matriz_dashboard');

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState<Record<string, string>>({});

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setCompanySettings(data);
    } catch {
      // Ignora erro menor de carregamento inicial
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const companyName = companySettings.company_name || 'Roviro Distribuidora B2B';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-500/20 px-4 py-2 text-xs text-sky-200 flex flex-wrap items-center justify-between gap-2 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            DEMO INTERATIVA
          </span>
          <span>Ambiente de demonstração com persistência local. Emita pedidos B2B, valide limites de crédito e acompanhe o Kanban!</span>
        </div>
        <a
          href="https://roviro.com.br#solucoes"
          className="text-sky-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
        >
          ← Voltar para o Portfólio Roviro
        </a>
      </div>

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        companyName={companyName}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'matriz_dashboard' && (
          <DashboardMatriz
            onOpenNewOrder={() => setIsNewOrderOpen(true)}
            onNavigateToKanban={() => setCurrentView('matriz_kanban')}
            onNavigateToStock={() => setCurrentView('matriz_products')}
          />
        )}

        {currentView === 'matriz_kanban' && <OrdersKanbanPage />}

        {currentView === 'matriz_products' && <ProductsCatalogPage />}

        {currentView === 'matriz_customers' && <CustomersPage />}

        {currentView === 'matriz_settings' && (
          <SettingsPage onSettingsSaved={loadSettings} />
        )}

        {currentView === 'seller_app' && <SellerAppPage />}
      </main>

      {/* Modal Emitir Pedido B2B */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={() => {
          // Callback após emissão de pedido
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{companyName}</span>
            <span>•</span>
            <span>Força de Vendas & Distribuição B2B</span>
          </div>
          <div className="text-slate-400">
            Powered by <a href="https://roviro.com.br" target="_blank" rel="noreferrer" className="text-sky-400 font-semibold hover:underline">Roviro</a> • Gestão comercial corporativa sem gargalos
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
