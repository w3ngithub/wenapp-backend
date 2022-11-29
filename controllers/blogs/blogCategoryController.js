const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const BlogCategory = require('../../models/blogs/blogCategoryModel');
const factory = require('../factoryController');

exports.getBlogCategory = factory.getOne(BlogCategory);
exports.getAllBlogCategories = factory.getAll(BlogCategory);
exports.createBlogCategory = factory.createOne(
  BlogCategory,
  ActivityLogs,
  'Blog Category'
);
exports.updateBlogCategory = factory.updateOne(
  BlogCategory,
  ActivityLogs,
  'Blog Category'
);
exports.deleteBlogCategory = factory.deleteOne(
  BlogCategory,
  ActivityLogs,
  'Blog Category'
);
