var search = require('../build/Release/search.node').search;

module.exports = {
	search: exports$search
};

function exports$search(img, imgRows, tpl, tplRows, colorTolerance, pixelTolerance) {
	
	var imgMatrix, tplMatrix;
	
	imgMatrix = createMatrix(img, imgRows);
	tplMatrix = createMatrix(tpl, tplRows);
	
	return search(imgMatrix, tplMatrix, colorTolerance, pixelTolerance);
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
