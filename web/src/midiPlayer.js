import * as Tone from 'tone'

export class MidiPlayer {
  constructor(audioEngine, controller) {
    this._audioEngine = audioEngine
    this._controller = controller

    this._notes = []
    this._midiDuration = 0

    // Current position inside the MIDI score, in MIDI seconds.
    this._scorePosition = 0

    this._nextNoteIndex = 0
    this._lastAudioTime = 0

    // Only schedule notes slightly ahead so tempo changes
    // can affect playback quickly.
    this._lookaheadSeconds = 0.1
    this._schedulerIntervalMs = 25
    this._minimumScheduleLeadSeconds = 0.03
    this._timerId = null
    this._isPlaying = false
  }

  load(midi) {
    this.stop()

    this._notes = midi.tracks
      .flatMap((track) => track.notes)
      .sort(
        (first, second) =>
          first.time - second.time
      )

    this._midiDuration = midi.duration
  }

  async play() {
    if (this._notes.length === 0) {
      throw new Error('No MIDI piece is loaded.')
    }

    if (this._isPlaying) {
      return
    }

    await this._audioEngine.initialize()

    this._isPlaying = true
    this._lastAudioTime = Tone.now()

    // Schedule the first group immediately.
    this._schedule()

    this._timerId = window.setInterval(
      () => this._schedule(),
      this._schedulerIntervalMs
    )
  }

  _schedule() {
    if (!this._isPlaying) {
      return
    }
    
    const audioNow = Tone.now()

    const tempoMultiplier = Math.max(
      0.05,
      this._controller.getTempMult()
    )

    /*
     * Convert elapsed real time into elapsed score time.
     *
     * multiplier = 2:
     * 1 real second advances the piece by 2 seconds.
     *
     * multiplier = 0.5:
     * 1 real second advances the piece by 0.5 seconds.
     */
    const realElapsed =
      audioNow - this._lastAudioTime

    this._scorePosition +=
      realElapsed * tempoMultiplier

    this._lastAudioTime = audioNow

    /*
     * Convert the real-time lookahead window into
     * an equivalent distance inside the score.
     */
    const scoreHorizon =
      this._scorePosition +
      this._lookaheadSeconds * tempoMultiplier

    while (
      this._nextNoteIndex < this._notes.length &&
      this._notes[this._nextNoteIndex].time <=
        scoreHorizon
    ) {
      const note =this._notes[this._nextNoteIndex]

      const scoreDelay = Math.max(
        0,
        note.time - this._scorePosition
      )
const realDelay =
  scoreDelay / tempoMultiplier
     const safeDelay =Math.max(realDelay,this._minimumScheduleLeadSeconds)


      const scheduledTime =
        audioNow + safeDelay

      const adjustedDuration = Math.max(
        0.03,
        note.duration / tempoMultiplier
      )

      this._audioEngine.scheduleNote(
        note.name,
        adjustedDuration,
        scheduledTime,
        note.velocity
      )

      this._nextNoteIndex += 1
    }

    const allNotesScheduled =
      this._nextNoteIndex >= this._notes.length

    const reachedEnd =
      this._scorePosition >= this._midiDuration

    if (allNotesScheduled && reachedEnd) {
      this._finish()
    }
  }

  stop() {
    if (this._timerId !== null) {
      window.clearInterval(this._timerId)
      this._timerId = null
    }

    this._isPlaying = false
    this._scorePosition = 0
    this._nextNoteIndex = 0
    this._lastAudioTime = 0

    this._audioEngine.stopAll()
  }

  _finish() {
    if (this._timerId !== null) {
      window.clearInterval(this._timerId)
      this._timerId = null
    }

    this._isPlaying = false
    this._scorePosition = 0
    this._nextNoteIndex = 0
    this._lastAudioTime = 0

    this._audioEngine.stopAll()
  }

  isPlaying() {
    return this._isPlaying
  }
}


