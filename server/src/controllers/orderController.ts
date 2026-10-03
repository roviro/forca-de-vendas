import { Request, Response } from "express";
import { db } from "../db/database";

export const orderController = {
  createOrder(req: Request, res: Response) {
    try {
      const {
        customerId,
        sellerId,
        paymentMethod = "BOLETO_28_DAYS",
        notes,
        items
      } = req.body;

      if (!customerId || !sellerId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cliente, vendedor e itens do pedido são obrigatórios." });
      }

      // Valida cliente
      const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId) as any;
      if (!customer) return res.status(404).json({ error: "Cliente não encontrado." });
      if (customer.status === "BLOCKED") {
        return res.status(400).json({ error: "Cliente bloqueado para novas compras por pendência cadastral ou financeira." });
      }

      // Valida vendedor
      const seller = db.prepare("SELECT * FROM sellers WHERE id = ?").get(sellerId) as any;
      if (!seller) return res.status(404).json({ error: "Vendedor não encontrado." });

      // Calcula subtotal e monta itens com snapshot do produto
      let subtotal = 0;
      const preparedItems: any[] = [];

      for (const it of items) {
        const prod = db.prepare("SELECT * FROM products WHERE id = ?").get(it.productId) as any;
        if (!prod) return res.status(404).json({ error: `Produto ID ${it.productId} não encontrado.` });

        // Determina preço conforme tabela de preço do cliente se não for customizado
        let unitPrice = Number(it.unitPrice);
        if (!unitPrice || unitPrice <= 0) {
          if (customer.priceTable === "VIP") unitPrice = prod.priceVip;
          else if (customer.priceTable === "WHOLESALE") unitPrice = prod.priceWholesale;
          else unitPrice = prod.priceStandard;
        }

        const qty = Number(it.quantity);
        const lineTotal = qty * unitPrice;
        subtotal += lineTotal;

        preparedItems.push({
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          unit: prod.unit,
          quantity: qty,
          unitPrice,
          total: lineTotal
        });
      }

      const discount = Number(req.body.discount || 0);
      const total = Math.max(0, subtotal - discount);

      // Verificação de limite de crédito
      const availableCredit = customer.creditLimit - customer.creditUsed;
      const isCreditPayment = paymentMethod.startsWith("BOLETO");
      let initialStatus = "CREDIT_REVIEW";

      if (!isCreditPayment) {
        // Se for PIX à vista ou cartão, já pode ir direto para separação no estoque
        initialStatus = "SEPARATION";
      }

      // Gera número sequencial de pedido (#5001 em diante)
      const lastOrder = db.prepare("SELECT MAX(orderNumber) as maxNum FROM orders").get() as any;
      const orderNumber = (lastOrder?.maxNum || 5000) + 1;

      const orderId = `ord_b2b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      // Salva Pedido
      db.prepare(`
        INSERT INTO orders (
          id, orderNumber, customerId, sellerId, priceTable, subtotal, discount,
          total, paymentMethod, status, notes, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        orderNumber,
        customerId,
        sellerId,
        customer.priceTable,
        subtotal,
        discount,
        total,
        paymentMethod,
        initialStatus,
        notes ? notes.trim() : null,
        now,
        now
      );

      // Salva Itens
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, orderId, productId, sku, productName, unit, quantity, unitPrice, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of preparedItems) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        insertItem.run(
          itemId,
          orderId,
          item.productId,
          item.sku,
          item.productName,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.total
        );
      }

      // Atualiza crédito utilizado do cliente
      db.prepare("UPDATE customers SET creditUsed = creditUsed + ? WHERE id = ?").run(total, customerId);

      // Formata texto espelho para envio no WhatsApp do comprador
      const orderSummaryText = `📦 *PEDIDO B2B #${orderNumber}* — *Roviro Distribuidora*\n\n` +
        `🏢 *Cliente:* ${customer.tradeName} (${customer.cnpj})\n` +
        `👨‍💼 *Vendedor:* ${seller.name} (${seller.code})\n` +
        `💳 *Condição:* ${paymentMethod.replace(/_/g, " ")}\n` +
        `📊 *Tabela:* ${customer.priceTable}\n\n` +
        `🛒 *ITENS DO PEDIDO:*\n` +
        preparedItems.map((i) => `• ${i.quantity}x ${i.productName} (${i.unit}) - R$ ${i.unitPrice.toFixed(2)} = R$ ${i.total.toFixed(2)}`).join("\n") +
        `\n\n💰 *Subtotal:* R$ ${subtotal.toFixed(2)}\n` +
        (discount > 0 ? `🏷️ *Desconto:* R$ ${discount.toFixed(2)}\n` : "") +
        `🧾 *TOTAL FATURAMENTO: R$ ${total.toFixed(2)}*\n\n` +
        `📍 *Status:* ${initialStatus === "SEPARATION" ? "Aprovado / Em Separação" : "Em Análise de Crédito"}\n` +
        `Obrigado pela parceria comercial!`;

      return res.status(201).json({
        order: {
          id: orderId,
          orderNumber,
          customerName: customer.tradeName,
          sellerName: seller.name,
          total,
          status: initialStatus,
          items: preparedItems,
          createdAt: now
        },
        orderSummaryText,
        availableCreditAfterOrder: availableCredit - total
      });
    } catch (err: any) {
      console.error("[Order Controller] Erro ao criar pedido B2B:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  getAllOrders(req: Request, res: Response) {
    try {
      const { status, sellerId } = req.query;

      let query = `
        SELECT o.*, 
               c.tradeName as customerTradeName, 
               c.corporateName as customerCorporateName, 
               c.cnpj as customerCnpj, 
               c.phone as customerPhone,
               s.name as sellerName,
               s.code as sellerCode
        FROM orders o
        JOIN customers c ON o.customerId = c.id
        JOIN sellers s ON o.sellerId = s.id
      `;

      const params: any[] = [];
      const conditions: string[] = [];

      if (status && status !== "ALL") {
        conditions.push("o.status = ?");
        params.push(status);
      }

      if (sellerId && sellerId !== "ALL") {
        conditions.push("o.sellerId = ?");
        params.push(sellerId);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY o.orderNumber DESC";

      const orders = db.prepare(query).all(...params) as any[];
      const getItems = db.prepare("SELECT * FROM order_items WHERE orderId = ?");

      const ordersWithItems = orders.map((o) => ({
        ...o,
        items: getItems.all(o.id)
      }));

      return res.json(ordersWithItems);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      const prevStatus = order.status;
      const now = new Date().toISOString();

      // Se mudou para DISPATCHED e ainda não havia dado baixa no estoque, baixa o estoque físico
      if (status === "DISPATCHED" && prevStatus !== "DISPATCHED" && prevStatus !== "DELIVERED") {
        const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(id) as any[];
        const updateStock = db.prepare("UPDATE products SET stockQuantity = MAX(0, stockQuantity - ?) WHERE id = ?");

        for (const it of items) {
          updateStock.run(it.quantity, it.productId);
        }
      }

      // Se foi CANCELLED, libera crédito do cliente
      if (status === "CANCELLED" && prevStatus !== "CANCELLED") {
        db.prepare("UPDATE customers SET creditUsed = MAX(0, creditUsed - ?) WHERE id = ?").run(order.total, order.customerId);

        // Se já tinha despachado, devolve o estoque
        if (prevStatus === "DISPATCHED" || prevStatus === "DELIVERED") {
          const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(id) as any[];
          const restoreStock = db.prepare("UPDATE products SET stockQuantity = stockQuantity + ? WHERE id = ?");
          for (const it of items) {
            restoreStock.run(it.quantity, it.productId);
          }
        }
      }

      db.prepare("UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?").run(status, now, id);

      return res.json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = db.prepare(`
        SELECT o.*, 
               c.tradeName as customerTradeName, 
               c.corporateName as customerCorporateName, 
               c.cnpj as customerCnpj, 
               c.phone as customerPhone,
               c.address as customerAddress,
               s.name as sellerName,
               s.code as sellerCode,
               s.phone as sellerPhone
        FROM orders o
        JOIN customers c ON o.customerId = c.id
        JOIN sellers s ON o.sellerId = s.id
        WHERE o.id = ?
      `).get(id) as any;

      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(id);

      return res.json({
        order: {
          ...order,
          items
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
