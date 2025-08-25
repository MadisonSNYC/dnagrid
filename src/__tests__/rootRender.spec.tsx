import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// IMPORTANT: import App from the SAME module path used in src/main.*
import App from '../App' // main.jsx imports from './App.jsx'

describe('Root App render', () => {
  it('renders without crashing and mounts helix container', () => {
    const { container } = render(<App />)
    // Be generous: look for a stable helix landmark
    const helixAssembly =
      container.querySelector('.helix-assembly') ||
      container.querySelector('.helix-scene') ||
      container.querySelector('[data-testid="helix-root"]')

    expect(helixAssembly).toBeTruthy()
  })
})