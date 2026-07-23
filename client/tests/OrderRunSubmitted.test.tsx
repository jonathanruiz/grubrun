import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import OrderRunSubmitted from '../src/components/OrderRunSubmitted'

// OrderRunSubmitted reads its data from the router location state (set by
// OrderRunForm on navigation), so we seed MemoryRouter with that state.
const runState = {
  orderId: 'ABC12',
  name: 'Alice',
  email: 'alice@example.com',
  location: 'Taco Place',
  max: 5,
}

function renderWithState(state: typeof runState) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: `/orderSubmitted/${state.orderId}`, state }]}
    >
      <Routes>
        <Route path="/orderSubmitted/:orderId" element={<OrderRunSubmitted />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('OrderRunSubmitted', () => {
  it('renders the submitted order details', () => {
    renderWithState(runState)

    expect(screen.getByText('Order Submitted')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Taco Place')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('links to the order run page for the given orderId', () => {
    renderWithState(runState)

    const link = screen.getByRole('link', {
      name: 'http://localhost:5173/order/ABC12',
    })
    expect(link).toHaveAttribute('href', 'http://localhost:5173/order/ABC12')
  })
})
