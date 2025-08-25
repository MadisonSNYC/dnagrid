import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
// @ts-ignore
import App from '@/App.jsx'

describe('layout structure: isolated scene containers', () => {
  it('renders helix-stage → pin → camera → world hierarchy', () => {
    const { container } = render(<App />)
    const stage = container.querySelector('.helix-stage')
    const pin   = container.querySelector('.helix-pin')
    const cam   = container.querySelector('.helix-camera')
    const world = container.querySelector('.helix-world')

    expect(stage).toBeTruthy()
    expect(pin).toBeTruthy()
    expect(cam).toBeTruthy()
    expect(world).toBeTruthy()
  })
})