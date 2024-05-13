import './App.css'

import { demoActor } from './state/presentation/demo.machine'

function App() {

  demoActor.subscribe((state) => {
    console.log(state.context)
  })

  demoActor.start()
  demoActor.send({ type: 'doA', value: 7})
  demoActor.send({ type: 'doA', value: 42})
  demoActor.stop()
  demoActor.send({ type: 'doA', value: 30})

  return (
    <main>
      <span style={{color: 'white'}}>This is a test</span>
    </main>
  )
}

export default App
