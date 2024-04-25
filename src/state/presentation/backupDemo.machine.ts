import {assign, createActor, fromPromise, setup} from 'xstate';

type DemoContextType = {
  is?: undefined | 'A' | 'B'
  value: number
}

type DemoSetupEventType = { type: 'doA', value: number }
  | { type : 'doB', value: number }

const myAction = () => {
  console.log('myAction is called')
}

const myActor = fromPromise(async () => {
  return new Promise((resolve) => {
    setTimeout(() => void resolve(42), 100)
  })
})

const myGuardBrokenInfer = ({ context }: { context: DemoContextType}) => context.is === 'A'

export const demoSetupMachine = setup({
  types: {
    // Obligation to cast here
    context: {} as DemoContextType,
    events: {} as DemoSetupEventType,
  },
  actions: {
    myAction,
  },
  guards: {
    myGuard: ({ context }) => context.is === 'A',
    myGuardBrokenInfer,
  },
  actors: {
    myActor,
  },
}).createMachine({
  initial: 'A',
  context: {
    value: 0,
  },
  states : {
    A: {
      on: {
        doA: {
          guard: {type: 'myGuard'},
          // context is immutable, must use assign fn to mutate it
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

const demoSetupActor = createActor(demoSetupMachine)

demoSetupActor.subscribe((state) => {
  console.log(state.value)
})

demoSetupActor.start()
demoSetupActor.send({ type: 'doA', value: 7})
demoSetupActor.stop()
