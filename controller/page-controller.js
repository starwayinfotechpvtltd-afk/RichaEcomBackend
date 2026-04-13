const Page=require("../module/page-module")

// POST /api/page — Create or update a page by slug
const publishPage = async (req, res) => {
  try {
    const { slug, content, status, title, customCss, theme, html } = req.body;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Slug is required and must be a non-empty string.",
      });
    }

    const sanitizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

    if (!content || typeof content !== "object") {
      return res.status(400).json({
        success: false,
        message: "Content is required and must be a valid object.",
      });
    }

    // Upsert — update if exists, create if not
    const page = await Page.findOneAndUpdate(
      { slug: sanitizedSlug },
      {
        slug: sanitizedSlug,
        content,
        status,
        title,
        customCss,
        theme,
        html,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: `Page "${sanitizedSlug}" published successfully.`,
      data: page,
    });

  } catch (err) {
    console.error("[publishPage] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Failed to publish page.",
      error: err.message,
    });
  }
};

// GET /api/page/:slug — Fetch a page by slug
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({ slug: slug.toLowerCase() });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: `Page "${slug}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: page,
    });

  } catch (err) {
    console.error("[getPageBySlug] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// GET /api/pages — List all pages
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({}, { slug: 1, status: 1, updatedAt: 1, createdAt: 1 })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });

  } catch (err) {
    console.error("[getAllPages] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// DELETE /api/page/:slug — Delete a page
const deletePage = async (req, res) => {
  try {
    const { slug } = req.params;

    const deleted = await Page.findOneAndDelete({ slug: slug.toLowerCase() });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Page "${slug}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Page "${slug}" deleted successfully.`,
    });

  } catch (err) {
    console.error("[deletePage] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

module.exports={publishPage, getPageBySlug, getAllPages, deletePage}