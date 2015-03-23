(function (){
  GPXCasualViewer.plugin.file = {
    callback: function (){
      google.maps.event.addDomListener(document.getElementById(this.map_id),'dragover',function (ev){
        ev.stopPropagation();
        ev.preventDefault();
      });
      google.maps.event.addDomListener(document.getElementById(this.map_id),'drop',(function (ev){
        ev.stopPropagation();
        ev.preventDefault();
        var files = ev.dataTransfer.files;
        for(var i=0,l=files.length; i<l; ++i){
          var file = files[i];
          var prop = "name=["+ file.name + "] type=[" + file.type +"] size=["+ file.size + "]";
          console.log(prop);
          var name = file.name;
          var reader = new FileReader();
          reader.shelf = { app: this, name: name };
          reader.onload = function (event){
            this.shelf.app.add_gpx(this.shelf.name, this.result);
            this.shelf = null;
          }
          reader.readAsText(file, 'UTF-8');
          reader = null;
        }
      }).bind(this));
    }
  }
})();
