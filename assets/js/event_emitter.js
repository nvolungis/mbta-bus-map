(function($){
  $.eventEmitter = $.eventEmitter || {
    _JQInit: function() {
      this._JQ = $(this);
    },

    trigger: function(evt, data) {
      !this._JQ && this._JQInit();
      this._JQ.trigger(evt, data);
    },

    on: function(evt, handler) {
      !this._JQ && this._JQInit();
      this._JQ.bind(evt, handler);
    },

    off: function(evt, handler) {
      !this._JQ && this._JQInit();
      this._JQ.unbind(evt, handler);
    }
  };
}(jQuery));
