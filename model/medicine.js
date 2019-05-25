var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var medicineSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  mfd: {
    type: Date,
    required: true
  },
  exd: {
    type: Date,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Medicine", medicineSchema);
