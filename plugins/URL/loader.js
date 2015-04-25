GPXCasualViewer.plugin.URL = {
  callback: function() {
    var query = GPXCasualViewer.parseQueryString(location.search);
    if ( query.url ) {
      this.input(query.url, query.url);
    }
  }
};
