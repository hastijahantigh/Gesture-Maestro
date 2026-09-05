from __future__ import annotations
import math
import time
from threading import Thread

import cv2 as cv
import mediapipe as mp

from play_midi import play_midi
from playback_controller import PBControl


MIN_VOL=25
MAX_VOL=127
MIN_PINCH=0.1
MAX_PINCH=1.9


MIN_TEMPO_MULTIPLIER = 1.2
MAX_TEMPO_MULTIPLIER = 0.6
MIDI_PATH = "music/chopin_nocturne_op9_no2.mid"

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(
        model_asset_path="models/hand_landmarker.task"
    ),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=2,
)


def main() -> None:
    controller = PBControl()

    playback_thread = Thread(
        target=play_midi,
        args=(MIDI_PATH, controller),
        daemon=True,
    )
    playback_thread.start()

    landmarker = HandLandmarker.create_from_options(options)
    camera = cv.VideoCapture(0)

    if not camera.isOpened():
        raise RuntimeError("Could not open the webcam.")

    try:
        while True:
            frame_received, frame = camera.read()

            if not frame_received or frame is None:
                print("Failed to receive a frame.")
                break

            frame = cv.flip(frame, 1)
            height, width, _ = frame.shape

            rgb_frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame,
            )

            timestamp_ms = int(time.time() * 1000)

            result = landmarker.detect_for_video(mp_image,timestamp_ms,)
            for i, hand_lnd in enumerate(result.hand_landmarks):
                ##print(i , result.handedness[i])
                hand = result.handedness[i][0].category_name
                if hand=="Left":
                    ind_finger = hand_lnd[8]

                    tempo_multiplier = (MIN_TEMPO_MULTIPLIER+ ind_finger.y* (MAX_TEMPO_MULTIPLIER- MIN_TEMPO_MULTIPLIER))

                    controller.set_tmp_mult(tempo_multiplier)

                    ind_finger_x = int(ind_finger.x * width)    
                    ind_finger_y = int(ind_finger.y * height)

                    cv.circle(frame,(ind_finger_x, ind_finger_y),6,(0, 0, 255),-1,)

                    cv.putText(
                    frame,
                    f"Tempo: {tempo_multiplier:.2f}x",
                    (20, 40),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 255, 255),
                    2,
                    cv.LINE_AA,
                    )
                elif hand=="Right":
                    wrist=hand_lnd[0]
                    mid_mcp=hand_lnd[9]
                    hand_size=math.hypot(mid_mcp.x-wrist.x, mid_mcp.y-wrist.y)

                    norm=0
                    ind_tip=hand_lnd[8]
                    thumb_tip=hand_lnd[4]
                    dx=thumb_tip.x - ind_tip.x
                    dy=thumb_tip.y - ind_tip.y
                    distance = math.hypot(dx, dy)
                    
                    if hand_size!=0:
                        norm=(distance/hand_size)
                        t=(norm-MIN_PINCH)/(MAX_PINCH-MIN_PINCH)
                        t=max(0.0, min(1.0,t))
                        exp=int(MIN_VOL+t* (MAX_VOL-MIN_VOL))
                        controller.set_exp(exp)
                        cv.putText(frame,f"pinch={norm:.2f} | expression={exp}",(80,40),cv.FONT_HERSHEY_SIMPLEX,
                                        0.8,
                                        (255, 255, 255),
                                        2,
                                        cv.LINE_AA,)
                    
                    cv.putText(frame,f"DIST: , {norm:.3f}" ,(60,20),cv.FONT_HERSHEY_SIMPLEX,
                                        0.8,
                                        (255, 255, 255),
                                        2,
                                        cv.LINE_AA,)
                
            cv.imshow("Gesture Music Camera", frame)

            key = cv.waitKey(1) & 0xFF

            if key == ord("q"):
                break

    finally:
        landmarker.close()
        camera.release()
        cv.destroyAllWindows()


if __name__ == "__main__":
    main()