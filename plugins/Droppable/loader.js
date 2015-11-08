MapsGPX.plugin.Droppable = {
  callback: function(params) {
    var elem = document.getElementById(this.map_id);

    google.maps.event.addDomListener(elem, 'dragover', (function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }).bind(this));

    google.maps.event.addDomListener(elem, 'drop', (function(ev) {
      var files, file, i, l;
      ev.stopPropagation();
      ev.preventDefault();
      files = ev.dataTransfer.files;
      for ( i = 0, l = files.length; i < l; ++i ) {
        file = files[i];
        console.log('Dropped: name=['+ file.name +'] type=['+ file.type +'] size=['+ file.size +']');
        this.input(file.name, file);
      }
    }).bind(this));
  }
};
