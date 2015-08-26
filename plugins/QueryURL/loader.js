MapsGPX.plugin.QueryURL = {
  callback: function(params) {
    var query = MapsGPX.parseQueryString(location.search);
    if ( query.url ) {
      this.input(query.url, query.url);
    }
  }
};
