MapsGPX.plugin.QueryURL = {
  callback: function() {
    var query = MapsGPX.parseQueryString(location.search);
    if ( query.url ) {
      this.input(query.url, query.url);
    }
  }
};
