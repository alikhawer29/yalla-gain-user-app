import Button from "../../components/Button"
import Input from "../../components/Input"
import Wrapper from "../../components/Wrapper"
import styles from "./styles"

const ChangePassword = () => {
    return (
        <Wrapper>
            <Input label="Current Password" required placeholder="Enter Current Password" />
            <Input label="New Password" required placeholder="Enter New Password" />
            <Input label="Confirm Password" required placeholder="Confirm Password" />
            <Button text="Update" style={styles.button} />
        </Wrapper>
    )
}

export default ChangePassword