import mongoose, { Schema, Document } from "mongoose";

export type AppFieldType =
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "message"
  | "submit"
  | "email"
  | "phone"
  | "number"
  | "list"
  | "date"
  | "file";

export interface IAppField {
  id: string;
  type: AppFieldType;
  label?: string;
  required?: boolean;
  isSecret?: boolean;
  acceptedFileTypes?: string;
  options?: { label: string; value: string }[];
  messageHtml?: string;
  submitText?: string;
}

export interface IAppFormSettings {
  recipients: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  anonymousSubmissions: boolean;
  improveWithAi: boolean;
}

export interface IAppBackground {
  type: "solid" | "gradient" | "image";
  value: string; // hex color, CSS gradient string, or image URL
  imageKey?: string; // S3 key for background image (webp)
}

export interface IAppLayout {
  header: {
    logoUrl?: string;
    logoKey?: string;
    title?: string;
    subtitle?: string;
  };
  background?: IAppBackground;
}

export interface IApp extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: "draft" | "published";
  tag: "generator" | "form";
  launchMode: "modal" | "new_tab";
  enabled: boolean;
  allowAiImprove: boolean;
  formSettings: IAppFormSettings;
  publicShare: {
    enabled: boolean;
    token?: string;
    expiresAt?: Date | null;
  };
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
      enum: ["text", "textarea", "radio", "checkbox", "message", "submit", "email", "phone", "number", "list", "date", "file"],
      required: true,
    },
    label: { type: String },
    required: { type: Boolean, default: false },
    isSecret: { type: Boolean, default: false },
    acceptedFileTypes: { type: String },
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
    description: { type: String, trim: true },
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
    allowAiImprove: { type: Boolean, default: false },
    formSettings: {
      recipients: [{ type: String, trim: true, lowercase: true }],
      cc: [{ type: String, trim: true, lowercase: true }],
      bcc: [{ type: String, trim: true, lowercase: true }],
      subject: { type: String, default: "New Form Submission", trim: true },
      anonymousSubmissions: { type: Boolean, default: false },
      improveWithAi: { type: Boolean, default: false },
    },
    publicShare: {
      enabled: { type: Boolean, default: false },
      token: { type: String, trim: true, index: true },
      expiresAt: { type: Date, default: null },
    },
    layout: {
      header: {
        logoUrl: String,
        logoKey: String,
        title: String,
        subtitle: String,
      },
      background: {
        type: {
          type: String,
          enum: ["solid", "gradient", "image"],
          default: "solid",
        },
        value: { type: String, default: "#ffffff" },
        imageKey: String,
      },
    },
    fields: [FieldSchema],
  },
  { timestamps: true },
);

export default mongoose.model<IApp>("App", AppSchema);
