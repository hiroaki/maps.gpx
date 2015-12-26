# MapsGPX.plugin.Exporter

プラグイン `Exporter` は、現在の `MapsGPX` のインスタンスが保持している GPX オブジェクトを ZIP アーカイブにまとめて、エクスポートします。
エクスポートのアクションは、このプラグインによって地図上に置かれることになるマップ・コントロールをクリックすることで起動します。

エクスポート先には、デスクトップへのダウンロード、または指定した URL へのアップロードを指示できます。
これらはプラグイン・パラメータ `destinations` にて細かく指示します。

その際、地図に表示されていない GPX の要素（ウェイポイント、ルートおよびトラック）は取り除かれます。
すべての GPX の要素が非表示ならば、その GPX については ZIP アーカイブには含まれません。

プラグイン `DescImage` を利用している場合は、エクスポートされる ZIP アーカイブには、 `MapsGPX` に入力した JPEG 画像がそのまま含まれます。


## プラグイン・パラメータ

プラグイン `Exporter` を `use` （または `extend` ）する際に渡すことができるパラメータは次のとおりです：

| name | type | description |
|------|------|-------------|
| destinations | Array | 後述の DestinationOption オブジェクトのリスト。 DestinationOption はひとつのエクスポート先を指示するものです |

パラメータを省略した場合は、次の値がデフォルトでセットされます：

```
[{ direction: "DOWNLOAD" }]
```

これは、デスクトップへのエクスポートを指定するものです。


### destinations

プラグインに渡すパラメータ `destinations` は、エクスポート先を定義する DestinationOption オブジェクトの配列です。

配列の要素ごとにエクスポートします。二つの DestinationOption オブジェクトを指定していれば、それぞれのエクスポート先に同じデータをエクスポートします。
マップ・コントロールがその数だけ並ぶことになり、それぞれのマップ・コントロールが独立してクリック・イベントを待ち受けます。

```  
app = new MapsGPX("map-canvas");
app.use("Exporter",{
  destinations: [
    {
      direction: 'download',
      onLoad: function(v, control) {
        console.log("Exported a zip file to your desktop!");
      }
    },
    {
      direction: 'upload',
      url: 'http://...',
      uploadOnLoad: function(evt, control) {
        console.log("Exported a zip file to the URL!");
      },
      onLoad: function(evt, control) {
        console.log("evt has a response message");
      }
    }
  ]});
```

## オブジェクト仕様 DestinationOption

エクスポート先を表現する DestinationOption はコンストラクタを持たないオブジェクト・リテラルです。

DestinationOption にはエクスポート先を大別する二つの種類、すなわち "DOWNLOAD" と "UPLOAD" があります。
それぞれの種類でとりうるプロパティは同一のラインナップがありますが、
実質的に無用なプロパティ（たとえば、 "DOWNLOAD" におけるプロパティ `url` ）は単に使われません。

また、すべての DestinationOption に共通する値を持つための "GLOBAL" があります。
これはいわゆるデフォルト設定のための DestinationOption です。
たとえば、 "GLOBAL" においてプロパティ `folder` の値が "maps-gpx" であった場合、
"DOWNLOAD" および "UPLOAD" におけるプロパティ `folder` が未設定であれば、それは "maps-gpx" が用いられます。

これら種類 "DOWNLOAD" "UPLOAD" および "GLOBAL" は DestinationOption のプロパティ `direction` にて指示します。

次の表は各プロパティの説明です。その中でコールバック関数に渡されるパラメータのうち、第一引数の evt は ProgressEvent オブジェクト、第二引数の control は MapsGPX.MapControl のインスタンスです（このインスタンスは `Exporter` 専用の拡張がされています）。（注意：コールバック関数の `this` は仕様が未確定です。）

| name | type | description |
|------|------|-------------|
| direction | String | "DOWNLOAD", "UPLOAD" または "GLOBAL" （大文字・小文字は区別されません） |
| folder | String | すべての GPX はフォルダにまとめられ、そのフォルダが ZIP アーカイブされることになります。そのフォルダ名を指定します。 |
| icon | String or URL | マップ・コントロールのアイコンの URL です。ファイル名だけの場合はプラグイン `Exporter` のディレクトリにあるものとします |
| iconDownload | String or URL | `icon` が未指定の時のデフォルトのアイコン（ダウンロード用）。 `direction` が "GLOBAL" で指定するものです |
| iconUpload | String or URL | `icon` が未指定の時のデフォルトのアイコン（アップロード用）。 `direction` が "GLOBAL" で指定するものです |
| method | String | アップロード時のリクエスト・メソッド。デフォルトは "POST" |
| paramName | String | アップロード時のパラメータ名。デフォルトは "files[]" |
| url | URL | アップロード先 URL 。デフォルトは `null` |
| onProgress | function(evt, control) | アップロード時の、レスポンス中の `onprogress` コールバック |
| onLoad | function(evt, control) | エクスポートが完了した際に呼ばれるコールバック。 `direction` が "DOWNLAOD" の際は evt には常に `null` が渡されます |
| onError | function(evt, control) | アップロード時の、レスポンス中の `onerror` コールバック |
| onAbort | function(evt, control) | アップロード時の、レスポンス中の `onabort` コールバック |
| uploadOnProgress | function(evt, control) | アップロード時の、アップロード中の `onprogress` コールバック |
| uploadOnLoad | function(evt, control) | アップロード時の、アップロードの `onload` コールバック |
| uploadOnError | function(evt, control) | アップロード時の、アップロードの `onerror` コールバック |
| uploadOnAbort | function(evt, control) | アップロード時の、アップロードの `onabort` コールバック |
| validator | function(zip) | バリデーションのためのコールバック。バリデーションについては後述します |
| onInvalid | function(err, control) | バリデーション・エラー時に呼ばれます。 err は `throw` された `Error` オブジェクトです |

`direction` が "DOWNLOAD" である、すなわちデスクトップへエクスポートさせるときの、 DestinationOption の有効なプロパティは次のものです：

* folder
* icon
* onLoad
* validator
* onInvalid

`direction` が "UPLOAD" である、すなわちデスクトップへエクスポートさせるときの、 DestinationOption の有効なプロパティは次のものです：

* folder
* icon
* method
* url
* paramName
* onProgress
* onLoad
* onError
* onAbort
* uploadOnProgress
* uploadOnLoad
* uploadOnError
* uploadOnAbort
* validator
* onInvalid

`direction` が "GLOBAL" である DestinationOption **だけ** に有効なプロパティは次のものです：

* iconDownload
* iconUpload


## バリデーション

エクスポートが始まる直前に、ファイルをチェックするためのコールバックを仕掛けることができます。

バリデータのコールバックには、 JSZip ライブラリによる `ZipObject` が渡されます。
このオブジェクトに、 GPX がアーカイブされています。

その ZIP アーカイブ内の各ファイルにアクセスし、それが妥当なものであるか否かを、バリデータでチェックしてください。
ZIP 内のファイルへのアクセスのためには、 JSZip のドキュメントを参照してください。

ZipObject - https://stuk.github.io/jszip/documentation/api_zipobject.html

バリデーションが不要ならば、コールバックには何も書く必要はありません。

しかしもし、それを不正なデータとみなしたならば、クラス `Error` のインスタンスを `throw` してください。
その場合はエクスポートは行われません。
そして、同時に `destinations` パラメータに指定しているコールバック `onInvalid` が呼ばれます。

次のコードは、 ZIP アーカイブにファイルが含まれていない場合に、不正とみなすためのバリデータの例です。
ついでに、もし何かファイルが含まれていたならば、その名前とサイズをコンソールにプリントします。

```
var validator = function(zip) {
  var include_file = false, key;

  for ( key in zip.files ) {
    if ( ! zip.files[key].dir ) {
      include_file = true;
      break;
    }
  }
  if ( ! include_file ) {
    throw(new Error("no file"));
  }

  for ( key in zip.files ) {
    if ( ! zip.files[key].dir ) {
      console.log(zip.files[key].name +': '+ zip.files[key].asBinary().length +' bytes');
    }
  }
};
```

## Safari についての注意

Safari （現時点ではバージョン 9.0.2 ） における "DOWNLOAD" の結果としてダウンロードされるファイルは、ファイル名が "Unknown" となります。
これは Safari の制約によるものですが、そのファイルは ZIP データです。

ファイル名に、拡張子 ".zip" を追加して "Unknown.zip" とすることで、ファインダーはそれが ZIP アーカイブであることを認識するでしょう。
展開すると、 DestinationOption のプロパティ `folder` にて指定したフォルダに展開されます。

またダウンロード時には JavaScript エラーがコンソールに記録されますが、このエラーは無視して構いません。


# クレジット

プラグイン `Exporter` パッケージでは以下のとおり、オープン・ソース・プロジェクトの成果を利用、バンドルしています。なおプラグイン `Exporter` 自体のクレジットはプロジェクト `maps.gpx` に準じます。

## ic_file_download_black_48dp.png, ic_file_upload_black_48dp.png

Material Design Icons are the official open-source icons featured in the Google "Material Design" (http://www.google.com/design/spec) specification.

All icons are released under an "Attribution-ShareAlike 4.0 International" (http://creativecommons.org/licenses/by-sa/4.0/) license.


## jszip.js

Create, read and edit .zip files with Javascript http://stuartk.com/jszip

Copyright (c) 2009-2014 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

Released under the MIT license - http://opensource.org/licenses/mit-license.php


## progressbar.js

Responsive and slick progress bars https://kimmobrunfeldt.github.io/progressbar.js

Copyright (c) 2015 Kimmo Brunfeldt

Released under the MIT license - http://opensource.org/licenses/mit-license.php
