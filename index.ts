export interface Pointer {
    type: string
    button1: boolean
    button2: boolean
    button3: boolean
    button4: boolean
    button5: boolean
    screenX: number
    screenY: number
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    offsetX: number
    offsetY: number
}

interface PointerInputData extends EventListenerObject {
    symbol: symbol
    element: Element
    pointers: Map<number, Pointer>
}

export class PointerInput {
    static #symbol = Symbol()

    #data: PointerInputData

    static #listener (this: PointerInputData, event: PointerEvent) {
        if (event instanceof PointerEvent) {
            const { type, pointerId } = event

            if (type === 'pointerenter' || type === 'pointerleave')
                return
            else if (type === 'pointerout') {
                return this.pointers.delete(pointerId)
            }

            const {
                pointerType,
                buttons,
                screenX,
                screenY,
                clientX,
                clientY,
                pageX,
                pageY
            } = event

            let {
                offsetX,
                offsetY
            } = event

            const pointer = this.pointers.get(pointerId)

            if (!pointer) {
                if (type === 'pointerover') {
                    const { left, top } = this.element.getBoundingClientRect()

                    offsetX = clientX - left
                    offsetY = clientY - top
                }

                this.pointers.set(pointerId, {
                    type: pointerType,
                    button1: (buttons & 1) === 1,
                    button2: (buttons & 2) === 2,
                    button3: (buttons & 4) === 4,
                    button4: (buttons & 8) === 8,
                    button5: (buttons & 16) === 16,
                    screenX: screenX,
                    screenY: screenY,
                    clientX: clientX,
                    clientY: clientY,
                    pageX: pageX,
                    pageY: pageY,
                    offsetX: offsetX,
                    offsetY: offsetY
                })
            } else {
                if (type === 'pointerover') return

                pointer.type = pointerType
                pointer.button1 = (buttons & 1) === 1
                pointer.button2 = (buttons & 2) === 2
                pointer.button3 = (buttons & 4) === 4
                pointer.button4 = (buttons & 8) === 8
                pointer.button5 = (buttons & 16) === 16
                pointer.screenX = screenX
                pointer.screenY = screenY
                pointer.clientX = clientX
                pointer.clientY = clientY
                pointer.pageX = pageX
                pointer.pageY = pageY
                pointer.offsetX = offsetX
                pointer.offsetY = offsetY
            }
        }
    }

    constructor (element: Element) {
        this.#data = {
            symbol: PointerInput.#symbol,
            element,
            pointers: new Map,
            handleEvent: PointerInput.#listener
        }

        element.addEventListener('pointerenter', this.#data, true)
        element.addEventListener('pointerover', this.#data, true)
        element.addEventListener('pointermove', this.#data, true)
        element.addEventListener('pointerdown', this.#data, true)
        element.addEventListener('pointerup', this.#data, true)
        element.addEventListener('pointerout', this.#data, true)
        element.addEventListener('pointerleave', this.#data, true)
        element.addEventListener('click', this.#data, true)
        element.addEventListener('auxclick', this.#data, true)
    }

    getPointers <T extends number[]>(...pointerIds: T): T['length'] extends 1 ? Pointer : Pointer[] {
        if (this.#data?.symbol !== PointerInput.#symbol)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerInput instance`)

        if (pointerIds.length === 1) return this.#data.pointers.get(Number(pointerIds[0])) as any

        const pointers: Pointer[] = []

        for (let i = 0; i < pointerIds.length; i++) {
            pointers.push(this.#data.pointers.get(Number(pointerIds[i])) || null)
        }

        return pointers as any
    }

    getPointerMap () {
        if (this.#data?.symbol !== PointerInput.#symbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerInput instance`)

        const pointers: Map<number, Pointer> = new Map
        for (const [id, pointer] of this.#data.pointers) {
            pointers.set(id, { ...pointer })
        }

        return pointers
    }
}

export default PointerInput