const Course = require("../models/Course");
const Tag= require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// controllers/Course.js
exports.getAllCourses = (req, res) => {
    // Logic to fetch all courses
    res.status(200).json({ success: true, data: [] });
};


//createCourse handler function

exports.createCourse= async(req,res)=>{
    try{

        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price,tag}= req.body;

        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        // || !tag
        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price  || !thumbnail){
            return res.status(400).json({
                success:false,
                message:'All fileds are required',
            });
            
        }

        //check for instructor
        const userId= req.user.id;
        const instructorDetails= await User.findById(userId);
        console.log("instructor Details:", instructorDetails);

        if(!instructorDetails){
            return res.status(402).json({
                success:false,
                message:'Instructor details not found',
            });
        }

        //check given tag is valid or not
        // const tagDetails= await Tag.findById(tag);
        // if(!tagDetails){
        //     return res.status(400).json({
        //         success:false,
        //         message:'Tag Details not found',
        //     });
        // }

        //upload image to top cloudinary
        const thumbnailImage= await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse= await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            // tag: tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        //update the Tag schema
        // await Tag.findByIdAndUpdate(
        //     { _id: tagDetails._id },
        //     {
        //         $push: {
        //             courses: newCourse._id
        //         }
        //     },
        //     { new: true }
        // );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse,
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error:error.message,
        })
    }
};

//getAllCourse handler function

exports.showAllCourses = async(req,res)=>{
    try{
        //TODO: change the below statement incrementally
        const allCourses = await Course.find({},{courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReview:true,
                                                studentEnrolled:true,})
                                                .populate("instructor")
                                                .exec();
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetch successfully',
            data:allCourses,
        })                                        
    }
    catch(error){
        console.log(error);
        return res.ststud(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error: error.message,
        })
    }
}


// get course details
// controllers/Course.js

exports.getCourseDetails = (req, res) => {
    try {
      const { courseId } = req.body;
  
      // Logic to fetch course details from the database
      const course = {}; // Replace with database query
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
  
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  };
  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body;
  
      // Validate the input
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }
  
      // Fetch course details from the database (mock example)
      const course = {}; // Replace this with your actual database query logic
  
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
  
      // Send the response with course details
      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  
