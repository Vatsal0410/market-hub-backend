import { Schema, model, Document, Types } from "mongoose";

export interface IProductImage {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  images: IProductImage[];
  category?: Types.ObjectId;
  stock: number;
  unit: string;
  isAvailable: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    images: [{
    filename: { type: String, required: true },
    originalName: { type: String },
    path: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
  }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ isDeleted: 1 });

export const Product = model<IProduct>("Product", productSchema);