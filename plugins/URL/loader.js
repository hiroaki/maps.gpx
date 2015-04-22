GPXCasualViewer.plugin.URL = {
  separator: ';',
  parseQueryString: function(/* usually 'location.search' */qstring) {
    var params = {};
    if ( qstring ) {
      var str = qstring.match(/^\?/) ? qstring.substring(1) : qstring;
      var pairs = str.split(GPXCasualViewer.plugin.URL.separator);
      for (var i = 0, l = pairs.length; i < l; ++i) {
        var pair = pairs[i].split('=');
        if ( pair[0] ) {
          params[pair[0]] = decodeURIComponent(pair[1]);
        }
      }
    }
    return params;
  },
  handlerIncludeObjectFromURL: function (url){
    console.log('url=['+ url +']');
    if ( new RegExp('\.jpe?g$', 'i').test(url) ) {
      return this.promiseToReadEXIF(url, url);
    } else {
      return this.promiseToAddGPX(url, url);
    }
  },
  callback: function() {
    // if query-string has a param "url",
    // then add it on load
    var query = GPXCasualViewer.plugin.URL.parseQueryString(location.search);
    if ( query.url ) {
      GPXCasualViewer.plugin.URL.handlerIncludeObjectFromURL.bind(this)(query.url);
    }
  }
};
