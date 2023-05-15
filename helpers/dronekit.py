import time

import dronekit
import socket

import threading


class DroneControls:
    # CONNECTION_STRING = 'COM3'
    CONNECTION_STRING = 'udp:127.0.0.1:14550'
    # BAUD_RATE = 57600
    BAUD_RATE = 115200

    vehicle = None
    drone_error = None

    # mode = None
    # mode = "GUIDED"
    mode = "GUIDED_NOGPS"

    controls = {
        'vx': 0.0,
        'vy': 0.0,
        'vz': 0.0,
        'yaw': 0.0
    }

    duration = 5

    is_active = False
    is_changed = False

    def __init__(
            self,
            connection_string=None,
            baud_rate=None
    ):
        threading.Thread.__init__(self)

        if connection_string:
            self.CONNECTION_STRING = connection_string

        if baud_rate:
            self.BAUD_RATE = baud_rate

        print(self.CONNECTION_STRING)
        print(self.BAUD_RATE)

        self.connect()

    def __del__(self):
        self.disconnect()
        print('disconnected')

    def temp_terminal(self):
        command = 0

        while True:
            print(
                '1:\tget position',
                '2:\tget ground speed',
                '3:\tarm',
                '4:\tdisarm',
                '5:\tchange controls',
                '6\tsimple takeoff',
                '0:\tdisconnect',
                sep='\n'
            )
            print('enter command: ')
            command = int(input())

            if command == 0:
                self.is_active = False
                return
            elif command == 1:
                position = self.get_gps_position()
                print('position:', position)
            elif command == 2:
                motor_sped = self.get_ground_speed()
                print('ground speed:', motor_sped)
            elif command == 3:
                self.set_arm(True)
                print('armed')
            elif command == 4:
                self.set_arm(False)
                print('disarmed')
            elif command == 5:
                self.is_active = True
                self.control_thread()
            elif command == 6:
                self.arm_and_takeoff(20)

            self.is_changed = True

    def controls_facade(self):
        print('vx: ', self.controls['vx'])
        print('vy: ', self.controls['vy'])
        print('vz: ', self.controls['vz'])
        print('yaw: ', self.controls['yaw'], end='\n\n')

        while True:
            if 'stop' in self.controls:
                return

            print('sending command...')

            self.send_velocity(self.controls['vx'], self.controls['vy'], self.controls['vz'], self.duration)

            if self.controls['yaw'] != 0:
                self.condition_yaw(self.controls['yaw'])
                self.set_controls('yaw')

            print('command sent')
            self.is_changed = False

            time.sleep(1)

    def control_thread(self):
        thread_terminal = threading.Thread(target=self.terminal_input_facade)
        thread_controls = threading.Thread(target=self.controls_facade)

        thread_controls.setDaemon(True)

        thread_terminal.start()
        thread_controls.start()

        thread_terminal.join()

    def terminal_input_facade(self):
        while True:
            print('vx: ', self.controls['vx'])
            print('vy: ', self.controls['vy'])
            print('vz: ', self.controls['vz'])
            print('yaw: ', self.controls['yaw'], end='\n\n')

            print(
                'enter command:',
                '1:\tset x speed',
                '2:\tset y speed',
                '3:\tset z speed',
                '4:\tset yaw',
                '0:\texit',
                sep='\n'
            )
            print('enter command: ')
            command = int(input())

            if command == 0:
                return
            elif command == 1:
                print('enter x velocity: ')
                velocity = int(input())

                self.set_controls('vx', velocity)

                print('x velocity = ', velocity)
            elif command == 2:
                print('enter y velocity: ')
                velocity = int(input())

                self.set_controls('vy', velocity)

                print('y velocity = ', velocity)
            elif command == 3:
                print('enter z velocity: ')
                velocity = int(input())

                self.set_controls('vz', velocity)

                print('z velocity = ', velocity)
            elif command == 4:
                print('enter yaw: ')
                yaw = int(input())

                self.set_controls('yaw', yaw)

                print('yaw = ', yaw)
    def connect(self):
        try:
            self.vehicle = dronekit.connect(self.CONNECTION_STRING, wait_ready=False, baud=self.BAUD_RATE)
            self.vehicle.wait_ready(True, raise_exception=False)

            if self.mode:
                self.vehicle.mode = dronekit.VehicleMode(self.mode)

        # Bad TCP connection
        except socket.error:
            self.drone_error = 'No server exists!'

        # API Error
        except dronekit.APIException:
            self.drone_error = 'Timeout!'

        # Other error
        except:
            self.drone_error = 'Some other error!'

    def disconnect(self):
        self.vehicle.close()

    def check_connection(self):
        if not bool(self.vehicle):
            raise ValueError(self.drone_error)

    def get_gps_position(self):
        self.check_connection()

        return self.vehicle.location.global_relative_frame

    def get_ground_speed(self):
        return self.vehicle.groundspeed

    def set_arm(self, is_arm: bool):
        self.vehicle.armed = is_arm

    # **************************
    # speed and height control
    # **************************
    def condition_yaw(self, heading, relative=False):
        if relative:
            is_relative = 1  # yaw relative to direction of travel
        else:
            is_relative = 0  # yaw is an absolute angle
        # create the CONDITION_YAW command using command_long_encode()
        msg = self.vehicle.message_factory.command_long_encode(
            0, 0,                                               # target system, target component
            dronekit.mavutil.mavlink.MAV_CMD_CONDITION_YAW,     # command
            0,                                                  # confirmation
            heading,                                            # param 1, yaw in degrees
            0,                                                  # param 2, yaw speed deg/s
            1,                                                  # param 3, direction -1 ccw, 1 cw
            is_relative,                                        # param 4, relative offset 1, absolute angle 0
            0, 0, 0                                             # param 5 ~ 7 not used
        )
        # send command to vehicle
        self.vehicle.send_mavlink(msg)

    def send_velocity(self, velocity_x, velocity_y, velocity_z, duration):
        """
        Move vehicle in direction based on specified velocity vectors.
        """
        msg = self.vehicle.message_factory.set_position_target_local_ned_encode(
            0,                                              # time_boot_ms (not used)
            0, 0,                                           # target system, target component
            dronekit.mavutil.mavlink.MAV_FRAME_LOCAL_NED,   # frame
            0b0000111111000111,                             # type_mask (only speeds enabled)
            0, 0, 0,                                        # x, y, z positions (not used)
            velocity_x, velocity_y, velocity_z,             # x, y, z velocity in m/s
            0, 0, 0,                                        # x, y, z acceleration (not supported yet, ignored in GCS_Mavlink)
            0, 0                                            # yaw, yaw_rate (not supported yet, ignored in GCS_Mavlink)
        )

        # send command to vehicle on 1 Hz cycle
        for x in range(0, duration):
            self.vehicle.send_mavlink(msg)
            time.sleep(1)

    def set_controls(self, control_name, value=0.0):
        self.controls[control_name] = value

    def arm_and_takeoff(self, aTargetAltitude):
        """
        Arms vehicle and fly to aTargetAltitude.
        """

        print("Arming motors")
        # Copter should arm in GUIDED mode
        self.vehicle.mode = dronekit.VehicleMode("GUIDED")
        self.vehicle.armed = True

        # Confirm vehicle armed before attempting to take off
        while not self.vehicle.armed:
            print(" Waiting for arming...")
            time.sleep(1)

        print("Taking off!")
        self.vehicle.simple_takeoff(aTargetAltitude)  # Take off to target altitude

        # Wait until the vehicle reaches a safe height before processing the goto (otherwise the command
        #  after self.vehicle.simple_takeoff will execute immediately).
        while True:
            print(" Altitude: ", self.vehicle.location.global_relative_frame.alt)
            # Break and return from function just below target altitude.
            if self.vehicle.location.global_relative_frame.alt >= aTargetAltitude * 0.95:
                print("Reached target altitude")
                break
            time.sleep(1)
