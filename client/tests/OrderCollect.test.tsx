import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import OrderCollect from '../src/components/OrderCollect'
import type { OrderRunProps } from '../src/models/schemas'

// Minimal fake WebSocket that records instances so a test can drive the
// onopen/onmessage callbacks the component assigns, and assert on send().
class MockWebSocket {
  static instances: MockWebSocket[] = []
  url: string
  onopen: (() => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: ((err: unknown) => void) | null = null
  send = vi.fn()
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  static latest() {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1]
  }
}

const ORDER_ID = 'ABC12'

// The server returns the run keyed by orderId (data[orderId]), which is the
// shape OrderCollect indexes into.
function runResponse(run: OrderRunProps) {
  return { [ORDER_ID]: run }
}

function makeRun(overrides: Partial<OrderRunProps> = {}): OrderRunProps {
  return {
    orderId: ORDER_ID,
    name: 'Alice',
    email: 'alice@example.com',
    location: 'Taco Place',
    max: 5,
    orders: [{ name: 'Bob', order: 'Burrito' }],
    ...overrides,
  }
}

// Stub fetch so the on-open GET resolves to the given run.
function stubFetch(run: OrderRunProps) {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(runResponse(run)),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderCollect() {
  return render(
    <MemoryRouter initialEntries={[`/order/${ORDER_ID}`]}>
      <Routes>
        <Route path="/order/:orderId" element={<OrderCollect />} />
      </Routes>
    </MemoryRouter>
  )
}

// Fire the component's onopen handler and let the fetch promise chain settle.
async function openSocket() {
  await act(async () => {
    MockWebSocket.latest().onopen?.()
  })
}

beforeEach(() => {
  MockWebSocket.instances = []
  vi.stubGlobal('WebSocket', MockWebSocket)
  // OrderCollect calls alert() on the max-reached submit path; jsdom doesn't
  // implement it, so provide a no-op.
  vi.stubGlobal('alert', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OrderCollect', () => {
  it('opens a WebSocket and fetches the run, rendering its details', async () => {
    stubFetch(makeRun())
    renderCollect()

    // A socket was created pointing at the ws endpoint.
    expect(MockWebSocket.latest().url).toBe('ws://localhost:8000/ws')

    await openSocket()

    // Location heading and the existing order row render.
    expect(await screen.findByText('Taco Place')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Burrito')).toBeInTheDocument()
  })

  it('renders orders pushed over the WebSocket after the initial fetch', async () => {
    stubFetch(makeRun({ orders: [] }))
    renderCollect()
    await openSocket()

    // A subsequent WebSocket message adds an order.
    await act(async () => {
      MockWebSocket.latest().onmessage?.({
        data: JSON.stringify(runResponse(makeRun({ orders: [{ name: 'Carol', order: 'Tacos' }] }))),
      })
    })

    expect(await screen.findByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Tacos')).toBeInTheDocument()
  })

  it('shows the max-reached message and hides the form when the run is full', async () => {
    stubFetch(
      makeRun({ max: 2, orders: [{ name: 'Bob', order: 'Burrito' }, { name: 'Carol', order: 'Tacos' }] })
    )
    renderCollect()
    await openSocket()

    expect(
      await screen.findByText('Maximum number of orders reached for this run.')
    ).toBeInTheDocument()
    // The order form is not rendered in the max-reached state.
    expect(screen.queryByPlaceholderText('Enter your order here')).not.toBeInTheDocument()
  })

  it('sends the order over the WebSocket on submit when under the max', async () => {
    stubFetch(makeRun({ orders: [{ name: 'Bob', order: 'Burrito' }] }))
    const user = userEvent.setup()
    renderCollect()
    await openSocket()

    // Wait for the form to be present (run has loaded).
    const nameInput = await screen.findByPlaceholderText('Enter your name here')
    await user.type(nameInput, 'Dave')
    await user.type(screen.getByPlaceholderText('Enter your order here'), 'Nachos')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    const ws = MockWebSocket.latest()
    await waitFor(() => expect(ws.send).toHaveBeenCalledTimes(1))
    expect(JSON.parse(ws.send.mock.calls[0][0])).toEqual({
      name: 'Dave',
      order: 'Nachos',
      orderId: ORDER_ID,
    })
  })
})
