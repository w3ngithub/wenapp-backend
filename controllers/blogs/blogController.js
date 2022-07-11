const Blog = require('../../models/blogs/blogModel');
const factory = require('../factoryController');

// Setuser id for the blog routes
exports.setBlogUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getBlog = factory.getOne(Blog);
exports.getAllBlogs = factory.getAll(Blog);
exports.createBlog = factory.createOne(Blog);
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
