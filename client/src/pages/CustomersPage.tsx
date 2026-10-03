import { useState, useEffect } from 'react';
import type { Customer, Seller, PriceTable } from '../types';
import { api } from '../services/api';
import { 
  Users, Plus, Search, CreditCard, Edit3, X, AlertCircle 
} from 'lucide-react';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Credit Modal
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [newTable, setNewTable] = useState<PriceTable>('STANDARD');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCorporate, setNewCorporate] = useState('');
  const [newTrade, setNewTrade] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('15000');
  const [newCustomerTable, setNewCustomerTable] = useState<PriceTable>('WHOLESALE');
  const [newSellerId, setNewSellerId] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [custs, sels] = await Promise.all([
        api.getCustomers(),
        api.getSellers()
      ]);
      setCustomers(custs);
      setSellers(sels);
      if (sels.length > 0 && !newSellerId) {
        setNewSellerId(sels[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCredit = async () => {
    if (!editingCustomer) return;
    try {
      await api.updateCustomerCredit(editingCustomer.id, {
        creditLimit: parseFloat(newLimit),
        priceTable: newTable,
        status: newStatus
      });
      setEditingCustomer(null);
      await loadData();
    } catch (err: any) {
      alert('Erro ao atualizar crédito: ' + err.message);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer({
        corporateName: newCorporate,
        tradeName: newTrade,
        cnpj: newCnpj,
        phone: newPhone,
        email: newEmail || null,
        address: newAddress,
        creditLimit: parseFloat(newCreditLimit),
        priceTable: newCustomerTable,
        sellerId: newSellerId
      });
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert('Erro ao cadastrar cliente: ' + err.message);
    }
  };

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.tradeName.toLowerCase().includes(term) ||
      c.corporateName.toLowerCase().includes(term) ||
      c.cnpj.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            <span>Gestão de Clientes PJ & Limites de Crédito</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de saldo de crédito rotativo, tabelas de preço atribuídas e bloqueio automático de inadimplentes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente PJ</span>
        </button>
      </div>

      {/* Search */}
      <div className="w-full sm:w-80 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por CNPJ ou Razão Social..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Customers Cards / Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Carregando clientes corporativos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">Nenhum cliente cadastrado com esse filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const isBlocked = c.status === 'BLOCKED';

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl glass-card border-slate-800/80 flex flex-col justify-between gap-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">{c.cnpj}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isBlocked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isBlocked ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">{c.tradeName}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{c.corporateName}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">📍 {c.address}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-sky-400">
                      Tabela {c.priceTable}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Vend: {c.sellerName}
                    </span>
                  </div>
                </div>

                {/* Credit Limit Bar */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Limite Utilizado:</span>
                    </span>
                    <strong className="text-slate-200">
                      R$ {c.creditUsed.toFixed(2)} / R$ {c.creditLimit.toFixed(2)}
                    </strong>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.creditUsagePercent > 90
                          ? 'bg-rose-500'
                          : c.creditUsagePercent > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, c.creditUsagePercent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] pt-0.5 text-slate-400">
                    <span>Disponível para compras:</span>
                    <strong className="text-emerald-400 font-bold">
                      R$ {c.availableCredit.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      setEditingCustomer(c);
                      setNewLimit(String(c.creditLimit));
                      setNewTable(c.priceTable);
                      setNewStatus(c.status);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Gerenciar Crédito & Tabela</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar Limite / Tabela */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Crédito & Tabela Comercial</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Cliente:</span>
                <strong className="text-white block">{editingCustomer.tradeName}</strong>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Limite de Crédito Total (R$):</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tabela de Preço Atribuída:</label>
                <select
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value as PriceTable)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="STANDARD">STANDARD (Preço de Varejo/Balcão)</option>
                  <option value="WHOLESALE">WHOLESALE (Preço de Atacado Geral)</option>
                  <option value="VIP">VIP (Preço Especial Grandes Contas)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Status Cadastral:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="ACTIVE">🟢 Ativo para Vendas</option>
                  <option value="BLOCKED">🔴 Bloqueado (Inadimplência/Cadastro)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCredit}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastrar Novo Cliente PJ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Cadastrar Novo Cliente B2B</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={newCorporate}
                    onChange={(e) => setNewCorporate(e.target.value)}
                    placeholder="Empresa Exemplo Ltda"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    placeholder="Supermercado Exemplo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="11999998888"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Financeiro</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="compras@cliente.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Endereço de Entrega Completo *</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Av. Principal, 1000 - Galpão 3 - Cidade, SP"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Limite Crédito (R$)</label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tabela de Preço</label>
                  <select
                    value={newCustomerTable}
                    onChange={(e) => setNewCustomerTable(e.target.value as PriceTable)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="WHOLESALE">WHOLESALE</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vendedor</label>
                  <select
                    value={newSellerId}
                    onChange={(e) => setNewSellerId(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
