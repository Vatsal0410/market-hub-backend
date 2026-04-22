import { User, IUser } from "../models/User";
import bcrypt from "bcryptjs";

interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const userService = {
  async create(data: {
    fname: string;
    lname: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    return User.create(data);
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  async findById(id: string, includePassword = false): Promise<IUser | null> {
    const query = User.findById(id);

    if (includePassword) {
      return query.select("+password");
    }

    return User.findById(id).select("-password");
  },

  async findAll(query: UserQuery = {}) {
    const { page = 1, limit = 10, search } = query;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { fname: { $regex: search, $options: "i" } },
        { lname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit);
    const total = await User.countDocuments(filter);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  },

  async update(
    id: string,
    data: { fname?: string; lname?: string; isEmailVerified?: boolean },
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { returnDocument: "after" }).select(
      "-password",
    );
  },

  async updateById(
    id: string,
    data: {
      fname?: string;
      lname?: string;
      role?: string;
      isEmailVerified?: boolean;
    },
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { returnDocument: "after" }).select(
      "-password",
    );
  },

  async softDelete(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { returnDocument: "after" },
    ).select("-password");
  },

  async restore(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: undefined },
      { returnDocument: "after" },
    ).select("-password");
  },

  async updatePassword(id: string, password: string): Promise<IUser | null> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { returnDocument: "after" },
    ).select("-password");
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  },
};
