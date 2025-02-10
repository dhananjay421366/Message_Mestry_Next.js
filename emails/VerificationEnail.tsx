import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
} from "@react-email/components";

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Verification Code</title>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Here&apos;s your Verification code: {otp}</Preview>
            <Section style={styles.container}>
                <Row style={styles.row}>
                    <Heading as="h2" style={styles.heading}>
                        Hello {username},
                    </Heading>
                </Row>
                <Row style={styles.row}>
                    <Text style={styles.text}>
                        Thank you for registering. Please use the following verification code to complete your registration:
                    </Text>
                </Row>
                <Row style={styles.otpRow}>
                    <Text style={styles.otp}>{otp}</Text>
                </Row>
                <Row style={styles.row}>
                    <Text style={styles.footerText}>
                        If you did not request this code, please ignore this email.
                    </Text>
                </Row>
            </Section>
        </Html>
    );
}

// Inline styles for better readability and maintainability
const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#f9f9f9",
        fontFamily: "'Roboto', 'Verdana', sans-serif",
    },
    row: {
        marginBottom: "16px",
    },
    heading: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
        margin: "0",
    },
    text: {
        fontSize: "16px",
        color: "#555",
        lineHeight: "1.5",
    },
    otpRow: {
        marginTop: "12px",
        marginBottom: "24px",
    },
    otp: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#4CAF50",
    },
    footerText: {
        fontSize: "14px",
        color: "#888",
    },
};
