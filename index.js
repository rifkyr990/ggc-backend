require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./src/routes/user");
const authRoutes = require("./src/routes/auth");
const perumahanRoutes = require("./src/routes/perumahan");
const articlesRoutes = require("./src/routes/article");
const fasilitasRoutes = require("./src/routes/fasilitas");
const lokerRoutes = require("./src/routes/loker");
const visitorRoutes = require("./src/routes/visitor");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',                 // local dev
  'https://grahagloriagroup.vercel.app',
  'https://grahagloriagroup.com/' // production vercel
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/articles", articlesRoutes);
app.use("/perumahan", perumahanRoutes);
app.use("/fasilitas", fasilitasRoutes);
app.use("/lowongan", lokerRoutes);
app.use("/visitors", visitorRoutes);

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express + Prisma!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
