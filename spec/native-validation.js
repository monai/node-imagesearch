var search = require('../build/Release/search').search;
var assert = require('assert');

describe('native addon - arguments validation', function () {
    function testError(regex, img, tpl) {
        assert.throws(function () {
            search(img, tpl);
        }, regex);
    }
    
    describe('missing properties', function () {
        it('should throw error if "imgMatrix" is not passed', function () {
            testError(/Bad argument 'imgMatrix'/);
        });
        
        it('should throw error if "imgMatrix" does not have property "rows"', function () {
            testError(/Bad argument 'imgMatrix'/, { cols: 0, channels: 0, data: null });
        });
        
        it('should throw error if "imgMatrix" does not have property "cols"', function () {
            testError(/Bad argument 'imgMatrix'/, { rows: 0, channels: 0, data: null });
        });
        
        it('should throw error if "imgMatrix" does not have property "channels"', function () {
            testError(/Bad argument 'imgMatrix'/, { rows: 0, cols: 0, data: null });
        });
        
        it('should throw error if "imgMatrix" does not have property "data"', function () {
            testError(/Bad argument 'imgMatrix'/, { rows: 0, cols: 0, channels: 0 });
        });
        
        it('should throw error if "tplMatrix" is not passed', function () {
            testError(/Bad argument 'tplMatrix'/, { rows: 0, cols: 0, channels: 0, data: null });
        });
        
        it('should throw error if "tplMatrix" does not have property "rows"', function () {
            testError(/Bad argument 'tplMatrix'/,
                { rows: 0, cols: 0, channels: 0, data: null },
                { cols: 0, channels: 0, data: null }
            );
        });
        
        it('should throw error if "tplMatrix" does not have property "cols"', function () {
            testError(/Bad argument 'tplMatrix'/,
                { rows: 0, cols: 0, channels: 0, data: null },
                { rows: 0, channels: 0, data: null }
            );
        });
        
        it('should throw error if "tplMatrix" does not have property "channels"', function () {
            testError(/Bad argument 'tplMatrix'/,
                { rows: 0, cols: 0, channels: 0, data: null },
                { rows: 0, cols: 0, data: null }
            );
        });
        
        it('should throw error if "tplMatrix" does not have property "data"', function () {
            testError(/Bad argument 'tplMatrix'/,
                { rows: 0, cols: 0, channels: 0, data: null },
                { rows: 0, cols: 0, channels: 0 }
            );
        });
    });
    
    describe('"matrix.channels" properties', function () {
        it('should throw error if "imgMatrix.channels" equals string', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: "string" },
                { rows: 0, cols: 0, data: null, channels: 1 }
            );
        });
        
        it('should throw error if "imgMatrix.channels" equals NaN', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: NaN },
                { rows: 0, cols: 0, data: null, channels: 1 }
            );
        });
        
        it('should throw error if "imgMatrix.channels" equals 0', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 0 },
                { rows: 0, cols: 0, data: null, channels: 1 }
            );
        });
        
        it('should throw error if "imgMatrix.channels" equals 5', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 5 },
                { rows: 0, cols: 0, data: null, channels: 1 }
            );
        });
        
        it('should throw error if "tplMatrix.channels" equals string', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: "string" }
            );
        });
        
        it('should throw error if "tplMatrix.channels" equals NaN', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: NaN }
            );
        });
        
        it('should throw error if "tplMatrix.channels" equals 0', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: 0 }
            );
        });
        
        it('should throw error if "tplMatrix.channels" equals 5', function () {
            testError(/Bad number of channels/,
                { rows: 0, cols: 0, data: null, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: 5 }
            );
        });
        
        it('should throw error if "imgMatrix.channels - tplMatrix.channels > 1"', function () {
            testError(/Channel mismatch/,
                { rows: 0, cols: 0, data: null, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: 3 }
            );
        });
    });
    
    describe('"matrix.channels" and "matrix.data.length" correspondence', function () {
        it('should throw error if "imgMatrix.channels != imgMatrix.data.length"', function () {
            testError(/Bad argument 'imgMatrix'/,
                { rows: 0, cols: 0, data: { length: 0 }, channels: 1 },
                { rows: 0, cols: 0, data: null, channels: 1 }
            );
        });
        
        it('should throw error if "tplMatrix.channels != tplMatrix.data.length"', function () {
            testError(/Bad argument 'tplMatrix'/,
                { rows: 0, cols: 0, data: { length: 1 }, channels: 1 },
                { rows: 0, cols: 0, data: { length: 0 }, channels: 1 }
            );
        });
    });
    
    describe('"matrix.data" channel buffer length correspondence', function () {
        it('should throw error if K and A cahnnel length in KA "imgMatrix" is not equal', function () {
            testError(/Bad argument 'imgMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(1) ], channels: 2 },
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1) ], channels: 2 }
            );
        });
        
        it('should throw error if R, G, and B cahnnel length in RGB "imgMatrix" is not equal', function () {
            testError(/Bad argument 'imgMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(1), new Float32Array(1) ], channels: 3 },
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1) ], channels: 3 }
            );
            
            testError(/Bad argument 'imgMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(0), new Float32Array(1) ], channels: 3 },
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1) ], channels: 3 }
            );
        });
        
        it('should throw error if R, G, B, and A cahnnel length in RGBA "imgMatrix" is not equal', function () {
            testError(/Bad argument 'imgMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            }, {
                rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            });
            
            testError(/Bad argument 'imgMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0),new Float32Array(0), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            }, { rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            });
            
            testError(/Bad argument 'imgMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0), new Float32Array(0), new Float32Array(0), new Float32Array(1) ],
                channels: 4
            }, {
                rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            });
        });
        
        it('should throw error if K and A cahnnel length in KA "tplMatrix" is not equal', function () {
            testError(/Bad argument 'tplMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1) ], channels: 2 },
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(1) ], channels: 2 }
            );
        });
        
        it('should throw error if R, G, and B cahnnel length in RGB "tplMatrix" is not equal', function () {
            testError(/Bad argument 'tplMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1) ], channels: 3 },
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(1), new Float32Array(1) ], channels: 3 }
            );
            
            testError(/Bad argument 'tplMatrix.data'/,
                { rows: 0, cols: 0, data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1) ], channels: 3 },
                { rows: 0, cols: 0, data: [ new Float32Array(0), new Float32Array(0), new Float32Array(1) ], channels: 3 }
            );
        });
        
        it('should throw error if R, G, B, and A cahnnel length in RGBA "tplMatrix" is not equal', function () {
            testError(/Bad argument 'tplMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            }, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            });
            
            testError(/Bad argument 'tplMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            }, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0),new Float32Array(0), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            });
            
            testError(/Bad argument 'tplMatrix.data'/, {
                rows: 0, cols: 0,
                data: [ new Float32Array(1), new Float32Array(1), new Float32Array(1), new Float32Array(1) ],
                channels: 4
            }, {
                rows: 0, cols: 0,
                data: [ new Float32Array(0), new Float32Array(0), new Float32Array(0), new Float32Array(1) ],
                channels: 4
            });
        });
    });
    
    describe('rest arguments', function () {
        var img = {
            rows: 2, cols: 2, channels: 1,
            data: [ new Float32Array([ 255, 255, 255, 255 ]) ]
        };
        
        var tpl = {
            rows: 2, cols: 2, channels: 1,
            data: [ new Float32Array([ 255, 255, 255, 254 ]) ]
        };
        
        it('should default "colorTolerance" to 0 if argument is not integer', function (done) {
            search(img, tpl, "a", 0, function (error, result) {
                assert.strictEqual(result.length, 0);
                done();
            });
        });
        
        it('should default "pixelTolerance" to 0 if argument is not integer', function (done) {
            search(img, tpl, 0, "a", function (error, result) {
                assert.strictEqual(result.length, 0);
                done();
            });
        });
        
        it('should not to crash if "callback" is not passed', function (done) {
            search(img, tpl, 0, 0);
            setImmediate(done);
        });
    });
});
