import mongoose, { Schema, Document } from "mongoose";

export interface IAppField {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "message" | "submit";
  label?: string;
  required?: boolean;
  isSecret?: boolean;
  options?: { label: string; value: string }[];
  messageHtml?: string;
  submitText?: string;
}

export interface IAppLayout {
  header: {
    logoUrl?: string;
    title?: string;
    subtitle?: string;
  };
}

export interface IApp extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  status: "draft" | "published";
  tag: "generator" | "form";
  launchMode: "modal" | "new_tab";
  enabled: boolean;
  layout: IAppLayout;
  fields: IAppField[];
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "radio", "checkbox", "message", "submit"],
      required: true,
    },
    label: { type: String },
    required: { type: Boolean, default: false },
    isSecret: { type: Boolean, default: false },
    options: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    messageHtml: { type: String },
    submitText: { type: String },
  },
  { _id: false },
);

const AppSchema: Schema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tag: {
      type: String,
      enum: ["generator", "form"],
      default: "generator",
    },
    launchMode: {
      type: String,
      enum: ["modal", "new_tab"],
      default: "modal",
    },
    enabled: { type: Boolean, default: true },
    layout: {
      header: {
        logoUrl: String,
        title: String,
        subtitle: String,
      },
    },
    fields: [FieldSchema],
  },
  { timestamps: true },
);

export default mongoose.model<IApp>("App", AppSchema);
