import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TableCard } from './TableCard'

describe('TableCard', () => {
  it('renders children without a toolbar band when no toolbar is given', () => {
    render(<TableCard>Table content</TableCard>)

    expect(screen.getByText('Table content')).toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('renders the toolbar above the children when given', () => {
    render(
      <TableCard toolbar={<input type="search" aria-label="Search" />}>Table content</TableCard>,
    )

    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByText('Table content')).toBeInTheDocument()
  })
})
