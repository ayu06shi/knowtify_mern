const Tag = require("../models/Tags");

//create Tag to handler function

exports.createTag = async(req, res)=> {
    try{
        //fetch data
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
        //create entry in DB
        const tagdetails=await Tag.create({
            name:name,  
            description:description,
        });
        console.log(tagDetails);
        //return response

        return res.status(200).json({
            success:true,
            message:'tag created successfully',
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//getAlltags handler function

exports.showAlltags= async(req,res)=>{
    try{
        const allTgs = await Tag.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:'All tags returns successfully',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.messsage,
        })
    }
}