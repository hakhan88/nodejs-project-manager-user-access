const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Connection } = require('../../Connection');
const checkAuth = require('../middleware/check-auth');

router.post("/login", (req, res, next) => {
    const token = jwt.sign(
        {
            userId: Math.floor(Math.random() * 10),
            name: 'Admin'
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
});

router.get("/feature", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const connect = client.db('test');
            const collection = connect
                .collection("users_project_management_db");
            return new Promise(() => {
                var myobj = {
                    email: req.query.email,
                };
                collection.findOne(myobj, (err, collectionRes) => {
                    res.status(200).json({
                        canAccess: collectionRes.enable,
                    });
                });
            })

        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.post("/feature", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const collection = client.db("test")
                .collection("users_project_management_db");
            var queryobj = {
                featureName: req.headers.featurename,
                email: req.headers.email,
            };
            var myobj = {
                featureName: req.headers.featurename,
                email: req.headers.email,
                enable: req.headers.enable,
            };
            // check if user already exists
            return collection.findOne(queryobj, (err, collectionRes) => {
                if (collectionRes) {
                    return collection.updateOne(queryobj, { $set: myobj }, (err, updateOneRes) => {
                        if (err) {
                            return err;
                        }
                        return res.status(200).json({
                            userDetails: updateOneRes,
                        });
                    })
                } else {
                    // insert new record if user doesnt already exist
                    return collection.insertOne(myobj, (err, collectionRes) => {
                        if (err) {
                            return err;
                        }
                        res.status(200).json({
                            userDetails: collectionRes,
                        });
                    });
                }
            });
        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

module.exports = router;
