export class CameraController {
  constructor(videoElement) {
    this._videoElement = videoElement
    this._stream = null
  }

  async start() {
    if (this._stream !== null) {
      return
    }

    this._stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

    this._videoElement.srcObject = this._stream

    await this._videoElement.play()
  }

  stop() {
    if (this._stream === null) {
      return
    }

    const tracks = this._stream.getTracks()

    tracks.forEach((track) => {
      track.stop()
    })

    this._videoElement.srcObject = null
    this._stream = null
  }

  isRunning() {
    return this._stream !== null
  }
}