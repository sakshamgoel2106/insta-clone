import followModel from "../models/follow.model.js";
import usermodel from "../models/auth.model.js";

async function followUser(req,res){

   

    const follower = await usermodel.findOne({username: req.user.username})
    const followee = await usermodel.findOne({username: req.params.username})

     if(req.user.username === req.params.username){
        return res.status(400).json({
            message:"you cannot follow yourself"
        })
    }

    const isfolloweeexist = await usermodel.findOne({
        username: req.params.username
    })
    if(!isfolloweeexist){
        return res.status(400).json({
            message:"user you are trying to follow does not exist"
        })
    }
    

    const isalreadyfollwing = await followModel.findOne({
        follower: follower._id,
        followee: followee._id
    })

    if (isalreadyfollwing){
        return res.status(200).json({
            message:"you are already following this user"
        })
    }

    const followrecord = await followModel.create({
        follower: follower._id,followername: follower.username,
        followee: followee._id,followeename: followee.username
    })

    res.status(200).json({
        message:`you are now following ${req.params.username}`,
        follow : followrecord
    })
}


async function unfollowUser(req,res){
    const follower = await usermodel.findOne({username: req.user.username})
    const followee = await usermodel.findOne({username: req.params.username})

    const isalreadyfollwing = await followModel.findOne({
        follower: follower._id,
        followee: followee._id
    })

    if (!isalreadyfollwing){
        return res.status(200).json({
            message:"you are not following this user"
        })
    }

    await followModel.findByIdAndDelete(isalreadyfollwing._id)
    res.status(200).json({
        message:`you are no longer following ${req.params.username}`
    })


}

export {followUser , unfollowUser}