import "next-auth";

declare module 'next-auth' {
    interface User{
        _id?: string
        Email: string
        username?: string
    }
    interface GoogleProvider{
        clientId: string
        clientSecret: string
    }
    interface Session{
        user: {
            _id?: string
            isAcceptingMessages: string
            isVerified: boolean
            username?: string
        }& DefaultSession['user']
    } 
}

declare module 'next-auth/jwt'{
    interface JWT{
        _id?: string
        isAcceptingMessages: string
        isVerified: boolean
        username?: string
    }
}
