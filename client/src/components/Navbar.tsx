"use client"
import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <div className='flex p-10 bg-amber-500 justify-between'>
      <Link href='/'><h1>Logo</h1></Link>
      <ul className='flex'>
        <li>absolute</li>
        <Link href='/test'><li>second</li></Link>
        <li>third</li>
      </ul>
      {localStorage.getItem('auth-token')? <button className='cursor-pointer' onClick={()=> {localStorage.removeItem('auth-token');
                window.location.replace('/')}}>Logout</button> :  <Link href='/auth'>
                <button className='cursor-pointer'>Login</button>
              </Link>  }
    </div>
  )
}

export default Navbar