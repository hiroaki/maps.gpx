GPXCasualViewer.plugin.SearchControl = {
  id: 'searchcontrol-general-input-field',
  callback: function() {
    GPXCasualViewer.plugin.detectPathOfPlugin('SearchControl');
    this.require_css('SearchControl').then(function (src){
      console.log("css loaded "+ src);
    });

    var input = document.createElement('input');
    input.setAttribute('id', GPXCasualViewer.plugin.SearchControl.id);
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter a URL');
    input.setAttribute('class', 'searchcontrol-controls');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    google.maps.event.addDomListener(input, 'change', (function(ev) {
      var val = ev.target.value.trim();
      if ( val != '' ) {
        this.input(val, val);
      }
    }).bind(this));
  }
};
