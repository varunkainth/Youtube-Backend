import { isValidObjectId } from "mongoose";
import {
  Channel,
  Subscriber,
  Subscription,
} from "../models/subscriber.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const existingSubscription = await Subscription.findOne({
      subscriberId: userId,
      channelId: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe logic
      await Subscription.deleteOne({
        subscriberId: userId,
        channelId: channelId,
      });
      await Channel.findByIdAndUpdate(channelId, {
        $inc: { subscriberCount: -1 },
      });

      return res.status(200).json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
    } else {
      // Subscribe logic
      const newSubscription = new Subscription({
        subscriberId: userId,
        channelId: channelId,
      });
      await newSubscription.save();
      await Channel.findByIdAndUpdate(channelId, {
        $inc: { subscriberCount: 1 },
      });

      return res.status(200).json(
        new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      new ApiError(500, "Internal Server Error", error)
    );
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;

  try {
    const subscriptions = await Subscription.find({
      subscriberId: userId,
    });

    const channels = subscriptions.map(
      (subscription) => subscription.channelId._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channels,
          "Subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error fetching subscribed channels:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { userId } = req.user.id;

  try {
    const channels = await Channel.find({ owner: userId });

    if (!channels.length) {
     return res.status(404).json(new ApiResponse(404, "No channels found for this user"));
    }

    const channelIds = channels.map((channel) => channel._id);

    // Find subscriptions for these channels
    const subscriptions = await Subscription.find({
      channelId: { $in: channelIds },
    }).populate("subscriberId");

    // Extract subscriber information
    const subscribers = subscriptions.map((subscription) => ({
      userId: subscription.subscriberId._id,
      username: subscription.subscriberId.username, // Assuming user schema has a 'username' field
      subscribedAt: subscription.subscribedAt,
    }));

    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    console.error("Error fetching channel subscribers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const countSubscribersForChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    // Count all subscriptions for the channel
    const subscriberCount = await Subscription.countDocuments({
      channelId: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriberCount,
          "Number of subscribers for this channel"
        )
      );
  } catch (error) {
    console.error("Error counting subscribers for channel:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", error));
  }
});

const countChannelsOwnerSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    if (!isValidObjectId(channelId)) {
      return res.status(404).json(new  ApiError(404, "ChannelId Does Not valid"));
    }
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json(new  ApiError(404, "Channel does not exist"));
    }
    const ownerId = channel.owner;
    const subscriber = await Subscriber.findOne({ user: ownerId });

    if (!subscriber) {
      return res.status(404).json(new ApiResponse(404, "Subscriber not Found"));
    }
    const subscribedChannelCount = subscriber.subscribedChannels.length;

    return res
      .status(200)
      .json(new ApiResponse(200, subscribedChannelCount, "Count Fetch"));
  } catch (error) {
    console.error("Error counting channels owner subscribed:", error);
    return res.status(404).json(new  ApiError(500, "Internal Server Error"));
  }
});

export {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
  countSubscribersForChannel,
  countChannelsOwnerSubscribed,
};
