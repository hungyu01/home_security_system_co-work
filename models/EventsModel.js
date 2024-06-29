const mongoose = require('mongoose');

// 定義 schema
const EventsSchema = new mongoose.Schema({
    time: Date,
    event_type:{type: String},
    details:{type: String}
});

// 創建模型對象，對文檔的操作對象
const EventsModel = mongoose.model('events', EventsSchema);

module.exports = EventsModel;