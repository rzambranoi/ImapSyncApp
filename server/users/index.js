const { Router } = require('express');
const router = Router();
const db = require('../db/connection')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


const users = db.get('users');

users.createIndex('username', { unique: true });

router.post('/signup', [

    check("username").trim().isLength({ min: 5, max: 20 }).withMessage("must be at between 5 and 20 chars long"),
    check("email").trim().isEmail().withMessage("must be a valid email"),
    check("password")
        .trim()
        .isLength({ min: 8 }).withMessage("Must be at least 8 chars long")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/, "i")
        .withMessage("It must contain at least a lowercase, uppercase, a number and a special character ")
        .notEmpty().withMessage("Password can not be empty")

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    users.findOne({
        username: req.body.username
    }).then((user) => {
        //if user null, username is not in the db, otherwise is duplicated
        if (user) {
            //there is a usernamen in DB
            return res.status(422).json({
                error: "This username is not valid "
            })
        } else {
            bcrypt.hash(req.body.password, 13).then(hashPassword => {
                const newUser = {
                    username: req.body.username,
                    password: hashPassword,
                    email: req.body.email
                }
                users.insert(newUser).then(() => {
                    res.status(200).json({
                        message: "User is correctly created"
                    });
                });
            }
            );
        }
    });
});

module.exports = router;