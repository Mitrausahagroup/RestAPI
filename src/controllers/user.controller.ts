import { UserService } from "../services/user.service";
import { Request, Response } from "express";

const userService = new UserService()

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUser();
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } =  req.params

    const users = await userService.getUserById(id);

    if (!users) {
      res.status(404).json({ error: 'User tidak ditemukan' });
      }

    console.log(users)
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { NIK, name, password, role} =  req.body
    const userData = {
      NIK: NIK,
      name: name,
      password: password,
      role: role,
    };
    console.log(userData)
    const users = await userService.createUser(userData)
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
    console.log(error)
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {

    const { id } =  req.params
    const findUser =  await userService.getUserById(id);

    if (!findUser) {
      res.status(404).json({ error: 'User not found' });
      return
    }
    const userData = {
      NIK: req.body.NIK || findUser.NIK ,
      name: req.body.name || findUser.name,
      role: req.body.role || findUser.role,
    };
    const users = await userService.updateUser(id ,userData)
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const { id } =  req.params
    const users = await userService.deleteUser(id);
    res.status(201).json(true);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};