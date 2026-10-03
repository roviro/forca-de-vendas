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
