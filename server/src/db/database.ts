import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "forca_vendas.db");
export const db = new Database(dbPath);

db.exec("PRAGMA journal_mode = WAL;");

export function initDatabase() {
  // Configurações da Empresa
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Vendedores / Representantes Comerciais
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      commissionRate REAL DEFAULT 3.0,
      createdAt TEXT NOT NULL
    );
  `);

  // Clientes PJ / Lojistas
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      corporateName TEXT NOT NULL,
      tradeName TEXT NOT NULL,
      cnpj TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      creditLimit REAL NOT NULL,
      creditUsed REAL DEFAULT 0,
      priceTable TEXT CHECK(priceTable IN ('STANDARD', 'WHOLESALE', 'VIP')) DEFAULT 'STANDARD',
      sellerId TEXT,
      status TEXT CHECK(status IN ('ACTIVE', 'BLOCKED')) DEFAULT 'ACTIVE',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (sellerId) REFERENCES sellers(id)
    );
  `);

  // Produtos & Estoque
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL, -- CX, FD, UN
      stockQuantity REAL NOT NULL,
      minStock REAL NOT NULL,
      priceStandard REAL NOT NULL,
      priceWholesale REAL NOT NULL,
      priceVip REAL NOT NULL,
      image TEXT,
      status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
      createdAt TEXT NOT NULL
    );
  `);

  // Pedidos B2B
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber INTEGER UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      priceTable TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT CHECK(status IN ('CREDIT_REVIEW', 'SEPARATION', 'DISPATCHED', 'DELIVERED', 'CANCELLED')) DEFAULT 'CREDIT_REVIEW',
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (sellerId) REFERENCES sellers(id)
    );
  `);

  // Itens do Pedido
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      sku TEXT NOT NULL,
      productName TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL,
      unitPrice REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id)
    );
  `);

  seedData();
}

function seedData() {
  // Configurações
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM company_settings").get() as any;
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare("INSERT INTO company_settings (key, value) VALUES (?, ?)");
    insertSetting.run("company_name", "Roviro Distribuidora de Alimentos & Bebidas");
    insertSetting.run("cnpj", "42.891.234/0001-90");
    insertSetting.run("phone", "5511986531134");
    insertSetting.run("email", "distribuicao@roviro.com.br");
    insertSetting.run("address", "Av. das Indústrias, 4500 - Galpão 12 - Barueri, SP");
    insertSetting.run("min_order_value", "350.00");
    insertSetting.run("monthly_sales_goal", "150000.00");
  }

  // Vendedores
  const sellersCount = db.prepare("SELECT COUNT(*) as count FROM sellers").get() as any;
  if (sellersCount.count === 0) {
    const insertSeller = db.prepare("INSERT INTO sellers (id, code, name, phone, email, commissionRate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const now = new Date().toISOString();
    insertSeller.run("sel_carlos", "VEND-01", "Carlos Eduardo Vendas", "11988887777", "carlos.vendas@roviro.com.br", 3.5, now);
    insertSeller.run("sel_mariana", "VEND-02", "Mariana Campos", "11977776666", "mariana.campos@roviro.com.br", 4.0, now);
  }

  // Clientes
  const customersCount = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
  if (customersCount.count === 0) {
    const insertCust = db.prepare(`
      INSERT INTO customers (id, corporateName, tradeName, cnpj, phone, email, address, creditLimit, creditUsed, priceTable, sellerId, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();

    insertCust.run(
      "cust_alvorada",
      "Supermercado Alvorada do Morumbi Ltda",
      "Supermercados Alvorada",
      "12.345.678/0001-99",
      "11999991111",
      "compras@alvoradasuper.com.br",
      "Av. Giovanni Gronchi, 3200 - Morumbi, SP",
      25000.00,
      4200.00,
      "WHOLESALE",
      "sel_carlos",
      "ACTIVE",
      now
    );

    insertCust.run(
      "cust_estrela",
      "Restaurante e Churrascaria Estrela do Sul Eireli",
      "Churrascaria Estrela do Sul",
      "23.456.789/0001-88",
      "11988882222",
      "financeiro@estreladosul.com.br",
      "Rua Augusta, 1400 - Consolação, SP",
      12000.00,
      1850.00,
      "VIP",
      "sel_carlos",
      "ACTIVE",
      now
    );

    insertCust.run(
      "cust_saojose",
      "Mercearia & Empório São José de Pinheiros ME",
      "Empório São José",
      "34.567.890/0001-77",
      "11977773333",
      "jose@emporiosaojose.com.br",
      "Rua dos Pinheiros, 750 - Pinheiros, SP",
      8000.00,
      0.00,
      "STANDARD",
      "sel_mariana",
      "ACTIVE",
      now
    );
  }

  // Produtos
  const productsCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
  if (productsCount.count === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (id, sku, name, category, unit, stockQuantity, minStock, priceStandard, priceWholesale, priceVip, image, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();

    insertProd.run(
      "prod_heineken",
      "BEB-001",
      "Cerveja Heineken Long Neck 330ml (Cx c/ 24)",
      "Bebidas & Cervejas",
      "CX",
      180,
      30,
      142.00,
      132.00,
      126.00,
      "https://images.unsplash.com/photo-1608270119853-c97b8ffc84ef?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );

    insertProd.run(
      "prod_coca_lata",
      "BEB-002",
      "Refrigerante Coca-Cola Original 350ml (Fardo c/ 12)",
      "Bebidas & Refrigerantes",
      "FD",
      240,
      40,
      44.00,
      39.50,
      37.00,
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );

    insertProd.run(
      "prod_agua_cristal",
      "BEB-003",
      "Água Mineral Crystal sem Gás 500ml (Fardo c/ 12)",
      "Bebidas & Águas",
      "FD",
      310,
      50,
      21.00,
      18.50,
      16.90,
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );

    insertProd.run(
      "prod_azeite_gallo",
      "ALI-001",
      "Azeite de Oliva Extra Virgem Gallo 500ml (Cx c/ 12)",
      "Alimentos & Azeites",
      "CX",
      65,
      15,
      410.00,
      385.00,
      365.00,
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );

    insertProd.run(
      "prod_mussarela_peca",
      "ALI-002",
      "Queijo Mussarela Peça Inteira ~4kg (Kg)",
      "Laticínios & Queijos",
      "KG",
      120,
      25,
      38.90,
      34.90,
      32.90,
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );

    insertProd.run(
      "prod_detergente_pro",
      "LIM-001",
      "Detergente Neutro Concentrado Galão 5 Litros (Cx c/ 4)",
      "Limpeza & Higiene",
      "CX",
      15, // Alerta de estoque baixo!
      20,
      89.00,
      78.00,
      72.00,
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=80",
      "ACTIVE",
      now
    );
  }

  // Pedidos Iniciais
  const ordersCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
  if (ordersCount.count === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, orderNumber, customerId, sellerId, priceTable, subtotal, discount, total, paymentMethod, status, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (id, orderId, productId, sku, productName, unit, quantity, unitPrice, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // Pedido 5001: Análise de Crédito
    insertOrder.run(
      "ord_5001",
      5001,
      "cust_alvorada",
      "sel_carlos",
      "WHOLESALE",
      3240.00,
      100.00,
      3140.00,
      "BOLETO_28_DAYS",
      "CREDIT_REVIEW",
      "Pedido quinzenal de reposição de cervejas e refrigerantes.",
      now,
      now
    );
    insertItem.run("item_5001_1", "ord_5001", "prod_heineken", "BEB-001", "Cerveja Heineken Long Neck 330ml (Cx c/ 24)", "CX", 20, 132.00, 2640.00);
    insertItem.run("item_5001_2", "ord_5001", "prod_coca_lata", "BEB-002", "Refrigerante Coca-Cola Original 350ml (Fardo c/ 12)", "FD", 15, 39.50, 592.50);

    // Pedido 5002: Em Separação no Estoque
    insertOrder.run(
      "ord_5002",
      5002,
      "cust_estrela",
      "sel_carlos",
      "VIP",
      1850.00,
      0.00,
      1850.00,
      "BOLETO_14_28_42",
      "SEPARATION",
      "Entrega prioritária antes das 11h para preparação do almoço.",
      now,
      now
    );
    insertItem.run("item_5002_1", "ord_5002", "prod_azeite_gallo", "ALI-001", "Azeite de Oliva Extra Virgem Gallo 500ml (Cx c/ 12)", "CX", 3, 365.00, 1095.00);
    insertItem.run("item_5002_2", "ord_5002", "prod_detergente_pro", "LIM-001", "Detergente Neutro Concentrado Galão 5 Litros (Cx c/ 4)", "CX", 5, 72.00, 360.00);

    // Pedido 5003: Faturado & Em Rota
    insertOrder.run(
      "ord_5003",
      5003,
      "cust_saojose",
      "sel_mariana",
      "STANDARD",
      980.00,
      30.00,
      950.00,
      "PIX_A_VISTA",
      "DISPATCHED",
      "Caminhão Rota Sul - Motorista Marcos.",
      now,
      now
    );
    insertItem.run("item_5003_1", "ord_5003", "prod_agua_cristal", "BEB-003", "Água Mineral Crystal sem Gás 500ml (Fardo c/ 12)", "FD", 25, 21.00, 525.00);
    insertItem.run("item_5003_2", "ord_5003", "prod_coca_lata", "BEB-002", "Refrigerante Coca-Cola Original 350ml (Fardo c/ 12)", "FD", 10, 44.00, 440.00);
  }
}
