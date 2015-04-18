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
  isActiveInfoWindow: function (info) {
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
  _pad: function (number, column){
    return (Math.pow(10, column) + parseInt(number)).toString().slice(-column);
  },
  generateContent: function(id, wpt, idx) {
    var tm = null, dt;
    if ( wpt.time ) {
      var dt = new Date(wpt.time);
      tm = this._pad(dt.getFullYear(),4) +'-'+ this._pad(dt.getMonth()+1,2) +'-'+ this._pad(dt.getDate(),2) +' '+
           this._pad(dt.getHours(),   2) +':'+ this._pad(dt.getMinutes(),2) +':'+ this._pad(dt.getSeconds(),2);
    }
    return [
      '<div class="info-window"><div id="'+ id +'" class="vertex">',
      '  <div class="headline"><span class="idx">#'+ idx +'</span></div>',
      '  <div class="complex-type wpt-type">',
      '    <div class="attribute"><span class="latlon lat">'+ wpt.lat +'</span>, <span class="latlon lon">'+ wpt.lon +'</span></div>',
      '    <div class="children"><span class="timestamp">'+ (tm ? tm : '') +'</span></div>',
      '</div></div></div>',
    ].join('\n');
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
        var id = PLUGIN.generateId();
        var info = new google.maps.InfoWindow({
          content: PLUGIN.generateContent(id, polyline.getSource()[index], index),
          position: polyline.getPath().getAt(index)
          });
        info.set(PLUGIN.namespace, {id: id, index: index, polyline: polyline});

        google.maps.event.addListener(info, 'domready', function(ev) {
          PLUGIN.setActiveInfoWindow(this, true);
          google.maps.event.addDomListener(document.getElementById(this.get(PLUGIN.namespace).id), 'click', (function(ev) {
            PLUGIN.setActiveInfoWindow(this, true);
          }).bind(this));
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
