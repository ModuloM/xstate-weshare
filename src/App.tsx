import './App.css'

import {useMachine} from "@xstate/react";
import {useEffect} from "react";

import {authenticationMachine} from "./state/authentication/authentication.machine.ts";

function App() {

  const [snapshot, send] = useMachine(authenticationMachine)

  const handleLogin = () => {
    send({ type: 'login' })
  }

  useEffect(() => {
    console.log({ context: snapshot.context })
  }, [snapshot])

  return (
    <main>
      {snapshot.context.status === 'authenticated'
        ? (
          <div className="card">
            <div className="authenticated">
              You are authenticated 🔓
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="unauthenticated">
              Not authenticated 🔒
            </div>
            {snapshot.context.isLoading ? (
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
