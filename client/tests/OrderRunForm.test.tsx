import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import OrderRunForm from '../src/components/OrderRunForm'

// Capture navigation calls without a real router.
const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderForm() {
  return render(
    <MemoryRouter>
      <OrderRunForm />
    </MemoryRouter>
  )
}

async function fillField(user: ReturnType<typeof userEvent.setup>, placeholder: string, value: string) {
  await user.type(screen.getByPlaceholderText(placeholder), value)
}

beforeEach(() => {
  mockNavigate.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OrderRunForm', () => {
  it('shows a validation error and does not submit for an invalid email', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderForm()

    await fillField(user, 'Enter your name here', 'Alice')
    await fillField(user, 'Enter your email here', 'not-an-email')
    await fillField(user, 'Enter location here', 'Taco Place')
    await fillField(user, 'Enter maximum order size', '5')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('posts the order run and navigates to the submitted page on success', async () => {
    const response = {
      orderId: 'ABC12',
      name: 'Alice',
      email: 'alice@example.com',
      location: 'Taco Place',
      max: 5,
    }
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(response),
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderForm()

    await fillField(user, 'Enter your name here', 'Alice')
    await fillField(user, 'Enter your email here', 'alice@example.com')
    await fillField(user, 'Enter location here', 'Taco Place')
    await fillField(user, 'Enter maximum order size', '5')

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    // Posts to the create-order endpoint with the form values as JSON.
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:8000/api/createOrder')
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    expect(JSON.parse(options.body)).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      location: 'Taco Place',
      max: 5,
    })

    // Navigates to the submitted page carrying the server response as state.
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/orderSubmitted/ABC12', {
        state: response,
      })
    )
  })
})
