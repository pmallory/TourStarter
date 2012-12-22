var map;

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var routeLayers = {}

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

    // TODO should be relative to $SCRIPTROOT
    var overlay = new google.maps.KmlLayer('http://rocky-citadel-8652.herokuapp.com/static/overlays/ACA_network.kml');
    overlay.setMap(map);

    var selectedRouteOverlay;
    $("select[name='route']").bind('change', function(){
        selectedRouteOverlay = 
        console.log($(this).val());
    });

    initializeOverlays();

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("text_panel"));
}

function initializeOverlays() {
    // TODO these should be relative to $SCRIPTROOT if in production
    routeLayers['AP'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Adirondacks.kml';
    routeLayers['AM'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Allegheny.kml';
    routeLayers['AC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Atlantic_Coast.kml';
    routeLayers['FL'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Florida.kml';
    routeLayers['GC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Grand_Canyon.kml';
    routeLayers['GD'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_Divide.kml';
    routeLayers['GP'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_parks.kml';
    routeLayers['GR'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_Rivers.kml';
    routeLayers['GML'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Green_Mtns.kml';
    routeLayers['LE'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Lake_Erie.kml';
    routeLayers['LC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Lewis_and_Clark.kml';
    routeLayers['NT'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Northern_Tier.kml';
    routeLayers['NL'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/North_Lakes.kml';
    routeLayers['PC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Pacific_Coase.kml';
    routeLayers['SC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Sierra_Cascades.kml';
    routeLayers['ST'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Southern_Tier.kml';
    routeLayers['TP'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Tidewater_Potomac.kml';
    routeLayers['TA'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/TransAm.kml';
    routeLayers['UR'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Underground_RR.kml';
    routeLayers['UC'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Utah_Cliffs.kml';
    routeLayers['WP'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Washington_Parks.kml';
    routeLayers['WE'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Western_Express.kml';
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
                route: $("select[name='route']").val()
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
                    alert('this is embarrasing');
                }
            });
        } else {
            alert("There was an error interpreting your input.");
        }
    });
}

function drawRoute_old() {
    // TODO dead code!
    /* Draw an ACA route on the map based on its GPX */
    $.ajax({
        type: "GET",
        url: "static/routes/UR.gpx",
        datatype: "xml",
        success: function(xml) {
            $(xml).find("wpt").each(function() {
                var lat = $(this).attr('lat');
                var lon = $(this).attr('lon');
                var point = new google.maps.LatLng(lat, lon);
                var marker = new google.maps.Marker({
                    position: point,
                    map: map
                });
            });
        }
    });
}
