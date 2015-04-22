GPXCasualViewer.plugin.File = {
  callback: function() {
    var elem = document.getElementById(this.map_id);

    google.maps.event.addDomListener(elem, 'dragover', (function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }).bind(this));

    google.maps.event.addDomListener(elem, 'drop', (function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      var files = ev.dataTransfer.files;
      for (var i = 0, l = files.length; i < l; ++i) {
        var file = files[i];
        console.log('name=['+ file.name +'] type=['+ file.type +'] size=['+ file.size +']');
        if ( file.type == 'image/jpeg' ) {
          this.promiseToReadEXIF(file.name, file);
        } else {
          this.promiseToAddGPX(file.name, file);
        }
      }
    }).bind(this));
  }
};
