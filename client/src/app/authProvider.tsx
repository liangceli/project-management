import React from 'react'
import { Authenticator, Placeholder } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import "@aws-amplify/ui-react/styles.css"
import { signUp } from 'aws-amplify/auth'

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
        }
    }
})

const formFields = {
    signUp: {
        username: {
            order: 1,
            placeholder: "Choose a username",
            label: "Username",
            InputProps: {required: true},
        },

        email: {
            order: 2,
            placeholder: "Enter your email address",
            label: "Email",
            InputProps: {type: "email", required: true}
        },

        password: {
            order: 3,
            placeholder: "Enter your password",
            label: "Password",
            InputProps: {type: "password", required: true}
        },

        confirm_password: {
            order: 4,
            placeholder: "Confirm your password",
            label: "Confirm Password",
            InputProps: {type: "password", required: true}
        },

    }
}

const AuthProvider = ({ children }: any) => {
  return (
    <div>
        <Authenticator formFields={formFields}>
            {({ user }: any) => 
                user ? (
                    <div>{children}</div>
                ): (
                    <div>
                        <h1>Please sign in below:</h1>
                    </div>
                )
            }
        </Authenticator>
    </div>
  )
}

export default AuthProvider