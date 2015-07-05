GPXCasualViewer.plugin.Milestone = {
  bundles: [
    'ExtDraggableObject.js',
    'NodeOverlay.js',
    'DivSign.js'
  ],
  callback: function() {
    var makeMilestones, signCache, intervalDefinition, trkLengthCache;
    
    makeMilestones = function(polyline, interval) {
      var milestones = {},
          path = polyline.getPath(),
          next_checkpoint = interval,
          sum = 0.0, i, l, s;
      for ( i = 1, l = path.getLength(); i < l; ++i ) {
        sum += google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(path.getAt(i - 1).lat(), path.getAt(i - 1).lng()),
          new google.maps.LatLng(path.getAt(i    ).lat(), path.getAt(i    ).lng())
          );
        if ( next_checkpoint <= sum ) {
          if ( milestones[next_checkpoint] == 'undefined' || milestones[next_checkpoint] == null ) {
            milestones[next_checkpoint] = { order: next_checkpoint, index: i, distance: sum };
          }
          next_checkpoint += interval;
        }
      }
      return milestones;
    };

    signCache = {
      shelf: {},
      genKey: function(key, trkidx, vertexidx) {
        return [key, trkidx, vertexidx].join('\t');
      },
      add: function(node_overlay, key, trkidx, vertexidx) {
        this.shelf[this.genKey(key, trkidx, vertexidx)] = node_overlay;
        return this;
      },
      get: function(key, trkidx, vertexidx) {
        return this.shelf[this.genKey(key, trkidx, vertexidx)];
      },
      hideAll: function() {
        for ( var key in this.shelf ) {
          this.shelf[key].element.style.visibility = 'hidden';
        }
        return this;
      }
    };

    intervalDefinition = {
      mapping: {
        5: 400000,
        6: 300000,
        7: 200000,
        8: 100000,
        9: 100000,
       10:  50000,
       11:  50000,
       12:  25000,
       13:  25000,
       14:  10000,
       15:  10000,
       16:   5000,
       17:   5000,
       18:   1000,
       19:   1000
      },
      min_zoom:  5,
      max_zoom: 20,
      max_number_of_signs: 100,
      min_interval_meters: 100,
      getInterval: function(full_length, zoom) {
        var interval = parseInt(zoom) < this.max_zoom ? this.mapping[zoom] : this.min_interval_meters,
            min = parseInt(full_length) / this.max_number_of_signs,
            z;
        if ( interval <= min ) {
          // console.log('Adjusting, because the interval is too short');
          for ( z = zoom - 1; this.min_zoom <= z && interval <= min; --z ) {
            interval = z < this.max_zoom ? this.mapping[z] : this.min_interval_meters;
          }
        }
        // console.log('It should create signs every '+ parseInt(interval / 1000) + ' km');
        return interval;
      }
    };

    trkLengthCache = {};

    google.maps.event.addListener(this.getMap(), 'zoom_changed', (function() {
      var zoom  = this.getMap().getZoom();

      signCache.hideAll();

      if ( zoom < intervalDefinition.min_zoom ) {
        return;
      }
      this.eachGPX((function(gpx, key) {
        var trk_idx, l = gpx.trk.length, trk, trk_path, stone, ms, no, kilo;
        for ( trk_idx = 0; trk_idx < l; ++trk_idx ) {
          trk = gpx.trk[trk_idx];
          if ( ! trk.overlay ) {
            continue;
          }
          trk_path = trk.overlay.getPath();
          if ( trkLengthCache[trk_idx] == null || trkLengthCache[trk_idx] == 'undefined' ) {
            trkLengthCache[trk_idx] = trk.overlay.computeDistanceTrack(0, trk_path.getLength() -1 );
          }
          ms = makeMilestones(trk.overlay, intervalDefinition.getInterval(trkLengthCache[trk_idx], zoom));

          for ( stone in ms ) {
            no = signCache.get(key, trk_idx, ms[stone].index);
            if ( no ) {
              no.element.style.visibility = 'visible';
            } else {
              kilo = parseInt(ms[stone].distance / 1000);
              no = new NodeOverlay(
                DivSign.create( kilo +' km', { contentStyle: {fontSize:'x-small', whiteSpace:'nowrap'} }),
                { position: trk_path.getAt(ms[stone].index)
                });
              no.element.style.visibility = 'visible';
              no.setMap(this.getMap());
              signCache.add(no, key, trk_idx, ms[stone].index);
            }
          }
        }
      }).bind(this));
    }).bind(this));

    google.maps.event.trigger(this.getMap(), 'zoom_changed');
  }
};
