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

interface ElementData extends EventListenerObject {
    element: Element
    pointers: Map<number, Pointer>
}

const elementDataMap: WeakMap<Element, ElementData> = new WeakMap
const eventSet: WeakSet<Event>

export class PointerInput {
    #data: ElementData

    static #listener (this: ElementData, event: PointerEvent) {
        if (event instanceof PointerEvent) {
            eventSet.add(this)

            const { type, pointerId } = event

            if (type === 'pointerleave' || type === 'pointerout') {
                return this.pointers.delete(pointerId)
            }

            const {
                target,
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

            if (target !== this.element) {
                const { left, top } = this.element.getBoundingClientRect()

                offsetX = clientX - left
                offsetY = clientY - top
            }

            if (!pointer) {
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

    static patchEventStopImmediatePropagation () {
        const stopImmediatePropagation = Event.prototype.stopImmediatePropagation

        return function (this: Event) {
            stopImmediatePropagation.call(this)

            if (eventSet.has(this)) return

            eventSet.add(this)
            PointerInput.#listener(this)
        }
    }

    constructor (element: Element) {
        let elementData = elementDataMap.get(element)

        if (!elementData) {
            elementData = {
                element,
                pointers: new Map,
                handleEvent: PointerInput.#listener
            }

            element.addEventListener('pointerenter', elementData, true)
            element.addEventListener('pointerover', elementData, true)
            element.addEventListener('pointermove', elementData, true)
            element.addEventListener('pointerdown', elementData, true)
            element.addEventListener('pointerup', elementData, true)
            element.addEventListener('pointerout', elementData, true)
            element.addEventListener('pointerleave', elementData, true)
            element.addEventListener('click', elementData, true)
            element.addEventListener('auxclick', elementData, true)
        }

        this.#data = elementData
    }

    getPointers <T extends number[]>(...pointerIds: T): T['length'] extends 1 ? Pointer : Pointer[] {
        if (this.#data?.handleEvent !== PointerInput.#listener)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerInput instance`)

        let pointer: Pointer

        if (pointerIds.length === 1) {
            pointer = this.#data.pointers.get(Number(pointerIds[0]))

            if (pointer)
                pointer = { ...pointer }
            else
                pointer = null

            return pointer
        }

        const pointers: Pointer[] = []

        for (let i = 0; i < pointerIds.length; i++) {
            pointer = this.#data.pointers.get(Number(pointerIds[i]))

            if (pointer)
                pointer = { ...pointer }
            else
                pointer = null

            pointers.push(pointer)
        }

        return pointers as any
    }

    getPointerMap () {
        if (this.#data?.handleEvent !== PointerInput.#listener)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerInput instance`)

        const pointers: Map<number, Pointer> = new Map
        for (const [id, pointer] of this.#data.pointers) {
            pointers.set(id, { ...pointer })
        }

        return pointers
    }
}

export default PointerInput