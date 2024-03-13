// routes/customers.js
import express from 'express';
import {
  createCustomerController,
  getAllCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deleteCustomerController,
} from '../controller/customerController.js';
import { verifyToken } from "../middlewares/authVerification.js";

const router = express.Router();

// Create a new customer
router.post("/customers", verifyToken,createCustomerController);

// Get all customers
router.get("/customers", verifyToken, getAllCustomersController);

// Get a specific customer by ID
router.get("/customers/:id",verifyToken, getCustomerByIdController);

// Update a customer by ID
router.put("/customers/:id",verifyToken, updateCustomerController);

// Delete a customer by ID
router.delete("/customers/:id", verifyToken,deleteCustomerController);

export default router;
