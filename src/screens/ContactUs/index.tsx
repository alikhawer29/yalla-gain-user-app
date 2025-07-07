import Button from "../../components/Button"
import Input from "../../components/Input"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import styles from "./styles"

const ContactUs = () => {
    return (
        <Wrapper>
            <Text position="center" size={16} weight="semibold" style={styles.text}>Please Let Us Know How We Can Improve Your Experience</Text>
            <Input label="Full Name" required placeholder="Enter Full Name" />
            <Input label="Email Address" required placeholder="Enter Email Address" type="email" />
            <Input label="Subject" required placeholder="Enter Subject" />
            <Input label="Message" required placeholder="Message" type="textarea" />
            <Button text="Submit" style={styles.button} />
        </Wrapper>
    )
}

export default ContactUs