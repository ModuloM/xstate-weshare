import { assign, fromPromise, setup } from 'xstate'
import type { ErrorActorEvent } from 'xstate'

import { loginQuery } from './authentication.queries.ts'
import type { User } from './types.ts'
import { deleteAuthenticationInfo, getAuthentication, setAuthenticationInfo } from './authentication.helpers.ts'

const AuthenticationStatus = {
  authenticated: 'authenticated',
  unauthenticated: 'unauthenticated',
} as const

type AuthenticationContextType = {
  status: keyof typeof AuthenticationStatus
  isLoading: boolean
  user: User | null
  error: Error | null
}

type AuthenticationEventType =
  | { type: 'login', output: User, error: Error }
  // This should not be necessary
  | { type: 'xstate.error.actor.login', error: Error}
  | { type: 'logout' }
  | { type: 'setIsLoading' }
  | { type: 'getAuthenticationInfo' }
  | { type: 'setAuthentication', output: User }
  | { type: 'handleIsAuthenticated' }
  | { type: 'handleIsUnauthenticated' }
  | { type: 'setError', error: Error }
  | { type: 'handleError' }

export const authenticationMachine = setup({
  types: {
    context: {} as AuthenticationContextType,
    events: {} as AuthenticationEventType,
  },
  guards: {
    hasAuthenticationInfo: function ({context}) {
      return Boolean(context.user)
    },
  },
  actions: {
    setIsLoading: assign({
      isLoading: true,
    }),
    getAuthenticationInfo: assign(() => {
      const authenticationInfo = getAuthentication()

      if (authenticationInfo !== null) {
        return {
          user: authenticationInfo.user,
          status: AuthenticationStatus.authenticated,
        }
      }

      return {
        status: AuthenticationStatus.unauthenticated,
        isLoading: false,
        user: null,
      }
    }),
    setAuthentication: assign({
      user: ({ event }) => (event as Extract<AuthenticationEventType, { type: 'login' }>).output,
      isLoading: false,
      status: 'authenticated',
      error: null,
    }),
    handleIsAuthenticated: ({ context }) => {
      if (context.user) {
        setAuthenticationInfo(context.user)
      }
    },
    handleIsUnauthenticated: () => {
      console.log('remove authentication data')
      deleteAuthenticationInfo()
    },
    setError: assign(({context, event}) => {
      if (
        event.type === 'xstate.error.actor.login'
        && event.error?.name === 'MFA'
      ) {
        console.log('error', event.error)

        return ({
          user: null,
          error: event.error,
        })
      }

      return context
    }),
    handleError: () => {
      console.log('there is an error')
    },
  },
  actors: {
    authenticate: fromPromise<User | Error, { userName: string, password: string }>(async ({ input }) => await loginQuery(input)),
  },
}).createMachine({
  context: {
    status: 'unauthenticated',
    isLoading: false,
    user: null,
    error: null,
  },
  id: 'Authentication - 1 - Login',
  initial: 'Unauthenticated',
  states: {
    Unauthenticated: {
      entry: {
        type: 'getAuthenticationInfo',
      },
      always: [
        {
          target: 'Authenticated',
          guard: {
            type: 'hasAuthenticationInfo',
          },
        },
        {
          target: 'Unauthenticated',
        },
      ],
      on: {
        login: {
          target: 'ProcessAuthentication',
        },
      },
    },
    ProcessAuthentication: {
      entry: [
        () => console.log('login ...'),
        {
        type: 'setIsLoading',
        },
      ],
      invoke: {
        id: 'login',
        src: 'authenticate',
        input: {
          userName: 'me',
          password: 'psw',
        },
        onDone: {
          target: 'Authenticated',
          actions: [
            assign({
              user: ({ event }) => event.output, // here event is strongly typed
              isLoading: false,
              status: 'authenticated',
            }),
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
          target: 'ProcessUnAuthentication',
        },
      },
    },
    ProcessUnAuthentication: {
      entry: [
        assign({
          status: 'unauthenticated',
          user: null,
        }),
        { type: 'handleIsUnauthenticated' }
      ],
      always: {
        target: 'Unauthenticated',
      },
    },
  },
})
