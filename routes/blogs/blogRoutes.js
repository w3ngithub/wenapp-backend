const express = require('express');

const blogController = require('../../controllers/blogs/blogController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(blogController.getAllBlogs)
  .post(
    authMiddleware.protect,
    authMiddleware.setUserIds,
    blogController.createBlog
  );

router
  .route('/:id')
  .get(blogController.getBlog)
  .patch(
    authMiddleware.protect,
    authMiddleware.setUserIds,
    blogController.updateBlog
  )
  .delete(authMiddleware.protect, blogController.deleteBlog);

module.exports = router;
