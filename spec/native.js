var search = require('../build/Release/search').search;
var assert = require('assert');

describe('native module', function () {
    // describe('search(imgMatrix, tplMatrix, colorTolerance, pixelTolerance, callback)', function () {
    describe('matrix object check', function () {
        function testMissingProperty(regex, img, tpl) {
            assert.throws(function () {
                search(img, tpl);
            }, regex);
        }
        
        it('should throw error if 1st argument is not passed', function () {
            testMissingProperty(/Bad argument 'imgMatrix'/);
        });
        
        it('should throw error if 1st argument does not have property "rows"', function () {
            testMissingProperty(/Bad argument 'imgMatrix'/, { cols: 0, data: null });
        });
        
        it('should throw error if 1st argument does not have property "cols"', function () {
            testMissingProperty(/Bad argument 'imgMatrix'/, { rows: 0, data: null });
        });
        
        it('should throw error if 1st argument does not have property "data"', function () {
            testMissingProperty(/Bad argument 'imgMatrix'/, { rows: 0, cols: 0 });
        });
        
        it('should throw error if 2nd argument is not passed', function () {
            testMissingProperty(/Bad argument 'tplMatrix'/, { rows: 0, cols: 0, data: null });
        });
        
        it('should throw error if 2nd argument does not have property "rows"', function () {
            testMissingProperty(/Bad argument 'tplMatrix'/, { rows: 0, cols: 0, data: null }, { cols: 0, data: null });
        });
        
        it('should throw error if 2nd argument does not have property "cols"', function () {
            testMissingProperty(/Bad argument 'tplMatrix'/, { rows: 0, cols: 0, data: null }, { rows: 0, data: null });
        });
        
        it('should throw error if 2nd argument does not have property "data"', function () {
            testMissingProperty(/Bad argument 'tplMatrix'/, { rows: 0, cols: 0, data: null }, { rows: 0, cols: 0 });
        });
    });
});
