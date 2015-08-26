MapsGPX.plugin.GeoLocation = {
  watcher: null,
  options: {
    // Note that this can result in slower response times or 
    // increased power consumption (with a GPS chip on a mobile 
    // device for example). 
    // On the other hand, if false, the device can take the liberty
    // to save resources by responding more quickly and/or using less power.
    enableHighAccuracy: false
  },
  callback: function(params) {

    // add hook points
    console.log('Add hook points: "onGetGeoLocation"');
    this.hook['onGetGeoLocation'] = this.hook['onGetGeoLocation'] || [];

    console.log('Add hook points: "onGetGeoLocationError"');
    this.hook['onGetGeoLocationError'] = this.hook['onGetGeoLocationError'] || [];

    console.log('Add hook points: "onBeginWatchGeoLocation"');
    this.hook['onBeginWatchGeoLocation'] = this.hook['onBeginWatchGeoLocation'] || [];

    console.log('Add hook points: "onEndWatchGeoLocation"');
    this.hook['onEndWatchGeoLocation'] = this.hook['onEndWatchGeoLocation'] || [];

    MapsGPX.prototype.isSupportedGeoLocation = function() {
      return navigator.geolocation ? true : false;
    };
    MapsGPX.prototype.isWatchingGeoLocation = function() {
      return MapsGPX.plugin.GeoLocation.watcher ? true : false;
    };
    MapsGPX.prototype.beginWatchGeoLocation = function() {
      var return_value = null;
      if ( ! MapsGPX.plugin.GeoLocation.watcher ) {
        MapsGPX.plugin.GeoLocation.watcher
        = navigator.geolocation.watchPosition(
            (function(position) {
              if ( this.hook['onGetGeoLocation'].length != 0 ) {
                this.applyHook('onGetGeoLocation', position);
              }
            }).bind(this),
            (function(error) {
              console.error(error);
              if ( this.hook['onGetGeoLocationError'].length != 0 ) {
                this.applyHook('onGetGeoLocationError', error);
              }
            }).bind(this),
            MapsGPX.plugin.GeoLocation.options
            );
        return_value = true;
      } else {
        return_value = false;
      }
      if ( this.hook['onBeginWatchGeoLocation'].length != 0 ) {
        this.applyHook('onBeginWatchGeoLocation', return_value);
      }
      return return_value;
    };
    MapsGPX.prototype.endWatchGeoLocation = function() {
      var return_value = null;
      if ( MapsGPX.plugin.GeoLocation.watcher ) {
        navigator.geolocation.clearWatch( MapsGPX.plugin.GeoLocation.watcher );
        MapsGPX.plugin.GeoLocation.watcher = null;
        return_value = true;
      }else{
        return_value = false;
      }
      if ( this.hook['onEndWatchGeoLocation'].length != 0 ) {
        this.applyHook('onEndWatchGeoLocation', return_value);
      }
      return return_value;
    };
  }
};
