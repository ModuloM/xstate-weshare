import './App.css'

import {useMachine} from "@xstate/react";

import {authenticationMachine} from "./state/authentication/authentication.machine.ts";
import {useEffect} from "react";

function App() {

  const [state, send] = useMachine(authenticationMachine)

  const handleLogin = () => {
    send({ type: 'login' })
  }

  useEffect(() => {
    console.log({ context: state.context })
  }, [state])

  return (
    <main>
      {state.context.status === 'authenticated'
        ? (
          <div className="card">
            <div className="authenticated">
              I’m authenticated 🔓
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="unauthenticated">
              I’m not authenticated 🔒
            </div>
            {state.context.isLoading ? (
                <div className="message">
                  <div className="loader"></div>
                  &nbsp;&nbsp; Loading
                </div>
              ) : (
                <button onClick={handleLogin}>🔐 Authenticate</button>
              )
            }
          </div>
        )
      }
    </main>
  )
}

export default App
