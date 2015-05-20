(function(){
  function PredictionManager(){
    this.endpoint_base = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictionsForMultiStops&a=mbta";
    this.endpoint = this.endpoint_base;
    this.predictions = {};
    this.currently_on = [];
    this.bind();
  }

  $.extend(PredictionManager.prototype, $.eventEmitter, {
    start: function(){
      setInterval(this.fetch_new_prediction_data.bind(this), 4000);
    },

    bind: function(){
      this.on('stops:updated', this.on_stops_updated.bind(this));
      this.on('new:prediction:data', this.on_new_prediction_data.bind(this));
    },

    update_stops: function(stops){
      this.stops = stops;
      this.trigger('stops:updated');
    },

    on_stops_updated: function(){
      this.update_endpoint();
    },

    update_endpoint: function(){
      var endpoint = this.endpoint_base, id;

      for(id in this.stops){
        endpoint += "&stops=87|" + id;
      }

      this.endpoint = endpoint;
    },

    fetch_new_prediction_data: function(){
      var endpoint = this.endpoint;
      $.ajax({
        url: endpoint,
        type: 'GET',
        dataType: 'xml',
        success: this.on_prediction_data_fetched.bind(this)
      });
    },

    on_prediction_data_fetched: function(data){
      var $stops = $(data).find("predictions"),
          new_predictions = {},
          all_secs = [];

      $stops.each(function(i, stop){
        var $stop = $(stop),
            id = $stop.attr('stopTag'),
            $prediction = $($stop.find('prediction')[0]),
            trip_id, seconds;

        if($prediction.length != 0){
          trip_id = $prediction.attr('tripTag'),
          seconds = $prediction.attr('seconds');
          if(!new_predictions[trip_id]) new_predictions[trip_id] = {};

          new_predictions[trip_id][id] = seconds;
          all_secs.push(seconds);
        }
      }.bind(this));

      this.trigger('new:prediction:data', new_predictions);
    },

    on_new_prediction_data: function(e, new_predictions){
      var analyzer = new PredictionAnalyzer(this.currently_on, new_predictions);   


      this.trigger('turn:off', {ids: analyzer.to_turn_off});
      this.trigger('turn:on',  {ids: analyzer.to_turn_on});
      this.currently_on = analyzer.should_be_on;
    }
  });

  window.PredictionManager = PredictionManager;
}());
