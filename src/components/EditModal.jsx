import React, {useState} from 'react'

/*
  EditModal.jsx
  - Small modal used to edit a single visit.
  - Shows joined citizen/nurse display values but sends normalized payloads
    back to the parent `onSave` handler which performs database updates.
*/
export default function EditModal({item, citizens, nurses, onClose, onSave}){
  
  const initialCitizenName = (() => {
    if (!item) return ''
    
    if (item.citizens && item.citizens.name) return item.citizens.name
    const c = citizens && citizens.find(ci => ci.citizen_id === item.citizen_id)
    return c ? c.name : (item.citizen_name || item.citizen_id || '')
  })()
  const initialNurseName = (() => {
    if (!item) return ''
    if (item.nurses && item.nurses.name) return item.nurses.name
    const n = nurses && nurses.find(nu => nu.nurse_id === item.nurse_id)
    return n ? n.name : (item.nurse_name || item.nurse_id || '')
  })()
  const initialAddress = (() => {
    if (!item) return ''
    if (item.citizens && item.citizens.address) return item.citizens.address
    const c = citizens && citizens.find(ci => ci.citizen_id === item.citizen_id)
    return c ? c.address || '' : ''
  })()
  const initialAge = (() => {
    if (!item) return ''
    if (item.citizens && typeof item.citizens.age !== 'undefined') return item.citizens.age
    const c = citizens && citizens.find(ci => ci.citizen_id === item.citizen_id)
    return c ? (typeof c.age !== 'undefined' ? c.age : '') : ''
  })()

  const [form, setForm] = useState({
    citizen_id: initialCitizenName,
    nurse_id: initialNurseName,
    address: initialAddress,
    age: initialAge,
    visit_date: item.visit_date ? item.visit_date.split('T')[0] : '',
    symptoms: item.symptoms || '',
    diagnosis: item.diagnosis || '',
    notes: item.notes || ''
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    
    try {
      const maybe = onSave(form)
      if (maybe && typeof maybe.then === 'function') {
        setSaving(true)
        await maybe
      }
    } catch (err) {
      
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal" style={{display:'block'}}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3>Edit Visit</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label>Citizen</label>
              <input autoComplete="off" placeholder="Enter name" value={form.citizen_id} onChange={e=>setForm({...form, citizen_id: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
            </div>
            <div>
              <label>Nurse</label>
              <input autoComplete="off" placeholder="Enter name" value={form.nurse_id} onChange={e=>setForm({...form, nurse_id: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
            </div>
          </div>
          <div className="form-group">
            <label>Visit Date</label>
            <input type="date" value={form.visit_date} onChange={e=>setForm({...form, visit_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input placeholder="Enter age" type="number" min="0" value={form.age} onChange={e=>setForm({...form, age: e.target.value})} style={{width:'100%', padding:'12px', border:'2px solid var(--border-color)', borderRadius:'8px', fontSize:'1rem'}} />
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
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
