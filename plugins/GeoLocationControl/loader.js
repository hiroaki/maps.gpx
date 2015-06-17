GPXCasualViewer.plugin.GeoLocationControl = {
  path: null,
  className: 'locationcontrol-controls',
  createIconNode: function (type){
    var ic = document.createElement('img');
    ic.setAttribute('src', GPXCasualViewer.plugin.GeoLocationControl.path + type);
    ic.setAttribute('width', 32);
    ic.setAttribute('height', 32);
    return ic;
  },
  callback: function() {
    GPXCasualViewer.plugin.detectPathOfPlugin('GeoLocationControl');
    this.require_css('GeoLocationControl').then(function (src){
      console.log("css loaded "+ src);
    });

    function ControlState(){
      this.initialize.apply(this, arguments);
    }
    ControlState.prototype = {
      initialize: function (){
        this.element = document.createElement('div');
        this.element.setAttribute('class', GPXCasualViewer.plugin.GeoLocationControl.className);
        this.ic_enabled  = GPXCasualViewer.plugin.GeoLocationControl.createIconNode('ic_location_searching_black_24dp.png');
        this.ic_fixed    = GPXCasualViewer.plugin.GeoLocationControl.createIconNode('ic_gps_fixed_red_24dp.png');
        this.ic_located  = GPXCasualViewer.plugin.GeoLocationControl.createIconNode('ic_gps_fixed_blue_24dp.png');
        this.ic_failed   = GPXCasualViewer.plugin.GeoLocationControl.createIconNode('ic_gps_off_black_24dp.png');
        this.ic_disabled = GPXCasualViewer.plugin.GeoLocationControl.createIconNode('ic_location_disabled_black_24dp.png');
        this.current = 'enabled';
        this.element.appendChild(this['ic_'+ this.current]);
      },
      getElement: function (){
        return this.element;
      },
      isFixed: function (){
        return this.current == 'fixed';
      },
      isLocated: function (){
        return this.current == 'located';
      },
      changeTo: function (state){
        if ( this.current != state ) {
          this.element.removeChild(this['ic_'+ this.current]);
          this.element.appendChild(this['ic_'+ state]);
          this.current = state;
        }
      }
    };

    function CurrentPositionOverlay(){
      this.initialize.apply(this, arguments);
    }
    CurrentPositionOverlay.prototype = {
      initialize: function (options){
        options     = options || {};
        this.marker = null;
        this.circle = null;
        this.shown  = false;
      },
      setMap: function(map) {
        if ( this.marker ) {
          this.marker.setMap(map);
        }
        if ( this.circle ) {
          this.circle.setMap(map);
        }
        if ( map ) {
          this.shown = true;
        } else {
          this.shown = false;
        }
        return this;
      },
      isOverlayed: function() {
        return this.shown ? true : false;
      },
      reset: function(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if ( this.circle ) {
          this.marker.setPosition(latlng);
          this.circle.setCenter(latlng);
        } else {

          this.marker = new google.maps.Marker({
            clickable: false,
            position: latlng
          });

          this.circle = new google.maps.Circle({
            center: latlng,
            clickable: false,
            fillColor: '#9999FF',
            fillOpacity: 0.2,
            strokeColor: '#000099',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            radius: (position.coords.accuracy || 1.0)
            });
        }
        return latlng;
      }
    };

    var cs = new ControlState();
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(cs.getElement());
    if ( ! this.isSupportedGeoLocation() ) {
      cs.changeTo('disabled');
      return;
    }

    var overlay = new CurrentPositionOverlay();

    this.register('onBeginWatchGeoLocation', (function(applied) {
      cs.changeTo('fixed');
    }).bind(this));

    this.register('onEndWatchGeoLocation', (function(applied) {
      cs.changeTo('enabled');
      overlay.setMap(null);
    }).bind(this));

    this.register('onGetGeoLocation', (function(position) {
      var latlng = overlay.reset(position);
      if ( ! overlay.isOverlayed() ) {
        overlay.setMap(this.getMap());
      }
      if ( cs.isFixed() ) {
        this.getMap().panTo(latlng);
      }
    }).bind(this));

    this.register('onGetGeoLocationError', (function(error) {
      cs.changeTo('failed');
      overlay.setMap(null);
    }).bind(this));

    google.maps.event.addDomListener(cs.getElement(), 'click', (function(ev) {
      if ( this.isWatchingGeoLocation() && cs.isFixed() ) {
        cs.changeTo('located');
      } else {
        if ( this.isWatchingGeoLocation() ) {
          this.endWatchGeoLocation();
        } else {
          this.beginWatchGeoLocation();
        }
      }
    }).bind(this));

    google.maps.event.addDomListener(this.getMap(), 'dragstart', (function(ev) {
      if ( this.isWatchingGeoLocation() && cs.isFixed() ) {
        cs.changeTo('located');
      }
    }).bind(this));

  }
};
