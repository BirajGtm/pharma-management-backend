var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var authSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Auth", authSchema);
