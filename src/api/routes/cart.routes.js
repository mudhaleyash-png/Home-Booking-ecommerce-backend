import express from 'express'
import authenticateToken from '../middleware/auth.middleware.js';
import CartController from '../controllers/cart.controller.js';


// Create an Express Router instance
const router = express.Router();

/**
 * @description: Defines the API endpoints for cart operations.
 * @route POST /api/cart/add
 * This route is protected by the `authenticateToken` middleware.
 */
router.post('/add', authenticateToken, CartController.addItem);


/**
 * @description: Defines the API endpoints for cart operations.
 * @route GET /api/cart/all
 * This route is protected by the `authenticateToken` middleware.
 */
router.get('/all', authenticateToken, CartController.getCartItems);


/**
 * @description: Defines the API endpoints for cart operations.
 * @route PUT /api/cart/update/:cartItemId
 * This route is protected by the `authenticateToken` middleware.
 */
router.put('/update/:cartItemId', authenticateToken, CartController.updateItem);

/**
 * @description: Defines the API endpoints for cart operations.
 * @route DELETE /api/cart/remove/:cartItemId
 * This route is protected by the `authenticateToken` middleware.
 */
router.delete('/remove/:cartItemId', authenticateToken, CartController.removeItem);


/**
 * @description: Defines the API endpoints CHeckout the cart.
 * @route POST /api/cart/checkout
 * This route is protected by the `authenticateToken` middleware.
 */
router.post('/checkout', authenticateToken, CartController.checkout);

export default router;
