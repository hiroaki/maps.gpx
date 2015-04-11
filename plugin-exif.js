GPXCasualViewer.plugin.EXIF = {
  readByFile: function(file, callback) {
    EXIF.getData(file, callback);
  },
  readFromBinary: function(bin) {
    return EXIF.readFromBinaryFile(bin);
  }
};
