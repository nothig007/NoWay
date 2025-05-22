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
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border-1 ">
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
        <FormItem className="mb-4 ">
          <FormLabel className="text-accent-foreground/90">Username</FormLabel>
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
          <FormLabel className="text-accent-foreground/90">Email</FormLabel>
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
          <FormLabel className="text-accent-foreground/90">Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="Password" {...field}  />
          </FormControl>
          {/* <FormDescription>This is your public display name.</FormDescription> */}
          <FormMessage />
        </FormItem>
      )}
    />
    <Button className="w-full"type="submit"  disabled={isSubmitting || emailMessage !== ""|| usernameMessage !== "Username is avaliable!"}>
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
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg>
              Continue with GitHub
            </Button>
          </div>
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