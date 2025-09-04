import { useCallback, useState } from "react"
import {
    check,
    openSettings,
    Permission,
    PERMISSIONS,
    request,
    requestMultiple,
    RESULTS
} from "react-native-permissions"

type PermissionStatus = "unavailable" | "denied" | "blocked" | "granted" | "limited"

interface UsePermissionsReturn {
    PERMISSIONS: typeof PERMISSIONS
    statuses: Record<string, PermissionStatus>
    checkPermission: (permission: Permission) => Promise<PermissionStatus>
    requestPermission: (permission: Permission) => Promise<PermissionStatus>
    requestPermissions: (permissions: Permission[]) => Promise<Record<string, PermissionStatus>>
    ensurePermissions: (permissions: Permission[]) => Promise<boolean>
    openAppSettings: () => Promise<void>
    resetStatuses: () => void
}

const usePermissions = (): UsePermissionsReturn => {

    const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>({})

    const checkPermission = useCallback(async (permission: Permission) => {
        const result = await check(permission)
        setStatuses((prev) => ({ ...prev, [permission]: result }))
        return result
    }, [])

    const requestPermission = useCallback(async (permission: Permission) => {
        const result = await request(permission)
        setStatuses((prev) => ({ ...prev, [permission]: result }))
        return result
    }, [])

    const requestPermissions = useCallback(async (permissions: Permission[]) => {
        const results = await requestMultiple(permissions)
        setStatuses((prev) => ({ ...prev, ...results }))
        return results
    }, [])

    const ensurePermissions = useCallback(async (permissions: Permission[]) => {
        const results = await requestMultiple(permissions)
        setStatuses((prev) => ({ ...prev, ...results }))
        return Object.values(results).every((status) => status === RESULTS.GRANTED)
    }, [])

    const openAppSettings = useCallback(async () => {
        await openSettings()
    }, [])

    const resetStatuses = useCallback(() => {
        setStatuses({})
    }, [])

    return {
        PERMISSIONS,
        statuses,
        checkPermission,
        requestPermission,
        requestPermissions,
        ensurePermissions,
        openAppSettings,
        resetStatuses,
    }
}

export default usePermissions
