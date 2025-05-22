'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Code, CodeXml, Loader2 } from 'lucide-react' 

import * as z from "zod"
import Link from "next/link"
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts'
import toast, {Toaster} from "react-hot-toast"
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
import { TypeAnimation } from 'react-type-animation';
import { ApiResponse } from "@/types/ApiReponse"
const page = () => {
  const [username, setUsername] = useState('')

  const[usernameMessage, setUsernameMessage] = useState('')
  const[emailMessage, setEmailMessage] = useState('')
  const[Email, setEmail] = useState('')

  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedUsername = useDebounceCallback(setUsername, 800);
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

  
  
  
const ExampleComponent = () => {
  return (
    <TypeAnimation
      sequence={[
      'Welcome to CodeMx',
        1000,
        'Welcome to CodeMx <>',
        1000,
        'Welcome to CodeMx </>',
        1000
      ]}
      wrapper="span"
      speed={50}
      style={{ fontSize: '1.25rem', display: 'inline-block' }}
      repeat={Infinity}
    />
  );
};



  
  const onSubmit= async(data: z.infer<typeof signUpSchema>)=>{
    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/sign-up`, data)
      const AuthId = response.data.AuthId
      if(response.data.message === "User already got OTP"){
        // router.push(`/verify?AuthId=${AuthId}`)
        setIsCodeSent(true)
        setAuthId(AuthId)
        toast.error("Please verify your account")
        return
      }
      toast.success("Verify Now")
      router.push(`/verify?AuthId=${AuthId}`)
      setIsSubmitting(false)
    } catch (error) {
      console.error("error in sign up: ", error)
      const axiosError = error as AxiosError<ApiResponse>
      
      let errorMessage = axiosError.response?.data.message ?? 'Error submitting'
      toast.error("SignUp failed, please try again later!")
      setIsSubmitting(false)
    }
  }
  // if(emailMessage){
  //   form.setError("email", {type: "manual", message: "Email is already in use."})
  // }
  
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
            form.clearErrors()
            setEmailMessage('')
          }
          else{
            setEmailMessage(response.data.message)
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          console.log("error in email: "+error)
          form.setError("email", {type: "manual", message: axiosError.response?.data.message})
          
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Toaster
  position="bottom-center"
  reverseOrder={false}
/>
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-bold">
            {/* Welcome to CodeMx <Code size={28} strokeWidth={2.25} className="inline-block"/> */}
            {ExampleComponent()}
          </h1>
          <p className="mt-4">Sign up to start your learning journey!</p>
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
            <Input placeholder="Your display name" {...field} onChange={(e)=>{
              field.onChange(e)
              debouncedUsername(e.target.value)
            }} />
          </FormControl>
          <div className="flex items-center justify-between w-full">

            {
              isCheckingUsername && <Loader2 className="w-5 h-5 flex justify-end animate-spin "/>
            }
            <p className={`text-sm ${usernameMessage === "Username is avaliable!" ? `font-500`: 'text-red-500 font-500'}`}>
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
          {/* <p className={`text-sm ${emailMessage === "Email is avaliable!" ? `text-green-500`: 'text-red-500'}`}>
                {emailMessage}
            </p> */}
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
    <Button type="submit"  disabled={isSubmitting || emailMessage !== ""|| usernameMessage !== "Username is avaliable!"}>
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
          <>We have already sent you verification code.<Link className="underline hover:font-500 underline-offset-4" href={{ pathname: '/verify', query: { AuthId:  AuthId} }}>Verify Here</Link>
          </>
        ) : ('')
      }
        </p></div>
      <div className="text-center text-sm mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      </div>
    </div>
  )
}

export default page