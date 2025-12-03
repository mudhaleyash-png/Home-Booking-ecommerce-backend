import ProductService from "../services/product.service.js";


/**
 * Controller layer for handling incoming HTTP requests and sending responses
 * for product-related actions.
 */
class ProductController {
/**
     * Handles the request to create a new product.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    static async create(req, res) {
        const { name, description, price, image_url, stock } = req.body;
        
        // The user ID is added to the request object by our authentication middleware.
        // This is why we need to protect this route.
        const userId = req.user.userId;

        // Basic request body validation. This is a crucial security step.
        if (!name || !description || !price || !stock) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, description, price, and stock.'
            });
        }

        try {
            // Call the service layer to perform the business logic.
            const newProduct = await ProductService.createProduct(
                name,  // watch
                description, // smart watch
                price,    //2000
                image_url, //dchsdjfgsj
                stock,     //5

                userId  // 2
            );

            // Send a success response. The 201 status code indicates a new resource was created.
            return res.status(201).json({
                success: true,
                message: 'Product created successfully!',
                product: newProduct,
            });
        } catch (error) {
            console.error('Error creating product:', error.message);
            // Return a generic server error to the client for security.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }

     /**
     * Handles the request to get all products.
     * This is a public endpoint, so no authentication is needed.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    static async getAll(req, res) {
        try {
            // Call the service layer to fetch all products.
            const products = await ProductService.getAllProducts();  //{} {product{name:"",desacsr}}
            
            // Send a success response with the product data.
            return res.status(200).json({
                success: true,
                message: 'Products fetched successfully!',
                products, //{} {product{name:"",desacsr}}
            });
        } catch (error) {
            console.error('Error fetching products:', error.message);
            // Return a generic server error.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }

    
     /**
     * Handles the request to get a single product by its ID.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    static async getById(req, res) {
        // The product ID is in the URL parameters. We access it with req.params.id.
        const { id } = req.params;   // 2

        try {
            // Call the service layer to fetch the product by its ID.
            const product = await ProductService.getProductById(id);  //2   //{name:watch} null

            // If the product is not found, return a 404 Not Found status.
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${id} not found.`
                });
            }

            // If the product is found, send a success response.
            return res.status(200).json({
                success: true,
                message: `Product with ID ${id} fetched successfully!`,
                product,
            });
        } catch (error) {
            console.error('Error fetching product by ID:', error.message);
            // Handle any server errors.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }

    
     /**
     * Handles the request to update an existing product.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    static async update(req, res) {
        // The product ID is in the URL parameters.
        const { id } = req.params;   //1

        // The updated data is in the request body.
        const updatedData = req.body;  //{name: "wrist-watch"}

        // The user ID is attached to the request by the authentication middleware.
        const userId = req.user.userId;   //2

        try {
            // Call the service layer to update the product.
            const affectedRows = await ProductService.updateProduct(id, updatedData, userId);     //1  {name: "wrist-watch"} 2    1

            // If no rows were affected, the product was not found or did not belong to the user.
            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${id} not found or you do not have permission to update it.`
                });
            }

            // If the update was successful, send a success response.
            return res.status(200).json({
                success: true,
                message: `Product with ID ${id} updated successfully!`,
            });
        } catch (error) {
            console.error('Error updating product:', error.message);
            // Handle any server errors.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }

     /**
     * Handles the request to delete a product.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    static async remove(req, res) {
        // The product ID is in the URL parameters.
        const { id } = req.params;    //4
        
        // The user ID is attached to the request by the authentication middleware.
        const userId = req.user.userId;   //1

        try {
            // Call the service layer to delete the product.
            const deletedRows = await ProductService.deleteProduct(id, userId);   //4   1     ----  1 or 0

            // If no rows were deleted, the product was not found or did not belong to the user.
            if (deletedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${id} not found or you do not have permission to delete it.`
                });
            }

            // If the deletion was successful, send a success response.
            // A 204 No Content status is often used for successful deletions.
            return res.status(204).json(); // Send a 204 response without a body
        } catch (error) {
            console.error('Error deleting product:', error.message);
            // Handle any server errors.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }


}

export default ProductController;