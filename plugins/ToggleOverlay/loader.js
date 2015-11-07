MapsGPX.plugin.ToggleOverlay = {
  bundles: [
    'loader.css'
  ],
  class_prefix: 'toggle-overlay-',
  callback: function(params) {
    var createButton, wrapWithLabel, $container, $cb_wpt, $cb_rte, $cb_trk;
    if ( ! this.context['SidePanelControl'] ) {
      console.log('The plugin "ToggleOverlay" requires "SidePanelControl"');
      return;
    }

    createButton = (function(type, checked) {
      var $cb;
      $cb = document.createElement('input');
      $cb.setAttribute('type', 'checkbox');
      $cb.setAttribute('value', type);
      if ( checked ) {
        $cb.checked = true;
      }
      google.maps.event.addDomListener($cb, 'change', (function(ev) {
        this.showOverlayGpxs();
      }).bind(this));
      return $cb;
    }).bind(this);

    wrapWithLabel = (function($cb) {
      var $label, type = $cb.getAttribute('value');
      $label = document.createElement('label');
      $label.setAttribute('class', MapsGPX.plugin.ToggleOverlay.class_prefix + type);
      $label.appendChild($cb);
      $label.appendChild(document.createTextNode(type));
      return $label;
    }).bind(this);

    $cb_wpt = createButton('wpt', true);
    $cb_rte = createButton('rte', true);
    $cb_trk = createButton('trk', true);
    $container = document.createElement('div');
    $container.setAttribute('class', MapsGPX.plugin.ToggleOverlay.class_prefix + 'container');
    $container.appendChild(wrapWithLabel($cb_wpt));
    $container.appendChild(wrapWithLabel($cb_rte));
    $container.appendChild(wrapWithLabel($cb_trk));

    this.context['SidePanelControl'].getElementDrawer().appendChild($container);

    this.addFilter('ToggleOverlay', 'onAppearOverlayShow', (function(overlay, key) {
      if ( overlay.isWpt() ) {
        return this.cb.wpt.checked ? false : true;
      } else if ( overlay.isRte() ) {
        return this.cb.rte.checked ? false : true;
      } else if ( overlay.isTrk() ) {
        return this.cb.trk.checked ? false : true;
      }
      return false;
    }).bind({app: this, cb: { wpt: $cb_wpt, rte: $cb_rte, trk: $cb_trk }}));
  }
};

