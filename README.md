# node-imagesearch

Fuzzy search for subimage within image.

## Installation

`npm install imagesearch`

## Example

``` js
var pngparse = require('pngparse');
var imagesearch = require('imagesearch');

pngparse.parseFile('image.png', function (error, image) {
  pngparse.parseFile('template.png', function (error, template) {
    imagesearch(image, template, function (error, results) {
      console.log(results);
    });
  });
})
```
## Usage

**imagesearch(image, template, [options], callback)**

### image and template

`image` and `template` objects are compatible with image objects produced by [pngparse](https://www.npmjs.org/package/pngparse) module, which in turn is similar to [HTML5 Canvas ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object.

Example:

    {
        width: 10,
        height: 10,
        channels: 3,
        data: <Buffer ff ff ff ...>
    }

All properties except `channels` are mandatory and error will be returned if one or more are missing. However `channels`, if provided, will be used to validate data length. Data length should be equal to `width * height * channels`. If `channels` is not provided, it will be calculated as follows: `data.length / (width * height)`.

Supported data values:

- K (grayscale)
- KA (grayscale + alpha)
- RGB
- RGBA

### options

Two options are supported:

- `colorTolerance` Number - threshold difference in color to treat respective image and template pixels as of the "same" color.
- `pixelTolerance` Number - number of not matching template pixels to treat template as matching.

`colorTolerance` and `pixelTolerance` can be used together.

`colorTolerance` is  combined for all channels. For example if `colorTolerance` equals `10`, then R channel difference can be `6`, G - `4`, and B should match exactly, to treat pixel color as matching.

### callback

Callback function will be called with array of result objects. If not a single template instance was found, result array will be empty. Result object has 3 properties: `x`, `y`, and `accuracy`. The later doesn't bear any strict meaning and is used for relational use only. The smaller `accuracy` value is, the more accuratly template matches subimage.

Example:

    {
        x: 2,
        y: 2,
        accuracy: 0
    }

## Under the hood

Image pixel comparison requires a lot steps of algebraic computation which turns into big loops with few small numbers operations in each step. JavaScript doesn't have native SIMD support, although theres signs of promising [initiatives](https://01.org/blogs/tlcounts/2014/bringing-simd-javascript) and situation eventually can be changed. As yet there's no other way to speed things  as to use native bindings to some algebra library that supports vectorization. Since image data can be expressed as matrix, [Eigen](http://eigen.tuxfamily.org/) C++ template library is used in this project.

## Contribution

Various contribution and pull requests are welcome. Especially welcome is addon code review and improvement from experienced C++ developers.

## License

ISC
