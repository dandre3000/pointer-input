# pointer-observer

Query pointer state and use pointer events asynchronously.

## Installation

npm i @dandre3000/pointer-observer

## Usage

```js
import PointerObserver from '@dandre3000/pointer-observer'

let p = new PointerObserver(document.documentElement)

await p.getNextEvent('pointerdown').then(e => console.log(e))

setInterval(() => {
    console.log(p.getPointers(0))
    console.log(p.getAllPointers())
}, 1000 / 60)
```

## Exports

### Types

<h4>
    MouseEventTypes =</br>
        &emsp;'dblclick' |</br>
        &emsp;'wheel'
</h4>

<h4>
    PointerEventTypes =</br>
        &emsp;"pointerenter" |</br>
        &emsp;"pointerover" |</br>
        &emsp;"pointermove" |</br>
        &emsp;"pointerdown" |</br>
        &emsp;"pointerup" |</br>
        &emsp;"pointerout" |</br>
        &emsp;"pointerleave" |</br>
        &emsp;"click" |</br>
        &emsp;"auxclick"
</h4>

<h4>
    Pointer {</br>
        &emsp;button1: boolean</br>
        &emsp;button2: boolean</br>
        &emsp;button3: boolean</br>
        &emsp;button4: boolean</br>
        &emsp;button5: boolean</br>
        &emsp;screenX: number</br>
        &emsp;screenY: number</br>
        &emsp;clientX: number</br>
        &emsp;clientY: number</br>
        &emsp;pageX: number</br>
        &emsp;pageY: number</br>
        &emsp;offsetX: number</br>
        &emsp;offsetY: number</br>
    }
</h4>

### Class PointerObserver

#### constructor (eventTarget: EventTarget)

### Instance methods

<h4>
    getPointers (pointerId: string): Pointer</br>
    getPointers (...pointerIds: string[]): Pointer[]
</h4>

#### getAllPinters (): Map&lt;number, Pointer&gt;

#### getNextEvent (type: MouseEventTypes | PointerEventTypes): Promise&lt;MouseEvent | PointerEvent&gt;

## License

[MIT](https://github.com/dandre3000/pointer-observer/blob/main/LICENSE)
