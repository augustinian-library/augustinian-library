import React, {useState} from 'react';
import { auth } from '../api';

export default function Login(){
  const [u,setU] = useState('');
  const [p,setP] = useState('');
  const [msg,setMsg] = useState('');

  async function doLogin(){
    try{
      const res = await auth.loginAdmin(u,p);
      // backend returns { accessToken } in some variants; handle both
      const token = res.accessToken || res.token || res.accessToken;
      if(!token) {
        setMsg('Login failed: invalid response');
        return;
      }
      localStorage.setItem('ils_token', token);
      setMsg('Logged in');
      window.location.href = '/librarian';
    }catch(e){
      setMsg(e.error || e.msg || JSON.stringify(e));
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:440, margin:'40px auto'}}>
        <h2>Admin Login</h2>
        <div style={{marginTop:12}}>
          <input className="input" placeholder="username or email" value={u} onChange={e=>setU(e.target.value)} />
        </div>
        <div style={{marginTop:8}}>
          <input className="input" placeholder="password" type="password" value={p} onChange={e=>setP(e.target.value)} />
        </div>
        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="button" onClick={doLogin}>Login</button>
          <button className="button" onClick={()=>{ setU('brauliodonatus2@gmail.com'); setP('Librarian@2004'); }}>Fill demo</button>
        </div>
        <div style={{marginTop:12}} className="small">{msg}</div>
      </div>
    </div>
  );
}
