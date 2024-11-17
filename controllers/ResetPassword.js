// forgot password -> link generate -> sent on mail -> link open -> UI -> Update new password 
const User = require("../models/User")
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

// resetPasswordToken: this is for reset password email
exports.resetPasswordToken = async(req, res) => {
    try {
        // get email from req body
        const email = req.body.email;

        // check user for this email, email validation
        const user = await User.findOne({ email: email })
        if(!user) {
            return res.json({
                success: false,
                message: `This email: ${email} is not registered with us`,
            })
        }

        // generate token
        const token = crypto.randomBytes(20).toString('hex');

        // update token by adding user and expiration time
        const updatedDetails = await User.findOneAndUpdate(
        { email: email }, 
        {
            token: token,
            resetPasswordExpires: Date.now() + 5*60*1000,
        },
        { new: true });

        console.log("Details: ", updatedDetails)

        // create url
        const url = `http://localhost:3000/update-password/${token}`

        // send mail containing the url
        await mailSender(
            email, 
            "Password Reset Link",
            `Please click on this url - ${url} to reset your password.`
        );

        // return response
        res.json({
            success: true,
            message: "Email Sent Successfully, Please Check Your Email to continue further"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            erroe: error.message,
            success: false,
            message: "Something went wrong while sending reset password mail",
        });
    }    
}

// resetPassword
exports.resetPassword = async(req, res) => {
    try {
        // fetch data
        const {password, confirmPassword, token} = req.body;

        // validation
        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not matching"
            })
        }

        // how do we use token: we use token to find out user's entry, get user details from db using token
        const userDetails = await User.findOne({token: token});

        // if no entry, invalid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            })
        }

        // check token time: 5:05 is password expiry time, 6 is Date.now()
        if( userDetails.resetPasswordExpires < Date.now() ){
            return res.json({
                success: false,
                message: "Token is expired, Please regenerate your token",
            })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true},
        )

        // return response
        return res.status(200).json({
            success: true,
            message: "Pasword Reset Successful"
        });
    } 

    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }
}