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

    // TODO remove this
    cache_invalidator = "?nocache=" + (new Date()).valueOf();

    // TODO should be relative to $SCRIPTROOT
    var overlay = new google.maps.KmlLayer('http://rocky-citadel-8652.herokuapp.com/static/overlays/ACA_network.kml'+cache_invalidator);
    overlay.setMap(map);

    initializeOverlays();

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("text_panel"));
}

function initializeOverlays() {
    // TODO these should be relative to $SCRIPTROOT if in production
    routeLayers['adirondacks'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Adirondacks.kml';
    routeLayers['allegheney'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Allegheny.kml';
    routeLayers['atlantic coast'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Atlantic_Coast.kml';
    routeLayers['florida'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Florida.kml';
    routeLayers['grand canyon'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Grand_Canyon.kml';
    routeLayers['great divide'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_Divide.kml';
    routeLayers['great parks'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_parks.kml';
    routeLayers['great rivers'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Great_Rivers.kml';
    routeLayers['gren mtns'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Green_Mtns.kml';
    routeLayers['lake erie'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Lake_Erie.kml';
    routeLayers['lewis and clark'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Lewis_and_Clark.kml';
    routeLayers['northern tier'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Northern_Tier.kml';
    routeLayers['north lakes'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/North_Lakes.kml';
    routeLayers['pacific coast'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Pacific_Coase.kml';
    routeLayers['sierra cascades'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Sierra_Cascades.kml';
    routeLayers['southern tier'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Southern_Tier.kml';
    routeLayers['tidewater potomac'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Tidewater_Potomac.kml';
    routeLayers['transam'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/TransAm.kml';
    routeLayers['underground rr'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Underground_RR.kml';
    routeLayers['utah cliffs'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Utah_Cliffs.kml';
    routeLayers['washington parks'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Washington_Parks.kml';
    routeLayers['western express'] = 'http://rocky-citadel-8652.herokuapp.com/static/overlays/Western_Express.kml';
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
