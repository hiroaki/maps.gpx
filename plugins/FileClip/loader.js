MapsGPX.plugin.FileClip = {
  callback: function(params) {
    if ( ! this.context['SidePanelControl'] ) {
      console.log('The plugin "FileClip" requires "SidePanelControl"');
      return;
    }

    this.register('onAddGPX', function(key) {

      var $ul = document.createElement('ul');
      var regexp = new RegExp('([^/]+)$');
      var keys = this.getKeysOfGPX();
      for ( var i = 0, l = keys.length; i < l; ++i ) {

        var $cb = document.createElement('input');
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

        var text = keys[i];
        if ( regexp.test(text) ) {
          text = RegExp.$1;
        }
        var contents = document.createTextNode(text);

        var $label = document.createElement('label');
        $label.appendChild($cb);
        $label.appendChild(contents);

        var $li = document.createElement('li');
        $li.appendChild($label);

        $ul.appendChild($li);
      }

      var $fileclip = this.context['FileClip'];
      if ( ! $fileclip ) {
        $fileclip = document.createElement('div');
        this.context['FileClip'] = $fileclip;
        this.context['SidePanelControl'].getElementDrawer().appendChild($fileclip);
      }
      // remove all children
      while ($fileclip.firstChild) {
        $fileclip.removeChild($fileclip.firstChild);
      }
      $fileclip.appendChild($ul);
    });

  }
};
