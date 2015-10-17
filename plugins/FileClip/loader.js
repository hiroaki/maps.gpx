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

    this.register('onChangeFilterStatus', (function() {
      var $inputs = this.context['FileClip'].getElementsByTagName('input'),
          i, l = $inputs.length;
      for ( i = 0; i < l; ++i ) {
        google.maps.event.trigger($inputs[i], 'change', {target: $inputs[i]});
      }
    }).bind(this));

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

      // remove all children
      while (this.context['FileClip'].firstChild) {
        this.context['FileClip'].removeChild(this.context['FileClip'].firstChild);
      }
      this.context['FileClip'].appendChild($ul);
    });

  }
};
