const MIN_NORM_PIN=0.1
const MAX_NORM_PIN=1.9


export function calculateTempoFromResults(result, piece) {
  const handCount = Math.min(
    result.handedness.length,
    result.landmarks.length
  )

  for (let i = 0; i < handCount; i += 1) {
    const handLabel =
      result.handedness[i]?.[0]?.categoryName

    if (handLabel !== 'Right') {
      continue
    }

    const handLandmarks = result.landmarks[i]
    const indexTip = handLandmarks?.[8]

    if (!indexTip) {
      continue
    }

    const y = Math.max(
      0,
      Math.min(1, indexTip.y)
    )

    const minimum = piece.tempo.minMultiplier
    const maximum = piece.tempo.maxMultiplier

    const tempo =
      maximum + y * (minimum - maximum)

    return tempo
  }

  return null
}

export function calcEXP(result, piece) {
  const handCount = Math.min(
    result.handedness.length,
    result.landmarks.length
  )

  for (let i = 0; i < handCount; i += 1) {
    const handLabel =
      result.handedness[i]?.[0]?.categoryName

    if (handLabel !== 'Left') {
      continue
    }

    const handLandmarks = result.landmarks[i]

    const wrist = handLandmarks?.[0]
    const thumbTip = handLandmarks?.[4]
    const indTip = handLandmarks?.[8]
    const midMCP = handLandmarks?.[9]

    if (!wrist || !thumbTip || !indTip || !midMCP) {
      continue
    }

    const handSizeDx = midMCP.x - wrist.x
    const handSizeDy = midMCP.y - wrist.y

    const handSize =
      Math.hypot(handSizeDx, handSizeDy)

    if (handSize === 0) {
      continue
    }

    const pinchDx = thumbTip.x - indTip.x
    const pinchDy = thumbTip.y - indTip.y

    const pinchDist =
      Math.hypot(pinchDx, pinchDy)

    const normalPinch = pinchDist / handSize

    let t =
      (normalPinch - MIN_NORM_PIN) /
      (MAX_NORM_PIN - MIN_NORM_PIN)

    t = Math.max(0, Math.min(1, t))

    const minn = piece.expression.minimum
    const maxx = piece.expression.maximum

    const expression =
      minn + t * (maxx - minn)

    return expression
  }

  return null
}