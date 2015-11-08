// class MercatorProjection
//    It is based the original code by Google
//    https://developers.google.com/maps/documentation/javascript/examples/map-coordinates

function MercatorProjection() {
  this.pixelOrigin_ = new google.maps.Point(MercatorProjection.TILE_SIZE / 2, MercatorProjection.TILE_SIZE / 2);
  this.pixelsPerLonDegree_ = MercatorProjection.TILE_SIZE / 360;
  this.pixelsPerLonRadian_ = MercatorProjection.TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.TILE_SIZE = 256;

MercatorProjection.latlngFromOriginByPixel = function(projection, /*LatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, zoom) {
  var num_tiles, world_coordinate, pixel_coordinate, tile_coordinate, x, y;
  projection = projection || new MercatorProjection();
  num_tiles         = 1 << zoom;
  world_coordinate  = projection.fromLatLngToPoint(origin);
  pixel_coordinate  = new google.maps.Point(
                            world_coordinate.x * num_tiles,
                            world_coordinate.y * num_tiles);
  tile_coordinate   = new google.maps.Point(
                            Math.floor(pixel_coordinate.x / MercatorProjection.TILE_SIZE),
                            Math.floor(pixel_coordinate.y / MercatorProjection.TILE_SIZE));
  x = world_coordinate.x + (delta_x / num_tiles);
  y = world_coordinate.y + (delta_y / num_tiles);
  return projection.fromPointToLatLng(new google.maps.Point(x, y));
};

MercatorProjection.bound = function(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
};

MercatorProjection.degreesToRadians = function(deg) {
  return deg * (Math.PI / 180);
};

MercatorProjection.radiansToDegrees = function(rad) {
  return rad / (Math.PI / 180);
};

MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
  var point, siny;
  point = opt_point || new google.maps.Point(0, 0);
  point.x = this.pixelOrigin_.x + latLng.lng() * this.pixelsPerLonDegree_;

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = MercatorProjection.bound(Math.sin(MercatorProjection.degreesToRadians(latLng.lat())), -0.9999, 0.9999);
  point.y = this.pixelOrigin_.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -this.pixelsPerLonRadian_;
  return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
  var lng, latRadians, lat;
  lng = (point.x - this.pixelOrigin_.x) / this.pixelsPerLonDegree_;
  latRadians = (point.y - this.pixelOrigin_.y) / -this.pixelsPerLonRadian_;
  lat = MercatorProjection.radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};
