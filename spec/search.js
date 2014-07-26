var search = require('../build/Release/search').search;
var assert = require('assert');

describe('search', function () {
    function makeKTest(img, tpl) {
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
    
    function makeRGBTest(img, tpl) {
        var tplData = [];
        
        var l = 3;
        while (l--) {
            tplData.push(new Float32Array(tpl.data));
        }
        
        return function (data, row, col, done) {
            var imgData = [];
            
            var l = 3;
            while (l--) {
                imgData.push(new Float32Array(data));
            }
            
            search({
                rows: img.rows, cols: img.cols, channels: 3,
                data: imgData
            }, {
                rows: tpl.rows, cols: tpl.cols, channels: 3,
                data: tplData
            }, 0, 0, function (error, result) {
                assert.strictEqual(result.length, 1);
                assert.strictEqual(result[0].row, row);
                assert.strictEqual(result[0].col, col);
                done();
            });
        };
    }
    
    describe('misc', function () {
        it('should match 1x1 K image', function (done) {
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
        
        it('should match 1x1 RGB image', function (done) {
            search({
                rows: 1, cols: 1, channels: 3,
                data: [
                    new Float32Array([ 255 ]),
                    new Float32Array([ 255 ]),
                    new Float32Array([ 255 ])
                ]
            }, {
                rows: 1, cols: 1, channels: 3,
                data: [
                    new Float32Array([ 255 ]),
                    new Float32Array([ 255 ]),
                    new Float32Array([ 255 ])
                ]
            }, 0, 0, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
    });
    
    describe('alpha channel', function () {
        describe('K', function () {
            it('should ignore A channel in "imgMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 2,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, {
                    rows: 1, cols: 1, channels: 1,
                    data: [ new Float32Array([ 255 ]) ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
            
            it('should ignore A channel in "tplMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 1,
                    data: [ new Float32Array([ 255 ]) ]
                }, {
                    rows: 1, cols: 1, channels: 2,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
            
            it('should ignore A channel in "imgMatrix" and "tplMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 2,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, {
                    rows: 1, cols: 1, channels: 2,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
        });
        
        describe('RGB', function () {
            it('should ignore A channel in "imgMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 4,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, {
                    rows: 1, cols: 1, channels: 3,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
            
            it('should ignore A channel in "tplMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 3,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, {
                    rows: 1, cols: 1, channels: 4,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
            
            it('should ignore A channel in "imgMatrix" and "tplMatrix"', function (done) {
                search({
                    rows: 1, cols: 1, channels: 4,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, {
                    rows: 1, cols: 1, channels: 4,
                    data: [
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ]),
                        new Float32Array([ 255 ])
                    ]
                }, 0, 0, function (error, result) {
                    assert.strictEqual(result.length, 1);
                    done();
                });
            });
        });
    });
    
    describe('match square', function () {
        var kTest, rgbTest;
        
        kTest = makeKTest({
            rows: 5, cols: 5
        }, {
            rows: 3, cols: 3, data: [
                200, 200, 200,
                200, 200, 200,
                200, 200, 200
            ]
        });
        
        rgbTest = makeRGBTest({
            rows: 5, cols: 5
        }, {
            rows: 3, cols: 3, data: [
                200, 200, 200,
                200, 200, 200,
                200, 200, 200
            ]
        });
        
        function test(title, data, row, col) {
            it(title +' (K)', function (done) {
                kTest(data, row, col, done);
            });
            
            it(title +' (RGB)', function (done) {
                rgbTest(data, row, col, done);
            });
        }
        
        test('should match left top',[
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255,
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255
        ], 0, 0);
        
        test('should match center top', [
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255,
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255
        ], 0, 1);
        
        test('should match right top', [
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200,
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255
        ], 0, 2);
        
        test('should match left middle', [
            255, 255, 255, 255, 255,
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255,
            255, 255, 255, 255, 255
        ], 1, 0);
        
        test('should match center middle', [
            255, 255, 255, 255, 255,
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255,
            255, 255, 255, 255, 255
        ], 1, 1);
        
        test('should match right middle', [
            255, 255, 255, 255, 255,
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200,
            255, 255, 255, 255, 255
        ], 1, 2);
        
        test('should match left bottom', [
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255,
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255,
            200, 200, 200, 255, 255
        ], 2, 0);
        
        test('should match center bottom', [
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255,
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255,
            255, 200, 200, 200, 255
        ], 2, 1);
        
        test('should match right bottom', [
            255, 255, 255, 255, 255,
            255, 255, 255, 255, 255,
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200,
            255, 255, 200, 200, 200
        ], 2, 2);
    });
    
    describe('match rectangle', function () {
        var kTest, rgbTest;
        
        kTest = makeKTest({
            rows: 5, cols: 6
        }, {
            rows: 2, cols: 3, data: [
                200, 200, 200,
                200, 200, 200
            ]
        });
        
        rgbTest = makeRGBTest({
            rows: 5, cols: 6
        }, {
            rows: 2, cols: 3, data: [
                200, 200, 200,
                200, 200, 200
            ]
        });
        
        function test(title, data, row, col) {
            it(title +' (K)', function (done) {
                kTest(data, row, col, done);
            });
            
            it(title +' (RGB)', function (done) {
                rgbTest(data, row, col, done);
            });
        }
        
        test('should match left top', [
            200, 200, 200, 255, 255, 255,
            200, 200, 200, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255
        ], 0, 0);
        
        test('should match left middle', [
            255, 255, 200, 200, 200, 255,
            255, 255, 200, 200, 200, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255
        ], 0, 2);
        
        test('should match left right', [
            255, 255, 255, 200, 200, 200,
            255, 255, 255, 200, 200, 200,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255
        ], 0, 3);
        
        test('should match left middle', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            200, 200, 200, 255, 255, 255,
            200, 200, 200, 255, 255, 255,
            255, 255, 255, 255, 255, 255
        ], 2, 0);
        
        test('should match center middle', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 200, 200, 200, 255,
            255, 255, 200, 200, 200, 255,
            255, 255, 255, 255, 255, 255
        ], 2, 2);
        
        test('should match right middle', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 200, 200, 200,
            255, 255, 255, 200, 200, 200,
            255, 255, 255, 255, 255, 255
        ], 2, 3);
        
        test('should match left bottom', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            200, 200, 200, 255, 255, 255,
            200, 200, 200, 255, 255, 255
        ], 3, 0);
        
        test('should match center bottom', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 200, 200, 200, 255,
            255, 255, 200, 200, 200, 255
        ], 3, 2);
        
        test('should match right bottom', [
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255,
            255, 255, 255, 200, 200, 200,
            255, 255, 255, 200, 200, 200
        ], 3, 3);
    });
    
    describe('fuzzy search', function () {
        it('should respect color tolerance on all pixels (K)', function (done) {
            search({
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 254, 254, 254, 254 ])
                ]
            }, 1, 0, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        it('should respect color tolerance on all pixels and all channels (RGB)', function (done) {
            search({
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 254, 254, 254, 254 ]),
                    new Float32Array([ 254, 254, 254, 254 ]),
                    new Float32Array([ 254, 254, 254, 254 ])
                ]
            }, 12, 0, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        it('should respect pixel tolerance on all pixels (K)', function (done) {
            search({
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 254, 254, 254, 254 ])
                ]
            }, 0, 4, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        it('should respect pixel tolerance on all pixels and all channels (RGB)', function (done) {
            search({
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 254, 254, 254, 254 ]),
                    new Float32Array([ 254, 254, 254, 254 ]),
                    new Float32Array([ 254, 254, 254, 254 ])
                ]
            }, 0, 4, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        it('should respect pixel tolerance and color tolerance on all pixels (K)', function (done) {
            search({
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 1,
                data: [
                    new Float32Array([ 254, 253, 253, 253 ])
                ]
            }, 1, 3, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
        
        it('should respect pixel tolerance and color tolerance on all pixels and all channels (K)', function (done) {
            search({
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ]),
                    new Float32Array([ 255, 255, 255, 255 ])
                ]
            }, {
                rows: 2, cols: 2, channels: 3,
                data: [
                    new Float32Array([ 254, 255, 255, 255 ]),
                    new Float32Array([ 255, 253, 255, 255 ]),
                    new Float32Array([ 255, 255, 253, 253 ])
                ]
            }, 1, 3, function (error, result) {
                assert.strictEqual(result.length, 1);
                done();
            });
        });
    });
});
