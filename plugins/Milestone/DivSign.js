/*
  DivSign - create DIV node making a sign

  (c) 2009-2015 WATANABE Hiroaki
  This is distributed under the MIT license.
*/

var DivSign = {
  NAME: 'DivSign',
  VERSION: '3.0.0',
  createDivWrappingText: function(text) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(text));
    return d;
  },
  create: function(text, options) {
    var extendObject = function(base_object, extensions){
    for(var prop in extensions) base_object[prop] = extensions[prop];
      return base_object;
    };

    var defaults = {
      contentStyle: {},
      legStyle: {},
      maxWidth: '400px',
      opacity: '0.8'
      };

    var settings = extendObject(defaults, options || {});

    var contentStyle = extendObject({
      opacity: settings.opacity,
      backgroundColor: '#FFFFFF',
      padding: '2px 1em',
      margin: '0',
      fontSize: 'small',
      border: '1px solid #AAAAAA'
    }, settings.contentStyle || {});

    var legStyle = extendObject({
      opacity:settings.opacity,
      margin: '0 auto 0 auto',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      padding: '0',
      border: '1px solid #AAAAAA',
      borderTop: 'none',
      width: '3px',
      height: '5px'
    }, settings.legStyle || {});

    var content = this.createDivWrappingText(text);
    for ( var p in contentStyle ) {
      content.style[p] = contentStyle[p];
    }
    var wrapcontent = document.createElement('div');
    wrapcontent.style.textAlign = 'center';
    wrapcontent.style.padding = '0';
    wrapcontent.appendChild(content);

    var leg = document.createElement('div');
    for ( var p in legStyle ) {
      leg.style[p] = legStyle[p];
    }

    var divsign = document.createElement('div');
    divsign.style.overflow = 'hidden';
    divsign.style.width = settings.width;
    if ( settings.maxWidth ) {
      divsign.style.maxWidth = settings.maxWidth;
      if ( divsign.style.setExpression ) {
        // ie
        divsign.style.setExpression('width',settings.maxWidth < document.body.clientWidth ? settings.maxWidth : 'auto');
      }
    }
    divsign.appendChild(wrapcontent);
    divsign.appendChild(leg);
    return divsign;
  }
};
