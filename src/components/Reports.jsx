import React, {useEffect, useState, useMemo} from 'react'
import { supabase } from '../supabaseClient'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

/*
  Reports.jsx
  - Generates aggregated charts and simple statistics from `medical_visits`.
  - Fetches visit rows (optionally by date range) and computes data for ChartJS.
*/
export default function Reports(){
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [visits, setVisits] = useState([])

  useEffect(()=>{
    fetchReports()
  },[])

  async function fetchReports(){
    setLoading(true)
    
    let qb = supabase.from('medical_visits').select('visit_id, visit_date, symptoms, diagnosis, notes, created_at, citizen_id, nurse_id, citizens(name), nurses(name)')
    if(fromDate) qb = qb.gte('visit_date', fromDate)
    if(toDate) qb = qb.lte('visit_date', toDate)
    const { data, error } = await qb.order('visit_date', {ascending:false})
    setLoading(false)
    if(error) return console.error(error)
    setVisits(data || [])
  }

  
  const total = visits.length
  const byDiagnosis = visits.reduce((acc, v) => { const d = v.diagnosis || 'Unspecified'; acc[d] = (acc[d]||0)+1; return acc }, {})
  const byNurse = visits.reduce((acc, v) => { const n = (v.nurses && v.nurses.name) || (v.nurse_name) || (`#${v.nurse_id}`) || 'Unknown'; acc[n] = (acc[n]||0)+1; return acc }, {})
  const byPatient = visits.reduce((acc, v) => { const p = (v.citizens && v.citizens.name) || (v.citizen_name) || (`#${v.citizen_id}`) || 'Unknown'; acc[p] = (acc[p]||0)+1; return acc }, {})

  const diagnosisChart = useMemo(()=>{
    const labels = Object.keys(byDiagnosis)
    const data = labels.map(l => byDiagnosis[l])
    return {
      labels,
      datasets: [{ label: 'Visits', data, backgroundColor: 'rgba(99,102,241,0.8)' }]
    }
  }, [visits])

  const nurseChart = useMemo(()=>{
    const labels = Object.keys(byNurse)
    const data = labels.map(l => byNurse[l])
    return {
      labels,
      datasets: [{ label: 'Visits', data, backgroundColor: 'rgba(16,185,129,0.8)' }]
    }
  }, [visits])

  const patientChart = useMemo(()=>{
    const labels = Object.keys(byPatient)
    const data = labels.map(l => byPatient[l])
    return {
      labels,
      datasets: [{ label: 'Visits', data, backgroundColor: 'rgba(59,130,246,0.8)' }]
    }
  }, [visits])

  return (
    <main>
      <h2>Reports</h2>
      <div className="report-filters">
        <div>
          <label>From</label>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
        </div>
        <div>
          <label>To</label>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
        </div>
        <div>
          <button className="btn btn-secondary" onClick={()=>{ setFromDate(''); setToDate(''); fetchReports() }}>Clear</button>
          <button className="btn btn-primary" onClick={()=>fetchReports()}>Apply</button>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {!loading && (
        <div>
          <div className="report-card">
            <h3>Total Visits</h3>
            <div className="stat-item"><div className="stat-label">Total</div><div className="stat-value">{total}</div></div>
          </div>

          <div className="report-cards-grid">
            <div className="report-card">
              <h3>Visits by Diagnosis</h3>
              {Object.keys(byDiagnosis).length===0 && <div className="no-results">No data</div>}
              {Object.keys(byDiagnosis).length>0 && (
                <div className="chart-wrapper">
                  <Bar data={diagnosisChart} options={{responsive:true, maintainAspectRatio:false}} />
                </div>
              )}
            </div>

            <div className="report-card">
              <h3>Visits by Nurse</h3>
              {Object.keys(byNurse).length>0 && (
                <div className="chart-wrapper">
                  <Bar data={nurseChart} options={{responsive:true, maintainAspectRatio:false}} />
                </div>
              )}
            </div>
            <div className="report-card">
              <h3>Visits by Patient</h3>
              {Object.keys(byPatient).length===0 && <div className="no-results">No data</div>}
              {Object.keys(byPatient).length>0 && (
                <div className="chart-wrapper">
                  <Bar data={patientChart} options={{responsive:true, maintainAspectRatio:false}} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
