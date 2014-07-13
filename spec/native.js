var search = require('../build/Release/search').search;
var assert = require('assert');

describe('native addon', function () {
    // describe('search(imgMatrix, tplMatrix, colorTolerance, pixelTolerance, callback)', function () {
    describe('matrix object check', function () {
        function testError(regex, img, tpl) {
            assert.throws(function () {
                search(img, tpl);
            }, regex);
        }
        
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
});
