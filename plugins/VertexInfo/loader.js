GPXCasualViewer.plugin.VertexInfo = {
  latlngFromOriginByPixel: function(/*LatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, zoom) {
    // Original code by Google
    // https://developers.google.com/maps/documentation/javascript/examples/map-coordinates
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
  },
  indexOfVertexNearestLatlng: function(/*MVCArray*/path, latlng, zoom) {
    // looking for a pair of points that make a segment which latlng rides,
    // it is the smallest angle of two segments, (path[p] - path[p+1]) and (latlng - path[p+1])
    var EARTH_ROUND = 6378137,
        min         = EARTH_ROUND,
        minindex    =  -1,
        margin      =   5, // pixel
        min_heading = 180, // angle
        b, i, l, i0, i1, p0, p1, p2, p10x, p10y, p20x, p20y, m;
    for (i = 0, l = path.getLength() - 1; i < l; ++i) {
      // narrow down an area to search
      b = new google.maps.LatLngBounds();
      b.extend(path.getAt(i));
      b.extend(path.getAt(i+1));
      b.extend(GPXCasualViewer.plugin.VertexInfo.latlngFromOriginByPixel(b.getNorthEast(),  margin, -margin, zoom));
      b.extend(GPXCasualViewer.plugin.VertexInfo.latlngFromOriginByPixel(b.getSouthWest(), -margin,  margin, zoom));
      if ( b.contains(latlng) ) {
        p0   = path.getAt(i),
        p1   = latlng,
        p2   = path.getAt(i+1),
        p10x = p1.lng() - p0.lng(),
        p10y = p1.lat() - p0.lat(),
        p20x = p2.lng() - p0.lng(),
        p20y = p2.lat() - p0.lat(),
        m    = Math.abs(Math.atan2(p10y,p10x) - Math.atan2(p20y,p20x));
        if ( m < min ) {
          min = m,
          minindex = i,
          min_heading = google.maps.geometry.spherical.computeHeading(path.getAt(i), path.getAt(i+1));
        }
      }
    }
    if ( 0 <= minindex ) {
      // finally, which point is closer
      i0 = google.maps.geometry.spherical.computeDistanceBetween(latlng, path.getAt(minindex   )),
      i1 = google.maps.geometry.spherical.computeDistanceBetween(latlng, path.getAt(minindex +1));
      minindex = i0 < i1 ? minindex : minindex + 1;
    }
    return minindex;
  },
  callback: function() {
    // add hook points
    console.log('add hook points: "onVertexInfo"');
    this.hook['onVertexInfo'] = this.hook['onVertexInfo'] || [];
    // 
    this.register('onCreatePolyline', (function(polyline) {
      polyline.addListener('click', (function(mouseevent) {
        var idx = GPXCasualViewer.plugin.VertexInfo.indexOfVertexNearestLatlng(
                    this.polyline.getPath(), mouseevent.latLng, this.polyline.getMap().getZoom());
        if ( this.app.hook['onVertexInfo'].length != 0 ) {
          this.app.applyHook('onVertexInfo', polyline, idx, mouseevent);
        } else {
          GPXCasualViewer.plugin.VertexInfo._handlerHookOnClickPolylineDefault.call(this.app, polyline, idx, mouseevent);
        }
      }).bind({app: this, polyline: polyline}));
    }).bind(this));

  },
  _handlerHookOnClickPolylineDefault: function(polyline, index, mouseevent) {
    if ( 0 <= index && polyline.isTrk() ) {
      var wpt = polyline.getSource()[index],
          content = '#'+ index +'<br/>lat='+ wpt.lat +'<br/>lon='+ wpt.lon;
      if ( wpt.ele ) {
        content = content + '<br/>ele='+ wpt.ele;
      }
      if ( wpt.time ) {
        content = content + '<br/>time='+ wpt.time;
      }
      new google.maps.InfoWindow({
        content: content,
        position: polyline.getPath().getAt(index)
        }).open(polyline.getMap());
    }

  }
};
