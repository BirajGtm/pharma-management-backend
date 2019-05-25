var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var saleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  cost: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Sale", saleSchema);
