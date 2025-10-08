import { useCallback, useEffect, useRef } from "react"
import { useModal } from "../../contexts/ModalContext"
import { useAppSelector } from "../../hooks"
import { useUpdateProfileMutation } from "../../redux/Apis/User"
import { selectUser } from "../../redux/Slices/AuthSlice"
import { formHandler } from "../../utils/helper"
import { goBack } from "../../utils/navigation"
import { EDIT_PROFILE_SCHEMA } from "../../utils/validators"
import usePicker from "../../hooks/usePicker"

const useEditProfileController = () => {

    const user = useAppSelector(selectUser)
    const formik_ref = useRef(null)
    const { showOkModal } = useModal()
    const { image, openGallery } = usePicker()

    const [submit, { isLoading, isSuccess }] = useUpdateProfileMutation()

    const initial = {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        dialing_code: user?.dialing_code || "+971",
        country_code: user?.country_code || "AE",
        phone: user?.phone || "",
        dob: user?.dob || "",
    }

    useEffect(() => {
        if (isSuccess) {
            showOkModal({
                type: "success",
                title: "Success",
                message: "Profile has been updated successfully."
            }, () => goBack(), () => goBack())
        }
    }, [isSuccess])

    const onSubmit = useCallback((data: any) => {

        let payload = { ...data }

        if (image) {
            payload.photo = image
        }

        payload = formHandler(payload)

        submit(payload)

    }, [image])

    const onPressUpload = useCallback(() => {
        openGallery()
    }, [])

    return {
        schema: EDIT_PROFILE_SCHEMA,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            user_image: user?.photo,
            image
        },
        functions: {
            onSubmit,
            onPressUpload
        }
    }
}

export default useEditProfileController