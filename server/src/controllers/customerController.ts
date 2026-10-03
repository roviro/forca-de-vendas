import { Request, Response } from "express";
import { db } from "../db/database";

export const customerController = {
  getAllCustomers(req: Request, res: Response) {
    try {
      const { search, sellerId } = req.query;

      let query = `
        SELECT c.*, s.name as sellerName, s.code as sellerCode
        FROM customers c
        LEFT JOIN sellers s ON c.sellerId = s.id
      `;

      const params: any[] = [];
      const conditions: string[] = [];

      if (search) {
        conditions.push("(c.tradeName LIKE ? OR c.corporateName LIKE ? OR c.cnpj LIKE ?)");
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      if (sellerId && sellerId !== "ALL") {
        conditions.push("c.sellerId = ?");
        params.push(sellerId);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY c.tradeName ASC";

      const customers = db.prepare(query).all(...params) as any[];

      const formatted = customers.map((c) => ({
        ...c,
        availableCredit: Math.max(0, c.creditLimit - c.creditUsed),
        creditUsagePercent: c.creditLimit > 0 ? (c.creditUsed / c.creditLimit) * 100 : 0
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  createCustomer(req: Request, res: Response) {
    try {
      const {
        corporateName,
        tradeName,
        cnpj,
        phone,
        email,
        address,
        creditLimit = 10000,
        priceTable = "STANDARD",
        sellerId
      } = req.body;

      if (!corporateName || !tradeName || !cnpj || !phone || !address) {
        return res.status(400).json({ error: "Razão social, nome fantasia, CNPJ, telefone e endereço são obrigatórios." });
      }

      const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO customers (
          id, corporateName, tradeName, cnpj, phone, email, address,
          creditLimit, creditUsed, priceTable, sellerId, status, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'ACTIVE', ?)
      `).run(
        id,
        corporateName.trim(),
        tradeName.trim(),
        cnpj.trim(),
        phone.trim(),
        email ? email.trim() : null,
        address.trim(),
        Number(creditLimit),
        priceTable,
        sellerId || "sel_carlos",
        now
      );

      const created = db.prepare("SELECT * FROM customers WHERE id = ?").get(id);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateCreditLimit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { creditLimit, priceTable, status } = req.body;

      const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as any;
      if (!customer) return res.status(404).json({ error: "Cliente não encontrado." });

      const newLimit = creditLimit !== undefined ? Number(creditLimit) : customer.creditLimit;
      const newTable = priceTable || customer.priceTable;
      const newStatus = status || customer.status;

      db.prepare(`
        UPDATE customers 
        SET creditLimit = ?, priceTable = ?, status = ?
        WHERE id = ?
      `).run(newLimit, newTable, newStatus, id);

      return res.json({ success: true, customer: db.prepare("SELECT * FROM customers WHERE id = ?").get(id) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getSellers(req: Request, res: Response) {
    try {
      const sellers = db.prepare("SELECT * FROM sellers ORDER BY name ASC").all();
      return res.json(sellers);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
