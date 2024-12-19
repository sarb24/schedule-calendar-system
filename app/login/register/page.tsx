import AuthForm from '@/components/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <AuthForm type="register" />
      </div>
    </div>
  )
}

