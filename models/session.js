var mongoose = require('mongoose');

module.exports = mongoose.model('Session',{
    name: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    svg: String,
    output: String,
    input: String,
    grammar: String,
    markdown: String,
    originalUrl: String,
    private: {type: Boolean, default: false},
    height: Number,
    width: Number
});
