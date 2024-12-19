'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

type AuthFormProps = {
  type: 'login' | 'register'
  csrfToken: string
}

export default function AuthForm({ type, csrfToken }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState('SERVICE_USER')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = type === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = type === 'login' 
      ? { email, password } 
      : { email, password, name, userType, phone, address }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {type === 'register' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userType">Account Type</Label>
            <Select
              id="userType"
              value={userType}
              onValueChange={(value) => setUserType(value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Select account type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="SERVICE_USER">Service User</Select.Item>
                <Select.Item value="CONTRACTOR">Contractor</Select.Item>
                <Select.Item value="STAFF">Staff</Select.Item>
                <Select.Item value="ADMIN">Admin</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </>
      )}
      <Button type="submit" className="w-full">
        {type === 'login' ? 'Log In' : 'Sign Up'}
      </Button>
    </form>
  )
}

