// This line imports the `sequelize` object, which is your database connection instance.
// It's used to manage database-level operations, like creating transactions.
import sequelize from "../../database/connection.js";

// These lines import the database models (tables) that your service will interact with.
// Each model represents a table in your database.
import Cart from "../../database/models/cart.model.js";
import CartItem from "../../database/models/cart_item.model.js";
import Order from "../../database/models/order.model.js";
import OrderItem from "../../database/models/order_item.model.js";
import Product from "../../database/models/product.model.js";

/**
 * @description Service layer for all cart-related business logic.
 * This layer interacts directly with the database models.
 */
// This defines a JavaScript class named `CartService`.
// A class is a blueprint for creating objects and methods that handle a specific set of responsibilities.
// Here, it encapsulates all the logic related to the shopping cart.
class CartService {
  /**
   * @description Adds an item to a user's cart or updates the quantity if it already exists.
   * @param {object} data - An object containing all the cart item details.
   * @param {string} data.userId - The unique ID of the user.
   * @param {number} data.productId - The unique ID of the product to add.
   * @param {number} data.quantity - The quantity of the product.
   * @returns {object} The cart item that was added or updated.
   */
  // This is a static method `addItem`. `static` means you can call it directly on the class
  // without creating an instance of the class (e.g., `CartService.addItem(...)`).
  static async addItem(data) {
    // This is the start of a database transaction. A transaction ensures that a series of
    // database operations are treated as a single, atomic unit. If any part of the transaction
    // fails, the entire transaction is rolled back, preventing partial data changes.
    const result = await sequelize.transaction(async (t) => {
      // `Cart.findOrCreate` attempts to find a cart for the specified `userId`.
      // If a cart for that user doesn't exist, it creates a new one.
      // It returns an array: `[cart, created]`.
      // `cart` is the `Cart` instance (either found or created).
      // `created` is a boolean that is `true` if a new cart was created, `false` otherwise.
      // `include: [{ model: CartItem, as: "items" }]` tells Sequelize to also fetch any associated `CartItem` records.
      // `transaction: t` links this operation to the current transaction.
      const [cart, created] = await Cart.findOrCreate({
        where: { userId: data.userId },
        include: [{ model: CartItem, as: "items" }],
        transaction: t,
      });

      // `Product.findByPk` finds a `Product` by its primary key (`productId`).
      // It's used here to confirm that the product the user is trying to add actually exists.
      // `transaction: t` links this operation to the transaction.
      const product = await Product.findByPk(data.productId, {
        transaction: t,
      });  //watch or //null

      // This is a simple validation check. If `product` is null, it means `findByPk` didn't find a product.
      // We throw an `Error`, which will cause the entire transaction to be rolled back.
      if (!product) {
        throw new Error("Product not found.");
      }

      // `CartItem.findOne` searches for an existing `CartItem` record.
      // It checks if a product with `data.productId` already exists in the current `cart` (`cart.id`).
      // `transaction: t` links this operation to the transaction.
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId: data.productId },
        transaction: t,
      });

      // This `if` block handles the case where the item already exists in the cart.
      if (existingItem) {
        // `existingItem.increment` is an atomic operation that safely adds `data.quantity`
        // to the current `quantity` of the `existingItem` record in the database.
        // `transaction: t` ensures this is part of our transaction.
        await existingItem.increment("quantity", {  //.increment() is method
          by: data.quantity,
          transaction: t,
        });
        // After incrementing, we fetch the item again to get the updated values.
        // This is necessary because `increment` doesn't return the updated model instance.
        // `include` is used to get the associated `Product` details for the response.
        const updatedItem = await CartItem.findByPk(existingItem.id, {
          transaction: t,
          include: [{ model: Product, as: "product" }],
        });
        // We return the updated item, which will be the final result of the transaction.
        return updatedItem;
      } else {
        // This `else` block handles the case where the item is not yet in the cart.
        // `CartItem.create` creates a new record in the `cart_items` table.
        // We provide the `cartId`, `productId`, and `quantity`.
        // `transaction: t` links this operation to the transaction.
        const newItem = await CartItem.create( //.create() used to add new record
          {
            cartId: cart.id,
            productId: data.productId,
            quantity: data.quantity,
          },
          { transaction: t }
        );
        // Similar to the update, we fetch the newly created item again to include its associated product details.
        const createdItemWithProduct = await CartItem.findByPk(newItem.id, {
          transaction: t,
          include: [{ model: Product, as: "product" }],
        });
        // We return the new item, which will be the final result of the transaction.
        return createdItemWithProduct;
      }
    });

    // This line returns the final result from the successful transaction.
    return result;
  }

  // ---

  /**
   * @description Retrieves all items from a user's cart.
   * @param {string} userId - The unique ID of the user.
   * @returns {object} The user's cart with all of its items.
   */
  // This is a static method to get a user's cart contents.
  static async getCartItems(userId) {
    // `Cart.findOne` finds a single `Cart` record that matches the `userId`.
    // The `include` option is used to eagerly load related data.
    // We include `CartItem` records (`as: "items"`) that belong to this cart.
    // Within that `CartItem` include, we further include the `Product` details (`as: "product"`) for each item.
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    // If `cart` is null, it means no cart was found for that user.
    if (!cart) {
      return null;
    }

    // Returns the found cart object, which now contains an array of its items, and each item has its product details.
    return cart;
  }

  // ---

  /**
   * @description Updates the quantity of a specific item in the user's cart.
   * @param {object} data - An object containing the update details.
   * @param {string} data.userId - The unique ID of the user.
   * @param {number} data.cartItemId - The unique ID of the cart item to update.
   * @param {number} data.newQuantity - The new quantity for the item.
   * @returns {object} The updated cart item.
   */
  // This static method updates the quantity of a single item in the cart.
  static async updateItem(data) {
    // Starts a transaction for atomicity.
    const result = await sequelize.transaction(async (t) => {
      // `CartItem.findByPk` finds the specific cart item by its ID.
      // The `include` part is a crucial security check: it ensures that the `Cart` associated with this `CartItem`
      // belongs to the `userId` provided in the data. If the user ID doesn't match, `cartItem` will be null.
      const cartItem = await CartItem.findByPk(data.cartItemId, {
        include: [
          {
            model: Cart,
            as: "cart",
            where: { userId: data.userId },
          },
        ],
        transaction: t,
      });

      // If the item wasn't found or the user doesn't own it, we throw an error.
      if (!cartItem) {
        throw new Error("Cart item not found or does not belong to the user.");
      }

      // `cartItem.update` changes the `quantity` of the item in the database to `data.newQuantity`.
      // `transaction: t` links this to the transaction.
      await cartItem.update({ quantity: data.newQuantity }, { transaction: t });

      // We re-fetch the item to get the updated values along with product details for the final response.
      const updatedItemWithProduct = await CartItem.findByPk(cartItem.id, {
        include: [{ model: Product, as: "product" }],
        transaction: t,
      });

      // Returns the updated item.
      return updatedItemWithProduct;
    });

    // Returns the final result of the transaction.
    return result;
  }

  // ---

  /**
   * @description Deletes a specific item from the authenticated user's cart.
   * @param {object} data - An object containing the delete details.
   * @param {string} data.userId - The unique ID of the user.
   * @param {number} data.cartItemId - The unique ID of the cart item to delete.
   * @returns {boolean} A boolean indicating if the deletion was successful.
   */
  // This static method handles deleting an item from the cart.
  static async deleteItem(data) {
    // Starts a transaction.
    const result = await sequelize.transaction(async (t) => {
      // Finds the cart item to delete. The `include` with the `where` clause acts as a security check
      // to ensure the user owns the item.
      const cartItem = await CartItem.findByPk(data.cartItemId, {
        include: [
          {
            model: Cart,
            as: "cart",
            where: { userId: data.userId },
          },
        ],
        transaction: t,
      });

      // If the item doesn't exist or isn't owned by the user, we throw an error.
      if (!cartItem) {
        throw new Error("Cart item not found or does not belong to the user.");
      }

      // `cartItem.destroy` deletes the record from the database.
      // It returns the number of rows affected (which should be 1 if successful).
      const deleted = await cartItem.destroy({ transaction: t });   //destroy() method       //0    //1
                            //variable
      // We return `true` if a row was deleted (`deleted > 0`), otherwise `false`.
      return deleted > 0;
    });

    // Returns the final result.
    return result; // if 0 its false //if 1 its true
  }

  // ---

  /**
   * @description: Handles the checkout process by creating a new order from a user's cart.
   * @param {number} userId - The ID of the user checking out.
   * @returns {Promise<object>} The newly created order object.
   */
  // This static method handles the complex checkout process.
  static async checkout(userId) {
    // Starts a transaction to ensure all steps of the checkout process are atomic.
    const result = await sequelize.transaction(async (t) => {
      // 1. Find the user's cart and all its items, including product details.
      // This is the first step of the checkout process, making sure we have everything we need.
      console.log("Starting checkout process for user:", userId);
      const cart = await Cart.findOne({
        where: { userId },
        include: [
          {
            model: CartItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
        ],
        transaction: t, // <-- Crucially, this operation is part of the transaction.
      });

      // If the cart is empty or doesn't exist, we throw an error and roll back the transaction.
      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty.");
      }
      
      // 2. Calculate the total cost of the order by summing up the price of each item multiplied by its quantity.
      let totalAmount = 0;
      for (const item of cart.items) {
        totalAmount += item.quantity * item.product.price;
      }

      // 3. Create a new `Order` record in the `orders` table.
      // The order is created with a `userId`, the calculated `totalAmount`, and an initial `status` of "pending".
      const newOrder = await Order.create(
        {
          userId: userId,
          total_amount: totalAmount,
          status: "pending",
        },
        { transaction: t } // This creation is part of the transaction.
      );

      console.log("Created new order with ID:", newOrder.id);

      // 4. Prepare and create `OrderItem` records for each item in the cart.
      // The `map` function transforms each `cart.item` into a new object with the data needed for an `OrderItem`.
      const orderItems = cart.items.map((item) => ({  //map() everytime defines new object
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      }));

      // `OrderItem.bulkCreate` efficiently creates all the `orderItems` at once.
      await OrderItem.bulkCreate(orderItems, { transaction: t });

      console.log("Created order items for order ID:", newOrder.id);

      // 5. Loop through each item in the cart and decrement the stock count for the corresponding product.
      for (const item of cart.items) {
        // `Product.findByPk` finds the product. We do this inside the loop to ensure we get the latest data.
        // `transaction: t` ensures this is part of the transaction.
        const product = await Product.findByPk(item.productId, {
          transaction: t,
        });

        // Check if the product exists and has enough stock to fulfill the order.
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        // We check if the product's `stock` is less than the quantity being ordered.
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // `product.decrement` atomically decreases the `stock` field by `item.quantity`.
        // This is safer than `product.stock = product.stock - ...` because it prevents race conditions.
        await product.decrement('stock', { by: item.quantity, transaction: t });
        console.log(`Decremented stock for product ID ${product.id} by ${item.quantity}`);
      }

      // 6. Clear the user's cart. This is the last step.
      // `CartItem.destroy` deletes all cart items that belong to the current `cartId`.
      await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

      // If all steps (1-6) succeed, the transaction is committed, and `newOrder` is returned.
      return newOrder;
    });

    // Returns the final result of the successful transaction.
    return result;
  }
}

// This line exports the `CartService` class, making it available for other parts of your application (like controllers) to import and use.
export default CartService;