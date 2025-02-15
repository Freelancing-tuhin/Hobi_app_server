import { Request, Response } from "express";
import ServiceModel from "../../../../models/service.model";
import { MESSAGE } from "../../../../constants/message";

export const createService = async (req: Request, res: Response) => {
  try {
    const { service_name, description } = req.body;

    const newService = await new ServiceModel({
      service_name,
      description,
    }).save();

    return res.status(200).json({
      message: MESSAGE.post.succ,
      result: newService,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: MESSAGE.post.fail,
      error: error,
    });
  }
};


export const editService = async (req: Request, res: Response) => {
    try {
      const {id, service_name, description } = req.body;
  
      const updatedService = await ServiceModel.findByIdAndUpdate(
        id,
        { service_name, description },
        { new: true } // Return the updated document
      );
  
      if (!updatedService) {
        return res.status(404).json({
          message: MESSAGE.patch.fail,
        });
      }
  
      return res.status(200).json({
        message: MESSAGE.patch.succ,
        result: updatedService,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.patch.fail,
        error: error,
      });
    }
  };
  

  export const deleteService = async (req: Request, res: Response) => {
    try {
      const { id } = req.query; // Service ID from request params
  
      const deletedService = await ServiceModel.findByIdAndDelete(id);
  
      if (!deletedService) {
        return res.status(404).json({
          message: MESSAGE.delete.fail,
        });
      }
  
      return res.status(200).json({
        message: MESSAGE.delete.succ,
        result: deletedService,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.delete.fail,
        error: error,
      });
    }
  };
  

  export const getServiceById = async (req: Request, res: Response) => {
    try {
      const { id } = req.query; // Service ID from request params
  
      const service = await ServiceModel.findById(id);
  
      if (!service) {
        return res.status(404).json({
          message: MESSAGE.get.fail,
        });
      }
  
      return res.status(200).json({
        message: MESSAGE.get.succ,
        result: service,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.get.fail,
        error: error,
      });
    }
  };
  

  export const getAllServices = async (req: Request, res: Response) => {
    try {
      const services = await ServiceModel.find();
  
      return res.status(200).json({
        message: MESSAGE.get.succ,
        result: services,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.get.fail,
        error: error,
      });
    }
  };
  