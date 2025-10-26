import User from "../models/User.js";

//Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    const auth = req.auth();
    
    if (!auth || !auth.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized - Authentication required" 
      });
    }
    
    const user = await User.findById(auth.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};
