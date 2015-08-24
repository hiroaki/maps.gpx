MapsGPX.plugin.SidePanelControl = {
  templateOfId: 'sidepanel',
  _sequence: 0,
  generateId: function() {
    return this.templateOfId +''+ ++this._sequence;
  },
  callback: function(params) {
    var control, drawer, drawerOption;
    drawerOption = params || {effect: 'slide', side: 'LEFT', span: '75%'};
    
    control = new MapsGPX.MapControl({
        initial: [MapsGPX.plugin.SidePanelControl.path, 'ic_list_black_24dp.png'].join('/')
      },{
        position: 'LEFT_BOTTOM'
      });
    control.setMap(this.map);

    drawer = new DrawerCSS(
      params['base_id'] || this.getMapElement().getAttribute('id'),
      params['drawer_id'] || MapsGPX.plugin.SidePanelControl.generateId(),
      drawerOption);

    // event relation
    google.maps.event.addDomListener(control.getElement(), 'click', (function(ev) {
      this.toggle();
    }).bind(drawer));

    // 
    google.maps.event.addListener(this.getMap(), 'click', (function(ev) {
      this.close();
    }).bind(drawer));

    this.context['SidePanelControl'] = drawer;
  }
};
