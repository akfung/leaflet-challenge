// new layer
let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});
//create map
let map = L.map("map", {
    center: [23.8859, 45.0792],
    zoom: 3
})

lightmap.addTo(map); // add the lightmap layer

// pull USGS geoJSON for earthquakes
let USGSpath = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

function colorPicker(value) {
    switch (value){
        case 0:
            pickedColor = '#DAF7A6';
            break;
        case 1:
            pickedColor = '#FFC300';
            break;
        case 2:
            pickedColor = '#FF5733';
            break;
        case 3:
            pickedColor = '#C70039';
            break;
        case 4:
            pickedColor = '#900C3F';
            break;
        case 5:
            pickedColor = '#581845';
            break;
}
    return pickedColor;
}

d3.json(USGSpath, function(geoData){
    geoData.features.forEach(earthquake => {
        let quakeCoordinate = earthquake.geometry.coordinates.slice(0,2), //get quake coordinates
            quakeMag = earthquake.properties.mag, //get quake magnitude
            quakeUTCTime = earthquake.properties.time; // quake time of occurance 
        
        //convert UTC time
        let quakeTime = new Date(0);
        quakeTime.setUTCSeconds(quakeUTCTime);

        //ternary statement for marker colors along with switch case just to see how it would work
        let magArray = [0, 1, 2, 3, 4, 5];
        let closestMag = magArray.reduce(function(prev, curr) {
            return (Math.abs(curr - quakeMag) < Math.abs(prev-quakeMag) ? curr: prev);
        });

        let quakeMarker = L.circle(quakeCoordinate, {
            radius: quakeMag * 15000,
            opacity: 0,
            fillColor: colorPicker(closestMag),
            fillOpactiy: 1.0
        })
        .bindPopup(`<h1>Magnitude: ${quakeMag}</h1><h1>Time: ${quakeTime}</h1>`) //popup details
        .addTo(map);

    })
    
});

//legend
let legend = L.control({position: "bottomright"});
legend.onAdd = function(map) {
    let div = L.DomUtil.create("div", "legend"),
        magArray = [0, 1, 2, 3, 4, 5],
        labels = [];
    // append a color box and html text for each magnitude value 
    magArray.slice(0, 5).forEach(value => {
        div.innerHTML += `<div><i class = 'legend-color-box' style = 'background: ${colorPicker(value)}; width: 20px; float: left;'></i>
        <h4>Magnitude ${value} - ${value+1}</h4></div>`;
    })  

    div.innerHTML += `<div><i class = 'legend-color-box' style = 'background: ${colorPicker(5)}; width: 20px; float: left;'></i>
        <h4>Magnitude 5+</h4></div>`;  
    return div;
};
legend.addTo(map);