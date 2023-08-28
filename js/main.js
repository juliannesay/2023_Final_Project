// Initialize the map
const map = L.map('map').setView([42.7, -75.5], 6);
L.tileLayer('https://www.stadiamaps.com/').addTo(map);

// Add OSM Bright base tilelayer
var Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
  }).addTo(map);

  // Add Esri World Imagery basemap
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Create a basemap control layer
  var basemaps = {
    "Open Street Map Bright": Stadia_OSMBright,
    "Esri World Imagery": Esri_WorldImagery
  };

  L.control.layers(basemaps).addTo(map);

// Create marker cluster groups for different layers
const longtermcareCluster = new L.MarkerClusterGroup().addTo(map);
const hospitalsCluster = new L.MarkerClusterGroup().addTo(map);
const primarycareCluster = new L.MarkerClusterGroup().addTo(map);

// marker styling functions for each category
function longtermcareMarker(feature, latlng) {
    return L.circleMarker(latlng, { color: 'blue' });
}

function hospitalsMarker(feature, latlng) {
    return L.circleMarker(latlng, { color: 'red' });
}

function primarycareMarker(feature, latlng) {
    return L.circleMarker(latlng, { color: 'green' });
}

// Loading data with filter and popup functions
function loadData(clusterGroup, geoJSONPath, filterFunction, popupFunction, markerFunction) {
    fetch(geoJSONPath)
        .then(response => response.json())
        .then(data => {
            clusterGroup.clearLayers();
            L.geoJSON(data, {
                filter: filterFunction,
                onEachFeature: popupFunction,
                pointToLayer: markerFunction
            }).addTo(clusterGroup);
        });
}

// Filtering functions
function longtermcareFilter(feature) {
    const selectedType = document.getElementById('longtermcareType').value;
    if (selectedType === 'all') return true;
    return feature.properties.Type === selectedType;
}

function primarycareFilter(feature) {
    const selectedSpecialty = document.getElementById('primarycareSpecialty').value;
    if (selectedSpecialty === 'all') return true;
    return feature.properties.Specialty === selectedSpecialty;
}

// Popup functions
function longtermcarePopup(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(
            `<strong>Name:</strong> ${feature.properties.Name}<br>
            <strong>Type:</strong> ${feature.properties.Type}<br>
            <strong>Address:</strong> ${feature.properties["Street Address"]}, ${feature.properties.City}, ${feature.properties["Zip Code"]}<br>
            <strong>Phone:</strong> ${feature.properties["Facility Phone Number"]}`
        );
    }
}

function hospitalsPopup(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(
            `<strong>Name:</strong> ${feature.properties.Name}<br>
            <strong>Type:</strong> ${feature.properties.Type}<br>
            <strong>Address:</strong> ${feature.properties["Street Address"]}, ${feature.properties.City}, ${feature.properties["Zip Code"]}<br>
            <strong>Phone:</strong> ${feature.properties["Facility Phone Number"]}`
        );
    }
}

function primarycarePopup(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(
            `<strong>First Name:</strong> ${feature.properties["First Name"]}<br>
            <strong>Last Name:</strong> ${feature.properties["Last Name"]}<br>
            <strong>Specialty:</strong> ${feature.properties.Specialty}<br>
            <strong>Address:</strong> ${feature.properties["street address"]}, ${feature.properties.city}, ${feature.properties["zipcode"]}`
        );
    }
}

// Event listeners for checkboxes and filters
document.getElementById('longtermcare').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(longtermcareCluster);
    } else {
        map.removeLayer(longtermcareCluster);
    }
    refreshLegend();
});

document.getElementById('hospitals').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(hospitalsCluster);
    } else {
        map.removeLayer(hospitalsCluster);
    }
    refreshLegend();
});

document.getElementById('primarycare').addEventListener('change', function() {
    if (this.checked) {
        map.addLayer(primarycareCluster);
    } else {
        map.removeLayer(primarycareCluster);
    }
    refreshLegend();
});

document.getElementById('longtermcareType').addEventListener('change', function() {
    loadData(longtermcareCluster, 'data/longtermcare.geojson', longtermcareFilter, longtermcarePopup, longtermcareMarker);
});

document.getElementById('primarycareSpecialty').addEventListener('change', function() {
    loadData(primarycareCluster, 'data/primarycare.geojson', primarycareFilter, primarycarePopup, primarycareMarker);
});

// Load data on page load for all categories
loadData(longtermcareCluster, 'data/longtermcare.geojson', longtermcareFilter, longtermcarePopup, longtermcareMarker);
loadData(hospitalsCluster, 'data/hospitals.geojson', () => true, hospitalsPopup, hospitalsMarker);
loadData(primarycareCluster, 'data/primarycare.geojson', primarycareFilter, primarycarePopup, primarycareMarker);

// Dynamic legend function
function refreshLegend() {
    let legendHTML = '';
    
    if(document.getElementById('longtermcare').checked) {
        legendHTML += '<div><span style="background-color: blue; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></span> Long Term Care</div>';
    }
    if(document.getElementById('hospitals').checked) {
        legendHTML += '<div><span style="background-color: red; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></span> Hospitals</div>';
    }
    if(document.getElementById('primarycare').checked) {
        legendHTML += '<div><span style="background-color: green; display: inline-block; width: 12px; height: 12px; margin-right: 5px;"></span> Primary Care</div>';
    }
    
    document.getElementById('mapLegend').innerHTML = legendHTML;
}

// Initialize the legend
refreshLegend();

// Search control
L.Control.geocoder({
    defaultMarkGeocode: false,
    geocoder: L.Control.Geocoder.nominatim(),
    showResultIcons: true,
    collapsed: true,
    position: 'topright',
    placeholder: "Search...",
}).addTo(map);
