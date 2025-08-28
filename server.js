const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // ✅ Import added
require('dotenv').config();
const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/posts")
const userRoutes = require("./routes/users")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Corrected CORS origin (no trailing slash)
// app.use(cors({
//   origin: process.env.CLIENT_URI,
//   credentials: true,
// }));


// // for local server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));