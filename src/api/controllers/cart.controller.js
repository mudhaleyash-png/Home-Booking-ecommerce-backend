// This line imports the `CartService` class from the `cart.service.js` file.
// The controller uses the service to handle business logic and database interactions.
import CartService from "../services/cart.service.js";

/**
 * @description Controller for all cart-related operations.
 * This layer handles incoming HTTP requests and sends responses.
 */
// This defines a JavaScript class named `CartController`.
// It contains methods that correspond to different API endpoints for managing the cart.
class CartController {
  /**
   * @description Adds a product to the authenticated user's cart.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  // This static method handles the HTTP request to add an item.
  // It's the entry point from a web client.
  static async addItem(req, res) {
    // A `try...catch` block is used for error handling.
    // If any code inside the `try` block throws an error, the `catch` block will handle it.
    try {
      // Get the user ID from the `req.user` object. This object is populated by a
      // preceding middleware that authenticates the user, typically by decoding a JWT.
      const userId = req.user.userId;
      // This line prints the user ID to the console, useful for debugging.
      console.log("User ID from token from cart:", userId);
      // Destructure the `productId` and `quantity` from the request body (`req.body`).
      const { productId, quantity } = req.body;

      // This is a crucial step: the controller calls a method on the `CartService` class.
      // The controller's job is to get data from the request and pass it to the service.
      // It doesn't handle the database logic itself.
      const cartItem = await CartService.addItem({
        userId,
        productId,
        quantity,
      });

      // If the service call is successful, the controller sends a `201 Created` status code.
      // The response body is a JSON object confirming the action and including the newly created or updated `cartItem`.
      res.status(201).json({
        message: "Product added to cart successfully.",
        cartItem,
      });
    } catch (error) {
      // If an error occurs (e.g., product not found, database error), this block runs.
      // It logs the error details to the console for internal debugging.
      console.error("Error adding item to cart:", error);
      // An error response is sent to the client with a `500 Internal Server Error` status.
      // The response body includes a user-friendly message and the specific error message from the thrown error.
      res.status(500).json({
        message: "Failed to add item to cart.",
        error: error.message,
      });
    }
  }

  /**
   * @description Retrieves the authenticated user's cart with all items.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  // This static method handles the `get cart items` request.
  static async getCartItems(req, res) {
    try {
      // Get the user ID from the token, just like in the `addItem` method.
      const userId = req.user.userId;

      // Call the `getCartItems` method on the `CartService` to fetch the cart data.
      const cart = await CartService.getCartItems(userId);

      // This checks if the service returned a cart. If `cart` is null or undefined,
      // it means the user doesn't have a cart.
      if (!cart) {
        // A `404 Not Found` status is sent with a message indicating the cart is empty.
        return res.status(404).json({ message: "Cart not found or is empty." });
      }

      // If a cart is found, a `200 OK` status is sent with the cart data in the response body.
      res.status(200).json({ cart });
    } catch (error) {
      // Standard error handling: log the error and send a `500` response.
      console.error("Error getting cart items:", error);
      res.status(500).json({
        message: "Failed to retrieve cart items.",
        error: error.message,
      });
    }
  }

  /**
   * @description Updates the quantity of a specific item in the authenticated user's cart.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  // This method updates the quantity of an item.
  static async updateItem(req, res) {
    try {
      // Get the user ID.
      const userId = req.user.userId;
      // Get the `cartItemId` from the URL parameters (`req.params`).
      const { cartItemId } = req.params;
      // Get the `quantity` from the request body.
      const { quantity } = req.body;

      // This is basic validation. If the `quantity` is not a positive number,
      // we send a `400 Bad Request` error.
      if (quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be a positive number." });
      }

      // Call the `updateItem` service method, passing the necessary data.
      const updatedItem = await CartService.updateItem({
        userId,
        cartItemId,
        newQuantity: quantity,
      });

      // If the update is successful, send a `200 OK` response with the updated item.
      res.status(200).json({
        message: "Cart item updated successfully.",
        updatedItem,
      });
    } catch (error) {
      // Standard error handling.
      console.error("Error updating cart item:", error);
      res.status(500).json({
        message: "Failed to update cart item.",
        error: error.message,
      });
    }
  }

  /**
   * @description Deletes a specific item from the authenticated user's cart.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  // This method handles deleting an item.
  static async removeItem(req, res) {
    try {
      // Get the user ID.
      const userId = req.user.userId;
      // Get the `cartItemId` from the URL parameters.
      const { cartItemId } = req.params;

      // Call the `deleteItem` service method. We don't need to capture the return value here
      // because the service handles all the logic and error checking.
      await CartService.deleteItem({ userId, cartItemId });

      // If the service call completes without an error, send a `200 OK` success message.
      res.status(200).json({
        message: "Cart item removed successfully.",
      });
    } catch (error) {
      // Standard error handling.
      console.error("Error removing cart item:", error);
      res.status(500).json({
        message: "Failed to remove cart item.",
        error: error.message,
      });
    }
  }

  /**
   * @description: Handles the checkout process for a user's cart.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   * @returns {object} The HTTP response with the newly created order.
   */
  // This is the checkout method.
  static async checkout(req, res) {
    try {
      // Get the user ID.
      const userId = req.user.userId;

      // Call the `checkout` service method to perform all the complex checkout logic.
      // This method will handle creating the order, clearing the cart, and updating product stock.
      const newOrder = await CartService.checkout(userId);

      // If the checkout is successful, send a `200 OK` response with a success message and the new order details.
      return res.status(200).json({
        success: true,
        message: "Checkout successful. Your order has been placed.",
        data: newOrder,
      });
    } catch (error) {
      // Handle any errors that occur during the checkout process.
      console.error("Error during checkout:", error);
      // Send a `500 Internal Server Error` response.
      // The message will either be the error message from the service (e.g., "Cart is empty")
      // or a generic error message.
      return res.status(500).json({
        success: false,
        message: error.message || "An error occurred during checkout.",
      });
    }
  }
}

// This line exports the `CartController` class, making its methods available for use in your Express routes.
export default CartController;
