import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  countChannelsOwnerSubscribed,
  countSubscribersForChannel,
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscribe.controller.js";

const router = Router();

router
  .route("/:channelId")
  .post(verifyJWT, toggleSubscription)
  .get(countSubscribersForChannel);
router.route("/channel").get(getSubscribedChannels);
router.route("/user/channel").get(verifyJWT, getUserChannelSubscribers);
router.route("/user/channelcount/:channelId").get(countChannelsOwnerSubscribed);

export default router;
