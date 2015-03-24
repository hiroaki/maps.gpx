GPXCasualViewer.plugin.URL = {
  separator: ';',
  readGPXTextFromURL: function (url) {
    var xhr = GPXCasualViewer.plugin.URL.createXMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  },
  createXMLHttpRequest: function() {
    try {
      if ( typeof ActiveXObject != 'undefined' ) {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } else if ( window['XMLHttpRequest'] ) {
        return new XMLHttpRequest();
      }
    } catch(e) {
      throw( new Error('Cannot create XmlHttpRequest object.') );
    }
    return null;
  },
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
  callback: function() {
    var query = GPXCasualViewer.plugin.URL.parseQueryString(location.search);
    if ( query.url ) {
      console.log('url=['+ query.url +']');
      this.addGPX(query.url, GPXCasualViewer.plugin.URL.readGPXTextFromURL(query.url));
    }
  }
};
