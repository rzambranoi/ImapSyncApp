const { Router } = require("express");
const router = Router();
const { spawn } = require("child_process");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const CryptoJS = require("crypto-js");
const fs = require("fs");

const { check, validationResult } = require("express-validator");

const basic_imapDB = db.get("basic_imap");

require("dotenv").config();

function verifiyToken(req, res, next) {
  const authHeader = req.get("authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log(token);
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          res.status(402).json({
            error: "No Authenticated",
          });
        } else {
          req.user = user;
          next();
        }
      });
    } else {
      res.status(402).json({
        error: "No Authenticated",
      });
    }
  } else {
    res.status(402).json({
      error: "No Authenticated",
    });
  }
}

function AESencrypt(to_encrypt) {
  return CryptoJS.AES.encrypt(
    to_encrypt,
    process.env.SECRET_ECRYPT_KEY
  ).toString();
}

router.post(
  "/basic_imap",
  verifiyToken,
  [
    check("email").trim().isEmail().withMessage("Must be a valid Email"),
    check("destination_IP").isIP().withMessage("Must be a valid IP"),
    check("origin_IP").isIP().withMessage("Must be a valid IP"),
    check("destination_password").trim().isLength({ min: 1 }).exists(),
    check("origin_password").trim().isLength({ min: 1 }).exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }

    const username = req.user.username;

    basic_imapDB
      .findOne({
        username: username,
      })
      .then((user) => {
        if (!user) {
          const new_sync = {
            username: username,
            email: AESencrypt(req.body.email),
            destination_IP: AESencrypt(req.body.destination_IP),
            origin_IP: AESencrypt(req.body.origin_IP),
            destination_password: AESencrypt(req.body.destination_password),
            origin_password: AESencrypt(req.body.origin_password),
          };

          basic_imapDB.insert(new_sync).then((result) => {
            return res.status(200).json(result);
          });

          const file_data = `${new_sync.origin_IP};${new_sync.email};${new_sync.origin_password};${new_sync.destination_IP};${new_sync.email};${new_sync.destination_password};`;
          fs.writeFile(`${new_sync.username}.txt`, file_data, (err) => {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
          });
        } else {
          return res.status(402).json({
            error: "You already have a Migration",
          });
        }
      });
  }
);

module.exports = router;
