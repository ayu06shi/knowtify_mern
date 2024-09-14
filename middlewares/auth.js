const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async(req, res, next) => {
    try {
        // extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

        // if token missing, then return response
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            })
        }

        // verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode; //stores decode payload value in req.user
        }
        catch(err){
            // verification issue
            return res.status(401).json({
                success: false,
                message: "Token is Invalid",
            });
        }
        next(); // to go to the next middleware
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Something went wrong during token validation"
        })
    }
}

// isStudent
exports.isStudent = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students Only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User's role cannot be verified!",
        })
    }
}

// isInstructor
exports.isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructors Only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User's role cannot be verified!",
        })
    }
}

// isAdmin
exports.isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin Only",
            })
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User's role cannot be verified!",
        })
    }
}