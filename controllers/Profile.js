const Profile = require('../models/Profile');
const User = require('../models/User');

exports.updateProfile = async(req, res) => {
    try {
        //get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        //get userID
        const id = req.user.id;

        //data validation
        if(!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        //return response
        return res.status(200).json({
            success: true,
            message: 'Profile Updated Successfully',
            profileDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// deleteAccount

exports.deleteAccount = async (req, res) => {
    try {
      const id = req.user.id
      console.log(id)
      const user = await User.findById({ _id: id })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }
      // Delete Assosiated Profile with the User
      await Profile.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(user.additionalDetails),
      })
      for (const courseId of user.courses) {
        await Course.findByIdAndUpdate(
          courseId,
          { $pull: { studentsEnroled: id } },
          { new: true }
        )
      }
      // Now Delete User
      await User.findByIdAndDelete({ _id: id })
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
      await CourseProgress.deleteMany({ userId: id })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "User Cannot be deleted successfully" })
    }
  }

exports.getAllUserDetails = async(req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validate id
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "User Data Fetched Successfully"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// how to schedule requests for deleting accounts
// cron job