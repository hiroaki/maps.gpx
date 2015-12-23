MapsGPX.plugin.Exporter = {
  bundles: [
    'jszip.js',
    'progressbar.js'
  ],
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
  handler_zip_gpx: function(keys, binaryType, validator) {
    var ctx = this.context['Exporter'],
        zip = new JSZip(),
        gpx_is_a_jpeg, doc, desc, name, i, l, folder, prms, promises = [];
    folder = zip.folder(ctx.settings.folder);
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
            this.file(v[0], v[1],
              {compressionOptions: {level: 9}, binary: true}
            );
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
            this.file(v[0], new XMLSerializer().serializeToString(MapsGPX.plugin.Exporter.trimDoc(v[2], v[1])),
              {compressionOptions: {level: 9}}
            );
          }.bind(folder))
        );
      }
    }

    return Promise.all(promises).then(function(values){
      var ctx = this.app.context['Exporter'];
      this.validator.call(this.app, this.zip); // throw if invalid
      return {
        name: ctx.settings.folder,
        data: this.zip.generate({type: binaryType, compressionOptions: {level: 9}})
      };
    }.bind({app: this, zip: folder, validator: validator}));
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
  exportToDesktop: function(destParams) {
    var ctx = this.context['Exporter'], ctrl,
        icon = destParams['icon'] || ctx.settings.defaultDownloadIcon;
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(icon),{strokeWidth: 20});
    ctrl.setMap(this.getMap());
    if ( MapsGPX.isSafari() ) {
      MapsGPX.plugin.Exporter._exportToDesktopSafari.call(this, ctrl, destParams);
    } else {
      MapsGPX.plugin.Exporter._exportToDesktopNotSafari.call(this, ctrl, destParams);
    }
  },
  _exportToDesktopNotSafari: function(ctrl, destParams) {
    var ctx = this.context['Exporter'],
        params = {};
    params.onLoad = destParams['onLoad'] || ctx.settings.defaultOnLoad;
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
          this.params['onLoad'].call(this, null, this.control);
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
        this.params['validator'] || this.app.context['Exporter'].settings.defaultValidator
      )
      .then(this.zip_hander)
      .catch(function(err) {
        (this.params['onInvalid'] || this.app.context['Exporter'].settings.defaultOnInvalid).call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: destParams}));
  },
  _exportToDesktopSafari: function(ctrl, destParams) {
    var ctx = this.context['Exporter'],
        params = {};
    params.onLoad = destParams['onLoad'] || ctx.settings.defaultOnLoad;
    var zip_hander = function(zip) {
      var anchor = document.createElement('a');
      anchor.setAttribute('href', 'data:application/zip;base64,'+ zip.data);
      anchor.setAttribute('download', zip.name +'.zip');
      anchor.click();
      anchor = null;
      setTimeout(function() {
        this.control.hideProgress();
        this.params['onLoad'].call(this, null, this.control);
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
        this.params['validator'] || this.app.context['Exporter'].settings.defaultValidator
      )
      .then(this.zip_hander)
      .catch(function(err) {
        (this.params['onInvalid'] || this.app.context['Exporter'].settings.defaultOnInvalid).call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: destParams}));
  },
  exportToURL: function(destParams) {
    var ctx = this.context['Exporter'], ctrl, zip_hander, params = {},
        icon = destParams['icon'] || ctx.settings.defaultUploadIcon;
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(icon), {strokeWidth: 5});
    ctrl.setMap(this.getMap());
    params.url    = destParams['url']       || ctx.settings.defaultUploadURL;
    params.name   = destParams['paramName'] || ctx.settings.defaultUploadParamName;
    params.method = destParams['method']    || ctx.settings.defaultUploadMethod;
    params.onLoad = destParams['onLoad']    || ctx.settings.defaultOnLoad;
    params.uploadOnProgress = destParams['uploadOnProgress']  || ctx.settings.defaultUploadOnProgress;
    params.uploadOnLoad     = destParams['uploadOnLoad']      || ctx.settings.defaultUploadOnLoad;
    params.uploadOnError    = destParams['uploadOnError']     || ctx.settings.defaultUploadOnError;
    params.uploadOnAbort    = destParams['uploadOnAbort']     || ctx.settings.defaultUploadOnAbort;
    zip_hander = function(zip) {
      var xhr = new XMLHttpRequest(),
          formdata = new FormData();
      formdata.append(this.params.name, zip.data);
      xhr.onload = function(evt){
        this.params.onLoad.call(this, evt, this.control);
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
        this.params['validator'] || this.app.context['Exporter'].settings.defaultValidator
      )
      .then(this.zip_hander)
      .catch(function(err) {
        (this.params['onInvalid'] || this.app.context['Exporter'].settings.defaultOnInvalid).call(this, err, this.control);
      }.bind(this));
    }).bind({app: this, control: ctrl, zip_hander: zip_hander, params: destParams}));
  },
  defaults: {
    folder: 'maps-gpx',
    destinations: [ {'DESKTOP':{}} ],
    defaultDownloadIcon: 'ic_file_download_black_48dp.png',
    defaultUploadIcon: 'ic_file_upload_black_48dp.png',
    defaultUploadMethod: 'POST',
    defaultUploadParamName: 'files[]',
    defaultUploadURL: null,
    defaultOnLoad: function(evt, control) {
      var xhr = evt ? evt.target : null;
      console.info(this);
    },
    defaultUploadOnProgress: function(evt, control) {
      var percentComplete;
      if ( evt.lengthComputable ) {
        percentComplete = evt.loaded / evt.total;
        control.animateWithText(percentComplete, {duration: 800});
      }
    },
    defaultUploadOnLoad: function(evt, control) {
      control.animateWithText(1,{duration: 800});
      setTimeout(function() {
        this.hideProgress();
      }.bind(control), 2000);
    },
    defaultUploadOnError: function(evt, control) {
      console.error(evt);
      control.setText('!');
      setTimeout(function() {
        this.hideProgress();
      }.bind(control), 2000);
    },
    defaultUploadOnAbort: function(evt, control) {
      control.hideProgress();
    },
    defaultValidator: function(zip) {
      return true;
    },
    defaultOnInvalid: function(err, control) {
      control.hideProgress();
      console.error(err);
    }
  },
  callback: function(params) {
    var i, l, keyword, implement_destination,
        settings = MapsGPX.merge({}, MapsGPX.plugin.Exporter.defaults, params);

    this.context['Exporter'] = {
      docs: {},
      settings: settings
    };

    this.register('onAddGPX', function(key, gpx_text) {
      this.context['Exporter']['docs'][key] = gpx_text;
    });

    implement_destination = function(keyword, destParams) {
      if ( keyword.toUpperCase() == 'DESKTOP' ) {
        MapsGPX.plugin.Exporter.exportToDesktop.call(this, destParams);
      } else if ( keyword.toUpperCase() == 'URL' ) {
        MapsGPX.plugin.Exporter.exportToURL.call(this, destParams);
      } else {
        console.warn('The destination '+ keyword +' is not supported.');
        return;
      }
    }.bind(this);

    if ( settings.destinations instanceof Array ) {
      for( i = 0, l = settings.destinations.length; i < l; ++i ) {
        for ( keyword in settings.destinations[i] ) {
          implement_destination(keyword, settings.destinations[i][keyword]);
        }
      }
    } else {
      for ( keyword in settings.destinations[i] ) {
        implement_destination(keyword, settings.destinations[i][keyword]);
      }
    }
  }
};
