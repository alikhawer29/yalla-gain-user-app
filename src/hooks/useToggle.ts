import { useCallback, useState } from "react"

const useToggle = (initial: boolean = false): [() => void, boolean] => {

    const [open, setOpen] = useState(initial || false)

    const toggle = useCallback(() => {
        setOpen(!open)
    }, [open])

    return [toggle, open]

}

export default useToggle