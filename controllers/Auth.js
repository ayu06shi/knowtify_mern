const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Profile = require("../models/Profile");
require("dotenv").config();

// send OTP
exports.sendOTP = async(req, res) => {
    try {
        // fetch email from request body
        const {email} = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({email});

        // if user already exists, then return a response
        if(checkUserPresent){
            return res.status(402).json({
                success: false,
                message: "User already registered",
            })
        }

        // generate OTP  
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("OTP Generated: ", otp);

        // check unique otp or not
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayLoad = {email, otp};

        // create an entry in db for OTP
        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            suceess: true,
            message: "OTP sent successfully",
            otp,
            email,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// signUp handler
exports.signUp = async(req, res) => {

    try {

        // data fetch from req body
        const {
            firstName,
            lastName,
            email, 
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        console.log("Otp: ", otp)

        // validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        // match the 2 passwords
        if(password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password fields do not match, Try Again",
            });
        }


        // check if user already exists
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

         // find most recent otp stored for the user
         recentOtp = await OTP.findOne({email}).sort({createAt: -1}).limit(1);
         console.log(recentOtp);
 
         // validate otp
         if(recentOtp.length == 0) {
             // OTP not found
             return res.status(400).json({
                 success: false,
                 message: "OTP Not Found",
             })
         }
         // check otp with recentOtp (match both)
         else if(otp != recentOtp.otp){
             // invalid otp
             return res.status(400).json({
                 success: false,
                 message: "Invalid OTP",
             });
         }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)
        
        
        // create entry in DB

        // create profile
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        // return response
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "User cannot be registered. Please try again!",
        })
    }
    
}

// login handler
exports.login = async(req, res) => {
    try {
        // get data from req body
        const {email, password} = req.body;
        
        // validate data
        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        // check user existing or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.staus(401).json({
                success: false,
                message: "User is not registered, please signup first",
            })
        }

        // generate jwt, then match password
        if(await bcrypt.compare(password, user.password)) {
            const payLoad = {
                email: user.email,
                id: user._id, //this payload contains user._id 
                accountType: user.accountType,
            }

            const token = jwt.sign(payLoad, process.env.JWT_SECRET,{
                expiresIn: "2h",
            })
            user.token = token;
            user.password = undefined; 
        
            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*100),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user, 
                message: "Logged in Successfully"
            }) 
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again !",
        });
    }
};

// change Password
exports.changePassword = async(req, res) => {
    try {
        // get data from req body
        const userDetails = await User.findById(req.user.id);

        // get old password, newPassword, confirmNewPassword
        const {oldPassword, newPassword} = req.body;

        
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "All fields are required, please try again",
            })
        }


        // validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            })
        }
        
        // update password in DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: hashedPassword},
            {new: true}
        )

        // send mail: password updated notification
        try {
            const mailResponse = await mailSender(
                updatedUserDetails.email, 
                "Password for your account has been updated", 
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Password Updation mail sent successfully: ", mailResponse.response);
        } 
        catch (error) {
            console.log("Error occured while sending email: ", error.message);

            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
              })
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully!",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failure in changing password",
            error: error.message,
        })
    }
}