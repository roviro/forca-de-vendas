import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { 
  Package, Plus, Search, AlertTriangle, Edit3, X 
} from 'lucide-react';

export const ProductsCatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Stock Adjustment Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState('');

  // Create Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('CX');
  const [newStock, setNewStock] = useState('100');
  const [newMinStock, setNewMinStock] = useState('20');
  const [newPriceStd, setNewPriceStd] = useState('');
  const [newPriceWhole, setNewPriceWhole] = useState('');
  const [newPriceVip, setNewPriceVip] = useState('');
  const [newImage, setNewImage] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStock = async () => {
    if (!editingProduct) return;
    try {
      await api.adjustStock(editingProduct.id, parseFloat(newStockQty));
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      alert('Erro ao ajustar estoque: ' + err.message);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        sku: newSku,
        name: newName,
        category: newCategory,
        unit: newUnit,
        stockQuantity: parseFloat(newStock),
        minStock: parseFloat(newMinStock),
        priceStandard: parseFloat(newPriceStd.replace(',', '.')),
        priceWholesale: newPriceWhole ? parseFloat(newPriceWhole.replace(',', '.')) : undefined,
        priceVip: newPriceVip ? parseFloat(newPriceVip.replace(',', '.')) : undefined,
        image: newImage || null
      });

      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert('Erro ao cadastrar produto: ' + err.message);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-400" />
            <span>Gestão de Estoque & Catálogo B2B</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de saldo físico em galpão, múltiplos preços por tabela (Padrão, Atacado, VIP) e estoque mínimo.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo SKU</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU ou descrição..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Carregando catálogo de produtos...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Unidade</th>
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Tabela Padrão</th>
                <th className="py-3 px-4 text-right">Tabela Atacado</th>
                <th className="py-3 px-4 text-right">Tabela VIP</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((p) => {
                const isLow = p.stockQuantity <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-300">
                      {p.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        isLow
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        <span>{p.stockQuantity}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {Number(p.priceStandard).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-300">
                      R$ {Number(p.priceWholesale).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      R$ {Number(p.priceVip).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setNewStockQty(String(p.stockQuantity));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-[11px] transition-colors inline-flex items-center gap-1"
                        title="Ajustar Saldo de Estoque"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Ajustar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajustar Estoque */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Ajuste de Estoque Físico</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <span className="text-slate-400 block">{editingProduct.sku}</span>
              <strong className="text-white block">{editingProduct.name}</strong>
              <div>
                <label className="text-slate-400 block mb-1">Novo Saldo de Estoque ({editingProduct.unit}):</label>
                <input
                  type="number"
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveStock}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
              >
                Salvar Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Novo SKU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Cadastrar Novo Produto B2B</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="Ex: BEB-004"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: Bebidas & Sucos"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Descrição do Produto *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Suco de Laranja Integral 1L (Cx c/ 6)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Unidade *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="CX">CX (Caixa)</option>
                    <option value="FD">FD (Fardo)</option>
                    <option value="KG">KG (Quilo)</option>
                    <option value="UN">UN (Unidade)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Preço Padrão (R$) *</label>
                  <input
                    type="text"
                    required
                    value={newPriceStd}
                    onChange={(e) => setNewPriceStd(e.target.value)}
                    placeholder="45,00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Preço Atacado (R$)</label>
                  <input
                    type="text"
                    value={newPriceWhole}
                    onChange={(e) => setNewPriceWhole(e.target.value)}
                    placeholder="40,00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-300"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Preço VIP (R$)</label>
                  <input
                    type="text"
                    value={newPriceVip}
                    onChange={(e) => setNewPriceVip(e.target.value)}
                    placeholder="38,00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
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
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
