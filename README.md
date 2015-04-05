# GPX Casual Viewer v3

GPX Casual Viewer is a small framework of JavaScript to overlay GPX on Google Maps embedded HTML page.


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
you have to give parameter that is the same as `google.maps.Map` of Google Maps API

The first argument is the ID for the DIV element that should be drawn the map.

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

Now a map is ready. Let's give GPX files to this map to overlay.

There are several ways to give GPX, and it's implemented by different JavaScript file as plug-in mainly.
Therefore, it is necessary to add `script` tag for each way.

Specifically, please consult several examples described to below,
and complete your application using the methods of instance, plug-ins and more things.


## Example 1

The following example is using plug-in `File`.

This is an application that overlays waypoints and tracks as markers and polylines,
by you drag and drop GPX files into browser window.

```
<!DOCTYPE html>
<html><head><title>GPX Casual Viewer v3</title>
<style>
html { height: 100% }
body { height: 100%; margin: 0px; padding: 0px }
#map_canvas { height: 100% }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="gpx-casual-viewer.js"></script>
<script src="plugin-file.js"></script>
<script>
  google.maps.event.addDomListener(window, 'load', function() {
    var app = new GPXCasualViewer('map_canvas');
    app.register('onAddGPX', function(key) {
      this.fitBounds();
      this.showOverlayWpts(key);
      this.showOverlayTrks(key);
    });
    app.use('File');
  });
</script>
</head><body>
<div id="map_canvas"></div>
</body></html>
```

## Example 2

The following example is using plug-in `URL`.

This is an application that overlays waypoints and tracks as markers and polylines,
by fetch GPX files from each URL embedded in a page.

```
<!DOCTYPE html>
<html><head><title>GPX Casual Viewer v3</title>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="gpx-casual-viewer.js"></script>
<script src="plugin-url.js"></script>
<script>
google.maps.event.addDomListener(window, 'load', function() {

  var ids = ['article_1', 'article_2'];

  for ( var i = 0, l = ids.length; i < l; ++i ) { 
    var app  = new GPXCasualViewer(ids[i]);
    var url  = document.getElementById(ids[i]).getAttribute('data-url');
    app.addGPX(url, GPXCasualViewer.plugin.URL.readGPXTextFromURL(url));
    app.fitBounds(url);
    app.showOverlayTrks(url);
  }
});
</script>
</head><body>

  <h1>Article 1</h1>
  <div id="article_1" style="width:400px;height:400px"
    data-url="/gpx/driving.gpx">
  </div>

  <h1>Article 2</h1>
  <div id="article_2" style="width:400px;height:400px"
    data-url="/gpx/walking.gpx">
  </div>

</body></html>
```


## Example 3

The following example is not using plug-in.

That can also receive GPX by a primitive method without plug-in.
In other words,
these plug-ins are the interface of receiving GPX
which are added as the function of the `GPXCasualViewer`.

```
<!DOCTYPE html>
<html><head><title>GPX Casual Viewer v3</title>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="gpx-casual-viewer.js"></script>
<script>
google.maps.event.addDomListener(window, 'load', function() {
  var app = new GPXCasualViewer('map_canvas');
  google.maps.event.addDomListener(document.getElementById('overlay'), 'click',
    (function(event) {
      this.addGPX('gpx_data', document.getElementById('gpx_data').value);
      this.fitBounds('gpx_data');
      this.showOverlayWpts('gpx_data');
    }).bind(app));
});
</script>
</head><body>
  <div id="map_canvas" style="width:400px;height:400px"></div>
  <textarea id="gpx_data" rows="12" cols="80">
<?xml version="1.0"?>
<gpx version="1.1" creator="GPX Casual Viewer Sample" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<wpt lat="35.683955" lon="139.774462"></wpt>
</gpx>
  </textarea><br/>
  <button id="overlay">Apply</button>
</body></html>
```

---

# API reference

Because GPX Casual Viewer is under development, API will be changed without notice.

The current version is `v2.1.x`.
When there is a change in the API, the number of middle will go up.


## GPXCasualViewer class

The core in this library.

### Class property

class property | type    | description
---------------|---------|------------
strict         | boolean | with check about GPX is valid (but not yet completely), when call instance method `addGPX`. default `true`. it throws an exception if received invalid one
join_trkseg    | boolean | merge all trkseg in a trk, one polyline per one trk. default `true`

### Class method

class method                            | return value             | description
----------------------------------------|--------------------------|------------
parseXML(String:str)                    | XML document             | parse str as XML, and return document DOM
GPXToJSON(XML document)                 | Hash:gpxType             | convert XML document as GPX to JSON
boundsOf(Array:pts, Hash?:boundsType)   | Hash:boundsType          | return boundsType which contains all pts. when optional boundsType was set, it is based to extend
createLatlngbounds(Hash:boundsType)     | LatLngBounds             | create instance of `google.maps.LatLngBounds` from boundsType
createOverlayAsWpt(Hash:wptType, Hash:opt)  | GPXCasualViewer.Marker   | create overlay as wpt
createOverlayAsWpt(Array:wptType, Hash:opt) | GPXCasualViewer.Polyline | create overlay as wpt
createOverlayAsRte(Hash:wptType, Hash:opt)  | GPXCasualViewer.Marker   | create overlay as rte
createOverlayAsRte(Array:wptType, Hash:opt) | GPXCasualViewer.Polyline | create overlay as rte
createOverlayAsTrk(Hash:wptType, Hash:opt)  | GPXCasualViewer.Marker   | create overlay as trk
createOverlayAsTrk(Array:wptType, Hash:opt) | GPXCasualViewer.Polyline | create overlay as trk

NOTE:

`createOverlayAs*` methods will return an overlay.
If wptType is Hash then it returns Maker, or wptType is Array then it returns Polyline.

Because a marker and the polyline have the same interface as the overlay which is a broader term,
GPXCasualViewer is designed to create overlay without distinguish  about which is Marker or Polyline

To make that possible, when creating Marker or Polyline, you have to use these factory methods 
and do not use constructor of `GPXCasualViewer.Marker`, `GPXCasualViewer.Polyline` and `google.maps.*` directly.


### Constructor

constructor                              | description
-----------------------------------------|------------
GPXCasualViewer(String:map_id, Hash?:opt) | arguments are same as constructor of `google.maps.Map`, please see its document for details.


### Instance method

instance method              | return value | description
-----------------------------|--------------|------------
fitBounds(String?:key)       | this | sets the viewport to contain the given GPX as "key". it accepts multiple keys, or void means all
showOverlayWpts(String?:key) | this | show overlays for waypoints in specified GPX with key
hideOverlayWpts(String?:key) | this | hide overlays for waypoints in specified GPX with key
showOverlayRtes(String?:key) | this | show overlays for routes in specified GPX with key
hideOverlayRtes(String?:key) | this | hide overlays for routes in specified GPX with key
showOverlayTrks(String?:key) | this | show overlays for tracks in specified GPX with key
hideOverlayTrks(String?:key) | this | hide overlays for tracks in specified GPX with key
addGPX(String:key, String:src)           | this | add GPX by src text as "key". if the instance alredy has key, it is overwrite
removeGPX(String:key)                    | this | remove GPX by "key" that the instance has
use(String:plugin)                       | this | use plug-in specified identifier
register(String:hook, Function:callback) | this | register a callback function on specified "hook" point
applyHook(String:hook, arguments)        | this | apply all functions registered specified "hook" point as method of the instance `this`. reqired arguments are different every hook point


### Hook

Several hook points are in the program.
You can register callbacks to each hooks by the method `register`.

Registered callbacks are executed as instance method.

It's possible to register more than one callbacks with one hooks.
In that case, callback will be executed in order of registration.

hook                | description
--------------------|--------------------------------
onCreateLatlngbounds| apply hooks when `google.maps.LatLngBounds` is created. callback will accept created object.
onCreateMarker      | apply hooks when `GPXCasualViewer.Marker` is created. callback will accept created object.
onCreatePolyline    | apply hooks when `GPXCasualViewer.Polyline` is created. callback will accept created object.
onAddGPX            | apply hooks when added GPX by `addGPX(key, src)`. callback will accept the 1st argument "key" that will able to identify added GPX

---

## GPXCasualViewer.Marker class

This class extends `google.maps.Marker`.

### Instance method

All methods of `google.maps.Marker` can use.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
isWpt()         | boolean      | `true` if it is the marker as the waypoint
isRte()         | boolean      | `true` if it is the marker as the route
isTrk()         | boolean      | `true` if it is the marker as the track
getSource()     | Hash         | get parameter when it was created

---

## GPXCasualViewer.Polyline class

This class extends `google.maps.Polyline`.

### Instance method

All methods of `google.maps.Polyline` can use.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
isWpt()         | boolean      | `true` if it is the polyline as the waypoint
isRte()         | boolean      | `true` if it is the polyline as the route
isTrk()         | boolean      | `true` if it is the polyline as the track
getSource()     | Hash         | get parameter when it was created

---

## Plug-in

There is mechanism of a plug-in in class `GPXCasualViewer`.
It is usually provided in a different JavaScript source.

At first, load it:

```
<script src="plugin-name.js"></script>
```

And you declare to use and apply it.

```
app.use('pluginName');
```

Please refer to each plug-in for details.


## Core plug-in

These plug-in are included inside the core library,
and it isn't necessary to read by `script` tag.

Even if you do not `use`, these plug-ins used by default.

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
