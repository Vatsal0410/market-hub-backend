import { Order, IOrder } from "../models/Order";
import { Cart } from "../models/Cart";

interface OrderQuery {
  status?: string;
  page?: number;
  limit?: number;
}

interface CreateOrderData {
  userId: string;
  shippingAddress: {
    street: string;
    city: string;
    pincode: string;
  };
  paymentMethod?: string;
}

interface UserOrderQuery {
  page?: number;
  limit?: number;
}

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const orderService = {
  async create(data: CreateOrderData): Promise<IOrder> {
    const cart = await Cart.findOne({ user: data.userId }).populate("items.product", "name price images");

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const items = cart.items.map((item) => {
      const product = item.product as unknown as { _id: unknown; name: string; price: number; images: string[] };
      return {
        product: product._id as unknown as import("mongoose").Types.ObjectId,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[0],
      };
    });

    const totalAmount = cart.items.reduce((sum, item) => {
      const product = item.product as unknown as { price: number };
      return sum + product.price * item.quantity;
    }, 0);

    const order = await Order.create({
      user: data.userId,
      items,
      totalAmount,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      orderId: generateOrderId(),
      orderDate: new Date(),
    });

    await Cart.findOneAndDelete({ user: data.userId });

    return order;
  },

  async findByUserId(userId: string, query: UserOrderQuery = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ user: userId, isDeleted: false })
      .populate("items.product", "name price images")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments({ user: userId, isDeleted: false });
    
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string, userId?: string): Promise<IOrder | null> {
    const filter: Record<string, unknown> = { _id: id, isDeleted: false };
    if (userId) filter.user = userId;
    
    return Order.findOne(filter)
      .populate("user", "fname lname email")
      .populate("items.product", "name price images");
  },

  async findAll(query: OrderQuery = {}) {
    const { status, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = { isDeleted: false };
    
    if (status) filter.orderStatus = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate("user", "fname lname email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(filter);
    
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  },

  async updateStatus(id: string, data: { orderStatus?: string; paymentStatus?: string }): Promise<IOrder | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.orderStatus === "delivered") {
      updateData.deliveryDate = new Date();
    }
    return Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { returnDocument: 'after' }
    );
  },

  async cancel(id: string, userId: string): Promise<IOrder | null> {
    const order = await Order.findOne({ _id: id, user: userId, isDeleted: false });
    if (!order) return null;
    
    if (order.orderStatus === "delivered") {
      throw new Error("Cannot cancel delivered orders");
    }
    
    if (order.orderStatus === "shipped" || order.orderStatus === "cancelled") {
      throw new Error("Cannot cancel order in current status");
    }
    
    order.orderStatus = "cancelled";
    return order.save();
  },

  async softDelete(id: string): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { returnDocument: 'after' }
    );
  },

  async restore(id: string): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: undefined },
      { returnDocument: 'after' }
    );
  },

  async getStats(userId?: string, isAdmin?: boolean): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  }> {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (!isAdmin && userId) {
      filter.user = userId;
    }

    const totalOrders = await Order.countDocuments(filter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...filter, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const pendingOrders = await Order.countDocuments({ ...filter, orderStatus: "processing" });
    const shippedOrders = await Order.countDocuments({ ...filter, orderStatus: "shipped" });
    const deliveredOrders = await Order.countDocuments({ ...filter, orderStatus: "delivered" });
    const cancelledOrders = await Order.countDocuments({ ...filter, orderStatus: "cancelled" });

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    };
  },
};