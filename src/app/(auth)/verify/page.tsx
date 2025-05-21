"use client"
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner"
import Link from "next/link";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCallback } from 'react';

import debounce from 'lodash/debounce'
import React from 'react'
import { useForm } from "react-hook-form";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiResponse } from "@/types/ApiReponse";
import axios, {AxiosError} from "axios";
import NotFound from "@/app/not-found";
import { throttle } from "lodash";
const VerifyAccount = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const AuthId = searchParams.get("AuthId");
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [IsResendAble, setIsResendAble] = useState(false)
    const [maskedEmail, setMaskedEmail] = useState("");  
    const [timeLeft, setTimeLeft] = useState(0)
    const [cooldown, setCooldown] = useState(false);
    
    useEffect(() => {
      const fetchEmail = async () => {
        try {
            console.log("AuthdId: "+ AuthId)
          try {
            const response = await axios.post(`/api/auth/email-for-verify`, {
              AuthId: AuthId
            });
            const timeLeft = response.data.timeLeft
            if(!timeLeft){

              setIsResendAble(true)
            }
            else{
              setIsResendAble(false)
              setTimeLeft(timeLeft)
            }
            setMaskedEmail(response.data.emailId);
          } catch (error) {
            router.push('/404')
            console.log("error fetching email-for-verify:"+ error) 
            // return <NotFound/>
          }
  
        } catch (error) {
          console.error("Error fetching email:", error);
        }
      };
  
      fetchEmail();
    }, [AuthId]);
    useEffect(()=>{

    })
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })
    const onSubmit = async (data:z.infer<typeof verifySchema>) => {
      if (isSubmitting || cooldown) return;

        try {
        
        
          setIsSubmitting(true)
        
          
        
          console.log("code here: "+ data.code)
          const response = await axios.post(`/api/auth/verify-code`, {
                AuthId: AuthId,
                code: data.code
            })

            toast("Verification Successful",
            {
                description: response.data.message
            }
          )
          setIsSubmitting(false)
          setCooldown(true);
          setTimeout(() => setCooldown(false), 2000);
          router.replace('sign-in')
        } catch (error) {
          setIsSubmitting(false)
          setCooldown(true);
          setTimeout(() => setCooldown(false), 2000);
            console.error("error in sign up: ", error)
                  const axiosError = error as AxiosError<ApiResponse>
                  
                  let errorMessage = axiosError.response?.data.message ?? 'Error submitting'
                  toast("SignUp failed", {
                    description: errorMessage,
                  })
        }
    }
    const throttledSubmit = useCallback(
      throttle((data: z.infer<typeof verifySchema>) => {
        onSubmit(data);
      }, 2000, { trailing: false }), // Allow 1 call per 2s
      [onSubmit]
    );
    useEffect(() => {
      if (timeLeft <= 0){
        setIsResendAble(true)
        return;
      } 
      setIsResendAble(false)
      const timer = setInterval(() => {
          setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
  }, [timeLeft]);


  
  // Format time into mm:ss
  const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
    const onResend = async()=>{
      try {
        setIsResending(true)
        const response =  await axios.post(`api/resend_otp`,{
          AuthId: AuthId
        })
        console.log(response)
        console.log("response.status: "+ response.status)
        if(response.status === 202){
          toast("Please wait a moment")
          setIsResendAble(false)
        }
        else if (!response.data.success){
          toast("Failed to resend OTP", {
            description: response.data.message
          })
        }
        else{
          setTimeLeft(90)
          toast("Otp sent successfully",{
            description: "Please check your email"
          })
          setIsResending(false)
          
        }
        
      } catch (error) {
        toast("error occured")
        console.log("erorr occured while sending otp", error)
      }
    }
    return (
    //     <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
    //         <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-140  max-w-md p-6 space-y-0.1  rounded-lg shadow-md">
      <div className="text-center">

        <Form {...form}>
        <form onSubmit={form.handleSubmit(throttledSubmit)} className="">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-black justify-left mb-3">One-Time Password</FormLabel>
                <FormControl className="items-center gap-3 has-[:disabled]:opacity-100">
                  <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                    <InputOTPGroup className="relative  border-black data-[active=true]:ring-[2px] rounded-1-md">
                      <InputOTPSlot className=" rounded-1-md"index={0} />
                      <InputOTPSlot className=" rounded-1-md"index={1} />
                      <InputOTPSlot className=" rounded-1-md"index={2} />
                      <InputOTPSlot className=" rounded-1-md"index={3} />
                      <InputOTPSlot className=" rounded-1-md"index={4} />
                      <InputOTPSlot className=" rounded-1-md"index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription className="pr-8.5 mb-0">
                Please enter the one-time password sent to your registered email address <strong>{maskedEmail}</strong> to continue..

                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            />

          {/* <Button type="submit" className={!isSubmitting? "flex justify-center h-8 relative top-9 left-85":"flex justify-center h-8 relative top-9 left-74"} disabled={isSubmitting}> */}
          <Button type="submit" className={"flex text-left text-xs w-32 h-8 relative top-11 left-70"} disabled={isSubmitting || cooldown}>
        
            {
              isSubmitting ? (
                <>
                <Loader2 className="flex mr-2 h-4 w-4 left-30 animate-spin"/>VERIFYING</>
              ) : ('VERIFY')
            }
          </Button>
        
        </form>
      </Form>
          <Button 
            onClick={onResend} 
            // className= {isResending ? "h-8 text-white relative right-36 top-1 pt-2 mt-0": !IsResendAble ? "h-8 text-white relative right-38 top-1 pt-2 mt-0" : "h-8 text-white relative right-42 top-2 pt-2 mt-0" }
            className= {"flex h-8  text-xs relative right-2 mr-1.75 top-3 pt-2 mt-0" }
            disabled= {!IsResendAble || isResending}
            >{
          isResending ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>RE-SENDING</> 
          ) : IsResendAble ? (
            <>
            RESEND
            </>
          ) : (
            <>
            RESEND ({formatTime(timeLeft)})
            </>
          )
        }</Button>

            </div>
        </div>
    </div>
    )
  }
  

export default VerifyAccount