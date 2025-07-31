import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const validVarian = ['HALUS', 'KASAR'];

  const AddSchema = Joi.object({
    nama: Joi.string().required(),
    stok: Joi.string().required(),
    varian: Joi.string().valid(...validVarian).required()
  });

  const UpdateSchema = Joi.object({
    nama: Joi.string().email().optional(),
    stok: Joi.string().optional(),
    varian: Joi.string().valid(...validVarian).optional()
  });

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






  