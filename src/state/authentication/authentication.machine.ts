import {assign, setup} from 'xstate';

type AuthenticationContextType = {
  status: 'authenticated' | 'unauthenticated'
}

type AuthenticationEventType =
  | { type: 'login' }

export const authenticationMachine = setup({
  types: {
    // Obligation to cast here
    context: {} as AuthenticationContextType,
    events: {} as AuthenticationEventType,
  },
  actions: {
    login: () => {
      console.log('login action called')
    },
  },
}).createMachine({
  initial: 'idle',
  context: {
    status: 'unauthenticated',
  },
  states : {
    idle: {
      on: {
        login: {
          actions: assign({
            status: 'authenticated',
          }),
        },
      }
    }
  }
})
