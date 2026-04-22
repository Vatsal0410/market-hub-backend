import { Category, ICategory } from "../models/Category";

interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoryService = {
  async create(data: { name: string; description?: string; image?: string; parentCategory?: string }): Promise<ICategory> {
    return Category.create(data);
  },

  async findAll(query: CategoryQuery = {}) {
    const { page = 1, limit = 10, search } = query;
    const filter: Record<string, unknown> = { isDeleted: false };
    
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const categories = await Category.find(filter)
      .populate("parentCategory", "name")
      .skip(skip)
      .limit(limit);
    
    const total = await Category.countDocuments(filter);
    
    return { categories, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string): Promise<ICategory | null> {
    return Category.findOne({ _id: id, isDeleted: false }).populate("parentCategory", "name");
  },

  async update(id: string, data: { name?: string; description?: string; image?: string; parentCategory?: string }): Promise<ICategory | null> {
    return Category.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { returnDocument: 'after', runValidators: true }
    ).populate("parentCategory", "name");
  },

  async softDelete(id: string): Promise<ICategory | null> {
    return Category.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { returnDocument: 'after' }
    );
  },

  async restore(id: string): Promise<ICategory | null> {
    return Category.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: undefined },
      { returnDocument: 'after' }
    );
  },
};