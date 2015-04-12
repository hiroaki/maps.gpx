GPXCasualViewer.plugin.EXIFMarkers = {
  pts: [],
  callback: function() {
    this.register('onReadEXIF', (function (key, values){

      GPXCasualViewer.plugin.EXIFMarkers.pts.push({lat: values.latlng.lat(), lon: values.latlng.lng()});
      if( 1 < GPXCasualViewer.plugin.EXIFMarkers.pts.length ){
        var bounds = GPXCasualViewer.boundsOf(GPXCasualViewer.plugin.EXIFMarkers.pts);
        this.map.fitBounds(GPXCasualViewer.createLatlngbounds(bounds));
      }else{
        this.map.panTo(values.latlng);
      }
      var contents = '<div><strong>'+ values.exif['DateTimeOriginal'] +' - '+ key + '</strong></div><hr/>'+
                     '<div><img class="info-window" src="'+ values.url +'"/></div>';
      var marker = new google.maps.Marker({
        position: values.latlng,
        draggable: true,
        icon: new google.maps.MarkerImage('plugin-exif-markers/photo.png', new google.maps.Size(32,37))
      });
      marker.addListener('click', function(mouseevent) {
        new google.maps.InfoWindow({
          content: contents
          }).open(this.map, this);
      });
      marker.setMap(this.map);
    }).bind(this));

  }
};
