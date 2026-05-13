'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  useEffect(() => {
    if (message) {
      toast.success(message)
    }
  }, [message])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        {/* Animated Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
        {/* Technical Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600" />
          
          <div className="px-8 pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-all group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Link>
          </div>

          <CardHeader className="space-y-4 text-center pt-2">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-500/20">
                  <Zap className="w-10 h-10 text-white fill-current" />
                </div>
              </div>
            </motion.div>
            
            <div className="space-y-1">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
                Intelligent System
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                Cooling Water Quality Management <br />
                <span className="text-blue-600 dark:text-blue-400 font-bold">PT PLN NP UP Arun</span>
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8 pt-4 pb-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Pegawai</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@pln.co.id"
                  required
                  className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 h-12 rounded-xl focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="Password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 h-12 rounded-xl focus:ring-blue-500 transition-all"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
              <Button
                type="submit"
                className="w-full text-lg h-14 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyambungkan...
                  </>
                ) : (
                  'Login ke Sistem'
                )}
              </Button>
              
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Belum memiliki akses?</span>
                  <Link
                    href="/register"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-all"
                  >
                    Daftar Akun
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 opacity-40">
                  <div className="h-[1px] w-12 bg-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Corporate System</span>
                  <div className="h-[1px] w-12 bg-slate-400" />
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
