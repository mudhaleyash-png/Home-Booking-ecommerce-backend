// This line imports the `sequelize` object, which is your database connection instance.
// It's used to manage database-level operations, like creating transactions.
import sequelize from "../../database/connection.js";

// These lines import the database models (tables) that your service will interact with.
// Each model represents a table in your database.
import Order from "../../database/models/order.model.js";
import OrderItem from "../../database/models/order_item.model.js";
import Product from "../../database/models/product.model.js";


/**
 * Service layer for all order-related business logic.
 * This layer directly interacts with the database models.
 */
// This defines the `OrderService` class, which encapsulates all the logic related to orders.
class OrderService {
  /**
   * Creates a new order and its associated order items.
   * @param {number} userId - The ID of the user placing the order.
   * @param {number} total_amount - The total cost of the order.
   * @param {array} items - An array of objects, each containing product details and quantity.
   * @returns {object} The newly created order object with its items.
   */
  // This is a static method that creates a new order.
  static async createOrder(userId, total_amount, items) {
    // These lines are for logging and debugging, showing the start of the process and the data being used.
    console.log("Starting createOrder transaction...");
    console.log("Items to process:", items);
    
    // A `try...catch` block is used to handle potential errors during the transaction.
    try {
      // This is the start of a database transaction. A transaction ensures that a series of
      // database operations are treated as a single, atomic unit. If any part of the transaction
      // fails, the entire operation is rolled back, preventing partial data changes.
      const result = await sequelize.transaction(async (t) => {
        // Step 1: Check and update the stock for each product in the order.
        // The `for...of` loop iterates over each item in the `items` array.
        for (const item of items) {
          // Log the current item being processed.
          console.log(`Processing item: productId=${item.productId}, quantity=${item.quantity}`);
          // `Product.findByPk` finds a `Product` by its primary key (`productId`) within the transaction (`{ transaction: t }`).
          const product = await Product.findByPk(item.productId, { transaction: t });
          // Log the found product and its current stock for debugging.
          console.log("Found product:", product ? product.name : 'null');
          console.log("Product current stock:", product ? product.stock : 'N/A');

          // This is a crucial validation step. It checks if the product exists (`!product`)
          // and if there's enough stock to fulfill the order quantity (`product.stock < item.quantity`).
          if (!product || product.stock < item.quantity) {
            // If the check fails, it logs an error and throws a new `Error`.
            // Throwing an error inside the transaction's callback function will automatically roll back the entire transaction.
            console.error(`Insufficient stock for product ID ${item.productId}. Required: ${item.quantity}, Available: ${product?.stock || 0}`);
            throw new Error(`Insufficient stock for product ID ${item.productId}.`);
          }

          // `product.decrement` is a built-in Sequelize method that atomically decreases a field.
          // It safely reduces the `stock` by the ordered `quantity`, preventing race conditions.
          await product.decrement('stock', { by: item.quantity, transaction: t });
          // Log the stock update for debugging.
          console.log(`Decremented stock for product ${product.name} by ${item.quantity}. New stock will be: ${product.stock - item.quantity}`);
        }

        // Step 2: Create the main order record.
        // `Order.create` creates a new record in the `orders` table.
        // `transaction: t` ensures this operation is part of the current transaction.
        const newOrder = await Order.create({
          userId,
          total_amount,
          status: "pending", // A default status for a new order.
        }, { transaction: t });

        // Step 3: Prepare the order items for bulk creation.
        // The `map` function transforms each item in the input `items` array into a new object
        // that's structured correctly for the `OrderItem` model.
        const orderItems = items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        }));

        // Step 4: Create the order items in a single, efficient database operation.
        // `OrderItem.bulkCreate` is highly optimized for inserting many records at once.
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        // Step 5: Return the complete order object with the newly created items.
        // `newOrder.get({ plain: true })` converts the Sequelize instance into a plain JavaScript object.
        // We use the spread operator (`...`) to merge the order details with the created items.
        return {
          ...newOrder.get({ plain: true }),
         // items: createdOrderItems.map((item) => item.get({ plain: true })),
        };
      });
      // Log a success message.
      console.log("createOrder transaction finished successfully.");
      // Return the result from the successful transaction.
      return result;
    } catch (error) {
      // If an error occurs, it's logged to the console.
      console.error("Error in createOrder transaction:", error.message);
      // The error is re-thrown so that the calling function (the controller) can handle it.
      throw error;
    }
  }

  /**
   * Retrieves all orders for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {array} An array of order objects belonging to the user.
   */
  // This static method fetches all orders for a given user.
  static async getOrdersByUserId(userId) {
    // `Order.findAll` finds all records that match the specified criteria.
    // `where: { userId }` filters the results to only include orders for this user.
    // `include` is used for eager loading, fetching related data in a single query.
    // We include `OrderItem`s (`as: "items"`) and then, within those items, we include the `Product` details (`as: "product"`).
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "items",

          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
      // `order: [["createdAt", "DESC"]]` sorts the results by the `createdAt` timestamp in descending order,
      // which means the newest orders appear first.
      order: [["createdAt", "DESC"]],
    });
    // The found orders (an array) are returned.
    return orders;
  }

  /**
   * Deletes a specific order and its items, but only if the user is the owner.
   * @param {number} orderId - The ID of the order to delete.
   * @param {number} userId - The ID of the authenticated user.
   * @returns {number} The number of orders deleted (should be 1 or 0).
   */
  // This static method handles "deleting" or, more accurately, canceling an order.
  static async deleteOrder(orderId, userId) {
  // Log the start of the transaction.
  console.log("Starting cancelOrder transaction...");
  try {
    // Start the transaction.
    const result = await sequelize.transaction(async (t) => {
      // Step 1: Find the order. The `where` clause checks both `id` and `userId` for security.
      // This ensures that a user can only "delete" their own orders.
      const order = await Order.findOne({
        where: { id: orderId, userId: userId },
        transaction: t,
      });

      // If no order is found or the user doesn't own it, return `0` to indicate no action was taken.
      if (!order) {
        console.error("Order not found or user is not the owner.");
        return 0;
      }

      // Step 2: Find all order items associated with this order.
      const orderItems = await OrderItem.findAll({
        where: { orderId: orderId },
        transaction: t,
      });

      // Step 3: Return stock for each product in the order.
      // A loop iterates over the `orderItems` and increments the stock for each product.
      for (const item of orderItems) {
        // Find the product record.
        const product = await Product.findByPk(item.productId, { transaction: t });
        // If the product exists, increment its stock by the quantity from the order item.
        if (product) {
          await product.increment('stock', { by: item.quantity, transaction: t });
          console.log(`Incremented stock for product ${product.name} by ${item.quantity}.`);
        }
      }

      // Step 4: Update the order status to "canceled".
      // We use `Order.update` to change the `status` field.
      // The `where` clause acts as an additional safeguard.
      const rowsUpdated = await Order.update(
        { status: "canceled" }, // <-- The new value for the `status` field.
        {
          where: { id: orderId, userId: userId },
          transaction: t,
        }
      );
      // Log the number of rows updated for debugging.
      console.log(`Order status changed to canceled. Rows affected: ${rowsUpdated[0]}.`);

      // `rowsUpdated` is an array where the first element is the number of rows affected.
      // We return this number.
      return rowsUpdated[0];
    });

    // Log the successful completion of the transaction.
    console.log("cancelOrder transaction finished successfully.");
    // Return the final result.
    return result;
  } catch (error) {
    // Log the error and re-throw it.
    console.error("Error in cancelOrder transaction:", error.message);
    throw error;
  }
}

}

// This line exports the `OrderService` class, making it available for other parts of your application (like controllers) to import and use.
export default OrderService;