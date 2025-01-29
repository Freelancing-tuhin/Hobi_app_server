import ProviderModel from "../../../../models/provider.model";
import { Request, Response } from "express";
import { MESSAGE } from "../../../../constants/message";

export const getAllProviders = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      const skip = (Number(page) - 1) * Number(limit);
      const providers = await ProviderModel.find()
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "provided_service",
        select: "service_name description", // Select specific fields if required
      });
  
      const totalProviders = await ProviderModel.countDocuments();
  
      return res.status(200).json({
        message:MESSAGE.get.succ,
        result: providers,
        pagination: {
          total: totalProviders,
          currentPage: Number(page),
          totalPages: Math.ceil(totalProviders / Number(limit)),
          limit: Number(limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message:MESSAGE.get.fail,
        error,
      });
    }
  };
  
  
export const editProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const updateData = req.body;

    const updatedProvider = await ProviderModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate({
      path: "provided_service",
      select: "service_name description",
    });

    if (!updatedProvider) {
      return res.status(404).json({
        message: MESSAGE.patch.fail,
        error: "Provider not found",
      });
    }

    return res.status(200).json({
      message: MESSAGE.patch.succ,
      result: updatedProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: MESSAGE.patch.fail,
      error,
    });
  }
};

export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    const deletedProvider = await ProviderModel.findByIdAndDelete(id);

    if (!deletedProvider) {
      return res.status(404).json({
        message: MESSAGE.delete.fail,
        error: "Provider not found",
      });
    }

    return res.status(200).json({
      message: MESSAGE.delete.succ,
      result: deletedProvider,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: MESSAGE.delete.fail,
      error,
    });
  }
};
