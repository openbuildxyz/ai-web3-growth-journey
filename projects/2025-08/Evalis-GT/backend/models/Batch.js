const mongoose = require('mongoose');

const batchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    startYear: {
      type: Number,
      required: true
    },
    endYear: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Validate that endYear is greater than startYear
batchSchema.pre('validate', function(next) {
  if (this.endYear <= this.startYear) {
    this.invalidate('endYear', 'End year must be greater than start year');
  }
  next();
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch; 