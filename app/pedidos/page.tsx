'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'

type Order={id:string,name:string,channel:'PDV'|'Particular',items:string,amount:number,status:'Recibido'|'Confirmado'|'En producción'|'Listo'|'Entregado',date:string}
const seed:Order[]=[
 {id:'LR-104',name:'Octaviano',channel:'PDV',items:'4 Panettone',amount:108000,status:'Recibido',date:'Hoy · 09:20'},
 {id:'LR-103',name:'María López',channel:'Particular',items:'1 Panettone',amount:35000,status:'Confirmado',date:'Hoy · 08:55'},
 {id:'LR-102',name:'Nativa',channel:'PDV',items:'6 Panettone',amount:162000,status:'En producción',date:'Hoy · 08:30'},
]
const fmt=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)
export default function Orders(){
 const [orders,setOrders]=useState(seed); const [filter,setFilter]=useState('Todos'); const [show,setShow]=useState(false); const [name,setName]=useState('');const [channel,setChannel]=useState<'PDV'|'Particular'>('Particular');const [qty,setQty]=useState(1)
 const visible=useMemo(()=>orders.filter(o=>filter==='Todos'||o.status===filter),[orders,filter])
 function add(){if(!name.trim()||qty<(channel==='PDV'?4:1))return;const o:Order={id:`LR-${105+orders.length}`,name:name.trim(),channel,items:`${qty} Panettone`,amount:qty*(channel==='PDV'?27000:35000),status:channel==='PDV'?'Recibido':'Confirmado',date:'Ahora'};setOrders([o,...orders]);setShow(false);setName('');setQty(channel==='PDV'?4:1)}
 function whatsapp(o:Order){const text=encodeURIComponent(`Hola ${o.name}! Pedido ${o.id} de La Rústica: ${o.items}. Total ${fmt(o.amount)}. ¡Gracias!`);window.open(`https://wa.me/?text=${text}`,'_blank')}
 return <main className="orders-shell"><header className="orders-header"><Link href="/" className="back">←</Link><div><div className="brand">LA RÚSTICA</div><div className="tag">Pedidos</div></div><button className="new-order" onClick={()=>setShow(true)}>＋ Nuevo</button></header>
 <div className="orders-intro"><p className="eyebrow">GESTIÓN COMERCIAL</p><h1>Pedidos</h1><p className="muted">Seguimiento de pedidos y confirmaciones.</p></div>
 <div className="order-filters">{['Todos','Recibido','Confirmado','En producción','Listo','Entregado'].map(x=><button key={x} onClick={()=>setFilter(x)} className={filter===x?'active':''}>{x}</button>)}</div>
 <div className="order-list">{visible.map(o=><article className="order-card" key={o.id}><div className="order-top"><div><small>{o.id} · {o.date}</small><h2>{o.name}</h2></div><span className={`channel ${o.channel==='PDV'?'business':''}`}>{o.channel}</span></div><p className="order-items">{o.items}</p><div className="order-bottom"><strong>{fmt(o.amount)}</strong><span className={`status ${o.status.replace(' ','-').toLowerCase()}`}>{o.status}</span></div><button className="wa-button" onClick={()=>whatsapp(o)}>Compartir por WhatsApp ↗</button></article>)}</div>
 {visible.length===0&&<div className="empty">No hay pedidos en este estado.</div>}
 {show&&<div className="modal-back" onClick={()=>setShow(false)}><section className="order-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><h2>Nuevo pedido</h2><button onClick={()=>setShow(false)}>✕</button></div><label>Cliente / comercio<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del cliente" autoFocus/></label><label>Canal<select value={channel} onChange={e=>{setChannel(e.target.value as 'PDV'|'Particular');setQty(e.target.value==='PDV'?4:1)}}><option>Particular</option><option>PDV</option></select></label><label>Panettone · cantidad<input type="number" min={channel==='PDV'?4:1} value={qty} onChange={e=>setQty(Number(e.target.value))}/></label><div className="price-preview"><span>Total estimado</span><strong>{fmt(qty*(channel==='PDV'?27000:35000))}</strong><small>{channel==='PDV'?'Precio PDV · mínimo 4 unidades':'Precio público'}</small></div><button className="save-order" onClick={add}>Agregar pedido</button></section></div>}
 <nav className="bottomnav"><Link href="/">⌂<span>Inicio</span></Link><a className="selected" href="/pedidos">▣<span>Pedidos</span></a><Link href="/">♧<span>Clientes</span></Link><Link href="/">$<span>Finanzas</span></Link></nav></main>
}
