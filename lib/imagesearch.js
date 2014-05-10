var searchNative = require('../build/Release/search.node').search;

module.exports = search;

function search(img, imgRows, tpl, tplRows, colorTolerance, pixelTolerance) {
    
    var imgMatrix, tplMatrix, result;
    
    imgMatrix = createMatrix(img, imgRows);
    tplMatrix = createMatrix(tpl, tplRows);
    
    result = searchNative(imgMatrix, tplMatrix, colorTolerance, pixelTolerance);
    result = focus(result, tplMatrix);
    
    result = result.map(function (match) {
        return {
            x: match.col,
            y: match.row,
            accuracy: match.accuracy
        };
    });
    
    result.sort(function (obj1, obj2) {
        return obj1.accuracy - obj2.accuracy;
    });
    
    return result;
}

function focus(result, tplMatrix) {
    var rows, cols, out;
    var prevl, l, skip, intersects;
    
    rows = tplMatrix.rows;
    cols = tplMatrix.cols;
    
    if (result.length === 1) {
        return result;
    }
    
    if ( ! result.length) {
        return [];
    }
    
    out = result.reduce(function (prev, curr, i) {
        if ( i === 1) {
            return [ prev.accuracy < curr.accuracy ? prev : curr ];
        }
        
        skip = false;
        l = prev.length;
        while (l--) {
            prevl = prev[l];
            intersects = (
                prevl.row <= curr.row + rows &&
                curr.row <= prevl.row + rows &&
                prevl.col <= curr.col + cols &&
                curr.col <= prevl.col + cols
            );
            skip = skip || intersects;
            
            if (intersects && curr.accuracy < prevl.accuracy) {
                prev[l] = curr;
            }
        }
        
        if ( ! skip) {
            prev.push(curr);
        }
        
        return prev;
    });
    
    return out;
}

function createMatrix(raw, rows) {
    var length, cols, out;
    
    length = raw.length / 3;
    cols = length / rows;
    
    out = {
        rows: rows,
        cols: cols,
        data: {
            r: new Float32Array(length),
            g: new Float32Array(length),
            b: new Float32Array(length)
        }
    };
    
    split(raw, out.data);
    
    return out;
}

function split(raw, out) {
    var r, g, b;
    
    r = out.r;
    g = out.g;
    b = out.b;
    
    for (var i = k = 0, l = raw.length; i < l; k++, i += 3) {
        r[k] = raw[i];
        g[k] = raw[i + 1];
        b[k] = raw[i + 2];
    }
}
