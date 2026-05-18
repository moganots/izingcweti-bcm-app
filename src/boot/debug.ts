import { boot } from 'quasar/wrappers'

export default boot(({ router }) => {
    console.log('App booting...')
    console.log('Router instance:', router)
    console.log('Current route:', router.currentRoute.value)
    console.log('Available routes:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
})