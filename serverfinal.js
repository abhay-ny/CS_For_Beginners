const express=require("express");
const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require("path");
const app=express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const port=3013;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded; // Store decoded token (user info) in request
        next();
    });
};



//mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/fwd").then(()=>
    console.log("Mongodb connected"))
    .catch((err)=> console.log("Mongo error:",err));
 //youtube-app-1 is the name of our database)


//mongoose schema
//mongoose schema
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {  // Added password field
        type: String,
        required: true,
    },
    requestedCourses: {  // Added array to store requested courses
        type: [String],
        default: [],
    }
}, {timestamps: true});  // This notes the time at which we create or update data in MongoDB
//this notes the time at which we create or update data in mongodb

//model of schema
const User=mongoose.model("user",userSchema); //user becomes users as a collection in our database

app.use(express.urlencoded({extended:false}))//helps to insert the form-urlencoded data that we are sending throught postman as request, into req.body as a JSON
// If we are trying to send data through request as json, use app.use(express.json()); This parses JSON requests and converts a JSOn object having the data which can be accessed in req.body
app.use(express.json()); // parse JSON data
app.use(bodyParser.urlencoded({ extended: true })); // For parsing URL-encoded data
app.use(express.static(path.join(__dirname)));






app.get("/index", (req,res) =>{
    console.log("Home page");
    res.sendFile(path.join(__dirname, 'index.html')); 
});
app.get("/about", (req,res) =>{
    console.log("About page");
    res.sendFile(path.join(__dirname, 'about.html')); 
});
app.get("/Coding_Etiquette", (req,res) =>{
    console.log("Coding Etiquette page");
    res.sendFile(path.join(__dirname, 'Coding_Etiquette.html')); 
});
app.get("/Creator_of_this_website", (req,res) =>{
    console.log("Creator of this website page page");
    res.sendFile(path.join(__dirname, 'Creator_of_this_website.html')); 
});
app.get("/Request_course", (req,res) =>{
    console.log("Requestcource page");
    res.sendFile(path.join(__dirname, 'Request_course.html')); 
});
app.get("/sign_up", (req,res) =>{
    console.log("Sign up page");
    res.sendFile(path.join(__dirname, 'sign_up.html')); 
});
app.get("/log_in", (req,res) =>{
    console.log("log in page");
    res.sendFile(path.join(__dirname, 'log_in.html')); 
});
app.get("/c_page", (req,res) =>{
    console.log("C page");
    res.sendFile(path.join(__dirname, 'c_page.html')); 
});
app.get("/cplusplus_page", (req,res) =>{
    console.log("C++ page");
    res.sendFile(path.join(__dirname, 'cplusplus_page.html')); 
});
app.get("/java", (req,res) =>{
    console.log("Java page");
    res.sendFile(path.join(__dirname, 'java.html')); 
});
app.get("/python_page", (req,res) =>{
    console.log("Python page");
    res.sendFile(path.join(__dirname, 'python_page.html')); 
});
app.get("/Mysql_page", (req,res) =>{
    console.log("Mysql page");
    res.sendFile(path.join(__dirname, 'Mysql_page.html')); 
});
app.get("/html_page", (req,res) =>{
    console.log("html page");
    res.sendFile(path.join(__dirname, 'html_page.html')); 
});
app.get("/css_page", (req,res) =>{
    console.log("CSS page");
    res.sendFile(path.join(__dirname, 'css_page.html')); 
});
app.get("/java_script_page", (req,res) =>{
    console.log("Javascipt page");
    res.sendFile(path.join(__dirname, 'java_script_page.html')); 
});
//       routes







//for post,patch and delete request, we are currently using postman app

app.post("/api/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the username or email is already taken
    try {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign({ id: newUser ._id, username: newUser .username }, 'your_secret_key', { expiresIn: '1h' });
        // Return success message and token
        return res.status(200).json({ message: "User successfully created" ,token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred during sign-up" });
    }
});


app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    // Check if both fields are provided
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Both username and password are required" });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ success: false, message: "Username is incorrect" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Password is incorrect" });
        }
        // Generate JWT
        const token = jwt.sign({ id: user._id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });

        // Successful login
        return res.status(200).json({ success: true, message: "Login successful",token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});





//                   Request cource functionality
const courseSchema = new mongoose.Schema({
    name: String,
});

// Course Schema for requested courses
const requestedCourseSchema = new mongoose.Schema({
    name: String,
});

const Course = mongoose.model('Course', courseSchema, 'availableCourses'); // Collection for available courses
const RequestedCourse = mongoose.model('RequestedCourse', requestedCourseSchema, 'requestedCourses'); // Collection for requested courses

// Function to check if a programming language exists using Wikipedia API
async function checkProgrammingLanguage(languageName) {
    try {
        const response = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                format: 'json',
                list: 'allpages',
                apfrom: languageName,
                apprefix: languageName,
                aplimit: 1,
            },
        });

        const pages = response.data.query.allpages;
        return pages.length > 0 && pages[0].title.toLowerCase() === languageName.toLowerCase();
    } catch (error) {
        console.error("Error fetching programming languages:", error);
        return false;
    }
}


//cource request endpoint
app.post('/api/request-course', verifyToken, async (req, res) => {
    const courseName = req.body.courseName.toLowerCase().trim();
    const userId = req.user.id; // Get user ID from the token

    try {
        // Check if the programming language exists
        const languageExists = await checkProgrammingLanguage(courseName);
        if (!languageExists) {
            return res.status(400).json({ success: false, message: 'This programming language does not exist. Please enter a valid language.' });
        }

        // Check if the course exists in available courses collection
        const existingCourse = await Course.findOne({ name: courseName });
        if (existingCourse) {
            return res.status(200).json({ success: false, message: 'The course is already available. Do check it out.' });
        }

        // Add the requested course to the user's requestedCourses array if not already present
        const user = await User.findById(userId);

        if (!user.requestedCourses.includes(courseName)) {
            await User.findByIdAndUpdate(userId, { $push: { requestedCourses: courseName } });

            // Optionally, add the course to the requestedCourses collection if it's not there
            const existingRequest = await RequestedCourse.findOne({ name: courseName });
            if (!existingRequest) {
                const newRequestedCourse = new RequestedCourse({ name: courseName });
                await newRequestedCourse.save();
            }

            return res.status(200).json({ success: true, message: 'Request received. We will work on providing it!' });
        } else {
            return res.status(200).json({ success: true, message: 'You have already requested this course!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
    }
});





// Function to add a course to Course table (available courses)
async function addCourse(courseName) {
    try {
        const lowerCaseCourseName = courseName.toLowerCase().trim();

        // Check if the course already exists in available courses
        const existingCourse = await Course.findOne({ name: lowerCaseCourseName });

        if (existingCourse) {
            console.log('This course already exists in available courses.');
            return;
        }

        // Create a new course and save it to available courses
        const newCourse = new Course({ name: lowerCaseCourseName });
        await newCourse.save();

        // Remove the course from requested courses if it exists
        const result = await RequestedCourse.deleteOne({ name: lowerCaseCourseName });

        if (result.deletedCount > 0) {
            console.log(`Removed ${lowerCaseCourseName} from requested courses.`);
        } else {
            console.log(`No matching request found for ${lowerCaseCourseName} in requested courses.`);
        }
        console.log('Course added successfully!');





        const users = await User.find({ requestedCourses: lowerCaseCourseName });

        if (users.length > 0) {
            // Remove the course from users' requestedCourses arrays
            await User.updateMany(
                { requestedCourses: lowerCaseCourseName },
                { $pull: { requestedCourses: lowerCaseCourseName } }
            );
            console.log(`Removed "${lowerCaseCourseName}" from users' requested courses.`);
        } else {
            console.log(`No users had requested the course "${lowerCaseCourseName}".`);
        }     
    } catch (error) {
        console.error('An error occurred while adding the course:', error);
    }
}

// Example usage of addCourse function (you can call this wherever appropriate)
//addCourse('erlang');  // Call this function whenever you want to add a new course



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
