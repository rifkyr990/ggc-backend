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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'https://ggc-frontend.vercel.app/',
    credentials: true, 
  })
);


app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/articles", articlesRoutes);
app.use("/perumahan", perumahanRoutes);
app.use("/fasilitas", fasilitasRoutes);
app.use('/lowongan', lokerRoutes);
app.use('/visitors', visitorRoutes);

app.get("/", async (req, res) => {
  res.send("Hello from Express + TypeScript + Prisma!");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
