import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const validRoles = ['SALES', 'SUPERVISOR', 'ADMIN'];

 const LoginSchema = Joi.object({
    NIK: Joi.string().required(),
    password: Joi.string().required(),
  });

  const AddSchema = Joi.object({
    NIK: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid(...validRoles).required()
  });

  const UpdateSchema = Joi.object({
    NIK: Joi.string().email().optional(),
    password: Joi.string().optional(),
    role: Joi.string().valid(...validRoles).optional()
  });

  export const verifyLogin = (req: Request, res: Response, next: NextFunction) => {
    /** validate a req body and grab error if exist */
    const { error } = LoginSchema.validate(req.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a res like this */
        res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}


export const verifyAddUser = (req: Request, res: Response, next: NextFunction) => {
    /** validate a req body and grab error if exist */
    const { error } = AddSchema.validate(req.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a res like this */
        res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyUpdateUser = (req: Request, res: Response, next: NextFunction) => {
    /** validate a req body and grab error if exist */
    const { error } = UpdateSchema.validate(req.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a res like this */
        res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}






  