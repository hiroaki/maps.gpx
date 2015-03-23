(function (){

  function create_xml_http_request(){
    try{
      if( typeof ActiveXObject != 'undefined' ){
        return new ActiveXObject('Microsoft.XMLHTTP');
      }else if( window["XMLHttpRequest"] ){
        return new XMLHttpRequest();
      }
    }catch(e){
      throw( new Error("Cannot create XmlHttpRequest object.") );
    }
    return null;
  }

  function read_gpx_text_from_url(url){
    var xhr = create_xml_http_request();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  }

  GPXCasualViewer.plugin.url = {
    separator: ';',
    parse_query_string: function (/* usually 'location.search' */qstring){
      var params = {};
      if( qstring ){
        var str = qstring.match(/^\?/) ? qstring.substring(1) : qstring
        var pairs = str.split(GPXCasualViewer.plugin.url.separator);
        for(var i=0, l=pairs.length; i<l; ++i){
          var pair = pairs[i].split('=');
          if( pair[0] ){
            params[pair[0]] = decodeURIComponent(pair[1]);
          }
        }
      }
      return params;
    },
    callback: function (){
      var query = GPXCasualViewer.plugin.url.parse_query_string(location.search);
      if( query.url ){
        this.add_gpx(query.url, read_gpx_text_from_url(query.url));
        this.fit_bounds(query.url);
        this.show_overlay_wpts(query.url);
        this.show_overlay_rtes(query.url);
        this.show_overlay_trks(query.url);
      }
    }
  }
})();
