import { useMachine } from '@xstate/react'

import { authenticationMachine } from '../../state/authentication/authentication.machine.ts'

export const LoginForm = () => {
  const [snapshot, send] = useMachine(authenticationMachine)

  const handleLogin = () => {
    send({ type: 'login' })
  }

  return snapshot.context.error ? (
      <div className="card">
        <input type="text" name="MFA" />
        <button type="submit">Submit MFA</button>
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
        )}
      </div>
  )
}