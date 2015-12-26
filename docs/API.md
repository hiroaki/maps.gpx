# API reference

Because maps.gpx is under development, API will be changed without notice.

This document is for version v4.x


## MapsGPX class

The core in this library.


### Class property

The global setting which has an influence on the inner movement.
It's desirable to set the value before processing.

property       | type    | description
---------------|---------|------------
strict         | boolean | With checking about GPX is valid (but not yet completely), when call instance method `addGPX`. Default is `true`. It throws an exception if received invalid one
join_trkseg    | boolean | Merge all trkseg in a "trk", one polyline per one "trk". Default is `true`
cache_script    | boolean | Direct to cache the library to the browser (does not always cache.) Default is `true`. During development it is a good idea to set the `false`
basedir        | String  | The directory this library is placed (read only)
plugin_dir     | String  | The directory the plugins are placed. It is `plugins` under the `basedir`
script_loader  | String  | JavaScript file name to be loaded automatically as a plug-in. This name is used by all plug-ins. Default is `loader.js`.
style_loader   | String  | CSS file name to be loaded automatically as a plug-in. This name is used by all plug-ins. Default is `loader.css`.


### Class Methods

These are general utilities.

The argument `src:Object` is a URL string or an instance of Blob for GPX.

class method                    | return value   | description
--------------------------------|----------------|------------
isSafari( ) | boolean | `true` if it detects Safari in `navigator.userAgent`
merge( obj?:Hash ) | Hash | Returns the first argument which has merged following arguments. This merge is "shallow"
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
createLatlngbounds( boundsType?:Hash )     | MapsGPX.LatLngBounds  | Create instance of `MapsGPX.LatLngBounds` from *boundsType*
createOverlayAsWpt( wptType:Hash, opt?:Hash )  | MapsGPX.Marker   | Create overlay as "wpt"
createOverlayAsWpt( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | Create overlay as "wpt"
createOverlayAsRte( wptType:Hash, opt?:Hash )  | MapsGPX.Marker   | Create overlay as "rte"
createOverlayAsRte( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | Create overlay as "rte"
createOverlayAsTrk( wptType:Hash, opt?:Hash )  | MapsGPX.Marker   | Create overlay as "trk"
createOverlayAsTrk( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | Create overlay as "trk"
load_script( src:String ) | Promise | Create Promise which will resolve the end of load of src JavaScript file
load_css( src:String ) | Promise | Create Promise which will resolve the end of load of src CSS file
require_plugin( PluginName:String ) | Promise | Create Promise which will resolve the end of load of plugin named *PluginName*
require_plugins( PluginName:String [, PluginName:String, ...] ) | Promise | Create Promise which will resolve the end of load of the all listed plugins. All are load in sequence.
onReady( callback:Function ) | undefined | Register a *callback* function that will call when `MapsGPX` became available. After a load of a source of all plug-in has been completed, *callback* is called.

Note:

Each `createOverlayAs...` methods will return an overlay.
If wptType is Hash then it returns Maker,
or wptType is Array then it returns Polyline.

Because a marker and the polyline have the same interface as the overlay,
`MapsGPX` is designed to create overlay
without distinction about which is Marker or Polyline.

To make that possible, when creating Marker or Polyline for handling by `MapsGPX`,
you have to use these factory methods
and do not use constructor of `google.maps.Marker` and `google.maps.Polyline`


### Constructor

constructor | description
------------|------------
MapsGPX( map_id:String, map_option?:Hash, app_option?:Hash ) | Arguments are same as constructor of `google.maps.Map`. Please see its document for details


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
showOverlayGpxs( key?:String ) | this | Show overlays for GPX specified by *key*
hideOverlayGpxs( key?:String ) | this | Hide overlays for GPX specified by *key*
registerInputHandler( handler:MapsGPX.InputHandler ) | this | Register an input handler to application. The handler to input GPX is already registered by default. It can be used when the application will handle the other media types
input( key:String, src:Object, type?:String ) | Promise | Input *src*. Its media-type of the data is judged inside and handled with an appropriate input handler if registered by `registerInputHandler`. When `input` GPX, it is handled by the default input handler
getGPX( key:String )              | gpxType | Return GPX specified *key*
eachGPX( callback:Function )      | this    | Apply callback to each GPX. Given arguments to *callback* are GPX and its key
getKeysOfGPX( )                   | Array   | Return list of GPX keys
addGPX( key:String, src:String )  | this    | Add GPX by *src* text as *key*. If the instance already has *key*, overwrite it
removeGPX( key:String )           | this    | Remove GPX specified by *key*
use( PluginName:String, params?:Hash )     | this | Use plug-in specified identifier. *params* will be passed to the callback of the plug-in
extend( PluginName:String, params?:Hash ) | this | Commit to use plug-in at calling `extended`. *params* will be passed to the callback of the plug-in
extended( callback:Function ) | this | Load and performs all plugins which were commited by `extend`. The *callback* receives no parameters. Note that the committed state will be cleared
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
onCreateLatlngbounds  | Apply hooks when `MapsGPX.LatLngBounds` is created. The callback will accept created object
onCreateMarker        | Apply hooks when `MapsGPX.Marker` is created. The callback will accept created object
onCreatePolyline      | Apply hooks when `MapsGPX.Polyline` is created. The callback will accept created object
onAddGPX              | Apply hooks when added GPX by `addGPX(key, src)`. The callback will accept the 1st argument *key* that will able to identify added GPX
onShowMarker        | Apply hooks when `MapsGPX.Marker` is shown by `showOverlay...`. The callback receives its instance.
onHideMarker        | Apply hooks when `MapsGPX.Marker` is hidden by `hideOverlay...`. The callback receives its instance.
onShowPolyline      | Apply hooks when `MapsGPX.Polyline` is shown by `showOverlay...`. The callback receives its instance.
onHidePolyline      | Apply hooks when `MapsGPX.Polyline` is hidden by `hideOverlay...`. The callback receives its instance.

Also there are hook points made by some plug-ins.

---

## MapsGPX.InputHandler class

For defined input handler by each media types.

When you want to handle data except for GPX, the input handler has to be implemented using this class.

### Constructor

constructor  | description
-------------|------------
MapsGPX.InputHandler( type:String, handler?:Function ) | Create instance with *handler* function for media *type*. To enable it giving `MapsGPX#registerInputHandler`

### Instance Methods

instance method | return value | description
----------------|--------------|------------
setType( type:String )         | this     | Set media *type*
getType( type:String )         | String   | Get media *type*
setHandler( handler:Function ) | this     | Set *handler*
getHandler( handler:Function ) | Function | Get *handler*
execute( bind:Object, key:String, src:Object ) | Promise | Apply handler binding *bind* object with arguments *key* and *src*. Return an instance of Promise, it will return *key* when resolve. The *src* is a URL string or an instance of Blob for GPX, you have to implement it so that it may be possible to handle both of *src*


---

## MapsGPX.MapControl class

The class to make control.

constructor  | description
-------------|------------
MapsGPX.MapControl( icons:Hash, opts?:Hash ) | Create a control like the button.  *icons* is a hash, it is a pair of an identifier of an icon image and its URL. For example, to change icon which changes by clicking.

### Instance Methods

instance method | return value | description
----------------|--------------|------------
getElement( ) | node | Returns the element of the control
isCurrentIcon( key:String ) | boolean | Returns `true` if state of the control is *key*
getMap( ) | google.maps.Map | Returns the map on which this control is attached
setMap( map:Map ) | None | Renders this control on the specified map. If map is set to null, the control will be removed
changeIcon( key:String ) | this | Change icon state and image to specified by *key*

---

## MapsGPX.LatLngBounds class

This class inherits `google.maps.LatLngBounds`.

### Instance Methods

All methods of `google.maps.LatLngBounds` are available.
Explain about the added method here.

instance method | return value | description
----------------|--------------|------------
clone( ) | MapsGPX.LatLngBounds | create new MapsGPX.LatLngBounds instance which has properties same as this

---

## MapsGPX.Marker class

This class inherits `google.maps.Marker`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `MapsGPX` class method. 

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

## MapsGPX.Polyline class

This class inherits `google.maps.Polyline`.

But the expansion parts are effective only when
an instance was created by `createOverlayAs...` of `MapsGPX` class method. 

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

The plug-in is a mechanism to add functionality to the class `MapsGPX`.
It is usually provided in a separate JavaScript source file.

Therefore it has to be loaded the source of plug-in by `require_plugin` or `require_plugins` instance method.
And call `use` method to start its use.

However, this is a primitive way:

```
app.require_plugins('PluginName')
app.use('PluginName');
```

Usually, please using the method according to `extend` and `extended`:

```
app.extend('PluginName').extended(function() { ... })
```

The `extend` method pushes `PluginName` to the queue for plug-ins which are going to be used.
At that point, it does not perform  the load of the source file.

You can push some plug-ins to the queue:

```
app.extend('Foo');
app.extend('Bar');
app.extend('Baz');
app.extended(function(){
  ...
});
```

Plug-ins loading and execution will be performed when the `extended` method is called.
At that time, the order in which they queued is protected.

The important thing is that
the callback of `extended` will be performed after all load of plug-in have been completed.

When you write code that depends on the plug-ins must be after the plug-ins have completed loading.
Therefore you will want to write the body of the application to callback of `extended`.


### Core plug-in

These plug-ins are included inside the core library.

Even if it is not be called to use, these plug-ins will be used by default.

#### MapsGPX.plugin.SetTitleOnCreateMarker

When a mouse pointer over a marker,
it shows the value of `name` in an element (usually waypoint) as a tool tips.

#### MapsGPX.plugin.SetStrokeOptionOnCreatePolyline

It defines options of polyline in the route and the track.
Concretely, it's about color, width and opacity.


## MapsGPX.plugin object specification

When you make a plug-in, please conform to this specification and MapsGPX.plugin.*PluginName* object specification.

All plug-ins have to be placed in the same directory.

Each plug-in makes its name the camel case which starts with a capital letter.
And create plugin script as `loader.js` in sub direcroty is named *PluginName*.

`MapsGPX` will register *PluginName* as a property in this namespace.

The name of property which starts with lowercase has been reserved.


## MapsGPX.plugin.*PluginName* object specification

There are reserved properties inside the namespace for the plug-in registered as *PluginName*.
When setting some value in these properties, the plug-in is sometimes affected by the outside.

Essentially, this is the interface to make a plug-in.

### Property

property   | type     | description
-----------|----------|------------
path       | string   | Used to resolve the base path of this plug-in. It is can be set by the instance method `require_plugin` of `MapsGPX`
bundles    | Array of String | List of JavaScript files and CSS files that this plug-in required. Each name is basename of path. These must be deployed the same directory as `loader.js`
callback   | Function | When registering this plug-in with an instance of `MapsGPX`, callback will be called at timing of the hook point set by property *hook*. If *hook* is false value, it will be called at just `use`. *callback* is called as the instance method of the `MapsGPX`, and its arguments are different depending on hooks.
callback | Function | Function performing when the `use` instance method will be called. *callback* receives the parameter passed by `use` or `extend`

A plug-in declares with each instance of `MapsGPX` basically (A plug-in shared by all instances is also possible.)

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

    maps.gpx
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
