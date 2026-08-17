import { useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import { Platform } from "react-native"
import usePermissions from "../../hooks/usePermissions"
import { useStopExerciseMutation } from "../../redux/Apis/MovementCorrection"
import { capitalize } from "../../utils/helper"
import { goBack } from "../../utils/navigation"

const useMovementCorrectionCameraController = () => {

    const { params } = useRoute<any>()
    const wsRef = useRef<WebSocket | null>(null)

    const [stop, { isLoading: isStopLoading, isSuccess: isStopSuccess }] = useStopExerciseMutation()

    const [granted, setGranted] = useState(false)
    const [checking, setChecking] = useState(true)
    const [feedback, setFeedback] = useState<string>("")
    const [reps, setReps] = useState<number>(0)
    const [formOk, setFormOk] = useState<boolean | null>(null)

    const { ensurePermissions, PERMISSIONS } = usePermissions()

    useEffect(() => {
        if (isStopSuccess) {
            if (wsRef?.current && wsRef?.current?.readyState === WebSocket.OPEN) {
                wsRef?.current?.close()
            }
            goBack()
        }
    }, [isStopSuccess])

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
                console.log("Socket Data", JSON.parse(event.data))
                const data = JSON.parse(event.data)
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

    const onLandmark = (data: any) => {

        if (wsRef?.current && wsRef?.current?.readyState === WebSocket.OPEN) {

            let landmarks = JSON.parse(data)?.landmarks

            if (landmarks?.length === 0 || landmarks?.length === undefined) {
                setFeedback("No person detected")
                setFormOk(false)
                wsRef?.current?.send(JSON.stringify({ type: "no_person" }))
            } else if (landmarks?.length !== 33) {
                console.log("Not sending, incomplete landmarks", landmarks?.length)
                return;
            } else {
                wsRef?.current?.send(JSON.stringify({
                    type: "keypoints",
                    keypoints: landmarks?.map(landmark => [
                        landmark.x,
                        landmark.y,
                        landmark.z || 0,
                        landmark.visibility || 1.0
                    ])
                }))
            }
        }
    }

    const onEnd = () => {
        stop({ session_id: params?.session_id })
    }

    return {
        values: {
            feedback,
            reps,
            formOk,
            permission_granted: granted,
            checking,
            isStopLoading,
            exercise: capitalize(params?.exercise) || "-",
            exerciseKey: params?.exercise || "",
            session_id: params?.session_id || "-",
            mode: params?.mode || null,
            selected_side: params?.selected_side || null,
        },
        functions: {
            onLandmark,
            onEnd
        },
    }
}
export default useMovementCorrectionCameraController
