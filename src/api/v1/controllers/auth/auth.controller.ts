import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../../../models/user.model";
import { MESSAGE } from "../../../../constants/message";
import { JWT_SECRET } from "../../../../config/config";


export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { full_name, age, phone, gender, address, password } = req.body;

    const newUser = await new UserModel({
      full_name,
      age,
      phone,
      gender,
      address,
      password, 
    }).save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET);

    return res.status(200).json({
      message:  MESSAGE.post.succ,
      token,
      result: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message:  MESSAGE.post.fail,
      error: error,
    });
  }
};


export const loginUser = async (req: any, res: Response) => {
  try {
    const userInstance = req.user; 

    const token = jwt.sign({ id: userInstance._id }, JWT_SECRET);

    return res.status(200).json({
      message: MESSAGE.post.succ,
      token,
      result: userInstance,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(400).json({
      message: MESSAGE.post.fail,
      error: error,
    });
  }
};