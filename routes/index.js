var fs = require('fs');
var pkg = require('../package.json');

module.exports = function(app) {
    app.all('/api', function(req, res, next){
        res.json({
            name: pkg.name,
            description: pkg.description,
            version: pkg.version
        });
    });
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") { return }
        var name = file.subst(0, file.indexOf('.'));
        require('./' + name)(app);
    });
}