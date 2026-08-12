require("dotenv").config();
const express = require("express");
const connectDb = require("./db/db");
const router = require("./router/router");
const cors = require("cors");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const PORT = process.env.PORT || 5000;
connectDb();

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URI
  ? process.env.FRONTEND_URI.split(",").map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);
// Session configuration
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  expires: 7 * 24 * 60 * 60 * 1000,
});

// Catch errors
store.on('error', function(error) {
  console.error('Session store error:', error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Route
app.use("/api", router);

app.listen(PORT, () => {
  console.log("Listening at PORT: ", PORT);
});
