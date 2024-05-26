import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";

const routers = Router();

routers.route("/allvideos").get(getAllVideos);
routers.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  publishAVideo
);

routers
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);
routers.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default routers;
