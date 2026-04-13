const Product = require("../module/product-module");
const uploadToCloudinary = require("../utils/cloudinary");
const csv = require("csv-parser");
const fs = require("fs");

const slugify = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const uploadProduct = async (req, res) => {
  try {
    let {
      category,
      type,
      brand,
      specifications,
      thickness,
      pattern,
      color,
      productName,
      description,
      sku,
      price,
      range,
      productDetails,
      petfriendly,
      waterresistant,
      scratchresistant,
    } = req.body;

    if (!category || !type || !brand) {
      return res.status(400).json({
        success: false,
        message: "Category, type and brand can't be empty",
      });
    }

    if (typeof specifications === "string") {
      specifications = JSON.parse(specifications);
    }

    const productImages = req.files?.productImage || [];
    const functionsImages = req.files?.functionsImage || [];

    if (!productImages.length) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const [uploadedProductImages, uploadedFunctionsImages] = await Promise.all([
      Promise.all(
        productImages.map((file) =>
          uploadToCloudinary(file.buffer, "Product/images"),
        ),
      ),
      Promise.all(
        functionsImages.map((file) =>
          uploadToCloudinary(file.buffer, "Product/function-images"),
        ),
      ),
    ]);

    const product = await Product.create({
      category,
      type,
      brand,
      thickness,
      pattern,
      color,
      productName,
      description,
      sku,
      price,
      range,
      productDetails,
      petfriendly,
      waterresistant,
      scratchresistant,
      specifications,
      productImage: uploadedProductImages,
      functionsImage: uploadedFunctionsImages,
    });

    res.status(201).json({
      success: true,
      message: "Product uploaded successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Uploading product failed",
      error: error.message,
    });
  }
};


const adminProductUpload= async (req, res) => {
  const products = [];
  const errors = [];

  fs.createReadStream(req.files.csv[0].path)
    .pipe(csv())
    .on("data", (row) => {   
      try {
        if (!row["Product Name"] || !row["SKU"]) {
          errors.push({ row, error: "Missing Product Name or SKU" });
          return;
        }

        // Extract Cloudinary public_id from URL
        const extractPublicId = (url) => {
          if (!url) return null;
          const parts = url.split("/");
          const file = parts[parts.length - 1];
          return file.split(".")[0];
        };

        const product = {
          category: row["Category"] || "Flooring",
          type: row["Type"] || "Hybrid",
          brand: row["Brand Name"] || "",
          productName: row["Product Name"],
          description: row["Description"] || "",
          productDetails: row["Product Details"] || "",
          sku: row["SKU"],
          thickness: row["Thickness"] || "",
          range: row["Range"] || "",
          price: row["Price"] || "",
          petfriendly: row["Pet Friendly"] || "",
          waterresistant: row["Water Resistant"] || "",
          scratchresistant: row["Scratch Resistant"] || "",
          brochurelink: row["Brochure Link"] || "",

          productImage: row["Product Image"]
            ? [
                {
                  url: row["Product Image"],
                  public_id: extractPublicId(row["Product Image"]),
                },
              ]
            : [],

          functionsImage: row["Function Image"]
            ? [
                {
                  url: row["Function Image"],
                  public_id: extractPublicId(row["Function Image"]),
                },
              ]
            : [],

          color: row["Color"] ? row["Color"].split(",") : [],

          specifications: {
            Warranty: row["Warranty"] || "",
            Rating: row["Rating"] || "",
          },
        };

        products.push(product);
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    })
    .on("end", async () => {
      try {
        await Product.insertMany(products, { ordered: false });

        fs.unlinkSync(req.files.csv[0].path);

        res.json({
          success: true,
          inserted: products.length,
          errors,
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
}


const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find();

    return res
      .status(200)
      .json({ success: true, message: "All product fetched", products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getProductsForCart = async (req, res) => {
  try {
    const { productIds } = req.body;

    // Validation
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "productIds must be an array",
      });
    }

    // Fetch all products using $in
    const products = await Product.find({
      _id: { $in: productIds },
    })

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching cart products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findById(id);

    return res
      .status(200)
      .json({ success: true, message: "All product fetched", products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductByTypeAndName = async (req, res) => {
  try {
    const { type, productName } = req.body;

    // Filter
    const filter = {};
    if (type) filter.type = type;
    if (productName) filter.productName = productName;

    // Filter by type
    const product = await Product.find(filter);

    // Return response
    return res.status(200).json({
      success: true,
      message: "Product fetch successfull",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductByType = async (req, res) => {
  try {
    const { type } = req.body;

    // Filter by type
    const product = await Product.find({ type });

    // Return response
    return res.status(200).json({
      success: true,
      message: "Product fetch successfull",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getProductByRange = async (req, res) => {
  try {
    const { range } = req.body;

    const allProducts = await Product.find();

    const filteredProducts = allProducts.filter(
      (item) => slugify(item.range) === range
    );


    return res.status(200).json({
      success: true,
      message: "Product fetch successful",
      product: filteredProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(200).json({ products: [] });
    }

    const search = name.trim();

    const products = await Product.find({
      productName: { $regex: search, $options: "i" }
    });


    return res.status(200).json({
      message: "Product fetched successfully",
      products
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};



const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product id can't be blank" });
    }

    let updateData = { ...req.body };

    console.log("Updated product data", updateData);

    // Safe JSON parse helper
    const safeParse = (data) => {
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch (err) {
          return data;
        }
      }
      return data;
    };

    // Parse JSON fields
    updateData.specifications = safeParse(updateData.specifications);
    updateData.color = safeParse(updateData.color);
    updateData.features = safeParse(updateData.features);
    updateData.details = safeParse(updateData.details);
    updateData.thickness = safeParse(updateData.thickness);

    updateData.existingProductImages = safeParse(updateData.existingProductImages);
    updateData.removedProductImages = safeParse(updateData.removedProductImages);

    // Convert numbers
    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.supplyPrice) {
      updateData.supplyPrice = Number(updateData.supplyPrice);
    }

    if (updateData.supplyInstallPrice) {
      updateData.supplyInstallPrice = Number(updateData.supplyInstallPrice);
    }

    // Check product exists
    const isProduct = await Product.findById(id);
    if (!isProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // DELETE REMOVED IMAGES FROM CLOUDINARY

    if (updateData.removedProductImages?.length) {
      for (const public_id of updateData.removedProductImages) {
        try {
          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }
    }

    // UPLOAD NEW IMAGES

    let newUploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "Product/images",
          });

          newUploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } catch (err) {
          console.error("Cloudinary upload error:", err);
        }
      }
    }


    // MERGE EXISTING + NEW IMAGES

    updateData.productImage = [
      ...(updateData.existingProductImages || []),
      ...newUploadedImages,
    ];


    // CLEANUP TEMP FIELDS

    delete updateData.existingProductImages;
    delete updateData.removedProductImages;

    // UPDATE PRODUCT

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });

  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const deleteProduct = async(req, res) => {
  try {
    // Get product id
    const {id}=req.params

    // Delete product
    const product = await Product.findByIdAndDelete({_id: id})

    // Return response
    return res.status(200).json({
      success: true,
      message: "Product delete successfully",
      data: product,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Product delete failed" });
  }
};

module.exports = {
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
};
