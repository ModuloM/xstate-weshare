import {assign, createActor, fromPromise, setup} from 'xstate';

type DemoContextType = {
  is?: undefined | 'A' | 'B'
  value: number
}
type DemoEventType =
  | { type: 'doA', value: number }
  | { type : 'doB', value: number }

const demoMachine = setup({
  types: {
    // Obligation to cast here
    context: {} as DemoContextType,
    events: {} as DemoEventType,
  },
  actions: {
    myAction: () => {
      console.log('myAction is called')
    },
  },
  guards: {
    myGuard: ({ context }) => context.is === 'A',
  },
  actors: {
    // Promise Actor
    myActor: fromPromise(async () => {
      return new Promise((resolve) => {
        setTimeout(() => void resolve(42), 100)
      })
    }),
  },
}).createMachine({
  initial: 'A',
  context: {
    value: 0,
  },
  states : {
    A: {
      entry: { type: 'myAction' },
      on: {
        doA: {
          guard: {type: 'myGuard'},
          // context is immutable, must use assign fn to mutate it
          // Transition Actor
          actions: assign({
            is: 'A',
            value: ({ context, event }) => {
              if (context.is !== undefined && context.is === 'A') {
                return event.value
              }
              return context.value
            },
          })
        },
      }
    }
  }
})

const demoActor = createActor(demoMachine)

demoActor.subscribe((state) => {
  console.log(state.value)
})

demoActor.start()
demoActor.send({ type: 'doA', value: 7})
demoActor.stop()