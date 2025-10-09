// This line imports the `OrderService` class from the `order.service.js` file.
// The controller uses the service to handle business logic and database interactions.
import OrderService from '../services/order.service.js';

/**
 * Controller layer for handling incoming HTTP requests and sending responses
 * for order-related actions.
 */
// This defines a JavaScript class named `OrderController`.
// It contains methods that correspond to different API endpoints for managing orders.
class OrderController {

    /**
     * Handles the request to create a new order.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    // This static method handles the HTTP request to create a new order.
    static async create(req, res) {
        // We get the `totalAmount` and the list of `items` from the request body.
        const { total_amount, items } = req.body;
        

        // The user ID is retrieved from `req.user.userId`.
        // This object is populated by a preceding authentication middleware that decodes a JWT.
        // This is a crucial step to link the order to a logged-in user.
        const userId = req.user.userId;

        // This is a basic validation check.
        // It ensures that `totalAmount` exists, `items` exists, `items` is an array, and the array is not empty.
        // If any of these conditions are not met, a `400 Bad Request` response is sent.
        if (!total_amount || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Total amount and at least one item are required to create an order.'
            });
        }

        // A `try...catch` block is used to handle potential errors that might occur during the process.
        try {
            // We call the `createOrder` method on the `OrderService` class.
            // The controller's job is to pass data from the request to the service layer, which contains the business logic.
            const newOrder = await OrderService.createOrder(userId, total_amount, items);

            // If the service call is successful, the controller sends a `201 Created` status code.
            // The response body is a JSON object confirming the action and including the new order data.
            return res.status(201).json({
                success: true,
                message: 'Order created successfully!',
                order: newOrder,
            });
        } catch (error) {
            // If an error occurs (e.g., insufficient stock, database error), this block runs.
            // It logs the error details to the console for internal debugging.
            console.error('Error creating order:', error.message);
            // We send a generic `500 Internal Server Error` response to the client for security reasons.
            // It's a good practice not to expose sensitive internal error details to the public.
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }


    /**
     * Handles the request to get all orders for the authenticated user.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    // This static method handles the `get all orders` request.
    static async getOrders(req, res) {
        // We get the user ID from the `req.user` object, which was populated by our authentication middleware.
        const userId = req.user.userId;

        try {
            // We call the `getOrdersByUserId` method on the `OrderService` to fetch the order data for the user.
            const orders = await OrderService.getOrdersByUserId(userId);

            // We send back a `200 OK` success response with the array of orders.
            return res.status(200).json({
                success: true,
                message: 'Orders fetched successfully!',
                orders: orders,
            });
        } catch (error) {
            // Standard error handling: log the error and send a generic `500` response.
            console.error('Error fetching orders:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }


    /**
     * Handles the request to delete a specific order.
     * @param {object} req - The Express request object.
     * @param {object} res - The Express response object.
     */
    // This static method handles the `delete` request for an order.
    static async remove(req, res) {
        // The `order ID` is passed in the URL parameters (`req.params`).
        const { id } = req.params;
        // The `user ID` is retrieved from the auth middleware.
        const userId = req.user.userId;

        // Basic validation to ensure the ID is present in the request.
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required to delete an order.'
            });
        }

        try {
            // We call the `deleteOrder` method on the service layer.
            // This method will perform the business logic (e.g., returning stock).
            const deletedRows = await OrderService.deleteOrder(id, userId);
                //variable

                // If the number of `deletedRows` is 0, it means the service couldn't find the order
            // or the `userId` didn't match the order's owner.
            if (deletedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or you do not have permission to delete this order.'
                });
            }

            // If a row was successfully "deleted" (or more accurately, the status was updated),
            // we send back a `200 OK` success response.
            return res.status(200).json({
                success: true,
                message: 'Order deleted successfully.'
            });
        } catch (error) {
            // Standard error handling: log the error and send a generic `500` response.
            console.error('Error deleting order:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }
    }
}

// This line exports the `OrderController` class, making its methods available for use in your Express routes.
export default OrderController;