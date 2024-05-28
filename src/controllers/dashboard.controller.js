import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
// import {  } from "../models/subscriber.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";
import { Channel, Subscription } from "../models/subscriber.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req.params.channelId;
  try {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    // Calculate total subscribers
    const totalSubscribers = await Subscription.countDocuments({
      channelId: channelId,
    });

    // Calculate total videos
    const totalVideos = await Video.countDocuments({ channel: channelId });

    // Calculate total video views and total likes
    const videoStats = await Video.aggregate([
      { $match: { channel: channelId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
        },
      },
    ]);

    const totalViews = videoStats.length ? videoStats[0].totalViews : 0;
    const totalLikes = videoStats.length ? videoStats[0].totalLikes : 0;

    // Prepare the stats
    const stats = {
      totalSubscribers,
      totalVideos,
      totalViews,
      totalLikes,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Channel stats retrieved successfully")
      );
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error));
  }
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
