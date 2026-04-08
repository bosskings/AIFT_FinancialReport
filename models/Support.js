import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'from',
    },
    from: {
        type: String,
        enum: ['student', 'school'],
        required: true
    },
    
    status: {
        type: String,
        enum: ['OPEN', 'PENDING', 'CLOSED'],
        default: 'PENDING'
    },
    conversation: {
        message: {
            type: String,
            required: true,
            trim: true
        },
        reply: {
            type: String,
            trim: true,
            default: ''
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Support', supportSchema);