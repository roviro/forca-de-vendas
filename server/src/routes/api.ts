import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { productController } from "../controllers/productController";
import { customerController } from "../controllers/customerController";
import { dashboardController } from "../controllers/dashboardController";
import { settingsController } from "../controllers/settingsController";

export const apiRouter = Router();

// Pedidos B2B
apiRouter.get("/orders", orderController.getAllOrders);
apiRouter.post("/orders", orderController.createOrder);
apiRouter.get("/orders/:id", orderController.getOrderById);
apiRouter.patch("/orders/:id/status", orderController.updateOrderStatus);

// Produtos & Estoque
apiRouter.get("/products", productController.getAllProducts);
apiRouter.post("/products", productController.createProduct);
apiRouter.patch("/products/:id/stock", productController.adjustStock);
apiRouter.get("/categories", productController.getCategories);

// Clientes PJ & Vendedores
apiRouter.get("/customers", customerController.getAllCustomers);
apiRouter.post("/customers", customerController.createCustomer);
apiRouter.patch("/customers/:id/credit", customerController.updateCreditLimit);
apiRouter.get("/sellers", customerController.getSellers);

// Dashboard Matriz & Indicadores
apiRouter.get("/dashboard", dashboardController.getMetrics);

// Configurações da Empresa
apiRouter.get("/settings", settingsController.getSettings);
apiRouter.post("/settings", settingsController.updateSettings);
