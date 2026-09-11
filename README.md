# Gesture Maestro

A browser-based human–computer interaction project that allows users to control the **tempo** and **expression** of a MIDI piano performance through hand gestures captured by a webcam.

**[Try the live demo](https://hastijahantigh.github.io/Gesture-Maestro/)**

Gesture Maestro combines real-time hand tracking, gesture mapping, MIDI processing, and browser-based audio playback. The final application runs entirely on the client side and does not require a backend or database.

## Interaction

Gesture Maestro uses two continuous hand controls:

| Hand gesture                                     | Musical parameter |
| ------------------------------------------------ | ----------------- |
| Vertical position of the right index finger      | Tempo             |
| Distance between the left thumb and index finger | Expression        |

The interface displays only the three landmarks directly involved in the interaction:

* Right index fingertip
* Left index fingertip
* Left thumb tip

Landmark visualization can be disabled from the interface.

## Features

* Real-time hand tracking through a webcam
* Continuous tempo and expression control
* Five selectable classical piano pieces
* Locally hosted piano samples
* Three-second preparation countdown
* Optional fingertip landmark visualization
* Signal stabilization for smoother gesture control
* Missing-hand handling that preserves the most recent control value
* Fully client-side processing
* Static deployment through GitHub Pages

## Available Pieces

* Brahms — Waltz in A-flat Major, Op. 39, No. 15
* Chopin — Nocturne in E-flat Major, Op. 9, No. 2
* Chopin — Prelude in A Major, Op. 28, No. 7
* Chopin — Prelude in C-sharp Minor, Op. 45
* Schumann — Melody, Op. 68, No. 1

## How It Works

1. The browser obtains webcam frames after the user grants permission.
2. MediaPipe Hand Landmarker detects hand landmarks locally.
3. The right index-finger height is mapped to a tempo multiplier.
4. The left thumb–index distance is mapped to an expression value.
5. An exponential moving average reduces frame-to-frame instability.
6. A small deadband prevents insignificant expression fluctuations.
7. The MIDI performance is scheduled and rendered using browser-based piano samples.

The final system uses an EMA smoothing factor of `0.2` and an expression deadband of `2`. Separate stabilizers are maintained for tempo and expression, and their state is reset when a new piece is selected.

## Technology

* JavaScript
* Vite
* MediaPipe Tasks Vision
* Tone.js
* `@tonejs/midi`
* Web Audio API
* HTML and CSS
* GitHub Pages

## Privacy

Gesture Maestro is designed to process webcam frames locally in the browser. It has no backend, user accounts, or database, and it does not include a recording feature.

Camera access is controlled by the browser and must be explicitly permitted by the user.

## Running Locally

### Requirements

* Node.js
* npm
* A webcam
* A modern desktop browser such as Chrome or Edge

### Installation

Clone the repository:

```bash
git clone https://github.com/hastijahantigh/gesture-maestro.git
cd gesture-maestro/web
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite and grant camera permission when requested.

### Production Build

```bash
npm run build
npm run preview
```

## Repository Structure

```text
gesture-maestro/
├── src/                    # Early Python prototype
├── models/                 # Hand-landmarker model used by the prototype
├── web/
│   ├── public/
│   │   ├── midi/           # MIDI performances
│   │   ├── models/         # Browser hand-landmarker model
│   │   ├── piano/          # Locally hosted piano samples
│   │   └── wasm/           # MediaPipe WebAssembly runtime
│   └── src/                # Production web application
├── .github/workflows/      # GitHub Pages deployment
└── THIRD_PARTY_NOTICES.md  # Third-party asset attribution
```



> **Note:** The root `requirements.txt` belongs only to the early Python
> prototype. The production web application uses the dependencies declared in
> `web/package.json`.

## Python Prototype

The repository includes an early Python prototype developed with OpenCV, MediaPipe, `pygame.midi`, and Mido.

The prototype was used to test the original interaction concept before the project was rebuilt as an accessible browser application. It is retained as part of the project’s development history and may require additional environment configuration to run.

## Limitations

* Reliable tracking depends on lighting, camera quality, and hand visibility.
* Both hands must remain sufficiently visible for simultaneous control.
* Gesture control is more reliable on desktop browsers than on mobile devices.
* Audio timing and responsiveness can vary between devices and browsers.
* The included Python prototype is experimental and is not the primary application.
* The system does not attempt to infer conducting gestures or musical intention automatically.

## Project Status

Gesture Maestro is a completed interactive prototype. Its purpose is to explore continuous, touch-free musical control and serve as a foundation for future work in music technology, human computer interaction, and Music Information Retrieval.

## Acknowledgements

* [MediaPipe](https://developers.google.com/mediapipe) for browser-based hand landmark detection
* [Tone.js](https://tonejs.github.io/) for Web Audio scheduling and playback
* [`@tonejs/midi`](https://github.com/Tonejs/Midi) for MIDI parsing
* Alexander Holm for the Salamander Grand Piano samples

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for piano-sample licensing and attribution.


## Development Journey

Gesture Maestro evolved from an early Python experiment into a deployable
browser application. The complete technical journey including architectural
changes, unsuccessful approaches, audio and scheduling problems, interface
iterations, final decisions, and limitations is documented in
[Development Journey](docs/DEVELOPMENT_JOURNEY.md).
