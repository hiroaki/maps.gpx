MapsGPX.plugin.GeoLocationControl = {
  callback: function(params) {
    var overlay, mc, CurrentPositionOverlay;

    CurrentPositionOverlay = function() {
      this.initialize.apply(this, arguments);
    }
    CurrentPositionOverlay.prototype = {
      initialize: function(options) {
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
            position: latlng,
            icon: new google.maps.MarkerImage(
              [MapsGPX.plugin.GeoLocationControl.path, 'gpsloc.png'].join('/'),
              new google.maps.Size(16,16),
              new google.maps.Point(0,0),
              new google.maps.Point(8,8))
          });

          this.circle = new google.maps.Circle({
            center: latlng,
            clickable: false,
            fillColor: '#CCCCFF',
            fillOpacity: 0.2,
            strokeColor: '#6666CC',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            radius: (position.coords.accuracy || 1.0)
            });
        }
        return latlng;
      }
    };

    overlay = new CurrentPositionOverlay();

    mc = new MapsGPX.MapControl({
       enabled: [MapsGPX.plugin.GeoLocationControl.path, 'ic_location_searching_black_24dp.png'].join('/'),
         fixed: [MapsGPX.plugin.GeoLocationControl.path, 'ic_gps_fixed_red_24dp.png'].join('/'),
       located: [MapsGPX.plugin.GeoLocationControl.path, 'ic_gps_fixed_blue_24dp.png'].join('/'),
        failed: [MapsGPX.plugin.GeoLocationControl.path, 'ic_gps_off_black_24dp.png'].join('/'),
      disabled: [MapsGPX.plugin.GeoLocationControl.path, 'ic_location_disabled_black_24dp.png'].join('/')
      }, {
        initial: 'enabled'
      });
    mc.setMap(this.map);

    if ( ! this.isSupportedGeoLocation() ) {
      mc.changeIcon('disabled');
      return;
    }

    this.register('onBeginWatchGeoLocation', (function(applied) {
      mc.changeIcon('fixed');
    }).bind(this));

    this.register('onEndWatchGeoLocation', (function(applied) {
      mc.changeIcon('enabled');
      overlay.setMap(null);
    }).bind(this));

    this.register('onGetGeoLocation', (function(position) {
      var latlng = overlay.reset(position);
      if ( ! overlay.isOverlayed() ) {
        overlay.setMap(this.getMap());
      }
      if ( mc.isCurrentIcon('fixed') ) {
        this.getMap().panTo(latlng);
      }
    }).bind(this));

    this.register('onGetGeoLocationError', (function(error) {
      mc.changeIcon('failed');
      overlay.setMap(null);
    }).bind(this));

    google.maps.event.addDomListener(mc.getElement(), 'click', (function(ev) {
      if ( this.isWatchingGeoLocation() && mc.isCurrentIcon('fixed') ) {
        mc.changeIcon('located');
      } else {
        if ( this.isWatchingGeoLocation() ) {
          this.endWatchGeoLocation();
        } else {
          this.beginWatchGeoLocation();
        }
      }
    }).bind(this));

    google.maps.event.addDomListener(this.getMap(), 'dragstart', (function(ev) {
      if ( this.isWatchingGeoLocation() && mc.isCurrentIcon('fixed') ) {
        mc.changeIcon('located');
      }
    }).bind(this));

  }
};
