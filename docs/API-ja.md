# API リファレンス

maps.gpx は現在も開発中のため、 API は予告なく変更される場合があります。

このリファレンスはバージョン v4.x のものです。


## クラス MapsGPX

ライブラリのコア。


### クラス・プロパティ

内部動作に影響を与えるグローバルな設定です。具体的な処理を行う前にセットし、その後変更しないことが望ましいです。

クラス・プロパティ|型        | 説明
----------------|---------|------------------------------------------------------------
strict          | boolean | インスタンス・メソッド `addGPX` にて登録される GPX が正しい GPX であるかのチェックを厳密にします（現在は完璧ではありません）。デフォルト `true` 。正しくない GPX と認識されたとき、 `addGPX` は例外を投げます。
join_trkseg     | boolean | トラックに含まれるすべてのトラック・セグメントをマージして、一本のポリラインとします。デフォルト `true`
cache_script    | boolean | 内部でロードするライブラリをブラウザがキャッシュできるようにします（必ずキャッシュするとは限りません）。デフォルト `true` ですが、開発中は `false` をセットしておくと良いでしょう。
basedir         | String  | このライブラリの置かれているディレクトリ。（読み出し専用。値をセットしないようにしてください。）
plugin_dir      | String  | プラグインを置くためのディレクトリ・パス。デフォルトは `basedir` の下の `plugins` ですが、フォルダを他の場所に移した場合は、この値を更新してください。
script_loader   | String  | プラグインが自動でロードする JavaScript ファイル名。すべてのプラグインでこの名前を使用します。デフォルト `loader.js`
style_loader    | String  | プラグインが自動でロードする CSS ファイル名。すべてのプラグインでこの名前を使用します。デフォルト `loader.css`


### クラス・メソッド

これらは汎用なユーティリティです。

記述中 `src:Object` は、URL を表す文字列か、 `Blob` のインスタンスを示します。

クラス・メソッド   | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
isSafari( ) | boolean | 実行している環境の navigator.userAgent から、それが Safari のものであれば `true` を返します。
merge( obj?:Hash ) | Hash | 第一引数に、以降すべての引数（それらは Hash ）をマージした Hash を返します。このマージは "浅い" です。
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
createOverlayAsWpt( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | 対称性のためだけに存在するメソッドで、実際は用をなさず、ウェイポイントをオーバーレイとして生成できない旨の例外を出します。
createOverlayAsRte( wptType:Hash, opt?:Hash ) | MapsGPX.Marker | ルートとしてオーバーレイを生成し、返します。
createOverlayAsRte( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | ルートとしてオーバーレイを生成し、返します。
createOverlayAsTrk( wptType:Hash, opt?:Hash ) | MapsGPX.Marker | トラックとしてオーバーレイを生成し、返します。
createOverlayAsTrk( wptType:Array, opt?:Hash ) | MapsGPX.Polyline | トラックとしてオーバーレイを生成し、返します。
load_script( src:String ) | Promise | 外部の JavaScript ソースファイルをロードし、ロードが完了したときに resolve する Promise を返します。
load_css( src:String ) | Promise | 外部の CSS ファイルをロードし、ロードが完了したときに resolve する Promise を返します。
require_plugin( PluginName:String ) | Promise | プラグイン *PluginName* をロードし、ロードが完了したときに resolve する Promise を返します。
require_plugins( PluginName:String [, PluginName:String, ...] ) | Promise | 引数にリストされる複数のプラグイン *PluginName* をロードし、すべてのプラグインのロードが完了したときに resolve する Promise を返します。引数の順番にプラグインのロードが行われ、ひとつのロードが完了してから次のプラグインのロードが始まります。
onReady( callback:Function ) | undefined | `MapsGPX` クラスが利用可能になった時に実行する *callback* を登録します。 `MapsGPX` のインスタンス化はこの *callback* の中で行ってください。

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

記述中 `src:Object` は、URL を表す文字列か、 `Blob` のインスタンスを示します。

インスタンス・メソッド  | 戻り値   | 説明
-----------------|--------|------------------------------------------------------------
getMap( )         | google.maps.Map | `google.maps.Map` インスタンスを返します。
getMapElement( )  | node | 地図の描画領域の DOM 要素を返します。
getMapSettings( ) | Hash | 地図を初期化した際の設定を返します。（読み取り専用。この内容を変更しても、地図には反映されません）
fitBounds( key?:String ) | this | *key* で指定される GPX が画面に収まるように地図をフィットさせます。 複数の *key* を指定でき（配列ではなく、引数として足していってください）、インスタンスに登録されているそれら GPX がすべて収まるようにします。 *key* を省略すると、すべての GPX を指定したことになります。（以下同様）
showOverlayWpts( key?:String ) | this | *key* で指定される GPX のうち、ウェイポイントのオーバーレイについて表示させます。
hideOverlayWpts( key?:String ) | this | *key* で指定される GPX のうち、ウェイポイントのオーバーレイについて非表示にします。
showOverlayRtes( key?:String ) | this | *key* で指定される GPX のうち、ルートのオーバーレイについて表示させます。
hideOverlayRtes( key?:String ) | this | *key* で指定される GPX のうち、ルートのオーバーレイについて非表示にします。
showOverlayTrks( key?:String ) | this | *key* で指定される GPX のうち、トラックのオーバーレイについて表示させます。
hideOverlayTrks( key?:String ) | this | *key* で指定される GPX のうち、トラックのオーバーレイについて非表示にします。
showOverlayGpxs( key?:String ) | this | *key* で指定される GPX について表示させます。
hideOverlayGpxs( key?:String ) | this | *key* で指定される GPX について非表示にします。
registerInputHandler( handler:MapsGPX.InputHandler ) | this | アプリケーションに入力ハンドラを登録します。デフォルトでは GPX を入力するためのハンドラが登録されています。ほかのメディア・タイプを処理するハンドラを登録する場合に利用します。もしそのメディア・タイプのハンドラがすでに登録されている場合は上書きされます。
input( key:String, src:Object, type?:String ) | Promise | *src* の実体のデータをアプリケーションに入力します。 *type* を省略した場合、データのメディア・タイプが自動的に判定され、適切な入力ハンドラにより処理されます。 GPX を `input` する場合はデフォルトの入力ハンドラが処理しますが、ほかのメディア・タイプのデータを入力する場合はあらかじめ専用の入力ハンドラが `registerInputHandler` によって登録されていなければなりません。
getGPX( key:String ) | gpxType | インスタンスに追加されている GPX の中から、指定した *key* を識別子とする GPX を返します。
eachGPX( callback:Function ) | this | インスタンスに追加した複数の GPX に対して *callback* の処理を実行します。コールバックは内部形式の GPX 一つずつに対して実行され、引数にはそのデータと、識別のためのキー（文字列）が渡されます。
getKeysOfGPX( ) | Array of String | インスタンスに追加されているすべての GPX の識別子のリストを返します。
addGPX( key:String, gpx:String ) | this | *gpx* に指定した、文字列の GPX を、キー *key* として登録します。すでに *key* のデータがある場合は上書きされます。
removeGPX( key:String ) | this | キー *key* として登録されている GPX をインスタンスから削除します。
use( PluginName:String, params?:Hash ) | this | プラグイン *PluginName* の利用を開始します。これはプラグインの `callback` を実行することです。その際、引数に *params* をそのまま渡します。その作用は使用するプラグインによります。 `use` する前には、事前にプラグインが `require_plugins` などでロードされていなければなりません。
extend( PluginName:String, params?:Hash ) | this | プラグイン *PluginName* をロードするとともに、その利用を「予約」します。 `require_plugin` と `use` が一体化したものに似ていますが、 `extended` によって実際にロードと実行が行われます。 `extended` を呼ぶまではいくつも予約を追加でき、追加した順番が保証されます。 `params` はプラグインの *callback* にそのまま渡されます。
extended( callback:Function ) | this | 事前に `extend` しているすべてのプラグインをロードしたあと、順番に `use` メソッドにより各プラグインを実行します。そしてすべてのプラグインの実行が完了した後に `callback` を実行します。 `callback` はこのインスタンスのコンテキストで実行され、引数はありません。また、これまでに `extend` した情報はクリアされます。
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
onAddGPX            | インスタンス・メソッド `addGPX(key, src)` により GPX が入力された時。 `addGPX` の第一引数である GPX の識別子 *key* がコールバックの引数になります。
onShowMarker        | `showOverlay...` によって `MapsGPX.Marker` のオーバーレイが表示された時。そのオーバーレイのインスタンスがコールバックの引数になります。
onHideMarker        | `hideOverlay...` によって `MapsGPX.Marker` のオーバーレイが非表示された時。そのオーバーレイのインスタンスがコールバックの引数になります。
onShowPolyline      | `showOverlay...` によって `MapsGPX.Polyline` のオーバーレイが表示された時。そのオーバーレイのインスタンスがコールバックの引数になります。
onHidePolyline      | `hideOverlay...` によって `MapsGPX.Polyline` のオーバーレイが非表示された時。そのオーバーレイのインスタンスがコールバックの引数になります。


これら以外にも、プラグインによって作成されるフック・ポイントがあります。


---

## クラス MapsGPX.InputHandler

メディア・タイプに応じた入力処理を定義するクラスです。

GPX データ（メディア・タイプ "application/gpx" ）のハンドラは `MapsGPX.defaultInputHandlerApplicationGPX` によってデフォルトで登録されています。

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

### インスタンス・メソッド

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

そのため、まずは `MapsGPX` のインスタンス・メソッド `require_plugin` または `require_plugins` で
そのプラグインが必要とするソースを読み込まなければなりません。

そして `use` メソッドによって、その利用を開始します。

ただしこれは原始的な方法です：

```
app.require_plugins('PluginName')
app.use('PluginName');
```

通常は、 `extend` および `extended` による方法を用いてください：

```
app.extend('PluginName').extended(function() { ... })
```

`extend` は、利用するプラグイン名をキューに追加します。その時点ではソースファイルのロードも、実行もされません。
幾つかのプラグインをキューに追加することができます：

```
app.extend('Foo');
app.extend('Bar');
app.extend('Baz');
app.extended(function(){
  ...
});
```

`extended` が呼ばれてはじめてロードと実行が行われます。そのとき、キューに追加した順番が守られます。

そして重要なことは、すべてのプラグインのロードが完了した後に、 `extended` のコールバックが実行されるという点です。

プラグインに依存するコードを書こうとする時は、プラグインのロードが完了したうえでなければなりません。
したがって `extended` のコールバックに、アプリケーションの本体を書くことになるでしょう。


### コア・プラグイン

これらのプラグインはコア・ライブラリのソース内部に含まれており、別途準備する必要はありません。
なんら明示するまでもなく、機能するプラグインです。

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
path        | String | プラグインのベースパスを設定するためのプロパティとして使用します。 `MapsGPX` のインスタンス・メソッド `require_plugin` により自動的にセットされます。
bundles     | Array of String | このプラグインが必要とする、ほかの JavaScript ファイルまたは CSS ファイルをリストします。リスト項目となるファイル名はパスを除いたベース名で、それらは `loader.js` と同じディレクトリに配置しなければなりません。
callback | Function | `use` された時に `MapsGPX` のインスタンス・メソッドとして実行されます。 *callback* には `MapsGPX` のインスタンス・メソッド `use` または `extend` の、第二引数がそのまま渡されます。

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
