import time

import mido
import pygame.midi

from playback_controller import PBControl


def play_midi(
    path: str,
    controller: PBControl,
    device_id: int = 1,
) -> None:
    print("Loading MIDI:", path)

    midi_file = mido.MidiFile(path)

    pygame.midi.init()
    output = pygame.midi.Output(device_id)
    output.set_instrument(0)

    print("Playback started")
    
    try:
        prev=None
        for message in midi_file:
            tempo_multiplier = controller.get_tmp_mult()
            exp=controller.get_exp()
            if exp!=prev:
                for channel in range(16):
                    output.write_short(0xB0 + channel, 11, exp)
                prev=exp

            time.sleep(
                message.time / tempo_multiplier
            )

            if message.type == "note_on":
                if message.velocity > 0:
                    output.note_on(
                        message.note,
                        message.velocity,
                        message.channel,
                    )
                else:
                    output.note_off(
                        message.note,
                        0,
                        message.channel,
                    )

            elif message.type == "note_off":
                output.note_off(
                    message.note,
                    message.velocity,
                    message.channel,
                )

    finally:
        output.abort()
        del output
        pygame.midi.quit()