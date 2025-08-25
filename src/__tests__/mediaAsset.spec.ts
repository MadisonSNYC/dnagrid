import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

const VIDEO_REL = 'public/Projects/Loops/Borderline_v01.mp4'

describe('media asset presence & path hygiene', () => {
  it('Borderline_v01.mp4 exists in public path', () => {
    const p = path.resolve(VIDEO_REL)
    const st = fs.statSync(p)
    expect(st.isFile()).toBe(true)
    expect(st.size).toBeGreaterThan(0)
  })

  it('can be referenced by a public URL path', () => {
    // What the app would use in <video src="/Projects/Loops/Borderline_v01.mp4" />
    const publicHref = '/Projects/Loops/Borderline_v01.mp4'
    // Basic sanity: it should not contain unencoded spaces or backslashes
    expect(publicHref).not.toMatch(/\\/)
    expect(encodeURI(publicHref)).toBe(publicHref)
  })
})