var search = require('../build/Release/search').search;
var assert = require('assert');

describe('native addon - search', function () {
    describe('K', function () {
        it('should match 1x1 image', function (done) {
            search({
                rows: 1, cols: 1, channels: 1,
                data: [ new Float32Array([ 255 ]) ]
            }, {
                rows: 1, cols: 1, channels: 1,
                data: [ new Float32Array([ 255 ]) ]
            }, 0, 0, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        describe('match square', function () {
            function test(data, row, col, done) {
                search({
                    rows: 5, cols: 5, channels: 1,
                    data: [ new Float32Array(data) ]
                }, {
                    rows: 3, cols: 3, channels: 1,
                    data: [ new Float32Array([
                        200, 200, 200,
                        200, 200, 200,
                        200, 200, 200
                    ]) ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(result[0].row, row);
                    assert.strictEqual(result[0].col, col);
                    done();
                });
            }
            
            it('should match square in left top', function (done) {
                test([
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 0, done);
            });
            
            it('should match square in center top', function (done) {
                test([
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 1, done);
            });
            
            it('should match square in right top', function (done) {
                test([
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 2, done);
            });
            
            it('should match square in left middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    255, 255, 255, 255, 255
                ], 1, 0, done);
            });
            
            it('should match square in center middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255
                ], 1, 1, done);
            });
            
            it('should match square in right middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255
                ], 1, 2, done);
            });
            
            it('should match square in left bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255
                ], 2, 0, done);
            });
            
            it('should match square in center bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255
                ], 2, 1, done);
            });
            
            it('should match square in right bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200
                ], 2, 2, done);
            });
            
        });
    });
    
});
