import { Product, IProduct, IProductImage } from "../models/Product";

interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export const productService = {
  async create(data: {
    name: string;
    description?: string;
    price: number;
    images?: IProductImage[];
    category?: string;
    stock?: number;
    unit: string;
    isAvailable?: boolean;
  }): Promise<IProduct> {
    return Product.create(data);
  },

  async findAll(query: ProductQuery = {}) {
    const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = { isDeleted: false };
    
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = minPrice;
      if (maxPrice) (filter.price as Record<string, number>).$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return { products, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string): Promise<IProduct | null> {
    return Product.findOne({ _id: id, isDeleted: false }).populate("category", "name");
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    images: IProductImage[];
    category: string;
    stock: number;
    unit: string;
    isAvailable: boolean;
  }>): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { returnDocument: 'after', runValidators: true }
    ).populate("category", "name");
  },

  async softDelete(id: string): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { returnDocument: 'after' }
    );
  },

  async restore(id: string): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: undefined },
      { returnDocument: 'after' }
    );
  },

  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: quantity } },
      { returnDocument: 'after' }
    );
  },

  async addImages(id: string, newImages: IProductImage[]): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { images: { $each: newImages } } },
      { returnDocument: 'after' }
    ).populate("category", "name");
  },

  async removeImage(id: string, filename: string): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $pull: { images: { filename } } },
      { returnDocument: 'after' }
    ).populate("category", "name");
  },
};