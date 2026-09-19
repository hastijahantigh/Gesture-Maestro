const LANDMARKS_BY_HAND = {
  Right: [8],
  Left: [4, 8]
}

export class LandmarkOverlay {
  constructor(canvasElement, videoElement) {
    this._canvas = canvasElement
    this._video = videoElement
    this._context = canvasElement.getContext('2d')
  }

  draw(result) {
    const sourceWidth = this._video.videoWidth
    const sourceHeight = this._video.videoHeight

    const displayWidth = this._video.clientWidth
    const displayHeight = this._video.clientHeight

    if (sourceWidth === 0 || sourceHeight === 0 ||displayWidth === 0 ||    displayHeight === 0) {
      return
    }

    this._resizeCanvas(displayWidth, displayHeight)

    this._context.clearRect(0,0,displayWidth, displayHeight)
    const coverScale = Math.max(displayWidth / sourceWidth, displayHeight / sourceHeight)
    const renderedWidth =sourceWidth * coverScale
    const renderedHeight =sourceHeight * coverScale
    const offsetX =(displayWidth - renderedWidth) / 2
    const offsetY =(displayHeight - renderedHeight) / 2
    const handCount = Math.min(result.handedness.length, result.landmarks.length)

    for (let handIndex = 0; handIndex < handCount;handIndex += 1) {
      const handLabel =result.handedness[handIndex]?.[0]?.categoryName

      const landmarkIndexes =LANDMARKS_BY_HAND[handLabel]

      if (!landmarkIndexes) {
        continue
      }

      for (const landmarkIndex of landmarkIndexes) {
        const landmark =result.landmarks[handIndex]?.[landmarkIndex]

        if (!landmark) {
          continue
        }

        const x =offsetX +landmark.x * renderedWidth

        const y =offsetY +landmark.y * renderedHeight

        this._drawPoint(x, y)
      }
    }
  }

  clear() {
    const pixelRatio =window.devicePixelRatio || 1

    this._context.clearRect(0,0,this._canvas.width / pixelRatio,this._canvas.height / pixelRatio)
  }

  _resizeCanvas(displayWidth, displayHeight) {
    const pixelRatio =window.devicePixelRatio || 1
    const requiredWidth =Math.round(displayWidth * pixelRatio)
    const requiredHeight =Math.round(displayHeight * pixelRatio)

    if (this._canvas.width === requiredWidth &&this._canvas.height === requiredHeight) {
      return
    }

    this._canvas.width = requiredWidth
    this._canvas.height = requiredHeight
    this._context.setTransform(pixelRatio,0, 0,pixelRatio,0,0)
  }

  _drawPoint(x, y) {
    this._context.beginPath()

    this._context.arc(x,y,7,0,Math.PI * 2)

    this._context.fillStyle = '#d39cff'
    this._context.fill()

    this._context.lineWidth = 2
    this._context.strokeStyle = '#ffffff'
    this._context.stroke()
  }
}
