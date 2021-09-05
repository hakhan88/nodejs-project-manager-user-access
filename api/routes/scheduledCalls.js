const express = require("express");
const router = express.Router();

const { Connection } = require('../../Connection');
const checkAuth = require('../middleware/check-auth');

const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const region = 'us-east-1';
const chime = new AWS.Chime({ region });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

router.get("/fetchAll", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const connect = client.db('test');
            const collection = connect.collection("scheduledCalls");
            return new Promise(() => {
                const response = [];
                collection.find({}).toArray()
                    .then(allUsers => {
                        response.push(allUsers);
                        res.status(200).json({
                            users: allUsers.filter(user => user.mentee === req.name),
                        });
                    })
            })

        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.post("/scheduleACall", checkAuth, (req, res, next) => {
    Connection.open()
        .then(client => {
            const collection = client.db("test").collection("scheduledCalls");
            var myobj = {
                mentor: req.body.mentor,
                mentee: req.name,
                date: req.body.date,
                time: req.body.time,
            };
            return collection.insertOne(myobj, (err, collectionRes) => {
                if (err) {
                    return err;
                }
                res.status(200).json({
                    message: collectionRes,
                });
            });
        }).catch(collectionErr => {
            console.log('catch error', collectionErr);
        });
});

router.get("/joinCall", async (req, res, next) => {
    try {
        const response = {}
        response.meetingResponse = await chime
            .createMeeting({
                ClientRequestToken: uuid(),
                MediaRegion: region,
            })
            .promise()

        response.attendee = await chime
            .createAttendee({
                MeetingId: response.meetingResponse.Meeting.MeetingId,
                ExternalUserId: uuid(),
            })
            .promise()

        res.send(response)
    } catch (err) {
        res.send(err)
    }
});

module.exports = router;
