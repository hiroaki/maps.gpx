function DrawerCSS(){
  this.initialize.apply(this, arguments);
}
DrawerCSS.VERSION = '0.1.3';
DrawerCSS._vendorT = ['webkitT', 'mozT', 'oT', 'msT', 't'];
DrawerCSS.getDimensions = function(element) {
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
DrawerCSS.defaults = {
  duration: 0.3,
  delay: 0.0,
  timingFunction: 'ease-in-out',
  effect: 'slide',
  side: 'LEFT',
  span: '80%'
};
DrawerCSS.prototype = {
  initialize: function (main_id, sub_id, options){
    var attr;
    options = options || {};
    this.settings = {};
    for (attr in DrawerCSS.defaults) { this.settings[attr] = DrawerCSS.defaults[attr] }
    for (attr in options) { this.settings[attr] = options[attr] }

    this.duration = parseFloat(this.settings['duration']).toString();
    this.delay = parseFloat(this.settings['delay']).toString();
    this.timingFunction = this.settings['timingFunction'].toLowerCase();
    this.effect = this.settings['effect'].toLowerCase();
    this.side = this.settings['side'].toUpperCase();
    this.span = this.settings['span'];

    this._opened = false;
    this._events = {};

    this.$main = document.getElementById(main_id);
    this.$sub  = document.getElementById(sub_id );
    if ( ! this.$sub ) {
      this.$sub = document.createElement('div');
      this.$sub.setAttribute('id', sub_id);
    }

    this.reset();
  },
  reset: function() {
    this.destroy();
    this.$main.parentNode.style.overflow = 'hidden';
    this.$main.parentNode.style.position = 'relative';
    this.$main.style.overflow = 'hidden';
    this[{ slide: '_init_slide',
        compress: '_init_compress'
    }[this.effect]].call(this);
    this.$main.style.position = 'absolute';

    this.$sub.style.position = 'absolute';

    this.$main.parentNode.insertBefore(this.$sub, this.$main);
  },
  destroy: function() {
    var p;
    for ( p in DrawerCSS._vendorT ) {
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionProperty'] = '';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDuration'] = '';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDelay'] = '';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionTimingFunction'] = '';
    }
    this.$main.parentNode.style.overflow = '';
    this.$main.parentNode.style.position = '';

    this.$main.style.position   = '';
    this.$main.style.width      = '';
    this.$main.style.height     = '';
    this.$main.style.top        = '';
    this.$main.style.right      = '';
    this.$main.style.bottom     = '';
    this.$main.style.left       = '';
    this.$main.style.overflow   = '';

    this.$sub.style.position    = '';
    this.$sub.style.width       = '';
    this.$sub.style.height      = '';
    this.$sub.style.top         = '';
    this.$sub.style.right       = '';
    this.$sub.style.bottom      = '';
    this.$sub.style.left        = '';
    this.$sub.style.overflow    = '';
  },
  _init_slide: function() {
    var p;
    for ( p in DrawerCSS._vendorT ) {
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionProperty'] = 'top,right,bottom,left';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDuration'] = this.duration +'s';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDelay'] = this.delay +'s';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionTimingFunction'] = this.timingFunction;
    }
    if ( false ) {
      void(0);
    } else if ( this.side == 'TOP' ) {
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.span;
      this.$sub.style.top     = 0;
      this.$sub.style.right   = '';
      this.$sub.style.bottom  = '';
      this.$sub.style.left    = 0;
    } else if ( this.side == 'RIGHT' ) {
      this.$sub.style.width   = this.span;
      this.$sub.style.height  = '100%';
      this.$sub.style.top     = 0;
      this.$sub.style.right   = 0;
      this.$sub.style.bottom  = '';
      this.$sub.style.left    = '';
    } else if ( this.side == 'BOTTOM' ) {
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.span;
      this.$sub.style.top     = '';
      this.$sub.style.right   = 0;
      this.$sub.style.bottom  = 0;
      this.$sub.style.left    = '';
    } else if ( this.side == 'LEFT' ) {
      this.$sub.style.width   = this.span;
      this.$sub.style.height  = '100%';
      this.$sub.style.top     = 0;
      this.$sub.style.right   = '';
      this.$sub.style.bottom  = '';
      this.$sub.style.left    = 0;
    } else {
      throw(new Error("The property 'side' is invalid value"));
    }
  },
  _init_compress: function() {
    var p;
    for ( p in DrawerCSS._vendorT ) {
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionProperty'] = 'width,height';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDuration'] = this.duration +'s';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionDelay'] = this.delay +'s';
      this.$main.style[DrawerCSS._vendorT[p] +'ransitionTimingFunction'] = this.timingFunction;
    }
    this.$main.style.width    = '100%';
    this.$main.style.height   = '100%';
    if ( false ) {
      void(0);
    } else if ( this.side == 'TOP' ) {
      this.$main.style.bottom = 0;
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.span;
      this.$sub.style.top     = 0;
      this.$sub.style.left    = 0;
    } else if ( this.side == 'RIGHT' ) {
      this.$main.style.left   = 0;
      this.$sub.style.width   = this.span;
      this.$sub.style.height  = '100%';
      this.$sub.style.bottom  = 0;
      this.$sub.style.right   = 0;
    } else if ( this.side == 'BOTTOM' ) {
      this.$main.style.top    = 0;
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.span;
      this.$sub.style.bottom  = 0;
      this.$sub.style.right   = 0;
    } else if ( this.side == 'LEFT' ) {
      this.$main.style.right  = 0;
      this.$sub.style.width   = this.span;
      this.$sub.style.height  = '100%';
      this.$sub.style.top     = 0;
      this.$sub.style.left    = 0;
    } else {
      throw(new Error("A property 'side' is invalid value"));
    }
  },
  getElementBase: function (){
    return this.$main;
  },
  getElementDrawer: function (){
    return this.$sub;
  },
  isOpened: function() {
    return this._opened;
  },
  open: function() {
    this._opened = true;
    this[{ slide: '_open_slide',
        compress: '_open_compress'
    }[this.effect]].call(this);

    if ( this._events['open'] ) {
      try {
        for ( var i = 0, l = this._events['open'].length; i < l; ++i ) {
          this._events['open'][i].call(this);
        }
      } catch (ex) {
        console.error(ex);
      }
    }
    return this;
  },
  _open_slide: function(){
    this.$main.style[{
      LEFT: 'right',
      TOP: 'bottom',
      RIGHT: 'left',
      BOTTOM: 'top'
    }[this.side]] = '-' + this.span;
    this.$sub.style.overflow = 'auto';
  },
  _open_compress: function (){
    this.$sub.style.overflow = 'auto';
    if ( false ) {
      void(0);
    } else if ( this.side == 'LEFT' ) {
      this.$main.style.width
        = DrawerCSS.getDimensions(this.$main).width
        - DrawerCSS.getDimensions(this.$sub ).width
        + 'px';
    } else if ( this.side == 'BOTTOM' ) {
      this.$main.style.height
        = DrawerCSS.getDimensions(this.$main).height
        - DrawerCSS.getDimensions(this.$sub ).height
        + 'px';
    } else if ( this.side == 'TOP' ) {
      this.$main.style.height
        = DrawerCSS.getDimensions(this.$main).height
        - DrawerCSS.getDimensions(this.$sub ).height
        + 'px';
    } else if ( this.side == 'RIGHT' ) {
      this.$main.style.width
        = DrawerCSS.getDimensions(this.$main).width
        - DrawerCSS.getDimensions(this.$sub ).width
        + 'px';
    }
  },
  close: function() {
    this._opened = false;
    this[{ slide: '_close_slide',
        compress: '_close_compress'
    }[this.effect]].call(this);
    this.$sub.style.overflow = 'hidden';

    if ( this._events['close'] ) {
      try {
        for ( var i = 0, l = this._events['close'].length; i < l; ++i ) {
          this._events['close'][i].call(this);
        }
      } catch (ex) {
        console.error(ex);
      }
    }

    return this;
  },
  _close_slide: function() {
    this.$main.style[{
      TOP: 'bottom', RIGHT: 'left', BOTTOM: 'top', LEFT: 'right'
    }[this.side]] = '';
  },
  _close_compress: function() {
    this.$main.style[{
      TOP: 'height', RIGHT: 'width', BOTTOM: 'height', LEFT: 'width'
    }[this.side]] = '';
  },
  toggle: function() {
    if ( this.isOpened() ) {
      this.close();
      return false;
    } else {
      this.open();
      return true;
    }
  },
  addHandler: function (hook, cb){
    if ( ! this._events[hook] ) {
      this._events[hook] = [];
    }
    this._events[hook].push(cb);
    return this;
  }
}
