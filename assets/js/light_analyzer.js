(function(){
  function LightAnalyzer(){
    this.trip_analyzers = {};
  }

  $.extend(LightAnalyzer.prototype, $.eventEmitter, {
    analyze_trips: function(predictions){
      var trip_id, touched = [];

      for(trip_id in predictions){
        if(!this.trip_analyzers[trip_id]){
          this.trip_analyzers[trip_id] = new TripAnalyzer(trip_id);
          this.trip_analyzers[trip_id].on('turn:on',   this.on_turn_on.bind(this));
          this.trip_analyzers[trip_id].on('turn:off', this.on_turn_off.bind(this));
        }
        
        this.trip_analyzers[trip_id].update(predictions[trip_id]);
        touched.push(trip_id);
      }

      for(trip_id in this.trip_analyzers){
        if($.inArray(trip_id, touched) == -1){
          this.trip_analyzers[trip_id].destroy();
          delete this.trip_analyzers[trip_id];
        }
      }
    },

    on_turn_on: function(e, stop_id){
      this.trigger('turn:on', stop_id);  
    },

    on_turn_off: function(e, stop_id){
      this.trigger('turn:off', stop_id);
    }
  });


  function TripAnalyzer(){
    this.trip_id; 
    this.stop_id = null;
  }

  $.extend(TripAnalyzer.prototype, $.eventEmitter, {
    update: function(predictions){
      var new_stop_id = this.get_shortest_prediction(predictions);

      if(new_stop_id){
        if(this.stop_id != new_stop_id){
          if(this.stop_id != null){
            this.trigger('turn:off', this.stop_id);
          }

          this.trigger('turn:on', new_stop_id);
          this.stop_id = new_stop_id;
        }
      }
    },

    destroy: function(){
      this.trigger('turn:off', this.stop_id);
    },

    get_shortest_prediction: function(trip){
      var stop_id, 
          prediction, 
          shortest_key,
          shortest_id,
          keys = [], 
          indexed_on_predictions = {};

      for(stop_id in trip){
        indexed_on_predictions[trip[stop_id]] = stop_id;
      }

      for(prediction in indexed_on_predictions){
        keys.push(prediction);
      }

      keys.sort(function(a, b){
        return parseInt(b) - parseInt(a);
      });  

      shortest_key = keys.pop();
      shortest_id  = indexed_on_predictions[shortest_key];

      return shortest_key < (60) ? shortest_id : null;
    }
  });


  window.LightAnalyzer = LightAnalyzer;
}());
