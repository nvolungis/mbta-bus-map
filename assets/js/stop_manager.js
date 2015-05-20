(function(){
  function StopManager(mapbox_L, icon){
    this.route_endpoint = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=mbta&r=87";
    this.bus_points     = {};
    this.stops          = {};
    this.mapbox_L       = mapbox_L;
    this.icon           = icon;
    this.prediction_manager = new PredictionManager();
  }

  $.extend(StopManager.prototype, $.eventEmitter, {
    init: function(){
      this.bind();
      this.get_route_directions();  
    },

    bind: function(){
      this.prediction_manager.on('turn:on',  this.turn_on.bind(this));
      this.prediction_manager.on('turn:off', this.turn_off.bind(this));

      this.on('ready', function(){
        this.prediction_manager.update_stops(this.stops);
        this.prediction_manager.start();
      }.bind(this));
    },

    turn_on: function(e, stop_id){
      this.trigger('turn:stop:on', this.stops[stop_id].marker);
    },

    turn_off: function(e, stop_id){
      this.trigger('turn:stop:off', this.stops[stop_id].marker);
    },

    get_route_directions: function(){
      $.ajax({
        url: this.route_endpoint, 
        type: "GET",
        dataType: 'xml',
        success: this.on_route_data_received.bind(this)
      });
    },

    on_route_data_received: function(xml){
      $(xml).find("direction").each(function(i,direction){
        this.store_stops(direction, xml);
      }.bind(this));

      this.trigger('ready', this.stops);
    },

    store_stops: function(direction, xml){
      var $direction = $(direction),
          direction_name = $direction.attr('name'),
          $xml = $(xml),
          dont_record = false;

      if(direction_name == 'Inbound'){
        dont_record = false;
      }

      $direction.find('stop').each(function(i, stop){
        var id = $(stop).attr('tag'),
            stop = $xml.find("[tag=" + id + "]")[0],
            $stop = $(stop),
            lat = $stop.attr('lat'),
            lon = $stop.attr('lon');

        if(!dont_record){
          this.stops[id] = { 
            lat: lat, lon: lon, direction: direction_name,
            marker: this.mapbox_L.marker([lat, lon])
          };

          this.stops[id].marker.setIcon(L.mapbox.marker.icon({
            'marker-size': 'large',
            'marker-symbol': 'marker-stroked',
            'marker-color': '#3ca0d3'
          }));
        }

        if(direction_name == 'Inbound'){
          if(id == 02594) dont_record = true;
        }else {
          if(id == 12616) dont_record = true;
        }
      }.bind(this));
    },
  });

  window.StopManager = StopManager;
}());
