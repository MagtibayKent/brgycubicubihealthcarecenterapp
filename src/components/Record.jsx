import React, {useEffect, useState} from 'react'
import { supabase } from '../supabaseClient'

import EditModal from './EditModal'
import DeleteConfirmModal from './DeleteConfirmModal'

/*
  Record.jsx
  - Main page for creating and listing medical visits.
  - Responsibilities:
    * New Visit form (create flow)
    * Search and pagination for visits
    * Edit and Delete visit flows (open modals and call handlers)
    * Maintain local caches for `citizens` and `nurses` used by forms
*/
export default function Record({user, onSignOut}){
  const [visits, setVisits] = useState([])
  const [citizens, setCitizens] = useState([])
  const [nurses, setNurses] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({citizen_id:'', nurse_id:'', visit_date:'', age:'', address:'', symptoms:'', diagnosis:'', notes:''})
  
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(8)
  const [total, setTotal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(()=>{
    fetchCitizens()
    fetchNurses()
    fetchVisits()
  },[])

  
  async function fetchCitizens(){
    const { data, error } = await supabase.from('citizens').select('*').order('name')
    if(error) return console.error(error)
    setCitizens(data || [])
  }

  
  async function fetchNurses(){
    const { data, error } = await supabase.from('nurses').select('*').order('name')
    if(error) return console.error(error)
    setNurses(data || [])
  }

  
  async function fetchVisits(pageIndex = 0, q = query){
    setLoading(true)
    const start = pageIndex * pageSize
    const end = start + pageSize - 1

    
    const baseSelect = 'visit_id, visit_date, symptoms, diagnosis, notes, created_at, citizen_id, nurse_id, citizens(name, age, address), nurses(name, specialization)'
    
    if (q && q.trim() !== '') {
      const esc = q.replace(/%/g, '\\%')
      const pattern = `%${esc}%`.toLowerCase()
      
      const { data, error } = await supabase.from('medical_visits')
        .select(baseSelect)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(0, 1000)
      setLoading(false)
      if (error) return console.error(error)
      const rows = data || []
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
      const filtered = rows.filter(v => {
        const nameField = (v.citizens && v.citizens.name) ? String(v.citizens.name).toLowerCase() : ''
        const ageField = (v.citizens && typeof v.citizens.age !== 'undefined') ? String(v.citizens.age).toLowerCase() : ''
        const nurseField = (v.nurses && v.nurses.name) ? String(v.nurses.name).toLowerCase() : ''
        const symptomsField = v.symptoms ? String(v.symptoms).toLowerCase() : ''
        const diagnosisField = v.diagnosis ? String(v.diagnosis).toLowerCase() : ''
        const addressField = (v.citizens && v.citizens.address) ? String(v.citizens.address).toLowerCase() : ''
        const notesField = v.notes ? String(v.notes).toLowerCase() : ''
        const dateField = v.visit_date ? new Date(v.visit_date).toLocaleDateString().toLowerCase() : ''
        
        return tokens.every(tok => {
          
          if (/^\d+$/.test(tok)) {
            return ageField === tok
          }
          return [nameField, nurseField, symptomsField, diagnosisField, addressField, notesField, dateField].some(f => f.includes(tok))
        })
      })
      const pageSlice = filtered.slice(start, end + 1)
      setVisits(pageSlice)
      setTotal(filtered.length)
      setPage(pageIndex)
      return
    }

    
    const { data, error, count } = await supabase.from('medical_visits')
      .select(baseSelect, { count: 'exact' })
      .order('visit_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end)
    setLoading(false)
    if (error) return console.error(error)
    setVisits(data || [])
    setTotal(typeof count === 'number' ? count : null)
    setPage(pageIndex)
  }

  async function handleCreate(e){
    e.preventDefault()
    if(!form.citizen_id || !form.nurse_id){
      alert('Please enter a citizen and nurse')
      return
    }
    if(!form.visit_date){
      alert('Please enter a visit date')
      return
    }
    if(!form.age || String(form.age).trim() === ''){
      alert('Please enter an age')
      return
    }
    const parsedFormAge = parseInt(form.age, 10)
    if (isNaN(parsedFormAge) || parsedFormAge < 0) { alert('Invalid age'); return }
    if(!form.address || String(form.address).trim() === ''){
      alert('Please enter an address')
      return
    }
    
    let citizenId = parseInt(form.citizen_id, 10)
    if (isNaN(citizenId)) {
      const found = citizens.find(c => c.name === form.citizen_id)
      if (found) citizenId = found.citizen_id
      else {
        const create = window.confirm(`Citizen "${form.citizen_id}" not found. Create new citizen?`)
        if (!create) return
        
        let age = parseInt(form.age, 10)
        if (isNaN(age) || age < 0) {
          const ageRaw = window.prompt(`Enter age for new citizen ${form.citizen_id}:`)
          if (ageRaw === null) return
          age = parseInt(ageRaw, 10)
          if (isNaN(age) || age < 0) { alert('Invalid age'); return }
        }
        
        let address = form.address && String(form.address).trim() !== '' ? form.address : null
        if (!address) {
          address = window.prompt(`Enter address for new citizen ${form.citizen_id}:`)
        }
        if (address === null || String(address).trim() === '') { alert('Address is required'); return }
        const { data: inserted, error: insertErr } = await supabase.from('citizens').insert([{ name: form.citizen_id, age, address }]).select()
        if (insertErr) { alert('Failed to create citizen'); console.error(insertErr); return }
        const newCitizen = Array.isArray(inserted) ? inserted[0] : inserted
        citizenId = newCitizen.citizen_id
        setCitizens(prev => [...prev, newCitizen])
      }
    }
    let nurseId = parseInt(form.nurse_id, 10)
    if (isNaN(nurseId)) {
      const foundN = nurses.find(n => n.name === form.nurse_id)
      if (foundN) nurseId = foundN.nurse_id
      else {
        const createN = window.confirm(`Nurse "${form.nurse_id}" not found. Create new nurse?`)
        if (!createN) return
        const { data: insertedN, error: insertErrN } = await supabase.from('nurses').insert([{ name: form.nurse_id }]).select()
        if (insertErrN) { alert('Failed to create nurse'); console.error(insertErrN); return }
        const newNurse = Array.isArray(insertedN) ? insertedN[0] : insertedN
        nurseId = newNurse.nurse_id
        setNurses(prev => [...prev, newNurse])
      }
    }

    const payload = {
      citizen_id: citizenId,
      nurse_id: nurseId,
      visit_date: form.visit_date || null,
      symptoms: form.symptoms,
      diagnosis: form.diagnosis,
      notes: form.notes
    }
    const { error } = await supabase.from('medical_visits').insert([payload])
    if(error) return console.error(error)
    setForm({citizen_id:'', nurse_id:'', visit_date:'', age:'', address:'', symptoms:'', diagnosis:'', notes:''})
    fetchVisits(0)
  }

  async function handleUpdate(id, updated){
    console.debug('handleUpdate called for id=', id, 'updated=', updated)
    
    const stripSuffixes = (s) => {
      if (!s) return s
      
      return s.replace(/\b(jr|sr|ii|iii|iv)\.?$/i, '').trim()
    }

    const normalize = (s) => {
      const base = String(s || '').toLowerCase()
      const noPunc = base.replace(/[^\w\s]|_/g, '')
      const compact = noPunc.replace(/\s+/g, ' ').trim()
      return stripSuffixes(compact)
    }

    let citizenId = parseInt(updated.citizen_id, 10)
    if (isNaN(citizenId)) {
      const target = String(updated.citizen_id || '').trim()
      const normTarget = normalize(target)
      let found = citizens.find(c => c.name && normalize(c.name) === normTarget)
      if (!found) {
        const tokens = normTarget.split(/\s+/).filter(Boolean)
        found = citizens.find(c => {
          const cn = normalize(c.name)
          return tokens.every(t => cn.includes(t))
        })
      }
      if (found) {
        citizenId = found.citizen_id
      } else {
        
        console.warn(`Citizen "${updated.citizen_id}" not found — keeping original citizen_id`)
        if (editing && editing.citizen_id) {
          citizenId = editing.citizen_id
        } else {
          alert(`Citizen "${updated.citizen_id}" not found. Please select an existing citizen.`)
          return
        }
      }
    }

    let nurseId = parseInt(updated.nurse_id, 10)
    if (isNaN(nurseId)) {
      const normN = normalize(updated.nurse_id || '')
      let foundN = nurses.find(n => n.name && normalize(n.name) === normN)
      if (!foundN) {
        
        const tokensN = normN.split(/\s+/).filter(Boolean)
        foundN = nurses.find(n => {
          const nn = normalize(n.name)
          return tokensN.every(t => nn.includes(t))
        })
      }
      if (!foundN) {
        
        foundN = nurses.find(n => n.name && normalize(n.name).includes(normN))
      }
      if (!foundN) {
        
        const parts = normN.split(/\s+/).filter(Boolean)
        if (parts.length > 1) {
          const last = parts[parts.length - 1]
          foundN = nurses.find(n => n.name && normalize(n.name).split(/\s+/).includes(last))
        }
      }
      if (foundN) {
        nurseId = foundN.nurse_id
      } else {
        
        console.warn(`Nurse "${updated.nurse_id}" not found — keeping original nurse_id`)
        if (editing && editing.nurse_id) {
          nurseId = editing.nurse_id
        } else {
          alert(`Nurse "${updated.nurse_id}" not found. Please select an existing nurse.`)
          return
        }
      }
    }

    
    if (!updated.visit_date || String(updated.visit_date).trim() === '') {
      alert('Visit date is required')
      return
    }
    if (!updated.address || String(updated.address).trim() === '') {
      alert('Address is required')
      return
    }

    
    const shouldUpdateCitizen = (typeof updated.address !== 'undefined' && updated.address !== null) || (typeof updated.age !== 'undefined' && updated.age !== null && String(updated.age).trim() !== '')
    if (shouldUpdateCitizen) {
      if (typeof updated.address !== 'undefined' && updated.address !== null && !String(updated.address).trim()) {
        alert('Address is required')
        return
      }
      try {
        const citizenPayload = {}
        if (typeof updated.address !== 'undefined' && updated.address !== null) citizenPayload.address = updated.address
        if (typeof updated.age !== 'undefined' && updated.age !== null && String(updated.age).trim() !== '') {
          const parsedAge = parseInt(updated.age, 10)
          if (isNaN(parsedAge) || parsedAge < 0) { alert('Invalid age'); return }
          citizenPayload.age = parsedAge
        }
        
        try {
          const currentCitizen = (editing && editing.citizens) ? editing.citizens : citizens.find(c => c.citizen_id === citizenId)
          const currentName = currentCitizen && currentCitizen.name ? String(currentCitizen.name).trim() : ''
          const newName = typeof updated.citizen_id !== 'undefined' && updated.citizen_id !== null ? String(updated.citizen_id).trim() : ''
          if (newName && newName !== '' && newName !== currentName) {
            
            const matched = citizens.find(c => c.name && String(c.name).trim() === newName)
            if (!matched) {
              citizenPayload.name = newName
            }
          }
        } catch (e) {
          console.debug('Name update check error', e)
        }
        if (Object.keys(citizenPayload).length > 0) {
          console.debug('Updating citizen', citizenId, 'payload ->', citizenPayload)
          const { data: addrData, error: addrErr } = await supabase.from('citizens').update(citizenPayload).eq('citizen_id', citizenId).select()
          if (addrErr) {
            console.error('Failed to update citizen:', addrErr)
            alert('Failed to update citizen: ' + (addrErr.message || JSON.stringify(addrErr)))
            return
          }
          console.debug('Citizen update returned:', addrData)
          
          if (Array.isArray(addrData) && addrData.length > 0) {
            const returned = addrData[0]
            setCitizens(prev => prev.map(c => c.citizen_id === returned.citizen_id ? { ...c, ...returned } : c))
          } else {
            setCitizens(prev => prev.map(c => c.citizen_id === citizenId ? { ...c, ...(citizenPayload.address ? { address: citizenPayload.address } : {}), ...(citizenPayload.age ? { age: citizenPayload.age } : {}) } : c))
          }
        }
      } catch (e) {
        console.error('Citizen update error', e)
        alert('Failed to update citizen')
        return
      }
    }

    
    const payload = {
      citizen_id: citizenId,
      nurse_id: nurseId,
      visit_date: updated.visit_date || null,
      symptoms: updated.symptoms || null,
      diagnosis: updated.diagnosis || null,
      notes: updated.notes || null
    }

    console.debug('Updating visit', id, 'payload:', payload)
    const { data, error } = await supabase.from('medical_visits').update(payload).eq('visit_id', id).select()
    console.debug('medical_visits.update response:', { data, error })
    if (error) {
      console.error('Update error:', error)
      alert('Failed to save changes: ' + (error.message || JSON.stringify(error)))
      return
    }
    
    const updatedRow = Array.isArray(data) ? data[0] : data
    console.debug('Update succeeded, returned row:', updatedRow)
    setEditing(null)
    await fetchVisits(page)
    return updatedRow
  }

  async function handleDelete(id){
    console.debug('handleDelete called for id=', id)
    setDeletingId(id)
    const { error } = await supabase.from('medical_visits').delete().eq('visit_id', id)
    console.debug('Delete response:', { error })
    if(error) {
      console.error('Delete error:', error)
      alert('Failed to delete: ' + (error.message || JSON.stringify(error)))
      setDeletingId(null)
      return
    }
    setShowDelete(false)
    setDeleteTarget(null)
    setTimeout(() => {
      const newPage = visits.length === 1 && page > 0 ? page - 1 : page
      fetchVisits(newPage)
      setDeletingId(null)
    }, 400)
  }

  function promptDelete(id){
    setDeleteTarget(id)
    setShowDelete(true)
  }

  function handleSearchSubmit(e){
    e && e.preventDefault()
    fetchVisits(0, query)
  }

  async function handleSignOut(){
    await supabase.auth.signOut()
    onSignOut()
  }

  return (
    <>
      <main className="records-main">
        <section className="page-section active">
          <h2>New Visit</h2>
          <form className="form-container" onSubmit={handleCreate}>
            <div className="form-row">
              <div>
                <label>Citizen</label>
                <div>
                  <input placeholder="Enter name" value={form.citizen_id} onChange={e=>{
                    const val = e.target.value
                    const found = citizens.find(c=>c.name === val)
                    setForm(prev => ({...prev, citizen_id: val, address: found ? (found.address||'') : prev.address, age: found ? (found.age||'') : prev.age}))
                  }} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
                </div>
              </div>
              <div>
                <label>Nurse</label>
                <div>
                  <input placeholder="Enter name" value={form.nurse_id} onChange={e=>setForm({...form, nurse_id: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Visit Date</label>
                <input type="date" value={form.visit_date} onChange={e=>setForm({...form, visit_date: e.target.value})} />
              </div>
              <div>
                <label>Age</label>
                <input placeholder="Enter age" type="number" min="0" value={form.age} onChange={e=>setForm({...form, age: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input placeholder="Enter address" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
            </div>
            <div className="form-group">
              <label>Symptoms</label>
              <textarea value={form.symptoms} onChange={e=>setForm({...form, symptoms: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea value={form.diagnosis} onChange={e=>setForm({...form, diagnosis: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})}></textarea>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Save Visit</button>
            </div>
          </form>

          <form style={{marginTop:20}} className="search-container" onSubmit={handleSearchSubmit}>
            <input
              aria-label="Search visits"
              type="search"
              placeholder="Search by name, nurse, symptoms, diagnosis, address, notes, or date"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchSubmit(e)
                }
              }}
            />
              <small style={{display:'block', marginTop:8, color:'var(--muted-color)'}}>Tip: search age by number (e.g. 21)</small>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn-secondary" onClick={(e)=>{e.preventDefault(); setQuery(''); fetchVisits(0, '')}}>Clear</button>
              <button className="btn btn-secondary" type="submit">Search</button>
            </div>
          </form>

          <h2 style={{marginTop:24, borderBottom:'3px solid var(--primary-color)', paddingBottom:'12px', marginBottom:'20px'}}>📋 Recent Visits</h2>
          <div className="results-container visits-container">
            {loading && <div className="loading">Loading...</div>}
            {!loading && visits.length===0 && <div className="no-results">No visits yet</div>}
            {visits.map(v=> {
              const citizen = v.citizens
              const nurse = v.nurses
              return (
              <div key={v.visit_id} className={`visit-card ${deletingId === v.visit_id ? 'deleting' : ''}`}>
                <div className="visit-header">
                  <div className="visit-info">
                    <div className="visit-title">{citizen?.name} — {citizen?.age} yrs</div>
                    <div className="visit-meta">{v.visit_date ? new Date(v.visit_date).toLocaleDateString() : (v.created_at ? new Date(v.created_at).toLocaleString() : '')}</div>
                  </div>
                  <div className="visit-actions">
                    <button className="btn" onClick={()=>setEditing(v)}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>promptDelete(v.visit_id)}>Delete</button>
                  </div>
                </div>
                <div className="visit-details">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">{citizen?.address}</div>
                  <div className="detail-label">Symptoms</div>
                  <div className="detail-value">{v.symptoms}</div>
                  <div className="detail-label">Diagnosis</div>
                  <div className="detail-value">{v.diagnosis}</div>
                  <div className="detail-label">Nurse</div>
                  <div className="detail-value">{nurse?.name}</div>
                  {v.notes && (
                    <>
                      <div className="detail-label">Notes</div>
                      <div className="detail-value">{v.notes}</div>
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
          
          <div className="pagination-container">
            <div className="pagination-info">
              {total !== null && <small>Showing page {page + 1} • total records: {total}</small>}
            </div>
            <div className="pagination-buttons">
              <button className="btn btn-primary" onClick={()=>{ if(page>0) fetchVisits(page-1) }} disabled={page===0}>← Prev</button>
              <button className="btn btn-primary" onClick={()=>{ if(total===null || (page+1)*pageSize < total) fetchVisits(page+1) }} disabled={total!==null && (page+1)*pageSize >= total}>Next →</button>
            </div>
          </div>
        </section>
      </main>

      {editing && (
        <EditModal
          item={editing}
          citizens={citizens}
          nurses={nurses}
          onClose={() => setEditing(null)}
          onSave={(updated) => handleUpdate(editing.visit_id, updated)}
        />
      )}
      <DeleteConfirmModal
        visible={showDelete}
        onCancel={() => { setShowDelete(false); setDeleteTarget(null) }}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        message={'Delete this visit? This action cannot be undone.'}
      />
    </>
  )
}
