# 🚛 Roviro Força de Vendas B2B & Torre de Controle Logística

> Sistema completo de **Força de Vendas Externa & Torre de Controle Logística** para distribuidores, atacadistas, indústrias e representantes comerciais de campo.

---

## 🎯 Por que Este Produto é de Alto Ticket Corporativo?

1. **Elimina a Redigitação Manual**: O vendedor externo na rua emite o pedido diretamente no smartphone com o comprador do supermercado ou restaurante. A matriz recebe o pedido instantaneamente.
2. **Controle Rígido de Crédito B2B**: O sistema calcula em tempo real o saldo de crédito do cliente PJ (CNPJ) e barra ou direciona para aprovação pedidos acima do limite rotativo.
3. **Múltiplas Tabelas de Preço**: Aplica automaticamente preços diferenciados conforme o perfil do cliente (**Padrão**, **Atacado** ou **VIP Grandes Contas**).
4. **Baixa e Controle de Estoque Automático**: Despacho de carga sincronizado com separação (picking/packing) e alertas de reposição mínima de galpão.

---

## 🚀 Módulos da Solução

### 1. 🏢 Torre de Controle da Matriz (`http://localhost:5176` ou `http://localhost:3004`)
- **Dashboard Executivo**: Faturamento do mês (R$), Meta de vendas e % de progresso, Ticket Médio, total de pedidos e ranking de vendedores com comissões calculadas.
- **Expedição Logística (Kanban 4 Etapas)**:
  - 🔍 **1. Análise de Crédito**: Pedidos retidos aguardando liberação financeira.
  - 📦 **2. Separação no Galpão (Picking)**: Equipe de estoque separando caixas e fardos.
  - 🚚 **3. Em Rota / Doca**: Faturado e carregado no caminhão (baixa automática de estoque).
  - ✅ **4. Entregue**: Pedido concluído com baixa de romaneio.
- **Estoque & Catálogo**:
  - Saldo físico em caixas (CX), fardos (FD) e quilos (KG).
  - Alerta visual para itens abaixo do estoque mínimo.
  - Modal de ajuste rápido de saldo e cadastro de novos SKUs.
- **Clientes PJ & Limite de Crédito**:
  - Cadastro de CNPJ, Razão Social e Nome Fantasia.
  - Barra visual de limite utilizado vs limite disponível.
  - Tabela de preço atribuída (Standard, Wholesale, VIP).
  - Bloqueio/Desbloqueio de clientes com 1 clique.

### 2. 📱 App do Vendedor Externo (Campo / Mobile)
- Alternância instantânea no menu superior para o **Modo Vendedor**.
- Seleção rápida da loja/cliente atendido no momento.
- Catálogo com fotos, saldo real de estoque e preços já adaptados à tabela do cliente.
- Carrinho ágil com seleção de caixas/fardos.
- Transmissão do pedido para a matriz em 1 toque.
- **Botão direto de WhatsApp** para enviar o espelho detalhado do pedido para o comprador.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Bun / Node.js, Express, SQLite nativo (`bun:sqlite`).
- **Arquitetura**: REST API com isolamento na porta `3004` (backend) e `5176` (frontend).

---

## 🏃 Como Executar

Execute o script na raiz do projeto:

```bash
./iniciar.sh
```

- **Torre de Controle & App do Vendedor**: [http://localhost:5176](http://localhost:5176)
- **API Backend**: [http://localhost:3004](http://localhost:3004)

---

## 💰 Modelo Comercial de Alto Valor

- **Taxa de Setup & Implantação**: R$ 3.000 a R$ 8.000 para importar o catálogo de produtos e base de clientes da distribuidora.
- **Mensalidade Recorrente (MRR)**: R$ 350 a R$ 800 / mês para a matriz + R$ 39 / mês por vendedor externo na rua.

---

Desenvolvido com excelência técnica por **Roviro Dev & Arch**.
