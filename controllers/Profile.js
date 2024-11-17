const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

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
exports.deleteAccount = async(req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validate id
        const userDetails = await User.findById(id);

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({
            _id: userDetails.additionalDetails,
        });

        // to do: unenroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({
            _id: id,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be deleted",
            error: error.message,
        })
    }
}

exports.getAllUserDetails = async(req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validate id
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();

        console.log(userDetails)

        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "User Data Fetched Successfully",
            data: userDetails,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files?.displayPicture;

        if (!displayPicture) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )

        console.log(image)

        const userId = req.user.id;
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )

        res.send({
            success: true,
            message: `Image Uploaded successfully`,
            data: updatedProfile,
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