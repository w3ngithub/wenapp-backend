const asyncError = require('../utils/asyncError');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const {
  DELETE_ACTIVITY_LOG_MESSAGE,
  UPDATE_ACTIVITY_LOG_MESSAGE,
  CREATE_ACTIVITY_LOG_MESSAGE,
  LEAVETYPES
} = require('../utils/constants');
const User = require('../models/users/userModel');
const UserLeave = require('../models/leaves/UserLeavesModel');
const LeaveTypes = require('../models/leaves/leaveTypeModel');
const { LeaveQuarter } = require('../models/leaves/leaveQuarter');
const { todayDate, getNumberOfMonthsInAQuarter } = require('../utils/common');

exports.getOne = (Model, popOptions) =>
  asyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields();

    const doc = await features.query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = (Model) =>
  asyncError(async (req, res, next) => {
    const features = new APIFeatures(Model.find({}), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .search();

    const [doc, count] = await Promise.all([
      features.query,
      Model.countDocuments(features.formattedQuery)
    ]);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
        count
      }
    });
  });

exports.createOne = (Model, LogModel, ModelToLog) =>
  asyncError(async (req, res, next) => {
    const reqBody = { ...req.body, createdBy: req.user.id };

    const doc = await Model.create(reqBody);

    let newDoc = null;
    if (ModelToLog === 'Leave' || ModelToLog === 'Attendance') {
      newDoc = await User.findOne({ _id: doc.user });
    }

    if (LogModel) {
      if (ModelToLog === 'Attendance') {
        if (req.user.name !== newDoc.name) {
          LogModel.create({
            status: 'created',
            module: ModelToLog,
            activity: CREATE_ACTIVITY_LOG_MESSAGE[ModelToLog](
              req.user.name,
              ModelToLog,
              newDoc.name || newDoc.title,
              reqBody.punchOutTime
            ),
            user: {
              name: req.user.name,
              photo: req.user.photoURL
            }
          });
        }
      } else {
        LogModel.create({
          status: 'created',
          module: ModelToLog,
          activity: CREATE_ACTIVITY_LOG_MESSAGE[ModelToLog](
            req.user.name,
            ModelToLog,
            newDoc ? newDoc.name || newDoc.title : doc.name || doc.title
          ),
          user: {
            name: req.user.name,
            photo: req.user.photoURL
          }
        });
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = (Model, LogModel, ModelToLog) =>
  asyncError(async (req, res, next) => {
    let prevDoc = null;

    if (ModelToLog === 'User') {
      prevDoc = await Model.findById(req.params.id);
    }

    const reqBody = { ...req.body, updatedBy: req.user.id };
    const doc = await Model.findByIdAndUpdate(req.params.id, reqBody, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    let newDoc = null;

    if (ModelToLog === 'User' && req.body.status === 'Permanent') {
      if (prevDoc.status === 'Probation' && doc.status === 'Permanent') {
        // update status change Date of user
        await Model.findByIdAndUpdate(
          req.params.id,
          { statusChangeDate: todayDate() },
          {
            new: true,
            runValidators: true
          }
        );

        const latestYearQuarter = await LeaveQuarter.findOne().sort({
          createdAt: -1
        });

        const userLeaveDoc = await UserLeave.findOne({
          user: doc._id,
          fiscalYear: latestYearQuarter.fiscalYear
        });

        const currentQuarter = latestYearQuarter.quarters.find(
          (quarter) =>
            new Date(quarter.fromDate) <= new Date(todayDate()) &&
            new Date(todayDate()) <= new Date(quarter.toDate)
        );

        const currentQuarterAllocatedLeaves =
          currentQuarter.leaves -
          getNumberOfMonthsInAQuarter(todayDate(), currentQuarter.fromDate);

        userLeaveDoc.leaves = userLeaveDoc.leaves.map((leave) =>
          leave.quarter._id.toString() === currentQuarter._id.toString()
            ? {
                ...leave,
                allocatedLeaves: currentQuarterAllocatedLeaves,
                remainingLeaves: currentQuarterAllocatedLeaves,
                approvedLeaves: {
                  sickLeaves: 0,
                  casualLeaves: 0
                },
                carriedOverLeaves: 0
              }
            : leave
        );

        const leaveTypes = await LeaveTypes.find();

        const sickLeave = leaveTypes.find(
          (type) =>
            type.name.toString().toLowerCase() ===
            LEAVETYPES.casualLeave.toString().toLowerCase()
        );
        const causalLeave = leaveTypes.find(
          (type) =>
            type.name.toString().toLowerCase() ===
            LEAVETYPES.sickLeave.toString().toLowerCase()
        );

        const indexOfCurrentQuarter = latestYearQuarter.quarters.findIndex(
          (quarter) =>
            new Date(quarter.fromDate) <= new Date(todayDate()) &&
            new Date(todayDate()) <= new Date(quarter.toDate)
        );

        const futureQuartersLeaves = latestYearQuarter.quarters
          .slice(indexOfCurrentQuarter + 1)
          .reduce((acc, q) => (q.leaves ? acc + q.leaves : 0), 0);

        const updatedYearAllocatedLeave =
          futureQuartersLeaves + currentQuarterAllocatedLeaves;

        const totalSickCausalLeave =
          sickLeave.leaveDays + causalLeave.leaveDays;

        const leaveNotEntitled =
          totalSickCausalLeave - (updatedYearAllocatedLeave || 0);

        userLeaveDoc.yearSickAllocatedLeaves =
          leaveNotEntitled > sickLeave.leaveDays
            ? 0
            : sickLeave.leaveDays - leaveNotEntitled;

        userLeaveDoc.yearCausalAllocatedLeaves =
          leaveNotEntitled > sickLeave.leaveDays
            ? causalLeave.leaveDays - (leaveNotEntitled - sickLeave.leaveDays)
            : sickLeave.leaveDays;

        console.log({
          leaveNotEntitled,
          userLeaveDoc,
          totalSickCausalLeave,
          updatedYearAllocatedLeave,
          futureQuartersLeaves,
          currentQuarterAllocatedLeaves
        });

        await userLeaveDoc.save();
      }
    }

    if (ModelToLog === 'Attendance') {
      newDoc = await User.findOne({ _id: doc.user });
    }

    if (LogModel) {
      if (ModelToLog === 'Attendance') {
        LogModel.create({
          status: 'updated',
          module: ModelToLog,
          activity: UPDATE_ACTIVITY_LOG_MESSAGE[ModelToLog](
            req.user.name,
            ModelToLog,
            newDoc.name || newDoc.title,
            reqBody.punchOutTime ? 'Out' : 'In'
          ),
          user: {
            name: req.user.name,
            photo: req.user.photoURL
          }
        });
      } else if (ModelToLog === 'Leave') {
        LogModel.create({
          status: 'updated',
          module: ModelToLog,
          activity: UPDATE_ACTIVITY_LOG_MESSAGE[ModelToLog](
            req.user.name,
            ModelToLog,
            doc.user.name
          ),
          user: {
            name: req.user.name,
            photo: req.user.photoURL
          }
        });
      } else {
        LogModel.create({
          status: 'updated',
          module: ModelToLog,
          activity: UPDATE_ACTIVITY_LOG_MESSAGE[ModelToLog](
            req.user.name,
            ModelToLog,
            doc.name || doc.title
          ),
          user: {
            name: req.user.name,
            photo: req.user.photoURL
          }
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.deleteOne = (Model, LogModel, ModelToLog) =>
  asyncError(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (LogModel) {
      LogModel.create({
        status: 'deleted',
        module: ModelToLog,
        activity: DELETE_ACTIVITY_LOG_MESSAGE[ModelToLog](
          req.user.name,
          ModelToLog,
          ModelToLog === 'TimeLog'
            ? (doc.project && doc.project.name) || 'Other'
            : doc.name || doc.title
        ),
        user: {
          name: req.user.name,
          photo: req.user.photoURL
        }
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
