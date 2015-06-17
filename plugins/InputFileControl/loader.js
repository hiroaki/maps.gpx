GPXCasualViewer.plugin.InputFileControl = {
  path: null,
  className: 'inputfilecontrol-controls',
  callback: function() {
    GPXCasualViewer.plugin.detectPathOfPlugin('InputFileControl');
    this.require_css('InputFileControl').then(function (src){
      console.log("css loaded "+ src);
    });

    var input = document.createElement('input');
    input.setAttribute('id', GPXCasualViewer.plugin.InputFileControl.id);
    input.setAttribute('type', 'file');
    input.setAttribute('style', 'display:none');
    input.setAttribute('multiple', true);
    google.maps.event.addDomListener(input, 'change', (function(ev) {
      var files = ev.target.files;
      for ( var i = 0, l = files.length; i < l; ++i ) {
        this.input(files[i].name, files[i])
          .then(function(key) { console.log(key)} );
      }
    }).bind(this));

    var ic = document.createElement('img');
    ic.setAttribute('src', GPXCasualViewer.plugin.InputFileControl.path + 'ic_folder_open_black_24dp.png');
    ic.setAttribute('width', 32);
    ic.setAttribute('height', 32);

    var div = document.createElement('div');
    div.setAttribute('class', GPXCasualViewer.plugin.InputFileControl.className);
    div.appendChild(ic);

    this.getMap().controls[google.maps.ControlPosition.TOP_LEFT].push(div);

    google.maps.event.addDomListener(div, 'click', (function(ev) {
      this.click();
    }).bind(input));
  }
};
