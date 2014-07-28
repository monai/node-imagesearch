# node-imagesearch

Fuzzy search for subimage within image. Tolerates color drift and bad pixels.

## Installation

`npm install imagesearch`

## How to use

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
## API

**imagesearch(image, template, [options], callback);**

### image and template

Image object should have following example form:

``` js
{
  width: 10,
  height: 10,
  channels: 3,
  data: <Buffer ff ff ff ...>
}
```
where

- `width` Number - image width
- `height`Number - image height
- `channels` Number - optional, number of color channels in image, possible values: 1-4
- `data` Buffer - image pixel data

Property `channels` is optional and is used, if provided, for `data` length validation only.

Property `data` is buffer with pixel data arranged from top-leftmost to bottom-rightmost pixel. Possible channel orders are listed bellow:

- K (grayscale)
- KA (grayscale + alpha)
- RGB
- RGBA

For example, let's say we have 2x2 pixel image with red background and blue pixel on bottom left corner. So data buffer would look like this:

``` js
<Buffer ff 00 00 ff 00 00 00 00 ff ff 00 00>
```

For convenience image object is compatible with object returned by [pngparse](https://www.npmjs.org/package/pngparse) module as shown in usage example above. This image object structure in turn is similar to [HTML5 Canvas ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object.

### options

Two options are supported:

- `colorTolerance` Number - threshold difference in color to treat respective image and template pixels as of the same color.
- `pixelTolerance` Number - threshold number of not matching (bad) pixels to treat subimage as still matching.

Options `colorTolerance` and `pixelTolerance` can be used together.

Option `colorTolerance` is  combined for all channels. For example, if `colorTolerance == 10`, then R channel difference can be 6, G - 4, and B should match exactly, to treat pixel color as matching.

### callback

Callback function will be called with array of result objects. If not a single subimage matched template, result array will be empty. Result object has 3 properties: `x`, `y`, and `accuracy`. The later doesn't bear any strict meaning and is used for ordinal comparison only. The smaller `accuracy` value is, the more accurately template matches subimage.

Example:

``` js
{ x: 2, y: 2, accuracy: 0 }
```

## Under the hood

Image pixel comparison requires a lot steps of algebraic computation which turns into big loops with few small numbers operations in each step. JavaScript doesn't have native SIMD support, although there are signs of promising [initiatives](https://01.org/blogs/tlcounts/2014/bringing-simd-javascript) and situation eventually can be changed. Of yet there's no other way to speed things up as to use native bindings to some algebra library that supports vectorization. Since image data can be expressed as matrix, [Eigen](http://eigen.tuxfamily.org/) C++ template library is used in this project.

## Contribution

- Various contributions and pull requests are welcome.
- Especially welcome is addon code review and improvement from experienced C++ developers and mathematicians.

## License

ISC
