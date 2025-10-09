import Product from "../../database/models/product.model.js";

/**
 * Service layer for all product-related business logic.
 * This layer directly interacts with the database models.
 */
class ProductService {
  /**
   * Creates a new product and associates it with a user.
   * @param {string} name - The name of the product.
   * @param {string} description - A detailed description of the product.
   * @param {number} price - The price of the product.
   * @param {string} imageUrl - The URL to the product's image.
   * @param {number} stock - The number of items in stock.
   * @param {number} userId - The ID of the user creating the product.
   * @returns {object} The newly created product object.
   */
  static async createProduct(
    name, //watch
    description, // smart watch
    price, //2000
    image_url, //dfefergerger
    stock, // 5

    userId // 2
  ) {
    // We are using the `create` method from the Sequelize model to save a new record.
    // The `userId` is passed here to automatically create the association.
    const newProduct = await Product.create({
      name,
      description,
      price,
      image_url: image_url,
      stock: stock,
      userId: userId, // This is the foreign key that links to the User model.
    });

    // Return the newly created product. We don't need to exclude sensitive data
    // because there's none in the product model.
    return newProduct;
  }

  /**
   * Fetches all products from the database.
   * @returns {array} An array of all product objects.
   */
  static async getAllProducts() {
    // We use the `findAll` method to retrieve all records from the `products` table.
    // This is a simple, straightforward database query.
    const products = await Product.findAll(); // {}  // { prodyuct{name:"", descr} {}}

    // Return the array of products.
    return products;
  }

  /**
   * Fetches a single product by its unique ID.
   * @param {number} id - The ID of the product to fetch.
   * @returns {object|null} The product object if found, otherwise null.
   */ //2
  static async getProductById(id) {
    // We use the `findByPk` (Find by Primary Key) method which is highly optimized
    // for fetching a single record by its ID.
    const product = await Product.findByPk(id); //2     {name:watch}

    // Return the found product or null if it doesn't exist.
    return product; //{name:watch}    // null
  }

  /**
   * Updates an existing product.
   * @param {number} id - The ID of the product to update.
   * @param {object} updatedData - The new data for the product.
   * @param {number} userId - The ID of the user trying to update the product.
   * @returns {number} The number of rows affected (should be 1 if successful).
   */ //1  {name: "wrist-watch"}  2
  static async updateProduct(id, updatedData, userId) {
    // First, we find the product to make sure it exists and belongs to the user.
    const product = await Product.findByPk(id); //1

    // If the product doesn't exist or it doesn't belong to the user, we throw an error.
    if (!product || product.userId !== userId) {
      // 1   2
      return 0; // Return 0 to indicate no rows were updated.
    }

    // Use the `update` method to apply the new data.
    // We pass the updated data and a `where` clause to find the correct record.
    const [affectedRows] = await Product.update(updatedData, {
      where: {
        id: id, // 1
      },
    });

    // Return the number of rows updated. A successful update will return 1.
    return affectedRows;
  }

  /**
   * Deletes a product by its ID.
   * @param {number} id - The ID of the product to delete.
   * @param {number} userId - The ID of the user trying to delete the product.
   * @returns {number} The number of rows deleted (should be 1 if successful).
   */ //4   //1
  static async deleteProduct(id, userId) {
    // First, we find the product to make sure it exists and belongs to the user.
    const product = await Product.findByPk(id); //4

    // If the product doesn't exist or doesn't belong to the user, we return 0.
    if (!product || product.userId !== userId) {
      return 0;
    }

    // We use the `destroy` method to delete the product record from the database.
    const deletedRows = await product.destroy();

    // Return the number of rows deleted. A successful deletion will return 1.
    return deletedRows; //if successfull then return 1   or if not then return 0
  }
}

export default ProductService;
