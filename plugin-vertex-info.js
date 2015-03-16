GPXCasualViewer = GPXCasualViewer || {};

(function (){

  function latlng_distant_from_origin(/*GLatLng*/origin, /*pixel*/delta_x, /*pixel*/delta_y, current_zoom){
    // Original code by Masaru Kitajima: http://blog.section-9.jp/?p=260
    var lat   = origin.lat();
    var lng   = origin.lng();
    var offset  = 268435456; // [pixel] Circumference of the equator when the zoom level 21.
    var pi    = Math.PI;
    var radius  = offset / pi;
    var z     = 21 - current_zoom;

    var d_lat   = ((Math.round(Math.round(offset + radius * lng * pi / 180) + (delta_x << z)) - offset) / radius) * 180 / pi;

    var sin   = Math.sin(lat * pi / 180);
    var log   = Math.log((1 + sin) / (1 - sin));
    var exp   = Math.exp((Math.round(Math.round(offset - radius * log / 2) + (delta_y << z)) -  offset) / radius);
    var d_lng   = (pi / 2 - 2 * Math.atan(exp)) * 180 / pi;

    return new google.maps.LatLng(d_lng, d_lat);
  }

 function index_of_vertex_nearest_click(/*MVCArray*/path, /*GLatLng*/glatlng, zoom){
    var EarthRound = 6378137;
    var min = EarthRound;
    var minindex = -1;

    // scan all segments
    var min_heading;
    for( var i = 0; i < path.getLength() -1; ++i ){
      var b = new google.maps.LatLngBounds();
      b.extend(path.getAt(i));
      b.extend(path.getAt(i+1));
      // append margin
      b.extend( latlng_distant_from_origin(b.getNorthEast(),  5, -5, zoom) );
      b.extend( latlng_distant_from_origin(b.getSouthWest(), -5,  5, zoom) );
      if( b.contains(glatlng) ){
        // point of click is in a rectangle
        var p0 = path.getAt(i);
        var p1 = glatlng;
        var p2 = path.getAt(i+1);
        var p10x = p1.lng() - p0.lng();
        var p10y = p1.lat() - p0.lat();
        var p20x = p2.lng() - p0.lng();
        var p20y = p2.lat() - p0.lat();
        // the absolute value of an angle
        var m = Math.abs( Math.atan2(p10y,p10x)
                - Math.atan2(p20y,p20x) );
        if( m < min ){
          min = m;
          minindex = i;
          min_heading = google.maps.geometry.spherical.computeHeading(path.getAt(i), path.getAt(i+1));
        }
      }
    }

    if( 0 <= minindex ){
      var p0 = google.maps.geometry.spherical.computeDistanceBetween( glatlng, path.getAt(minindex) );
      var p1 = google.maps.geometry.spherical.computeDistanceBetween( glatlng, path.getAt(minindex +1) );
      minindex = p0 < p1 ? minindex : minindex + 1;
    }

    return minindex;
  }

  GPXCasualViewer.register('on_create_polyline', function (polyline){
    polyline.addListener('click',function (mouseevent){
      var path = this.getPath();
      var index = index_of_vertex_nearest_click(path, mouseevent.latLng, this.getMap().getZoom());
      if( 0 <= index ){
        var wpt = this.getSource()[index];
        var info = "#"+ index +"<br>lat="+ wpt.lat +"<br>lon="+ wpt.lon;
        if( wpt.time ){
          info = info + "<br>time="+ wpt.time;
        }
        var infowindow = new google.maps.InfoWindow({
          content: info,
          position: path.getAt(index)
          });
        infowindow.open(this.getMap());
      }
    });
  });

})();
