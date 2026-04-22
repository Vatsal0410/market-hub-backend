import { Cart, ICart } from "../models/Cart";
import { Product } from "../models/Product";
import { Types } from "mongoose";

export const cartService = {
  async findByUserId(userId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId }).populate("items.product", "name price images unit");
    if (cart) {
      cart.totalAmount = cart.items.reduce((sum, item) => {
        const prod = item.product as unknown as { price: number };
        return sum + prod.price * item.quantity;
      }, 0);
    }
    return cart;
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: new Types.ObjectId(productId), quantity });
    }

    await cart.save();
    
    await cart.populate("items.product", "name price images unit");
    cart.totalAmount = cart.items.reduce((sum, item) => {
      const prod = item.product as unknown as { price: number };
      return sum + prod.price * item.quantity;
    }, 0);
    await cart.save();
    
    return cart;
  },

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) return null;

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    await cart.populate("items.product", "name price images unit");
    cart.totalAmount = cart.items.reduce((sum, item) => {
      const prod = item.product as unknown as { price: number };
      return sum + prod.price * item.quantity;
    }, 0);
    await cart.save();
    
    return cart;
  },

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    
    await cart.populate("items.product", "name price images unit");
    cart.totalAmount = cart.items.reduce((sum, item) => {
      const prod = item.product as unknown as { price: number };
      return sum + prod.price * item.quantity;
    }, 0);
    await cart.save();
    
    return cart;
  },

  async clearCart(userId: string): Promise<void> {
    await Cart.findOneAndDelete({ user: userId });
  },

  async findById(id: string): Promise<ICart | null> {
    return Cart.findById(id).populate("user", "fname lname email").populate("items.product", "name price images unit");
  },

  async findAll(): Promise<ICart[]> {
    return Cart.find().populate("user", "fname lname email").populate("items.product", "name price images unit");
  },

  async calculateTotal(cart: ICart): Promise<number> {
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  },
};