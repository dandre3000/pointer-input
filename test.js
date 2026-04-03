import PointerObserver from '@dandre3000/pointer-observer'

let p = new PointerObserver(document.documentElement)

await p.getNextEvent('auxclick').then(e => console.log(e))

setInterval(() => {
    console.log(p.getPointers(0))
    console.log(p.getAllPointers())
}, 1000 / 60)