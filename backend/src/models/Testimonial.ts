import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
    name: string;
    role: string;
    text: string;
    rating: number;
    isApproved: boolean;
    createdAt: Date;
}

const TestimonialSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        role: { type: String, required: true },
        text: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        isApproved: { type: Boolean, default: false }, // Moderation queue
    },
    { timestamps: true }
);

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
