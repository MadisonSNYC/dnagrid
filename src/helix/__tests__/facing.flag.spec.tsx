import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HelixPairGroup from '@/helix/HelixPairGroup'

describe('front/back facing flag', () => {
  it('sets data-facing on nodes', () => {
    const { container } = render(
      <HelixPairGroup thetaDeg={0} radius={300} sceneYaw={0} />
    )
    const a = container.querySelector('.pair-node.A') as HTMLElement
    const b = container.querySelector('.pair-node.B') as HTMLElement
    expect(a?.getAttribute('data-facing')).toMatch(/front|back/)
    expect(b?.getAttribute('data-facing')).toMatch(/front|back/)
  })
})