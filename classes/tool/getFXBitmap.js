//复制对象
export function getFXBitmap(source, filters, x, y, w, h) {
  // cache the source, so we can grab a rasterized image of it:
  source.cache(x, y, w, h);

  // create a new Bitmap, using the source's cacheCanvas:
  var bmp = new createjs.Bitmap(source.cacheCanvas);

  // add the filters, and cache to apply them
  bmp.filters = filters;
  bmp.cache(0, 0, w, h);

  // offset the bmp's registration to account for the cache offset:
  bmp.regX = -x;
  bmp.regY = -y;
  bmp.x = source.x;
  bmp.y = source.y;
  // bmp.alpha = 0;

  // uncache the source:
  source.uncache();

  return bmp;
}