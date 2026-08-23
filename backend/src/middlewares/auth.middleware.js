import jwt from "jsonwebtoken"



async function identifyuser(req,res,next){
    const token = req.cookies.jwt_token;

    if(!token){
        res.status(401).json({
            message:"unauthorized access , token not provided"
        })
    }
    let decoded;
    try{
         decoded = jwt.verify(token,process.env.JWT_SECRET); //isme user ki id mil jayegi
    }catch(err){
        return res.status(401).json({
            message:"unauthorized access , token invalid"
        })
    }

    req.user = decoded;
    next();

}

export {identifyuser}

