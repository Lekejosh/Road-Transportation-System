interface DriverRegisterInput {
    car_image_front: string;
    car_image_back: string;
    car_image_side: string;
    plate_number: string;
    licence_image_front: string;
    licence_image_back: string;
    licence_number: string;
}

interface reviewDriverInput {
    rating: number;
    comment: string;
}
