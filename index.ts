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
    movementX: number
    movementY: number
}

interface ElementData extends EventListenerObject {
    instanceCount: number
    movingTimeoutId: number
    element: Element
    pointers: Map<number, Pointer>
    movingPointers: Map<Pointer, number>
    updateMovingPointers: () => void
}

const elementDataMap: WeakMap<Element, ElementData> = new WeakMap
const eventSet: WeakSet<Event> = new WeakSet

const registry = new FinalizationRegistry((elementData: ElementData) => {
    const { element, movingTimeoutId, movingPointers, pointers } = elementData

    if (--elementData.instanceCount <= 0) {
        element.removeEventListener('pointerenter', elementData, true)
        element.removeEventListener('pointerover', elementData, true)
        element.removeEventListener('pointermove', elementData, true)
        element.removeEventListener('pointerdown', elementData, true)
        element.removeEventListener('pointerup', elementData, true)
        element.removeEventListener('pointerout', elementData, true)
        element.removeEventListener('pointerleave', elementData, true)
        element.removeEventListener('click', elementData, true)
        element.removeEventListener('auxclick', elementData, true)

        elementData.element = undefined as any
        elementData.updateMovingPointers = undefined as any
        elementData.handleEvent = undefined as any

        pointers.clear()
        movingPointers.clear()
        cancelAnimationFrame(movingTimeoutId)
    }
})

export class PointerInput {
    static #listener (this: ElementData, event: PointerEvent) {
        eventSet.add(event) // skip if patched event.stopImmediatePropagation is called after this listener

        const { element, pointers } = this
        const { type, pointerId } = event

        if (type === 'pointerleave' || type === 'pointerout') {
            return pointers.delete(pointerId)
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
            pageY,
            movementX,
            movementY
        } = event

        let {
            offsetX,
            offsetY
        } = event

        const pointer = pointers.get(pointerId) as Pointer

        // event target element may be nested
        if (target !== element) {
            const { left, top } = (target as Element).getBoundingClientRect()

            offsetX = clientX - left
            offsetY = clientY - top
        }

        if (!pointer) {
            pointers.set(pointerId, {
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
                offsetX,
                offsetY,
                movementX,
                movementY
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
            pointer.movementX = movementX
            pointer.movementY = movementY
        }

        if (type === 'pointermove') {
            this.movingPointers.set(pointer, 0)

            if (!this.movingTimeoutId)
                this.movingTimeoutId = requestAnimationFrame(this.updateMovingPointers)
        }
    }

    static patchEventStopImmediatePropagation () {
        const stopImmediatePropagation = Event.prototype.stopImmediatePropagation

        return function (this: Event) {
            stopImmediatePropagation.call(this)

            if (!eventSet.has(this) && this instanceof PointerEvent) PointerInput.#listener.call(elementDataMap.get(this.currentTarget as Element) as ElementData, this)
        }
    }

    #data: ElementData

    constructor (element: Element) {
        if (!(element instanceof Element))
            throw new TypeError(`Argument element (${Object.prototype.toString.call(element)}) is not an Element instance.`)

        let elementData = elementDataMap.get(element) as ElementData

        if (!elementData) {
            elementDataMap.set(element, elementData = {
                instanceCount: 0,
                movingTimeoutId: NaN,
                element,
                pointers: new Map,
                movingPointers: new Map,
                updateMovingPointers: () => {
                    for (const [pointer, count] of elementData.movingPointers) {
                        if (count === 0)
                            elementData.movingPointers.set(pointer, 1)
                        else {
                            elementData.movingPointers.delete(pointer)
                            pointer.movementX = 0
                            pointer.movementY = 0
                        }
                    }

                    if (elementData.movingPointers.size > 0)
                        elementData.movingTimeoutId = requestAnimationFrame(elementData.updateMovingPointers)
                    else
                        elementData.movingTimeoutId = NaN
                },
                handleEvent: PointerInput.#listener
            })

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

        elementData.instanceCount++
        this.#data = elementData
        registry.register(this, elementData)
    }

    getPointers <T extends number[]>(...pointerIds: T): T['length'] extends 1 ? (Pointer | null ): (Pointer | null)[] {
        const { handleEvent, pointers } = this.#data

        if (handleEvent !== PointerInput.#listener)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerInput instance`)

        let pointer: Pointer | null

        if (pointerIds.length === 1) {
            pointer = pointers.get(Number(pointerIds[0])) as Pointer

            if (pointer)
                pointer = { ...pointer }
            else
                pointer = null

            return pointer as any
        }

        const pointerArray: (Pointer | null)[] = []

        for (let i = 0; i < pointerIds.length; i++) {
            pointer = pointers.get(Number(pointerIds[i])) as Pointer

            if (pointer)
                pointer = { ...pointer }
            else
                pointer = null

            pointerArray.push(pointer)
        }

        return pointerArray as any
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