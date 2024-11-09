const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
// import courseEnrollementEmail template

// capture the payment and initiate the Razorpay order
exports.capturePayment = async(req, res) => {
    // get courseId and userId
    const {course_id} = req.body;
    const userId = req.user.id;

    // valid courseId
    if(!course_id) {
        return res.json({
            success: false,
            message: "Please provide valid course ID"
        })
    }

    // valid courseDetail
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success: false,
                message: "Could not find the course",
            })
        }

        // user has already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: true,
                message: "Student is already enrolled",
            })
        }

        // create order
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount*100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,
                userId,
            }
        };

        try {
            // initiate payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
 
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId:paymentResponse.offer_id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            });
            // 1:03 hrs

        } catch (error) {
            console.error(error);
            return res.status(500).json({
            success: false,
            message: "Could not initiate order",
        })
        }

        // return response

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,  
            message: error.message,
        })
    }
};

// exports.verifySignature of Razorpay and Server
 
exports.verifySignature = async(req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers("x-razorpay-signature");

    // hmac means hash based message authentication code
    // hmac is a combination of hashing algorithm and secret key
    const shasum = crypto.createHmac("sha256", webhookSecret);

    // what is sha256 ?
    shasum.update(JSON.stringify(req.body));

    // output that comes after running hashing algo is called 'digest'
    const digest = shasum.digest("hex") ;
    // the web hook secret is converted now into digest

    // to check authorization
    if(signature === digest) {
        console.log("Payment is Authorized");

        // after authorizing payment, enroll strudent to that course

        // to get courseId, we need notes: req.body.payload.payment.entity.notes
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            // fulfill action

            // find the course and enroll the student in it.
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new: true},
            )

            if(!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not Found"
                })
            }

            console.log(enrolledCourse);

            // find student and add course to list of enrolled course :
            const enrolledStudent = await User.findOneAndUpdate(
                {_id: userId},
                {$push: {courses: courseId}},
                {new: true},
            );

            console.log(enrolledStudent);

            // send confirmation mail using mail sender
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from Knowtify",
                "Congratulations, you are onboarded into a new Knowtify Course"
            );
             return res.status(200).json({
                success: true,
                message: "Signature verified and course added"
             })
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }


    }
    else {
        return res.status(400).json({
            success: false,
            message: "Invalid Request"
        })
    }

    



}
