/*
  DeleteConfirmModal.jsx
  - Generic confirmation modal used when deleting a visit.
  - Keeps markup simple: message, Confirm and Cancel actions.
*/
import React from 'react'

export default function DeleteConfirmModal({visible, onCancel, onConfirm, message}){
  if(!visible) return null
  return (
    <div className="modal" style={{display:'block'}}>
      <div className="modal-content">
        <span className="close" onClick={onCancel}>&times;</span>
        <h3>⚠️ Confirm Delete</h3>
        <div style={{padding:'30px 28px', fontSize:'1rem', color:'var(--text-primary)', lineHeight:'1.6', textAlign:'center'}}>
          <p style={{margin:0, marginBottom:20}}>{message || 'Are you sure you want to delete this item? This action cannot be undone.'}</p>
        </div>
        <div className="form-actions" style={{padding:'0 28px 28px 28px', display:'flex', gap:12}}>
          <button className="btn btn-danger" onClick={onConfirm} style={{flex:1, padding:'12px 18px', fontWeight:700, borderRadius:'8px'}}>Delete</button>
          <button className="btn" onClick={onCancel} style={{flex:1, padding:'12px 18px', fontWeight:700, borderRadius:'8px', background:'#f1f5f9', color:'var(--text-primary)', border:'2px solid var(--border-color)'}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
