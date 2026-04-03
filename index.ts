import DereferenceRegistry from "@dandre3000/dereference-registry"

export type PointerEventTypes =
    'pointerenter' |
    'pointerover' |
    'pointermove' |
    'pointerdown' |
    'pointerup' |
    'pointerout' |
    'pointerleave' |
    'click' |
    'auxclick'

export type MouseEventTypes =
    'dblclick' |
    'wheel'

type PromiseExecutor = ConstructorParameters<typeof Promise<PointerEvent | MouseEvent>>[0]
type Resolve = Parameters<PromiseExecutor>[0]
type Reject = Parameters<PromiseExecutor>[1]

export interface Pointer {
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

interface PointerObserverData extends EventListenerObject {
    symbol: symbol
    eventTargetRef: WeakRef<EventTarget>
    pointers: Map<number, Pointer>
    pointerenter: Set<Resolve>
    pointerover: Set<Resolve>
    pointermove: Set<Resolve>
    pointerdown: Set<Resolve>
    pointerup: Set<Resolve>
    pointerout: Set<Resolve>
    pointerleave: Set<Resolve>
    click: Set<Resolve>
    auxclick: Set<Resolve>
    dblclick: Set<Resolve>
    wheel: Set<Resolve>
    rejectSet: Set<Reject>
    resolveToRejectMap: Map<Resolve, Reject>
}

const PointerObserverSymbol = Symbol()

const pointerEventNameList = {
    pointerenter: true,
    pointerover: true,
    pointermove: true,
    pointerdown: true,
    pointerup: true,
    pointerout: true,
    pointerleave: true,
    click: true,
    auxclick: true,
    dblclick: true,
    wheel: true
}

const pointerEventListener = function (this: PointerObserverData, event: PointerEvent) {
    if (event instanceof PointerEvent) {
        const {
            type,
            pointerId,
            buttons,
            screenX,
            screenY,
            clientX,
            clientY,
            pageX,
            pageY,
            offsetX,
            offsetY
        } = event

        if (type === 'pointerenter' || type === 'pointerover') {
            this.pointers.set(pointerId, {
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
        } else if (type === 'pointerleave' || type === 'pointerout') {
            this.pointers.delete(pointerId)
        } else {
            const pointer = this.pointers.get(pointerId)

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

    for (const resolve of this[event.type]) {
        resolve(event)

        this.rejectSet.delete(this.resolveToRejectMap.get(resolve))
        this.resolveToRejectMap.delete(resolve)
    }

    this[event.type].clear()
}

const PointerObserverCleanup = (data: PointerObserverData) => {
    data.eventTargetRef.deref()?.removeEventListener('pointerenter', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointerover', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointermove', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointerdown', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointerup', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointerout', data, true)
    data.eventTargetRef.deref()?.removeEventListener('pointerleave', data, true)
    data.eventTargetRef.deref()?.removeEventListener('click', data, true)
    data.eventTargetRef.deref()?.removeEventListener('auxclick', data, true)
    data.eventTargetRef.deref()?.removeEventListener('dblclick', data, true)
    data.eventTargetRef.deref()?.removeEventListener('wheel', data, true)

    for (const reject of data.rejectSet) {
        reject('PointerObserver instance has been garbage collected')
    }

    data.pointerenter.clear()
    data.pointerover.clear()
    data.pointermove.clear()
    data.pointerdown.clear()
    data.pointerup.clear()
    data.pointerout.clear()
    data.pointerleave.clear()
    data.click.clear()
    data.dblclick.clear()
    data.wheel.clear()
    data.rejectSet.clear()
}

let currentEventType: PointerEventTypes | MouseEventTypes
let currentPointerObserver: PointerObserver
let currentPointerObserverData: PointerObserverData

const eventPromiseExecutor: PromiseExecutor = (resolve, reject) => {
    if (currentPointerObserverData?.symbol !== PointerObserverSymbol)
        throw new TypeError(`this (${Object.prototype.toString.call(currentPointerObserver)}) is not a PointerObserver instance`)

    currentEventType = String(currentEventType) as PointerEventTypes
    if (!pointerEventNameList[currentEventType])
        throw new TypeError(`type (${currentEventType}) argument is not a equal to "keydown", "keypress" or "keyup"`)

    currentPointerObserverData[currentEventType].add(resolve)
    currentPointerObserverData.rejectSet.add(reject)
    currentPointerObserverData.resolveToRejectMap.set(resolve, reject)
}

const PointerObserverRegistry = new DereferenceRegistry(PointerObserverCleanup, 1000)

export class PointerObserver {
    #data: PointerObserverData

    constructor (eventTarget: EventTarget) {
        this.#data = {
            symbol: PointerObserverSymbol,
            eventTargetRef: new WeakRef(eventTarget),
            pointers: new Map,
            pointerenter: new Set,
            pointerover: new Set,
            pointermove: new Set,
            pointerdown: new Set,
            pointerup: new Set,
            pointerout: new Set,
            pointerleave: new Set,
            click: new Set,
            auxclick: new Set,
            dblclick: new Set,
            wheel: new Set,
            rejectSet: new Set,
            resolveToRejectMap: new Map,
            handleEvent: pointerEventListener
        }

        eventTarget.addEventListener('pointerenter', this.#data, true)
        eventTarget.addEventListener('pointerover', this.#data, true)
        eventTarget.addEventListener('pointermove', this.#data, true)
        eventTarget.addEventListener('pointerdown', this.#data, true)
        eventTarget.addEventListener('pointerup', this.#data, true)
        eventTarget.addEventListener('pointerout', this.#data, true)
        eventTarget.addEventListener('pointerleave', this.#data, true)
        eventTarget.addEventListener('click', this.#data, true)
        eventTarget.addEventListener('auxclick', this.#data, true)
        eventTarget.addEventListener('dblclick', this.#data, true)
        eventTarget.addEventListener('wheel', this.#data, true)

        PointerObserverRegistry.register(this, this.#data, this)
        PointerObserverRegistry.start()
    }

    getPointers <T extends number[]>(...pointerIds: T): T['length'] extends 1 ? Pointer : Pointer[] {
        if (this.#data?.symbol !== PointerObserverSymbol)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerObserver instance`)

        if (pointerIds.length === 1) return this.#data.pointers.get(Number(pointerIds[0])) as any

        const pointers: Pointer[] = []

        for (let i = 0; i < pointerIds.length; i++) {
            pointers.push(this.#data.pointers.get(Number(pointerIds[i])))
        }

        return pointers as any
    }

    getAllPointers () {
        if (this.#data?.symbol !== PointerObserverSymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a PointerObserver instance`)

        const pointers: Map<number, Pointer> = new Map
        for (const [id, pointer] of this.#data.pointers) {
            pointers.set(id, { ...pointer })
        }

        return pointers
    }

    getNextEvent <T extends PointerEventTypes | MouseEventTypes>(type: T): T extends PointerEventTypes ? Promise<PointerEvent> : Promise<MouseEvent> {
        currentEventType = type
        currentPointerObserver = this
        currentPointerObserverData = this.#data
        const promise = new Promise(eventPromiseExecutor)
        currentEventType = undefined
        currentPointerObserver = undefined
        currentPointerObserverData = undefined

        return promise as any
    }
}

export default PointerObserver