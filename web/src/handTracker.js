import {
  FilesetResolver,
  HandLandmarker
} from '@mediapipe/tasks-vision'

export class HandTracker {
  constructor(videoElement) {
    this._videoElement = videoElement
    this._landmarker = null
    this._animationFrameId = null
    this._lastVideoTime = -1
  }

  async initialize() {
    if (this._landmarker !== null) {
      return
    }

    const baseUrl = import.meta.env.BASE_URL

    const vision = await FilesetResolver.forVisionTasks( `${baseUrl}wasm` )

    this._landmarker =await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            `${baseUrl}models/hand_landmarker.task`,
          delegate: 'GPU'
        },

        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
  }

  start(onResults) {
    if (this._landmarker === null) {
      throw new Error(
        'HandTracker must be initialized before starting.'
      )
    }

    if (this._animationFrameId !== null) {
      return
    }

    const processFrame = () => {
      const videoIsReady =this._videoElement.readyState >= 2

      const frameIsNew = this._videoElement.currentTime !==  this._lastVideoTime

      if (videoIsReady && frameIsNew) {
        const timestampMs = performance.now()

        const result = this._landmarker.detectForVideo(  this._videoElement,timestampMs )
        this._lastVideoTime = this._videoElement.currentTime
        onResults(result)
      }

      this._animationFrameId = requestAnimationFrame(processFrame)
    }

    processFrame()
  }

  stop() {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId)
      this._animationFrameId = null
    }

    this._lastVideoTime = -1
  }

  close() {
    this.stop()

    if (this._landmarker !== null) {
      this._landmarker.close()
      this._landmarker = null
    }
  }
}
