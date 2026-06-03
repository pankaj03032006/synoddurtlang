const User = require("../models/user.js");
const Patient = require("../models/patient.js");
const Doctor = require("../models/doctor.js");

const getUsers = async (req, res) => {
    try {
        const name = req.query.name;
        const role = req.query.role;

        let conditions = [];

        if (name) {
            // Use regex for partial name matching
            const nameRegex = new RegExp(name, 'i');
            conditions.push({ firstName: nameRegex });
            conditions.push({ lastName: nameRegex });
        }

        if (role) {
            conditions.push({ userType: role });
        }
        
        let users = [];
        if (conditions.length === 0) {
            users = await User.find({});
        } else {
            users = await User.find({
                $or: conditions
            });
        }

        res.json(users);
    } catch (error) {
        console.error("Error in getUsers:", error);
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user);
    } catch (error) {
        console.error("Error in getUserById:", error);
        res.status(500).json({ message: error.message });
    }
}

const isUserValid = (newUser, isUpdate = false) => {
    let errorList = [];
    
    if (!newUser.firstName || newUser.firstName.trim() === "") {
        errorList.push("Please enter first name");
    }
    if (!newUser.lastName || newUser.lastName.trim() === "") {
        errorList.push("Please enter last name");
    }
    if (!newUser.email || newUser.email.trim() === "") {
        errorList.push("Please enter email");
    }
    
    // Only validate password for new users (not required for update)
    if (!isUpdate) {
        if (!newUser.password) {
            errorList.push("Please enter password");
        }
        if (!newUser.confirmPassword) {
            errorList.push("Please re-enter password in Confirm Password field");
        }
        if (newUser.password !== newUser.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newUser.password && newUser.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    } else {
        // For update, validate password only if provided
        if (newUser.password && newUser.password !== newUser.confirmPassword) {
            errorList.push("Password and Confirm Password did not match");
        }
        if (newUser.password && newUser.password.length <= 6) {
            errorList.push("Password length must be greater than 6 characters");
        }
    }
    
    if (!newUser.userType) {
        errorList.push("Please enter User Type");
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const saveUser = async (req, res) => {
    let newUser = req.body;
    
    if (!newUser) {
        return res.status(400).json({
            message: 'error',
            errors: ["User data is required"]
        });
    }
    
    let userValidStatus = isUserValid(newUser, false);
    if (!userValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: userValidStatus.errors
        });
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            return res.status(400).json({
                message: 'error',
                errors: ["User with this email already exists"]
            });
        }
        
        // Create user
        const userDetails = await User.create({
            email: newUser.email,
            username: newUser.username || newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            password: newUser.password,
            userType: newUser.userType,
            activated: true
        });
        
        let profileDetails = null;
        
        // Create role-specific profile
        if (newUser.userType === "Doctor") {
            profileDetails = await Doctor.create({
                userId: userDetails._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            });
        } else if (newUser.userType === "Patient") {
            profileDetails = await Patient.create({
                userId: userDetails._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            });
        }
        
        res.status(201).json({ message: "success" });
        
    } catch (error) {
        console.error("Error in saveUser:", error);
        
        // Rollback: Delete user if profile creation failed
        if (error && userDetails) {
            await User.deleteOne({ _id: userDetails._id });
        }
        
        res.status(500).json({ 
            message: 'error', 
            errors: [error.message || "Failed to create user"] 
        });
    }
}

const updateUser = async (req, res) => {
    let newUser = req.body;
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            message: 'error',
            errors: ["User ID is required"]
        });
    }
    
    let userValidStatus = isUserValid(newUser, true);
    if (!userValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: userValidStatus.errors
        });
    }
    
    try {
        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                message: 'error',
                errors: ["User not found"]
            });
        }
        
        // Check for duplicate email (excluding current user)
        if (newUser.email && newUser.email !== existingUser.email) {
            const duplicateUser = await User.findOne({ 
                email: newUser.email,
                _id: { $ne: id }
            });
            if (duplicateUser) {
                return res.status(400).json({
                    message: 'error',
                    errors: ["User with this email already exists"]
                });
            }
        }
        
        // Prepare update data
        const updateData = {};
        if (newUser.firstName) updateData.firstName = newUser.firstName;
        if (newUser.lastName) updateData.lastName = newUser.lastName;
        if (newUser.email) updateData.email = newUser.email;
        if (newUser.username) updateData.username = newUser.username;
        if (newUser.userType) updateData.userType = newUser.userType;
        if (newUser.password) updateData.password = newUser.password;
        
        const updatedUser = await User.updateOne(
            { _id: id }, 
            { $set: updateData }
        );
        
        if (updatedUser.matchedCount === 0) {
            return res.status(404).json({
                message: 'error',
                errors: ["User not found"]
            });
        }
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updateUser:", error);
        res.status(500).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Delete role-specific profile first
        if (user.userType === 'Doctor') {
            await Doctor.deleteOne({ userId: id });
        } else if (user.userType === 'Patient') {
            await Patient.deleteOne({ userId: id });
        }
        
        // Delete user
        const deletedUser = await User.deleteOne({ _id: id });
        
        if (deletedUser.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ 
            message: 'success',
            deleted: deletedUser
        });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser
};