MapsGPX.plugin.Editor = {
  callback: function(params) {

    this.register('onCreatePolyline', (function(polyline) {

      polyline.addListener('click', (function(mouseevent) {
        this.polyline.setEditable(true);
      }).bind({app: this, polyline: polyline}));

      polyline.addListener('dblclick', (function(mouseevent) {
        this.polyline.setEditable(false);
      }).bind({app: this, polyline: polyline}));

    }).bind(this));

  }
};
