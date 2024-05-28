import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  countPublishedVideos,
  createChannel,
  deleteChannel,
  getTotalVideoCount,
  getVideoFromChannel,
  showPublishedVideosForChannel,
  updateChannel,
} from "../controllers/channel.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createChannel);
router.route("/update").patch(verifyJWT, updateChannel);
router.route("/delete").delete(verifyJWT, deleteChannel);
router.route("/:channelId/allvideo").get(verifyJWT, getVideoFromChannel);
router.route("/:channelId/allvideocount").get(verifyJWT, getTotalVideoCount);
router.route("/:channelId/publishvideo").get(showPublishedVideosForChannel);
router.route("/channelId/publishvideocount").get(countPublishedVideos);

export default router;
