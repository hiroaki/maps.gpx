# GPX Casual Viewer v3

GPX Casual Viewer は、位置情報のデータフォーマットとして一般的な GPX ファイルを
Google Maps 上にオーバレイして視覚化するための JavaScript ライブラリです。


## 使い方

Google Maps API と `gpx-casual-viewer.js` をロードします。
これにより、クラス `GPXCasualViewer` が定義されます。

```
<script src="http://maps.google.com/maps/api/js?sensor=false">
</script>
<script src="gpx-casual-viewer.js">
</script>
```

コンストラクタには Google Maps API の `google.maps.Map` クラスの
インスタンス化に必要なパラメータと同じものを渡します。

最初の引数は、地図の描画領域である要素（ `div` タグ）の ID です。

第二の引数はハッシュ形式で、オプションを与えます。
これは内部で `google.maps.Map` をインスタンス化する際に透過的に渡されます。
ただし、省略された場合は `GPXCasualViewer` のデフォルト値がセットされます。

```
<div id="map_canvas">
</div>
<script>
var app = new GPXCasualViewer('map_canvas');
</script>
```

これで、地図の準備ができました。この地図に GPX ファイルを与え、オーバーレイしましょう。

GPX を与えるにはいくつかの手段があり、主にプラグインとして別の JavaScript ファイルで実装されています。
従って手段に応じた `script` タグを追加する必要があります。

具体的には、以下に述べるいくつかの例を参考にしてください。
そして、プラグインや `GPXCasualViewer` のインスタンスが提供するメソッドなどを用いて、
アプリケーションを完成させてください。


## 例１

次の例は、プラグイン `File` を利用しています。

ブラウザのウィンドウに GPX ファイルをドラッグ＆ドロップすることで、
その GPX のウェイポイントとトラックを、
マーカーとポリラインとしてオーバーレイするアプリケーションです。

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

## 例２

次の例は、プラグイン `URL` を利用しています。

ページに埋め込まれた GPX の URL をロードし、
その GPX のトラックのみを、
ポリラインとしてオーバーレイするアプリケーションです。

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


## 例３

プラグインを用いない場合。

プラグインを使わなくとも GPX データを受け取ることはできます。
言い換えれば、上の例に示したふたつのプラグインは、
データを受け取るためのユーザ・インタフェースを `GPXCasualViewer` の機能として追加するものです。

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

# API リファレンス

GPX Casual Viewer は現在も開発中のため、 API は予告なく変更されることがあります。

現在のバージョンは v2.0.0 です。 API の変更があるとき、真ん中の数字が上がります。


## クラス GPXCasualViewer

ライブラリのコア。

### クラス・プロパティ

クラス・プロパティ|型        | 説明
----------------|---------|------------------------------------------------------------
strict          | boolean | インスタンス・メソッド `addGPX` にて登録される GPX が正しい GPX であるかのチェックを厳密にします（完璧ではありません）。デフォルト `true` 。正しくない GPX と認識されたとき、 `addGPX` は例外を投げます。

### クラス・メソッド

クラス・メソッド   | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
parseXML(String:str)       | XML document | 入力のテキスト str を XML としてパースし、 XML ドキュメント (DOM) として返します。
GPXToJSON(Object:document) | Hash | 入力の XML ドキュメントを JSON に変換したハッシュを返します。
createLatlngbounds(Hash:gpx, Hash:opt) | LatLngBounds | `gpx.metadata.bounds` を元にした `google.maps.LatLngBounds` のインスタンスを生成して返します。
createOverlayAsWpt(Hash:src, Hash:opt) | GPXCasualViewer.Marker | ウェイポイントとしてマーカーを生成し、返します。
createOverlayAsRte(Hash:src, Hash:opt) | GPXCasualViewer.Polyline | ルートとしてポリラインを生成し、返します。
createOverlayAsTrk(Hash:src, Hash:opt) | GPXCasualViewer.Polyline | トラックとしてポリラインを生成し、返します。

### コンストラクタ

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
GPXCasualViewer(String:map_id, Hash:opt) | インスタンス化します。 map_id および opt は、内部で `google.maps.Map` のコンストラクタに渡され、地図が初期化されます。 `google.maps.Map` のドキュメントを参照してください。


### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
fitBounds(String?:key) | this | 指定した key の GPX データが画面に収まるように地図をフィットさせます。 複数の key を指定でき（配列ではなく、引数として足してください）、インスタンスに登録されているそれら GPX データがすべて収まるようにします。 key を省略すると、すべての GPX を指定したことになります。（以下同様）
showOverlayWpts(String?:key) | this | 指定した key の GPX データのうち、ウェイポイントについて表示させます。
hideOverlayWpts(String?:key) | this | 指定した key の GPX データのうち、ウェイポイントについて非表示にします。
showOverlayRtes(String?:key) | this | 指定した key の GPX データのうち、ルートについて表示させます。
hideOverlayRtes(String?:key) | this | 指定した key の GPX データのうち、ルートについて非表示にします。
showOverlayTrks(String?:key) | this | 指定した key の GPX データのうち、トラックについて表示させます。
hideOverlayTrks(String?:key) | this | 指定した key の GPX データのうち、トラックについて非表示にします。
addGPX(String:key, String:src) | this | src に指定した、文字列の GPX データを、キー key として登録します。すでに key のデータがある場合は上書きされます。
removeGPX(String:key) | this | キー key として登録されている GPX データを削除します。
use(String:plugin) | this | プラグイン plugin を利用します。作用はプラグインによります。
register(String:hook, Function:callback) | this | フックポイント hook に、 callback を登録します。
applyHook(String:hook, arguments) | this | フックポイント hook に登録されている callback を `this` のメソッドとして実行します。 arguments はフックポイントごとに異なります。

### フック

幾つかの箇所にフック・ポイントが設けられています。それらに登録されたコールバックは、インスタンス・メソッドとして実行されます。
また、フックに対するコールバックの登録にはメソッド `register` を利用します。
ひとつのフックに複数のコールバックを登録することができます。その場合、実行される順序は登録順になります。

フック               | 説明
--------------------|--------------------------------
onCreateLatlngbounds| google.maps.LatLngBounds が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreateMarker      | GPXCasualViewer.Marker が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreatePolyline    | GPXCasualViewer.Polyline が生成された時。生成されたオブジェクトがコールバックの引数になります。
onAddGPX            | インスタンス・メソッド addGPX により GPX が入力されたとき。 addGPX の第一引数である GPX の識別子 "key" がコールバックの引数になります。

---

## クラス GPXCasualViewer.Marker

`google.maps.Marker` クラスを拡張します。

### インスタンス・メソッド

すべての `google.maps.Marker` クラスのインスタンス・メソッドが利用できます。
ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
isWptType() | boolean | ウェイポイントとしてのマーカーであれば `true` です。
isRteType() | boolean | ルートとしてのマーカーであれば `true` です。
isTrkType() | boolean | トラックとしてのマーカーであれば `true` です。
getSource() | Hash | インスタンスを生成する際に与えらたパラメータを返します。

---

## クラス GPXCasualViewer.Polyline

`google.maps.Polyline` クラスを拡張します。

### インスタンス・メソッド

すべての `google.maps.Polyline`クラスのインスタンス・メソッドが利用できます。ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
isWptType() | boolean | ウェイポイントとしてのポリラインであれば `true` です。
isRteType() | boolean | ルートとしてのポリラインであれば `true` です。
isTrkType() | boolean | トラックとしてのポリラインであれば `true` です。
getSource() | Hash | インスタンスを生成する際に与えらたパラメータを返します。

---

## プラグイン

クラス `GPXCasualViewer` に機能を追加する機構です。
通常は別の JavaScript ソースにて提供されます。

使用するにはあらかじめ `script` タグでロードしておきます。

```
<script src="plugin-name.js"></script>
```

インスタンス・メソッド `use` によって、利用します。

```
app.use('pluginName');
```

機能はプラグインごとに様々です。それぞれのプラグインを参照してください。


## コア・プラグイン

これらのプラグインはコア・ライブラリのソース内部に含まれており、 `script` タグで別途読み込む必要はありません。
また、インスタンス・メソッド `use` で利用を明示するまでもなくデフォルトで利用されるプラグインです。

### GPXCasualViewer.plugin.SetTitleOnCreateMarker

このプラグインにより、マーカーにマウス・ポインタが乗ると、
その GPX 要素（通常はウェイポイント）の `name` の値をツール・チップスで表示します。

### GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline

このプラグインにより、ルート、およびトラックのポリラインのオプションを定義しています。
具体的には、ポリラインの色、幅、不透明度についてです。


# 参照

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# 著作権・ライセンス

    GPX Casual Viewer v3
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
