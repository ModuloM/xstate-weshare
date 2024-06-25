import { assign, fromPromise, setup } from 'xstate'

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
}

type AuthenticationEventType =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'setIsLoading' }
  | { type: 'getAuthenticationInfo' }
  | { type: 'setAuthentication', output: User | Error }
  | { type: 'handleIsAuthenticated' }
  | { type: 'handleIsUnauthenticated' }
  | { type: 'setError' }
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
        }
      }

      return {
        user: null,
      }
    }),
    setAuthentication: assign({
      user: ({ event }) => (event as Extract<AuthenticationEventType, { type: 'setAuthentication' }>).output,
      isLoading: false,
      status: 'authenticated',
    }),
    handleIsAuthenticated: ({ context }) => {
      if (context.user) {
        setAuthenticationInfo(context.user)
      }
    },
    handleRenewToken: () => console.log('Renew token'),
    handleIsUnauthenticated: () => {
      console.log('remove authentication data')
      deleteAuthenticationInfo()
    },
    setError: () => {
      // Add your action code here
      // ...
    },
    handleError: () => {
      // Add your action code here
      // ...
    },
  },
  actors: {
    authenticate: fromPromise<User, { userName: string, password: string }>(async ({ input }) => await loginQuery(input)),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFmAduglgMYCGBA9jgAQC0lAjDZQDJlT44B0AkjvugMQBtAAwBdRKAAOZWH3wUJIAB6IAzHTocAbACYArMLrDVAdj07VegJwAaEAE9EOrcI5WddABxat5iwBZnAF8guzQsXAIScipaBloWNk4ePiE6cSQQaVkYxRUEdU1dAyNTc0tbB0RPTX8reqsTT08mnWFhKxCwjGw8IlJ5WPpGRPYOAFUcYh7I-vRIfgAbVnYRDKkZOQVM-LodZw5VK2E9LTo6nxMrTztHBAMtDk9VF-P-PX9jOlUukHDeqIDCiMeLMFacAAKACcyIQ4LB-rNooN+BAKGAOOwAG5kADWGOWSTWimyWxweTUGm0+kMxjMFmstzUwke7i8WlMnkanhOv0RfWRwLiI3BHGhsPh-MBMX4YChMKhHEki1IADMyFCALYcQmrMQkza5HaUoo00r0ipMhC6EwcPTPF4eFnOUx8mYCoFDUGjThSuYLQlkDDEzKko2gfKeHT+Dg04xWc5aExJnRWyyaYQO-znEw6erCExuiIemIgkVJDh+6ILJSwdCkDHEVXzKEACiM7QAlPwq56ywlRb35hAQxscoMKQgozG40dE8nc1bo7a6g0rPazM0dEWAXNBv2wRXxXDYLAAEq4MAAdwAKnjcEJ9aHDRPjVODNoOgYdFG2nRF1UCB0PUbhrr4Hh6EcO5In2woDkeMInrAkxDiio5ZC+2wRogewHEcJxnBcSbXGm5h2g6qhaOuHanFoIShCAOBkBAcCKKhQrDPB7AGuOWHKIg1BaFagkcO0YnieJ5zQSW+5wYeYwpOgPFkpOgRLh4HCBOydQ1Ho5gctJ0qyZx8mcJM0zFtKkDKeG-FAS8MaeNY+iBM8Gj+Fa36aRRpxWKohhnHRDHsV65ZjMekrukZfFhq+2EIO8HBeGYljmB0Ji5loHmAXoGWae5kH+KYgRNIZe4cd6g5Rf6EA2XFdkfDGqhFRl6gJv4HXZXcP56G49qOr5TS5WVgqhVxkKIfCF44Ned74uSz68Qt8VWIlJhfOu-i6KoHgmEuHTka8lGqNOHWeCNsEmT6YqTaeKHVaNdV8fkq29etbUfNtu1pnQvWZg5-jeP+VhUXo9FBEAA */
  context: {
    status: 'unauthenticated',
    isLoading: false,
    user: null,
  },
  id: 'Authentication - 1 - Login',
  initial: 'Init',
  states: {
    Init: {
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
    },
    Unauthenticated: {
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
      entry: [
        assign({
          status: AuthenticationStatus.authenticated,
        }),
        { type: 'handleIsAuthenticated' },
      ],
      after: {
        1000: {
          target: 'ProcessRenewToken',
        },
      },
      on: {
        logout: {
          target: 'ProcessUnAuthentication',
        },
      },
    },
    ProcessRenewToken: {
      entry: [
        { type: 'handleRenewToken' }
      ],
      always: { target: 'Authenticated' },
    },
    ProcessUnAuthentication: {
      entry: [
        assign({
          status: AuthenticationStatus.unauthenticated,
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
