import pygame.midi


pygame.midi.init()

try:
    number_of_devices = pygame.midi.get_count()

    print("MIDI devices:", number_of_devices)

    for device_id in range(number_of_devices):
        info = pygame.midi.get_device_info(device_id)

        interface, name, is_input, is_output, is_opened = info

        print(
            device_id,
            name.decode(),
            "input:", bool(is_input),
            "output:", bool(is_output),
            "opened:", bool(is_opened),
        )

finally:
    pygame.midi.quit()