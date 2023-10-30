interface DriverRegisterInput {
    car_image_front: string;
    car_image_back: string;
    car_image_side: string;
    plate_number: string;
    licence_image_front: string;
    licence_image_back: string;
    licence_number: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface GenerateTokenInput {
    userId: string;
    role: string;
}

interface RefreshTokenInput {
    refreshToken: string;
}

interface LogoutInput {
    refreshToken: string;
}

interface VerifyEmailInput {
    userId: string;
    verifyToken: string;
}

interface ResetPasswordInput {
    userId: string;
    resetToken: string;
    password: string;
    confirmPassword: string;
}

interface UpdatePasswordInput {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface AuthToken {
    accessToken: string;
    refreshToken: string;
}

interface PasswordValidator {
    password: string;
}

interface generateToken {
    userId: string;
    type: string;
}
