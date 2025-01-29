import ProviderModel from "../../../../models/provider.model";
import { Request, Response } from "express";
import ServiceModel from "../../../../models/service.model";
import { MESSAGE } from "../../../../constants/message";




export const getAllServices = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
  
      // Fetch services with pagination
      const services = await ServiceModel.find()
        .skip(skip)
        .limit(Number(limit));
  
      // Count total services
      const totalServices = await ServiceModel.countDocuments();
  
      // Fetch provider counts for each service
      const serviceCounts = await ProviderModel.aggregate([
        {
          $group: {
            _id: "$provided_service",
            count: { $sum: 1 },
          },
        },
      ]);
  
      // Map counts to service responses
      const serviceCountMap = serviceCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
  
      // Append provider counts to the service response
      const responseServices = services.map((service:any) => ({
        ...service.toObject(),
        providerCount: serviceCountMap[service?._id] || 0,
      }));
  
      return res.status(200).json({
        message: MESSAGE.get.succ,
        result: responseServices,
        pagination: {
          total: totalServices,
          currentPage: Number(page),
          totalPages: Math.ceil(totalServices / Number(limit)),
          limit: Number(limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.get.fail,
        error,
      });
    }
  };