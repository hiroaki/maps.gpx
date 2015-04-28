# GPX Casual Viewer v3

GPX Casual Viewer is a HTML5 application for overlay GPX on the Google Maps.

The main part of this project is `gpx-casual-viewer.js` JavaScript library
that provides each functions.
And HTML files are built by its several functions according to application.

Bundled `viewer.html` is one of an example of application.
And there are other examples in `samples` directory.

Below is the explanation of the main JavaScript library `gpx-casual-viewer.js`.


## Usage

At first, load Google Maps API and `gpx-casual-viewer.js`.
Class `GPXCasualViewer` is defined by this.

```
<script src="http://maps.google.com/maps/api/js?sensor=false">
</script>
<script src="gpx-casual-viewer.js">
</script>
```

To instantiate the class,
it accepts two parameters that are the same as `google.maps.Map` of Google Maps API.

The first argument is the ID for the viewport (DIV element) that should be drawn the map.

And the second argument gives options by Hash,
it will be passed inside to constructor of `google.maps.Map` directly.
However, it is set the default value of `GPXCasualViewer` if it is omitted.

```
<div id="map_canvas">
</div>
<script>
var app = new GPXCasualViewer('map_canvas');
</script>
```

Now a map is ready. Let's give GPX data to this map to overlay.

There are several ways to give GPX:

* String of GPX directly
* via binary of GPX (File or Blob object)
* via URL of GPX

API is prepared for each, but part of user interface is left to user.
However, it's possible to use the plug-in offered by external file instead of writing code.

Therefore, if use plug-in, it is necessary to add `script` tag.
Specifically, please see examples described to below,
and build your application using the methods of instance, plug-ins and more things.


## Example 1

This example is using plug-in `Droppable`, which provides one of user interface.

This is an application that overlays waypoints and tracks as markers and polylines,
by you drag and drop GPX files into browser window.

And as the action when GPX was added:
- Fit the map so that all coordinates be contained in the viewport.
- Show all the waypoints and the tracks for adding GPX.

Like this example, when not directing specifically, overlays won't be shown.

It is possible to show/hide overlays anytime.

```
<!DOCTYPE html>
<html><head><title>GPX Casual Viewer v3</title>
<style>
html, body, #map_canvas { height: 100%; margin: 0px; padding: 0px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="../gpx-casual-viewer.js"></script>
<script src="../plugins/Droppable/loader.js"></script>
<script>
  google.maps.event.addDomListener(window, 'load', function() {
    var app = new GPXCasualViewer('map_canvas');
    app.register('onAddGPX', function(key) {
      this.fitBounds(key);
      this.showOverlayWpts(key);
      this.showOverlayTrks(key);
    });
    app.use('Droppable');
  });
</script>
</head><body>
<div id="map_canvas"></div>
</body></html>
```


## Example 2

This example inputs GPX from URL.

In this case, it is useful when giving GPX as a parameter to a general-purpose map
on the page generated from a template in the CMS, Weblog and so on.

```
<!DOCTYPE html>
<html lang="ja"><head><title>GPX Casual Viewer v3</title>
<style>
div.map { width:640px; height:320px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="../gpx-casual-viewer.js"></script>
<script>
google.maps.event.addDomListener(window, 'load', function() {
  var maps = document.getElementsByClassName('map');
  var apps = [];
  for ( var i = 0, l = maps.length; i < l; ++i ) { 
    var item = maps.item(i);
    var id = item.getAttribute('id');
    apps[i] = new GPXCasualViewer(id);
    apps[i].input(id, item.getAttribute('data-url')).then(function (key){
      this.fitBounds(key);
      this.showOverlayTrks(key);
    }.bind(apps[i]));
  }
});
</script>
</head><body>
  <h1>Japan National Highway Route 1</h1>
  <div class="map" id="R1" data-url="R1.gpx"></div>
  <h1>Along the Biwako canal</h1>
  <div class="map" id="sosui" data-url="Biwakososui.gpx"></div>
</body></html>

```



---

# API reference

Because GPX Casual Viewer is under development, API will be changed without notice.

The current version is `v2.2.x`.
At least, the number of middle will go up when there is a change in the API.


## GPXCasualViewer class

The core in this library.

### Class property

class property | type    | description
---------------|---------|------------
strict         | boolean | with check about GPX is valid (but not yet completely), when call instance method `addGPX`. default `true`. it throws an exception if received invalid one
join_trkseg    | boolean | merge all trkseg in a trk, one polyline per one trk. default `true`

### Class method

These are general utilities.

The argument `Object:src` is a URL string or an instance of Blob for GPX.

class method                    | return value   | description
--------------------------------|----------------|------------
parseQueryString( String:str )  | Hash           | parse str as the query string, and generate pairs of key and value of Hash
parseXML( String:str )          | document       | parse str as XML, and return document DOM
createXMLHttpRequest( )         | XMLHttpRequest | create instance of `XMLHttpRequest`
resolveAsBlob( Object:src )                   | Promise | create Promise which resolve src as Blob
resolveAsArrayBuffer( Object:src )            | Promise | create Promise which resolve src as ArrayBuffer
resolveAsObjectURL( Object:src )              | Promise | create Promise which resolve src as ObjectURL
resolveAsDataURL( Object:src )                | Promise | create Promise which resolve src as DataURL
resolveAsText( Object:src, String?:encoding ) | Promise | create Promise which resolve src as Text. default encoding is "UTF-8"
GPXToJSON( Object:document )              | gpxType       | convert XML document as GPX to JSON
boundsOf( Array:pts, Hash?:boundsType )   | boundsType    | return boundsType which contains all pts. when optional boundsType was set, it is based to extend
createLatlngbounds( Hash:boundsType )     | LatLngBounds  | create instance of `google.maps.LatLngBounds` from boundsType
createOverlayAsWpt( Hash:wptType, Hash?:opt )  | GPXCasualViewer.Marker   | create overlay as wpt
createOverlayAsWpt( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | create overlay as wpt
createOverlayAsRte( Hash:wptType, Hash?:opt )  | GPXCasualViewer.Marker   | create overlay as rte
createOverlayAsRte( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | create overlay as rte
createOverlayAsTrk( Hash:wptType, Hash?:opt )  | GPXCasualViewer.Marker   | create overlay as trk
createOverlayAsTrk( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | create overlay as trk
detectPathOfPlugin( String:name ) | boolean | detect path of given plugin directory. It will set `path` as class property and return `true`. If it is already set, return false with no effects. This is useful for specify base path to resource within plugin

Note:

Each `createOverlayAs...` methods will return an overlay.
If wptType is Hash then it returns Maker,
or wptType is Array then it returns Polyline.

Because a marker and the polyline have the same interface as the overlay,
`GPXCasualViewer` is designed to create overlay
without distinction about which is Marker or Polyline.

To make that possible, when creating Marker or Polyline for handling by `GPXCasualViewer`,
you have to use these factory methods
and do not use constructor of `google.maps.Marker` and `google.maps.Polyline`


### Constructor

constructor                                 | description
--------------------------------------------|------------
GPXCasualViewer( String:map_id, Hash?:opt ) | arguments are same as constructor of `google.maps.Map`. please see its document for details


### Instance method

The argument `Object:src` is a URL string or an instance of Blob for GPX.

instance method              | return value | description
-----------------------------|--------------|------------
getMap( )         | google.maps.Map | return the instance of `google.maps.Map` application created
getMapElement( )  | node | return dom node for viewport of the map
getMapSettings( ) | Hash | return setting parameter Hash for initialize the map
fitBounds( String?:key )       | this | fit the map so that all coordinates of GPX specified by key are contained in the viewport. If key is not given, it means that all GPX
showOverlayWpts( String?:key ) | this | show overlays for waypoints in GPX specified by key
hideOverlayWpts( String?:key ) | this | hide overlays for waypoints in GPX specified by key
showOverlayRtes( String?:key ) | this | show overlays for routes in GPX specified by key
hideOverlayRtes( String?:key ) | this | hide overlays for routes in GPX specified by key
showOverlayTrks( String?:key ) | this | show overlays for tracks in GPX specified by key
hideOverlayTrks( String?:key ) | this | hide overlays for tracks in GPX specified by key
input( String:key, Object:src, String?:type ) | this | input src. its media-type of the data is judged inside and handled with an appropriate input handler if registered by `registerInputHandler`. when `input` GPX, it is handled by the default input handler
getGPX( String:key )              | gpxType | return GPX specified key
eachGPX( Function:callback )      | this    | apply callback to each GPX. given arguments to callback are GPX and its key
getKeysOfGPX( )                   | Array   | return list of GPX keys
addGPX( String:key, String:src )  | this    | add GPX by src text as key. if the instance alredy has key, overwrite it
removeGPX( String:key )           | this    | remove GPX specified by key
use( String:pluginName )                   | this | use plug-in specified identifier
register( String:hook, Function:callback ) | this | register a callback function on specified hook point
applyHook( String:hook, arguments )        | this | apply all functions registered specified hook point as method of the instance `this`. reqired arguments are different every hook point


### Hook

Several hook points are in the program.
You can register callbacks to each hooks by the method `register`.

Registered callbacks are executed as instance method.

It's possible to register more than one callbacks with one hooks.
In that case, callback will be executed in order of registration.

hook                  | description
----------------------|--------------------------------
onCreateLatlngbounds  | apply hooks when `google.maps.LatLngBounds` is created. callback will accept created object
onCreateMarker        | apply hooks when `GPXCasualViewer.Marker` is created. callback will accept created object
onCreatePolyline      | apply hooks when `GPXCasualViewer.Polyline` is created. callback will accept created object
onAddGPX              | apply hooks when added GPX by `addGPX(key, src)`. callback will accept the 1st argument "key" that will able to identify added GPX


---

## GPXCasualViewer.InputHandler class

For defined input handler by each media types.

When you want to handle data except for GPX, the input handler has to be implemented using this class.

### Constructor

constructor  | description
-------------|-------------------------------------------------------------
GPXCasualViewer.InputHandler( String:type, Function?:handler ) | create instance with function for media-type. to enable it giving `GPXCasualViewer#registerInputHandler`

### Instance method

instance method                | return value | description
-------------------------------|----------|------------------------------------------------------------
setType( String:type )         | this     | set media type
getType( String:type )         | String   | get media type
setHandler( Function:handler ) | this     | set handler
getHandler( Function:handler ) | Function | get handler
execute( Object:bind, String:key, Object:src ) | Promise | apply handler binding "bind" object with arguments key and src. return an instance of Promise, it will return key when resolve. The src is a URL string or an instance of Blob for GPX, you have to implement it so that it may be possible to handle both of src


---

## GPXCasualViewer.Marker class

This class extends `google.maps.Marker`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `GPXCasualViewer` class method. 

### Instance method

All methods of `google.maps.Marker` can use.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
overlayed( )    | boolean      | `true` if it is overlayed on the map
isWpt( )        | boolean      | `true` if it is the marker as the waypoint
isRte( )        | boolean      | `true` if it is the marker as the route
isTrk( )        | boolean      | `true` if it is the marker as the track
getSource( )    | Hash         | get parameter when it was created

---

## GPXCasualViewer.Polyline class

This class extends `google.maps.Polyline`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `GPXCasualViewer` class method. 

### Instance method

All methods of `google.maps.Polyline` can use.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
overlayed( )    | boolean      | `true` if it is overlayed on the map
isWpt( )        | boolean      | `true` if it is the polyline as the waypoint
isRte( )        | boolean      | `true` if it is the polyline as the route
isTrk( )        | boolean      | `true` if it is the polyline as the track
getSource( )    | Hash         | get parameter when it was created

---

## Plug-in

There is mechanism of a plug-in in class `GPXCasualViewer`.
It is usually provided in a different JavaScript source.

Therefore, load it to use:

```
<script src="plugins/PluginName/loader.js"></script>
```

And declare to apply it.

```
app.use('pluginName');
```

Please refer to each plug-in for details.


## Core plug-in

These plug-in are included inside the core library,
and it isn't necessary to load by `script` tag.

Even if you do not `use`, these plug-ins used by default effect.

### GPXCasualViewer.plugin.SetTitleOnCreateMarker

When a mouse pointer over a marker,
it shows the value of `name` in an element (usually waypoint) as a tool tips.

### GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline

It defines options of polyline in the route and the track.
Concretely, it's about color, width and opacity.


# See also

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# Copyright and license

    GPX Casual Viewer v3
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
