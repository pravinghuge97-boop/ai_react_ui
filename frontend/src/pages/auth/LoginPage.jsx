import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin1234')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Login failed. Check credentials.')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input className="w-full border rounded p-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" className="w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-brand-500 text-white p-2 rounded">Sign In</button>
      </form>
    </div>
  )
}

export default LoginPage
