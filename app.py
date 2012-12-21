import os
import xml.etree.ElementTree
from math import sin, cos, asin, sqrt, radians
from collections import namedtuple
from glob import iglob

from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder='./static')
app.config.from_pyfile('config.py')

class Coordinate(namedtuple('Coordinate', 'lon lat')):
    def __repr__(self):
        return '{lat}, {lon}'.format(lat=self.lat, lon=self.lon)

def load_waypoints():
    """
    get route data from gpx files, make a dict mapping route
    name to a list of Coordinates.
    """
    gpx_files = iglob('./static/routes/*.gpx')

    route_dict = {}
    for f in gpx_files:
        route = xml.etree.ElementTree.parse(f)
        waypoint_elements = route.findall('rte/rtept')

        waypoint_coordinates = []
        for element in waypoint_elements:
            waypoint_coordinates.append(Coordinate(float(element.get('lon')),
                                                   float(element.get('lat'))))

        # the name of the route is the filename minus its extension
        route_dict[os.path.basename(f).replace('.gpx', '')] = waypoint_coordinates

    return route_dict
waypoints = load_waypoints()

def distance(a, b):
    """
    Find the distance (km) between two locations.

    This is the haversine formula for finding the great circle
    distance between points on a sphere.
    https://en.wikipedia.org/wiki/Haversine_formula
    """
    # Convert degrees to radians
    a = Coordinate(*map(radians, a))
    b = Coordinate(*map(radians, b))

    d_lon = a.lon - b.lon
    d_lat = a.lat - b.lat

    # Speherical geometry!
    distance = 2 * asin(sqrt(sin(d_lat/2)**2 + cos(a.lat) * cos(b.lat) * sin(d_lon/2)**2))

    # scale distance from radius 1 sphere to Earth sized sphere
    return distance * 6367

@app.route('/_nearest_waypoint')
def nearest_waypoint():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    route = request.args.get('route')

    if not (lat and lon and route):
        return jsonify(result='bad arguments', status='failure')

    coordinate = Coordinate(lat=float(lat), lon=float(lon))

    closest_waypoint = sorted(waypoints[route], key=lambda waypoint: distance(coordinate, waypoint))[0]

    return jsonify(result={'lat':closest_waypoint.lat, 'lon':closest_waypoint.lon},
                   status='sucess')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.path.isfile('dev'))

