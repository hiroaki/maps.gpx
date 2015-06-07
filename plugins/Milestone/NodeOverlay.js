/*
  NodeOverlay - Custom overlay which drawing DOM element
    (c) 2009-2015 WATANABE Hiroaki
    This is distributed under the MIT license.
*/

/*--------------
  class NodeOverlay extends google.maps.OverlayView
*/
NodeOverlay = function(element, options) {
  var extendObject = function(base_object, extensions) {
    for(var prop in extensions) base_object[prop] = extensions[prop];
    return base_object;
  };
  this.super = google.maps.OverlayView.prototype;
  this.element = element;
  this.default = {
    draggable: false,
    anchorPosition: NodeOverlay.AnchorPosition.BOTTOM_CENTER, // it is not "anchorPoint"
    pane: NodeOverlay.MapPane.OVERLAY_IMAGE,
    draggableOptions: {}
    };
  this.settings = extendObject(this.default, options || {});
  this.position = this.settings.position;
  this.draggable = null;
};
// inherite OverlayView
NodeOverlay.prototype = Object.create(google.maps.OverlayView.prototype, {
  constructor: { value: NodeOverlay }
});

NodeOverlay.NAME = 'NodeOverlay';
NodeOverlay.VERSION = '3.0.1';
NodeOverlay.AnchorPosition = {
  TOP_LEFT: 'topLeft',
  TOP_RIGHT: 'topRight',
  TOP_CENTER: 'topCenter',
  MIDDLE_LEFT: 'middleLeft',
  MIDDLE_RIGHT: 'middleRight',
  MIDDLE_CENTER: 'middleCenter',
  BOTTOM_LEFT: 'bottomLeft',
  BOTTOM_RIGHT: 'bottomRight',
  BOTTOM_CENTER: 'bottomCenter'
};
NodeOverlay.MapPane = {
  MAP_PANE: 'mapPane',
  OVERLAY_LAYER: 'overlayLayer',
  MARKER_LAYER: 'markerLayer',
  OVERLAY_SHADOW: 'overlayShadow',
  OVERLAY_IMAGE: 'overlayImage',
  FLOAT_SHADOW: 'floatShadow',
  OVERLAY_MOUSE_TARGET: 'overlayMouseTarget',
  FLOAT_PANE: 'floatPane'
};
NodeOverlay._getFunctionToComputeOffset = function(anchor) {
  var xc = function(x){return x/2};
      xl = function(x){return 0},
      xr = function(x){return x},
      yc = function(y){return y/2},
      yt = function(y){return 0},
      yb = function(y){return y};
  var f = {};
  f[NodeOverlay.AnchorPosition.TOP_LEFT] = function(size){return new google.maps.Size(xl(size.width),yt(size.height))};
  f[NodeOverlay.AnchorPosition.TOP_RIGHT] = function(size){return new google.maps.Size(xr(size.width),yt(size.height))};
  f[NodeOverlay.AnchorPosition.TOP_CENTER] = function(size){return new google.maps.Size(xc(size.width),yt(size.height))};
  f[NodeOverlay.AnchorPosition.MIDDLE_LEFT] = function(size){return new google.maps.Size(xl(size.width),yc(size.height))};
  f[NodeOverlay.AnchorPosition.MIDDLE_RIGHT] = function(size){return new google.maps.Size(xr(size.width),yc(size.height))};
  f[NodeOverlay.AnchorPosition.MIDDLE_CENTER] = function(size){return new google.maps.Size(xc(size.width),yc(size.height))};
  f[NodeOverlay.AnchorPosition.BOTTOM_LEFT] = function(size){return new google.maps.Size(xl(size.width),yb(size.height))};
  f[NodeOverlay.AnchorPosition.BOTTOM_RIGHT] = function(size){return new google.maps.Size(xr(size.width),yb(size.height))};
  f[NodeOverlay.AnchorPosition.BOTTOM_CENTER] = function(size){return new google.maps.Size(xc(size.width),yb(size.height))};
  return f[anchor];
};
NodeOverlay._createSizeOfElement = function(element) {
  // getDimensions is borrowed from prototype.js 1.6.0.3
  var display = element.style['display'];
  if (display != 'none' && display != null)
    return {width: element.offsetWidth, height: element.offsetHeight};
  var els = element.style;
  var originalVisibility = els.visibility;
  var originalPosition = els.position;
  var originalDisplay = els.display;
  els.visibility = 'hidden';
  els.position = 'absolute';
  els.display = 'block';
  var originalWidth = element.clientWidth;
  var originalHeight = element.clientHeight;
  els.display = originalDisplay;
  els.position = originalPosition;
  els.visibility = originalVisibility;
  return new google.maps.Size(originalWidth,originalHeight);
};

/*--------------
  instance methods
*/
NodeOverlay.prototype.getOffset = function(anchor) {
  return (NodeOverlay._getFunctionToComputeOffset(anchor))(NodeOverlay._createSizeOfElement(this.element));
};
NodeOverlay.prototype.getPane = function() {
  return this.getPanes()[this.settings.pane];
};
NodeOverlay.prototype.getPosition = function() {
  return this.position;
};
NodeOverlay.prototype.getCurrentPoint = function() {
  var offset = this.getOffset(this.settings.anchorPosition);
  return new google.maps.Point(
    parseInt(this.element.style.left) + offset.width, 
    parseInt(this.element.style.top ) + offset.height);
};
NodeOverlay.prototype.setPointByLatLng = function(latlng) {
  var pt = this.getProjection().fromLatLngToDivPixel(latlng);
  var offset = this.getOffset(this.settings.anchorPosition);
  pt.x = pt.x - offset.width;
  pt.y = pt.y - offset.height;
  this.element.style.left = pt.x +'px';
  this.element.style.top  = pt.y +'px';
  return pt;
};
NodeOverlay.prototype.moveTo = function(latlng) {
  this.setPointByLatLng(latlng);
  return this;
};

/*--------------
  event handlers
*/
NodeOverlay.prototype._handler_mouse_event = function(mouse_event) {
  mouse_event.latLng = this.getPosition();
  google.maps.event.trigger(this, mouse_event.type, mouse_event);
}
NodeOverlay.prototype._handler_drag_object_event = function(drag_object_event) {

  this.position = this.getProjection().fromDivPixelToLatLng(this.getCurrentPoint());

  if ( this.settings.marker ) {
    this.settings.marker.setPosition(this.getPosition());
  }
  
  var type = drag_object_event.event.type;
  if ( drag_object_event.event.type == 'mousedown' ) {
    type = 'dragstart';
  } else if ( drag_object_event.event.type == 'mousemove' ) {
    type = 'drag';
  } else if ( drag_object_event.event.type == 'mouseup' ) {
    type = 'dragend'
  }
  var mouse_event = drag_object_event.event;
  mouse_event.latLng = this.getPosition();
  google.maps.event.trigger(this, type, mouse_event);
}

/*--------------
  implements google.maps.OverlayView
*/
NodeOverlay.prototype._createDraggableObject = function() {
  // wrap element with ExtDraggableObject
  this.draggable = new ExtDraggableObject(this.element, this.settings.draggableOptions);
  google.maps.event.addDomListener(this.draggable, 'dragstart', this._handler_drag_object_event.bind(this) );
  google.maps.event.addDomListener(this.draggable, 'drag', this._handler_drag_object_event.bind(this) );
  google.maps.event.addDomListener(this.draggable, 'dragend', this._handler_drag_object_event.bind(this) );
};
NodeOverlay.prototype.onAdd = function() {
  if( ! this.element.style ) {
    this.element.style = {};
  }
  this.element.style.position = 'absolute';
  this.getPane().appendChild(this.element);
  this.setPointByLatLng(this.getPosition());

  // send event to Overlay
  google.maps.event.addDomListener(this.element, 'click', this._handler_mouse_event.bind(this) );
  google.maps.event.addDomListener(this.element, 'mousedown', this._handler_mouse_event.bind(this) );
  google.maps.event.addDomListener(this.element, 'mouseup', this._handler_mouse_event.bind(this) );

  if ( this.settings.draggable ) {
    this._createDraggableObject();
  }

  if ( this.settings.marker ) {
    this.settings.marker.setPosition(this.getPosition());
    this.settings.marker.setMap(this.getMap());
  }
};
NodeOverlay.prototype.onRemove = function() {
  if ( this.settings.marker ) {
    this.settings.marker.setMap(null);
  }
  if ( this.draggable ) {
    google.maps.event.clearInstanceListeners(this.draggable);
  }
  google.maps.event.clearInstanceListeners(this.element);
  this.element.parentNode.removeChild(this.element);
  this.element = null;
  this.position = null;
  this.draggable = null;
  this.settings = null;
};
NodeOverlay.prototype.draw = function() {
  this.setPointByLatLng(this.getPosition());
};

/*--------------
  proxy methods for ExtDraggableObject
*/
NodeOverlay.prototype.setDraggableCursor = function(cursorStr) {
  if ( this.draggable ) {
    this.draggable.setDraggableCursor(cursorStr);
    return true;
  }
  return false;
};
NodeOverlay.prototype.setDraggingCursor = function(cursorStr) {
  if ( this.draggable ) {
    this.draggable.setDraggingCursor(cursorStr);
    return true;
  }
  return false;
};
