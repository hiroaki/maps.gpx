GPXCasualViewer.plugin.EXIF = {
  readFromArrayBuffer: function(arraybuffer) {
    return EXIF.readFromBinaryFile(arraybuffer);
  },
  createLatlngFromExif: function (exif){
    var lats = exif['GPSLatitude'],
        lat0 = lats[0].numerator / lats[0].denominator,
        lat1 = lats[1].numerator / lats[1].denominator,
        lat2 = lats[2].numerator / lats[2].denominator,
        lons = exif['GPSLongitude'],
        lon0 = lons[0].numerator / lons[0].denominator,
        lon1 = lons[1].numerator / lons[1].denominator,
        lon2 = lons[2].numerator / lons[2].denominator;
    return new google.maps.LatLng(
            lat0 + lat1 / 60 + lat2 / 3600,
            lon0 + lon1 / 60 + lon2 / 3600);
  },
  callback: function (){
    // add hook points
    console.log('add hook points: "onReadEXIF"');
    this.hook['onReadEXIF'] = this.hook['onReadEXIF'] || [];
    // add method
    console.log('extends GPXCasualViewer.prototype.promiseToReadEXIF');
    GPXCasualViewer.prototype.promiseToReadEXIF = function (key, src){
      var p1 = GPXCasualViewer.createPromiseReadingBlobAsArrayBuffer(src);
//    var p2 = GPXCasualViewer.createPromiseReadingBlobAsDataURL(src);
      var p2 = GPXCasualViewer.createPromiseReadingBlobAsObjectURL(src);
      return Promise.all([p1,p2,src]).then((function (values){
        var exif   = GPXCasualViewer.plugin.EXIF.readFromArrayBuffer(values[0]);
        var latlng = GPXCasualViewer.plugin.EXIF.createLatlngFromExif(exif);
        var obj    = {exif: exif, url: values[1], src: values[2], latlng: latlng, gpx: null};
        if( this.hook['onReadEXIF'].length != 0 ){
          this.applyHook('onReadEXIF', key, obj);
        }else{
          GPXCasualViewer.plugin.EXIF._handlerHookOnReadExifDefault.call(this, key, obj);
        }
        return key;
      }).bind(this));
    }
  },
  _handlerHookOnReadExifDefault: function (key, values){
    var contents = values.exif['DateTimeOriginal'] +' - '+ key +
                  '<br/><img class="info-window" src="'+ values.url +'"/>';
    this.map.panTo(values.latlng);
    new google.maps.InfoWindow({
      content: contents,
      position: values.latlng
      }).open(this.map);
  }
};
