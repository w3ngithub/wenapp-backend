const express = require('express');

const blogCategoryController = require('../../controllers/blogs/blogCategoryController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(blogCategoryController.getAllBlogCategories)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    blogCategoryController.createBlogCategory
  );

router
  .route('/:id')
  .get(blogCategoryController.getBlogCategory)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead'),
    blogCategoryController.updateBlogCategory
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead'),
    blogCategoryController.deleteBlogCategory
  );

module.exports = router;
