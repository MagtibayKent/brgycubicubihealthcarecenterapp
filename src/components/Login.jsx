/*
  Login.jsx
  - Simple email/password sign-in form using Supabase auth.
  - On successful sign-in, calls `onSignIn(user)` provided by App.
  - Keep client-side validation minimal; server returns auth errors.
*/
import React, {useState} from 'react'
import { supabase } from '../supabaseClient'

export default function Login({onSignIn}){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  async function handleSignIn(e){
    e.preventDefault()
    setMessage(null)
    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if(error) throw error
      setMessage({type:'success', text:'Signed in'})
      onSignIn(data.user)
    }catch(err){
      setMessage({type:'error', text: err.message})
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.jpg" alt="logo" className="logo" />
        </div>
        <h1>Barangay Clinic</h1>
        <p className="subtitle">Please sign in to continue</p>
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Sign In</button>
        </form>
        {message && (
          <div className={`message ${message.type==='success'?'success':'error'}`}>{message.text}</div>
        )}
      </div>
    </div>
  )
}
