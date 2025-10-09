/**
 * @fileoverview Defines the sequelize model associations for the application
 * This file sets up the relationship (one-to-one, one-to-many , many-to-many)
 * between all our datbase models . This is a fundamental step for building a
 * relational databse structure that reflects the real-world relationships
 */

import Cart from "./models/cart.model.js";
import CartItem from "./models/cart_item.model.js";
import Order from "./models/order.model.js";
import OrderItem from "./models/order_item.model.js";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";

//=============================
// User and Order Relationship (One-to-Many)
// Purpose : To link a customer (User) to all of the purchases they have made (Orders)
// Business Logic: A single user can have multiple orders over time.However, a specific
// order belongs to one and only one user
// ============================

// A User  has many Orders.
// The `User.hasMany(Order)` command establishes the "one" side of the relationship
// This is the source model, and sequelize will automatically create a foreign key
// in the target model (`Order`) that links back to the source (`User`)..

User.hasMany(Order, {
  // We explicitly define the foreign key name as 'userId'. This is the column
  // that Sequelize will add to the `orders` table. It will store the primary key
  // of the user who placed the order

  foreignKey: "userId",

  // We define a human-readable alias, `orders` , for this relationship.
  // This allows us to access a user's orders later using convenient Sequelize
  // methods like `user.getOrders()` , `user.createOrder` etc...
  as: "orders",
});

// An Order belongs to a User
// The `Order.belongsTo(User)` command establishes the "many" side of the relationship
// This is the inverse of the `hasMany` relationship . It's crucial for establishing a
// two-way-link . It also allows us to access the user from an order instance
// using `order.getCustomer()` . The `foreignKey` specified here must match the
// one defined in the `hasMany` call

Order.belongsTo(User, {
  foreignKey: "userId",

  // We use alias `customer` to make the relationship's name clear
  // in the context of an order .. e.g `order.getCustomer()`
  as: "customer",
});

// ===================
// Order and Product (Many-to-Many) relationship
// Purpose: To link an order to all the products it contains.
// Business Logic: An order can contain multiple products, and a single product
// can be included in many different orders. This requires a third table , known as a
// "junction" table, to resolve the relationship. Here , `OrderItem` is
// our junction table .It holds forign key s for both `Order` and `Product` and
// stores additional data about the relationship, such as quantity
// ===============

// An Order has many Products

Order.belongsToMany(Product, {
  // We specify the junction table that sequelize must use to connect the
  // two models. This is the heart of many-to-many relationship
  through: OrderItem,

  // The foreign key in the juction table(`OrderItem`) that refers to the `orders` table
  // This columns will store the primary key of the order
  foreignKey: "orderId",

  // The forign key in the junction table(`OrderItem`) that refers to the `products` table
  // This column will stores the primary key of the product
  otherKey: "productId",

  // This alias . `products` , allows us to get a list of allproducts in given order,
  // for example, `order.getProducts()`
  as: "products",
});

// A product has many orders
// This is the inverse relationship, which is equally important. It allows us to
// find all orders that contain specific products.
Product.belongsToMany(Order, {
  // We specify the junction table that sequelize must use to connect the
  // two models. This is the heart of many-to-many relationship
  through: OrderItem,

  // The foreign key in the junction table (`OrderItem`) that refers to the `products` table.
  // This column will store the primary key of the product.
  foreignKey: "productId",

  // The foreign key in the junction table (`OrderItem`) that refers to the `orders` table.
  // This column will store the primary key of the order.
  otherKey: "orderId",

  // This alias, 'orders', allows us to get a list of all order in a given product,
  // for example, `product.getOrders()`.

  as: "orders",
});

// ==================================
// One-to-Many relationship for the junction table
// Purpose: These associations make it easier to query the junction table itself
// Business Logic : An `OrderItem` is a single line item. It belongs to one specific
// order and represents one specific product
// ==================================

// An `OrderItem` belongs to a Product..
// This allows us to easily find the parent order of a given order item,
// e.g., `orderItem.getOrder()` .This association is crucial for querying related data

OrderItem.belongsTo(Order, {
  // foreign key
  foreignKey: "orderId",

  // alias
  as: "order",
});

// An `OrderItem` belongsTo a Product..
// This allows us to easily find out the product associated with an oreder item..
// e.g., `orderItem.getProduct()`...

OrderItem.belongsTo(Product, {
  // foreign key
  foreignKey: "productId",

  // alias
  as: "product",
});

// =====================
// User and Cart Relationship (One-to-One)
// Purpose: To give each user a single, dedicated shopping cart
// Business Logic : A user can only have one shopping cart at a time , and a cart
// is exclusively owned by a single user
// ======================

// A User has one cart
// The `hasOne` command sets up the one-to-one relationship. It will automatically
// add a `userId` foreign key to the `carts` table, which points back to the user

User.hasOne(Cart, {
  // foreign key
  foreignKey: "userId",

  // alias
  as: "cart",
});

// A Cart belongsTo a User
// The `belongsTo` command completes the one-to-one relationship from the other side
// It allows us to find the user from the cart, e.g., `cart.getUser()`

Cart.belongsTo(User, {
  // foreign key
  foreignKey: "userId",

  // alias
  as: "user",
});

// ============================
// Cart and CartItem Relationship (One-to-Many)
// Purpose: To link a shopping cart to all the products (represented by CartItem) it contains
// Business Logic: A single cart can contain multiple items, but each item in the cart
// belongs to one specific cart
//==============================

// A Cart has many CartItems
// e.g cart.getItems()
Cart.hasMany(CartItem, {
  // foreign key
  foreignKey: "cartId",

  // alias
  as: "items",
});

// A CartItem belongTo to a cart
CartItem.belongsTo(Cart, {
  // foreignkey
  foreignKey: "cartId",

  // alias
  as: "cart", // e.g.., `cartItem.getCart()`
});

// =======================
// Product and CartItem Relationship (one-to-many)
// Purpose: To link product to all the cart items  the at reference it.
// Business Logic: A product can be in mulitple carts at the same time.
// This association is essential for finding out which carts a particular product is in
// ========================

// A product has many cartItems
// This establishes the link from the product to the items that are referencing it

Product.hasMany(CartItem, {
  // foreignkey
  foreignKey: "productId",

  // alias
  as: "cartItems", // e.g.., product.getCartItems()
});

// A CartIem belongs To a Product
// Thsi establishes the inverse link, allowing us to find the product from a cart item
CartItem.belongsTo(Product, {
  // foreignkey
  foreignKey: "productId",

  // alias
  as: "product", // e.g., cartItem.getProduct()
});

// Order has many OrderItems
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });

// order

// id  productId

// 2     3,4,5

// //

// order
// id

// 1
// 2
// 3

// order_item

// id   orderId   productId

// 1      2          3
// 2      2          4
// 3      2          5
