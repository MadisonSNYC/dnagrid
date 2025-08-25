import fs from 'node:fs'
import path from 'node:path'
import { expect, it, describe } from 'vitest'

describe('entry path integrity', () => {
  it('main.jsx imports ./App.jsx as canonical root', () => {
    const main = fs.readFileSync(path.resolve('src/main.jsx'), 'utf8')
    expect(main).toMatch(/import\s+App\s+from\s+['"]\.\/App\.jsx['"]/)
  })
})