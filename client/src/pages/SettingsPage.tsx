import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, Check, Building2, Target, DollarSign } from 'lucide-react';

interface SettingsPageProps {
  onSettingsSaved?: () => void;
}

export const SettingsPage = ({ onSettingsSaved }: SettingsPageProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    company_name: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    min_order_value: '350.00',
    monthly_sales_goal: '150000.00'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSettings();
        setFormData((prev) => ({
          ...prev,
          ...data
        }));
      } catch (err) {
        console.error('Erro ao carregar configurações da distribuidora:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings(formData);
      setSuccessMsg('Parâmetros da distribuidora salvos com sucesso!');
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Carregando parâmetros...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          <span>Parâmetros da Distribuidora & Matriz</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure a razão social da distribuidora, pedido mínimo para faturamento e metas de vendas.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identificação */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Dados Cadastrais da Matriz</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Nome Comercial / Razão Social
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                CNPJ da Matriz
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                WhatsApp Central de Faturamento
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="5511986531134"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Email de Expedição / Faturamento
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Endereço do Centro de Distribuição / Galpão
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Políticas de Venda */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Regras Comerciais & Metas</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Pedido Mínimo para Faturamento (R$)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="min_order_value"
                  value={formData.min_order_value}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Meta Mensal de Faturamento da Matriz (R$)
              </label>
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="monthly_sales_goal"
                  value={formData.monthly_sales_goal}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback & Submit */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Parâmetros'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
