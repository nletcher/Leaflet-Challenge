// Creating map object
var myMap = L.map("map", {
  center: [37.7749, -122.4194],
  zoom: 3
});

// Adding streetmap tile layer
streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);

// Adding dark tile layer
light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
}).addTo(myMap);

// Adding dark tile layer
dark = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
}).addTo(myMap);

// Adding outdoors tile layer
outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/cjaudgl840gn32rnrepcb9b9g",
    accessToken: API_KEY
}).addTo(myMap);

// Adding satellite tile layer
satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
}).addTo(myMap);

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  Light: light,
  Dark: dark,
  Outdoors: outdoors,
  Satellite: satellite
};

// Define colors for scale
//var colors = ["#8AF475", "#92CC62", "#9AA350", "#A37B3D", "#AB522B", "#B32A18"];
var colors = ["#95FB80", "#A4D36C", "#B3AB58", "#C38243", "#D25A2F", "#E1321B"];

function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><p>Magnitude: " + feature.properties.mag +
    " | Depth: " + feature.geometry.coordinates[2] +
    "km</p>\n<hr>\n<p>" + new Date(feature.properties.time) + "</p>");
}

// Define a markerSize function that will give each city a different radius based on its population
function markerOptions(feature, latlng) {
  var magnitude = feature.properties.mag;
  var depth = feature.geometry.coordinates[2];
  //console.log(depth);

  // Fill color depending on depth
  var fillColor;
  if (depth < 10){
    fillColor = colors[0];
  }
  else if (depth < 30) {
    fillColor = colors[1];
  }
  else if (depth < 50) {
    fillColor = colors[2];
  }
  else if (depth < 70) {
    fillColor = colors[3];
  }
  else if (depth < 90) {
    fillColor = colors[4];
  }
  else {
    fillColor = colors[5];
  }

  var markerSize = magnitude * 5;
  var geojsonMarkerOptions = {
    fillOpacity: 0.75,
    color: "black",
    fillColor: fillColor,
    weight: 1,
    radius: markerSize 
  }
  return L.circleMarker(latlng, geojsonMarkerOptions);
}

// Source of tectonic plate GeoJSON
// https://github.com/fraxen/tectonicplates
var tectonicGeojson = "static/data/tectonic_boundaries.json";

// Create overlay for textonic plates
var tectonicPlates;

d3.json(tectonicGeojson, function(data) {
  tectonicPlates = L.geoJson(data).addTo(myMap);
});

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  earthquakes = L.geoJson(data.features, {
    pointToLayer: markerOptions,
    onEachFeature: onEachFeature
  }).addTo(myMap);


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    var limits = ["<10", "10-30", "30-50", "50-70", "70-90", "90+"];
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Depth (km)</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);


});

