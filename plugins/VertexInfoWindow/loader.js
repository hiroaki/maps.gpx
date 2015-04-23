GPXCasualViewer.plugin.VertexInfoWindow = {
  namespace: 'VertexInfoWindow',
  templateOfId: 'vertex-info-window-',
  _active: null,
  getActiveInfoWindow: function() {
    return this._active;
  },
  setActiveInfoWindow: function(info, focus) {
    this._active = info;
    if ( focus ) {
      info.setZIndex(this.getHigherZIndex());
    }
  },
  isActiveInfoWindow: function(info) {
    return this._active === info;
  },
  _maxZindex: 0,
  getHigherZIndex: function() {
    return ++this._maxZindex;
  },
  _sequence: 0,
  generateId: function() {
    return this.templateOfId +''+ ++this._sequence;
  },
  pad: function(number, column) {
    return (Math.pow(10, column) + parseInt(number)).toString().slice(-column);
  },
  _commify: function(matched, cap) {
    if ( matched.match(/\..*\./) || matched.match(/,/) ) {
      return matched;
    }
    while (cap != (cap = cap.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
    return cap;
  },
  commify: function(str) {
    return str.toString().replace(/([0-9\.,]+)/g, GPXCasualViewer.plugin.VertexInfoWindow._commify);
  },
  generateContent: function(id, wpt, idx) {
    var tm = '', dt;
    if ( wpt.time ) {
      dt = new Date(wpt.time);
      tm = [[this.pad(dt.getFullYear(),4), this.pad(dt.getMonth()+1,2), this.pad(dt.getDate(),2)].join('-'),
            [this.pad(dt.getHours(),   2), this.pad(dt.getMinutes(),2), this.pad(dt.getSeconds(),2)].join(':')].join(' ');
    }
    return [
      '<div class="info-window"><div id="', id, '" class="vertex">',
      '  <div class="headline">',
      '    <input type="radio" name="origin" value="', idx, '" title="set origin"/> <span class="idx">', idx, '</span>',
      '  </div>',
      '  <div class="complex-type wpt-type">',
      '    <div class="attribute"><span class="latlon lat">', wpt.lat, '</span>, <span class="latlon lon">', wpt.lon, '</span></div>',
      '    <div class="children"><span class="timestamp">', tm, '</span></div>',
      '  </div>',
      '  <div class="measure">',
      '   &nbsp;',
      '  </div>',
      '</div></div>'].join('');
  },
  callback: function() {
    var PLUGIN = GPXCasualViewer.plugin.VertexInfoWindow;

    google.maps.event.addDomListener(document, 'keydown', function(ev) {
      var info = PLUGIN.getActiveInfoWindow();
      if ( info == null ) {
        return;
      }

      var data = info.get(PLUGIN.namespace);
      if ( ev.keyCode == 39 && data.index < data.polyline.getPath().getLength() -1 ) {
        data.index += 1;
      } else if ( ev.keyCode == 37 && 0 < data.index ) {
        data.index -= 1;
      } else {
        return;
      }
      info.set(PLUGIN.namespace, data); // update index

      var latlng = data.polyline.getPath().getAt(data.index);
      if ( ev.shiftKey ) {
        data.polyline.getMap().panTo(latlng);
      }
      info.setPosition(latlng);
      info.setContent(
        PLUGIN.generateContent(
          data.id,
          data.polyline.getSource()[data.index],
          data.index
        )
      );
    });

    this.register('onVertexInfo', function(polyline, index, mouseevent) {
      if ( 0 <= index && polyline.isTrk() ) {
        var id    = PLUGIN.generateId(),
            info  = new google.maps.InfoWindow({
                      content: PLUGIN.generateContent(id, polyline.getSource()[index], index),
                      position: polyline.getPath().getAt(index)
                      });
        info.set(PLUGIN.namespace, {id: id, index: index, polyline: polyline});

        google.maps.event.addListener(info, 'domready', function(ev) {
          PLUGIN.setActiveInfoWindow(this, true);
          var div = document.getElementById(this.get(PLUGIN.namespace).id);
          google.maps.event.addDomListener(div, 'click', (function(ev) {
            PLUGIN.setActiveInfoWindow(this, true);
          }).bind(this));
          // search origin
          var index_origin = null,
              vertex_infos = document.getElementsByClassName('vertex'),
              i, l;
          for ( i = 0, l = vertex_infos.length; i < l; ++i ) {
            var radio = vertex_infos.item(i).getElementsByTagName('input').item(0);
            if ( radio.type == 'radio' && radio.checked ) {
              index_origin = radio.value;
              break;
            }
          }
          // measure
          if ( index_origin && div !== vertex_infos.item(i) ) {
            var index_current   = div.getElementsByTagName('input').item(0).value;
            var distance_track  = polyline.computeDistanceTrack(index_origin, index_current);
            // var distance_linear = polyline.computeDistanceLinear(index_origin, index_current);
            // console.log(''+ index_origin +' to '+ index_current +' = linear: '+ distance_linear +' track: '+ distance_track );
            var min = '',
                avg = '',
                src = this.get(PLUGIN.namespace).polyline.getSource(),
                sec = '';
            if ( src[index_origin].time && src[index_current].time ) {
              sec = (new Date(src[index_current].time) - new Date(src[index_origin].time)) / 1000;
              min = Math.round(sec / 60);
              if ( sec != 0 ) {
                avg = Math.abs((Math.round( ((distance_track / 1000) / (sec / 60 / 60)) * 10 ) / 10)).toString() + ' km/h';
              } else {
                avg = '0 km/h';
              }
            }
            div.getElementsByClassName('measure').item(0)
            .innerHTML = [PLUGIN.commify(Math.round(distance_track)) +' meters', min +' mins', avg].join(', ');
          }
        });

        google.maps.event.addListener(info, 'closeclick', function() {
          this.set(PLUGIN.namespace, null);
          google.maps.event.clearInstanceListeners(this);
          if ( PLUGIN.isActiveInfoWindow(this) ) {
            PLUGIN.setActiveInfoWindow(null);
          }
        });

        info.open(polyline.getMap());
      }
    });

  }
};
