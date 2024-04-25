import './App.css'

import {useMachine} from '@xstate/react'
import {useEffect} from 'react'

import { LoginForm } from './components/login/LoginForm.tsx'
import {authenticationMachine} from './state/authentication/authentication.machine.ts'
import { LogoutForm } from './components/login/LogoutForm.tsx'

function App() {

  const [snapshot] = useMachine(authenticationMachine)

  useEffect(() => {
    console.log({ context: snapshot.context })
  }, [snapshot])

  return (
    <main>
      {snapshot.context.status === 'authenticated'
        ? (
          <LogoutForm />
        ) : (
          <LoginForm />
        )
      }
    </main>
  )
}

export default App
