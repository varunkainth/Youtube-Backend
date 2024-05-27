import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (res, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
    // console.log(uniqueSuffix);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

export { upload };
