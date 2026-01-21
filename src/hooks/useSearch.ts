import { useState, useEffect, useCallback } from "react"

const useSearch = (initialValue: string = "", delay: number = 1000) => {

    const [search, setSearch] = useState(initialValue)
    const [debouncedSearch, setDebouncedSearch] = useState(initialValue)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [search, delay])

    const onChange = useCallback((text: string) => {
        setSearch(text)
    }, [])

    return {
        search,
        debouncedSearch,
        onChange
    }

}

export default useSearch