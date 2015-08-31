MapsGPX.plugin.Milestone = {
  bundles: [
    'ExtDraggableObject.js',
    'NodeOverlay.js',
    'DivSign.js'
  ],
  intervalDefinition: {
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
    min_interval_meters: 100
  },
  getInterval: function(full_length, zoom) {
    var def = MapsGPX.plugin.Milestone.intervalDefinition,
        interval = parseInt(zoom) < def.max_zoom ? def.mapping[zoom] : def.min_interval_meters,
        min = parseInt(full_length) / def.max_number_of_signs,
        z;
    if ( interval <= min ) {
      for ( z = zoom - 1; def.min_zoom <= z && interval <= min; --z ) {
        interval = z < def.max_zoom ? def.mapping[z] : def.min_interval_meters;
      }
    }
    return interval;
  },
  makeMilestones: function(polyline, interval) {
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
  },
  callback: function(params) {
    this.context['Milestone'] = {};
    this.context['Milestone']['trkLengthCache'] = {};
    this.context['Milestone']['signCache'] = {
      map: this.getMap(),
      shelf: {},
      genKey: function(overlay, vertexidx) {
        return [overlay.object_id, vertexidx].join('\t');
      },
      add: function(node_overlay, overlay, vertexidx) {
        this.shelf[this.genKey(overlay, vertexidx)] = node_overlay;
        return this;
      },
      get: function(overlay, vertexidx) {
        return this.shelf[this.genKey(overlay, vertexidx)];
      },
      hideAll: function() {
        for ( var key in this.shelf ) {
          this.shelf[key].setMap(null);
        }
        return this;
      }
    };

    google.maps.event.addListener(this.getMap(), 'zoom_changed', (function() {
      var zoom = this.getMap().getZoom();

      this.context['Milestone']['signCache'].hideAll();

      if ( zoom < MapsGPX.plugin.Milestone.intervalDefinition.min_zoom ) {
        return;
      }
      this.eachGPX((function(gpx, key) {
        var trk_idx, l = gpx.trk.length, trk, trk_path, stone, ms, no, signcache, trklengthcache;
        for ( trk_idx = 0; trk_idx < l; ++trk_idx ) {
          trk = gpx.trk[trk_idx];
          if ( ! trk.overlay ) {
            continue;
          }
          trk_path  = trk.overlay.getPath();
          signcache = this.app.context['Milestone']['signCache'];
          trklengthcache = this.app.context['Milestone']['trkLengthCache'];
          if ( trklengthcache[trk.overlay.object_id] == null || trklengthcache[trk.overlay.object_id] == 'undefined' ) {
            trklengthcache[trk.overlay.object_id] = trk.overlay.computeDistanceTrack(0, trk_path.getLength() -1 );
          }
          ms = MapsGPX.plugin.Milestone.makeMilestones(
                trk.overlay,
                MapsGPX.plugin.Milestone.getInterval(
                  trklengthcache[trk.overlay.object_id], this.zoom
                ));
          for ( stone in ms ) {
            no = signcache.get(trk.overlay, ms[stone].index);
            if ( no ) {
              no.setMap(this.app.getMap());
            } else {
              no = new NodeOverlay(
                DivSign.create( parseInt(ms[stone].distance / 1000) +' km', { contentStyle: {fontSize:'x-small', whiteSpace:'nowrap'} }),
                { position: trk_path.getAt(ms[stone].index)
                });
              no.setMap(this.app.getMap());
              signcache.add(no, trk.overlay, ms[stone].index);

              this.app.register('onShowPolyline', (function(overlay){
                google.maps.event.trigger(this.app.getMap(), 'zoom_changed');
              }).bind(this));

              this.app.register('onHidePolyline', (function(overlay){
                if ( overlay.object_id == this.overlay.object_id ) {
                  this.nodeoverlay.setMap(null);
                }
              }).bind({nodeoverlay: no, overlay: trk.overlay}));
            }
          }
        }
      }).bind({app: this, zoom: zoom}));
    }).bind(this));

    this.register('onCreatePolyline', (function(overlay){
      google.maps.event.trigger(this.getMap(), 'zoom_changed');
    }).bind(this));

  }
};
