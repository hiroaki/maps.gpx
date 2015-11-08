MapsGPX.plugin.VertexInfo = {
  bundles: [
    'MercatorProjection.js'
  ],
  indexOfVertexNearestLatlng: function(projection, /*MVCArray*/path, latlng, zoom) {
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
      b.extend(MercatorProjection.latlngFromOriginByPixel(projection, b.getNorthEast(),  margin, -margin, zoom));
      b.extend(MercatorProjection.latlngFromOriginByPixel(projection, b.getSouthWest(), -margin,  margin, zoom));
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
  callback: function(params) {
    var projection = new MercatorProjection();
    this.context['VertexInfo'] = {
      projection: projection
    };
    // add hook points
    this.hook['onVertexInfo'] = this.hook['onVertexInfo'] || [];
    // 
    this.register('onCreatePolyline', (function(polyline) {
      polyline.addListener('click', (function(mouseevent) {
        var idx = MapsGPX.plugin.VertexInfo.indexOfVertexNearestLatlng(
                    this.app.context['VertexInfo'].projection,
                    this.polyline.getPath(), mouseevent.latLng, this.polyline.getMap().getZoom());
        if ( this.app.hook['onVertexInfo'].length != 0 ) {
          this.app.applyHook('onVertexInfo', polyline, idx, mouseevent);
        } else {
          MapsGPX.plugin.VertexInfo._handlerHookOnClickPolylineDefault.call(this.app, polyline, idx, mouseevent);
        }
      }).bind({app: this, polyline: polyline}));
    }).bind(this));
  },
  _handlerHookOnClickPolylineDefault: function(polyline, index, mouseevent) {
    var wpt, content;
    if ( 0 <= index && polyline.isTrk() ) {
      wpt = polyline.getSource()[index];
      content = ['#', index, '<br/>lat=', wpt.lat, '<br/>lon=', wpt.lon];
      if ( wpt.ele ) {
        content.push('<br/>ele='+ wpt.ele);
      }
      if ( wpt.time ) {
        content.push('<br/>time='+ wpt.time);
      }
      new google.maps.InfoWindow({
        content: content.join(''),
        position: polyline.getPath().getAt(index)
        }).open(polyline.getMap());
    }
  }
};
