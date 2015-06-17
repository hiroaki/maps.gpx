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

