import { Request, Response } from "express";
import { db } from "../db/database";

export const productController = {
  getAllProducts(req: Request, res: Response) {
    try {
      const { category, search } = req.query;

      let query = "SELECT * FROM products WHERE status = 'ACTIVE'";
      const params: any[] = [];

      if (category && category !== "ALL") {
        query += " AND category = ?";
        params.push(category);
      }

      if (search) {
        query += " AND (name LIKE ? OR sku LIKE ?)";
        const term = `%${search}%`;
        params.push(term, term);
      }

      query += " ORDER BY name ASC";

      const products = db.prepare(query).all(...params) as any[];

      const formatted = products.map((p) => ({
        ...p,
        isLowStock: p.stockQuantity <= p.minStock
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  adjustStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newQuantity } = req.body;

      if (newQuantity === undefined || isNaN(Number(newQuantity))) {
        return res.status(400).json({ error: "Quantidade inválida." });
      }

      db.prepare("UPDATE products SET stockQuantity = ? WHERE id = ?").run(Number(newQuantity), id);

      const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
      return res.json({ success: true, product: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  createProduct(req: Request, res: Response) {
    try {
      const {
        sku,
        name,
        category,
        unit = "CX",
        stockQuantity = 0,
        minStock = 10,
        priceStandard,
        priceWholesale,
        priceVip,
        image
      } = req.body;

      if (!sku || !name || !category || !priceStandard) {
        return res.status(400).json({ error: "SKU, nome, categoria e preço padrão são obrigatórios." });
      }

      const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO products (
          id, sku, name, category, unit, stockQuantity, minStock,
          priceStandard, priceWholesale, priceVip, image, status, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
      `).run(
        id,
        sku.toUpperCase().trim(),
        name.trim(),
        category.trim(),
        unit.toUpperCase().trim(),
        Number(stockQuantity),
        Number(minStock),
        Number(priceStandard),
        Number(priceWholesale || priceStandard * 0.92),
        Number(priceVip || priceStandard * 0.88),
        image ? image.trim() : null,
        now
      );

      const created = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getCategories(req: Request, res: Response) {
    try {
      const cats = db.prepare("SELECT DISTINCT category FROM products WHERE status = 'ACTIVE' ORDER BY category ASC").all() as any[];
      return res.json(cats.map((c) => c.category));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
