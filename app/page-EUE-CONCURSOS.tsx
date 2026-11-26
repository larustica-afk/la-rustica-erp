'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
const nav = [{i:'⌂',t:'Inicio'},{i:'▣',t:'Pedidos'},{i:'▤',t:'Catálogo'},{i:'♧',t:'Clientes'},{i:'$',t:'Finanzas'}]
export default function Home(){
 const [active,setActive]=useState('Inicio')
 return <main className="shell">
  <header><div className="brandlock"><Image src="/logo-la-rustica.png" alt="La Rústica" width={54} height={54} className="brandlogo"/><div><div className="brand">LA RÚSTICA</div><div className="tag">Pan Real, Vida Real.</div></div></div><button className="iconbtn" aria-label="Menú">☰</button></header>
  <section className="welcome"><p className="eyebrow">PANEL DE ADMINISTRACIÓN</p><h1>Buen día.</h1><p className="muted">Resumen de la actividad</p></section>
  <section className="metrics"><article><small>Pedidos pendientes</small><strong>—</strong><span>Hoy</span></article><article><small>Producción</small><strong>—</strong><span>Unidades</span></article><article><small>Cobros</small><strong>—</strong><span>Registrados</span></article><article><small>Entregas</small><strong>—</strong><span>Programadas</span></article></section>
  <section className="actions"><h2>Acciones rápidas</h2><div className="actiongrid"><Link href="/pedidos" className="actionlink"><b>＋</b><span>Nuevo pedido</span></Link><Link href="/pedidos" className="actionlink"><b>↗</b><span>Registrar pago</span></Link><Link href="/pedidos" className="actionlink"><b>⌁</b><span>Entregas</span></Link><Link href="/pedidos" className="actionlink"><b>◉</b><span>WhatsApp</span></Link><Link href="/catalogo" className="actionlink"><b>▤</b><span>Catálogo</span></Link><Link href="/clientes" className="actionlink"><b>♧</b><span>Clientes</span></Link></div></section>
  <section className="recent"><div className="row"><h2>Actividad reciente</h2><button className="link">Ver todos</button></div><div className="empty"><div className="bread">✳</div><p>Los pedidos aparecerán aquí.</p><small>Conectaremos este panel con los datos reales.</small></div></section>
  <nav className="bottomnav">{nav.map(n=><Link href={n.t==='Pedidos'?'/pedidos':n.t==='Catálogo'?'/catalogo':n.t==='Clientes'?'/clientes':'/'} key={n.t} onClick={()=>setActive(n.t)} className={active===n.t?'selected':''}><span>{n.i}</span>{n.t}</Link>)}</nav>
 </main>
}
