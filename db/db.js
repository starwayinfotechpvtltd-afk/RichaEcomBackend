const mongoose=require("mongoose");


const connectDb=async()=>{
    try {
        console.log("MONGO URI:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb successfully connected")
    } catch (error) {
        console.log("Mongodb connection failed")
    }
}

module.exports=connectDb