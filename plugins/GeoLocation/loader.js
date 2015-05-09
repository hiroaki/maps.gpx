GPXCasualViewer.plugin.GeoLocation = {
  watcher: null,
  options: {
    // Note that this can result in slower response times or 
    // increased power consumption (with a GPS chip on a mobile 
    // device for example). 
    // On the other hand, if false, the device can take the liberty
    // to save resources by responding more quickly and/or using less power.
    enableHighAccuracy: false
  },
  callback: function() {

    // add hook points
    console.log('Add hook points: "onGetGeoLocation"');
    this.hook['onGetGeoLocation'] = this.hook['onGetGeoLocation'] || [];

    console.log('Add hook points: "onGetGeoLocationError"');
    this.hook['onGetGeoLocationError'] = this.hook['onGetGeoLocationError'] || [];

    console.log('Add hook points: "onBeginWatchGeoLocation"');
    this.hook['onBeginWatchGeoLocation'] = this.hook['onBeginWatchGeoLocation'] || [];

    console.log('Add hook points: "onEndWatchGeoLocation"');
    this.hook['onEndWatchGeoLocation'] = this.hook['onEndWatchGeoLocation'] || [];

    GPXCasualViewer.prototype.isSupportedGeoLocation = function() {
      return navigator.geolocation ? true : false;
    };
    GPXCasualViewer.prototype.isWatchingGeoLocation = function() {
      return GPXCasualViewer.plugin.GeoLocation.watcher ? true : false;
    };
    GPXCasualViewer.prototype.beginWatchGeoLocation = function() {
      var return_value = null;
      if ( ! GPXCasualViewer.plugin.GeoLocation.watcher ) {
        GPXCasualViewer.plugin.GeoLocation.watcher
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
            GPXCasualViewer.plugin.GeoLocation.options
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
    GPXCasualViewer.prototype.endWatchGeoLocation = function() {
      var return_value = null;
      if ( GPXCasualViewer.plugin.GeoLocation.watcher ) {
        navigator.geolocation.clearWatch( GPXCasualViewer.plugin.GeoLocation.watcher );
        GPXCasualViewer.plugin.GeoLocation.watcher = null;
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
