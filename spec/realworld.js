var search = require('../build/Release/search').search;
var assert = require('assert');
var async = require('async');
var pngparse = require('pngparse');

describe('real world search', function () {
    function readImage(filename) {
        return function (callback) {
            pngparse.parseFile(filename, callback);
        }
    }
    
    function createMatrix(image) {
        var channels, length, out;
        
        channels = image.channels;
        length = image.data.length / channels;
        
        out = {
            rows: image.height,
            cols: image.width,
            channels: channels
        };
        
        out.data = new Array(channels);
        var l = out.data.length;
        while (l--) {
            out.data[l] = new Float32Array(length);
        }
        
        split(image.data, out.data);
        
        return out;
    }
    
    function split(raw, out) {
        var channels = out.length;
        
        for (var i = k = 0, l = raw.length; i < l; k++, i += channels) {
            for (var j = 0; j < channels; j++) {
                out[j][k] = raw[i + j];
            }
        }
    }
    
    describe('K', function () {
        it('should find multiple K subimages', function (done) {
            async.series([
                readImage('./spec/fixtures/k-glider.png'),
                readImage('./spec/fixtures/k-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 0 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 0 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple K subimages and tolerate color drift', function (done) {
            async.series([
                readImage('./spec/fixtures/k-glider-hue.png'),
                readImage('./spec/fixtures/k-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 25, 0, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 163.239990234375 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 0 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 163.239990234375 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple K subimages and tolerate bad pixels', function (done) {
            async.series([
                readImage('./spec/fixtures/k-glider-pixels.png'),
                readImage('./spec/fixtures/k-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 0, 15, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 11.190044403076172 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 10.606837272644043 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 0 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple K subimages and tolerate color drift and bad pixels', function (done) {
            async.series([
                readImage('./spec/fixtures/k-glider-hue-pixels.png'),
                readImage('./spec/fixtures/k-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 25, 15, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 31.706159591674805 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 0 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 23.56078338623047 });
                    
                    done();
                });
            });
        });
    });
    
    describe('RGB', function () {
        it('should find multiple RGB subimages', function (done) {
            async.series([
                readImage('./spec/fixtures/rgb-glider.png'),
                readImage('./spec/fixtures/rgb-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 0 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 0 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple RGB subimages and tolerate color drift', function (done) {
            async.series([
                readImage('./spec/fixtures/rgb-glider-hue.png'),
                readImage('./spec/fixtures/rgb-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 13, 0, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 0 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 0 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 165.1538543701172 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple RGB subimages and tolerate bad pixels', function (done) {
            async.series([
                readImage('./spec/fixtures/rgb-glider-pixels.png'),
                readImage('./spec/fixtures/rgb-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 0, 14, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 0 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 10.41290283203125 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 8.160714149475098 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
        
        it('should find multiple RGB subimages and tolerate color drift and bad pixels', function (done) {
            async.series([
                readImage('./spec/fixtures/rgb-glider-hue-pixels.png'),
                readImage('./spec/fixtures/rgb-glider-dot.png'),
            ], function (error, images) {
                var img = images[0];
                var tpl = images[1];
                
                search(createMatrix(img), createMatrix(tpl), 14, 14, function (error, result) {
                    assert.strictEqual(result.length, 5);
                    
                    assert.deepEqual(result[0], { row: 2, col: 20, accuracy: 0 });
                    assert.deepEqual(result[1], { row: 20, col: 38, accuracy: 17.419349670410156 });
                    assert.deepEqual(result[2], { row: 38, col: 2, accuracy: 0 });
                    assert.deepEqual(result[3], { row: 38, col: 20, accuracy: 15.3674898147583 });
                    assert.deepEqual(result[4], { row: 38, col: 38, accuracy: 0 });
                    
                    done();
                });
            });
        });
    });
    
});
