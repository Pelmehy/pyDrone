$(function () {
    var lat = 51.45662279999999
    var long = 31.446970600000004
    var accuracy = 3504.115577074102

    // Map initialization
    var map = L.map('freeMap').setView([0, 0], 6);

    //osm layer
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    osm.addTo(map);

    if(!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation feature!")
    } else {
        // navigator.geolocation.getCurrentPosition(getPosition)
        updatePosition()

        // setInterval(() => {
        //     //navigator.geolocation.getCurrentPosition(updatePosition)
        //     updatePosition()
        // }, 2000);
    }

    var marker, circle;

    function updatePosition()
    {
        lat = lat + 0.001
        long = long + 0.001

        if(marker) {
            map.removeLayer(marker)
        }

        if(circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long])
        circle = L.circle([lat, long], {radius: accuracy})

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())

        updateCoords()

        console.log("Your coordinate is: Lat: "+ lat +" Long: "+ long+ " Accuracy: "+ accuracy)
    }

    function getPosition(position){
        // console.log(position)
        lat = position.coords.latitude
        long = position.coords.longitude
        accuracy = position.coords.accuracy

        if(marker) {
            map.removeLayer(marker)
        }

        if(circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long])
        circle = L.circle([lat, long], {radius: accuracy})

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())



        console.log("Your coordinate is: Lat: "+ lat +" Long: "+ long+ " Accuracy: "+ accuracy)
    }

    function updateCoords()
    {
        $('#latitude').html(lat)
        $('#longitude').html(long)
        $('#accuracy').html(accuracy)
    }
})
