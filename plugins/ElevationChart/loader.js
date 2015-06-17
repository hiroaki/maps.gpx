GPXCasualViewer.plugin.ElevationChart = {
  path: null,
  className: 'controlbutton-contorl',
  chartCanvasId: 'chart_canvas',
  callback: function() {
    GPXCasualViewer.plugin.detectPathOfPlugin('ElevationChart');
    this.require_css('ElevationChart').then(function (src){
      console.log("css loaded "+ src);
    });
    var p1 = GPXCasualViewer.load_script([GPXCasualViewer.plugin.ElevationChart.path, 'DivDivider.js'].join('/'));
    var p2 = GPXCasualViewer.load_script("https://www.google.com/jsapi");
    Promise.all([p1, p2]).then((function (srcs){
      console.log('js loaded '+ srcs);
      google.load('visualization', '1', {'packages': ['corechart'], 'callback': (function (){

        // MapControl
        var ic = document.createElement('img');
        ic.setAttribute('src', GPXCasualViewer.plugin.ElevationChart.path + 'ic_trending_up_black_48dp.png');
        ic.setAttribute('width', 32);
        ic.setAttribute('height', 32);
        var div = document.createElement('div');
        div.setAttribute('class', GPXCasualViewer.plugin.ElevationChart.className);
        div.appendChild(ic);
        this.getMap().controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);


        var dd_options = {};
        var dd = new DivDivider(
                      this.getMapElement().getAttribute('id'),
                      GPXCasualViewer.plugin.ElevationChart.chartCanvasId,
                      dd_options);
        dd.chart = new google.visualization.LineChart(dd.$chart);
        dd.marker = new google.maps.Marker();  
        dd.current_polyline = null;  
        google.maps.event.addDomListener(div, 'click', (function(ev) {
          this.toggle();
        }).bind(dd));
      
        //
        google.visualization.events.addListener(dd.chart, 'select', (function (){
          if ( ! this.on_select_chart ) {
            return;
          }
          var selection = this.chart.getSelection();
          if ( ! selection ) {
            return;
          }
          var item = selection[0];
          if ( ! item ) {
            return;
          }
          this.on_select_chart.call(this, item.row, item.column);
        }).bind(dd));

        // 
        this.register('onCreatePolyline', (function(polyline) {

          google.maps.event.addListener(polyline, 'click', (function(ev) {
            if ( this.view.isOpened() ) {

              if ( this.view.current_polyline !== this.polyline ) {
                var src = this.polyline.getSource();
                var table = [];
                var distance = 0;
                table.push(['distance', 'ele']);
                table.push([0, parseInt(src[0].ele)]);
                for ( var i = 1, l = src.length; i < l; ++i ) {
                  distance += parseInt(google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(src[i - 1].lat, src[i - 1].lon),
                        new google.maps.LatLng(src[i    ].lat, src[i    ].lon)
                        ));
                  table.push([distance, parseInt(src[i].ele)]);
                }
                var data = google.visualization.arrayToDataTable(table);

                var options = {
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


      }).bind(this)});


    }).bind(this));

  }
};
