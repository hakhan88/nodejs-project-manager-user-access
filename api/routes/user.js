const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Connection } = require('../../Connection');
const checkAuth = require('../middleware/check-auth');

router.get("/feature", checkAuth, (req, res, next) => {
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

router.post("/feature", checkAuth, (req, res, next) => {
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
