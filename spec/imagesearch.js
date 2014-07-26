var sm = require('sandboxed-module');
var assert = require('assert');
var imagesearch = require('../lib/imagesearch');

describe('imagesearch(image, template, options, callback)', function () {
    function createImagesearch(requires) {
        return sm.require('../lib/imagesearch', {
            requires: requires
        })
    }
    
    function makeArgumentsTest(result, callback) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        var args;
        
        var imagesearch = createImagesearch({
            '../build/Release/search': {
                search: function () {
                    args = arguments;
                    arguments[4](null, result);
                }
            }
        });
        
        imagesearch(image, image, function (error, result) {
            callback(args, result);
        });
    }
    
    function testError(message, image, template, callback) {
        imagesearch(image, template, function (error, result) {
            
            assert.throws(function () {
                assert.ifError(error);
            }, message);
            
            callback();
        });
    }
    
    it('should not throw if no arguments are passed', function () {
        assert.doesNotThrow(function () {
            imagesearch();
        });
    });
    
    it('should not throw if "callback" is not passed', function () {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        assert.doesNotThrow(function () {
            imagesearch(image, image);
        });
    });
    
    it('should treat "options" as optional argument', function (done) {
        var result = [{ row: 0, col: 0, accuracy: 123.456789 }];
        var expected = [{ x: 0, y: 0, accuracy: 123.456789 }];
        
        makeArgumentsTest(result, function (args, result) {
            assert.deepEqual(result, expected);
            done();
        });
    });
    
    it('should default "options.colorTolerance" to 0', function (done) {
        var result = [{ row: 0, col: 0, accuracy: 123.456789 }];
        
        makeArgumentsTest(result, function (args, result) {
            assert.strictEqual(args[2], 0);
            done();
        });
    });
    
    it('should default "options.pixelTolerance" to 0', function (done) {
        var result = [{ row: 0, col: 0, accuracy: 123.456789 }];
        
        makeArgumentsTest(result, function (args, result) {
            assert.strictEqual(args[3], 0);
            done();
        });
    });
    
    it('should return error if "image" is not object', function (done) {
        testError(/Bad image object/, null, null, done);
    });
    
    it('should return error if "template" is not object', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        testError(/Bad template object/, image, null, done);
    });
    
    // --
    
    it('should return error if "image" has no property "data"', function (done) {
        testError(/Missing image data/, {}, null, done);
    });
    
    it('should return error if "template" has no property "data"', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        testError(/Missing template data/, image, {}, done);
    });
    
    // --
    
    it('should return error if "image.data" has no property "length"', function (done) {
        testError(/Missing image data/, { data: {} }, null, done);
    });
    
    it('should return error if "template.data" has no property "length"', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        testError(/Missing template data/, image, { data: {} }, done);
    });
    
    //--
    
    it('should return error if "image" has no properties "width" and "height"', function (done) {
        testError(/Missing image dimensions/, { data: { length: null } }, null, done);
    });
    
    it('should return error if "template" has no properties "width" and "height"', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        testError(/Missing template dimensions/, image, { data: { length: null } }, done);
    });
    
    //--
    
    it('should default "image.channels" to 3', function (done) {
        var image = { width: 1, height: 1, data: { length: 3 } };
        
        var imagesearch = createImagesearch({
            '../build/Release/search': {
                search: function () {
                    assert.strictEqual(arguments[0].channels, 3);
                    done();
                    
                }
            }
        });
        
        imagesearch(image, image, function () {});
    });
    
    it('should default "template.channels" to 3', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        var template = { width: 1, height: 1, data: { length: 3 } };
        
        var imagesearch = createImagesearch({
            '../build/Release/search': {
                search: function () {
                    assert.strictEqual(arguments[1].channels, 3);
                    done();
                    
                }
            }
        });
        
        imagesearch(image, template, function () {});
    });
    
    //--
    
    it('should return error if number of "image.channels" is unsupported', function (done) {
        var n = 0;
        
        testError(/Bad number of image channels/, { data: { length: 0 }, width: 0, height: 0, channels: 0 }, null, next);
        testError(/Bad number of image channels/, { data: { length: 0 }, width: 0, height: 0, channels: 5 }, null, next);
        
        function next() { if (++n === 2) done(); }
    });
    
    it('should return error if number of "template.channels" is unsupported', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        var n = 0;
        
        testError(/Bad number of template channels/, image, { data: { length: 0 }, width: 0, height: 0, channels: 0 }, next);
        testError(/Bad number of template channels/, image, { data: { length: 0 }, width: 0, height: 0, channels: 5 }, next);
        
        function next() { if (++n === 2) done(); }
    });
    
    //--
    
    it('should return error if number of calculated "image.channels" does not correspond data length', function (done) {
        testError(/Bad image dimensions/, { data: { length: 13 }, width: 2, height: 2, channels: 3 }, null, done);
    });
    
    it('should return error if number of calculated "template.channels" does not correspond data length', function (done) {
        var image = { width: 1, height: 1, channels: 1, data: { length: 1 } };
        testError(/Bad template dimensions/, image, { data: { length: 13 }, width: 2, height: 2, channels: 3 }, done);
    });
    
});

