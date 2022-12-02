const BlogCategory = require('../../models/blogs/blogCategoryModel');
const factory = require('../factoryController');

exports.getBlogCategory = factory.getOne(BlogCategory);
exports.getAllBlogCategories = factory.getAll(BlogCategory);
exports.createBlogCategory = factory.createOne(BlogCategory);
exports.updateBlogCategory = factory.updateOne(BlogCategory);
exports.deleteBlogCategory = factory.deleteOne(BlogCategory);
