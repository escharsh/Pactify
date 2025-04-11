import { FreelancerContract } from "./FreelancerContract";
import { JobContract } from "./JobContract";
import { OfferLetter } from "./OfferLetter";
import { RentalContract } from "./RentalContract";

export default function Product() {
    return (
        <div className="h-screen flex flex-1 flex-col items-center justify-center py-8">
            <h1 className="text-lg md:text-7xl mb-4  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold mb-8 text-center">Our Featured Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-x-8  py-10">
                <OfferLetter  />
                <JobContract />
                <RentalContract />
                <FreelancerContract />
            </div>
        </div>
    )
}
