interface TransportCreateInput {
    driverId: string;
    origin: string;
    destination: string;
    availableSeats: number;
    type: "luxury" | "business" | "regular";
    departureDate: string;
}
interface SearchInput {
    origin: string;
    destination: string;
    date: string;
    type: string;
}
