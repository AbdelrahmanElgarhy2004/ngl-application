import { User } from "../../user/model/user.model.js";

export async function createUser(userData) {
  return await User.create(userData);
}