import { Schema, model } from "mongoose";

export interface IUser {
  email: string;
  name?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String }
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
