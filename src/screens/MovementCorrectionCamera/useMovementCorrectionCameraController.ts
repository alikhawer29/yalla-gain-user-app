import { useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import { Platform } from "react-native"
import RNFS from "react-native-fs"
import { Camera, useCameraDevice } from "react-native-vision-camera"
import usePermissions from "../../hooks/usePermissions"

const API_BASE_URL = "https://yalla-ai.onlinetestingserver.com"

const useMovementCorrectionCameraController = () => {

    const { params } = useRoute<any>()
    const cameraRef = useRef<Camera>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const device = useCameraDevice("front")

    const [granted, setGranted] = useState(false)
    const [checking, setChecking] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [feedback, setFeedback] = useState<string>("")
    const [reps, setReps] = useState<number>(0)
    const [formOk, setFormOk] = useState<boolean | null>(null)

    const { ensurePermissions, PERMISSIONS } = usePermissions()

    useEffect(() => {

        const ask = async () => {

            const required = Platform.select({
                ios: [PERMISSIONS.IOS.CAMERA],
                android: [PERMISSIONS.ANDROID.CAMERA],
            }) || []

            const has_access = await ensurePermissions(required)
            setChecking(false)
            setGranted(has_access)

        }

        setTimeout(() => {
            ask()
        }, 500)

    }, [])

    useEffect(() => {

        if (!params?.session_id || !granted) return

        const ws = new WebSocket(
            `wss://yalla-ai.onlinetestingserver.com/v1/exercise/ws?session_id=${params.session_id}`
        )
        wsRef.current = ws

        ws.onopen = () => console.log("WebSocket connected")

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                console.log("WebSocket connected", data)
                if (data.reps !== undefined) setReps(data.reps)
                if (data.form_ok !== undefined) setFormOk(data.form_ok)
                if (data.feedback) setFeedback(data.feedback)
            } catch (e) {
                console.error("WS parse error:", e)
            }
        }

        ws.onerror = (err) => console.error("WebSocket error:", err)
        ws.onclose = () => console.log("WebSocket closed")

        return () => {
            ws.close()
        }
    }, [params?.session_id, granted])

    useEffect(() => {

        let interval: NodeJS.Timeout | null = null

        if (params?.session_id) {
            interval = setInterval(captureAndSendFrame, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }

    }, [params, granted])

    const captureAndSendFrame = async () => {
        if (isProcessing || !cameraRef.current) return
        setIsProcessing(true)

        try {
            const photo = await cameraRef.current.takePhoto({ flash: "off" });

            const base64 = await RNFS.readFile(photo.path, "base64");

            const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

            const arrayBuffer = binary.buffer;

            let res = await fetch(`${API_BASE_URL}/v1/exercise/upload_frame?session_id=${params?.session_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "image/jpeg",
                },
                body: arrayBuffer,
            });

            console.log("Upload success", await res.text(), params?.session_id);

        } catch (err) {
            console.error("Upload failed:", err)
        } finally {
            setIsProcessing(false)
        }
    }

    return {
        refs: {
            cameraRef
        },
        values: {
            feedback,
            reps,
            formOk,
            device,
            permission_granted: granted,
            checking
        },
        functions: {
            captureAndSendFrame
        },
    }
}

export default useMovementCorrectionCameraController