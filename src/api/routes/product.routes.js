import express from 'express';
import authenticateToken from '../middleware/auth.middleware.js';
import ProductController from '../controllers/product.controller.js';


// Create an Express Router instance to define our routes
const router = express.Router();

/**
 * @description: API endpoint to create a new product.
 * @route POST /api/products/create
 * This route is protected by the `authenticateToken` middleware.
 * A valid JWT must be provided in the request headers to access this endpoint.
 */
router.post('/create', authenticateToken, ProductController.create);

/**
 * @description: API endpoint to fetch all products.
 * @route GET /api/products/all
 * This is a public route, so no authentication is needed.
 */
router.get('/all', ProductController.getAll);


/**
 * @description: API endpoint to fetch a single product by its ID.
 * @route GET /api/products/:id
 * The `:id` in the URL is a dynamic parameter that will be passed to the controller.
 * This is a public route, so no authentication is needed.
 */
router.get('/:id', ProductController.getById);


/**
 * @description: API endpoint to update a product by its ID.
 * @route PUT /api/products/update/:id
 * This route is protected by the `authenticateToken` middleware.
 * Only the owner of the product can update it.
 */
router.put('/update/:id', authenticateToken, ProductController.update);


/**
 * @description: API endpoint to delete a product by its ID.
 * @route DELETE /api/products/delete/:id
 * This route is protected by the `authenticateToken` middleware.
 * Only the owner of the product can delete it.
 */
router.delete('/delete/:id', authenticateToken, ProductController.remove);



export default router;