const Job = require('../models/jobModel');
const JobType = require('../models/jobTypeModel');
const ErrorResponse = require('../utils/errorResponse');

//create job
exports.createJob = async (req, res, next) => {
    try {
        const job = await Job.create({
            title: req.body.title,
            description: req.body.description,
            salary: req.body.salary,
            location: req.body.location,
            jobType: req.body.jobType,
            user: req.user.id
        });
        res.status(201).json({
            success: true,
            job
        })
    } catch (error) {
        next(error);
    }
}


//single job
exports.singleJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        res.status(200).json({
            success: true,
            job
        })
    } catch (error) {
        next(error);
    }
}


//update job by id.
exports.updateJob = async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.job_id, req.body, { new: true }).populate('jobType', 'jobTypeName').populate('user', 'firstName lastName');
        res.status(200).json({
            success: true,
            job
        })
    } catch (error) {
        next(error);
    }
}


//update job by id.
exports.showJobs = async (req, res, next) => {
    try {
        const keyword = req.query.keyword ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const jobTypeCategory = await JobType.find();
        const ids = jobTypeCategory.map(cat => cat._id);
        const categ = req.query.cat || ids;

        const jobByLocation = await Job.find().distinct('location');
        const locationFilter = req.query.location || jobByLocation;

        const pageSize = 5;
        const page = Number(req.query.pageNumber) || 1;
        const count = await Job.find({ ...keyword, jobType: categ, location: locationFilter }).countDocuments();

        const jobs = await Job.find({ ...keyword, jobType: categ, location: locationFilter })
            .populate('jobType', 'jobTypeName')
            .populate('user', 'firstName')
            .sort({ createdAt: -1 })
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        res.status(200).json({
            success: true,
            jobs,
            page,
            pages: Math.ceil(count / pageSize),
            count,
            setUniqueLocation: jobByLocation
        });
    } catch (error) {
        next(error);
    }
}





