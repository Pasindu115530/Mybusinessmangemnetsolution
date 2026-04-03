import mongoose from "mongoose";

const requirementItemSchema = new mongoose.Schema({
  itemName:     { type: String, required: true },
  quantity:     { type: String },
  unit:         { type: String, default: "units" },
  notes:        { type: String },
  deliveryDate: { type: String },
});

const requirementSchema = new mongoose.Schema(
  {
    requirementId: { type: String, unique: true },
    customerId:    { type: String, required: true },
    requirements:  [requirementItemSchema],
    attachedDocument: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Auto-generate requirementId before saving
requirementSchema.pre("save", async function (next) {
  if (!this.requirementId) {
    const count = await mongoose.model("Requirement").countDocuments();
    this.requirementId = `REQ-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Requirement", requirementSchema);
