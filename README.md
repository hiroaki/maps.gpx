> NOTICE: This project is ended once by this version and continuation is resumed by new project [https://github.com/hiroaki/maps.gpx](https://github.com/hiroaki/maps.gpx)

# GPX Casual Viewer v3

GPX Casual Viewer is a HTML5 application for overlay GPX on the Google Maps.

The main part of this project is `gpx-casual-viewer.js` JavaScript library
that provides each functions.
And HTML files are built by its several functions according to application.

Bundled `viewer.html` is one of example of application.
And there are other examples in `samples` directory.

Below is the description of the main JavaScript library `gpx-casual-viewer.js`.

## Usage

At first, load Google Maps API with the geometory library, and `gpx-casual-viewer.js`.
Class `GPXCasualViewer` is defined by this.

```
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry">
</script>
<script src="gpx-casual-viewer.js">
</script>
```

It is reasonable to begin applicatio after that waits a load of a document to be completed like general application.

Please use class method `onReady` for it.

After `load` of document waits for an event as well as all preparations of an after-mentioned plug-in have been completed, this guarantees to be called back.

Even if the document triggers `load` event,
there is a possibility that some of the function can't prepare yet.

```
GPXCasualViewer.onReady(function (){
  // Logic of application should be written here.
});
```

To instantiate the class,
it accepts two parameters that are the same as `google.maps.Map` of Google Maps API.

The first argument is the ID for the viewport (DIV element) that should be drawn the map.

And the second argument gives [options](https://developers.google.com/maps/documentation/javascript/reference?hl=ja#MapOptions) by Hash,
it will be passed inside to constructor of `google.maps.Map` directly.
However, it is set the default value of `GPXCasualViewer` if it is omitted.

```
<div id="map_canvas">
</div>
<script>
GPXCasualViewer.onReady(function (){
  var app = new GPXCasualViewer('map_canvas');
  // ...
});
</script>
```

Now a map is ready. Let's give GPX data to this map to overlay.

There are several ways to give GPX:

* String of GPX directly
* via binary of GPX (File or Blob object)
* via URL of GPX

The methods are prepared respectively.

* `addGPX`
* `input`

A method  `addGPX` is the lower-level input method from which a text of the contents of GPX is received.

On the other hand the higher-level input method  `input` is covering both of URL and Blob of GPX,
its contents of the object are passed to the method `addGPX`.

API is prepared for each, but part of user interface is left to developer.
However, it's possible to use the plug-in offered by external file instead of writing code.

* `Droppable`
* `QueryURL`

A plug-in `Droppable` passes the GPX object to method `input`,
by the user drags and drops GPX files on the map.

And A plug-in `QueryURL` also passes URL
which is the value of the parameter 'url' of the query string, to method `input`.

To use a plug-in, give its name to the instance method `use`.

```
app.use('Droppable');
app.use('QueryURL');
```

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
<html lang="en"><head><meta charset="UTF-8"/>
<title>GPX Casual Viewer v3</title>
<style>
html, body, #map_canvas { height: 100%; margin: 0px; padding: 0px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"></script>
<script src="../gpx-casual-viewer.js"></script>
<script>
GPXCasualViewer.onReady(function (){
  new GPXCasualViewer('map_canvas')
  .use('Droppable')
  .register('onAddGPX', function(key) {
    this.fitBounds(key);
    this.showOverlayWpts(key);
    this.showOverlayTrks(key);
  });
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
<html lang="en"><head><meta charset="UTF-8"/>
<title>GPX Casual Viewer v3</title>
<style>
div.map { width:640px; height:320px; }
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"></script>
<script src="../gpx-casual-viewer.js"></script>
<script>
GPXCasualViewer.onReady(function (){
  var $maps = document.getElementsByClassName('map'),
      apps = [], i, l, url;
  for ( i = 0, l = $maps.length; i < l; ++i ) {
    url = $maps.item(i).getAttribute('data-url');
    apps[i] = new GPXCasualViewer($maps.item(i).getAttribute('id'));
    apps[i].input(url, url).then((function(key) {
      this.fitBounds(key);
      this.showOverlayWpts(key);
      this.showOverlayTrks(key);
    }).bind(apps[i]));
  }
});
</script>
</head><body>

  <h1>Japan National Route 1</h1>
  <div class="map" id="R1" data-url="R1.gpx"></div>

  <h1>Walking The Lake Biwa Canal</h1>
  <div class="map" id="sosui" data-url="Biwakososui.gpx"></div>

</body></html>
```

---

# API reference (DEPRECATED)

Because GPX Casual Viewer is under development, API will be changed without notice.

The current version is `v2.3.x`.

However this project is ended once by this version and continuation is resumed by new project [https://github.com/hiroaki/maps.gpx](https://github.com/hiroaki/maps.gpx)


## GPXCasualViewer class

The core in this library.


### Class property

The global setting which has an influence on the inner movement.
It's desirable to set the value before processing.

property       | type    | description
---------------|---------|------------
strict         | boolean | With checking about GPX is valid (but not yet completely), when call instance method `addGPX`. Default is `true`. It throws an exception if received invalid one
join_trkseg    | boolean | Merge all trkseg in a "trk", one polyline per one "trk". Default is `true`
basedir        | String  | The directory this library is placed (read only)
plugin_dir     | String  | The directory the plugins are placed. It is `plugins` under the `basedir`


### Class Methods

These are general utilities.

The argument `src:Object` is a URL string or an instance of Blob for GPX.

class method                    | return value   | description
--------------------------------|----------------|------------
parseQueryString( str:String )  | Hash           | Parse *str* as the query string, and generate pairs of key and value of Hash
parseXML( str:String )          | document       | Parse *str* as XML, and return document DOM
createXMLHttpRequest( )         | XMLHttpRequest | Create instance of `XMLHttpRequest`
resolveAsBlob( src:Object )                   | Promise | Create Promise which will resolve *src* as Blob
resolveAsArrayBuffer( src:Object )            | Promise | Create Promise which will resolve *src* as ArrayBuffer
resolveAsObjectURL( src:Object )              | Promise | Create Promise which will resolve *src* as ObjectURL
resolveAsDataURL( src:Object )                | Promise | Create Promise which will resolve *src* as DataURL
resolveAsText( src:Object, encoding?:String ) | Promise | Create Promise which will resolve *src* as Text. Default encoding is "UTF-8"
GPXToJSON( document:Object )              | gpxType       | Convert XML document as GPX to JSON
boundsOf( pts:Array, boundsType?:Hash )   | boundsType    | Return boundsType which contains all *pts*. when optional *boundsType* was set, it is based to extend
createLatlngbounds( boundsType?:Hash )     | GPXCasualViewer.LatLngBounds  | Create instance of `GPXCasualViewer.LatLngBounds` from *boundsType*
createOverlayAsWpt( wptType:Hash, opt?:Hash )  | GPXCasualViewer.Marker   | Create overlay as "wpt"
createOverlayAsWpt( wptType:Array, opt?:Hash ) | GPXCasualViewer.Polyline | Create overlay as "wpt"
createOverlayAsRte( wptType:Hash, opt?:Hash )  | GPXCasualViewer.Marker   | Create overlay as "rte"
createOverlayAsRte( wptType:Array, opt?:Hash ) | GPXCasualViewer.Polyline | Create overlay as "rte"
createOverlayAsTrk( wptType:Hash, opt?:Hash )  | GPXCasualViewer.Marker   | Create overlay as "trk"
createOverlayAsTrk( wptType:Array, opt?:Hash ) | GPXCasualViewer.Polyline | Create overlay as "trk"
load_script( src:String ) | Promise | Create Promise which will resolve the end of load of src JavaScript file
load_css( src:String ) | Promise | Create Promise which will resolve the end of load of src CSS file
require_plugin( PluginName:String ) | Promise | Create Promise which will resolve the end of load of plugin named *PluginName*
require_plugins( PluginName:String [, PluginName:String, ...] ) | Promise | Create Promise which will resolve the end of load of the all listed plugins. All are load in sequence.
onReady( callback:Function ) | undefined | Register a *callback* function that will call when `GPXCasualViewer` became available. After a load of a source of all plug-in has been completed, *callback* is called.

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

constructor | description
------------|------------
GPXCasualViewer( map_id:String, map_option?:Hash, app_option?:Hash ) | Arguments are same as constructor of `google.maps.Map`. Please see its document for details


### Instance Methods

The argument `src:Object` is a URL string or an instance of Blob for GPX.

instance method              | return value | description
-----------------------------|--------------|------------
getMap( )         | google.maps.Map | Return the instance of `google.maps.Map` application created
getMapElement( )  | node | Return the dom node for viewport of the map
getMapSettings( ) | Hash | Return setting parameter Hash for initialize the map
fitBounds( key?:String )       | this | Fit the map so that all coordinates of GPX specified by *key* are contained in the viewport. If *key* is not given, it means that specify all GPX
showOverlayWpts( key?:String ) | this | Show overlays for waypoints in GPX specified by *key*
hideOverlayWpts( key?:String ) | this | Hide overlays for waypoints in GPX specified by *key*
showOverlayRtes( key?:String ) | this | Show overlays for routes in GPX specified by *key*
hideOverlayRtes( key?:String ) | this | Hide overlays for routes in GPX specified by *key*
showOverlayTrks( key?:String ) | this | Show overlays for tracks in GPX specified by *key*
hideOverlayTrks( key?:String ) | this | Hide overlays for tracks in GPX specified by *key*
registerInputHandler( handler:GPXCasualViewer.InputHandler ) | this | Register an input handler to application. The handler to input GPX is already registered by default. It can be used when the application will handle the other media types
input( key:String, src:Object, type?:String ) | Promise | Input *src*. Its media-type of the data is judged inside and handled with an appropriate input handler if registered by `registerInputHandler`. When `input` GPX, it is handled by the default input handler
getGPX( key:String )              | gpxType | Return GPX specified *key*
eachGPX( callback:Function )      | this    | Apply callback to each GPX. Given arguments to *callback* are GPX and its key
getKeysOfGPX( )                   | Array   | Return list of GPX keys
addGPX( key:String, src:String )  | this    | Add GPX by *src* text as *key*. If the instance already has *key*, overwrite it
removeGPX( key:String )           | this    | Remove GPX specified by *key*
use( PluginName:String )                   | this | Use plug-in specified identifier
register( hook:String, callback:Function ) | this | Register a *callback* function on specified *hook* point
applyHook( hook:String, arguments )        | this | Apply all functions registered specified *hook* point as method of the instance `this`. *arguments* are different every hook point


### Hook

Several hook points are in the program.
You can register callbacks to each hooks by the method `register`.

Registered callbacks are executed as instance method.

It's possible to register more than one callbacks with one hooks.
In that case, callback will be executed in order of registration.

hook name             | description
----------------------|------------
onCreateLatlngbounds  | Apply hooks when `GPXCasualViewer.LatLngBounds` is created. The callback will accept created object
onCreateMarker        | Apply hooks when `GPXCasualViewer.Marker` is created. The callback will accept created object
onCreatePolyline      | Apply hooks when `GPXCasualViewer.Polyline` is created. The callback will accept created object
onAddGPX              | Apply hooks when added GPX by `addGPX(key, src)`. The callback will accept the 1st argument *key* that will able to identify added GPX

Also there are hook points made by some plug-ins.

---

## GPXCasualViewer.InputHandler class

For defined input handler by each media types.

When you want to handle data except for GPX, the input handler has to be implemented using this class.

### Constructor

constructor  | description
-------------|------------
GPXCasualViewer.InputHandler( type:String, handler?:Function ) | Create instance with *handler* function for media *type*. To enable it giving `GPXCasualViewer#registerInputHandler`

### Instance Methods

instance method | return value | description
----------------|--------------|------------
setType( type:String )         | this     | Set media *type*
getType( type:String )         | String   | Get media *type*
setHandler( handler:Function ) | this     | Set *handler*
getHandler( handler:Function ) | Function | Get *handler*
execute( bind:Object, key:String, src:Object ) | Promise | Apply handler binding *bind* object with arguments *key* and *src*. Return an instance of Promise, it will return *key* when resolve. The *src* is a URL string or an instance of Blob for GPX, you have to implement it so that it may be possible to handle both of *src*


---

## GPXCasualViewer.MapControl class

The class to make control.

constructor  | description
-------------|------------
GPXCasualViewer.MapControl( icons:Hash, opts?:Hash ) | Create a control like the button.  *icons* is a hash, it is a pair of an identifier of an icon image and its URL. For example, to change icon which changes by clicking.

### Instance Methods

instance method | return value | description
----------------|--------------|------------
getElement( ) | node | Returns the element of the control
isCurrentIcon( key:String ) | boolean | Returns `true` if state of the control is *key*
getMap( ) | google.maps.Map | Returns the map on which this control is attached
setMap( map:Map ) | Renders this control on the specified map. If map is set to null, the control will be removed
changeIcon( key:String ) | Change icon state and image to specified by *key*

---

## GPXCasualViewer.LatLngBounds class

This class inherits `google.maps.LatLngBounds`.

### Instance Methods

All methods of `google.maps.LatLngBounds` are available.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
clone( ) | GPXCasualViewer.LatLngBounds | create new GPXCasualViewer.LatLngBounds instance which has properties same as this

---

## GPXCasualViewer.Marker class

This class inherits `google.maps.Marker`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `GPXCasualViewer` class method. 

### Instance Methods

All methods of `google.maps.Marker` are available.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
overlayed( )    | boolean      | `true` if it is overlayed on the map
isWpt( )        | boolean      | `true` if it is the marker as the waypoint
isRte( )        | boolean      | `true` if it is the marker as the route
isTrk( )        | boolean      | `true` if it is the marker as the track
getSource( )    | Hash         | Get parameter when it was created

---

## GPXCasualViewer.Polyline class

This class inherits `google.maps.Polyline`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `GPXCasualViewer` class method. 

### Instance Methods

All methods of `google.maps.Polyline` are available.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
overlayed( )    | boolean      | `true` if it is overlayed on the map
isWpt( )        | boolean      | `true` if it is the polyline as the waypoint
isRte( )        | boolean      | `true` if it is the polyline as the route
isTrk( )        | boolean      | `true` if it is the polyline as the track
getSource( )    | Hash         | Get parameter when it was created
computeDistanceLinear( origin:Integer, destination:Integer )|Float| Compute distance [meters] between index of *origin* and *destination* by linear
computeDistanceTrack( origin:Integer, destination:Integer )|Float| Compute distance [meters] between index of *origin* and *destination* along the track

---

## Plug-in

There is mechanism of a plug-in in class `GPXCasualViewer`.
It is usually provided in a different JavaScript source.

To use a plugin, declare it.

```
app.use('PluginName');
```

Please refer to each plug-in for details.

### Core plug-in

These plug-in are included inside the core library.

Even if you do not `use`, these plug-ins used by default effect.

#### GPXCasualViewer.plugin.SetTitleOnCreateMarker

When a mouse pointer over a marker,
it shows the value of `name` in an element (usually waypoint) as a tool tips.

#### GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline

It defines options of polyline in the route and the track.
Concretely, it's about color, width and opacity.


## GPXCasualViewer.plugin object specification

When you make a plug-in, please conform to this specification and GPXCasualViewer.plugin.*PluginName* object specification.

All plug-ins have to be placed in the same directory.

Each plug-in makes its name the camel case which starts with a capital letter.
And create plugin script as `loader.js` in sub direcroty is named *PluginName*.

`GPXCasualViewer` will register *PluginName* as a property in this namespace.

The name of property which starts with lowercase has been reserved.


## GPXCasualViewer.plugin.*PluginName* object specification

There are reserved properties inside the namespace for the plug-in registered as *PluginName*.
When setting some value in these properties, the plug-in is sometimes affected by the outside.

Essentially, this is the interface to make a plug-in.

### Property

property   | type     | description
-----------|----------|------------
path       | string   | Used to resolve the base path of this plug-in. It is can be set by the instance method `require_plugin` of `GPXCasualViewer`
callback   | Function | When registering this plug-in with an instance of `GPXCasualViewer`, callback will be called at timing of the hook point set by property *hook*. If *hook* is false value, it will be called at just `use`. *callback* is called as the instance method of the `GPXCasualViewer`, and its arguments are different depending on hooks.
hook       | String | specify the *hook* point to register the callback

A plug-in declares with each instance of `GPXCasualViewer` basically (A plug-in shared by all instances is also possible.)

When each plug-in would like to maintain data in an instance, it's possible to use the "context" an instance has.

There is `this.context` in a property as a hash for a context. Please access the key with a plug-in name.

For example, a plug-in `VertexInfoWindow`, its *data* should be set in a context as follows.


```
this.context['VertexInfoWindow'] = data;
```

# See also

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# Copyright and license

    GPX Casual Viewer v3
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
