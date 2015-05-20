(function(){
  function PredictionAnalyzer(currently_on, predictions){
    this.currently_on = this.normalize_currently_on(currently_on, predictions);
    this.should_be_on = {};
    this.to_turn_off = [];
    this.to_turn_on = [];

    this.find_what_should_be_on(predictions);
    this.find_changes();
  }

  $.extend(PredictionAnalyzer.prototype, $.eventEmitter, {
    find_what_should_be_on: function(predictions){
      var trip_id, stop_id; 

      for(trip_id in predictions){
        stop_id = this.get_shortest_prediction(predictions[trip_id]);

        if(stop_id){
          this.add_to_should_be_on(trip_id, stop_id)
        }
      }
    },

    add_to_should_be_on: function(trip_id, stop_id){
      if(!this.should_be_on[trip_id]) this.should_be_on[trip_id] = [];
      this.should_be_on[trip_id].push(stop_id);
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

      return shortest_key < 60 ? shortest_id : false;
    },

    find_changes: function(){
      var trip_id;

      for(trip_id in this.should_be_on){
        this.should_be_on[trip_id].forEach(function(stop_id){
          if($.inArray(stop_id, this.currently_on[trip_id]) == -1){
            this.to_turn_on.push(stop_id);
          }
        }.bind(this));
      }

      for(trip_id in this.should_be_on){
        this.currently_on[trip_id].forEach(function(stop_id){
          if($.inArray(stop_id, this.should_be_on[trip_id]) == -1 && this.should_be_on[trip_id].length > 0){
            this.to_turn_off.push(stop_id);
          }
        }.bind(this));
      }
    },

    normalize_currently_on: function(currently_on, predictions){
      var trip_id; 

      for(trip_id in predictions){
        if(!currently_on[trip_id]){
          currently_on[trip_id] = [];
        }
      }

      return currently_on;
    }
  });

  window.PredictionAnalyzer = PredictionAnalyzer;
}());
