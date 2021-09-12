# Project manager user access api end points


## Usage
Please run `npm i` on the root of the folder and `npm start` to run the server
Perform login api to get the auth token, to be used for the rest of the apis (GET /feature?email=XXX&featureName=XXX && POST /feature)
For reference, Postman collections have been exported and can be found in the postman-collections folder

## TODO BE
- use Mongoose to connect to the MongoDB instead of MongoClient for better control over the schema
