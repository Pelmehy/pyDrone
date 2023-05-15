$(function () {
    let is_connected = false

    let server_url= 'http://127.0.0.1:8000'

    let drone_connect_url = server_url + '/drone-api/controls/connect/'
    let drone_disconnect_url = server_url + '/drone-api/controls/disconnect/'

    let drone_take_off_mode_url = server_url + '/drone-api/controls/take_off'
    let drone_rtl_mode_url = server_url + '/drone-api/controls/landing_mode'

    let drone_velocity_mode_url = server_url + '/drone-api/controls/velocity_mode'
    let drone_velocity_url = server_url + '/set_velocity'
    let drone_set_x_speed = server_url + '/drone-api/controls/x_speed/'
    let drone_set_y_speed = server_url + '/drone-api/controls/y_speed/'
    let drone_set_z_speed = server_url + '/drone-api/controls/z_speed/'
    let drone_set_yaw = server_url + '/drone-api/controls/yaw/'

    let drone_go_to_mode = server_url + '/drone-api/controls/go_to_mode'
    let drone_gps_set = server_url + '/drone-api/controls/gps_set/'

    function send_post(url) {
        console.log(url)
        let result

        $.ajax({
            type: "POST",
            url: url,
            success: function (data) {
                console.log(data)
            }
        })

        return result
    }

    function set_mode(url) {
        return send_post(url)
    }

    function set_velocity(vx=0.0, vy=0.0, vz=0.0, yaw=0.0) {
        let api_url = drone_velocity_url + vx + '/' + vy + '/' + vz + '/' + yaw;

        return send_post(api_url)
    }

    function set_gps(lat, lon, alt) {
        let api_url = drone_gps_set + lat + '/' + lon + '/' + alt

        return send_post(api_url)
    }

    let gps_go_to_controls = $('#gps_go_to_controls');
    let velocity_controls = $('#velocity_controls');
    let app_mode = $('#app_mode');

    function connect() {
        // set_mode(drone_connect_url)

        let connection_status = $('#connection_status')
        connection_status.removeClass('bg-danger')
        connection_status.addClass('bg-warning')
        connection_status.text('Connecting...')

        $('#take_off').removeAttr('disabled')
        $('#drone_connect').text('disconnect')
    }

    function disconnect() {
        // set_mode(drone_disconnect_url)

        let connection_status = $('#connection_status')
        connection_status.removeClass('bg-warning')
        connection_status.addClass('bg-danger')
        connection_status.text('Connect')

        $('#take_off').attr('disabled', 'disabled');
        $('#rtl_mode').attr('disabled', 'disabled');
        $('#gps_go_to_mode').attr('disabled', 'disabled');
        $('#velocity_mode').attr('disabled', 'disabled');

        $('#drone_connect').text('disconnect')

        gps_go_to_controls.hide()
        velocity_controls.hide()
    }

    $('#drone_connect').click(function () {
        if (is_connected) {
            is_connected = false
            disconnect()
        } else {
            is_connected = true
            connect()
        }
    })

    $('#rtl_mode').click(function () {
        set_mode(drone_rtl_mode_url)

        gps_go_to_controls.hide()
        velocity_controls.hide()

        $('#rtl_mode').attr('disabled', 'disabled');
        $('#gps_go_to_mode').attr('disabled', 'disabled');
        $('#velocity_mode').attr('disabled', 'disabled');

        $('#take_off').removeAttr('disabled')

        app_mode.text('RTL')
    });

    $('#take_off').click(function () {
        set_mode(drone_take_off_mode_url)
        gps_go_to_controls.hide()
        velocity_controls.hide()

        $('#rtl_mode').removeAttr('disabled');
        $('#gps_go_to_mode').removeAttr('disabled');
        $('#velocity_mode').removeAttr('disabled');

        $(this).attr('disabled', 'disabled');

        app_mode.text('Take Off')
    });

    $('#gps_go_to_mode').click(function () {
        set_mode(drone_go_to_mode)

        gps_go_to_controls.show()
        velocity_controls.hide()

        app_mode.text('GO TO')
    });

    $('#velocity_mode').click(function () {
        set_mode(drone_velocity_mode_url)
        gps_go_to_controls.hide()
        velocity_controls.show()

        app_mode.text('VELOCITY')
    });

    $('#gps_set').click(function () {
        let lat = $('#lat_go_to').val()
        let lon = $('#lon_go_to').val()
        let alt = $('#alt_go_to').val()

        set_gps(lat, lon, alt)
    })
})
