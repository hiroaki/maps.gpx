GPXCasualViewer.plugin.File = {
  callback: function() {
    google.maps.event.addDomListener(document.getElementById(this.map_id), 'dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    });
    google.maps.event.addDomListener(document.getElementById(this.map_id), 'drop', (function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      var files = ev.dataTransfer.files;
      for (var i = 0, l = files.length; i < l; ++i) {
        var file = files[i];
        console.log('name=['+ file.name +'] type=['+ file.type +'] size=['+ file.size +']');

        if( file.type == 'image/jpeg' ){
          if( ! GPXCasualViewer.plugin.EXIF ){
            throw( new Error('cannot handle image/jpeg, it is required GPXCasualViewer.plugin.EXIF') );
          }else{
            var p1 = new Promise(function(resolve, reject) {
              var reader = new FileReader();
              reader.onload = function(event) {
                resolve(event.target.result);
              };
              reader.readAsArrayBuffer(file);
            });
            var p2 = new Promise(function(resolve, reject) {
              var reader = new FileReader();
              reader.onload = function(event) {
                resolve(event.target.result);
              };
              reader.readAsDataURL(file);
            });
            Promise.all([p1,p2,this,file]).then(function (values){
              var exif = GPXCasualViewer.plugin.EXIF.readFromBinary(values[0]),
                  url  = values[1],
                  app  = values[2],
                  src  = values[3],
                  lats = exif['GPSLatitude'],
                  lat0 = lats[0].numerator / lats[0].denominator,
                  lat1 = lats[1].numerator / lats[1].denominator,
                  lat2 = lats[2].numerator / lats[2].denominator,
                  lons = exif['GPSLongitude'],
                  lon0 = lons[0].numerator / lons[0].denominator,
                  lon1 = lons[1].numerator / lons[1].denominator,
                  lon2 = lons[2].numerator / lons[2].denominator,
                  latlng = new google.maps.LatLng(lat0 + lat1 / 60 + lat2 / 3600, lon0 + lon1 / 60 + lon2 / 3600);
              app.map.panTo(latlng);
              new google.maps.InfoWindow({
                content: exif['DateTimeOriginal'] +' - '+ src.name +'<br/><img class="info-window" src="'+ url +'"/>',
                position: latlng
                }).open(app.map);
            });
          }

        }else{

          var p1 = new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(event) {
              resolve(event.target.result);
            };
            reader.readAsText(file, 'UTF-8');
          });
          Promise.all([p1, file]).then((function (values){
            this.addGPX(values[1].name, values[0]);
          }).bind(this));
        }

      } // end of each files
    }).bind(this)); // end of addDomListener 'drop'
  } // end of callback
};
