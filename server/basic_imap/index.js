const { Router } = require("express");
const router = Router();
const verifyToken = require("../Middlewares/verifyToken.js");
const db = require("../db/connection");
const CryptoJS = require("crypto-js");
const fs = require("fs");

const { check, validationResult } = require("express-validator");

const basic_imapDB = db.get("basic_imap");

require("dotenv").config();

function AESencrypt(to_encrypt) {
  return CryptoJS.AES.encrypt(
    to_encrypt,
    process.env.SECRET_ECRYPT_KEY
  ).toString();
}

const createFile = async (username, body) => {
  const path = `./basic_imap/clients/${username}.txt`;
  const file_data = `${body.origin_IP};${body.email};${body.origin_password};${body.destination_IP};${body.email};${body.destination_password};`;

  return fs.writeFile(path, file_data, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
};

router.post(
  "/basic_imap",
  verifyToken,
  [
    check("email").trim().isEmail().withMessage("Must be a valid Email"),
    check("destination_IP").isIP().withMessage("Must be a valid IP"),
    check("origin_IP").isIP().withMessage("Must be a valid IP"),
    check("destination_password").trim().isLength({ min: 1 }).exists(),
    check("origin_password").trim().isLength({ min: 1 }).exists(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array(),
      });
    }

    if (req.body.origin_IP === req.body.destination_IP) {
      return res.status(422).json({
        error: "IPs Must be different",
      });
    }

    const username = req.user.username;

    basic_imapDB
      .find({
        username: username,
      })
      .then((user) => {
        user.forEach((sync) => {
          if (sync.status === "In Queue") {
            return res.status(402).json({
              error: "You already have a migration",
            });
          }
        });

        const new_sync = {
          username: username,
          email: AESencrypt(req.body.email),
          destination_IP: AESencrypt(req.body.destination_IP),
          origin_IP: AESencrypt(req.body.origin_IP),
          destination_password: AESencrypt(req.body.destination_password),
          origin_password: AESencrypt(req.body.origin_password),
          status: "In Queue",
          date: new Date().getTime() / 1000,
        };

        createFile(username, req.body).then();

        basic_imapDB.insert(new_sync).then((result) => {
          return res.status(200).json(result);
        });
      });
  }
);

module.exports = router;
