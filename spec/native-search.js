var search = require('../build/Release/search').search;
var assert = require('assert');

describe('native addon - search', function () {
    describe('K', function () {
        function makeTest(img, tpl) {
            return function (data, row, col, done) {
                search({
                    rows: img.rows, cols: img.cols, channels: 1,
                    data: [ new Float32Array(data) ]
                }, {
                    rows: tpl.rows, cols: tpl.cols, channels: 1,
                    data: [ new Float32Array(tpl.data) ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(result[0].row, row);
                    assert.strictEqual(result[0].col, col);
                    done();
                });
            };
        }
        
        describe('misc', function () {
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
        });
        
        describe('match square', function () {
            var test = makeTest({
                rows: 5, cols: 5
            }, {
                rows: 3, cols: 3, data: [
                    200, 200, 200,
                    200, 200, 200,
                    200, 200, 200
                ]
            });
            
            it('should match left top', function (done) {
                test([
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 0, done);
            });
            
            it('should match center top', function (done) {
                test([
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 1, done);
            });
            
            it('should match right top', function (done) {
                test([
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255
                ], 0, 2, done);
            });
            
            it('should match left middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    255, 255, 255, 255, 255
                ], 1, 0, done);
            });
            
            it('should match center middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255
                ], 1, 1, done);
            });
            
            it('should match right middle', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255
                ], 1, 2, done);
            });
            
            it('should match left bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255,
                    200, 200, 200, 255, 255
                ], 2, 0, done);
            });
            
            it('should match center bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255,
                    255, 200, 200, 200, 255
                ], 2, 1, done);
            });
            
            it('should match right bottom', function (done) {
                test([
                    255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200,
                    255, 255, 200, 200, 200
                ], 2, 2, done);
            });
            
        });
        
        describe('match rectangle', function () {
            var test = makeTest({
                rows: 5, cols: 6
            }, {
                rows: 2, cols: 3, data: [
                    200, 200, 200,
                    200, 200, 200,
                ]
            });
            
            it('should match left top', function (done) {
                test([
                    200, 200, 200, 255, 255, 255,
                    200, 200, 200, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255
                ], 0, 0, done);
            });
            
            it('should match left middle', function (done) {
                test([
                    255, 255, 200, 200, 200, 255,
                    255, 255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255
                ], 0, 2, done);
            });
            
            it('should match left right', function (done) {
                test([
                    255, 255, 255, 200, 200, 200,
                    255, 255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255
                ], 0, 3, done);
            });
            
            it('should match left middle', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255, 255,
                    200, 200, 200, 255, 255, 255,
                    255, 255, 255, 255, 255, 255
                ], 2, 0, done);
            });
            
            it('should match center middle', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200, 255,
                    255, 255, 200, 200, 200, 255,
                    255, 255, 255, 255, 255, 255
                ], 2, 2, done);
            });
            
            it('should match right middle', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 200, 200, 200,
                    255, 255, 255, 200, 200, 200,
                    255, 255, 255, 255, 255, 255
                ], 2, 3, done);
            });
            
            it('should match left bottom', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    200, 200, 200, 255, 255, 255,
                    200, 200, 200, 255, 255, 255
                ], 3, 0, done);
            });
            
            it('should match center bottom', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 200, 200, 200, 255,
                    255, 255, 200, 200, 200, 255
                ], 3, 2, done);
            });
            
            it('should match right bottom', function (done) {
                test([
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 255, 255, 255,
                    255, 255, 255, 200, 200, 200,
                    255, 255, 255, 200, 200, 200
                ], 3, 3, done);
            });
        });
    });
    
});
