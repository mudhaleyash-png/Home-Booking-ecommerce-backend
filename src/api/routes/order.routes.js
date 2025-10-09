import express from 'express';
import OrderController from '../controllers/order.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';


// Create an Express Router instance to define our routes.
const router = express.Router();

/**
 * @description: API endpoint to create a new order.
 * @route POST /api/orders/create
 * This route is protected by the `authenticateToken` middleware.
 * A valid JWT must be provided in the request headers to access this endpoint.
 */
router.post('/create', authenticateToken, OrderController.create);


/**
 * @description: API endpoint to get all orders for the authenticated user.
 * @route GET /api/orders/all
 * This route is protected by `authenticateToken` because we need the user's ID
 * to fetch their specific orders.
 */
router.get('/all', authenticateToken, OrderController.getOrders);


/**
 * @description: API endpoint to delete a specific order.
 * @route DELETE /api/orders/delete/:id
 * This route is protected to ensure only the owner of the order can delete it.
 * The `:id` is a dynamic URL parameter that captures the order ID.
 */
router.delete('/delete/:id', authenticateToken, OrderController.remove);


export default router;