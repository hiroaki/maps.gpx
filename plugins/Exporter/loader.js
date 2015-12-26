MapsGPX.plugin.Exporter = {
  bundles: [
    'jszip.js',
    'progressbar.js'
  ],
  trimDoc: function(doc, gpx) {
    var i, j, tmp, remaind = false, remained_trk, bounds, metadata;
    for ( i = gpx.wpt.length - 1; 0 <= i; --i ) {
      if ( ! gpx.wpt[i].overlay.overlayed() ) {
        tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.WPT)[i];
        tmp.parentNode.removeChild(tmp);
      } else {
        remaind = true;
      }
    }
    for ( i = gpx.rte.length - 1; 0 <= i; --i ) {
      if ( ! gpx.rte[i].overlay.overlayed() ) {
        tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.RTE)[i];
        tmp.parentNode.removeChild(tmp);
      } else {
        remaind = true;
      }
    }
    for ( i = gpx.trk.length - 1; 0 <= i; --i ) {
      if ( gpx.trk[i].overlay ) {
        // all trkseg have been joined
        if ( ! gpx.trk[i].overlay.overlayed() ) {
          tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i];
          tmp.parentNode.removeChild(tmp);
        } else {
          remaind = true;
        }
      } else {
        // each trkseg of trk[i]
        remained_trk = false;
        for ( j = gpx.trk[i].trkseg.length - 1; 0 <= j; --j ) {
          if ( ! gpx.trk[i].trkseg[j].overlay.overlayed() ) {
            tmp = (doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i]).getElementsByTagName(MapsGPX.ELEMENTS.TRKSEG);
            tmp.parentNode.removeChild(tmp);
          } else {
            remained_trk = true;
          }
        }
        if ( ! remained_trk ) {
          tmp = doc.getElementsByTagName(MapsGPX.ELEMENTS.TRK)[i];
          tmp.parentNode.removeChild(tmp);
        } else {
          remaind = true;
        }
      }
    }

    // return null if all elements are trimmed
    if ( ! remaind ) {
      return null;
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
  handler_zip_gpx: function(keys, binaryType, params) {
    var zip = new JSZip(), gpx_is_a_jpeg, doc, desc, name, i, l, folder, prms, promises = [];
    folder = zip.folder(params.folder);
    for ( i = 0, l = keys.length; i < l; ++i ) {
      doc = MapsGPX.plugin.Exporter.trimDoc(MapsGPX.parseXML(this.context['Exporter'].docs[keys[i]]), this.getGPX(keys[i]));
      if ( ! doc ) {
        continue;
      }
      gpx_is_a_jpeg = false;
      prms = []
      name = keys[i];
      if ( new RegExp('([^/]+)$').test(name) ) {
        name = RegExp.$1;
      } else {
        name = 'untitled.gpx';
      }
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
            this.file(v[0], v[1],
              {compressionOptions: {level: 9}, binary: true}
            );
          }.bind(folder))
        );
      } else {
        prms.unshift(doc);
        prms.unshift(name);
        promises.push(
          Promise.all(prms).then(function(values) {
            return [values[0], values[1]]; // name, doc
          }).then(function(v) {
            this.file(v[0], new XMLSerializer().serializeToString(v[1]),
              {compressionOptions: {level: 9}}
            );
          }.bind(folder))
        );
      }
    }

    return Promise.all(promises).then(function(values){
      this.params.validator.call(this.app, this.zip); // throw if invalid
      return {
        name: this.params.folder,
        data: this.zip.generate({type: binaryType, compressionOptions: {level: 9}})
      };
    }.bind({app: this, zip: folder, params: params}));
  },
  createControl: function(icon) {
    return new MapsGPX.MapControl({
        initial: new RegExp(icon).test('/') ? icon : [MapsGPX.plugin.Exporter.path, icon].join('/')
      },{
        position: 'TOP_RIGHT'
      });
  },
  extendControl: function(ctrl, options) {
    options = options || {};
    ctrl.$icon = ctrl.getElement().getElementsByTagName('img').item(0);
    ctrl.$container_progress = (function(w, h) {
      var $div = document.createElement('div');
      $div.style.width = w + 'px';
      $div.style.height = h + 'px';
      $div.style.margin = 0;
      $div.style.padding = 0;
      return $div;
    })(ctrl.settings.iconWidth, ctrl.settings.iconHeight);
    ctrl.$progress  = new ProgressBar.Circle(ctrl.$container_progress, {
                        color: options.color || '#333',
                        trailColor: options.trailColor || '#ccc',
                        strokeWidth: options.strokeWidth || 5
                        });
    ctrl.showProgress = function() {
      this.$icon.style.display = 'none';
      this.$icon.parentNode.appendChild(this.$container_progress);
    };
    ctrl.hideProgress = function() {
      this.$icon.style.display = '';
      this.$icon.parentNode.removeChild(this.$container_progress);
    };
    ctrl.inProgress = function() {
      return this.$icon.style.display == '' ? false : true;
    };
    ctrl.animate = function(value, settings) {
      settings = settings || {};
      this.$progress.animate(value, settings);
    };
    ctrl.animateWithText = function(value, settings) {
      this.animate(value, settings);
      this.$progress.setText(parseInt(value * 100));
    };
    ctrl.setValue = function(value) {
      this.$progress.set(value);
    };
    ctrl.setText = function(short_message) {
      this.$progress.setText(short_message);
    };
    return ctrl;
  },
  exportToDesktop: function(params) {
    var ctrl, icon = params.icon || params.iconDownload;
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(icon),{strokeWidth: 20});
    ctrl.setMap(this.getMap());
    if ( MapsGPX.isSafari() ) {
      MapsGPX.plugin.Exporter._exportToDesktopSafari.call(this, ctrl, params);
    } else {
      MapsGPX.plugin.Exporter._exportToDesktopNotSafari.call(this, ctrl, params);
    }
  },
  _exportToDesktopNotSafari: function(ctrl, params) {
    var zip_hander = function(zip) {
      Promise.all([this, zip.name, MapsGPX.resolveAsObjectURL(zip.data)]).then(function(values) {
        var target  = values[0],
            name    = values[1],
            url     = values[2],
            anchor = document.createElement('a');
        anchor.setAttribute('href', url);
        anchor.setAttribute('download', name +'.zip');
        anchor.click();
        anchor = null;
        URL.revokeObjectURL(url);
        setTimeout(function() {
          this.control.hideProgress();
          this.params.onLoad.call(this, null, this.control);
        }.bind(target), 2000);
      });
    }.bind({control: ctrl, params: params});
    google.maps.event.addDomListener(ctrl.getElement(), 'click', (function(ev) {
      if ( this.control.inProgress() ) {
        return false;
      }
      this.control.showProgress();
      this.control.animate(1000, {duration: 600000, easing: 'linear'});
      this.control.setText('zip');
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(
        this.app,
        this.app.getKeysOfGPX(),
        'blob',
        this.params
      )
      .then(this.zip_hander)
      .catch(function(err) {
        this.params.onInvalid.call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: params}));
  },
  _exportToDesktopSafari: function(ctrl, params) {
    var zip_hander = function(zip) {
      var anchor = document.createElement('a');
      anchor.setAttribute('href', 'data:application/zip;base64,'+ zip.data);
      anchor.setAttribute('download', zip.name +'.zip');
      anchor.click();
      anchor = null;
      setTimeout(function() {
        this.control.hideProgress();
        this.params.onLoad.call(this, null, this.control);
      }.bind(this), 2000);
    }.bind({control: ctrl, params: params});
    google.maps.event.addDomListener(ctrl.getElement(), 'click', (function(ev) {
      if ( this.control.inProgress() ) {
        return false;
      }
      this.control.showProgress();
      this.control.animate(1000, {duration: 600000, easing: 'linear'});
      this.control.setText('zip');
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(
        this.app,
        this.app.getKeysOfGPX(),
        'base64',
        this.params
      )
      .then(this.zip_hander)
      .catch(function(err) {
        this.params.onInvalid.call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: params}));
  },
  exportToURL: function(params) {
    var ctrl, zip_hander, icon = params.icon || params.iconUpload;
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(icon), {strokeWidth: 5});
    ctrl.setMap(this.getMap());
    zip_hander = function(zip) {
      var xhr = new XMLHttpRequest(),
          formdata = new FormData();
      formdata.append(this.params.name, zip.data);
      xhr.onprogress = function(evt){
        this.params.onProgress.call(this, evt, this.control);
      }.bind(this);
      xhr.onload = function(evt){
        this.params.onLoad.call(this, evt, this.control);
      }.bind(this);
      xhr.onerror = function(evt){
        this.params.onError.call(this, evt, this.control);
      }.bind(this);
      xhr.onabort = function(evt){
        this.params.onAbort.call(this, evt, this.control);
      }.bind(this);
      xhr.upload.onprogress = function(evt) {
        this.params.uploadOnProgress.call(this, evt, this.control);
      }.bind(this);
      xhr.upload.onload = function(evt) {
        this.params.uploadOnLoad.call(this, evt, this.control);
      }.bind(this);
      xhr.upload.onerror = function(evt) {
        this.params.uploadOnError.call(this, evt, this.control);
      }.bind(this);
      xhr.upload.onabort = function(evt) {
        this.params.uploadOnAbort.call(this, evt, this.control);
      }.bind(this);
      xhr.open(this.params.method, this.params.url);
      xhr.send(formdata);
    }.bind({control: ctrl, params: params});

    google.maps.event.addDomListener(ctrl.getElement(), 'click', (function(ev) {
      if ( this.control.inProgress() ) {
        return false;
      }
      this.control.showProgress();
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(
        this.app,
        this.app.getKeysOfGPX(),
        'blob',
        this.params
      )
      .then(this.zip_hander)
      .catch(function(err) {
        this.params.onInvalid.call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: params}));
  },
  defaults: {
    folder: 'maps-gpx',
    iconDownload: 'ic_file_download_black_48dp.png',
    iconUpload: 'ic_file_upload_black_48dp.png',
    method: 'POST',
    paramName: 'files[]',
    url: null,
    onProgress: function(evt, control) {
      return;
    },
    onLoad: function(evt, control) {
      var xhr = evt ? evt.target : null;
      console.info(evt);
    },
    onError: function(evt, control) {
      return;
    },
    onAbort: function(evt, control) {
      return;
    },
    uploadOnProgress: function(evt, control) {
      var percentComplete;
      if ( evt.lengthComputable ) {
        percentComplete = evt.loaded / evt.total;
        control.animateWithText(percentComplete, {duration: 800});
      }
    },
    uploadOnLoad: function(evt, control) {
      control.animateWithText(1,{duration: 800});
      setTimeout(function() {
        this.hideProgress();
      }.bind(control), 2000);
    },
    uploadOnError: function(evt, control) {
      console.error(evt);
      control.setText('!');
      setTimeout(function() {
        this.hideProgress();
      }.bind(control), 2000);
    },
    uploadOnAbort: function(evt, control) {
      control.hideProgress();
    },
    validator: function(zip) {
      return true;
    },
    onInvalid: function(err, control) {
      control.hideProgress();
      console.error(err);
    }
  },
  callback: function(params) {
    var i, l, keyword, implement_destination, defaults = {}, dir, destParams,
        destinations = [], sources = (params || {}).destinations || [{direction: 'DOWNLOAD'}]

    // detect GLOBAL params
    for( i = 0, l = sources.length; i < l; ++i ) {
      dir = (sources[i].direction || 'null').toUpperCase();
      if ( dir == 'GLOBAL' || dir == 'DEFAULT' || dir == 'DEFAULTS' ) {
        defaults = sources[i];
      } else {
        destinations.push(sources[i]);
      }
    }
    defaults = MapsGPX.merge({}, MapsGPX.plugin.Exporter.defaults, defaults);

    this.context['Exporter'] = {
      docs: {}
    };

    this.register('onAddGPX', function(key, gpx_text) {
      this.context['Exporter']['docs'][key] = gpx_text;
    });

    for( i = 0, l = destinations.length; i < l; ++i ) {
      dir = destinations[i].direction || 'null';
      destParams = MapsGPX.merge({}, defaults, destinations[i]);
      if ( dir.toUpperCase() == 'DOWNLOAD' ) {
        MapsGPX.plugin.Exporter.exportToDesktop.call(this, destParams);
      } else if ( dir.toUpperCase() == 'UPLOAD' ) {
        MapsGPX.plugin.Exporter.exportToURL.call(this, destParams);
      } else {
        console.warn('The direction of destination '+ dir +' is not supported.');
      }
    }
  }
};
