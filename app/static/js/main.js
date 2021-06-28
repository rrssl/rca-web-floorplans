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
    'Door arc': '#000000',
    'Door frame': '#000000',
    'Wall': '#000000',
    'Window': '#000000',
    '': '#ffffff',

    'Single Room': '#fdbf6f',
    'Double Room': '#fdbf6f',
    'Large Room': '#e31a1c',

    'Balcony': '#a6cee3',

    'Bathroom': '#1f78b4',

    'Corridor': '#b2df8a',
    'Corridor + Staircase': '#b2df8a',
    'Staircase': '#ff7f00',

    'Storeroom': '#cab2d6',

    'Kitchen': '#33a02c',
    'Dining Kitchen': '#fb9a99'
};

const setPlanStyle = function(feature) {
    return {
        'color': 'black',
        'weight': 1,
        'fillColor': labelColormap[feature.properties.label]
    };
};

const setPopUp = function(feature, layer) {
    if (feature.properties.is_floor_space) {
        layer.bindPopup(feature.properties.label);
    }
};

const dataDiv = document.querySelector('.data');
// Create the big plan view.
const bigPlanContainer = document.querySelector('.big-plan-container');
const bigPlanElement = bigPlanContainer.querySelector('.big-plan')
const bigPlanMap = L.map(bigPlanElement, bigMapOptions);
const planDataElement = bigPlanContainer.querySelector('.plan-data > .plan-data-content');
document.querySelector('.close-button').onclick = function() {
    bigPlanMap.eachLayer(layer => bigPlanMap.removeLayer(layer));
    bigPlanContainer.classList.add('invisible');
    while (planDataElement.firstChild) {
        planDataElement.removeChild(planDataElement.lastChild);
    }
};

const displayFloorPlans = function(plans) {
    // Clear existing plans
    Array.from(dataDiv.children).forEach(child => {
        if (child.classList.contains('plan')) {
            dataDiv.removeChild(child);
        }
    });
    // Display new plans
    for (let plan of plans) {
        const planDiv = document.createElement('div');
        planDiv.className = 'plan';
        dataDiv.appendChild(planDiv);
        const map = L.map(planDiv, mapOptions);
        const layer = L.geoJSON(plan.geo, {style: setPlanStyle});
        layer.addTo(map);
        map.fitBounds(layer.getBounds(), {padding: [10, 10]});
        planDiv.onclick = function() {
            if (bigPlanContainer.classList.contains('invisible')) {
                // Map
                const bigPlanLayer = L.geoJSON(
                    plan.geo, {style: setPlanStyle, onEachFeature: setPopUp}
                );
                bigPlanLayer.addTo(bigPlanMap);
                bigPlanMap.fitBounds(
                    bigPlanLayer.getBounds(), {padding: [50, 50]}
                );
                bigPlanContainer.classList.remove('invisible');
                // Side pane metadata
                const dataList = document.createElement('ul');
                planDataElement.appendChild(dataList);
                for (let item of plan.metadata) {
                    const listElement = document.createElement('li');
                    dataList.appendChild(listElement);
                    listElement.innerText = item;

                }
            }
        };
    }
};

const searchFloorPlans = function(searchParams) {
    const queryUrl = new URL("/FloorPlanSearch", window.location.href);
    if (searchParams){
        for (const [key, value] of searchParams) {
            queryUrl.searchParams.append(key, value);
        }
    }
    return fetch(queryUrl).then(response => response.json());
};

// TODO Hold query parameters in a variable, and allow the tag buttons to be
// cumulative instead of exclusive. Use the button state to determine whether
// the tag should be added or removed from the query.
for (let button of document.querySelectorAll('.tag-button')) {
    button.onclick = function() {
        searchFloorPlans([['type', button.innerText]]).then(displayFloorPlans);
    }
}

searchFloorPlans().then(displayFloorPlans);
