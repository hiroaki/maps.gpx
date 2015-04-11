ディレクトリ samples の各ファイルについて

GPX Casual Viewer の使い方のサンプルとして
アプリケーション（ HTML ファイル）とデータとなる GPX ファイルが置いてあります。


R1.gpx
--------------------
日本橋（東京）から梅田新道（大阪）まで、国道１号を走った時のトラックです。
一部、国道から外れてしまっている箇所がありますがご了承ください。
ファイルは巨大なので、標高と時刻の情報は削ってあります。


Biwakososui.gpx
--------------------
琵琶湖疏水を歩いた時のトラックです。


viewer-droppable.html
--------------------
このファイルはローカルホストに置かれたものを、
ブラウザでロードされることを想定しています。
ウィンドウに GPX ファイルをドロップすると、
ウェイポイントとトラックをオーバーレイします。


viewer-input.html
--------------------
テキストエリアに GPX を入力して Apply ボタンをクリックすると、
そのウェイポイントとトラックをオーバーレイします。


viewer-xhr.html
--------------------
HTML 内 GPX ファイルの URL が記述してあり、
HTML のロードと共にそれらのウェイポイントとトラックをオーバーレイします。

このとき URL は XHR によって取得されようとしますが、
Chrome ブラウザでは、次の理由により、
ローカルファイル上の GPX を XHR では扱えません：

    Cross origin requests are only supported for protocol schemes:
    http, data, chrome, chrome-extension, https

HTML と GPX ファイルが、同じウェブサーバに置かれ、
HTTP 経由でそれらを見ることは、できます。

もしくは、ほかのブラウザ（たとえば Safari ）など制限の比較的ゆるいブラウザは、
ローカルファイル上のそれらを見ることができます。

もし Perl をお使いならば、モジュール Plack をインストールし、
このディレクトリの上のディレクトリに移動してから、
次のワンライナーを実行すれば、即席の HTTP サーバを起動させることができます：

    $ cd ..
    $ plackup -MPlack::App::Directory -e 'Plack::App::Directory->new->to_app'

そして、次のような URL にアクセスすることで
Chrome ブラウザでも見ることができます：

    http://127.0.0.1:5000/samples/viewer-xhr.html


Yatsugatake.jpg
--------------------
GPS 位置情報を持った JPEG ファイルのサンプルです。

