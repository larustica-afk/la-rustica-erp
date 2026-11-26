
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Order = {
  id: string
  name: string
  channel: 'PDV' | 'Particular'
  items: string
  amount: number
  status: 'Recibido' | 'Confirmado' | 'En producción' | 'Listo' | 'Entregado'
  date: string
  phone?: string
  delivery?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)

const statusMap: Record<string, Order['status']> = {
  received: 'Recibido',
  confirmed: 'Confirmado',
  in_production: 'En producción',
  ready: 'Listo',
  delivered: 'Entregado',
  Recibido: 'Recibido',
  Confirmado: 'Confirmado',
  'En producción': 'En producción',
  Listo: 'Listo',
  Entregado: 'Entregado',
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOrders() {
    if (!supabase) {
      setError('No se encontró la conexión con Supabase.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        created_at,
        channel,
        delivery_notes,
        customer_id,
        customers (
          display_name,
          phone,
          whatsapp
        ),
        order_items (
          product_name_snapshot,
          quantity
        )
      `)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('Error al cargar pedidos: ' + fetchError.message)
      setLoading(false)
      return
    }

    const mapped: Order[] = (data || []).map((o: any) => {
      const customer = Array.isArray(o.customers)
        ? o.customers[0]
        : o.customers

      const items = (o.order_items || [])
        .map((i: any) => `${i.quantity} ${i.product_name_snapshot}`)
        .join(', ')

      return {
        id: `LR-${o.order_number}`,
        name: customer?.display_name || 'Cliente',
        channel:
          o.channel === 'retail' || o.channel === 'Particular'
            ? 'Particular'
            : 'PDV',
        items: items || 'Pedido sin detalle',
        amount: Number(o.total || 0),
        status: statusMap[o.status] || 'Recibido',
        date: new Date(o.created_at).toLocaleString('es-AR'),
        phone: customer?.whatsapp || customer?.phone || '',
        delivery: o.delivery_notes || '',
      }
    })

    setOrders(mapped)
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const visible = useMemo(
    () => orders.filter(o => filter === 'Todos' || o.status === filter),
    [orders, filter]
  )

  function whatsapp(o: Order) {
    const phone = (o.phone || '').replace(/\D/g, '')
    const text = encodeURIComponent(
      `Hola ${o.name}! Pedido ${o.id} de La Rústica: ${o.items}. Total ${fmt(o.amount)}. ¡Gracias!`
    )

    window.open(
      phone
        ? `https://wa.me/${phone}?text=${text}`
        : `https://wa.me/?text=${text}`,
      '_blank'
    )
  }

  return (
    <main className="orders-shell">
      <header className="orders-header">
        <Link href="/" className="back">←</Link>

        <div>
          <div className="brand">LA RÚSTICA</div>
          <div className="tag">Pedidos</div>
        </div>

        <button className="new-order" onClick={loadOrders}>
          ↻ Actualizar
        </button>
      </header>

      <div className="orders-intro">
        <p className="eyebrow">GESTIÓN COMERCIAL</p>
        <h1>Pedidos</h1>
        <p className="muted">Seguimiento de pedidos y confirmaciones.</p>
      </div>

      <div className="order-filters">
        {['Todos', 'Recibido', 'Confirmado', 'En producción', 'Listo', 'Entregado'].map(x => (
          <button
            key={x}
            onClick={() => setFilter(x)}
            className={filter === x ? 'active' : ''}
          >
            {x}
          </button>
        ))}
      </div>

      {loading && <div className="empty">Cargando pedidos…</div>}

      {error && <div className="empty">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty">Todavía no hay pedidos registrados.</div>
      )}

      <div className="order-list">
        {visible.map(o => (
          <article className="order-card" key={o.id}>
            <div className="order-top">
              <div>
                <small>{o.id} · {o.date}</small>
                <h2>{o.name}</h2>
              </div>

              <span className={`channel ${o.channel === 'PDV' ? 'business' : ''}`}>
                {o.channel}
              </span>
            </div>

            <p className="order-items">{o.items}</p>

            {o.delivery && <p className="muted">{o.delivery}</p>}

            <div className="order-bottom">
              <strong>{fmt(o.amount)}</strong>
              <span className={`status ${o.status.replace(' ', '-').toLowerCase()}`}>
                {o.status}
              </span>
            </div>

            <button className="wa-button" onClick={() => whatsapp(o)}>
              Compartir por WhatsApp ↗
            </button>
          </article>
        ))}
      </div>

      {!loading && visible.length === 0 && orders.length > 0 && (
        <div className="empty">No hay pedidos en este estado.</div>
      )}

      <nav className="bottomnav">
        <Link href="/">⌂<span>Inicio</span></Link>
        <a className="selected" href="/pedidos">▣<span>Pedidos</span></a>
        <Link href="/">♧<span>Clientes</span></Link>
        <Link href="/">$<span>Finanzas</span></Link>
      </nav>
    </main>
  )
}
