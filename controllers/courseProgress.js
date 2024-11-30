// controllers/courseProgress.js

exports.updateCourseProgress = async (req, res) => {
    // Your code for updating course progress
    res.status(200).send("Course Progress Updated");
  };
  
  exports.getProgressPercentage = async (req, res) => {
    // Your code for getting progress percentage
    res.status(200).json({ progress: 50 });
  };
  