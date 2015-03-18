GPXCasualViewer = GPXCasualViewer || {};

(function (){

  // Original code by Google
  // https://developers.google.com/maps/documentation/javascript/examples/map-coordinates
  function latlng_from_origin_by_pixel(/*LatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, zoom){
    var TILE_SIZE = 256;
    function bound(value, opt_min, opt_max) {
      if (opt_min != null) value = Math.max(value, opt_min);
      if (opt_max != null) value = Math.min(value, opt_max);
      return value;
    }
    function degreesToRadians(deg){
      return deg * (Math.PI / 180);
    }
    function radiansToDegrees(rad){
      return rad / (Math.PI / 180);
    }
    function MercatorProjection() {
      this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2, TILE_SIZE / 2);
      this.pixelsPerLonDegree_ = TILE_SIZE / 360;
      this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
    }
    MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point){
      var point = opt_point || new google.maps.Point(0, 0);
      point.x = this.pixelOrigin_.x + latLng.lng() * this.pixelsPerLonDegree_;

      // Truncating to 0.9999 effectively limits latitude to 89.189. This is
      // about a third of a tile past the edge of the world tile.
      var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
      point.y = this.pixelOrigin_.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -this.pixelsPerLonRadian_;
      return point;
    };
    MercatorProjection.prototype.fromPointToLatLng = function(point){
      var lng = (point.x - this.pixelOrigin_.x) / this.pixelsPerLonDegree_;
      var latRadians = (point.y - this.pixelOrigin_.y) / -this.pixelsPerLonRadian_;
      var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
      return new google.maps.LatLng(lat, lng);
    };

    var num_tiles         = 1 << zoom;
    var projection        = new MercatorProjection();
    var world_coordinate  = projection.fromLatLngToPoint(origin);
    var pixel_coordinate  = new google.maps.Point(
                              world_coordinate.x * num_tiles,
                              world_coordinate.y * num_tiles);
    var tile_coordinate   = new google.maps.Point(
                              Math.floor(pixel_coordinate.x / TILE_SIZE),
                              Math.floor(pixel_coordinate.y / TILE_SIZE));
    var x = world_coordinate.x + (delta_x / num_tiles);
    var y = world_coordinate.y + (delta_y / num_tiles);
    return projection.fromPointToLatLng(new google.maps.Point(x, y));
  }

  function index_of_vertex_nearest_latlng(/*MVCArray*/path, /*LatLng*/latlng, zoom){
    var EARTH_ROUND = 6378137;
    var min         = EARTH_ROUND;
    var minindex    = -1;
    var margin      =  5; // pixel

    // looking for a pair of points that make a segment which latlng rides,
    // it is the smallest angle of two segments, (path[p] - path[p+1]) and (latlng - path[p+1])
    var min_heading = 180; // angle
    for(var i=0,l=path.getLength()-1; i<l; ++i){
      // narrow down an area to search
      var b = new google.maps.LatLngBounds();
      b.extend(path.getAt(i));
      b.extend(path.getAt(i+1));
      b.extend(latlng_from_origin_by_pixel(b.getNorthEast(),  margin, -margin, zoom));
      b.extend(latlng_from_origin_by_pixel(b.getSouthWest(), -margin,  margin, zoom));
      if( b.contains(latlng) ){
        var p0 = path.getAt(i);
        var p1 = latlng;
        var p2 = path.getAt(i+1);
        var p10x = p1.lng() - p0.lng();
        var p10y = p1.lat() - p0.lat();
        var p20x = p2.lng() - p0.lng();
        var p20y = p2.lat() - p0.lat();
        var m = Math.abs(Math.atan2(p10y,p10x) - Math.atan2(p20y,p20x));
        if( m < min ){
          min = m;
          minindex = i;
          min_heading = google.maps.geometry.spherical.computeHeading(path.getAt(i), path.getAt(i+1));
        }
      }
    }
    if( 0 <= minindex ){
      // finally, which point is closer
      var i0 = google.maps.geometry.spherical.computeDistanceBetween(latlng, path.getAt(minindex   ));
      var i1 = google.maps.geometry.spherical.computeDistanceBetween(latlng, path.getAt(minindex +1));
      minindex = i0 < i1 ? minindex : minindex + 1;
    }
    return minindex;
  }

  GPXCasualViewer.register('on_create_polyline', function (polyline){
    polyline.addListener('click',function (mouseevent){
      var path = this.getPath();
      var index = index_of_vertex_nearest_latlng(path, mouseevent.latLng, this.getMap().getZoom());
      if( 0 <= index ){
        var wpt = this.getSource()[index];
        var content = "#"+ index +"<br/>lat="+ wpt.lat +"<br/>lon="+ wpt.lon;
        if( wpt.time ){
          content = content + "<br/>time="+ wpt.time;
        }
        new google.maps.InfoWindow({
          content: content,
          position: path.getAt(index)
          }).open(this.getMap());
      }
    });
  });

})();
