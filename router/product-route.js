const exporess = require("express");
const {
  uploadProduct,
  adminProductUpload,
  getAllProduct,
  getProductsForCart,
  getProductById,
  getProductByTypeAndName,
  getProductByType,
  getProductByRange,
  searchProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/product-controller");
const upload = require("../middleware/multer");

const productRouter = exporess.Router();

productRouter.post(
  "/uploadProduct",
  upload.fields([
    { name: "productImage", maxCount: 10 },
    { name: "functionsImage", maxCount: 10 },
  ]),
  uploadProduct,
);

// router.post(
//   "/product/adminProductUpload",
//   upload.field({ name: "csv", maxCount: 1 }),
//   adminProductUpload,
// );

productRouter.get("/getallProduct", getAllProduct);
productRouter.post("/getProductsForCart", getProductsForCart);
productRouter.post("/getProductById/:id", getProductById);
productRouter.post("/getProductbyTypeName", getProductByTypeAndName);
productRouter.post("/getProductbyType", getProductByType);
productRouter.post("/getProductbyRange", getProductByRange);
productRouter.post("/searchproduct", searchProduct);
productRouter.put(
  "/updateproduct/:id",
  upload.fields([
    { name: "productImage", maxCount: 10 },
    { name: "functionsImage", maxCount: 10 },
  ]),
  updateProduct,
);
productRouter.delete("/deleteProduct/:id", deleteProduct);

module.exports = productRouter;
