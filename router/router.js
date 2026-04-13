const express=require("express")
const authRouter=require("./auth-router")
const cartRouter=require("./cart-route")
const productRouter=require("./product-route")
const pageRouter = require("./page-router")

const router=express()
router.use("/auth", authRouter)
router.use("/cart", cartRouter)
router.use("/product", productRouter)
router.use("/page", pageRouter)


module.exports=router