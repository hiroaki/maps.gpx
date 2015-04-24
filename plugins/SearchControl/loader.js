GPXCasualViewer.plugin.SearchControl = {
  id: 'searchcontrol-general-input-field',
  callback: function() {
    if ( ! GPXCasualViewer.plugin.URL ) {
      console.log('Warning: plugin.SearchControl requires plugin.URL');
    }

    var input = document.createElement('input');
    input.setAttribute('id', GPXCasualViewer.plugin.SearchControl.id);
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter a URL');
    input.setAttribute('class', 'searchcontrol-controls');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    google.maps.event.addDomListener(input, 'change', (function(ev) {
      var val = ev.target.value.trim();
      if ( val != '' ) {
        this.handlerIncludeObjectFromURL(val);
      }
    }).bind(this));
  }
};
