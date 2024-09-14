const SubSecion = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

//create subsection
exports.createSubSection = async(req, res) => {
    try {
        // get data from req.body
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file
        const video = req.files.videoFile;

        //validate data
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        //upload video to cloudinry
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create a subsection
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        //push subsection id into section
        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId},
            {
                $push: {
                    subSection: SubSectionDetails._id,
                }
            }, {
               new: true
            }
        );

        //log updated section here after adding populate query

        //return response
        return res.status(200).json({
            success: true,
            message:"SubSection created successfully",
            updatedSection,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}