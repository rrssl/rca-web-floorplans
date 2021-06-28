const bigMapOptions = {
    // Sets the right scaling options for fitBounds()
    crs: L.CRS.Simple,
    zoomSnap: .1,
    minZoom: -3,
    attributionControl: false,
};

const mapOptions = {
    // Sets the right scaling options for fitBounds()
    crs: L.CRS.Simple,
    zoomSnap: .1,
    minZoom: -3,
    // Removes all controls, interactions and links
    attributionControl: false,
    boxZoom: false,
    closePopupOnClick: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
    touchZoom: false,
    // trackResize: false,
    zoomControl: false
};

const labelColormap = {
    'door.arc': '#000000',
    'door.frame': '#000000',
    'floor_space.balcony': '#a6cee3',
    'floor_space.bathroom': '#1f78b4',
    'floor_space.corridor': '#b2df8a',
    'floor_space.kitchen': '#33a02c',
    'floor_space.kitchen_dining': '#fb9a99',
    'floor_space.polyroom': '#e31a1c',
    'floor_space.room': '#fdbf6f',
    'floor_space.staircase': '#ff7f00',
    'floor_space.storeroom': '#cab2d6',
    'wall': '#000000',
    'window': '#000000',
    '': '#ffffff'
};

const setPlanStyle = function(feature) {
    return {
        'color': 'black',
        'weight': 1,
        'fillColor': labelColormap[feature.properties.label]
    };
};

const setPopUp = function(feature, layer) {
    if (feature.properties.label) {
        const labelParts = feature.properties.label.split('.');
        if (labelParts[0] == 'floor_space') {
            layer.bindPopup(labelParts[1]);
        }
    }
};

const dataDiv = document.querySelector('.data');
// Create the big plan view.
const bigPlanContainer = document.querySelector('.big-plan-container');
const bigPlanElement = bigPlanContainer.querySelector('.big-plan')
const bigPlanMap = L.map(bigPlanElement, bigMapOptions);
document.querySelector('.close-button').onclick = function() {
    bigPlanMap.eachLayer(layer => bigPlanMap.removeLayer(layer));
    bigPlanContainer.classList.add('invisible');
};

const displayFloorPlans = function(plans) {
    for (let plan of plans) {
        const planDiv = document.createElement('div');
        planDiv.className = 'plan';
        dataDiv.appendChild(planDiv);
        const map = L.map(planDiv, mapOptions);
        const layer = L.geoJSON(plan, {style: setPlanStyle});
        layer.addTo(map);
        map.fitBounds(layer.getBounds(), {padding: [10, 10]});
        planDiv.onclick = function() {
            if (bigPlanContainer.classList.contains('invisible')) {
                const bigPlanLayer = L.geoJSON(
                    plan, {style: setPlanStyle, onEachFeature: setPopUp}
                );
                bigPlanLayer.addTo(bigPlanMap);
                bigPlanMap.fitBounds(
                    bigPlanLayer.getBounds(), {padding: [50, 50]}
                );
                bigPlanContainer.classList.remove('invisible');
            }
        };
    }
};

const searchFloorPlans = function(/*query*/) {
    return fetch("/FloorPlanSearch", {
        // method: 'GET',
        // body: JSON.stringify(query),
        // headers:{'Content-Type': 'application/json'}
    }).then(response => response.json());
};

searchFloorPlans().then(plans => displayFloorPlans(plans));
// searchFloorPlans().then(plans => console.log(plans));
