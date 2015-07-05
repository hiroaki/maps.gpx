GPXCasualViewer.plugin.ElevationChart = {
  bundles: [
    'DivDivider.js',
    'https://www.google.com/jsapi'
  ],
  chartCanvasId: 'chart_canvas',
  callback: function() {

    google.load('visualization', '1', {'packages': ['corechart'], 'callback': (function (){
      var click_handler, control, dd_options, dd;

      control = new GPXCasualViewer.MapControl({
          initial: [GPXCasualViewer.plugin.ElevationChart.path, 'ic_trending_up_black_48dp.png'].join('/')
        },{
          map: this.getMap()
        });
      dd_options = {};
      dd = new DivDivider(
            this.getMapElement().getAttribute('id'),
            GPXCasualViewer.plugin.ElevationChart.chartCanvasId,
            dd_options);

      dd.chart  = new google.visualization.LineChart(dd.$chart);
      dd.marker = new google.maps.Marker();  
      dd.current_polyline = null;
      google.maps.event.addDomListener(control.getElement(), 'click', (function(ev) {
        this.toggle();
      }).bind(dd));

      //
      google.visualization.events.addListener(dd.chart, 'select', (function (){
        var selection, item;
        if ( ! this.on_select_chart ) {
          return;
        }
        selection = this.chart.getSelection();
        if ( ! selection ) {
          return;
        }
        item = selection[0];
        if ( ! item ) {
          return;
        }
        this.on_select_chart.call(this, item.row, item.column);
      }).bind(dd));

      click_handler = function(ev) {
        var src, i, l, data, options,
            table = [],
            distance = 0;
        if ( ! this.view.isOpened() ) {
          this.view.current_polyline = null;
          this.view.marker.setMap(null);
          this.view.chart.clearChart();
        } else {
          if ( this.view.current_polyline !== this.polyline ) {
            src = this.polyline.getSource();
            table = [];
            distance = 0;
            table.push(['distance', 'ele']);
            table.push([0, parseInt(src[0].ele)]);
            for ( i = 1, l = src.length; i < l; ++i ) {
              distance += parseInt(google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(src[i - 1].lat, src[i - 1].lon),
                    new google.maps.LatLng(src[i    ].lat, src[i    ].lon)
                    ));
              table.push([distance, parseInt(src[i].ele)]);
            }
            data = google.visualization.arrayToDataTable(table);
            options = {
              title: src['name'] || 'Elevation chart of the trk',
              legend: { position: 'none' },
              vAxis: { format: 'decimal' },
              hAxis: { format: 'decimal' }
            };
            this.view.marker.setMap(null);
            this.view.chart.draw(data, options);
            this.view.current_polyline = this.polyline;
            this.view.on_select_chart = (function (row, col){
              var val = data.getValue(row, col);
              this.view.marker.setPosition( this.polyline.getPath().getAt(row) );
              if ( ! this.view.marker.getMap() ) {
                this.view.marker.setMap( this.polyline.getMap() );
              }
            }).bind(this);
            this.view.addEvent('close', (function (){
              this.current_polyline = null;
              this.marker.setMap(null);
              this.chart.clearChart();
            }).bind(this.view));
          }
        }
      };

      // attach an event to polylines which will be created
      this.register('onCreatePolyline', (function(polyline) {
        google.maps.event.addListener(polyline, 'click', click_handler.bind({view: this, polyline: polyline}));
      }).bind(dd));
      // attach an event to polylines which were alredy created
      this.eachGPX((function(gpx, key) {
        var i, l = gpx.trk.length, trk, m, n, trkseg;
        for ( i = 0; i < l; ++i ) {
          trk = gpx.trk[i];
          if ( trk.overlay ) {
            google.maps.event.addListener(trk.overlay, 'click', click_handler.bind({view: this, polyline: trk.overlay}));
          } else {
            for ( m = 0, n = trk.trkseg.length; m < n; ++m ) {
              trkseg = trk[m];
              if ( trkseg.overlay ) {
                google.maps.event.addListener(trkseg.overlay, 'click', click_handler.bind({view: this, polyline: trkseg.overlay}));
              }
            }
          }
        }
      }).bind(dd));

    }).bind(this)});

  }
};
