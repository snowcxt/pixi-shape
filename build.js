var amdclean = require('amdclean');

var fs = require('fs');
fs.readFile(__dirname + '/src/app-build.js', function(err, code) {
    if (err) {
        throw err;
    }

    var cleanedCode = amdclean.clean(code.toString());
    fs.writeFile("test.js", cleanedCode, function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
});
