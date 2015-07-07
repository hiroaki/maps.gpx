GPXCasualViewer.plugin.EXIF2GPX = {
  callback: function() {

    this.register('onReadEXIF', (function (key, values){

      this.context['EXIF2GPX'] = {
        pts: []
      };

      this.context['EXIF2GPX']['pts'].push({lat: values.latlng.lat(), lon: values.latlng.lng()});
      if ( 1 < this.context['EXIF2GPX']['pts'].length ) {
        var bounds = GPXCasualViewer.boundsOf(this.context['EXIF2GPX']['pts']);
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
        var name = values.exif['DateTimeOriginal'] || '(unknown)';
        var gpx_str = [
          '<?xml version="1.0"?>',
          '<gpx version="1.1" creator="GPX Casual Viewer" ',
          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" ',
          'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
          '<metadata>',
          ( name ? '<name><![CDATA['+ name +']]></name>' : '' ),
          '</metadata>',
          '<wpt lat="'+ values.latlng.lat() +'" lon="'+ values.latlng.lng() +'">',
          ( name ? '<name><![CDATA['+ name +']]></name>' : '' ),
          '<desc><![CDATA['+ values.url +']]></desc>',
          '</wpt></gpx>'
          ].join('')
        this.addGPX(key, gpx_str);
      }
    }).bind(this));

  }
};
