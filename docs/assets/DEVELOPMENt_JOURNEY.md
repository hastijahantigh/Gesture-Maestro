# Gesture Maestro: Development Journey and Engineering Decisions

> A technical case study of building a browser-based, gesture-controlled MIDI piano performance system.

## 1. Project Overview
esture Maestro is a browser-based interactive music system that allows a user to control the tempo and expression of a MIDI piano performance through hand movements captured by a webcam. The vertical position of the right index finger controls tempo, while the distance between the left thumb and index finger controls expression.

The final application combines MediaPipe hand tracking, continuous gesture mapping, signal stabilization, MIDI processing, and browser-based audio playback. It includes five selectable classical piano pieces and uses locally hosted piano samples to produce audio without relying on an external playback service. The application runs entirely on the client side and is deployed as a static website through GitHub Pages.

The project began as a small Python prototype and later evolved into a complete web application. This document records that process: the original design, technical transitions, unsuccessful approaches, implementation problems, final decisions, and lessons learned.

Gesture Maestro should be understood as an interactive prototype and engineering exploration rather than a formally evaluated research system. Its main contribution is the integration of real-time computer vision and musical control into an application that other users can access directly through a browser.



## 2. Motivation and Initial Goals
Gesture Maestro was an idea that came to me when i was practicing a Chopin Nocturne , in particular Op.69,No.2 , and it was almost frustrating at some point because i could not play the dynamics the way i truly felt while listenign to other perfomrances. As a result of that , I thought with myself that maybe other people who are not capable of playing an instrument , also might want to try to put their emotions into the piece and have a close,yet far experience in playing an instrument , and since piano was by my side for the past 14 years as well as my background in computer science, i wondered what it would be like if we could give them the ability to control the tempo and dynamic of it .
And for sure there are many interface elements available , but i wanted the experience for users to be as easy and convinient as possible.

The initial idea was intentionally simple: track the user’s hands through a webcam and convert two continuous movements into musical parameters. Vertical movement of one hand would control tempo, while the distance between two fingers on the other hand would control expression. The music itself would come from an existing MIDI performance, allowing the user to reshape its playback rather than generate or perform individual notes.

The initial objectives were:

Detect both hands in real time using a standard webcam.
Map simple hand movements to continuous musical controls.
Apply tempo and expression changes during MIDI playback.
Keep the interaction understandable without requiring specialist hardware.
Provide enough visual feedback for the user to understand what the system detects.
Make the final application accessible to other people without requiring a complex installation process.

Several practical constraints influenced the project. A backend or database would introduce hosting, maintenance, privacy, and accessibility concerns without providing a necessary function for the final interaction. Access to external services could also be unreliable, so important runtime assets—including the hand-tracking model, WebAssembly files, MIDI files, and piano samples—were eventually hosted directly with the application.

These constraints led to a fully client-side design. Camera processing, gesture mapping, MIDI scheduling, and audio playback all take place within the user’s browser.

## 3. Phase One: Python Prototype

### 3.1 Initial Architecture

The first version was built in Python. OpenCV captured webcam frames, MediaPipe detected the hands, and `pygame.midi` handled MIDI output. A playback controller connected the gesture values to the music.

This version was useful because each part could be tested alone before building a full interface.

### 3.2 What the Prototype Demonstrated

The prototype showed that two hand gestures could control two musical values at the same time. The right index finger could change tempo, while the left-hand pinch could change expression.

It also showed the main difficulty of the project: raw hand-tracking values changed too quickly. Small hand movements could create unwanted changes in the music.

### 3.3 Limitations of the Python Version

The Python version needed a local setup, Python packages, and access to a MIDI output device. This made it difficult to share with other users. It also had a basic interface and was not suitable for direct online use.

For these reasons, the Python code remained a prototype and the main project moved to the browser.

## 4. Transition to a Web Application

### 4.1 Why the Project Moved to the Browser

A web application was easier to share and test. Users only needed a browser, webcam, and internet connection to open the deployed page. No Python setup or separate MIDI software was required.

The browser also allowed the interface, camera input, hand tracking, MIDI playback, and audio output to stay inside one application.

### 4.2 Technology Changes

The web version used JavaScript and Vite. MediaPipe Tasks Vision replaced the Python hand-tracking setup. Tone.js produced the audio, and `@tonejs/midi` was used to read the MIDI files.

The hand-tracking model, WebAssembly files, MIDI files, and piano samples were stored with the project. This reduced the need for external services during use.

### 4.3 Client-Side Architecture

The application was divided into small modules for camera control, hand tracking, gesture mapping, signal stabilization, MIDI loading, playback scheduling, audio, and interface state.

All processing happens in the browser. Webcam frames are not sent to a server.

## 5. Interaction Design

### 5.1 Tempo Gesture

The vertical position of the right index fingertip controls tempo. Moving the finger higher or lower changes the playback speed within a limited range. The final tempo multiplier is kept between `0.6` and `1.2` so the piece stays playable.

### 5.2 Expression Gesture

The distance between the left thumb and index finger controls expression. A wider pinch produces a stronger sound, while a smaller distance produces a softer sound.

Each piece uses its own expression range because the MIDI files do not all have the same original note velocities.

### 5.3 Interface and User Flow

The user first selects one of five pieces. After pressing **Start Performance**, the application starts the camera and shows a three-second countdown. This gives the user time to place both hands before the music begins.

The interface shows the current tempo and expression values. It also includes clear start and stop controls, a status message, and short instructions.

### 5.4 Landmark Visualization

An optional overlay shows only the three points used by the system: the right index fingertip, left index fingertip, and left thumb tip.

Earlier versions showed more camera information, but this made the interface busy and sometimes caused alignment problems. The final design keeps the landmark display optional.

## 6. Final System Architecture

### 6.1 Hand-Tracking Pipeline

The webcam provides video frames to MediaPipe Hand Landmarker. The tracker finds both hands and returns landmark positions. The application then selects the three landmarks needed for control.

If one hand briefly leaves the frame, the system keeps its last valid value. This prevents sudden jumps caused by a missed detection.

### 6.2 Gesture Mapping and Stabilization

Raw landmark values are converted into tempo and expression values. An Exponential Moving Average with an alpha value of `0.2` smooths both control signals.

Expression also uses a deadband of `2`. Very small changes are ignored. This reduces unwanted volume movement when the user tries to hold a steady pose.

The stabilizers reset when the selected piece changes, so values from one piece do not affect the next one.

### 6.3 MIDI Playback Pipeline

The selected MIDI file is loaded and its notes are prepared for playback. A scheduler checks which notes should play next and adjusts their timing using the current tempo value.

A minimum lead time of `0.03` seconds helps avoid notes being scheduled too late. The scheduler was kept simple because more complex changes caused timing problems during development.

### 6.4 Audio Rendering

Tone.js uses a sampler made from locally stored piano recordings. MIDI pitch and velocity data are sent to the sampler, while the expression gesture changes the output gain.

The application waits until the piano samples are ready before playback begins. This prevents the first notes from playing before the audio files are loaded.

### 6.5 Application State and Piece Switching

The application tracks the selected piece, camera state, countdown, playback state, sample-loading state, and current gesture values.

Changing the piece stops the current performance, loads the new MIDI file, and resets the control values. This avoids notes or settings carrying over between pieces.

## 7. Major Engineering Challenges and Dead Ends

### 7.1 Unstable Gesture Signals

Raw hand landmarks were too sensitive. Even a small movement could change tempo or expression many times in one second.

Smoothing reduced this problem, but strong smoothing also made the controls feel slow. The final version uses an EMA value of `0.2`, a small expression deadband, and limited output ranges as a balance between stability and response time.

### 7.2 Audio Quality and Instrument Selection

Early audio choices did not sound enough like a real piano. Some versions sounded thin or unnatural, especially in expressive classical pieces.

Several instrument options were tested. The final version uses locally stored piano samples because they sound better than a basic synthesizer and do not depend on an external service during playback.

### 7.3 Sample Loading and Startup Failures

At first, playback could begin before the samples were loaded. This caused errors such as “buffer is either not set or not loaded.” In some tests, only the first note played and the application stopped.

The solution was to create one sample-loading promise and wait for it before starting the performance.

### 7.4 MIDI Timing and Scheduling Regressions

Timing was the most difficult part of the project. Some scheduler changes caused late notes, missing notes, wrong note positions, or short pauses during playback.

When a change made the result worse, the scheduler was returned to the last stable version. A small scheduling lead time was then added without changing the whole playback method.

### 7.5 Interface Regressions

Changes to the camera view and landmark layer sometimes caused an empty screen, incorrect sizing, or misaligned points. Too many error messages also made the project look unfinished.

The final interface was simplified. Only useful status information was kept, and the landmark view became optional.

### 7.6 Repository Size and GitHub Problems

The first Git push included the Python virtual environment. One OpenCV file was larger than GitHub’s file limit, so the push failed.

The virtual environment was removed from version control and added to `.gitignore`. Only source code and required project assets were kept in the repository.

### 7.7 GitHub Pages Deployment

The application worked locally but first showed a blank page on GitHub Pages. The problem came from incorrect asset paths under the repository URL.

A Vite base path and a GitHub Actions deployment workflow were added. Runtime asset paths were also built with `import.meta.env.BASE_URL`. After these changes, the site could load its scripts, model, MIDI files, and piano samples correctly.

### 7.8 Features Considered but Rejected

Several ideas were considered, including gesture recording, conducting gestures, pause control, more pieces, deep learning, a backend, and a full evaluation dashboard.

These features were not needed for the main interaction and would have increased the project size. The final scope stayed focused on two continuous controls, five pieces, stable playback, and browser deployment.

## 8. Final Design Decisions

The final system follows these decisions:

- Use two simple gestures with clear musical meanings.
- Control an existing MIDI performance instead of playing separate notes.
- Keep tempo within `0.6–1.2`.
- Use EMA smoothing and a small expression deadband.
- Hold the last valid value when a hand is briefly missing.
- Use local piano samples and wait for them before playback.
- Keep all processing on the client side.
- Use only three visible landmarks.
- Reset the controls when the piece changes.
- Keep the project small enough to deploy as a static website.

## 9. Testing and Validation

The final application was tested manually with all five pieces. The tests covered starting and stopping, switching pieces, the countdown, missing-hand behavior, tempo control, expression control, sample loading, and GitHub Pages deployment.

Playback and interface problems were fixed through repeated browser tests. However, the project did not include a formal user study or a full numerical evaluation. For this reason, no claim is made that the gestures are optimal or that the system improves musical performance.

## 10. Privacy and Deployment

Gesture Maestro runs as a static GitHub Pages website. It has no backend, user account, or database.

Camera frames are processed inside the browser and are not uploaded by the application. The project does not record or store video, gestures, or personal data.

## 11. Current Limitations

- Hand tracking depends on lighting, camera quality, and hand position.
- The fixed gesture ranges may not feel the same for every user.
- Browser scheduling can still produce small timing changes.
- The system changes tempo and expression but does not let the user play individual notes.
- Expression ranges need separate settings for each MIDI file.
- The project has only been tested informally and mainly on desktop browsers.
- The five pieces provide a small test set and do not cover every musical style.

## 12. Lessons Learned

The project showed that a working prototype is not the same as a shareable application. Moving to the browser required new work in audio loading, file paths, state control, interface design, and deployment.

It also showed that real-time systems need careful balance. More smoothing can improve stability but add delay. More scheduler changes can add features but also damage timing. Small, tested changes were often safer than large rewrites.

Finally, reducing the scope was important. A smaller system that works is more useful than a larger system with many unfinished features.

## 13. Future Direction

Future work could include a small user study, gesture calibration for each user, better timing measurements, and automatic selection of smoothing values. The system could also record control signals so tempo and expression changes can be studied after a performance.

Other possible additions include more musical pieces, new gestures, improved mobile support, and better audio scheduling. These should be added only after the current system is measured more carefully.

## 14. Acknowledgements and Third-Party Assets

Gesture Maestro was built with MediaPipe Tasks Vision, Tone.js, `@tonejs/midi`, and Vite. It also uses a MediaPipe hand-landmark model, piano sample files, and MIDI files for five classical pieces.

The source and license information for every MIDI file, model, and audio sample should remain recorded in the repository when these assets are redistributed. The musical compositions may be in the public domain, but a specific MIDI arrangement or recording can still have its own license.

## Appendix A: Development Timeline

| Stage | Main result |
| --- | --- |
| Initial idea | Two hand gestures were chosen for tempo and expression. |
| Python prototype | Webcam tracking and MIDI control were tested locally. |
| Web transition | The system moved to JavaScript, MediaPipe Tasks Vision, and Tone.js. |
| Stabilization | EMA smoothing, a deadband, and missing-hand handling were added. |
| Audio and timing work | Piano samples, loading control, and a stable scheduler were completed. |
| Interface work | Onboarding, a countdown, value displays, and optional landmarks were added. |
| Repository cleanup | Large local environment files were removed from Git tracking. |
| Deployment | Vite paths and GitHub Actions were configured for GitHub Pages. |
| Final scope | Five pieces and two continuous gesture controls were kept for release. |
