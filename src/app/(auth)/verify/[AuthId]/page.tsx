"use client"
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner"
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
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
import React from 'react'
import { useForm } from "react-hook-form";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiResponse } from "@/types/ApiReponse";
import axios, {AxiosError} from "axios";
const VerifyAccount = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const AuthId = searchParams.get("AuthId");
    const [maskedEmail, setMaskedEmail] = useState("");  
    useEffect(() => {
      const fetchEmail = async () => {
        try {
            console.log("AuthdId: "+ AuthId)
          const response = await axios.post(`/api/email-for-verify`, {
            AuthId: AuthId,
          });
  
          if (!response.data.success) {
            return router.push("/404");
          }
  
          setMaskedEmail(response.data.emailId);
        } catch (error) {
          console.error("Error fetching email:", error);
        }
      };
  
      fetchEmail();
    }, [AuthId]);
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })
    const onSubmit = async (data:z.infer<typeof verifySchema>) => {
        try {
            
            const response = await axios.post(`/api/verify-code`, {
                AuthId: AuthId,
                code: data.code
            })

            toast("Verification Successful",
            {
                description: response.data.message
            }
        )
        router.replace('sign-in')
        } catch (error) {
            console.error("error in sign up: ", error)
                  const axiosError = error as AxiosError<ApiResponse>
                  
                  let errorMessage = axiosError.response?.data.message ?? 'Error submitting'
                  toast("SignUp failed", {
                    description: errorMessage,
                  })
        }
    }

    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                Please enter the one-time password sent to your registered email address <strong>({maskedEmail}) AuthId: {AuthId}to continue..</strong>

                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
   
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    )
  }
  

export default VerifyAccount