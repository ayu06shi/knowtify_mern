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
            return res.status(400).jso({
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