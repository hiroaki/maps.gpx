MapsGPX.plugin.Exporter = {
  bundles: [
    'jszip.js'
  ],
  FolderDefault: 'msps-gpx',
  trimDoc: function(doc, gpx) {
    var i, j, tmp, remained, bounds, metadata;
    for ( i = gpx.wpt.length - 1; 0 <= i; --i ) {
      if ( ! gpx.wpt[i].overlay.overlayed() ) {
        tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.WPT)[i];
        tmp.parentNode.removeChild(tmp);
      }
    }
    for ( i = gpx.rte.length - 1; 0 <= i; --i ) {
      if ( ! gpx.rte[i].overlay.overlayed() ) {
        tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.RTE)[i];
        tmp.parentNode.removeChild(tmp);
      }
    }
    for ( i = gpx.trk.length - 1; 0 <= i; --i ) {
      if ( gpx.trk[i].overlay ) {
        // all trkseg have been joined
        if ( ! gpx.trk[i].overlay.overlayed() ) {
          tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i];
          tmp.parentNode.removeChild(tmp);
        }
      } else {
        // each trkseg of trk[i]
        remained = false;
        for ( j = gpx.trk[i].trkseg.length - 1; 0 <= j; --j ) {
          if ( ! gpx.trk[i].trkseg[j].overlay.overlayed() ) {
            tmp = (doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i]).getElementsByTagName(MapsGPX.ELEMENTS.TRKSEG);
            tmp.parentNode.removeChild(tmp);
          } else {
            remained = true;
          }
        }
        if ( ! remained ) {
          tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i];
          tmp.parentNode.removeChild(tmp);
        }
      }
    }

    // compute and update gpx.metadata.bounds
    bounds = (function(doc) {
      var tmp, bnds, pts = [];
      tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.WPT);
      for ( i = 0, j = tmp.length; i < j; ++i ) {
        pts.push({lat: tmp[i].getAttribute('lat'), lon: tmp[i].getAttribute('lon')});
      }
      tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.RTEPT);
      for ( i = 0, j = tmp.length; i < j; ++i ) {
        pts.push({lat: tmp[i].getAttribute('lat'), lon: tmp[i].getAttribute('lon')});
      }
      tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.TRKPT);
      for ( i = 0, j = tmp.length; i < j; ++i ) {
        pts.push({lat: tmp[i].getAttribute('lat'), lon: tmp[i].getAttribute('lon')});
      }

      tmp = MapsGPX.boundsOf(pts);
      bnds = document.createElementNS('http://www.topografix.com/GPX/1/1', MapsGPX.ELEMENTS.BOUNDS);
      bnds.setAttribute('minlat', tmp.minlat);
      bnds.setAttribute('minlon', tmp.minlon);
      bnds.setAttribute('maxlat', tmp.maxlat);
      bnds.setAttribute('maxlon', tmp.maxlon);
      return bnds;
    })(doc);

    metadata = (function() {
      var metadata = doc.getElementsByTagName(MapsGPX.ELEMENTS.METADATA);
      if ( metadata.length ) {
        return metadata.item(0);
      } else {
        return document.createElementNS('http://www.topografix.com/GPX/1/1', MapsGPX.ELEMENTS.METADATA);
      }
    })();

    tmp = metadata.getElementsByTagName(MapsGPX.ELEMENTS.BOUNDS);
    if ( tmp.length ) {
      metadata.replaceChild(bounds, tmp.item(0));
    } else {
      metadata.insertBefore(bounds, metadata.getElementsByTagName(MapsGPX.ELEMENTS.EXTENSIONS).item(0));
    }

    return doc;
  },
  mayBeJpegStream: function(stream) {
    if (
      ( ! new RegExp('[\x0d\x0a]').test(stream) && new RegExp('\.jpe?g$', 'i').test(stream) )
    ||
      new RegExp('^data:image/jpeg;base64,[+/=0-9A-Za-z\x0d\x0a]+$').test(stream)
    ||
      new RegExp('^blob:(https?(:|%3A)//[-_.(:|%3A)0-9A-Za-z]+?|file(:|%3A)//)/[-0-9A-Za-z]+$').test(stream)
    ||
      new RegExp('^blob:null/[-0-9A-Za-z]+$').test(stream)
    ) {
      return true;
    }else{
      return false;
    }
  },
  handler_zip_gpx: function(keys, binaryType) {
    var ctx = this.context['Exporter'],
        zip = new JSZip(),
        gpx_is_a_jpeg, doc, desc, name, i, l, folder, prms, promises = [];
    folder = zip.folder(ctx.folder);
    for ( i = 0, l = keys.length; i < l; ++i ) {
      gpx_is_a_jpeg = false;
      prms = []
      name = keys[i];
      if ( new RegExp('([^/]+)$').test(name) ) {
        name = RegExp.$1;
      } else {
        name = 'untitled.gpx';
      }
      doc = MapsGPX.parseXML(ctx.docs[keys[i]]);
      if ( new RegExp('\.jpe?g$', 'i').test(name) ) {
        try {
          desc = doc.getElementsByTagName(MapsGPX.ELEMENTS.WPT).item(0).getElementsByTagName(MapsGPX.ELEMENTS.DESC).item(0).textContent;
          if ( MapsGPX.plugin.Exporter.mayBeJpegStream(desc) ) {
            gpx_is_a_jpeg = true;
          } else {
            name = name +'.gpx';
          }
        } catch (ex) {
          console.warn('It seemed a JPEG but could not take out the content');
        }
      }

      if ( gpx_is_a_jpeg ) {
        // convert ObjectURL to data scheme base64 in desc image
        prms.push(MapsGPX.resolveAsArrayBuffer(desc).then(function(data) {
          return data;
        }));
        prms.unshift(name);
        promises.push(
          Promise.all(prms).then(function(values) {
            return [values[0], values[1]]; // name, arraybuffer
          }).then(function(v) {
            this.file(v[0], v[1], {binary: true, compressionOptions: {level: 9}});
          }.bind(folder))
        );
      } else {
        prms.unshift(doc);
        prms.unshift(this.getGPX(keys[i]));
        prms.unshift(name);
        promises.push(
          Promise.all(prms).then(function(values) {
            return [values[0], values[1], values[2]]; // name, gpx[key], doc
          }).then(function(v) {
            this.file(v[0], new XMLSerializer().serializeToString(MapsGPX.plugin.Exporter.trimDoc(v[2], v[1])));
          }.bind(folder))
        );
      }
    }

    return Promise.all(promises).then(function(values){
      return this.generate({type: binaryType, compressionOptions: {level: 9}});
    }.bind(folder));
  },
  callback: function(params) {
    var dw, ctx;

    this.context['Exporter'] = {
      control: null,
      docs: {},
      folder: (params || {}).folder || MapsGPX.plugin.Exporter.FolderDefault
    };
    ctx = this.context['Exporter'];

    ctx.control = new MapsGPX.MapControl({
        initial: [MapsGPX.plugin.Exporter.path, 'ic_file_download_black_48dp.png'].join('/')
      },{
        position: 'TOP_RIGHT'
      });
    ctx.control.setMap(this.map);

    this.register('onAddGPX', function(key, gpx_text) {
      this.context['Exporter']['docs'][key] = gpx_text;
    });

    google.maps.event.addDomListener(ctx.control.getElement(), 'click', (function(ev) {
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(this, this.getKeysOfGPX(), 'base64').then(function(data) {
        var ctx = this.context['Exporter'], anchor = document.createElement('a');
        anchor.setAttribute('href', 'data:application/zip;base64,'+ data);
        anchor.setAttribute('download', ctx.folder +'.zip');
        anchor.click();
        anchor = null;
      }.bind(this));
      return false;
    }).bind(this));

  }
};
