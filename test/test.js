var async = require('async');
var pngparse = require('pngparse');
var imagesearch = require('../lib/imagesearch.js');

async.series([
    readImage('./test/img.png'),
    readImage('./test/tpl.png'),
], function (error, images) {
    doTest(images);
});

function doTest(images) {
    var image = images[0];
    var template = images[1];
    
    
    imagesearch(image, template, { colorTolerance: 10 }, function (error, result) {
        console.log(result);
    });
}

function readImage(filename) {
    return function (callback) {
        pngparse.parseFile(filename, callback);
    }
}
