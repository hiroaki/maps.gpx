function DrawerCSS(){
  this.initialize.apply(this, arguments);
}
DrawerCSS.VERSION = '0.4.0';
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
  span: '80%',
  maxSpan: null
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
    this.maxSpan = this.settings['maxSpan'];

    if ( this.span.toString().match(/\d+$/) ) {
      this.span = this.span +'px';
    }
    if ( this.maxSpan && this.maxSpan.toString().match(/\d+$/) ) {
      this.maxSpan = this.maxSpan +'px';
    }

    this._opened = false;
    this._events = {};
    this._origin = {};

    this.$main = document.getElementById(main_id);
    this.$sub  = document.getElementById(sub_id );
    if ( ! this.$sub ) {
      this.$sub = document.createElement('div');
      this.$sub.setAttribute('id', sub_id);
    }

    this.reset();
  },
  active_span: function() {
    var span = this.span;
    if ( typeof this.span == 'function' ) {
      span = this.span.call(this);
    }
    if ( this.maxSpan ) {
      if ( span.toString().match(/%$/) ) {
        span = this._span_limited_by_percent();
      } else if ( span.toString().match(/\d+\s*px$/) ) {
        span = this._span_limited_by_pixel();
      }
    }
    return span;
  },
  _span_limited_by_percent: function() {
    var attribute = {LEFT:'width',TOP:'height',RIGHT:'width',BOTTOM:'height'}[this.side],
        base_width = DrawerCSS.getDimensions( this.getElementBase() )[attribute],
        opening_span;
    if ( ! this.maxSpan.toString().match(/px$/) ) {
      console.error('the option "maxSpan" has to be specified as "px"');
      return this.span;
    }

    opening_span = parseInt( base_width * parseInt(this.span) / 100 );
    if ( parseInt(this.maxSpan) < opening_span ) {
      opening_span = parseInt(this.maxSpan);
    }
    opening_span = opening_span +'px';

    this.getElementDrawer().style[attribute] = opening_span;
    return opening_span;
  },
  _span_limited_by_pixel: function() {
    var attribute = {LEFT:'width',TOP:'height',RIGHT:'width',BOTTOM:'height'}[this.side],
        base_width = DrawerCSS.getDimensions( this.getElementBase() )[attribute],
        opening_span, limit_span;
    if ( ! this.maxSpan.toString().match(/%$/) ) {
      console.error('the option "maxSpan" has to be specified as "%"');
      return this.span;
    }
    opening_span = parseInt( this.span );
    limit_span   = parseInt( base_width * parseInt(this.maxSpan) / 100 );

    if ( limit_span < opening_span ) {
      opening_span = limit_span;
    }
    opening_span = opening_span +'px';

    this.getElementDrawer().style[attribute] = opening_span;
    return opening_span;
  },
  reset: function() {
    this.destroy();
    this.$main.parentNode.style.position = 'relative';
    this.$main.style.width    = '100%';
    this.$main.style.height   = '100%';
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
    this.$main.parentNode.style.position = '';

    this.$main.style.position   = '';
    this.$main.style.width      = '';
    this.$main.style.height     = '';
    this.$main.style.top        = '';
    this.$main.style.right      = '';
    this.$main.style.bottom     = '';
    this.$main.style.left       = '';

    this.$sub.style.position    = '';
    this.$sub.style.width       = '';
    this.$sub.style.height      = '';
    this.$sub.style.top         = '';
    this.$sub.style.right       = '';
    this.$sub.style.bottom      = '';
    this.$sub.style.left        = '';
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
      if ( ! this.$main.style.bottom ) {
        this.$main.style.bottom = 0;
      }
      this._origin = {attribute: 'bottom', value: this.$main.style.bottom};
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.active_span();
      this.$sub.style.top     = 0;
      this.$sub.style.right   = '';
      this.$sub.style.bottom  = '';
      this.$sub.style.left    = 0;
    } else if ( this.side == 'RIGHT' ) {
      if ( ! this.$main.style.left ) {
        this.$main.style.left = 0;
      }
      this._origin = {attribute: 'left', value: this.$main.style.left};
      this.$sub.style.width   = this.active_span();
      this.$sub.style.height  = '100%';
      this.$sub.style.top     = 0;
      this.$sub.style.right   = 0;
      this.$sub.style.bottom  = '';
      this.$sub.style.left    = '';
    } else if ( this.side == 'BOTTOM' ) {
      if ( ! this.$main.style.top ) {
        this.$main.style.top = 0;
      }
      this._origin = {attribute: 'top', value: this.$main.style.top};
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.active_span();
      this.$sub.style.top     = '';
      this.$sub.style.right   = 0;
      this.$sub.style.bottom  = 0;
      this.$sub.style.left    = '';
    } else if ( this.side == 'LEFT' ) {
      if ( ! this.$main.style.right ) {
        this.$main.style.right = 0;
      }
      this._origin = {attribute: 'right', value: this.$main.style.right};
      this.$sub.style.width   = this.active_span();
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
    if ( false ) {
      void(0);
    } else if ( this.side == 'TOP' ) {
      this.$main.style.bottom = 0;
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.active_span();
      this.$sub.style.top     = 0;
      this.$sub.style.left    = 0;
    } else if ( this.side == 'RIGHT' ) {
      this.$main.style.left   = 0;
      this.$sub.style.width   = this.active_span();
      this.$sub.style.height  = '100%';
      this.$sub.style.bottom  = 0;
      this.$sub.style.right   = 0;
    } else if ( this.side == 'BOTTOM' ) {
      this.$main.style.top    = 0;
      this.$sub.style.width   = '100%';
      this.$sub.style.height  = this.active_span();
      this.$sub.style.bottom  = 0;
      this.$sub.style.right   = 0;
    } else if ( this.side == 'LEFT' ) {
      this.$main.style.right  = 0;
      this.$sub.style.width   = this.active_span();
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
    }[this.side]] = '-' + this.active_span();
  },
  _open_compress: function (){
    if ( false ) {
      void(0);
    } else if ( this.side == 'LEFT' ) {
      this.$sub.style.width = this.active_span();
      this.$main.style.width
        = DrawerCSS.getDimensions(this.$main).width
        - DrawerCSS.getDimensions(this.$sub ).width
        + 'px';
    } else if ( this.side == 'BOTTOM' ) {
      this.$sub.style.height = this.active_span();
      this.$main.style.height
        = DrawerCSS.getDimensions(this.$main).height
        - DrawerCSS.getDimensions(this.$sub ).height
        + 'px';
    } else if ( this.side == 'TOP' ) {
      this.$sub.style.height = this.active_span();
      this.$main.style.height
        = DrawerCSS.getDimensions(this.$main).height
        - DrawerCSS.getDimensions(this.$sub ).height
        + 'px';
    } else if ( this.side == 'RIGHT' ) {
      this.$sub.style.width = this.active_span();
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
    this.$main.style[this._origin['attribute']] = this._origin['value'];
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
