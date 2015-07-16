# maps.gpx

maps.gpx は Google Maps の地図上に位置情報データ（ GPX 形式）を簡単にオーバーレイ（視覚化）するための HTML5 アプリケーションです。

機能を提供する汎用の JavaScript ライブラリ `maps-gpx.js` が、このプロジェクトの主要部分になります。

そして用途に応じて、その機能を組み合わせた HTML ファイルが、アプリケーションとなります。
同梱される `viewer.html` はアプリケーションの例のひとつです。
ほかの例は `samples` ディレクトリにあります。

以下はその主要 JavaScript ライブラリ `maps-gpx.js` の説明です。


## 使い方

まず最初に Google Maps API をロードします。その際、 `geometry` ライブラリを使うように指定します。

GPS センサーが必要な機能を用いる場合は `sensor` に `true` を指定します。

それから `maps-gpx.js` をロードします。これにより、クラス `MapsGPX` が定義されます。

```
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry">
</script>
<script src="maps-gpx.js">
</script>
```

一般の HTML アプリケーションと同じく、ドキュメントのロードが完了することを待ってから、
アプリケーションを開始させることは理にかなっています。

そのために、クラス・メソッド `onReady` を利用してください。
これは document の `load` イベントを待つとともに、
後述するプラグインのすべての準備が完了したあとに、コールバックが実行されることを保証します。
言い換えると、 document の `load` がトリガーされても、機能の幾つかはまだ準備できていない可能性があります。

```
MapsGPX.onReady(function (){
  // ここにアプリケーションのロジックを書きます。
});
```

コンストラクタには Google Maps API の `google.maps.Map` クラスの
インスタンス化に必要なパラメータと同じものを渡します。

必須の最初の引数は、地図の描画領域である要素（ `div` タグ）の ID です。

省略可能な第二の引数はハッシュ形式で、そのまま `google.maps.Map` をインスタンス化する際の[オプション](https://developers.google.com/maps/documentation/javascript/reference?hl=ja#MapOptions)になります。
省略された場合は `MapsGPX` が定義しているデフォルト値が使われます。

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

これで、地図の準備ができました。この地図に GPX データを与え、オーバーレイしましょう。

GPX を与えるとき、そのソースには次の形があります：

* GPX のテキスト・データを直接
* GPX をバイナリ・オブジェクト経由で（ Blob または File オブジェクト）
* URL 経由で

それぞれメソッドが用意されています。

* `addGPX`
* `input`

メソッド `addGPX` は GPX の内容のテキストを受け取る、最も低レベルの入力メソッドです。

それに対して高レベルの入力メソッド `input` は、Blob と URL の双方をカバーしており、
そのオブジェクトが示す GPX の内容をメソッド `addGPX` に渡します。

ユーザ・インタフェースの部分はアプリケーション実装者に任せられますが、
JavaScript コードを書く代わりに、別ファイルで用意されているプラグインを利用することもできます。

* `Droppable`
* `QueryURL`

プラグイン `Droppable` は、 GPX ファイルを地図描画領域にドラッグ＆ドロップすることで、
その File オブジェクトをメソッド `input` に渡すものです。

プラグイン `QueryURL` は、クエリストリングのパラメータ 'url' の値である URL を
メソッド `input` に渡すものです。

プラグインを利用可能にするには、 `MapsGPX` のインスタンス・メソッド `use` にその名前を与えます。

```
app.use('Droppable');
app.use('QueryURL');
```

具体的には、以下に述べるいくつかの例を参考にしてください。
また併せて `samples` ディレクトリにある各 HTML ファイルも参考にしてください。

そして様々な機能を提供する各種プラグインや、
`MapsGPX` のインスタンスが提供するメソッドなどを用いて、
アプリケーションを完成させてください。


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
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx
<style>
html, body, #map_canvas { width: 100%; height: 100%; margin: 0px; padding: 0px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"></script>
<script src="../maps-gpx.js"></script>
<script>
MapsGPX.onReady(function (){
  new MapsGPX('map_canvas')
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

この例は `samples` ディレクトリの `viewer-droppable.html` の内容全てを示しています。


## 例２

次の例は、ページに埋め込まれた GPX の URL をロードし、
その GPX のウェイポイントとトラックを、
マーカーとポリラインとしてオーバーレイするアプリケーションです。

このパターンは、
ウェブログなどの CMS において、テンプレートから生成されるページの汎用的な地図に、
GPX をパラメータとして与えたい場合に有用です。

またオーバーレイの表示のタイミングですが、これも GPX 追加時に行うようにしています。
しかしさきほどの例とは手法が異なっていることに注目してください。

```
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx
<style>
div.map { width:640px; height:320px; }
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"></script>
<script src="../maps-gpx.js"></script>
<script>
MapsGPX.onReady(function (){
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

この例は `samples` ディレクトリの `viewer-xhr.html` の一部を省いたものです。


---

# API リファレンス

maps.gpx は現在も開発中のため、 API は予告なく変更される場合があります。


## クラス MapsGPX

ライブラリのコア。

なおインスタンスは、入力された GPX データを保持します。
固有の GPX データを参照するための識別子（キー）は、入力時に GPX データとともに指定することになっています。
ライブラリおよびプラグインの様々な機能はそれら GPX を対象に適用されます。

### クラス・プロパティ

内部動作に影響を与えるグローバルな設定です。具体的な処理を行う前にセットし、その後変更しないことが望ましいです。

クラス・プロパティ|型        | 説明
----------------|---------|------------------------------------------------------------
strict          | boolean | インスタンス・メソッド `addGPX` にて登録される GPX が正しい GPX であるかのチェックを厳密にします（現在は完璧ではありません）。デフォルト `true` 。正しくない GPX と認識されたとき、 `addGPX` は例外を投げます。
join_trkseg     | boolean | トラックに含まれるすべてのトラックセグメントをマージして、一本のポリラインとします。デフォルト `true`
basedir         | String  | このライブラリの置かれているディレクトリ。（値をセットしないようにしてください。）
plugin_dir      | String  | プラグインを置くためのディレクトリ。 `basedir` の下の `plugins` ですが、フォルダを他の場所に移した場合は、この値を更新してください。

### クラス・メソッド

これらは汎用なユーティリティです。

記述中 `src:Object` は、URL を表す文字列か、 `Blob` のインスタンスを示します。

クラス・メソッド   | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
parseQueryString( str:String )| Hash | *str* をクエリ・ストリングとして解釈し、キー・値のペアをハッシュとして返します。
parseXML( str:String )       | document | *str* を XML としてパースし、 XML ドキュメント (DOM) として返します。
createXMLHttpRequest( ) | XMLHttpRequest | `XMLHttpRequest` のインスタンスを生成して返します。
resolveAsBlob( src:Object ) | Promise | *src* の実体を `Blob` として取得する `Promise` インスタンスを生成して返します。
resolveAsArrayBuffer( src:Object )| Promise | *src* の実体を `ArrayBuffer` として取得する `Promise` インスタンスを生成して返します。
resolveAsObjectURL( src:Object )| Promise | *src* の実体を `ObjectURL` として取得する `Promise` インスタンスを生成して返します。
resolveAsDataURL( src:Object )| Promise | *src* の実体を `DataURL` として取得する `Promise` インスタンスを生成して返します。
resolveAsText( src:Object, encoding?:String )| Promise | *src* の実体をテキストとして取得する `Promise` インスタンスを生成して返します。テキストのエンコーディングを示す encoding のデフォルトは "UTF-8" です。
GPXToJSON( document:Object ) | gpxType | XML ドキュメントを GPX として解釈し、それを JSON に変換したハッシュを返します。
boundsOf( pts:Array, boundsType?:Hash ) | boundsType | "wptType" のリスト *pts* を全て含む最小の境界の座標をハッシュで返します。オプションに *boundsType* を渡したとき、その境界を *pts* で拡張して返します。
createLatlngbounds( boundsType?:Hash ) | MapsGPX.LatLngBounds | *boundsType* を元にした `MapsGPX.LatLngBounds` のインスタンスを生成して返します。
createOverlayAsWpt( wptType:Hash, opt?:Hash ) | MapsGPX.Marker | ウェイポイントとしてオーバーレイを生成し、返します。
createOverlayAsWpt( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | 対称性のためのメソッドで、ウィエポイントをオーバーレイとして生成できない旨の例外を出します。
createOverlayAsRte( wptType:Hash, opt?:Hash ) | MapsGPX.Marker | ルートとしてオーバーレイを生成し、返します。
createOverlayAsRte( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | ルートとしてオーバーレイを生成し、返します。
createOverlayAsTrk( wptType:Hash, opt?:Hash ) | MapsGPX.Marker | トラックとしてオーバーレイを生成し、返します。
createOverlayAsTrk( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | トラックとしてオーバーレイを生成し、返します。
load_script( src:String ) | Promise | 外部の JavaScript ソースファイルをロードし、ロードが完了したときに resolve する Promise を返します。
load_css( src:String ) | Promise | 外部の CSS ファイルをロードし、ロードが完了したときに resolve する Promise を返します。
require_plugin( PluginName:String ) | Promise | プラグイン *PluginName* をロードし、ロードが完了したときに resolve する Promise を返します。
require_plugins( PluginName:String [, PluginName:String, ...] ) | Promise | 引数にリストされる複数のプラグイン *PluginName* をロードし、すべてのプラグインのロードが完了したときに resolve する Promise を返します。引数の順番にプラグインのロードが行われ、ひとつのロードが完了してから次のプラグインのロードが始まります。
onReady( callback:Function ) | undefined | `MapsGPX` が利用可能になった時に実行する *callback* を登録します。 *callback* はすべてのプラグインのソースのロードが完了した後に呼び出されます。

ノート：

`createOverlayAs...` メソッドは、 wptType を渡すとマーカーを、 wptType のリストを渡すとポリラインを生成して返します。
マーカーとポリラインは、上位概念であるオーバーレイとして同じインタフェースを持っているため、
`MapsGPX` ではマーカーやポリラインを区別して生成することのないように設計しています。

しかしながら生成されたオーバーレイが、どの GPX 要素のものなのかを区別するためには、
オーバーレイ自身にその属性を持たせなければなりません。

そのため `MapsGPX` で操作するマーカーやポリラインを生成するときは、
`google.maps` のコンストラクタを使わずに、これらのファクトリ・メソッドを使う必要があります。


### コンストラクタ

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
MapsGPX( map_id:String, map_option?:Hash, app_option?:Hash ) | インスタンス化します。 *map_id* および *map_option* は、内部で `google.maps.Map` のコンストラクタに渡され、地図が初期化されます。 `google.maps.Map` のドキュメントを参照してください。 *app_option* は、その他のインスタンスの設定情報を渡します（が、現在のバージョンでは何も効果がありません）。


### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
getMap( )         | google.maps.Map | `google.maps.Map` インスタンスを返します。
getMapElement( )  | node | 地図の描画領域の DOM 要素を返します。
getMapSettings( ) | Hash | 地図を初期化した際の設定を返します。（この内容を変更しても、地図には反映されません）
fitBounds( key?:String ) | this | *key* で指定される GPX が画面に収まるように地図をフィットさせます。 複数の *key* を指定でき（配列ではなく、引数として足していってください）、インスタンスに登録されているそれら GPX がすべて収まるようにします。 *key* を省略すると、すべての GPX を指定したことになります。（以下同様）
showOverlayWpts( key?:String ) | this | *key* で指定される GPX のうち、ウェイポイントのオーバーレイについて表示させます。
hideOverlayWpts( key?:String ) | this | *key* で指定される GPX のうち、ウェイポイントのオーバーレイについて非表示にします。
showOverlayRtes( key?:String ) | this | *key* で指定される GPX のうち、ルートのオーバーレイについて表示させます。
hideOverlayRtes( key?:String ) | this | *key* で指定される GPX のうち、ルートのオーバーレイについて非表示にします。
showOverlayTrks( key?:String ) | this | *key* で指定される GPX のうち、トラックのオーバーレイについて表示させます。
hideOverlayTrks( key?:String ) | this | *key* で指定される GPX のうち、トラックのオーバーレイについて非表示にします。
registerInputHandler( handler:MapsGPX.InputHandler ) | this | アプリケーションに入力ハンドラを登録します。デフォルトでは GPX を入力するためのハンドラが登録されています。ほかのメディア・タイプを処理するハンドラを登録する場合に利用します。もしそのメディア・タイプのハンドラがすでに登録されている場合は上書きされます。
input( key:String, src:Object, type?:String ) | Promise | *src* の実体のデータをアプリケーションに入力します。 *type* を省略した場合、データのメディア・タイプが自動的に判定され、適切な入力ハンドラにより処理されます。 GPX を `input` する場合はデフォルトの入力ハンドラが処理しますが、ほかのメディア・タイプのデータを入力する場合はあらかじめ専用の入力ハンドラが `registerInputHandler` によって登録されていなければなりません。
getGPX( key:String ) | gpxType | インスタンスに追加されている GPX の中から、指定した *key* を識別子とする GPX を返します。
eachGPX( callback:Function ) | this | インスタンスに追加した複数の GPX に対して *callback* の処理を実行します。コールバックは内部形式の GPX 一つずつに対して実行され、引数にはそのデータと、識別のためのキー（文字列）が渡されます。
getKeysOfGPX( ) | Array of String | インスタンスに追加されているすべての GPX の識別子のリストを返します。
addGPX( key:String, gpx:String ) | this | *gpx* に指定した、文字列の GPX を、キー *key* として登録します。すでに *key* のデータがある場合は上書きされます。
removeGPX( key:String ) | this | キー *key* として登録されている GPX をインスタンスから削除します。
use( PluginName:String ) | this | プラグイン *PluginName* の利用を開始します。その作用は使用するプラグインによります。
register( hook:String, callback:Function ) | this | フックポイント *hook* に、 *callback* を登録します。
applyHook( hook:String, arguments ) | this | フックポイント *hook* に登録されている *callback* を `this` のメソッドとして実行します。 *arguments* はフックポイントごとに異なります。

### フック

幾つかの箇所にフック・ポイントが設けられています。それらに登録されたコールバックは、インスタンス・メソッドとして実行されます。
また、フックに対するコールバックの登録にはメソッド `register` を利用します。
ひとつのフックに複数のコールバックを登録することができます。その場合、実行される順序は登録順になります。

フック               | 説明
--------------------|--------------------------------
onCreateLatlngbounds| `MapsGPX.LatLngBounds` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreateMarker      | `MapsGPX.Marker` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onCreatePolyline    | `MapsGPX.Polyline` が生成された時。生成されたオブジェクトがコールバックの引数になります。
onAddGPX            | インスタンス・メソッド `addGPX(key, src)` により GPX が入力されたとき。 `addGPX` の第一引数である GPX の識別子 *key* がコールバックの引数になります。

これら以外にも、プラグインによって作成されるフック・ポイントがあります。


---

## クラス MapsGPX.InputHandler

メディア・タイプに応じた入力処理を定義するクラスです。

GPX 以外のデータを扱いたい時に、このクラスのインスタンス用いて入力ハンドラを実装します。

### コンストラクタ

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
MapsGPX.InputHandler( type:String, handler?:Function ) | メディア・タイプ *type* のための入力ハンドラ *handler* を定義したオブジェクトを作成します。これを `MapsGPX` のインスタンス・メソッド `registerInputHandler` に渡すことで利用できるようになります。 *handler* は省略可能ですが、その結果は、入力に対して何もしないことになります。

### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
setType( type:String ) | this | メディア・タイプをセットします
getType( type:String ) | String | セットされているメディア・タイプを取得します。
setHandler( handler:Function ) | this | ハンドラをセットします
getHandler( handler:Function ) | Function | セットされているハンドラを取得します。
execute( bind:Object, key:String, src:Object ) | Promise | ハンドラに *bind* オブジェクトをバインドして、引数 *key* と *src* を与えて実行しますが、返却値は成功時に *key* を返す `Promise` のインスタンスです。 *src* は URL を表す文字列か、 `Blob` のインスタンスで、ハンドラ実装者はどちらでも処理可能なように作成する必要があります（ `MapsGPX.resolveAs...` の各クラス・メソッドを利用してください）。処理内容はハンドラ次第ですが、 GPX を処理するハンドラの場合はアプリケーションのインスタンスに GPX を追加します。


---

## クラス MapsGPX.MapControl

コントロールを作成するためのクラスです。

コンストラクタ  | 説明
-----------------|-------------------------------------------------------------
MapsGPX.MapControl( icons:Hash, opts?:Hash ) | ボタン型のコントロールを作成します。 *icons* にはアイコン画像の識別子とその URL のペアを持つハッシュを受け取ります。これは、たとえばクリックすることによって変化するアイコンを実装しようとする場合に対するものです。 `changeIcon` メソッドを参照してください。

### インスタンス・メソッド

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
getElement( ) | node | コントロールの要素を返します。
isCurrentIcon( key:String ) | boolean | コントロールの状態が、アイコン識別子 *key* であるとき `true` を返します。
getMap( ) | google.maps.Map | コントロールが置かれている `google.maps.Map` インスタンスを返します。
setMap( map:Map ) | None | 指定された *map* にコントロールを配置します。 `null` を指定することで、地図からコントロールを取り除きます。
changeIcon( key:String ) | this | コントロールの状態を、指定したアイコン識別子 *key* とします。同時にアイコンをそのものに変更します。

---

## クラス MapsGPX.LatLngBounds

機能を拡張するために `google.maps.LatLngBounds` を継承したクラスです。

### Instance Methods

すべての `google.maps.LatLngBounds` クラスのインスタンス・メソッドが利用できます。
ここでは、追加されたメソッドについて説明します。

インスタンス・メソッド  | 戻り値   | 説明
----------------|--------------|------------
clone( ) | MapsGPX.LatLngBounds | 自身と同じ内容を持った、新しいインスタンスを生成して返します。

---

## クラス MapsGPX.Marker

機能を拡張するために `google.maps.Marker` を継承したクラスです。

ただし拡張部分については `MapsGPX` のクラスメ・ソッド
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

## クラス MapsGPX.Polyline

機能を拡張するために `google.maps.Polyline` を継承したクラスです。

ただし拡張部分については `MapsGPX` のクラスメ・ソッド
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

クラス `MapsGPX` に機能を追加する機構です。
通常は別の JavaScript ソース・ファイルにて提供されます。

`MapsGPX` のインスタンス・メソッド `use` によって、その利用を開始します。

```
app.use('PluginName');
```

機能はプラグインごとに様々です。それぞれのプラグインを参照してください。

### コア・プラグイン

これらのプラグインはコア・ライブラリのソース内部に含まれており、 `script` タグで別途読み込む必要はありません。
また、インスタンス・メソッド `use` で利用を明示するまでもなくデフォルトで利用されるプラグインです。

#### MapsGPX.plugin.SetTitleOnCreateMarker

このプラグインにより、マーカーにマウス・ポインタが乗ると、
その GPX 要素（通常はウェイポイント）の `name` の値をツール・チップスで表示します。

#### MapsGPX.plugin.SetStrokeOptionOnCreatePolyline

このプラグインにより、ルート、およびトラックのポリラインのオプションを定義しています。
具体的には、ポリラインの色、幅、不透明度についてです。


## オブジェクト仕様 MapsGPX.plugin

プラグインを作成するは、この規約に則ってください。
また各 `MapsGPX.plugin.*PluginName*` も参照してください。

すべてのプラグインは同じディレクトリに配置してください。

また、プラグイン名は大文字で始まるキャメル・ケースの名前にし、
そのサブディレクトリに `loader.js` というファイル名で作成します。

`MapsGPX` は、 `MapsGPX.plugin` の名前空間に
プラグインの名前のプロパティを登録します。

小文字のプロパティは予約されています。


## オブジェクト仕様 MapsGPX.plugin.*PluginName*

*PluginName* として登録されたプラグインは、その名前空間のうちに、予約されるプロパティがあります。
これらのプロパティになんらかの値をセットしたとき、そのプラグインの外部から影響を受ける場合があります。

これは実質的に、プラグインを作成するためのインタフェースです。

プロパティ   | タイプ  | 説明
------------|--------|------------------------------------------------------------
path        | string | プラグインのベースパスを設定するためのプロパティとして使用します。 `MapsGPX` のインスタンス・メソッド `require_plugin` により自動的にセットされます。
callback | Function | `MapsGPX` のインスタンスにこのプラグインを登録する際、プロパティ *hook* にセットされているフック・ポイントのタイミングで *callback* が実行されます。 *hook* が `false` となる値であれば、 `use` された時に実行されます。 *callback* は `MapsGPX` のインスタンス・メソッドとして実行されます。また渡される引数はフック・ポイントによって異なります。
hook  | String | *callback* が実行されるフック・ポイントを指定します。指定がない時は `use` されたときになります。

プラグインは基本的に `MapsGPX` のインスタンスごとに使用を宣言します（全インスタンスで共有されるプラグインもあり得ます）。
各プラグインが、インスタンスにデータを保持したい場合は、インスタンスが持っている「コンテキスト」を利用することができます。
コンテキストは `this.context` プロパティにハッシュとしてあります。そのキーにプラグイン名をもってアクセスしてください。

例えば、プラグイン `VertexInfoWindow` では次のように *data* をコンテキストにセットします：

```
this.context['VertexInfoWindow'] = data;
```

# 参照

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# 著作権・ライセンス

    maps.gpx
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
