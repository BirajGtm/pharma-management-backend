//route handler
const Medicine = require("../model/medicine");
const Auth = require("../model/auth");
const Sale = require("../model/sales");
const bcrypt = require("bcryptjs");
module.exports = app => {
  app.post("/api/save", async (req, res) => {
    let medicine = new Medicine({
      name: req.body.name,
      mfd: req.body.mfd,
      exd: req.body.exd,
      cost: req.body.cost,
      total: req.body.total
    });
    try {
      let result = await medicine.save();
      if (result != null || result != undefined) {
        res.status(200).send(`ADDITION SUCCESS FOR MEDICINE ${req.body.name}`);
      }
    } catch (err) {
      res
        .status(200)
        .send(`MEDICINE WITH ${req.body.name} NAME ALREADY EXISTS`);
    }
  });

  app.post("/api/update", async (req, res) => {
    try {
      let result = await Medicine.findOneAndUpdate(
        { _id: req.body._id },
        {
          name: req.body.name,
          mfd: req.body.mfd,
          exd: req.body.exd,
          cost: req.body.cost,
          total: req.body.total
        },
        { new: true }
      );
      if (result != null || result != undefined) {
        res.status(200).send(`UPDATED SUCCESS FOR MEDICINE ${req.body.name}`);
      }
    } catch (err) {
      res.status(200).send(`UPDATED FAILED FOR MEDICINE ${req.body.name}`);
    }
  });

  app.post("/api/delete", async (req, res) => {
    try {
      let result = await Medicine.findOneAndDelete({ _id: req.body._id });
      if (result != null || result != undefined) {
        res.status(200).send("DELETED SUCCESSFULLY");
      }
    } catch (err) {
      res.status(200).send("MEDICINE WITH THIS ID DOESN'T EXIT");
    }
  });

  app.get("/api/list", async (req, res) => {
    try {
      let medicine = await Medicine.find({});
      if (medicine != null || medicine != undefined) {
        res.json(medicine);
      }
    } catch (err) {
      res.status(200).send("EMPTY MED STOCKS");
    }
  });

  app.post("/api/signup", async (req, res) => {
    let password = req.body.password;
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);
    let auth = new Auth({
      email: req.body.email,
      username: req.body.username,
      password: hash
    });
    try {
      let result = await auth.save();
      if (result != null || result != undefined) {
        res.status(200).send("SIGNED UP SUCCESSFULLY");
      }
    } catch (err) {
      res.status(200).send("EMAIL OR USERNAME ALREADY EXISTS");
    }
  });

  app.post("/api/login", async (req, res) => {
    console.log(req.body, "req body");
    let password = req.body.password;
    let username = req.body.username;
    let result = await Auth.findOne({ username: username });
    let isMatch;
    console.log(result);
    if (result != null || result != undefined) {
      let hashedPassword = result.password;
      isMatch = await bcrypt.compare(password, hashedPassword);
    }
    if (isMatch) {
      res.json(result.email);
    } else {
      res.status(200).send("USERNAME OR PASSWORD IS INVALID");
    }
  });

  app.get("/api/expired", async (req, res) => {
    let results = await Medicine.find({})
      .where("exd")
      .lt(Date.now());
    if (results != null || results != undefined || results.length != 0) {
      res.json(results);
    } else {
      res.status(200).send("NONE ARE EXPIRED");
    }
  });

  app.get("/api/search", async (req, res) => {
    let results = await Medicine.find({
      name: { $regex: new RegExp(req.body.name, "i") }
    })
      .where("exd")
      .gt(Date.now());
    if (results != null || results != undefined || results.length != 0) {
      res.json(results);
    } else {
      res.status(200).send("MEDICINES WITH THE GIVEN NAME IS NOT AVAILABLE");
    }
  });

  app.post("/api/stocks-sold", async (req, res) => {
    let medicines = req.body.sales;
    try {
      for (medicine of medicines) {
        let result = await Medicine.findById({ _id: medicine._id });
        result.total = result.total - medicine.total;
        await result.save();
        let sales = new Sale({
          name: result.name,
          cost: result.cost,
          sold: medicine.total
        });
        await sales.save();
      }
      res.status(200).send("STOCKS UPDATED");
    } catch (err) {
      res.status(200).send(err.errmsg);
    }
  });

  app.get("/api/sales", async (req, res) => {
    try {
      let sales;
      if (
        req.body.search != null ||
        req.body.search != undefined ||
        req.body.search != ""
      ) {
        sales = await Sale.find({
          name: { $regex: new RegExp(req.body.search, "i") }
        });
      } else {
        sales = await Sale.find({});
      }
      if (sales != null || sales != undefined) {
        res.json(sales);
      }
    } catch (err) {
      res.status(200).send("NO MEDS SOLD YET");
    }
  });
};
