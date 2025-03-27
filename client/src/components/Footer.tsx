import React from 'react'
import { Facebook, Linkedin, Twitter, Github } from "lucide-react";
function Footer() {
  return (
    <div className=' p-10 bg-amber-400 flex justify-between'>
      <h2>TODLIST</h2>
      <p>&copy; 2024 Tekandme.All Rights Reserved.</p>
     <div className='flex space-x-4 '>
      <Facebook className='cursor-pointer'/>
      <Linkedin className='cursor-pointer'/>
      <Twitter className='cursor-pointer'/>
      <Github className='cursor-pointer'/>
      
     </div>
    </div>
  )
}

export default Footer