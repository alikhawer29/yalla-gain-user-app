import React from "react";
import { View } from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Text from "../../components/Text";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import ContactSuccessModal from "../../components/ContactSuccessModal";
import useContactUsController from "./useContactUsController";
import styles from "./styles";

const ContactUs = () => {
    const {
        values: {
            name,
            email,
            subject,
            message,
            nameError,
            emailError,
            subjectError,
            messageError,
            isLoading,
            showSuccessModal
        },
        functions: {
            setName,
            setEmail,
            setSubject,
            setMessage,
            onSubmit,
            onCloseModal
        }
    } = useContactUsController();

    return (
        <Wrapper scrollable>
            <View style={styles.container}>
                <Text color={colors.white} style={styles.subtitle}>
                    Please Let Us Know How We Can{"\n"}Improve Your Experience
                </Text>

                <View style={styles.inputContainer}>
                    <Input
                        label="Full Name"
                        placeholder="Enter Full Name"
                        value={name}
                        onChangeText={setName}
                        required
                        error={nameError}
                        maxLength={30}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Input
                        label="Email Address"
                        placeholder="Enter Your Email Address"
                        type="email"
                        value={email}
                        onChangeText={setEmail}
                        required
                        error={emailError}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Input
                        label="Subject"
                        placeholder="Enter Subject"
                        value={subject}
                        onChangeText={setSubject}
                        required
                        error={subjectError}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Input
                        label="Message"
                        placeholder="Write Here"
                        type="textarea"
                        value={message}
                        onChangeText={setMessage}
                        required
                        height={120}
                        error={messageError}
                    />
                </View>

                <Button
                    text="Submit"
                    onPress={onSubmit}
                    loading={isLoading}
                    style={styles.submitButton}
                />

                <ContactSuccessModal
                    visible={showSuccessModal}
                    onClose={onCloseModal}
                />
            </View>
        </Wrapper>
    );
};

export default ContactUs;