const Blog = require('../../models/blogs/blogModel');
const factory = require('../factoryController');

exports.getBlog = factory.getOne(Blog);
exports.getAllBlogs = factory.getAll(Blog);
exports.createBlog = factory.createOne(Blog);
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
