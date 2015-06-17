GPXCasualViewer.plugin.ElevationChart = {
  path: null,
  className: 'controlbutton-contorl',
  chartCanvasId: 'chart_canvas',
  callback: function() {
    GPXCasualViewer.plugin.detectPathOfPlugin('ElevationChart');

    // MapControl
    var ic = document.createElement('img');
    ic.setAttribute('src', GPXCasualViewer.plugin.ElevationChart.path + 'ic_trending_up_black_48dp.png');
    ic.setAttribute('width', 32);
    ic.setAttribute('height', 32);
    var div = document.createElement('div');
    div.setAttribute('class', GPXCasualViewer.plugin.ElevationChart.className);
    div.appendChild(ic);
    this.getMap().controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);

    // Drawer
    function DivDivider(){
      this.initialize.apply(this, arguments);
    }
    DivDivider.getDimensions = function(element) {
      // getDimensions by prototype.js 1.6.0.3
      var display = element.style['display'];
      if (display != 'none' && display != null)
        return {width: element.offsetWidth, height: element.offsetHeight};
      var els = element.style,
          originalVisibility = els.visibility,
          originalPosition = els.position,
          originalDisplay = els.display,
          originalWidth = element.clientWidth,
          originalHeight = element.clientHeight;
      els.visibility = 'hidden';
      els.position = 'absolute';
      els.display = 'block';
      els.display = originalDisplay;
      els.position = originalPosition;
      els.visibility = originalVisibility;
      return {width: originalWidth, height: element.originalHeight};
    };
    DivDivider.prototype = {
      initialize: function (map_id, chart_id, options){
        this.settings = {};
        this.defaults = {
          chart_height: '30%'
          };
        for (var attr in this.defaults) { this.settings[attr] = this.defaults[attr] }
        for (var attr in       options) { this.settings[attr] = options[attr]       }

        this.events = {};
        if ( this.settings['onOpen'] ) {
          this.events['open'] = this.settings['onOpen'];
        }
        if ( this.settings['onClose'] ) {
          this.events['close'] = this.settings['onClose'];
        }

        this.$map = document.getElementById(map_id);
        this._upgrade_map_style();

        this.$chart = document.createElement('div');
        this.$chart.setAttribute('id', chart_id);
        this.$chart.style.height = '0px';
        this.$chart.style.width = '100%';
        this.$map.parentNode.insertBefore(this.$chart, this.$map.nextSibling );
        this.chart_height = this.settings['chart_height'];

        this.resize_listener = google.maps.event.addDomListener(window, 'resize', (function(ev) {
          this.close();
        }).bind(this));
      },
      getMapHeightPx: function (){
        return DivDivider.getDimensions(this.$map).height;
      },
      _upgrade_map_style: function (){
        var vendor = ['webkitT', 'mozT', 'oT', 'msT', 't'];
        for ( var prefix in vendor ) {
          this.$map.style[vendor[prefix] +'ransitionProperty'] = 'width,height';
          this.$map.style[vendor[prefix] +'ransitionDuration'] = '0.4s';
          this.$map.style[vendor[prefix] +'ransitionDelay'] = '0s';
          this.$map.style[vendor[prefix] +'ransitionTimingFunction'] = 'ease-in-out';
        }
      },
      isOpened: function (){
        return this.$chart.style.height == '0px' ? false : true;
      },
      open: function (){
        this.$chart.style.height = this.chart_height;
        this.$map.style.height = this.getMapHeightPx() - DivDivider.getDimensions(this.$chart).height + 'px';
        if ( this.events['open'] ) {
          try {
            this.events['open'].call(this);
          } catch (ex) {
            console.error(ex);
          }
        }
        return this;
      },
      close: function (){
        this.$chart.style.height = '0px';
        this.$map.style.height = ''; // reset map height to the initial
        if ( this.events['close'] ) {
          try {
            this.events['close'].call(this);
          } catch (ex) {
            console.error(ex);
          }
        }
        return this;
      },
      toggle: function (){
        if ( this.isOpened() ) {
          this.close();
        } else {
          this.open();
        }
        return this;
      },
      addEvent: function (hook, cb){
        this.events[hook] = cb;
      }
    };

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

  }
};
