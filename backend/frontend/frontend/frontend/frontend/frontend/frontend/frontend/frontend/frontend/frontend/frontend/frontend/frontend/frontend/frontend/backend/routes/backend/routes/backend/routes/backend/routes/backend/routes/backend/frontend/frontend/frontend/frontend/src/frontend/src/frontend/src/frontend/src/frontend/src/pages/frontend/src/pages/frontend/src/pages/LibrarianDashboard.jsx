import React from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import BookManager from './sub/BookManager';
import Scanner from '../components/BarcodeScanner';
import Summary from './sub/Summary';

export default function LibrarianDashboard(){
  const nav = useNavigate();
  function logout(){ localStorage.removeItem('ils_token'); nav('/login'); }

  return (
    <div className="container">
      <div className="header card">
        <div>
          <h2>Augustinian — Librarian</h2>
          <div className="small">Manage books, students, loans & reservations</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="button" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{display:'flex', gap:12}}>
        <nav style={{minWidth:220}}>
          <div className="card">
            <Link to="">Dashboard</Link><br/>
            <Link to="books">Manage Books</Link><br/>
            <Link to="scanner">Barcode Scanner</Link><br/>
          </div>
        </nav>

        <main style={{flex:1}}>
          <Routes>
            <Route index element={<Summary/>} />
            <Route path="books" element={<BookManager/>} />
            <Route path="scanner" element={<Scanner/>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
