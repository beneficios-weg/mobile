import { mount } from 'svelte'
import './app.css'
import './components/styles/index.css'
import './pages/styles/CategoryPage.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
