const MongoClient = require('mongodb').MongoClient

class Connection {
    static open() {
        return MongoClient.connect(this.url, this.options)
            .then(db => this.db = db)
    }
}
Connection.url = 'mongodb+srv://user123:password123123123@mentorship.st1bi.mongodb.net/mentorship?retryWrites=true&w=majority'
Connection.options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

module.exports = { Connection }