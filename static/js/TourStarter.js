var map;

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize() {
    $('#calculate').click(calcRoute);

    var rendererOptions = { draggable: true };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    var mapOptions = {
        center: new google.maps.LatLng(39.300299, -100.722656),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("text_panel"));
}

function calcRoute() {
    geocoder = new google.maps.Geocoder();

    var address = $("input[name='address']").val();
    geocoder.geocode({'address': address+' , US', 'region': 'us'}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var origin = results[0].geometry.location;

            $.getJSON($SCRIPT_ROOT + '/_nearest_waypoint', {
                lat: origin.lat(),
                lon: origin.lng(),
                route: 'TODO'
            }, function(data) {
                if (data.status == 'sucess') {
                    route_lat = data.result.lat;
                    route_lon = data.result.lon;

                    var destination = new google.maps.LatLng(route_lat, route_lon);

                    var request = {
                       origin: origin,
                       destination: destination,
                       travelMode: google.maps.TravelMode.BICYCLING
                    };

                    directionsService.route(request, function(result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(result);
                        } else {
                            alert("Error calculating directions.");
                        }
                    });
                } else {
                    // failed to hit the nearest_waypoint controller
                    alert('this is embarrasing');                             }
            });
        } else {
            alert("There was an error interpreting your input.");
        }
    });
}
