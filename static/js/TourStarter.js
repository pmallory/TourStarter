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

    var bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    drawRoute();

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

function drawRoute() {
    /* Draw an ACA route on the map based on its GPX */
    $.ajax({
        type: "GET",
        url: "static/routes/UR.gpx",
        datatype: "xml",
        success: function(xml) {
            var points = []
            $(xml).find("wpt").each(function() {
                var lat = $(this).attr('lat');
                var lon = $(this).attr('lon');
                var point = new google.maps.LatLng(lat, lon);
                points.push(point);
            });

            var polyline = new google.maps.Polyline({
                path: points,
                strokeColor: '#19A600',
                strokeOpacity: 0.7,
                strokeWeight: 3
            });

            polyline.setMap(map);
        }
    });
}
