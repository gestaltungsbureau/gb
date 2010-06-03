var gb = {
  version: '0.0.1',
  language: 'de-DE',
  initialize: function() {
    MooTools.lang.setLanguage(this.language);
    'ui utils application'.split(' ').each(function(module) { this[module] = {}; }.bind(this));
  }
};

gb.initialize();
