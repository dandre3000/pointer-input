# pointer-input

Query pointer state.

## Installation

npm i @dandre3000/pointer-input

## Usage

```js
import PointerInput from '@dandre3000/pointer-input'

let p = new PointerInput(document.documentElement)

setInterval(() => {
    console.log(p.getPointers(0))
    console.log(p.getAllPointers())
}, 1000 / 60)
```

## Exports

### Types

<h4>
    Pointer {</br>
        &emsp;type: strng</br>
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

### Class PointerInput

#### constructor (eventTarget: EventTarget)

### Instance methods

<h4>
    getPointers (pointerId: string): Pointer</br>
    getPointers (...pointerIds: string[]): Pointer[]
</h4>

#### getPointerMap (): Map&lt;number, Pointer&gt;

## License

[MIT](https://github.com/dandre3000/pointer-input/blob/main/LICENSE)
