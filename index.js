const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("config");
const routes = require("./routes/endpoints");

mongoose
  .connect(config.get("mongoUri"), {
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .then(() => console.log("mongodb connected"))
  .catch(err => console.log(err));

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    allowedHeaders: ["sessionId", "Content-Type"],
    exposedHeaders: ["sessionId"],
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
  })
);
routes(app);

const PORT = 5000 || process.env.PORT;

app.listen(PORT);
console.log(`Listening to port ${PORT}`);
