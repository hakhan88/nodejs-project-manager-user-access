const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Connection } = require('../../Connection');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post("/register", upload.single('img'), (req, res, next) => {
    Connection.open()
        .then(client => {
            const collection = client.db("test").collection("users");
            var myobj1 = { name: req.body.name };
            return collection.findOne(myobj1, (err, collectionRes) => {
                if (err || !!collectionRes) {
                    res.status(409).json({
                        message: 'User already exists',
                    });
                    return err;
                }
                var myobj = {
                    name: req.body.name,
                    password: req.body.password,
                    email: req.body.email,
                    img: req?.file?.path,
                    introduction: req.body.introduction,
                };
                return collection.insertOne(myobj, (err, collectionRes) => {
                    if (err) {
                        return err;
                    }
                    const token = jwt.sign(
                        {
                            email: collectionRes.email,
                            userId: collectionRes._id,
                            name: collectionRes.name
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "8h"
                        }
                    );
                    res.status(200).json({
                        message: collectionRes,
                        token: token
                    });
                });

            });


        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.get("/fetchAll", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const connect = client.db('test');
            const collection = connect
                .collection("users");
            return new Promise(() => {
                const response = [];
                collection.find({}).toArray()
                    .then(allUsers => {
                        response.push(allUsers);
                        res.status(200).json({
                            users: allUsers.filter(users => users.name !== req.name),
                        });
                    })
            })

        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.post("/login", (req, res, next) => {
    Connection.open()
        .then(client => {
            const collection = client.db("test").collection("users");
            var myobj = { name: req.body.name };
            return collection.findOne(myobj, (err, collectionRes) => {
                if (err || !collectionRes) {
                    return err;
                }
                if (req.body.password === collectionRes.password) {
                    console.log('collectionRes123123', collectionRes);
                    const token = jwt.sign(
                        {
                            email: collectionRes.email,
                            userId: collectionRes._id,
                            name: collectionRes.name
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "8h"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth successful",
                        token: token
                    });
                } else {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
            });
        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.post("/:name", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const collection = client.db("test").collection("users");
            var myobj = { name: req.params.name };
            return collection.findOne(myobj, (err, collectionRes) => {
                if (err) {
                    return err;
                }
                res.status(200).json({
                    userDetails: collectionRes,
                });
            });
        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

module.exports = router;
