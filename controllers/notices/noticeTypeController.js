const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const NoticeType = require('../../models/notices/noticeTypeModel');
const factory = require('../factoryController');

exports.getNoticeType = factory.getOne(NoticeType);
exports.getAllNoticeTypes = factory.getAll(NoticeType);
exports.createNoticeType = factory.createOne(
  NoticeType,
  ActivityLogs,
  'Notice Type'
);
exports.updateNoticeType = factory.updateOne(
  NoticeType,
  ActivityLogs,
  'Notice Type'
);
exports.deleteNoticeType = factory.deleteOne(
  NoticeType,
  ActivityLogs,
  'Notice Type'
);
