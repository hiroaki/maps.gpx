# maps.gpx

Google Maps JavaScript API で GPX を扱うためのライブラリ、およびそれを用いた HTML5 アプリケーションです。
次のニーズに応じます：

* GPX を扱う地図を使う
* GPX を扱う地図を作る


## 使う

`viewer.html` は GPS 位置情報のポピュラーなデータフォーマットである GPX データを、地図上に表示する手軽なビューワーです。

HTML5 をサポートするモダンなブラウザで `viewer.html` を開き、地図上に GPX ファイルをドラッグ＆ドロップしてください。

デモ・ページで実際に使ってみることができます。

[http://hiroaki.github.io/projects/mapsgpx/viewer.html](http://hiroaki.github.io/projects/mapsgpx/viewer.html)

### 主な特徴

* すべてクライアント・サイドだけで動作します。（モダンなブラウザ上で）
* `viewer.html` をブラウザで開くだけで準備完了。
* データファイルをドラッグ＆ドロップで入力。その際、複数のファイルを、同時に。
* GPX データの表示のオフ・オン。
* 標高グラフ表示。
* GPS センサーによる現在位置の表示。
* モバイル対応。レスポンシブ。画面サイズ（＝地図サイズ）は自在です。

### 入力データ

* GPX ファイル
* EXIF に位置情報を持った JPEG 画像ファイル
* （将来はほかのデータ形式も扱えるようにしたい考えです）

JPEG は位置情報を持っていなくとも撮影日時の情報を持っていれば、先行して入力した GPX データのトラックの日時情報から、画像の撮影位置を特定することができます。

### その他の情報

また紹介記事をブログに書きましたので、参考にしてください。（この記事ではタイトルが旧プロジェクト名の "GPX Casual Viewer v3" となっています）

[http://hiroaki.github.io/blog/2015/0429/gpx-casual-viewer-v3/](http://hiroaki.github.io/blog/2015/0429/gpx-casual-viewer-v3/)

[http://hiroaki.github.io/blog/2015/0721/maps-dot-gpx-a-dot-k-a-gpx-casual-viewer/](http://hiroaki.github.io/blog/2015/0721/maps-dot-gpx-a-dot-k-a-gpx-casual-viewer/)


## 作る

このプロジェクト maps.gpx の要は Google Maps JavaScript API v3 を用いた JavaScript ライブラリ `maps-gpx.js` です。

地図上に位置情報データを操作するための様々な機能を提供するもので、プログラミングをなるべくしなくても済むように、プラグインの形で機能を拡張していくスタイルで、注意深く設計されています。

もちろん、プログラミング要望に応じられるように API を用意しており、各機能を（プラグインに依らずに）直接操作することもできます。

上述した `viewer.html` は `maps-gpx.js` を用いたアプリケーションの例のひとつにすぎません。（ほかの例が `samples` ディレクトリにあります。）

以下はその主要 JavaScript ライブラリ `maps-gpx.js` の説明です。 `docs` ディレクトリ内には API リファレンスがありますので、併せて参照してください。


### 使い方

まず最初に Google Maps API をロードします。その際、 `geometry` ライブラリを使うように指定します。

メモ：以前は "sensor" パラメータが必須とされていましたが、いまはもう不要です。

それから `maps-gpx.js` をロードします。これにより、クラス `MapsGPX` が定義されます。

```
<script src="http://maps.google.com/maps/api/js?libraries=geometry">
</script>
<script src="maps-gpx.js">
</script>
```

一般のウェブ・アプリケーションと同じく、 HTML ドキュメントのロードが完了することを待ってから、
アプリケーションを開始させることは理にかなっています。

そのために、 `MapsGPX` のクラス・メソッド `onReady` を利用してください。
これは document の `load` イベントを待ってから、コードを実行することを保証します。

```
MapsGPX.onReady(function (){
  // ここにアプリケーションのロジックを書きます。
});
```

`MapsGPX` のコンストラクタには Google Maps API の `google.maps.Map` クラスの、
インスタンス化に必要なパラメータと同じものを渡すことができます。

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

それぞれ、インスタンス・メソッドが用意されています。

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
その File オブジェクトをメソッド `input` に渡すことを可能にするものです。

プラグイン `QueryURL` は、ページの URL に付加されたクエリ・ストリングのパラメータ 'url' の値である URL を
メソッド `input` に渡すものです。

プラグインを利用可能にするには、 `MapsGPX` のインスタンスを `extend` （拡張）し、
かつ `extended` （拡張が完了）したときのコールバックを登録します。

```
app.extend('Droppable');
app.extend('QueryURL');
app.extended(function() {
  // ...
})
```

`extend` にプラグインの名前を渡すと、そのプラグインが必要とする追加の JavaScript ファイル（および CSS ファイルがあればそれも）がロードされます。

そして `extended` は、それまでに `extend` したプラグインのすべての準備が完了したあとに、
コールバックが実行されることを保証します。

言い換えると、 document の `load` がトリガーされても、プラグインの機能は、まだ準備できていない可能性があります。
したがって、全体的には次のようになるでしょう：

```
MapsGPX.onReady(function() {
  // ここは document の load 完了時
  new MapsGPX('map_canvas')
    .extend('Droppable')
    .extend('QueryURL')
    .extended(function() {
      // すべてのプラグインの準備が完了したここに、
      // アプリケーションのロジックを書きます。
    });
});
```

以下にいくつかの例を示します。併せて `samples` ディレクトリにある各 HTML ファイルも参考にしてください。

そして様々な機能を提供する各種プラグインを組み合わせたり、
`MapsGPX` のインスタンスが提供するメソッドなどを用いて、アプリケーションを完成させてください。

API ドキュメントは `docs` ディレクトリにあります。


### 例１

次の例は、プラグイン `Droppable` を利用しています。

ブラウザのウィンドウに GPX ファイルをドラッグ＆ドロップすることで、
その GPX データをマーカーとポリラインとしてオーバーレイするアプリケーションです。

また GPX が追加されたときのアクションとして、
そのすべての地点が地図内に収まるように画面をフィットさせます。

```
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx</title>
<style>
html, body, #map_canvas { width: 100%; height: 100%; margin: 0px; padding: 0px; }
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?libraries=geometry"></script>
<script src="../maps-gpx.js"></script>
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

この例は `samples` ディレクトリの `viewer-droppable.html` の内容全てを示しています。
ブラウザで開き、実際に試してみてください。

この例が示すように、入力した GPX は追加しただけではオーバーレイされませんが、
どのタイミングでも表示・非表示を行うことができます。
ここでは `onAddGPX` フックを利用して、入力と同時に表示させるようにしています。

フックのコールバックに渡される `key` は、 GPX データを識別するためのユニークなキーです。
メソッド `fitBounds` や `showOverlayGpxs` のその引数には、対象の GPX データのキーを指示することができます。


### 例２

次の例は、ページに埋め込まれた GPX の URL をロードし、
その GPX のウェイポイントとトラックを、
マーカーとポリラインとしてオーバーレイするアプリケーションです。

このパターンは、
ウェブログなどの CMS において、テンプレートから生成されるページの汎用的な地図に、
GPX をパラメータとして与えたい場合に有用です。

```
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>maps.gpx</title>
<style>
div.map { width:640px; height:320px; }
img.info-window { max-width: 200px; max-height: 200px; }
</style>
<script src="http://maps.google.com/maps/api/js?libraries=geometry"></script>
<script src="../maps-gpx.js"></script>
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

この例は `samples` ディレクトリの `viewer-xhr.html` の一部を省いたものです。

プラグインは用いず、 `MapsGPX` クラスのインスタンスの `input` メソッドとそのコールバックで、 GPX データを地図上に表示します。

またオーバーレイの表示のタイミングですが、これも GPX 追加時に行うようにしています。
しかしさきほどの例とは手法が異なっていることに注目してください。

それから、この例にはもうひとつ特徴があります。それは、ページ内には地図のインスタンスを複数持てるということです。
インスタンスは互いに独立していますので、それぞれの部分を別々に操作することができます。

#### 注意

HTML ファイルをブラウザで直接開いて実行している場合、プロトコル・スキームが `file` であるため、 Google Chrome では "Cross origin requests" の例外が発生し、期待通りの結果を得ることができません。

ただ、ウェブログなどの CMS でのコンテンツの配信は、ウェブ・サーバ経由すなわちプロトコル・スキームが `http` または `https` となりますから、その場合は期待通りの結果を得ることができるでしょう。


# 参照

GPX 1.1 Schema Documentation
<http://www.topografix.com/gpx/1/1/>

Google Maps JavaScript API v3
<https://developers.google.com/maps/documentation/javascript/>


# 著作権・ライセンス

    maps.gpx
      Copyright 2009-2015 WATANABE Hiroaki
      Released under the MIT license
