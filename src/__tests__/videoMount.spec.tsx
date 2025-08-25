import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('video mounting smoke test (no app code change)', () => {
  it('renders a <video> tag with the loops asset path', () => {
    const src = '/Projects/Loops/Borderline_v01.mp4'
    render(
      <video data-testid="loops-video" src={src} controls preload="none" />
    )
    const vid = screen.getByTestId('loops-video') as HTMLVideoElement
    expect(vid).toBeTruthy()
    expect(vid.getAttribute('src')).toBe(src)
  })
})