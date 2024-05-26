import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channel = await Channel.findById(req.params.id);
  if (!channel) {
    throw new ApiError("Channel not found", 404);
  }
  const totalVideos = await Video.countDocuments({ channel: req.params.id });
  const totalSubscribers = await Subscription.countDocuments({
    channel: req.params.id,
  });
  const totalLikes = await Like.countDocuments({ channel: req.params.id });
  const totalViews = await Video.aggregate([
    { $match: { channel: req.params.id } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViewsCount = totalViews[0]?.totalViews || 0;
  const totalComments = await Video.aggregate([
    { $match: { channel: req.params.id } },
    { $group: { _id: null, totalComments: { $sum: "$comments" } } },
    ]);
    const totalCommentsCount = totalComments[0]?.totalComments || 0;
      const totalSharesCount = totalShares[0]?.totalShares || 0;
      const totalViewsPerVideo = totalViewsCount / totalVideos;
      const totalCommentsPerVideo = totalCommentsCount / totalVideos;
      // const totalSharesPerVideo = totalSharesCount / totalVideos;

      return res
      .status(200)
      .json(new ApiResponse(true, "Channel stats fetched successfully", {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViewsCount,
        totalViewsPerVideo,
        totalCommentsCount,
        totalCommentsPerVideo,
        }));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channel = await Channel.findById(req.params.id);
  if (!channel) {
    throw new ApiError("Channel not found", 404);
    }
    const videos = await Video.find({ channel: req.params.id });
    return res
    .status(200)
    .json(new ApiResponse(true, "Channel videos fetched successfully", videos));
});

export { getChannelStats, getChannelVideos };
