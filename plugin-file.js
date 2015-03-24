GPXCasualViewer.plugin.File = {
  callback: function() {
    google.maps.event.addDomListener(document.getElementById(this.map_id), 'dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    });
    google.maps.event.addDomListener(document.getElementById(this.map_id), 'drop', (function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      var files = ev.dataTransfer.files;
      for (var i = 0, l = files.length; i < l; ++i) {
        var file = files[i];
        console.log('name=['+ file.name + '] type=[' + file.type +'] size=['+ file.size + ']');

        var reader    = new FileReader();
        reader._shelf = { app: this, name: file.name };
        reader.onload = function(event) {
          this._shelf.app.addGPX(this._shelf.name, this.result);
          this._shelf = null;
        }
        reader.readAsText(file, 'UTF-8');
        reader = null;
      }
    }).bind(this));
  }
};
