import mongoose from 'mongoose';

const versionSchema = mongoose.Schema({
    versionNumber: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        default: 'Snapshot'
    },
    data: {
        type: Object,
        default: {}
    },
    author: {
        type: String,
        default: 'You'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const documentSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    title: {
        type: String,
        default: 'Untitled Document'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    versions: [versionSchema]
}, { timestamps: true });

const document = mongoose.model('document', documentSchema);

export default document;
