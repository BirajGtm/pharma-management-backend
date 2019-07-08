//route handler
const Medicine = require("../model/medicine");
const Auth = require("../model/auth");
const Sale = require("../model/sales");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = app => {
  app.post("/api/medicine/save", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
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
          res.status(200).send({ success: true, medicine: req.body.name });
        }
      } catch (err) {
        res.status(200).send({
          success: false,
          message: `MEDICINE WITH ${req.body.name} NAME ALREADY EXISTS`
        });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.post("/api/medicine/update", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
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
          res.status(200).send(`UPDATE SUCCESS`);
        }
      } catch (err) {
        res.status(200).send(`UPDATED FAILED`);
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.post("/api/medicine/delete", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      try {
        let result = await Medicine.findOneAndDelete({ _id: req.body._id });
        if (result != null || result != undefined) {
          res.status(200).send("DELETED SUCCESSFULLY");
        }
      } catch (err) {
        res.status(200).send("MEDICINE WITH THIS ID DOESN'T EXIT");
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.get("/api/medicine/list", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      try {
        let medicine = await Medicine.find({});
        if (medicine != null || medicine != undefined) {
          res.json(medicine);
        }
      } catch (err) {
        res.status(200).send("EMPTY MED STOCKS");
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
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
    let password = req.body.password;
    let username = req.body.username;
    let result = await Auth.findOne({ username: username });
    let isMatch;
    if (result != null || result != undefined) {
      let hashedPassword = result.password;
      isMatch = await bcrypt.compare(password, hashedPassword);
    }
    if (isMatch) {
      let token = await jwt.sign({ user: result }, config.get("secret"), {
        expiresIn: "24h"
      });
      res.json({ token, result });
    } else {
      res.status(200).send("USERNAME OR PASSWORD IS INVALID");
    }
  });

  app.get("/api/medicine/expired", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      let results = await Medicine.find({})
        .where("exd")
        .lt(Date.now());
      if (results != null || results != undefined || results.length != 0) {
        res.json({ meds: results });
      } else {
        res.status(200).send("NONE ARE EXPIRED");
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.get("/api/search", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
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
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.post("/api/medicine/stocks-sold", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
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
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.get("/api/medicine/sales", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
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
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.get("/api/users", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      let results = await Auth.find({});
      if (results != null || results != undefined || results.length != 0) {
        res.json({ users: results });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.post("/api/user/update", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      let result = await Auth.findOneAndUpdate(
        { _id: req.body._id },
        {
          username: req.body.username
        },
        { new: true }
      );
      if (result != null || result != undefined || result.length != 0) {
        res.status(200).send({
          success: true,
          message: "User Updated"
        });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });

  app.post("/api/user/delete", verifyToken, async (req, res) => {
    let verified = jwt.verify(req.token, config.get("secret"));
    if (verified != null || verified != undefined) {
      let result = await Auth.findOneAndDelete({ _id: req.body._id });
      if (result != null || result != undefined || result.length != 0) {
        res.status(200).send({
          success: true,
          message: "User Deleted"
        });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "Authorization error"
      });
    }
  });
};
//helper function
// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}
