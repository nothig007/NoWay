'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Loader2 } from 'lucide-react' 

import * as z from "zod"
import Link from "next/link"
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts'
import { toast } from "sonner"
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button"



import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiReponse"
const page = () => {
  const [username, setUsername] = useState('')

  const[usernameMessage, setUsernameMessage] = useState('')
  const[emailMessage, setEmailMessage] = useState('')
  const[Email, setEmail] = useState('')

  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedUsername = useDebounceCallback(setUsername, 400);
  const debouncedEmail = useDebounceCallback(setEmail, 1000);
  const [AuthId, setAuthId] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const router = useRouter()


  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username){
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          console.log("Username: "+ username)
          const response = await axios.get(`/api/check-username-uniqueness?username=${username}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          )
          
        }
        finally{
          setIsCheckingUsername(false)
        }
      }
      else{
        setUsernameMessage('')
        
      }
    }
    checkUsernameUnique()
  },
  [username])
  useEffect(() => {
    const checkEmailUnique = async () => {
      if (Email){
        setEmailMessage('')
        try {
          console.log("Email: "+ Email)
          const response = await axios.get(`/api/auth/checkEmail_InUse?email=${Email}`)
          if(response.data.success){
            setEmailMessage('')
          }
          else{
            setEmailMessage(response.data.message)
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          console.log("error in email: "+error)
          setEmailMessage(
            axiosError.response?.data.message ?? 'Error checking email'
          )
          
        }
      }
      else{
        setEmailMessage('')
        
      }
    }
    checkEmailUnique()
  },
  [Email])
  
  const onSubmit= async(data: z.infer<typeof signUpSchema>)=>{
    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/sign-up`, data)
      const AuthId = response.data.AuthId
      if(response.data.message === "User already got OTP"){
        // router.push(`/verify?AuthId=${AuthId}`)
        setIsCodeSent(true)
        setAuthId(AuthId)
        toast("Please verify your account", {
          description: response.data.message,
        })
        return
      }
      toast("Success", {
        description: response.data.message,
      })
      router.push(`/verify?AuthId=${AuthId}`)
      setIsSubmitting(false)
    } catch (error) {
      console.error("error in sign up: ", error)
      const axiosError = error as AxiosError<ApiResponse>
      
      let errorMessage = axiosError.response?.data.message ?? 'Error submitting'
      toast("SignUp failed", {
        description: errorMessage,
      })
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome to 
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="username" {...field} onChange={(e)=>{
              field.onChange(e)
              debouncedUsername(e.target.value)
            }} />
          </FormControl>
          <div className="flex items-center justify-between w-full">

            {
              isCheckingUsername && <Loader2 className="w-5 h-5 flex justify-end animate-spin "/>
            }
            <p className={`text-sm ${usernameMessage === "Username is avaliable!" ? `text-green-500`: 'text-red-500'}`}>
                {usernameMessage}
            </p>
            </div>
          {/* <FormDescription>This is your public display name.</FormDescription> */}
          <FormMessage />
        </FormItem>
      )}
    />
      <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="Enter your email" {...field} onChange={(e)=>{
              field.onChange(e)
              debouncedEmail(e.target.value)
            }}  />
          </FormControl>
          <p className={`text-sm ${emailMessage === "Email is avaliable!" ? `text-green-500`: 'text-red-500'}`}>
                {emailMessage}
            </p>
          {/* <FormDescription>This is your public display name.</FormDescription> */}
          <FormMessage />
        </FormItem>
      )}
    />
      <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="Password" {...field}  />
          </FormControl>
          {/* <FormDescription>This is your public display name.</FormDescription> */}
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit"  disabled={isSubmitting}>
      {
        isSubmitting ? (
          <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
          </>
        ) : ('Sign Up')
      }
    </Button>
      </form>
      </Form>
      <div><p>
        {
        AuthId ? (
          <>We have already sent you verification code.<Link href={{ pathname: '/verify', query: { AuthId:  AuthId} }}>Verify Here</Link>
          </>
        ) : ('')
      }
        </p></div>
      <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page