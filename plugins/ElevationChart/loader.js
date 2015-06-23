GPXCasualViewer.plugin.ElevationChart = {
  chartCanvasId: 'chart_canvas',
  callback: function() {

    var mapcontrol = new GPXCasualViewer.MapControl({
          initial: [GPXCasualViewer.plugin.ElevationChart.path, 'ic_trending_up_black_48dp.png'].join('/')
        },{
          map: this.getMap()
        }),
        p1 = GPXCasualViewer.load_script([GPXCasualViewer.plugin.ElevationChart.path, 'DivDivider.js'].join('/')),
        p2 = GPXCasualViewer.load_script("https://www.google.com/jsapi");
    Promise.all([this, mapcontrol, p1, p2]).then((function (values){
      google.load('visualization', '1', {'packages': ['corechart'], 'callback': (function (){
        var app     = this[0],
            control = this[1],
            script  = this[2],
            jsapi   = this[3],
            dd_options = {},
            dd = new DivDivider(
                      app.getMapElement().getAttribute('id'),
                      GPXCasualViewer.plugin.ElevationChart.chartCanvasId,
                      dd_options);
        dd.chart = new google.visualization.LineChart(dd.$chart);
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

        // 
        app.register('onCreatePolyline', (function(polyline) {

          google.maps.event.addListener(polyline, 'click', (function(ev) {
            var src, i, l, data, options,
                table = [],
                distance = 0;
            if ( this.view.isOpened() ) {

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
                this.view.on_select_chart = function (row, col){
                  var val = data.getValue(row, col);
                  this.marker.setPosition( polyline.getPath().getAt(row) );
                  if ( ! this.marker.getMap() ) {
                    this.marker.setMap( polyline.getMap() );
                  }
                };
                this.view.addEvent('close', (function (){
                  this.current_polyline = null;
                  this.marker.setMap(null);
                  this.chart.clearChart();
                }).bind(this.view));
              }

            } else { // view is closed 
              this.view.current_polyline = null;
              this.view.marker.setMap(null);
              this.view.chart.clearChart();
            }

          }).bind({view: this, polyline: polyline}));

        }).bind(dd));


      }).bind(values)});


    }).bind(this));

  }
};
