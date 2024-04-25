import { useMachine } from '@xstate/react'

import { authenticationMachine } from '../../state/authentication/authentication.machine.ts'

export const LogoutForm = () => {
  const [snapshot, send] = useMachine(authenticationMachine)
  
  const handleLogout = () => {
    send({ type: 'logout' })
  }
  
  return (
    <div className="card">
      <div className="authenticated">
        {`${snapshot.context.user?.name} is` || 'you are'} authenticated 🔓
      </div>
      <button onClick={handleLogout}>🔐 Log out</button>
    </div>
  )
}