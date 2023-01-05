const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  try {
    let cart = await Cart.findOne({ email: user.email });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
    }
    return cart;
  } catch (error) {
    throw error;
  }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    cart = await Cart.create({ email: user.email });
    if (!cart) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Internal Server Error"
      );
    }
  }

  let productExists = await Product.findOne({ _id: productId });

  if (!productExists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }
  const productFound = cart.cartItems.filter((cartItem) => {
    if (cartItem.product._id == productId) return true;
    else return false;
  });
  if (productFound.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  } else {
    cart.cartItems.push({
      product: productExists,
      quantity,
    });
  }
  const productAdd = await cart.save();
  return productAdd;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  // let cart = await Cart.findOne({ email: user.email });
  // if (!cart) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "User does not have a cart. Use POST to create cart and add a product"
  //   );
  // }
  // let productExists = await Product.findOne({ _id: productId });

  // if (!productExists) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Product does not exist");
  // }

  // const productFound = cart.cartItems.filter((cartItem) => {
  //   if (cartItem.product._id === productId) return true;
  //   else return false;
  // });

  // if (productFound.length == 0) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  // } else {
  //   let updatedCartItem = cart.cartItems.map((item) => {
  //     if (String(item.product._id) === String(productExists._id)) {
  //       item.quantity = quantity;
  //       return item;
  //     }
  //     return item;
  //   });
  // }
  // cart.cartItems = updatedCartItem;
  // const updatedCart = await cart.save();
  // return updatedCart;
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }
  let productExist = await Product.findOne({ _id: productId });

  if (!productExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }
  const productFound = cart.cartItems.filter((cartItem) => {
    if (cartItem.product._id == productId) return true;
    else return false;
  });
  if (productFound.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  } else {
    let cartItemsUpdated = cart.cartItems.map((item) => {
      if (String(item.product._id) == String(productExist._id)) {
        item.quantity = quantity;
        return item;
      }
      return item;
    });
    cart.cartItems = cartItemsUpdated;
    // console.log(cart);
    const productSaved = await cart.save();
    return productSaved;
  }
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  } else if (cart.cartItems.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }
  const productFound = cart.cartItems.filter((cartItem) => {
    if (cartItem.product._id == productId) return true;
    else return false;
  });
  if (productFound.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  } else {
    let cartItemsUpdated = cart.cartItems.filter((item) => {
      if (String(item.product._id) == String(productId)) {
        return false;
      }
      return true;
    });
    cart.cartItems = cartItemsUpdated;
    // console.log(cart);
    const productRemoved = await cart.save();
    return productRemoved;
  }
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart == null)
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart.");
  if (cart.cartItems.length == 0)
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
  const isAddressSet = await user.hasSetNonDefaultAddress();
  // console.log(isAddressSet);
  if (!isAddressSet)
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set"); // 400
  let usedBalance = 0;
  cart.cartItems.forEach((obj) => {
    usedBalance += obj.product.cost * obj.quantity;
  });
  if (usedBalance <= user.walletMoney) {
    user.walletMoney = user.walletMoney - usedBalance;
    cart.cartItems = [];
    await user.save();
    await cart.save();
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Wallet balance not sufficient to place order"
    );
  }
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
