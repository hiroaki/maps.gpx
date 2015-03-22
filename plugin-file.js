(function (){

  GPXCasualViewer.plugin.file = {
    callback: function (){

      var app = this;
      var create_handler = function (name){
        return function (event){
          app.add_gpx(name, this.result);
          app.fit_bounds(name);
          app.show_overlay_wpts(name);
          app.show_overlay_rtes(name);
          app.show_overlay_trks(name);
        };
      };

      google.maps.event.addDomListener(document.getElementById(this.map_id),'dragover',function (ev){
        ev.stopPropagation();
        ev.preventDefault();
      });

      google.maps.event.addDomListener(document.getElementById(this.map_id),'drop',function (ev){
        ev.stopPropagation();
        ev.preventDefault();
        var files = ev.dataTransfer.files;
        for(var i=0,l=files.length; i<l; ++i){
          var file = files[i];
          var prop = "name=["+ file.name + "] type=[" + file.type +"] size=["+ file.size + "]";
          console.log(prop);
          var name = file.name;
          var reader = new FileReader();
          reader.onload = create_handler(name).bind(reader);
          reader.readAsText(file, 'UTF-8');
          reader = null;
        }
      });

    }
  }

})();
