"use client"
import Link from 'next/link'
import React from 'react'
import avatar from '../images/boy1.png'
import Image from 'next/image'

function Navbar() {
  return (
    <div className='flex p-7 bg-amber-400 justify-between'>
      <div>
      <Link href='/'><h1>TODOLIST</h1></Link>
      </div>
<div className='flex gap-4'>
{localStorage.getItem('auth-token')? <button className='cursor-pointer' onClick={()=> {localStorage.removeItem('auth-token');
                window.location.replace('/')}}>Logout</button> :  <Link href='/auth'>
                <button className='cursor-pointer'>Login</button>
              </Link>  }
              <Image src={avatar} width={50} height={50}/>
</div>

    </div>
  )
}

export default Navbar