'use client'

import React, { useRef, useEffect } from 'react'

const WebcamFeed = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error('Webcam access error:', error)
        })
    }
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="rounded-xl w-[400px] h-[300px] object-cover max-sm:hidden"
    />
  )
}

export default WebcamFeed
