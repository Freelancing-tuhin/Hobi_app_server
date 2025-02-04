import { Request, Response } from "express";
import CallModel from "../../../../models/call.model";
import { MESSAGE } from "../../../../constants/message";
import { deductBalanceAndCompleteCall } from "../../../../services/deductBalanceAndCompleteCall";

export const requestCall = async (req: Request, res: Response) => {
  try {
    const { userId, providerId, scheduledAt } = req.body;

    const newCallRequest = new CallModel({
      user: userId,
      provider: providerId,
      status: "requested",
      scheduledAt,
    });

    await newCallRequest.save();

    return res.status(200).json({
      message: MESSAGE.post.succ,
      result: newCallRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: MESSAGE.post.fail,
      error,
    });
  }
};


export const acceptCallRequest = async (req: Request, res: Response) => {
    try {
      const { callId, status, scheduledAt } = req.body;
  
      if (!["ongoing", "scheduled"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Only 'ongoing' or 'scheduled' is allowed.",
        });
      }
  
      const updatedCall = await CallModel.findByIdAndUpdate(
        callId,
        {
          status,
          ...(status === "scheduled" && { scheduledAt }),
        },
        { new: true }
      );
  
      if (!updatedCall) {
        return res.status(404).json({ message: "Call request not found" });
      }
  
      return res.status(200).json({
        message: MESSAGE.patch.succ,
        result: updatedCall,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.patch.fail,
        error,
      });
    }
  };
  

  export const cancelCallRequest = async (req: Request, res: Response) => {
    try {
      const { callId } = req.body;
  
      const updatedCall = await CallModel.findByIdAndUpdate(
        callId,
        { status: "canceled" },
        { new: true }
      );
  
      if (!updatedCall) {
        return res.status(404).json({ message: "Call request not found" });
      }
  
      return res.status(200).json({
        message: MESSAGE.patch.succ,
        result: updatedCall,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.patch.fail,
        error,
      });
    }
  };
  

  export const completeCall = async (req: Request, res: Response) => {
    try {
      const { callId, walletId } = req.body;
  
      const call = await CallModel.findById(callId).populate("provider");
  
      if (!call || call.status !== "ongoing") {
        return res.status(400).json({ message: "Invalid call to complete" });
      }
  
      const providerRatePerMinute = call.provider?.ratePerMinute || 0;
  
      if (providerRatePerMinute <= 0) {
        return res.status(400).json({ message: "Invalid rate per minute" });
      }
  
      // Deduct balance and monitor call duration
      const result:any = await deductBalanceAndCompleteCall(callId, providerRatePerMinute, walletId);
  
      if (!result.success) {
        return res.status(400).json({
          message: "Call ended due to insufficient balance",
          duration: result.duration,
        });
      }
  
      return res.status(200).json({
        message: MESSAGE.patch.succ,
        result: { callId, duration: result.duration },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: MESSAGE.patch.fail,
        error,
      });
    }
  };
  