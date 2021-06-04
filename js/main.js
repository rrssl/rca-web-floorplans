const floorplanPaths = [
    './data/0a6e347e-51ac-453c-85d0-c569e44c7a41.geojson',
    './data/1b3b292a-c737-4314-9302-9ffe4233d5be.geojson',
    './data/2fa534fb-2028-4113-98d4-b9ed5d36e08b.geojson',
    './data/51620c8e-32a5-4ed1-aed5-286b09621208.geojson',
    './data/57e7103c-50bc-4002-a96c-f10058c991a9.geojson',
    './data/6d322c6a-b617-4e6f-809b-d0609861c1b3.geojson',
    './data/7a56de60-01f6-440c-8565-0fb420fffe18.geojson',
    './data/a4b26891-0b70-49fe-8dc0-7425ce903c4a.geojson',
    './data/c867cb96-c666-49cd-869d-a16ce43a3164.geojson',
    './data/fffe2a5b-bec2-494a-97d9-e53c75c0cea6.geojson'
];
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
const bigPlanDiv = document.querySelector('.big-plan');
const bigPlanMap = L.map(bigPlanDiv, bigMapOptions);
document.querySelector('.close-button').onclick = function() {
    bigPlanMap.eachLayer(layer => bigPlanMap.removeLayer(layer));
    bigPlanDiv.classList.add('invisible');
};
// Create the array of plan thumbnails.
for (path of floorplanPaths) {
    fetch(path)
        .then(response => response.json())
        .then(plan => {
            const planDiv = document.createElement('div');
            planDiv.className = 'plan';
            dataDiv.appendChild(planDiv);
            const map = L.map(planDiv, mapOptions);
            const layer = L.geoJSON(plan, {style: setPlanStyle, onEachFeature: setPopUp});
            layer.addTo(map);
            map.fitBounds(layer.getBounds(), {padding: [10, 10]});
            planDiv.onclick = function() {
                if (bigPlanDiv.classList.contains('invisible')) {
                    layer.addTo(bigPlanMap);
                    bigPlanMap.fitBounds(layer.getBounds(), {padding: [50, 50]});
                    bigPlanDiv.classList.remove('invisible');
                }
            };
        });
}
