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
     12:  20000,
     13:  20000,
     14:  10000,
     15:  10000,
     16:   2000,
     17:   2000,
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
    this.context['Milestone']['trkLengthCache'] = {
      shelf: {},
      genKey: function(overlay) {
        return [overlay.object_id].join('\t');
      },
      add: function(stones, overlay) {
        this.shelf[this.genKey(overlay)] = stones;
        return this;
      },
      get: function(overlay) {
        return this.shelf[this.genKey(overlay)];
      }
    };
    this.context['Milestone']['signCache'] = {
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
    this.context['Milestone']['stonesCache'] = {
      shelf: {},
      genKey: function(overlay, interval) {
        return [overlay.object_id, interval].join('\t');
      },
      add: function(stones, overlay, interval) {
        this.shelf[this.genKey(overlay, interval)] = stones;
        return this;
      },
      get: function(overlay, interval) {
        return this.shelf[this.genKey(overlay, interval)];
      }
    };
    google.maps.event.addListener(this.getMap(), 'zoom_changed', (function() {
      var zoom = this.getMap().getZoom();

      this.context['Milestone']['signCache'].hideAll();

      if ( zoom < MapsGPX.plugin.Milestone.intervalDefinition.min_zoom ) {
        return;
      }
      this.eachGPX((function(gpx, key) {
        var i, l, trk, stone, ms, no, interval, action_show_or_hide;
        for ( i = 0, l = gpx.trk.length; i < l; ++i ) {
          trk = gpx.trk[i];
          if ( ! trk.overlay ) {
            continue;
          }
          trklength = this.app.context['Milestone']['trkLengthCache'].get(trk.overlay);
          if ( ! trklength ) {
            trklength = trk.overlay.computeDistanceTrack(0, trk.overlay.getPath().getLength() -1 );
            this.app.context['Milestone']['trkLengthCache'].add(trk.overlay, trklength);
          }
          interval = MapsGPX.plugin.Milestone.getInterval(trklength, this.zoom);
          ms = this.app.context['Milestone']['stonesCache'].get(trk.overlay, interval);
          if ( ! ms ) {
            ms = MapsGPX.plugin.Milestone.makeMilestones(trk.overlay, interval);
            this.app.context['Milestone']['stonesCache'].add(ms, trk.overlay, interval);
          }

          if ( trk.overlay.overlayed() ) {
            action_show_or_hide = this.app.getMap();
          } else {
            action_show_or_hide = null;
          }
          for ( stone in ms ) {
            no = this.app.context['Milestone']['signCache'].get(trk.overlay, ms[stone].index);
            if ( ! no ) {
              no = new NodeOverlay(
                DivSign.create( parseInt(ms[stone].distance / 1000) +' km', { contentStyle: {fontSize:'x-small', whiteSpace:'nowrap'} }),
                { position: trk.overlay.getPath().getAt(ms[stone].index)
                });
              this.app.context['Milestone']['signCache'].add(no, trk.overlay, ms[stone].index);
            }
            no.setMap(action_show_or_hide);
          }
        }
      }).bind({app: this, zoom: zoom}));
    }).bind(this));

    this.register('onShowPolyline', (function(overlay) {
      google.maps.event.trigger(this.getMap(), 'zoom_changed');
    }).bind(this));

    this.register('onHidePolyline', (function(overlay) {
      google.maps.event.trigger(this.getMap(), 'zoom_changed');
    }).bind(this));

  }
};
