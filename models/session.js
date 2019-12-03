var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const sessionSchema = new mongoose.Schema({
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
    width: Number,
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Session'},
    children: [{type: mongoose.Schema.Types.ObjectId, ref: 'Session'}]
});

var autoPopulateChildren = function(next) {
    this.populate('children');
    next();
};

var autoPopulateParent = function(next) {
    this.populate('parent');
    next();
};

sessionSchema
    .pre('findOne', autoPopulateChildren)
    .pre('find', autoPopulateChildren);

sessionSchema.plugin(deepPopulate, {
    whitelist: [
        // 'children',
        // 'parent'
    ]
});

module.exports = mongoose.model('Session',sessionSchema);
