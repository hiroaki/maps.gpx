MapsGPX.plugin.FileClip = {
  defaults: {
    classUl: 'menu',
    classLabel: 'menu-item',
    classLi: null
  },
  callback: function(params) {
    var $ul, settings = MapsGPX.merge({}, MapsGPX.plugin.FileClip.defaults, params || {});

    if ( ! this.context['SidePanelControl'] ) {
      console.log('The plugin "FileClip" requires "SidePanelControl"');
      return;
    }

    if ( this.context['FileClip'] ) {
      $ul = this.context['FileClip'].getElementsByTagName('ul').item(0);
    } else {
      this.context['FileClip'] = document.createElement('div');
      this.context['SidePanelControl'].getElementDrawer().appendChild(this.context['FileClip']);
      $ul = document.createElement('ul');
      this.context['FileClip'].appendChild($ul);
      if ( settings.classUl ) {
        $ul.className = settings.classUl;
      }
    }

    this.addFilter('FileClip', 'onAppearOverlayShow', (function(overlay, key) {
      var i, l, $cb_list = this.context['FileClip'].getElementsByTagName('input');
      for ( i = 0, l = $cb_list.length; i < l; ++i ) {
        if ( $cb_list.item(i).value == key ) {
          if ( $cb_list.item(i).checked ) {
            return false;
          } else {
            return true;
          }
        }
      }
      return false;
    }).bind(this));

    this.register('onAddGPX', function(key) {
      var $cb, $label, $li, name;
      $cb = document.createElement('input');
      $cb.setAttribute('type', 'checkbox');
      $cb.setAttribute('value', key);
      $cb.checked = true;
      google.maps.event.addDomListener($cb, 'change', (function(ev) {
        if ( ev.target.checked ) {
          this.showOverlayGpxs(ev.target.value);
        } else {
          this.hideOverlayGpxs(ev.target.value);
        }
      }).bind(this));

      name = key;
      if ( new RegExp('([^/]+)$').test(name) ) {
        name = RegExp.$1;
      }

      $label = document.createElement('label');
      $label.appendChild($cb);
      $label.appendChild(document.createTextNode(name));
      if ( settings.classLabel ) {
        $label.className = settings.classLabel;
      }

      $li = document.createElement('li');
      $li.appendChild($label);
      if ( settings.classLi ) {
        $li.className = settings.classLi;
      }

      this.context['FileClip'].getElementsByTagName('ul').item(0).appendChild($li);
    });
  }
};
