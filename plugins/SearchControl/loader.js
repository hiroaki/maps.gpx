MapsGPX.plugin.SearchControl = {
  bundles: [
    'loader.css'
  ],
  className: 'map_control_input',
  callback: function() {

    var input = document.createElement('input');
    input.setAttribute('class', MapsGPX.plugin.SearchControl.className);
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter a URL');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    google.maps.event.addDomListener(input, 'change', (function(ev) {
      var val = ev.target.value.trim();
      if ( val != '' ) {
        this.input(val, val);
      }
    }).bind(this));
  }
};
