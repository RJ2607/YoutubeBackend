import { Router } from "express";
import { getUserById, getUsers, signUp } from "../User/user.controller";

const userRoutes = Router();
const path = "/users";

userRoutes.get(path, getUsers);
userRoutes.get(path+"/:id", getUserById);
userRoutes.post(path+"/sign-up", signUp);

export default userRoutes;
