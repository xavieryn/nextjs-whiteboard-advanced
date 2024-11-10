'use client'

import React, { useState, useEffect } from 'react'

export default function WhackGPT() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex w-full rounded-lg shadow-md align-middle">
      <div className="text-lg font-bold ">
        Whack the whale is typing
        <span className="inline-block w-16 overflow-hidden">
          <span className="animate-pulse">{dots}</span>
          <span className="invisible">...</span>
        </span>
      </div>
    </div>
  )
}