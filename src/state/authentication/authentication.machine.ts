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
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFmAduglgMYCGBA9jgAQC0lAjDZQDJlT44B0AkjvugMQBtAAwBdRKAAOZWH3wUJIAB6IAzMLocAbACYALAE4AHBtVGtdPUYA0IAJ6I6qgKwcDz1XX0G9e3c6cAX0DbNCxcAhJyKloGWhY2Th4+ITpxJBBpWWjFFQR1TV1DEydzSxt7RD11DgB2YU9VXy0tPR0jVWDQjGw8IlJ5GPpGBPYOAFUcYh6I-vRIfgAbVnYRdKkZOQUMvMt6jm9a2tUdOmEjP1sHfOcDDhOdAzozveEdWucukDDeyIGKRhxZgrTgABQATmRCHBYD9ZlFBvwIBQwBx2AA3MgAa1Ry0Sa0UWS2OFyjj0+0Ox1O50ulQQRk0zmEzK8rQMOh0JzoXzhfQRANiIxBHAhUJhvL+0X4YHBkPBHEki1IADMyOCALYcPGrMSEzY5HaODyqDh+C7GApadmqK6ITl3J4tIwcuhsvTCT4hb4zPn-IZA0acCVzBZ4sgYAkZIkG0B5Ex6A6GAxaJrOZwdFy2hDvHR1BpOYRaYS1dxGAw8n2SwaAoWJEWQ6GwWCTYP8nBCXVR-WDUkIZ4+A7J46GW4Mi5Z94JnT59peOjOIu+YJenBkCBwRStv01+IgvXZHuGhDULRZk8cZmXq-X2oV8K+6I74F15LoffE3ttLNeBPuTycq0-GOIw71+OZq0FXc60maZ70lSB3xjZRHHaO5VAMYRqkLcxCz0CcTFNDwvFqHQU3UEtQPhbdIOfMZRUbWFK3A7YNgPFjkL7LQGXuLxpzoDCnHQid3g4cxjEwk4Uy0Ejby9LdHxowMOHkhCuzYkkjw8BMmlUD5mRLV19CzAxajzRpfDLAJjk9bo4OY-1azohsYRbJi20Qw9Y0QJ4TSLdlk10kdqgnVQtDM4jMI6d4tGXQIgA */
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
          target: "Unauthenticated",
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
        { type: 'handleIsAuthenticated' }
      ],
      on: {
        logout: {
          target: 'ProcessUnAuthentication',
        },
      },
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
