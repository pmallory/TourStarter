import os
import xml.etree.ElementTree
import math

from flask import Flask

app = Flask(__name__)


def load_waypoints():
    route = xml.etree.ElementTree.parse('./routes/UR.gpx')
    waypoints = route.findall('wpt')
    return waypoints

@app.route('/')
def index():
    home = (33.772441,-84.394701)
    distances = ''
    for waypoint in waypoints:
        home = tuple(map(math.radians, home))
        coords = (float(waypoint.get('lon')), float(waypoint.get('lat')))
        coords = tuple(map(math.radians, coords))

        #TODO put coords in namedTuples
        dlongitude = home[0] - coords[0]
        dlatitude = home[1] - coords[1]
        a = math.sin(dlatitude/2)**2 + math.cos(coords[1]) * math.cos(home[1]) * math.sin(dlongitude/2)**2
        c = 2 * math.asin(math.sqrt(a))
        km = 6367 * c

        distances += ('<p>'+str(km)+' km</p>')

    return distances 

if __name__ == '__main__':
    waypoints = load_waypoints()

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0',port=port, debug=True)
