const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
// const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

console.log("userRoutes:", userRoutes);
console.log("profileRoutes:", profileRoutes);

// console.log("paymentRoutes:", paymentRoutes);

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());	

// app.use(
// 	fileUpload({
// 		useTempFiles:true,
// 		tempFileDir:"/tmp",
// 	})
// )

// cloudinary connection
cloudinaryConnect();

//routes
app.use("/auth", userRoutes);
app.use("/profile", profileRoutes);
app.use("/reach", contactUsRoute);
app.use("/course", courseRoutes);
// app.use("/payment", paymentRoutes);


//def route	

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})