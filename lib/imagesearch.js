var searchNative = require('../build/Release/search').search;

module.exports = imagesearch;

function imagesearch(image, template, options, callback) {
    var error, colorTolerance, pixelTolerance, imgMatrix, tplMatrix, result;
    
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    
    if (typeof callback !== 'function') {
        return;
    }
    
        if (error = prepare(image, 'image')) {
        return callback(error);
    }
    
    if (error = prepare(template, 'template')) {
        return callback(error);
    }
    
    colorTolerance = options && options.colorTolerance || 0;
    pixelTolerance = options && options.pixelTolerance || 0;
    
    imgMatrix = createMatrix(image);
    tplMatrix = createMatrix(template);
    
    searchNative(imgMatrix, tplMatrix, colorTolerance, pixelTolerance, function (error, result) {
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
        
        callback(null, result);
    });
}

function hop(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

function prepare(image, name) {
    var pixelLength;
    
    if ( ! image) {
        return new Error('Bad '+ name +' object');
    } else if ( ! hop(image, 'data') || (image.data && ! ('length' in image.data))) {
        return new Error('Missing '+ name +' data');
    } else if ( ! hop(image, 'width') || ! hop(image, 'height')) {
        return new Error('Missing '+ name +' dimensions');
    } else {
        image.channels = ! isNaN(image.channels) ? image.channels : 3;
        
        if (image.channels < 1 || image.channels > 4) {
            return new Error('Bad number of '+ name +' channels');
        }
        
        pixelLength = image.data.length / image.channels;
        
        if (image.width * image.height !== pixelLength) {
            return new Error('Bad '+ name +' dimensions');
        }
    }
    
    return null;
}

function focus(result, tplMatrix) {
    var rows, cols, out;
    var prevl, l, skip, ovps;
    
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
            prev = [ prev ];
        }
        
        skip = false;
        l = prev.length;
        while (l--) {
            prevl = prev[l];
            ovps = overlaps(prevl, curr, rows, cols);
            skip = skip || ovps;
            
            if (ovps && curr.accuracy < prevl.accuracy) {
                prev[l] = curr;
            }
        }
        
        if ( ! skip) {
            prev.push(curr);
        }
        
        return prev;
    });
    
    out = out.reduce(function (prev, curr, i) {
        if (i === 1) {
            prev = [ prev ];
        }
        
        l = prev.length;
        skip = false;
        while (l--) {
            prevl = prev[l];
            if (prevl.row === curr.row &&
                prevl.col === curr.col &&
                prevl.accuracy === curr.accuracy) {
                    skip = true;
                    break;
            }
        }
        
        if ( ! skip) {
            prev.push(curr);
        }
        
        return prev;
    });
    
    return out;
}

function overlaps(a, b, r, c) {
    var ac = a.col;
    var ar = a.row;
    var bc = b.col;
    var br = b.row;
    
    var bw = c + bc;
    var bh = r + br;
    var aw = c + ac;
    var ah = r + ar;
    
    return ((bw < bc || bw > ac) &&
            (bh < br || bh > ar) &&
            (aw < ac || aw > bc) &&
            (ah < ar || ah > br));
}

function createMatrix(image) {
    var channels, length, out;
    
    channels = image.channels;
    length = image.data.length / channels;
    
    out = {
        rows: image.height,
        cols: length / image.height,
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
    var channels;
    
    channels = out.length;
    
    for (var i = k = 0, l = raw.length; i < l; k++, i += channels) {
        for (var j = 0; j < channels; j++) {
            out[j][k] = raw[i + j];
        }
    }
}
