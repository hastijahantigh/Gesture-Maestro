import './style.css'
import {PBC} from './playbackcontroller.js'
import { CameraController } from './camera.js'
import { HandTracker } from './handTracker.js'
import { pieces } from './pieces.js'
import { calculateTempoFromResults,calcEXP } from './gestureMapping.js'
import { midi } from '@tonejs/midi'
import { loadMidi } from './midiLoader.js'
import { AudioEngine } from './audioEngine.js'
import { MidiPlayer } from './midiPlayer.js'
import { SignalStabilizer } from './stabilizer.js'

import { LandmarkOverlay } from './landmarkOverlay.js'


const controller= new PBC()
let currentPiece=pieces[0]
const tempoStabilizer =new SignalStabilizer(0.2)

const expStabilizer=new SignalStabilizer(0.2,2)
const audioengine=new AudioEngine()
const midiPlayer = new MidiPlayer(
  audioengine,
  controller
)


const pieceOptions = pieces
  .map((piece) => {
    return `
      <option value="${piece.id}">
        ${piece.title} — ${piece.composer}
      </option>
    `
  })
  .join('')

document.querySelector('#app').innerHTML = `



<section
  id="onboarding"
  class="onboarding"
  aria-labelledby="intro-title"
>
  <button id="skip-intro-button" class="skip-intro" type="button">
    Skip introduction
  </button>

  <div class="onboarding-glow" aria-hidden="true"></div>

  <div class="onboarding-content">
    <article class="intro-step is-active" data-intro-step="0">
      <div class="brand-mark" aria-hidden="true">GM</div>

      <p class="intro-eyebrow">Gesture-controlled piano</p>

      <h1 id="intro-title">Gesture Maestro</h1>

      <p class="intro-description">
        Control the tempo and expression of piano music
        using your hands.
      </p>

      <button class="intro-next primary-intro-button" type="button">
        Discover how it works
        <span aria-hidden="true">→</span>
      </button>
    </article>

    <article class="intro-step" data-intro-step="1">
      <p class="intro-count">01 / 03</p>
      <p class="intro-eyebrow">Prepare</p>

      <h2>Choose your piece</h2>

      <p class="intro-description">
        Select one of five piano pieces, start the performance,
        and take position during the three-second countdown.
      </p>

      <button class="intro-next primary-intro-button" type="button">
        Next
        <span aria-hidden="true">→</span>
      </button>
    </article>

    <article class="intro-step" data-intro-step="2">
      <p class="intro-count">02 / 03</p>
      <p class="intro-eyebrow">Perform</p>

      <h2>Your hands shape the music</h2>

      <div class="gesture-instructions">
        <p>
          <strong>Right index height</strong>
          controls the tempo.
        </p>

        <p>
          <strong>Left thumb–index distance</strong>
          controls the expression.
        </p>
      </div>

      <button class="intro-next primary-intro-button" type="button">
        Next
        <span aria-hidden="true">→</span>
      </button>
    </article>

    <article class="intro-step" data-intro-step="3">
      <p class="intro-count">03 / 03</p>
      <p class="intro-eyebrow">Stay in control</p>

      <h2>Move naturally</h2>

      <p class="intro-description">
        If a hand leaves the frame, its latest value is preserved.
        Camera processing happens locally, and no video is uploaded.
      </p>

      <button
        id="enter-performance-button"
        class="primary-intro-button"
        type="button"
      >
        Enter performance
        <span aria-hidden="true">→</span>
      </button>
    </article>
  </div>

  <div class="intro-progress" aria-hidden="true">
    <span class="is-active"></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</section>

<div
  id="notification"
  class="notification"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>
<main id="performance-interface" inert aria-hidden="true">
    <h1>Gesture Maestro</h1>

    <p>
      Control the tempo and expression of piano music
      using your hands.
    </p>
    
<section class="piece-picker">
  <label for="piece-select">Choose a piece</label>

  <select id="piece-select">
    ${pieces.map(piece => `
      <option value="${piece.id}">
        ${piece.title} — ${piece.composer}
      </option>
    `).join('')}
  </select>
</section>


<div class="camera-container">
  <video
    id="camera"
    autoplay
    playsinline
    muted
  ></video>

  <canvas
    id="landmark-overlay"
    aria-hidden="true"
  ></canvas>
</div>

<section class="live-readouts">
  <div class="readouts">
    
    <span class="readout-label">Tempo</span>
    <output id="tempo-value">1.00×</output>
  </div>

  <div class="readouts">
    
    <span class="readout-label">Expression</span>
    <output id="expression-value">90</output>
  </div>
</section>


    <button id="start-button" type="button">
      Start Performance
    </button>

    <p id="status">Waiting to start</p>

<button id="stop-camera-button" type="button" disabled>
  End Performance
</button>


  </main>
`

const notification =document.querySelector('#notification')
let notificationTimeout = null


const startButton = document.querySelector('#start-button')
const statusText = document.querySelector('#status')
const tempoValue = document.querySelector('#tempo-value')
const expressionValue = document.querySelector('#expression-value')
const cameraVideo = document.querySelector('#camera')
const landmrkCanvas=document.querySelector('#landmark-overlay')
const pieceSelect = document.querySelector('#piece-select')

const stopCameraButton = document.querySelector('#stop-camera-button')


const onboarding = document.querySelector('#onboarding')
const performanceInterface =document.querySelector('#performance-interface')

const introSteps = [
  ...document.querySelectorAll('.intro-step')
]

const introNextButtons = [
  ...document.querySelectorAll('.intro-next')
]

const introProgressItems = [
  ...document.querySelectorAll('.intro-progress span')
]

const skipIntroButton =document.querySelector('#skip-intro-button')

const enterPerformanceButton =document.querySelector('#enter-performance-button')

let activeIntroStep = 0
let introClosing = false

function showIntroStep(nextStep) {
  if (nextStep < 0 || nextStep >= introSteps.length) {
    return
  }

  introSteps[activeIntroStep].classList.remove('is-active')
  introProgressItems[activeIntroStep].classList.remove('is-active')

  activeIntroStep = nextStep

  introSteps[activeIntroStep].classList.add('is-active')
  introProgressItems[activeIntroStep].classList.add('is-active')

  const heading =introSteps[activeIntroStep].querySelector('h1, h2')

  heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
}




function closeIntroduction() {
  if (introClosing) {
    return
  }

  introClosing = true

  performanceInterface.removeAttribute('inert')
  performanceInterface.removeAttribute('aria-hidden')
  performanceInterface.classList.add('is-visible')

  onboarding.classList.add('is-leaving')

  function finishIntroduction(event) {
    if (
      event.target !== onboarding ||
      event.propertyName !== 'opacity'
    ) {
      return
    }

    onboarding.hidden = true
    startButton.focus()

    onboarding.removeEventListener(
      'transitionend',
      finishIntroduction
    )
  }

  onboarding.addEventListener(
    'transitionend',
    finishIntroduction
  )
}

introNextButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showIntroStep(activeIntroStep + 1)
  })
})

skipIntroButton.addEventListener(
  'click',
  closeIntroduction
)

enterPerformanceButton.addEventListener(
  'click',
  closeIntroduction
)

const camera = new CameraController(cameraVideo)
const handTracker = new HandTracker(cameraVideo)
const landmarkOverlay= new LandmarkOverlay(landmrkCanvas,cameraVideo)
let countdownActive = false

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}
function showNotification(
  message,
  type = 'info',
  duration = 2400
) {
  window.clearTimeout(notificationTimeout)

  notification.textContent = message
  notification.classList.toggle(
    'is-error',
    type === 'error'
  )

  notification.setAttribute(
    'aria-live',
    type === 'error' ? 'assertive' : 'polite'
  )

  notification.classList.add('is-visible')

  notificationTimeout = window.setTimeout(() => {
    notification.classList.remove('is-visible')
  }, duration)
}

async function runStartCountdown() {
  countdownActive = true

  for (let count = 3; count >= 1; count -= 1) {
    statusText.textContent = `Starting in ${count}...`
    await wait(1000)
  }

  countdownActive = false
}

pieceSelect.addEventListener('change', (event) => {
  const selectedId = event.target.value

  const selectedPiece = pieces.find(
    piece => piece.id === selectedId
  )

  if (!selectedPiece) {
    return
  }

  currentPiece = selectedPiece
  controller.reset()
  tempoStabilizer.reset()
  expStabilizer.reset()
  tempoValue.textContent=  `${controller.getTempMult().toFixed(2)}x`
  expressionValue.textContent=  String(controller.getExp())
  statusText.textContent ='Ready to start'
  showNotification(`${currentPiece.title} selected`)
    
})

startButton.addEventListener('click', async () => {

  startButton.disabled = true
  statusText.textContent =
     'Preparing performance...'

  try {

    pieceSelect.disabled = true

    await audioengine.initialize()
    audioengine.setExpression(controller.getExp())

    await camera.start()
    statusText.textContent = 'Loading MIDI...'


  const midi = await loadMidi(currentPiece.midiFile)
midiPlayer.load(midi)
  console.log('MIDI name:', midi.name)
console.log('Duration:', midi.duration)
console.log('Tracks:', midi.tracks.length)

let totalNotes = 0

for (const track of midi.tracks) {
  totalNotes += track.notes.length
}

console.log('Total notes:', totalNotes)
    statusText.textContent =
      'Loading hand-tracking model...'

    await handTracker.initialize()

    handTracker.start((result) => {
      landmarkOverlay.draw(result)
  const labels = []

  for (const categories of result.handedness) {
    const label = categories?.[0]?.categoryName

    if (label) {
      labels.push(label)
    }
  }

  const temp =calculateTempoFromResults(result,currentPiece)

  if (temp !== null) {
    let stableTmp=tempoStabilizer.update(temp)
    controller.setTempMult(stableTmp)

    const tmpNow = controller.getTempMult()

   

    tempoValue.textContent =
      `${tmpNow.toFixed(2)}x`
  }

  const expressionnnnn=calcEXP(result,currentPiece)
  if(expressionnnnn!==null) {
    let stabilizedExp=expStabilizer.update(expressionnnnn)
    controller.setExp(stabilizedExp)
    const expNow=controller.getExp()
    audioengine.setExpression(expNow)


    expressionValue.textContent= String(expNow)
  }

  if (!countdownActive) {
  if (labels.length === 0) {
    statusText.textContent = 'No hands detected'
  } else {
    statusText.textContent =
      `Detected: ${labels.join(', ')}`
  }
  }
})

await runStartCountdown()


await midiPlayer.play()
statusText.textContent = 'Playing'
showNotification('Playing')
pieceSelect.disabled = true

    startButton.disabled = true
    stopCameraButton.disabled = false
  } catch (error) {
    countdownActive=false
    pieceSelect.disabled = false
    console.error(
      'Could not start hand tracking:',
      error
    )
    statusText.textContent =
  `Startup error: ${error.message}`
    
    midiPlayer.stop()
    handTracker.stop()
    camera.stop()
    pieceSelect.disabled = false
    startButton.disabled = false
    stopCameraButton.disabled = true

    
  }
})
stopCameraButton.addEventListener('click', () => {
  midiPlayer.stop()
  handTracker.stop()
  camera.stop()
  landmarkOverlay.clear()

  startButton.disabled = false
  stopCameraButton.disabled = true
  pieceSelect.disabled=false
  statusText.textContent = 'performance ended'
  showNotification('Performance ended')
})


