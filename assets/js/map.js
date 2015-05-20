(function(){
  function Map(){
    this.stop_manager = new StopManager(L);
    this.bind();
    this.vehicle_endpoint     = "http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=mbta&r=87&t=0";


    this.map;
    this.bus_points = {};
    this.init(); 
  }

  $.extend(Map.prototype, {
    init: function(){
      this.embed_map();
      this.stop_manager.init();
    },

    bind: function(){
      this.stop_manager.on('ready', this.plot_stops.bind(this));
      this.stop_manager.on('turn:stop:on', this.turn_on.bind(this));
      this.stop_manager.on('turn:stop:off', this.turn_off.bind(this));
    },

    embed_map: function(){
      L.mapbox.accessToken = "pk.eyJ1IjoiaG9sbHljb3BlbGFuZCIsImEiOiJTNHZkX0NjIn0.BhIWDVr3Bww5ZQATLYsjSw";
      this.map = L.mapbox.map('map', 'mapbox.streets').setView([42.3821249,-71.1024254], 14);
    },

    refresh_bus_data: function(){
      $.ajax({
        url: this.vehicle_endpoint, 
        type: "GET",
        dataType: 'xml',
        success: this.on_new_bus_data.bind(this)
      });
    },

    on_new_bus_data: function(xml){
      var $vehicles = $(xml).find('vehicle'),
          points_with_data = [], found = false,
          points_to_remove = [];

      $vehicles.each(function(i, el){
        var data = this.extract_data($(el));
        this.plot_point(data);
        points_with_data.push(data.id);
      }.bind(this));

      for(var i in this.bus_points) {
        if($.inArray(i, points_with_data) == -1){
          points_to_remove.push(i); 
        }
      }

      this.remove_old_points(points_to_remove);
    },

    plot_stops: function(e, stops){
      var i;

      for(i in stops){
        stops[i].marker.addTo(this.map);
      }
    },

    turn_on: function(e, marker){
      marker.setIcon(L.mapbox.marker.icon({
        'marker-size': 'large',
        'marker-symbol': 'bus',
        'marker-color': '#c01111'
      }));

      marker.update();
    },

    turn_off: function(e, marker){
      console.log('turn off', marker);

      marker.setIcon(L.mapbox.marker.icon({
        'marker-size': 'large',
        'marker-symbol': 'marker-stroked',
        'marker-color': '#3ca0d3'
      }));

      marker.update();
    },

    remove_old_points: function(points){
      points.forEach(function(point){
        delete this.bus_points(this.bus_points.indexOf(point));
      }.bind(this));
    },

    extract_data: function($vehicle){
      var lat = $vehicle.attr('lat'),
          lon = $vehicle.attr('lon'),
          dir = $vehicle.attr('dirTag'),
          id  = $vehicle.attr('id');

      return { lat: lat, lon: lon, dir: dir, id: id };
    },

    plot_point: function(point){
      var point,latlng;
        
      if(this.bus_points[point.id]){
        cur_point = this.bus_points[point.id];
        latlng    = L.latLng(point.lat, point.lon);
        cur_point.setLatLng(latlng);
        cur_point.update();
      }else{
        this.bus_points[point.id] = L.marker([point.lat, point.lon], {icon: this.icon});
        this.bus_points[point.id].addTo(this.map);
      }
    }
  });

  window.Map = Map;
}());
