const Notice = require('../../models/notices/noticeModel');
const factory = require('../factoryController');

exports.getNotice = factory.getOne(Notice);
exports.getAllNotices = factory.getAll(Notice);
exports.createNotice = factory.createOne(Notice);
exports.updateNotice = factory.updateOne(Notice);
exports.deleteNotice = factory.deleteOne(Notice);
