MapsGPX.plugin.Exporter = {
  bundles: [
    'jszip.js',
    'progressbar.js'
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
      return {name: this.name, data: this.folder.generate({type: binaryType, compressionOptions: {level: 9}})};
    }.bind({name: ctx.folder, folder: folder}));
  },
  createControl: function(icon) {
    return new MapsGPX.MapControl({
        initial: new RegExp(icon).test("/") ? icon : [MapsGPX.plugin.Exporter.path, icon].join('/')
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
    var ctrl, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent);
    params.icon = params.icon || 'ic_file_download_black_48dp.png';
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(params.icon),{strokeWidth: 20});
    ctrl.setMap(this.getMap());
    if ( is_safari ) {
      MapsGPX.plugin.Exporter._exportToDesktopSafari.call(this, ctrl, params);
    } else {
      MapsGPX.plugin.Exporter._exportToDesktopNotSafari.call(this, ctrl, params);
    }
  },
  _exportToDesktopNotSafari: function(ctrl, params) {
    var zip_hander = function(zip) {
      var obj = MapsGPX.resolveAsObjectURL(zip.data);
      Promise.all([this, zip.name, obj]).then(function(values) {
        var ctrl = values[0],
            name = values[1],
            url = values[2], 
            anchor = document.createElement('a');
        anchor.setAttribute('href', url);
        anchor.setAttribute('download', name +'.zip');
        anchor.click();
        anchor = null;
        URL.revokeObjectURL(url);
        setTimeout(function() {
          ctrl.hideProgress();
        }.bind(ctrl), 2000);
      })
    }.bind(ctrl);
    google.maps.event.addDomListener(ctrl.getElement(), 'click', (function(ev) {
      if ( this.control.inProgress() ) {
        return false;
      }
      this.control.showProgress();
      this.control.animate(1000, {duration: 600000, easing:'linear'});
      this.control.setText('zip');
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(
        this.app, this.app.getKeysOfGPX(), 'blob'
      ).then(this.zip_hander);
    }).bind({app: this, control: ctrl, zip_hander: zip_hander}));
  },
  _exportToDesktopSafari: function(ctrl, params) {
    var zip_hander = function(zip) {
      var anchor = document.createElement('a');
      anchor.setAttribute('href', 'data:application/zip;base64,'+ zip.data);
      anchor.setAttribute('download', zip.name +'.zip');
      anchor.click();
      anchor = null;
      setTimeout(function() {
        this.hideProgress();
      }.bind(this), 2000);
    }.bind(ctrl);
    google.maps.event.addDomListener(ctrl.getElement(), 'click', (function(ev) {
      if ( this.control.inProgress() ) {
        return false;
      }
      this.control.showProgress();
      this.control.animate(1000, {duration: 600000, easing:'linear'});
      this.control.setText('zip');
      MapsGPX.plugin.Exporter.handler_zip_gpx.call(
        this.app, this.app.getKeysOfGPX(), 'base64'
      ).then(this.zip_hander);
    }).bind({app: this, control: ctrl, zip_hander: zip_hander}));
  },
  exportToURL: function(params) {
    var ctrl, zip_hander;
    params        = params        || {url: null};
    params.name   = params.name   || 'files[]';
    params.method = params.method || 'POST';
    params.icon   = params.icon   || 'ic_file_upload_black_48dp.png';
    params.onload = params.onload || function(evt) {
      console.log(this);
    };
    ctrl = MapsGPX.plugin.Exporter.extendControl(MapsGPX.plugin.Exporter.createControl(params.icon), {strokeWidth: 5});
    ctrl.setMap(this.getMap());

    zip_hander = function(zip) {
      var formdata = new FormData(),
          xhr = new XMLHttpRequest();
      formdata.append(this.params.name, zip.data);
      xhr.onload = function(evt){
        this.params.onload.call(this, evt);
      }.bind(this);
      xhr.upload.onprogress = function(evt) {
        var percentComplete;
        if ( evt.lengthComputable ) {
          percentComplete = evt.loaded / evt.total;
          this.control.animateWithText(percentComplete, {duration: 800});
        }
      }.bind(this);
      xhr.upload.onload = function(evt) {
        this.control.animateWithText(1,{duration: 800});
        setTimeout(function() {
          this.control.hideProgress();
        }.bind(this), 2000);
      }.bind(this);
      xhr.upload.onerror = function(evt) {
        console.error(evt);
        this.control.setText('!');
        setTimeout(function() {
          this.control.hideProgress();
        }.bind(this), 2000);
      }.bind(this);
      xhr.upload.onabort = function(evt) {
        this.control.hideProgress();
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
        this.app, this.app.getKeysOfGPX(), 'blob'
      ).then(this.zip_hander);
    }).bind({app: this, control: ctrl, zip_hander: zip_hander}));
  },
  callback: function(params) {
    var ctx, i, l, keyword, implement_destination;
    this.context['Exporter'] = {
      docs: {},
      folder: (params || {}).folder || MapsGPX.plugin.Exporter.FolderDefault,
      destinations: (params || {}).destinations || [ {'DESKTOP':{}} ]
    };
    ctx = this.context['Exporter'];

    this.register('onAddGPX', function(key, gpx_text) {
      this.context['Exporter']['docs'][key] = gpx_text;
    });

    implement_destination = function(keyword, params) {
      if ( keyword.toUpperCase() == 'DESKTOP' ) {
        MapsGPX.plugin.Exporter.exportToDesktop.call(this, params);
      } else if ( keyword.toUpperCase() == 'URL' ) {
        MapsGPX.plugin.Exporter.exportToURL.call(this, params);
      } else {
        console.warn('The destination '+ keyword +' is not supported.');
        return;
      }
    }.bind(this);

    if ( ctx.destinations instanceof Array ) {
      for( i = 0, l = ctx.destinations.length; i < l; ++i ) {
        for ( keyword in ctx.destinations[i] ) {
          implement_destination(keyword, ctx.destinations[i][keyword]);
        }
      }
    } else {
      for ( keyword in ctx.destinations[i] ) {
        implement_destination(keyword, ctx.destinations[i][keyword]);
      }
    }
  }
};
