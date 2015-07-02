# GPX Casual Viewer v3

GPX Casual Viewer は、
Google Maps の地図上に位置情報データ（ GPX ）を簡単にオーバーレイ（視覚化）するための HTML5 アプリケーションです。

機能を提供する汎用の JavaScript ライブラリ `gpx-casual-viewer.js` が、このプロジェクトの主要部分になります。

そして用途に応じて、その機能を組み合わせた HTML ファイルが、アプリケーションとなります。
同梱される `viewer.html` はアプリケーションの例のひとつです。
ほかの例は `samples` ディレクトリにあります。

以下はその主要 JavaScript ライブラリ `gpx-casual-viewer.js` の説明です。


## 使い方

まず最初に Google Maps API をロードします。その際、 `geometry` ライブラリを使うように指定します。
それから `gpx-casual-viewer.js` をロードします。
これにより、クラス `GPXCasualViewer` が定義されます。

```
<script src="http://maps.google.com/maps/api/js?sensor=false&libraries=geometry">
</script>
<script src="gpx-casual-viewer.js">
</script>
```

コンストラクタには Google Maps API の `google.maps.Map` クラスの
インスタンス化に必要なパラメータと同じものを渡します。

最初の必須の引数は、地図の描画領域である要素（ `div` タグ）の ID です。

省略可能な第二の引数はハッシュ形式で、そのまま `google.maps.Map` をインスタンス化する際のオプションになります。
省略された場合は `GPXCasualViewer` が定義しているデフォルト値が使われます。

```
<div id="map_canvas">
</div>
<script>
var app = new GPXCasualViewer('map_canvas');
</script>
```

これで、地図の準備ができました。この地図に GPX を与え、オーバーレイしましょう。

GPX を与えるとき、そのソースには次の形があります：

* GPX のテキスト・データを直接
* GPX をバイナリ・オブジェクト経由で（ `Blob` または `File` オブジェクト）
* URL 経由で

それぞれに API が用意されていますが、ユーザ・インタフェースの部分はアプリケーション実装者に任せられます。
しかしながら JavaScript コードを書く代わりに、別ファイルで提供されているプラグインを利用することもできます。

プラグインを利用する場合は、追加の `script` タグでそれをロードしてください。
具体的には、以下に述べるいくつかの例を参考にしてください。

そして様々な機能を提供する各種プラグインや、
`GPXCasualViewer` のインスタンスが提供するメソッドなどを用いて、
アプリケーションを完成させてください。

併せて `samples` ディレクトリにある各 HTML ファイルも参考にしてください。


## 例１

次の例は、プラグイン `Droppable` を利用しています。

ブラウザのウィンドウに GPX ファイルをドラッグ＆ドロップすることで、
その GPX のウェイポイントとトラックを、
マーカーとポリラインとしてオーバーレイするアプリケーションです。

また GPX が追加されたときのアクションとして、
そのすべての地点が地図内に収まるように画面をフィットさせ、
かつウェイポイントとトラックのすべてを表示するようにしています。

この例が示すように、入力した GPX はそのままではオーバーレイされませんが、
どのタイミングでも表示・非表示を行うことができます。
ここでは、入力と同時に表示させるようにしています。

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

この例は `samples/viewer-droppable.html` の内容全てを示しています。


## 例２

次の例は、ページに埋め込まれた GPX の URL をロードし、
その GPX のトラックのみを、ポリラインとしてオーバーレイするアプリケーションです。

このパターンは、
ウェブログなどの CMS において、テンプレートから生成されるページの汎用的な地図に、
GPX をパラメータとして与えたい場合に有用です。

またオーバーレイの表示のタイミングですが、これも GPX 追加時に行うようにしています。
しかしさきほどの例とは手法が異なっていることに注目してください。

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
  <h1>一般国道１号トレース</h1>
  <div class="map" id="R1" data-url="R1.gpx"></div>
  <h1>琵琶湖疏水ウォーキング</h1>
  <div class="map" id="sosui" data-url="Biwakososui.gpx"></div>
</body></html>
```

この例は `samples/viewer-xhr.html` の一部を省いたものです。


---

# API リファレンス

GPX Casual Viewer は現在も開発中のため、 API は予告なく変更されることがあります。

現在のバージョンは v2.2.x です。非互換の変更があるときは、少なくとも真ん中の数字が上がります。


## クラス GPXCasualViewer

ライブラリのコア。

基本的には、インスタンスに入力される GPX は内部のバッファに識別子（キー）と共に保持され、ライブラリおよびプラグインの様々な機能はそれら GPX を対象に適用されます。


### クラス・プロパティ

内部動作に影響を与えるグローバルな設定です。具体的な処理を行う前にセットすることが望ましいです。

クラス・プロパティ|型        | 説明
----------------|---------|------------------------------------------------------------
strict          | boolean | インスタンス・メソッド `addGPX` にて登録される GPX が正しい GPX であるかのチェックを厳密にします（完璧ではありません）。デフォルト `true` 。正しくない GPX と認識されたとき、 `addGPX` は例外を投げます。
join_trkseg     | boolean | トラックに含まれるすべてのトラックセグメントをマージして、一本のポリラインとします。デフォルト `true`

### クラス・メソッド

これらは汎用なユーティリティです。

`Object:src` は、URL を表す文字列か、 `Blob` のインスタンスです。

クラス・メソッド   | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
parseQueryString( String:str )| Hash | *str* をクエリ・ストリングとして解釈し、キー・値のペアをハッシュとして返します。
parseXML( String:str )       | document | *str* を XML としてパースし、 XML ドキュメント (DOM) として返します。
createXMLHttpRequest( ) | XMLHttpRequest | `XMLHttpRequest` のインスタンスを生成して返します。
resolveAsBlob( Object:src ) | Promise | *src* の実体を `Blob` として取得する `Promise` インスタンスを生成して返します。
resolveAsArrayBuffer( Object:src )| Promise | *src* の実体を `ArrayBuffer` として取得する `Promise` インスタンスを生成して返します。
resolveAsObjectURL( Object:src )| Promise | *src* の実体を `ObjectURL` として取得する `Promise` インスタンスを生成して返します。
resolveAsDataURL( Object:src )| Promise | *src* の実体を `DataURL` として取得する `Promise` インスタンスを生成して返します。
resolveAsText( Object:src, String?:encoding )| Promise | *src* の実体をテキストとして取得する `Promise` インスタンスを生成して返します。テキストのエンコーディングを示す encoding のデフォルトは "UTF-8" です。
GPXToJSON( Object:document ) | gpxType | XML ドキュメントを GPX として解釈し、それを JSON に変換したハッシュを返します。
boundsOf( Array:pts, Hash?:boundsType ) | boundsType | "wptType" のリスト *pts* を全て含む最小の境界の座標をハッシュで返します。オプションに *boundsType* を渡したとき、その境界を *pts* で拡張して返します。
createLatlngbounds( Hash:boundsType ) | GPXCasualViewer.LatLngBounds | *boundsType* を元にした `GPXCasualViewer.LatLngBounds` のインスタンスを生成して返します。
createOverlayAsWpt( Hash:wptType, Hash?:opt ) | GPXCasualViewer.Marker | ウェイポイントとしてオーバーレイを生成し、返します。
createOverlayAsWpt( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | 対称性のためのメソッドで、ウィエポイントをオーバーレイとして生成できない旨の例外を出します。
createOverlayAsRte( Hash:wptType, Hash?:opt ) | GPXCasualViewer.Marker | ルートとしてオーバーレイを生成し、返します。
createOverlayAsRte( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | ルートとしてオーバーレイを生成し、返します。
createOverlayAsTrk( Hash:wptType, Hash?:opt ) | GPXCasualViewer.Marker | トラックとしてオーバーレイを生成し、返します。
createOverlayAsTrk( Array:wptType, Hash?:opt ) | GPXCasualViewer.Polyline | トラックとしてオーバーレイを生成し、返します。

ノート：

`createOverlayAs...` メソッドは、 wptType を渡すとマーカーを、 wptType のリストを渡すとポリラインを生成して返します。
マーカーとポリラインは、上位概念であるオーバーレイとして同じインタフェースを持っているため、
`GPXCasualViewer` ではマーカーやポリラインを区別して生成することのないように設計しています。

しかしながら生成されたオーバーレイが、どの GPX 要素のものなのかを区別するためには、
オーバーレイ自身にその属性を持たせなければなりません。

そのため `GPXCasualViewer` で操作するマーカーやポリラインを生成するときは、
`google.maps` のコンストラクタを使わずに、これらのファクトリ・メソッドを使う必要があります。


### コンストラクタ

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
GPXCasualViewer( String:map_id, Hash?:opt ) | インスタンス化します。 *map_id* および *opt* は、内部で `google.maps.Map` のコンストラクタに渡され、地図が初期化されます。 `google.maps.Map` のドキュメントを参照してください。


### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
getMap( )         | google.maps.Map | `google.maps.Map` インスタンスを返します。
getMapElement( )  | node | 地図の描画領域の DOM 要素を返します。
getMapSettings( ) | Hash | 地図を初期化した際の設定を返します。（この内容を変更しても、地図には反映されません）
fitBounds( String?:key ) | this | 指定した *key* の GPX が画面に収まるように地図をフィットさせます。 複数の *key* を指定でき（配列ではなく、引数として足してください）、インスタンスに登録されているそれら GPX がすべて収まるようにします。 *key* を省略すると、すべての GPX を指定したことになります。（以下同様）
showOverlayWpts( String?:key ) | this | 指定した *key* の GPX のうち、ウェイポイントのオーバーレイについて表示させます。
hideOverlayWpts( String?:key ) | this | 指定した *key* の GPX のうち、ウェイポイントのオーバーレイについて非表示にします。
showOverlayRtes( String?:key ) | this | 指定した *key* の GPX のうち、ルートのオーバーレイについて表示させます。
hideOverlayRtes( String?:key ) | this | 指定した *key* の GPX のうち、ルートのオーバーレイについて非表示にします。
showOverlayTrks( String?:key ) | this | 指定した *key* の GPX のうち、トラックのオーバーレイについて表示させます。
hideOverlayTrks( String?:key ) | this | 指定した *key* の GPX のうち、トラックのオーバーレイについて非表示にします。
input( String:key, Object:src, String?:type ) | Promise | *src* の実体のデータをアプリケーションに入力します。 *type* を省略した場合、データのメディア・タイプが内部で暗黙のうちに判定され、適切な入力ハンドラにより処理されます。 GPX を `input` する場合はデフォルトの入力ハンドラが処理しますが、ほかのメディア・タイプのデータを入力する場合はあらかじめ専用の入力ハンドラが `registerInputHandler` によって登録されていなければなりません。
getGPX( String:key ) | gpxType | インスタンスに追加されている GPX の中から、指定した *key* を識別子とする GPX を返します。
eachGPX( Function:callback ) | this | インスタンスに追加した複数の GPX に対して *callback* の処理を実行します。コールバックは内部形式の GPX 一つずつに対して実行され、引数にはそのデータと、識別のためのキー（文字列）が渡されます。
getKeysOfGPX( ) | Array | インスタンスに追加されているすべての GPX の識別子のリストを返します。
addGPX( String:key, String:gpx ) | this | *gpx* に指定した、文字列の GPX を、キー *key* として登録します。すでに *key* のデータがある場合は上書きされます。
removeGPX( String:key ) | this | キー *key* として登録されている GPX を削除します。
use( String:PluginName ) | this | プラグイン *PluginName* を利用します。作用はプラグインによります。
register( String:hook, Function:callback ) | this | フックポイント *hook* に、 *callback* を登録します。
applyHook( String:hook, arguments ) | this | フックポイント *hook* に登録されている *callback* を `this` のメソッドとして実行します。 *arguments* はフックポイントごとに異なります。
registerInputHandler( GPXCasualViewer.InputHandler:handler ) | this | アプリケーションに入力ハンドラを登録します。デフォルトでは GPX を入力するためのハンドラが登録されています。ほかのメディア・タイプを処理するハンドラを登録する場合に利用します。もしそのメディア・タイプのハンドラがすでに登録されている場合は上書きされます。

### フック

幾つかの箇所にフック・ポイントが設けられています。それらに登録されたコールバックは、インスタンス・メソッドとして実行されます。
また、フックに対するコールバックの登録にはメソッド `register` を利用します。
ひとつのフックに複数のコールバックを登録することができます。その場合、実行される順序は登録順になります。

フック               | 説明
--------------------|--------------------------------
onCreateLatlngbounds| `GPXCasualViewer.LatLngBounds` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreateMarker      | `GPXCasualViewer.Marker` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreatePolyline    | `GPXCasualViewer.Polyline` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onAddGPX            | インスタンス・メソッド `addGPX(key, src)` により GPX が入力されたとき。 `addGPX` の第一引数である GPX の識別子 *key* がコールバックの引数になります。

これら以外にも、プラグインによって作成されるフック・ポイントがあります。


---

## クラス GPXCasualViewer.InputHandler

メディア・タイプに応じた入力処理を定義するクラスです。

GPX 以外のデータを扱いたい時、このクラスを用いて入力ハンドラを実装してください。

### コンストラクタ

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
GPXCasualViewer.InputHandler( String:type, Function?:handler ) | メディア・タイプ *type* のための入力ハンドラ *handler* を定義したオブジェクトを作成します。これを `GPXCasualViewer` のインスタンス・メソッド `registerInputHandler` に渡すことで利用できるようになります。 *handler* は省略可能ですが、その結果は、入力に対して何もしないことになります。

### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
setType( String:type ) | this | メディア・タイプをセットします
getType( String:type ) | String | セットされているメディア・タイプを取得します。
setHandler( Function:handler ) | this | ハンドラをセットします
getHandler( Function:handler ) | Function | セットされているハンドラを取得します。
execute( Object:bind, String:key, Object:src ) | Promise | ハンドラに *bind* オブジェクトをバインドして、引数 *key* と *src* を与えて実行しますが、返却値は成功時に *key* を返す `Promise` のインスタンスです。 *src* は URL を表す文字列か、 `Blob` のインスタンスで、ハンドラ実装者はどちらでも処理可能なように作成する必要があります（ `GPXCasualViewer.resolveAs...` の各クラス・メソッドを利用してください）。処理内容はハンドラ次第ですが、 GPX を処理するハンドラの場合はアプリケーションのインスタンスに GPX を追加します。


---

## クラス GPXCasualViewer.LatLngBounds

機能を拡張するために `google.maps.LatLngBounds` を継承したクラスです。

### Instance Methods

すべての `google.maps.LatLngBounds` クラスのインスタンス・メソッドが利用できます。
ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
----------------|--------------|------------
clone( ) | GPXCasualViewer.LatLngBounds | 自身と同じ内容を持った、新しいインスタンスを生成して返します。

---

## クラス GPXCasualViewer.Marker

機能を拡張するために `google.maps.Marker` を継承したクラスです。

ただし拡張部分については `GPXCasualViewer` のクラスメ・ソッド
`createOverlayAs...` メソッドによってインスタンスが作成された場合のみ有効です。

### インスタンス・メソッド

すべての `google.maps.Marker` クラスのインスタンス・メソッドが利用できます。
ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
overlayed( ) | boolean | 自身が地図にオーバーレイされていれば `true` です。
isWpt( ) | boolean | ウェイポイントとしてのマーカーであれば `true` です。
isRte( ) | boolean | ルートとしてのマーカーであれば `true` です。
isTrk( ) | boolean | トラックとしてのマーカーであれば `true` です。
getSource( ) | Hash | インスタンスを生成する際に与えらたパラメータを返します。

---

## クラス GPXCasualViewer.Polyline

機能を拡張するために `google.maps.Polyline` を継承したクラスです。

ただし拡張部分については `GPXCasualViewer` のクラスメ・ソッド
`createOverlayAs...` メソッドによってインスタンスが作成された場合のみ有効です。

### インスタンス・メソッド

すべての `google.maps.Polyline`クラスのインスタンス・メソッドが利用できます。
ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
overlayed( ) | boolean | 自身が地図にオーバーレイされていれば `true` です。
isWpt( ) | boolean | ウェイポイントとしてのポリラインであれば `true` です。
isRte( ) | boolean | ルートとしてのポリラインであれば `true` です。
isTrk( ) | boolean | トラックとしてのポリラインであれば `true` です。
getSource( ) | Hash | インスタンスを生成する際に与えらたパラメータを返します。
computeDistanceLinear( Integer:origin, Integer:destination )|Float|インデックス番号 *origin* と *destination* の地点間の、直線距離 [meters] を計算して返します。
computeDistanceTrack( Integer:origin, Integer:destination )|Float|インデックス番号 *origin* と *destination* の地点間の、道なりの距離 [meters] を計算して返します。


---

## プラグイン

クラス `GPXCasualViewer` に機能を追加する機構です。
通常は別の JavaScript ソース・ファイルにて提供されます。

使用するにはあらかじめ `script` タグでロードしておきます。

```
<script src="plugins/PluginName/loader.js"></script>
```

そしてインスタンス・メソッド `use` によって、利用します。

```
app.use('PluginName');
```

機能はプラグインごとに様々です。それぞれのプラグインを参照してください。

### コア・プラグイン

これらのプラグインはコア・ライブラリのソース内部に含まれており、 `script` タグで別途読み込む必要はありません。
また、インスタンス・メソッド `use` で利用を明示するまでもなくデフォルトで利用されるプラグインです。

#### GPXCasualViewer.plugin.SetTitleOnCreateMarker

このプラグインにより、マーカーにマウス・ポインタが乗ると、
その GPX 要素（通常はウェイポイント）の `name` の値をツール・チップスで表示します。

#### GPXCasualViewer.plugin.SetStrokeOptionOnCreatePolyline

このプラグインにより、ルート、およびトラックのポリラインのオプションを定義しています。
具体的には、ポリラインの色、幅、不透明度についてです。


## オブジェクト仕様 GPXCasualViewer.plugin

プラグインを作成するは、この規約に則ってください。
また `GPXCasualViewer.plugin.*PluginName*` も参照してください。

すべてのプラグインは同じディレクトリに配置してください。

また、プラグイン名は大文字で始まるキャメル・ケースの名前にし、
そのサブディレクトリに `loader.js` というファイル名で作成します。

`GPXCasualViewer` は、 `GPXCasualViewer.plugin` の名前空間に
プラグインの名前のプロパティを登録します。

小文字のプロパティは予約されています。


## オブジェクト仕様 GPXCasualViewer.plugin.*PluginName*

*PluginName* として登録されたプラグインは、その名前空間のうちに、予約されるプロパティがあります。
これらのプロパティになんらかの値をセットしたとき、そのプラグインの外部から影響を受ける場合があります。

これは実質的に、プラグインを作成するためのインタフェースです。

プロパティ   | タイプ  | 説明
------------|--------|------------------------------------------------------------
path        | string | プラグインのベースパスを設定するためのプロパティとして使用します。 `GPXCasualViewer` のインスタンス・メソッド `require_plugin` により自動的にセットされます。
callback | Function | `GPXCasualViewer` のインスタンスにこのプラグインを登録する際、プロパティ *hook* にセットされているフック・ポイントのタイミングで *callback* が実行されます。 *hook* が `false` となる値であれば、 `use` された時に実行されます。 *callback* は `GPXCasualViewer` のインスタンス・メソッドとして実行されます。また渡される引数はフック・ポイントによって異なります。
hook  | String:HookPoint | *callback* が実行されるフック・ポイントを指定します。指定がない時は `use` されたときになります。


# 参照

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# 著作権・ライセンス

    GPX Casual Viewer v3
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
