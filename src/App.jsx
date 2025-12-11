import React, {useState, useEffect} from 'react'
import Login from './components/Login'
import Record from './components/Record'
import Reports from './components/Reports'
import { supabase } from './supabaseClient'

/*
  App.jsx
  - Top-level application component that manages:
    * Authentication state (supabase session)
    * Page routing between `Record` and `Reports`
    * Global UI shell (top navigation)
  Note: keep global app-level effects (auth, feature flags) here.
*/
export default function App(){
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(() => localStorage.getItem('currentPage') || 'record')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    
    localStorage.setItem('currentPage', page)
  }, [page])

  useEffect(()=>{
    
    async function checkAuth(){
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if(session && session.user){
          setUser(session.user)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if(session && session.user){
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  

  if(loading) return (
    <div className="container" style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh'}}>
      <div style={{textAlign:'center', color:'white'}}>
        <div style={{fontSize:'1.2rem', fontWeight:'600'}}>Loading...</div>
      </div>
    </div>
  )

  if(!user) return (
    <div className="container">
      <Login onSignIn={(u) => setUser(u)} />
    </div>
  )

  return (
    <div>
      <div className="top-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          <img src="/logo.jpg" alt="logo" className="nav-logo" />
          <span className="nav-title">Barangay Clinic</span>
        </div>
        <div id="primary-navigation" className={`nav-center ${mobileMenuOpen ? 'open' : ''}`}>
          <button className={`nav-btn ${page==='record'?'active':''}`} onClick={()=>{setPage('record'); setMobileMenuOpen(false)}} aria-pressed={page==='record'}>Records</button>
          <button className={`nav-btn ${page==='reports'?'active':''}`} onClick={()=>{setPage('reports'); setMobileMenuOpen(false)}} aria-pressed={page==='reports'}>Reports</button>
        </div>
        <div className="nav-right">
          <span className="nav-user">{user.email}</span>
          <button className="nav-btn" onClick={async ()=>{ try { await supabase.auth.signOut() } catch(e){ console.error('Sign out failed', e) } finally { setUser(null) } }}>Sign Out</button>
          <button className="nav-toggle" aria-controls="primary-navigation" aria-expanded={mobileMenuOpen} onClick={()=>setMobileMenuOpen(v=>!v)}>
            <span className="sr-only">Toggle menu</span>
            ☰
          </button>
        </div>
      </div>
      <div className="container">
        {page === 'record' && <Record user={user} onSignOut={() => setUser(null)} />}
        {page === 'reports' && <Reports />}
      </div>
    </div>
  )
}
