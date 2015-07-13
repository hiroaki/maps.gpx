MapsGPX.plugin.InputFileControl = {
  callback: function() {
    var control, input;

    control = new MapsGPX.MapControl({
        initial: [MapsGPX.plugin.InputFileControl.path, 'ic_folder_open_black_24dp.png'].join('/')
      },{
        position: 'TOP_LEFT'
      });
    control.setMap(this.map);

    // hidden interface to upload
    input = document.createElement('input');
    input.setAttribute('id', MapsGPX.plugin.InputFileControl.id);
    input.setAttribute('type', 'file');
    input.setAttribute('style', 'display:none');
    input.setAttribute('multiple', true);
    google.maps.event.addDomListener(input, 'change', (function(ev) {
      var files = ev.target.files, i, l;
      for ( i = 0, l = files.length; i < l; ++i ) {
        this.input(files[i].name, files[i])
          .then(function(key) { console.log(key)} );
      }
    }).bind(this));

    // event relation
    google.maps.event.addDomListener(control.getElement(), 'click', (function(ev) {
      this.click();
    }).bind(input));
  }
};
