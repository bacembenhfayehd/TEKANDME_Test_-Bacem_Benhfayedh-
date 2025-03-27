"use client"

import type React from "react"

import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface FormData {
  fullname: string
  username: string
  email: string
  password: string
}

interface ResponseData {
  success: boolean
  token?: string
  error?: string
}



export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")

  const [formData,setFormData] = useState<FormData>({
    fullname:'',
    username :'',
    email:'',
    password:''
  }) 
  
  
  

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form submitted:", activeTab)
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Important pour les cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        window.location.href = '/';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error. Please try again.');
    }
  };
  
  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        window.location.href = '/';
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup error. Please try again.');
    }
  };

  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {activeTab === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input id="fullname" onChange={changeHandler} value={formData.fullname} name="fullname" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" onChange={changeHandler} value={formData.email} name="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input onChange={changeHandler} value={formData.username} name="username" id="username" placeholder="johndoe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input onChange={changeHandler} value={formData.password} name="password" id="password" type="password" required />
                </div>
              </div>
              <CardFooter className="flex justify-end px-0 pt-6">
                <Button type="submit" onClick={activeTab === 'login' ? login : signup}>{activeTab === "login" ? "Sign In" : "Sign Up"}</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

