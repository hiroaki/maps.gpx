MapsGPX.plugin.EXIFMarker = {
  callback: function(params) {

    this.context['EXIFMarker'] = {
      pts: []
    };

    this.register('onReadEXIF', (function(key, values) {
      var bounds, pinpoint, i, l, contents, marker;
      this.context['EXIFMarker']['pts'].push({lat: values.latlng.lat(), lon: values.latlng.lng()});
      if ( 1 < this.context['EXIFMarker']['pts'].length ) {
        bounds = MapsGPX.boundsOf(this.context['EXIFMarker']['pts']);
        this.map.fitBounds(MapsGPX.createLatlngbounds(bounds));
      } else {
        this.map.panTo(values.latlng);
      }

      pinpoint = null;
      if ( values.alternatives.length <= 1 ) {
        pinpoint = values.latlng;
      } else {
        for ( i = 0, l = values.alternatives.length; i < l; ++i ) {
          if ( window.confirm('Are you sure the image is on "'+ values.alternatives[i]['key'] +'" ?') ) {
            pinpoint = values.alternatives[i].latlng;
            break;
          }
        }
      }
      if ( ! pinpoint ) {
        window.alert('Could not detect coordinate of the image "'+ key +'"')
      } else {
        contents = ['<div><strong>', values.exif['DateTimeOriginal'], ' - ', key, '</strong></div><hr/>', 
                    '<div><img class="info-window" src="', values.url, '"/></div>'].join('');
        marker = new google.maps.Marker({
          position: values.latlng,
          draggable: true,
          icon: new google.maps.MarkerImage([MapsGPX.plugin.EXIFMarker.path, 'photo.png'].join('/'), new google.maps.Size(32,37))
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
