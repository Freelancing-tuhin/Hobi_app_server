import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";
import { uploadImageToS3Service } from "../../../../services/uploadImageService";

export const createEvent = async (req: Request, res: Response) => {
	try {
		const eventDetails = req.body;

		if (!req.files || !("banner_Image" in req.files)) {
			return res.status(404).json({
				message: MESSAGE.post.custom("banner_Image not found")
			});
		}
		const banner_Image = req.files["banner_Image"][0];
		const banner_Image_Buffer = banner_Image.buffer;
		let banner_Image_Url: any = "";
		try {
			banner_Image_Url = (await uploadImageToS3Service("banner_Image", banner_Image_Buffer)) || "";
		} catch (error) {
			return res.status(400).json({
				message: MESSAGE.post.fail
			});
		}
		const payload = {
			...eventDetails,
			banner_Image: banner_Image_Url
		};
		const newEvent = await new EventModel(payload).save();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newEvent
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};
