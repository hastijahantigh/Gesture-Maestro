import time

import pygame.midi


OUTPUT_DEVICE_ID = 1  

pygame.midi.init()

output = pygame.midi.Output(OUTPUT_DEVICE_ID)

try:
    output.set_instrument(0)

    output.note_on(60, 100)
    time.sleep(1)
    output.note_off(60, 100)

finally:
    del output
    pygame.midi.quit()