import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandle.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const user = await User.findById(req.user._id);
  const subscription = await Subscription.findOne({
    channelId,
    userId: req.user._id,
  });
  if (subscription) {
    await Subscription.deleteOne({ _id: subscription._id });
    user.subscriptions.pull(subscription._id);
    await user.save();
    return res.status(200).json(new ApiResponse(200, "Subscription deleted"));
  }
  const newSubscription = new Subscription({
    channelId,
    userId: req.user._id,
  });
  await newSubscription.save();
  user.subscriptions.push(newSubscription._id);
  await user.save();
  return res.status(200).json(new ApiResponse(200, "Subscription created"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscribers = await Subscription.find({ channelId });
  const userSubscribers = subscribers.map((sub) => sub.userId);
  const users = await User.find({ _id: { $in: userSubscribers } });
  return res.status(200).json(new ApiResponse(200, users));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber Id");
  }
  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const subscribedChannels = await Subscription.find({ userId: subscriberId });
  const channelIds = subscribedChannels.map((sub) => sub.channelId);
  const channels = await Channel.find({ _id: { $in: channelIds } });
  return res.status(200).json(new ApiResponse(200, channels));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
