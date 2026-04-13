const mongoose=require("mongoose")

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens and underscores"],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status:{
      type: String,
      enum: ["draft", "publish"],
      default: "draft"
    },
    html: {
  type: String,
},
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

const Page= mongoose.model("Page", pageSchema);

module.exports=Page