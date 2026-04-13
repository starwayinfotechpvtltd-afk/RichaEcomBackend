const express = require("express");
const {
  publishPage,
  getPageBySlug,
  getAllPages,
  deletePage,
} = require("../controller/page-controller");

const pageRouter = express.Router();

pageRouter.post("/page", publishPage);
pageRouter.get("/allPages", getAllPages);
pageRouter.get("/page/:slug", getPageBySlug);
pageRouter.delete("/page/:slug", deletePage);

module.exports = pageRouter;
     