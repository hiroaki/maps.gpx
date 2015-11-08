MapsGPX.plugin.EXIF = {
  bundles: [
    'exif.js'
  ],
  readFromArrayBuffer: function(arraybuffer) {
    return EXIF.readFromBinaryFile(arraybuffer);
  },
  createLatlngFromExif: function(exif) {
    if( exif['GPSLatitude'] && exif['GPSLongitude'] ){
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
    }else{
      return null;
    }
  },
  callback: function(params) {
    var input_handler;

    // add hook points
    this.hook['onReadEXIF'] = this.hook['onReadEXIF'] || [];

    // add an instance method to MapsGPX.Polyline
    console.log('Extends MapsGPX.Polyline.prototype.findNearestVertexByDate');
    MapsGPX.Polyline.prototype.findNearestVertexByDate = function(date) {
      var src   = this.getSource(),
          ptime = null,
          just  = false,
          ids   = -1,
          i, l;
      for ( i = 0, l = src.length; i < l; ++i ) {
        ptime = new Date(src[i].time)
        if ( date <= ptime ) {
          if ( date == ptime ) {
            just = true;
          }
          ids = i;
          break;
        }
      }
      if( 1 <= ids || (ids == 0 && just) ){
        return { latlng: (this.getPath()).getAt(ids), time: ptime, index: ids };
      }else{
        return null;
      }
    };

    input_handler = function(key, src) {
      var p1 = MapsGPX.resolveAsArrayBuffer(src),
          p2 = MapsGPX.resolveAsObjectURL(src);
      return Promise.all([p1,p2,src]).then((function(values) {
        var exif   = MapsGPX.plugin.EXIF.readFromArrayBuffer(values[0]),
            latlng = MapsGPX.plugin.EXIF.createLatlngFromExif(exif),
            founds = [],
            alternatives = [],
            dt, origin, i, j, nearestVertex, sorted, min_time, stash;
        if ( latlng == null && exif['DateTimeOriginal'] ) {
          // search coordinate of the image by matching date with all polylines
          dt = exif['DateTimeOriginal'].split(/\s+/);
          origin = new Date( dt[0].replace(/:/g, '/')+ ' ' + dt[1] ); // localtime
          nearestVertex = function(overlay, key) {
            var rs;
            if( ! overlay ){
              return false;
            }else{
              rs = overlay.findNearestVertexByDate(origin);
              if ( rs ) {
                rs['key'] = key;
                this.push(rs);
              }
              return true;
            }
          };
          this.eachGPX((function(gpx, key) {
            var k, l, m, n;
            for ( k = 0, l = gpx.trk.length; k < l; ++k ) {
              if ( ! nearestVertex.call(this, gpx.trk[k].overlay, key) ) {
                for ( m = 0, n = gpx.trk[k].trkseg.length; m < n; ++m ) {
                  nearestVertex.call(this, gpx.trk[k].trkseg[m].overlay, key);
                }
              }
            }
          }).bind(founds));

          if ( 0 < founds.length ) {
            // pickup the best points which has minimum diff
            sorted = founds.sort(function(a, b) {
              return a['time'] - b['time'];
            });
            founds = [];
            founds.push(sorted[0]);
            min_time = sorted[0]['time'];
            for ( i = 1, j = sorted.length; i < j; ++i ) {
              if ( min_time.toJSON() != sorted[i]['time'].toJSON() ) {
                break;
              }
              founds.push(sorted[i]);
            }
            latlng        = founds[0].latlng;
            alternatives  = founds;
          }
        }
        stash = {
                  exif: exif,
                   url: values[1],
                   src: values[2],
                   gpx: null,
                latlng: latlng,
          alternatives: alternatives
        };
        if ( ! latlng ) {
          throw( new Error('Could not detect coordinate of the image "'+ key +'"') );
        } else {
          if ( this.hook['onReadEXIF'].length != 0 ) {
            this.applyHook('onReadEXIF', key, stash);
          } else {
            MapsGPX.plugin.EXIF._handlerHookOnReadExifDefault.call(this, key, stash);
          }
        }
        return key;
      }).bind(this));
    }

    console.log('Register an input handler for "image/jpeg"');
    this.registerInputHandler(new MapsGPX.InputHandler('image/jpeg', input_handler));
  },
  _handlerHookOnReadExifDefault: function(key, values) {
    var pinpoint = null, i, l, contents;
    if ( values.alternatives.length <= 1) {
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
      contents = [values.exif['DateTimeOriginal'], ' - ', key, '<br/><img class="info-window" src="', values.url, '"/>'].join('');
      this.map.panTo(values.latlng);
      new google.maps.InfoWindow({
        content: contents,
        position: pinpoint
        }).open(this.map);
    }
  }
};
