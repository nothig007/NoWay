"use client"

import React, { useEffect, useRef, useState } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { signIn, useSession } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiReponse'
import { useRouter } from 'next/navigation'
import { UserModel } from '@/model/user'
import dbConnect from '@/lib/dbConnect'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { usernameSchema } from '@/schemas/signUpSchema'
import { zodResolver } from '@hookform/resolvers/zod'



const page = () => {
    const Router = useRouter()
    const previousInputRef = useRef("");
    const [erroredUsername, seterroredUsername] = useState('')
    const [ShouldRender, setShouldRender] = useState(false)
    const [UsernameError, setUsernameError] = useState('')
    const [Username, setUsername] = useState("")
    const [isFirstTime, setisFirstTime] = useState(true)
    const [IsSubmitting, setIsSubmitting] = useState(false)

    const form =  useForm<z.infer<typeof usernameSchema>>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {username: ''}
    })


    
    useEffect(() => {

        if(Username){
            // console.log("Username: "+Username)
            
            setUsername(Username)
            if(erroredUsername!==Username){
                setUsernameError('')
                form.clearErrors("username")
            }
            else{
                setUsernameError('Username is already in use')
                form.setError("username",{type:"manual", message: 'Username is already in use'})
            }
    }
        else{
            console.log("Username is empty")
            setUsername('')
        }
    
    }, [Username])
    
    const { data: session, update } = useSession()
    
    const SetUsername = async() => {

        setIsSubmitting(true)
        if(Username){
            try {
                const response = await axios.get(`/api/check-username-uniqueness?username=${Username}`)
                if(!response.data.success){
                    seterroredUsername(Username)
                    const Usererror = response?.data.message ?? 'Error checking username'
                    form.setError("username", {type: "manual", message: Usererror})
                    setUsernameError(Usererror)

                }
                setUsernameError('')
                
            } 
            catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                previousInputRef.current = Username
                console.log("Wtf: "+ error)
                const Usererror = axiosError.response?.data.message ?? 'Error checking username'
                form.setError("username", {type: "manual", message: Usererror})
                setUsernameError(Usererror)
                setShouldRender(prev => !prev);
                
            }
        }
        if(!UsernameError){
            const handleSetUsername = async () => {
              const newUsername = Username; // Get from user input
              const result = await update({ username: newUsername }); // Refresh session
              console.log("result"+ result)
              console.log("session: "+ session)
              if(result&& session){
                console.log("in session and result")
                  const email = session?.user.email
                const provider = session?.user.provider
                const username = Username
                const reponse = await axios.post('/api/SaveAuthprovider',{
                    username: username,
                    email: email,
                    provider: provider
                })
                if(reponse.data.success){
                    await signIn("github", {callbackUrl: "/dashboard"})
                    console.log("Username updated")
                    setIsSubmitting(false)
                    Router.refresh()
                }
                else{
                    console.log("Error updating username")
                    setIsSubmitting(false)
                }
            }
            else{
                console.log("Username update failed")
                setIsSubmitting(false)
            }
        };
        
        setIsSubmitting(false)
        setisFirstTime(false)
            handleSetUsername()
        }
}
    const handleBlur = () => {
    if (previousInputRef.current === Username) {
        setUsernameError('Username is already in use')
        setShouldRender(prev => !prev);
      console.log("User retyped the same word!");
    }

  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">

    <div className="w-140  max-w-md p-6 border-1 space-y-0.1  rounded-lg shadow-md">
        <Form {...form}>

        <form onSubmit={form.handleSubmit(SetUsername)}>
        <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="mb-2 text-accent-foreground/90 ">Enter your username</FormLabel>
                <FormControl>

                  <Input className='text-xs' placeholder='Username' {...field}onChange={(e)=>{
                      field.onChange(e)
                      

                      setUsername(e.target.value)
                    
                    }}></Input>

                    </FormControl>
         <p className={`text-sm pl-1 ${UsernameError === "" ? `font-500`: 'text-red-500 font-500'}`}>
                {UsernameError}
            </p>
            <FormMessage/>
                    </FormItem>
              )}/>
            {/* <p className='text-sm pb-2'>Enter your username</p> */}
         <Button type="submit" onBlur={handleBlur} className="ml-70 mt-8 w-32" disabled={Username==="" || IsSubmitting ||(UsernameError!=="" && !isFirstTime)|| Object.keys(form.formState.errors).length > 0}>
            {
        IsSubmitting ? (
          <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
          </>
        ) : ('Continue')
    }
         </Button>
        </form>
    </Form>
    </div>
    </div>

  )
}

export default page