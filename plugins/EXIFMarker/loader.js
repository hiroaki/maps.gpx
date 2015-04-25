GPXCasualViewer.plugin.EXIFMarker = {
  pts: [],
  callback: function() {
    this.register('onReadEXIF', (function (key, values){

      GPXCasualViewer.plugin.EXIFMarker.pts.push({lat: values.latlng.lat(), lon: values.latlng.lng()});
      if ( 1 < GPXCasualViewer.plugin.EXIFMarker.pts.length ) {
        var bounds = GPXCasualViewer.boundsOf(GPXCasualViewer.plugin.EXIFMarker.pts);
        this.map.fitBounds(GPXCasualViewer.createLatlngbounds(bounds));
      } else {
        this.map.panTo(values.latlng);
      }

      var pinpoint = null;
      if ( values.alternatives.length <= 1 ) {
        pinpoint = values.latlng;
      } else {
        for ( var i = 0, l = values.alternatives.length; i < l; ++i ) {
          if ( window.confirm('Are you sure the image is on "'+ values.alternatives[i]['key'] +'" ?') ) {
            pinpoint = values.alternatives[i].latlng;
            break;
          }
        }
      }
      if ( ! pinpoint ) {
        window.alert('Could not detect coordinate of the image "'+ key +'"')
      } else {
        var contents = '<div><strong>'+ values.exif['DateTimeOriginal'] +' - '+ key + '</strong></div><hr/>'+
                       '<div><img class="info-window" src="'+ values.url +'"/></div>';
        var marker = new google.maps.Marker({
          position: values.latlng,
          draggable: true,
          icon: new google.maps.MarkerImage('plugins/EXIFMarker/photo.png', new google.maps.Size(32,37))
        });
        marker.addListener('click', function(mouseevent) {
          new google.maps.InfoWindow({
            content: contents
            }).open(this.map, this);
        });
        marker.setMap(this.map);
      }
    }).bind(this));

  }
};