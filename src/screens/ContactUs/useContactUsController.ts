import { useState, useCallback, useEffect } from "react";
import { useContactUsMutation } from "../../redux/Apis/User";
import { Alert } from "react-native";
import { goBack } from "../../utils/navigation";
import { useAppSelector } from "../../hooks";
import { selectUser } from "../../redux/Slices/AuthSlice";

const buildFullName = (user: { first_name?: string; last_name?: string } | null) =>
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

const useContactUsController = () => {
    const user = useAppSelector(selectUser);
    const [name, setName] = useState(() => buildFullName(user));
    const [email, setEmail] = useState(() => user?.email ?? "");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [subjectError, setSubjectError] = useState<string | undefined>(undefined);
    const [messageError, setMessageError] = useState<string | undefined>(undefined);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [contactUs, { isLoading }] = useContactUsMutation();

    useEffect(() => {
        if (!user) return;
        const fullName = buildFullName(user);
        setName(prev => prev || fullName);
        setEmail(prev => prev || user.email || "");
    }, [user]);

    const onSubmit = useCallback(async () => {
        // Reset previous errors
        let hasError = false;

        if (!name.trim()) {
            setNameError("Full Name is required");
            hasError = true;
        } else {
            setNameError(undefined);
        }

        if (!email.trim()) {
            setEmailError("Email Address is required");
            hasError = true;
        } else {
            setEmailError(undefined);
        }

        if (!subject.trim()) {
            setSubjectError("Subject is required");
            hasError = true;
        } else {
            setSubjectError(undefined);
        }

        if (!message.trim()) {
            setMessageError("Message is required");
            hasError = true;
        } else {
            setMessageError(undefined);
        }

        if (hasError) {
            // Don't show a global alert; field errors are visible under each input
            return;
        }

        const payload = {
            name,
            email,
            subject,
            message,
        };

        try {
            const response = await contactUs(payload).unwrap();
            if (response) {
                setShowSuccessModal(true);
            }
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Something went wrong");
        }
    }, [name, email, subject, message, contactUs]);

    const onCloseModal = useCallback(() => {
        setShowSuccessModal(false);
        goBack();
    }, []);

    return {
        values: {
            name,
            email,
            subject,
            message,
            isLoading,
            showSuccessModal,
            nameError,
            emailError,
            subjectError,
            messageError,
        },
        functions: {
            setName: (text: string) => {
                setName(text);
                if (text.trim()) setNameError(undefined);
            },
            setEmail: (text: string) => {
                setEmail(text);
                if (text.trim()) setEmailError(undefined);
            },
            setSubject: (text: string) => {
                setSubject(text);
                if (text.trim()) setSubjectError(undefined);
            },
            setMessage: (text: string) => {
                setMessage(text);
                if (text.trim()) setMessageError(undefined);
            },
            onSubmit,
            onCloseModal
        }
    };
};

export default useContactUsController;
