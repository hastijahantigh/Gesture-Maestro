import * as Tone from 'tone'

export class AudioEngine {
  constructor() {
    this._initialized = false

    this._expressionGain =
      new Tone.Gain(90 / 127).toDestination()

    this._samplesReady = new Promise((resolve, reject) => {
      this._markSamplesReady = resolve
      this._markSamplesFailed = reject
    })

    this._synth = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',

        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',

        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',

        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',

        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',

        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',

        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',

        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',

        C8: 'C8.mp3'
      },

      release: 1,

      baseUrl:
        `${import.meta.env.BASE_URL}piano/`,

      onload: () => {
        this._markSamplesReady()
      },

      onerror: (error) => {
        this._markSamplesFailed(error)
      }
    }).connect(this._expressionGain)
  }

  async initialize() {
    if (this._initialized) {
      return
    }

    await Tone.start()

    await this._samplesReady

    this._initialized = true
  }

  setExpression(expression) {
    const gain = expression / 127

    this._expressionGain.gain.rampTo( gain, 0.05 )
  }

  playTestChord() {
    this._synth.triggerAttackRelease(
      ['C4', 'E4', 'G4'],
      1
    )
  }

  scheduleNote(  noteName,duration, startTime, velocity) {
    this._synth.triggerAttackRelease( noteName,  duration,  startTime, velocity )
  }

  stopAll() {
    this._synth.releaseAll()
  }
}
