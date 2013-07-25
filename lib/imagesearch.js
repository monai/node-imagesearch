var search = require('../build/Release/search.node').search;

module.exports = {
	search: exports$search
};

function exports$search(img, imgRows, tpl, tplRows, colorTolerance, pixelTolerance) {
	
	var imgMatrix, tplMatrix, result;
	
	imgMatrix = createMatrix(img, imgRows);
	tplMatrix = createMatrix(tpl, tplRows);
	
	result = search(imgMatrix, tplMatrix, colorTolerance, pixelTolerance);
	return focus(result, tplMatrix);
}

function focus(result, tplMatrix) {
	var rows, cols, out;
	var prevl, l, skip, _intersects;
	
	rows = tplMatrix.rows;
	cols = tplMatrix.cols;
	out = [];
	
	out = result.reduce(function (prev, curr, i) {
		if ( i === 1) {
			return [ prev.accuracy < curr.accuracy ? prev : curr ];
		}
		
		skip = false;
		l = prev.length;
		while (l--) {
			prevl = prev[l];
			_intersects = intersects(prevl, curr, rows, cols);
			skip = skip || _intersects;
			
			if (_intersects) {
				if (curr.accuracy < prevl.accuracy) {
					prev[l] = curr;
				}
			}
		}
		
		if ( ! skip) {
			prev.push(curr);
		}
		
		return prev;
	});
	
	return out;
}

function intersects(res1, res2, rows, cols) {
	return true &&
	res1.row <= res2.row + rows &&
	res2.row <= res1.row + rows &&
	res1.col <= res2.col + cols &&
	res2.col <= res1.col + cols;
}

function createMatrix(raw, rows) {
	var length, cols, out;
	
	length = raw.length / 3;
	cols = length / rows;
	
	out = {
		rows: rows,
		cols: cols,
		data: {
			r: new Int32Array(length),
			g: new Int32Array(length),
			b: new Int32Array(length)
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
