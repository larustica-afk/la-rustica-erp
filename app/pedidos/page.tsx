
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

const seed: Order[] = [
  {id:'LR-104',name:'Octaviano',channel:'PDV',items:'4 Panettone',amount:108000,status:'Recibido',date:'Hoy · 09:20'},
  {id:'LR-102',name:'Nativa',channel:'PDV',items:'6 Panettone',amount:162000,status:'En producción',date:'Hoy · 08:30'},
]

const fmt=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)

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

export default function Orders(){
  const [orders,setOrders]=useState<Order[]>(seed)
  const [filter,setFilter]=useState('Todos')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  async function loadWebOrders(){
    if(!supabase){
      setError('No se encontró la conexión con Supabase.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const {data,error:fetchError}=await supabase
      .from('web_orders_view')
      .select('*')
      .order('created_at',{ascending:false})

    if(fetchError){
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const webData=data||[]
    const ids=webData.map((o:any)=>o.id)

    let itemData:any[]=[]

    if(ids.length){
      const {data:items,error:itemError}=await supabase
        .from('order_items')
        .select('order_id,product_name_snapshot,quantity')
        .in('order_id',ids)

      if(itemError){
        setError(itemError.message)
        setLoading(false)
        return
      }
      itemData=items||[]
    }

    const mapped:Order[]=webData.map((o:any)=>{
      const products=itemData
        .filter(i=>i.order_id===o.id)
        .map(i=>`${i.quantity} ${i.product_name_snapshot}`)
        .join(', ')

      return {
        id:`WEB-${o.order_number}`,
        name:o.customer_name||'Cliente',
        channel:'Particular',
        items:products||'Pedido web',
        amount:Number(o.total||0),
        status:statusMap[o.status]||'Recibido',
        date:new Date(o.created_at).toLocaleString('es-AR'),
        phone:o.whatsapp||o.phone||'',
        delivery:o.delivery_notes||''
      }
    })

    setOrders([...mapped,...seed])
    setLoading(false)
  }

  useEffect(()=>{
    loadWebOrders()
  },[])

  const visible=useMemo(
    ()=>orders.filter(o=>filter==='Todos'||o.status===filter),
    [orders,filter]
  )

  function whatsapp(o:Order){
    const text=encodeURIComponent(
      `Hola ${o.name}! Pedido ${o.id} de La Rústica: ${o.items}. Total ${fmt(o.amount)}. ¡Gracias!`
    )
    window.open(`https://wa.me/${o.phone?.replace(/\D/g,'')||''}?text=${text}`,'_blank')
  }

  return (
    <main className="orders-shell">
      <header className="orders-header">
        <Link href="/" className="back">←</Link>
        <div>
          <div className="brand">LA RÚSTICA</div>
          <div className="tag">Pedidos</div>
        </div>
        <button className="new-order" onClick={loadWebOrders}>↻ Actualizar</button>
      </header>

      <div className="orders-intro">
        <p className="eyebrow">GESTIÓN COMERCIAL</p>
        <h1>Pedidos</h1>
        <p className="muted">Seguimiento de pedidos y confirmaciones.</p>
      </div>

      <div className="order-filters">
        {['Todos','Recibido','Confirmado','En producción','Listo','Entregado'].map(x=>
          <button key={x} onClick={()=>setFilter(x)} className={filter===x?'active':''}>{x}</button>
        )}
      </div>

      {loading&&<div className="empty">Cargando pedidos…</div>}
      {error&&<div className="empty">{error}</div>}

      <div className="order-list">
        {visible.map(o=>
          <article className="order-card" key={o.id}>
            <div className="order-top">
              <div>
                <small>{o.id} · {o.date}</small>
                <h2>{o.name}</h2>
              </div>
              <span className={`channel ${o.channel==='PDV'?'business':''}`}>{o.channel}</span>
            </div>

            <p className="order-items">{o.items}</p>

            {o.delivery&&<p className="muted">{o.delivery}</p>}

            <div className="order-bottom">
              <strong>{fmt(o.amount)}</strong>
              <span className={`status ${o.status.replace(' ','-').toLowerCase()}`}>{o.status}</span>
            </div>

            <button className="wa-button" onClick={()=>whatsapp(o)}>
              Compartir por WhatsApp ↗
            </button>
          </article>
        )}
      </div>

      {!loading&&visible.length===0&&<div className="empty">No hay pedidos en este estado.</div>}

      <nav className="bottomnav">
        <Link href="/">⌂<span>Inicio</span></Link>
        <a className="selected" href="/pedidos">▣<span>Pedidos</span></a>
        <Link href="/">♧<span>Clientes</span></Link>
        <Link href="/">$<span>Finanzas</span></Link>
      </nav>
    </main>
  )
}
