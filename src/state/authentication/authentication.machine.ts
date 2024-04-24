import { assign, fromPromise, setup } from 'xstate'
import { loginQuery } from './authentication.queries.ts'
import { User } from './types.ts'

type AuthenticationContextType = {
  status: 'authenticated' | 'unauthenticated'
  isLoading: boolean
  user: User | null
}

type AuthenticationEventType =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'setIsLoading' }
  | { type: 'setAuthentication', output: User | Error }
  | { type: 'handleIsAuthenticated' }
  | { type: 'setError' }
  | { type: 'handleError' }

export const authenticationMachine = setup({
  types: {
    context: {} as AuthenticationContextType,
    events: {} as AuthenticationEventType,
  },
  actions: {
    logout: () => {
      // todo
    },
    setIsLoading: assign({
      isLoading: true,
    }),
    setAuthentication: assign({
      user: ({ event }) => (event as Extract<AuthenticationEventType, { type: 'setAuthentication' }>).output,
      isLoading: false,
      status: 'authenticated',
    }),
    handleIsAuthenticated: ({ context, event }, params) => {
      console.log('save authentication somewhere')
    },
    setError: ({ context, event }, params) => {
      // Add your action code here
      // ...
    },
    handleError: ({ context, event }, params) => {
      // Add your action code here
      // ...
    },
  },
  actors: {
    authenticate: fromPromise<User, { userName: string, password: string }>(async ({ input }) => await loginQuery(input)),
  },
}).createMachine({
  context: {
    status: 'unauthenticated',
    isLoading: false,
    user: null,
  },
  id: 'Authentication - 1 - Login',
  initial: 'Unauthenticated',
  states: {
    Unauthenticated: {
      on: {
        login: {
          target: 'ProcessAuthentication',
        },
      },
    },
    ProcessAuthentication: {
      entry: {
        type: 'setIsLoading',
      },
      invoke: {
        id: 'login',
        src: 'authenticate',
        input: {
          userName: 'me',
          password: 'psw',
        },
        onDone: {
          target: 'Authenticated',
          // actions: [
          //   assign({
          //     user: ({ event }) => event.output, // here event is strongly typed
          //     isLoading: false,
          //     status: 'authenticated',
          //   }),
          // ]
          actions: [
            {
              type: 'setAuthentication', // here we have to cast event type
            },
            {
              type: 'handleIsAuthenticated',
            },
          ],
        },
        onError: {
          target: 'Unauthenticated',
          actions: [
            {
              type: 'setError',
            },
            {
              type: 'handleError',
            },
          ],
        },
      },
    },
    Authenticated: {
      on: {
        logout: {
          target: 'Unauthenticated',
        },
      },
    },
  },
})
