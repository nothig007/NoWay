import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { signInSchema } from "@/schemas/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import toast , {Toaster} from "react-hot-toast"
import { z } from "zod"
import { useEffect, useState } from "react"
import axios, {AxiosError} from "axios"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ApiResponse } from "@/types/ApiReponse"
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  const [Identifer, setIdentifer] = useState("");
  const [isFirstTime, setisFirstTime] = useState(true)
  const [isUserTrue, setIsUserTrue] = useState(false);
  const [UserMessage, setUserMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const CheckingUserIden = async() =>{
    setIsSubmitting(true)
    console.log("Identifer:"+ Identifer)
    try {
      const response = await axios.post('api/CheckIdentifer', {identifier: Identifer})
      if(response.status===201){
        setIsUserTrue(true)
      }
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      console.log(axiosError)
      console.log(axiosError.response)
      console.log("response data: "+axiosError.response?.data)
      setUserMessage(
        axiosError.response?.data.message ?? 'Error checking username'
      )
      setIsUserTrue(false)
    }
    finally{
      setisFirstTime(false)
      setIsSubmitting(false)

    }
  }
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    
    setIsSubmitting(false)
    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast('Incorrect username or password')
      } else {
        toast(result.error)
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };
  useEffect(() => {
    if(!isUserTrue && !isFirstTime){
      setisFirstTime(true)
    }
    else if(isUserTrue && !isFirstTime){
      setisFirstTime(true)
      setIsUserTrue(false)
    }
    else{
      return
    }
  
  }, [Identifer])
  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster
  position="top-center"
  reverseOrder={false}/>
  <Form {...form}>

      <form onSubmit={!isUserTrue? form.handleSubmit(CheckingUserIden): form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
              >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">CodeMx .</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to CodeMx.</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Username/Email</FormLabel>
              <FormControl className="">
                <Input placeholder="Enter username or email" {...field} onChange={(e)=>{
                  field.onChange(e)
                  setIdentifer(e.target.value)
                }} />
              </FormControl>
              <div className="flex items-center justify-between w-full">
                {
        !isUserTrue? (
          <><p className="text-sm text-red-500">
            {UserMessage}
          </p>
          </>
        ) : ('')
      }
                  
              </div>
              {/* <FormDescription>This is your public display name.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        {
          isUserTrue && !isFirstTime? (<>

            <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Password</FormLabel>
              <FormControl className="">
                <Input placeholder="Enter your password" type="password" {...field}/>
              </FormControl>
              {/* <FormDescription>This is your public display name.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

          
          </>) : ("")
        }
            <Button type="submit" className="w-full" disabled={isSubmitting || (!isUserTrue && !isFirstTime) }>
              Login
            </Button>
          </div>
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
        </div>
      </form>
      </Form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
