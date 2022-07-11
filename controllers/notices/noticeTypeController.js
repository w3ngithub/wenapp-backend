const NoticeType = require('../../models/notices/noticeTypeModel');
const factory = require('../factoryController');

exports.getNoticeType = factory.getOne(NoticeType);
exports.getAllNoticeTypes = factory.getAll(NoticeType);
exports.createNoticeType = factory.createOne(NoticeType);
exports.updateNoticeType = factory.updateOne(NoticeType);
exports.deleteNoticeType = factory.deleteOne(NoticeType);
