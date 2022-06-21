const mongoose = require('mongoose');
const slugify = require('slugify');
const { projectTypes, projectStatus } = require('../utils/constant');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide project name.'],
      unique: true,
      trim: true
    },
    slug: String,
    priority: {
      type: Boolean,
      default: false
    },
    path: String,
    estimatedHours: Number,
    startDate: {
      type: Date,
      required: [true, 'Please provide project start date.']
    },
    endDate: Date,
    projectTypes: [String],
    projectStatus: {
      type: String,
      required: [true, 'Please provide project status.']
    },
    projectTags: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Project_Tag'
      }
    ],
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client'
    },
    developers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    designers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    qa: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    devOps: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    stagingUrls: [String],
    liveUrl: String,
    notes: String,
    maintenance: [
      {
        monthly: {
          type: Boolean,
          default: false
        },
        selectMonths: [String],
        emailDay: Number,
        sendEmailTo: String
      }
    ],
    createdBy: String,
    updatedBy: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Return project types value in response object as virtual field
projectSchema.virtual('projectTypesValue').get(function () {
  return projectTypes[this.projectTypes];
});

// Return project status value in response object as virtual field
projectSchema.virtual('projectStatusValue').get(function () {
  return projectStatus[this.projectStatus];
});

// Generate slug from project name before save and create document
projectSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'developers',
    select: 'name'
  })
    .populate({
      path: 'designers',
      select: 'name'
    })
    .populate({
      path: 'qa',
      select: 'name'
    })
    .populate({
      path: 'devOps',
      select: 'name'
    })
    .populate({
      path: 'projectTags',
      select: 'name'
    })
    .populate({
      path: 'client',
      select: 'name'
    });
  next();
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
