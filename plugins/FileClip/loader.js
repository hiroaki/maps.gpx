MapsGPX.plugin.FileClip = {
  callback: function(params) {
    if ( ! this.context['SidePanelControl'] ) {
      console.log('The plugin "FileClip" requires "SidePanelControl"');
      return;
    }

    this.register('onAddGPX', function(key) {
      var drawer = this.context['SidePanelControl'];

      var $pane = drawer.getElementDrawer();
      // remove all children
      while ($pane.firstChild) {
        $pane.removeChild($pane.firstChild);
      }

      var $ul = document.createElement('ul');
      var regexp = new RegExp('([^/]+)$');
      var keys = this.getKeysOfGPX();
      for ( var i = 0, l = keys.length; i < l; ++i ) {

        var $cb = document.createElement('input');
        $cb.setAttribute('type', 'checkbox');
        $cb.setAttribute('value', keys[i]);
        $cb.setAttribute('checked', 'checked');
        google.maps.event.addDomListener($cb, 'change', (function(ev) {
          if ( this.element.checked ) {
            this.app.showOverlayGpxs(this.element.value);
          } else {
            this.app.hideOverlayGpxs(this.element.value);
          }
        }).bind({app:this,element:$cb}));

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

      var $container = document.createElement('div');
      $container.appendChild($ul);
      $pane.appendChild($container);
    });

  }
};
