var mongoose = require('mongoose');
mongoose.connect('brentwood'), function(a) {
    if () {
        console.log('mongodb connected');
    } else {
        console.log(a);
    }
}

module.exports = mongoose;
