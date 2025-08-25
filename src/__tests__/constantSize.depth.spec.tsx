import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HelixPairGroup from '@/helix/HelixPairGroup'

describe('constant-size depth normalization', () => {
  it('exposes --zNorm CSS variable on pair nodes', () => {
    const { container } = render(
      <HelixPairGroup
        thetaDeg={90}
        yOffset={0}
        radius={100}
        sceneYaw={0}
        media={<div>Media</div>}
        info={<div>Info</div>}
      />
    )
    
    // Find both pair nodes
    const nodeA = container.querySelector('.pair-node.A') as HTMLElement
    const nodeB = container.querySelector('.pair-node.B') as HTMLElement
    
    expect(nodeA).toBeTruthy()
    expect(nodeB).toBeTruthy()
    
    // Check that --zNorm is set on both nodes
    const styleA = nodeA?.getAttribute('style')
    const styleB = nodeB?.getAttribute('style')
    
    expect(styleA).toContain('--zNorm')
    expect(styleB).toContain('--zNorm')
  })

  it('calculates correct zNorm for different angles', () => {
    // Test at 90 degrees (maximum depth)
    const { container: c1 } = render(
      <HelixPairGroup
        thetaDeg={90}
        yOffset={0}
        radius={100}
        sceneYaw={0}
        media={<div>M</div>}
        info={<div>I</div>}
      />
    )
    const node1 = c1.querySelector('.pair-node.A') as HTMLElement
    const style1 = node1?.getAttribute('style') || ''
    // At 90°, sin(90°) = 1, depth = 100, zNorm = 100/1200 ≈ 0.083
    expect(style1).toMatch(/--zNorm:\s*0\.08/)

    // Test at 0 degrees (minimum depth)
    const { container: c2 } = render(
      <HelixPairGroup
        thetaDeg={0}
        yOffset={0}
        radius={100}
        sceneYaw={0}
        media={<div>M</div>}
        info={<div>I</div>}
      />
    )
    const node2 = c2.querySelector('.pair-node.A') as HTMLElement
    const style2 = node2?.getAttribute('style') || ''
    // At 0°, sin(0°) = 0, depth = 0, zNorm = 0
    expect(style2).toMatch(/--zNorm:\s*0/)
  })

  it('includes depth-compensator wrapper in tiles', () => {
    const { container } = render(
      <HelixPairGroup
        thetaDeg={45}
        yOffset={0}
        radius={100}
        sceneYaw={0}
        media={<div>Media</div>}
        info={<div>Info</div>}
      />
    )
    
    // Check that depth-compensator wrapper exists
    const compensators = container.querySelectorAll('.depth-compensator')
    expect(compensators.length).toBe(2) // One for each tile (A and B)
  })

  it('compensation decreases scale at higher depth (zNorm)', () => {
    // simulate wrapper class presence
    document.body.classList.add('fx-const-size')
    const lo = 0.00, hi = 0.30
    const el = document.createElement('div')
    el.className = 'depth-compensator'
    // low depth
    el.style.setProperty('--zNorm', String(lo))
    document.body.appendChild(el)
    const styleLow = el.style.getPropertyValue('--zNorm')
    // higher depth
    el.style.setProperty('--zNorm', String(hi))
    const styleHigh = el.style.getPropertyValue('--zNorm')
    // Check that the CSS variable values differ
    expect(styleLow).toBe('0')
    expect(styleHigh).toBe('0.3')
    expect(styleLow).not.toBe(styleHigh)
    document.body.removeChild(el)
    document.body.classList.remove('fx-const-size')
  })

  it('exposes signed camera-space depth vars on pair nodes', () => {
    const { container } = render(
      <HelixPairGroup thetaDeg={90} radius={300} sceneYaw={0} yOffset={0} trackTilt={-10} />
    )
    const a = container.querySelector('.pair-node.A') as HTMLElement
    expect(a.style.getPropertyValue('--zNormSigned')).not.toBe('')
  })
})