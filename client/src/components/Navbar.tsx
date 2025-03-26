import React from 'react'

function Navbar() {
  return (
    <div className='flex p-10 bg-amber-500 justify-between'>
      <h1>Logo</h1>
      <ul className='flex'>
        <li>absolute</li>
        <li>second</li>
        <li>third</li>
      </ul>
      <button>login</button>
    </div>
  )
}

export default Navbar