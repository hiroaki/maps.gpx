MapsGPX.plugin.DescImage = {
  callback: function(params) {

    this.register('onCreateMarker', (function(marker) {
      var desc = marker.getSource().desc;
      if (
        ( ! new RegExp('[\x0d\x0a]').test(desc) && new RegExp('\.jpe?g$', 'i').test(desc) )
      ||
        new RegExp('^data:image/jpeg;base64,[+/=0-9A-Za-z\x0d\x0a]+$').test(desc)
      ||
        new RegExp('^blob:(https?(:|%3A)//[-_.(:|%3A)0-9A-Za-z]+?|file(:|%3A)//)/[-0-9A-Za-z]+$').test(desc)
      ||
        new RegExp('^blob:null/[-0-9A-Za-z]+$').test(desc)
      ) {
        google.maps.event.addListener(marker, 'click', function(mouseevent) {
          if ( ! this._infowindow ) {
            this._infowindow = new google.maps.InfoWindow({
              content: ['<div><img class="info-window" src="',desc,'"/></div>'].join('')
              });
          }
          this._infowindow.open(this.getMap(), this);
        });
        marker.setIcon(
          new google.maps.MarkerImage(
            [MapsGPX.plugin.DescImage.path, 'photo.png'].join('/'),
            new google.maps.Size(32,37)));
      }
    }).bind(this));
  }
};
