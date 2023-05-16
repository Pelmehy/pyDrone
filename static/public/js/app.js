$(function () {
    // *****************************
    // control module
    // *****************************


    let roll = 50; // move y
    let yaw = 50; // move x
    let pinch = 50; // rotate
    let throttle = 50; // height

    var lastKeyUpAt = 0;

    $(document).on('keypress', function (event) {
        console.log(event.which);

        switch (event.which) {
            case 119:   //w
            case 1094:
                roll = changeControls(roll, 'roll');
                break;
            case 115:   //s
            case 1110:
                roll = changeControls(roll, 'roll', false);
                break;
            case 97:    //a
            case 1092:
                yaw = changeControls(yaw, 'yaw', false)
                break;
            case 100:   //d
            case 1074:
                yaw = changeControls(yaw, 'yaw')
                break;
            case 114: //r
            case 1082:
                throttle = changeControls(throttle, 'throttle')
                break;
            case 102: //f
            case 1072:
                throttle = changeControls(throttle, 'throttle', false);
                break;
            case 113: //q
            case 1081:
                pinch = changeControls(pinch, 'pinch', false);
                break;
            case 101: //e
            case 1091:
                pinch = changeControls(pinch, 'pinch');
                break;
        }
    })

    function changeControls(control, name, increase = true,) {
        let controlBarDecrease = $('#' + name + '-progress-decrease');
        let controlBarIncrease = $('#' + name + '-progress-increase');
        let controlPercent = $('#' + name);

        if (increase) {
            control += control < 100 ? 1 : 0;
        } else {
            control -= control > 0 ? 1 : 0;
        }

        if (control === 50) {
            controlPercent.removeClass('text-success');
            controlPercent.addClass('text-warning');
        } else {
            controlPercent.removeClass('text-warning');
            controlPercent.addClass('text-success');
        }

        controlPercent.html((control - 50) + '%');

        if (control < 50) {
            controlBarDecrease.css('width', (100 - control * 2) + '%');
        } else if (control === 50) {
            controlBarDecrease.css('width', '0%');
            controlBarIncrease.css('width', '0%');
        } else {
            controlBarIncrease.css('width', (control * 2 - 100) + '%');
        }

        return control;
    }

    function changeX(increase = true) {
        let rollControl = $('#roll');
        let yawControl = $('#yaw');

        if (increase) {
            roll += roll < 100 ? 1 : 0;
            yaw = 0;

            rollControl.removeClass('text-warning');
            rollControl.addClass('text-success');

            yawControl.removeClass('text-success')
            yawControl.addClass('text-warning');
        } else {
            yaw += yaw < 100 ? 1 : 0;
            roll = 0;

            rollControl.removeClass('text-success')
            rollControl.addClass('text-warning');

            yawControl.removeClass('text-warning');
            yawControl.addClass('text-success');
        }

        rollControl.html(roll + '%');
        $('#roll-progress').css('width', roll + '%');

        yawControl.html(yaw + '%');
        $('#yaw-progress').css('width', yaw + '%');
    }

    function changeY(increase = true) {
        let pinchControl = $('#pinch');
        let throttleControl = $('#throttle');

        if (increase) {
            pinch += pinch < 100 ? 1 : 0;
            throttle = 0;

            pinchControl.removeClass('text-warning');
            pinchControl.addClass('text-success');

            throttleControl.removeClass('text-success')
            throttleControl.addClass('text-warning');
        } else {
            throttle += throttle < 100 ? 1 : 0;
            pinch = 0;

            pinchControl.removeClass('text-success')
            pinchControl.addClass('text-warning');

            throttleControl.removeClass('text-warning');
            throttleControl.addClass('text-success');
        }

        pinchControl.html(pinch + '%');
        $('#pinch-progress').css('width', pinch + '%');

        throttleControl.html(throttle + '%');
        $('#throttle-progress').css('width', throttle + '%');
    }

    // *****************************
    // map module
    // *****************************

    var lat = 50.4521213
    var long = 30.4544663
    var accuracy = 10

    // Map initialization
    var map = L.map('freeMap').setView([0, 0], 6);

    var droneIcon = L.icon({
        iconUrl: "static/public/img/drone.png",

        iconSize: [20, 20], // size of the icon
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    })

    var iconGoTo = L.icon({
        iconUrl: "static/public/img/marker-go-to.png",

        iconSize: [25, 40], // size of the icon
        iconAnchor: [10, 40], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    })

    //osm layer
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    osm.addTo(map);

    if (!navigator.geolocation) {
        console.log("Your browser doesn't support geolocation feature!")
    } else {
        // navigator.geolocation.getCurrentPosition(getPosition)
        updatePosition()

        // setInterval(() => {
        //     //navigator.geolocation.getCurrentPosition(updatePosition)
        //     updatePosition()
        // }, 2000);
    }

    var marker, circle, temp_marker, go_to_marker;

    function updatePosition() {
        // lat = lat + 0.001
        // long = long + 0.001

        if (marker) {
            map.removeLayer(marker)
        }

        if (circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long], {icon: droneIcon})
        circle = L.circle([lat, long], {radius: accuracy})

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())

        updateCoords()

        console.log("Your coordinate is: Lat: " + lat + " Long: " + long + " Accuracy: " + accuracy)
    }

    function getPosition(position) {
        // console.log(position)
        lat = position.coords.latitude
        long = position.coords.longitude
        accuracy = position.coords.accuracy

        if (marker) {
            map.removeLayer(marker)
        }

        if (circle) {
            map.removeLayer(circle)
        }

        marker = L.marker([lat, long])
        circle = L.circle([lat, long], {radius: accuracy})

        var featureGroup = L.featureGroup([marker, circle]).addTo(map)

        map.fitBounds(featureGroup.getBounds())


        console.log("Your coordinate is: Lat: " + lat + " Long: " + long + " Accuracy: " + accuracy)
    }

    function updateCoords() {
        $('#latitude').html(lat)
        $('#longitude').html(long)
        $('#altitude').html(accuracy)
    }

    map.on('click', function (e) {
        $('#lat_go_to').val(e.latlng.lat);
        $('#lon_go_to').val(e.latlng.lng);

        if (temp_marker) {
            map.removeLayer(temp_marker)
        }

        temp_marker = L.marker([e.latlng.lat, e.latlng.lng])
        L.featureGroup([temp_marker]).addTo(map)
    });

    $('#gps_set').click(function () {
        let lat = $('#lat_go_to').val()
        let lon = $('#lon_go_to').val()

        if (go_to_marker) {
            map.removeLayer(go_to_marker)
        }

        go_to_marker = L.marker([lat, lon], {icon: iconGoTo})
        L.featureGroup([go_to_marker]).addTo(map)

    })

    /* ION SLIDER */
    $('#vx').ionRangeSlider({
        min: -20,
        max: 20,
        from: 0,
        type: 'single',
        step: 0.1,
        postfix: 'm/s',
        prettify: false,
        hasGrid: true,
        fixMiddle: true,
        skin: 'flat'
    })

    $('#vy').ionRangeSlider({
        min: -20,
        max: 20,
        from: 0,
        type: 'single',
        step: 0.1,
        postfix: 'm/s',
        prettify: false,
        hasGrid: true,
        fixMiddle: true,
        skin: 'flat'
    })

    $('#vz').ionRangeSlider({
        min: -20,
        max: 20,
        from: 0,
        type: 'single',
        step: 0.1,
        postfix: 'm/s',
        prettify: false,
        hasGrid: true,
        fixMiddle: true,
        skin: 'flat'
    })

    $('#yaw').ionRangeSlider({
        min: 0,
        max: 360,
        from: 0,
        type: 'single',
        step: 1,
        postfix: '°',
        prettify: false,
        hasGrid: true,
        // fixMiddle: true,
        skin: 'flat'
    })


})