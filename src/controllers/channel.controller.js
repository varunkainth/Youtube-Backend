import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynchandle";
import { Channel } from "../models/subscriber.model";

const createChannel = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      throw new ApiError(400, "Enter the required field");
    }
    if (!isValidObjectId(req.user._id)) {
      throw new ApiError(400, "Invalid user id");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(400, "User not found");
    }
    const channel = await Channel.create({
      name,
      description,
      owner: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { channels: channel._id },
    });
    return res
      .status(201)
      .json(new ApiResponse(201, channel, "Channel created successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiError(500, error, "Internal server error"));
  }
});

const updateChannel = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      throw new ApiError(400, "Enter the required field");
    }
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }
    const channel = await Channel.findByIdAndUpdate(
      channelId,
      {
        name,
        description,
      },
      {
        new: true,
      }
    );
    if (!channel) {
      throw new ApiError(400, "Channel not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, channel, "Channel updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error, "Internal Server Error");
  }
});

const deleteChannel = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }

    const channel = await Channel.findById(channelId);

    await Video.deleteMany({
      _id: { $in: channel.videos.map((id) => ObjectId(id)) },
    });
    
    const channels = await Channel.findByIdAndDelete(channelId);
    if (!channels) {
      throw new ApiError(400, "Channel not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, channel, "Channel deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error, "Internal Server Error");
  }
});

const getVideoFromChannel = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
    }
    const channel = await Channel.findById(channelId).populate("videos");
    if (!channel) {
      throw new ApiError(400, "Channel not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, channel, "Videos fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error, "Internal Server Error");
  }
});

const getTotalVideoCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }
  Channel.countDocuments({
    _id: channelId,
    videos: { $exists: true, $ne: [] },
  }).exec((err, videoCount) => {
    if (err) {
      console.error(err);
      throw new ApiError(500, "Internal Server Error ", err);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          videoCount,
          "Total video count fetched successfully"
        )
      );
  });
});

export {
  createChannel,
  updateChannel,
  deleteChannel,
  getVideoFromChannel,
  getTotalVideoCount,
};
