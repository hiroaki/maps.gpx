# maps.gpx

The project "maps.gpx" provides JavaScript library to handle GPX data on Google Maps API,
and bundled some HTML5 applications are using it.
This meets these needs:

* Use the map with GPX data
* Make the map with GPX data


## Use

`viewer.html` is for viewing the GPX data which is a popular format of GPS geolocation information.

Please open it with a browser which supports HTML5.
Then the map accepts GPX files by drag and drop.

There is a demo page you can use:

[http://hiroaki.github.io/projects/mapsgpx/viewer.html](http://hiroaki.github.io/projects/mapsgpx/viewer.html)


### Features

* All works on the client side
* To use, `viewer.html` is opened in a browser only
* Drag & drop to input, more than one file at the same time
* Show and hide the GPX on demand
* Show elevation chart of the track
* Point current location by the GPS sensor
* Support mobile browsers, the viewport is responsive


### Input Data

* GPX
* JPEG including EXIF having the "GPS" tag
* (I'd like to implement for the other data formats)

Even if EXIF has no "GPS" tag, it may be possible to identify the taken location
of the picture from the date and time of the track of GPX which have input ahead.


### Other Resources

There are blog articles that introduce the maps-gpx.
Note that these are written in Japanese but some images and videos hope to become helps.

[http://hiroaki.github.io/blog/2015/0429/gpx-casual-viewer-v3/](http://hiroaki.github.io/blog/2015/0429/gpx-casual-viewer-v3/)

[http://hiroaki.github.io/blog/2015/0721/maps-dot-gpx-a-dot-k-a-gpx-casual-viewer/](http://hiroaki.github.io/blog/2015/0721/maps-dot-gpx-a-dot-k-a-gpx-casual-viewer/)



## Make

The main part of this project is "maps-gpx.js" that provides general functions
handling GPX data by the Google Maps API.

In fact, `viewer.html` described above is one of application which have made by its several functions.

The below is the guide of the JavaScript library for making contents of the map with GPX data.
Also there is available API document in `docs` sub directory.


### Usage

At first, it must be loaded the Google Maps API with an addition of the geometory library.
Also "sensor" have to be set `true` if it is going to use function which requires the GPS sensor.

Next `maps-gpx.js`. The class `MapsGPX` will be defined.

```
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry">
</script>
<script src="maps-gpx.js">
</script>
```

It is reasonable to begin application after that waits
to finish the document to be completed, like general application.

Please use the class method `onReady` to solve it.

```
MapsGPX.onReady(function (){
  // application logic should be written here
});
```

To instantiate the class,
it accepts two parameters are the same as the constructor of `google.maps.Map`.

The first argument is the ID of a dom element for the viewport for drawing the map.

And the second argument accepts [options](https://developers.google.com/maps/documentation/javascript/reference?hl=ja#MapOptions) by a Hash, 
it is going to be passed to the constructor of `google.maps.Map` directly.

It will be set the default value of `MapsGPX` if it is omitted.

```
<div id="map_canvas">
</div>
<script>
MapsGPX.onReady(function (){
  var app = new MapsGPX('map_canvas');
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

The method `addGPX` is the most low level input method which is able to receive a text contents of GPX.

On the other hand the higher level input method  `input` is able to receive URL or Blob object of GPX,
and its contents of the object are passed to the method `addGPX`.

API is prepared, but part of user interface is left to developer.
However, it's possible to use the plug-in offered by external file instead of writing code.

* `Droppable`
* `QueryURL`

The `Droppable` plug-in passes the GPX object to method `input`,
by the user drags and drops GPX files on the map.

And `QueryURL` plug-in also passes URL
which is the value of the parameter 'url' of the query string, to method `input`.

To use plug-ins, `extend` the instance of `MapsGPX` by giving its name.
And register callback function by the `extended`

```
app.extend('Droppable');
app.extend('QueryURL');
app.extended(function() {
  // ...
})
```

The callback of `extended` guarantees that it is going to run after all preparations of exteded plug-ins.

Because external ".js" and ".css" files will be loaded, even if the document triggers `load` event,
there is a possibility that some preparations of plug-ins aren't complete.

On the above, the whole would be as follows:

```
MapsGPX.onReady(function() {

  // here is when the document loaded completely

  new MapsGPX('map_canvas')
    .extend('Droppable')
    .extend('QueryURL')
    .extended(function() {

      // application logic which is using plug-ins
      // should be written here

    });
});
```

Specifically, please see examples which is described to below,
and build your application with the methods of instance, some plug-ins and more things.

API documentation is located in the `docs` directory.


### Example 1

This example is using plug-in `Droppable`, which provides one of user interface.

This is an application that overlays waypoints and tracks as markers and polylines.
You can drag and drop GPX files into the browser window.

When GPX was added:

* Fit the map so that all coordinates be contained in the viewport.
* The view of map is fitted to include all coordinate.
* Show all waypoints and tracks of the adding GPX.

```
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx</title>
<style>
html, body, #map_canvas {
  width: 100%; height: 100%; margin: 0px; padding: 0px;
}
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry">
</script>
<script src="../maps-gpx.js">
</script>
<script>
MapsGPX.onReady(function (){
  new MapsGPX('map_canvas')
    .extend('Droppable')
    .extend('EXIF')
    .extend('EXIF2GPX')
    .extend('DescImage')
    .extended(function(){
      this.register('onAddGPX', function(key) {
        this.fitBounds(key);
        this.showOverlayGpxs(key);
      });
    });
});
</script>
</head><body>
  <div id="map_canvas"></div>
</body></html>
```

This example shows the entire contents of `viewer-droppable.html` located in the `samples` directory.
Open it by your browser, please try.

Like this example, when not direct specifically, overlays won't be shown.
It is possible to show/hide overlays anytime.

The `key` passed to the callback hook is a unique key to identify the GPX data.


### Example 2

This example, to load the GPX of the URL embedded in the page.

This is useful when you want to give the GPX as a parameter to the general map of the pages
that are generated from a template in the CMS or weblog.

```
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx</title>
<style>
div.map { width:640px; height:320px; }
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry">
</script>
<script src="../maps-gpx.js">
</script>
<script>
MapsGPX.onReady(function() {
  var $maps = document.getElementsByClassName('map'),
      apps = [], i, l, url;
  for ( i = 0, l = $maps.length; i < l; ++i ) {
    url = $maps.item(i).getAttribute('data-url');
    apps[i] = new MapsGPX($maps.item(i).getAttribute('id'));
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

This example is what was omitted part of the `viewer-xhr.html` located in `samples` directory.

The plug-in is not used, but it is using the `input` method in its callback
to display the overlays of GPX data on the map.
This also shows overlays during adding GPX.
However, it uses in different way from the previous example.


Then there is another feature in this example, it shows that 
the page is able to have multiple instances of the map.
Because instances are independent of each other,
you will be able to manipulate separately.


#### Caveat

If you are opening direct the HTML file in rigid browser as Google Chrome,
it means that for protocol scheme is `file`,
an exception "Cross origin requests" occurs.
And you will not be able to obtain the expected results.

However, distribution of the content by web server, it is common case as weblog,
its the protocol scheme is `http` or `https`.
In this case the exception will not occur.


# See also

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# Copyright and license

    maps.gpx
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
