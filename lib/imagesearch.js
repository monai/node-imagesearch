var search = require('../build/Release/search.node').search;

module.exports = {
	search: exports$search
};

function exports$search(img, imgRows, tpl, tplRows, colorTolerance, pixelTolerance) {
	
	var imgMatrix, tplMatrix;
	
	imgMatrix = new Matrix(img, imgRows);
	tplMatrix = new Matrix(tpl, tplRows);
	
	return search(imgMatrix, tplMatrix, colorTolerance, pixelTolerance);
}

var $Matrix = Matrix.prototype;
$Matrix._split = Matrix$_split;

function Matrix(data, rows) {
	var length = data.length / 3;
	
	this.rows = rows;
	this.cols = (length / rows);
	
	this.data = {
		r: new Int32Array(length),
		g: new Int32Array(length),
		b: new Int32Array(length)
	};
	
	this._raw = data;
	
	this._split();
}

function Matrix$_split() {
	var raw, data;
	
	raw = this._raw;
	data = this.data;
	
	r = data.r;
	g = data.g;
	b = data.b;
	
	for (var i = k = 0, l = raw.length; i < l; k++, i += 3) {
		r[k] = raw[i];
		g[k] = raw[i + 1];
		b[k] = raw[i + 2];
	}
}
