MapsGPX.plugin.FileClip = {
  callback: function(params) {
    if ( ! this.context['SidePanelControl'] ) {
      console.log('The plugin "FileClip" requires "SidePanelControl"');
      return;
    }

    if ( ! this.context['FileClip'] ) {
      this.context['FileClip'] = document.createElement('div');
      this.context['SidePanelControl'].getElementDrawer().appendChild(this.context['FileClip']);
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
      var i, l, $cb, text, contents, $label, $li,
        $ul = document.createElement('ul'),
        regexp = new RegExp('([^/]+)$'),
        keys = this.getKeysOfGPX();
      for ( i = 0, l = keys.length; i < l; ++i ) {
        $cb = document.createElement('input');
        $cb.setAttribute('type', 'checkbox');
        $cb.setAttribute('value', keys[i]);
        $cb.setAttribute('checked', 'checked');
        google.maps.event.addDomListener($cb, 'change', (function(ev) {
          if ( ev.target.checked ) {
            this.showOverlayGpxs(ev.target.value);
          } else {
            this.hideOverlayGpxs(ev.target.value);
          }
        }).bind(this));

        text = keys[i];
        if ( regexp.test(text) ) {
          text = RegExp.$1;
        }
        contents = document.createTextNode(text);

        $label = document.createElement('label');
        $label.appendChild($cb);
        $label.appendChild(contents);

        $li = document.createElement('li');
        $li.appendChild($label);

        $ul.appendChild($li);
      }

      // remove all children
      while (this.context['FileClip'].firstChild) {
        this.context['FileClip'].removeChild(this.context['FileClip'].firstChild);
      }
      this.context['FileClip'].appendChild($ul);
    });
  }
};
