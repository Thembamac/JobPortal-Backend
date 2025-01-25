const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
var cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobTypeRoute = require('./routes/jobsTypeRoutes');
const jobRoute = require('./routes/jobsRoutes');
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

mongoose.connect(process.env.DATABASE, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 serverSelectionTimeoutMS: 15000,
 socketTimeoutMS: 45000,
 connectTimeoutMS: 15000,
 keepAlive: true,
 keepAliveInitialDelay: 300000
})
.then(() => console.log("DB connected"))
.catch((err) => {
 console.error("MongoDB connection error:", err);
 process.exit(1);
});

mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
app.use(cors({
 origin: [
   "https://mern-jobportal-rh5a.onrender.com",
   "http://localhost:3000"
 ],
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE'],
 allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', jobTypeRoute);
app.use('/api', jobRoute);

__dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
 app.use(express.static(path.join(__dirname, '/frontend/build')));
 app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html')));
} else {
 app.get('/', (req, res) => res.send('API is running....'));
}

app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on port ${port}`));