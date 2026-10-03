import { Request, Response } from "express";
import { db } from "../db/database";

export const settingsController = {
  getSettings(req: Request, res: Response) {
    try {
      const rows = db.prepare("SELECT key, value FROM company_settings").all() as { key: string; value: string }[];
      const map: Record<string, string> = {};
      for (const r of rows) {
        map[r.key] = r.value;
      }
      return res.json(map);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      const updateStmt = db.prepare(`
        INSERT INTO company_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      const runTx = db.transaction(() => {
        for (const [key, value] of Object.entries(data)) {
          updateStmt.run(key, String(value));
        }
      });

      runTx();

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
