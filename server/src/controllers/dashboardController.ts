import { Request, Response } from "express";
import { db } from "../db/database";

export const dashboardController = {
  getMetrics(req: Request, res: Response) {
    try {
      const orders = db.prepare("SELECT * FROM orders WHERE status != 'CANCELLED'").all() as any[];

      let totalSales = 0;
      const ordersByStatus: Record<string, number> = {
        CREDIT_REVIEW: 0,
        SEPARATION: 0,
        DISPATCHED: 0,
        DELIVERED: 0,
        CANCELLED: 0
      };

      const allOrdersWithCancelled = db.prepare("SELECT status, COUNT(*) as count FROM orders GROUP BY status").all() as any[];
      for (const row of allOrdersWithCancelled) {
        ordersByStatus[row.status] = row.count;
      }

      for (const o of orders) {
        totalSales += o.total;
      }

      const totalOrdersCount = orders.length;
      const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

      // Meta Mensal
      const goalSetting = db.prepare("SELECT value FROM company_settings WHERE key = 'monthly_sales_goal'").get() as any;
      const monthlyGoal = goalSetting ? parseFloat(goalSetting.value) : 150000;
      const goalProgressPercent = monthlyGoal > 0 ? (totalSales / monthlyGoal) * 100 : 0;

      // Ranking de Vendedores
      const sellersRanking = db.prepare(`
        SELECT s.id, s.name, s.code, s.commissionRate,
               COUNT(o.id) as ordersCount,
               COALESCE(SUM(o.total), 0) as totalSold,
               COALESCE(SUM(o.total * (s.commissionRate / 100.0)), 0) as commissionEarned
        FROM sellers s
        LEFT JOIN orders o ON s.id = o.sellerId AND o.status != 'CANCELLED'
        GROUP BY s.id
        ORDER BY totalSold DESC
      `).all() as any[];

      // Alertas de Estoque Baixo
      const lowStockProducts = db.prepare(`
        SELECT id, sku, name, category, unit, stockQuantity, minStock
        FROM products
        WHERE status = 'ACTIVE' AND stockQuantity <= minStock
        ORDER BY (stockQuantity - minStock) ASC
      `).all() as any[];

      return res.json({
        totalSales,
        totalOrdersCount,
        averageTicket,
        monthlyGoal,
        goalProgressPercent,
        ordersByStatus,
        sellersRanking,
        lowStockProducts
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
