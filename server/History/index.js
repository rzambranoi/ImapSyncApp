const { Router } = require("express");
const router = Router();
const db = require("../db/connection");
const verifyToken = require("../Middlewares/verifyToken.js");
const CryptoJS = require("crypto-js");
const basic_imapDB = db.get("basic_imap");

function AESdencrypt(to_decrypt) {
  return CryptoJS.AES.decrypt(
    to_decrypt,
    process.env.SECRET_ECRYPT_KEY
  ).toString(CryptoJS.enc.Utf8);
  // return to_decrypt;
}

function dateConver(timestamp) {
  let ts_ms = timestamp * 1000;
  let date_ob = new Date(ts_ms);
  let year = date_ob.getFullYear();
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let day = ("0" + date_ob.getDate()).slice(-2);
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  return day + "/" + month + "/" + year + " - " + hours + ":" + minutes;
}

router.get("/history", verifyToken, (req, res) => {
  const username = req.user.username;

  basic_imapDB
    .find({
      username: username,
    })
    .then((imap) => {
      if (imap) {
        let result = [];
        imap.forEach((sync) => {
          const row = {
            id: sync._id,
            date: dateConver(sync.date),
            email: AESdencrypt(sync.email),
            ip: {
              origin: AESdencrypt(sync.origin_IP),
              destination: AESdencrypt(sync.destination_IP),
            },
            status: sync.status,
            options: "✏❌",
          };
          result.push(row);
        });

        return res.status(200).json(result);
      }
    });
});

module.exports = router;
