require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const mongoURL = "mongodb+srv://paridhisindhu6_db_user:YRu441H6GrrEtejA@cluster0.w2f8ehr.mongodb.net/TaskDB?appName=Cluster0";

mongoose.connect(mongoURL)
.then(() => {
    console.log("Connected to database successfully");
})
.catch((error) => {
    console.log("Error connecting to database", error);
});

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'inline',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    dueDate: { type: Date },
    fileUrl: { type: String }
}, { timestamps: true });

const taskModel = mongoose.model("Task", taskSchema);

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: "Access Denied. Token missing!" });

    try {
        const verified = jwt.verify(token, 'mysecretkey');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid Token!" });
    }
};

app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const allTasks = await taskModel.find({ userId: req.user.userId });
        res.json({ success: true, data: allTasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/tasks', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const newTask = await taskModel.create({
            title: req.body.title,
            completed: false,
            userId: req.user.userId,
            category: req.body.category || 'General',
            dueDate: req.body.dueDate || null,
            fileUrl: req.file ? req.file.location : null
        });
        res.json({ success: true, message: "Task added successfully", data: newTask });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ success: false, message: "Error adding task" });
    }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskID = req.params.id;
        const deletedTask = await taskModel.findOneAndDelete({ _id: taskID, userId: req.user.userId });
        res.json({ success: true, message: "Task deleted successfully", data: deletedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting task" });
    }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskID = req.params.id;
        const newData = req.body;
        const updatedTask = await taskModel.findOneAndUpdate({ _id: taskID, userId: req.user.userId }, newData, { returnDocument: 'after' });
        res.json({ success: true, message: "Task updated successfully", data: updatedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating task" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email: email,
            password: hashedPassword
        });
        res.json({ success: true, message: "User registered successfully!", data: newUser });
    } catch (err) {
        console.log("Registration error:", err);
        res.status(500).json({ success: false, message: "Error registering user" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password!" });
        }
        const token = jwt.sign({ userId: user._id }, 'mysecretkey', { expiresIn: '1d' });
        res.json({ success: true, message: "Login successful!", token: token });
    } catch (err) {
        console.log("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});